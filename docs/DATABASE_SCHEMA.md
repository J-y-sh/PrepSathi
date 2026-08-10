# PrepSathi — Database Schema

## 1. Purpose

This document serves as the source of truth for the current Firestore data model of PrepSathi. It is based strictly on the existing TypeScript type definitions and service layer architecture.

## 2. General Data Rules

- **User Ownership**: All user-generated content is strictly owned by the authenticated Firebase user.
- **userId Usage**: Every user-scoped document must include a `userId` field (or `uid` for the user profile) matching the authenticated user's ID.
- **Document IDs**:
    - **Random**: Most collections use `crypto.randomUUID()` for unique IDs (e.g., `tasks`, `studySessions`, `sprints`).
    - **Compound/Deterministic**: Some collections use deterministic IDs to prevent duplicates and enable direct access without a search query (e.g., `analytics`: `{userId}_{date}`, `videoProgress`: `{userId}_{resourceId}_{videoId}`).
    - **UID**: The `users` collection uses the Firebase Auth `uid` as the document ID.
- **Timestamps**:
    - Use Firestore `serverTimestamp()` (writes as `FieldValue`) for `createdAt`, `updatedAt`, `lastLogin`, etc.
    - Read values are typically handled as `Timestamp` objects in the client.
- **Service Layer**: All database interactions must go through the dedicated services in `services/firestore/`, which extend `BaseService`.
- **Atomic Operations**: Numeric statistics (XP, study hours) are updated using Firestore `increment()` to ensure consistency.

## 3. Collections Overview

| Collection Name | Related TypeScript Type | Purpose | User-scoped? |
| :--- | :--- | :--- | :--- |
| `users` | `User` | User profiles, preferences, and cumulative stats | Yes (by UID) |
| `tasks` | `Task` | User study tasks and daily goals | Yes |
| `sprints` | `Sprint` | Recorded timed focus sessions | Yes |
| `library` | `LibraryResource` | Curated study materials (PDF, YouTube, Links) | Yes |
| `analytics` | `Analytics` | Daily aggregated study metrics (Upserted) | Yes |
| `flashcards` | `Flashcard` | Spaced repetition study cards | Yes |
| `studySessions` | `StudySession` | Detailed tracking logs for specific resource usage | Yes |
| `answers` | `Answer` | Daily answer writing submissions and feedback | Yes |
| `videoProgress` | `VideoProgress` | Per-video playback position and completion state | Yes |

## 4. Detailed Collection Schemas

### users
*Document ID: {uid}*
*Managed by: `userService.ts`*

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `uid` | string | Yes | Firebase Auth UID |
| `name` | string \| null | Yes | Display name from Auth |
| `email` | string \| null | Yes | Email from Auth |
| `photoURL` | string \| null | Yes | Profile picture URL |
| `targetExam` | string | Yes | Default: "UPSC CSE 2028" |
| `createdAt` | FieldValue | Yes | Initial sync timestamp |
| `lastLogin` | FieldValue | Yes | Updated on every Auth state change |
| `streak` | number | Yes | Consecutive days active |
| `xp` | number | Yes | Total experience points (incremented by Sprints) |
| `todayStudyHours` | number | Yes | Cumulative hours for current day |
| `theme` | "light" \| "dark" | Yes | UI preference |

### tasks
*Document ID: Random UUID*
*Managed by: `taskService.ts`*

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | Yes | Unique identifier |
| `userId` | string | Yes | Owner's UID |
| `title` | string | Yes | Task summary |
| `description` | string | No | Optional details |
| `subject` | string | Yes | Associated GS subject |
| `priority` | "low" \| "medium" \| "high" | Yes | Task priority level |
| `completed` | boolean | Yes | |
| `dueDate` | Timestamp | No | Optional deadline |
| `createdAt` | Timestamp | Yes | |
| `completedAt` | Timestamp | No | Set when `completed` becomes true |
| `color` | string | No | UI styling color |
| `estimatedMinutes` | number | No | |

### sprints
*Document ID: Random UUID*
*Managed by: `sprintService.ts`*

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | Yes | Unique identifier |
| `userId` | string | Yes | Owner's UID |
| `subject` | string | Yes | Focus area |
| `topic` | string | Yes | Specific topic |
| `durationMinutes` | number | Yes | |
| `xpAwarded` | number | Yes | |
| `status` | "completed" \| "abandoned" | Yes | |
| `completedAt` | FieldValue | Yes | |

*Note: Completing a sprint triggers an atomic increment of the User's `xp` and `todayStudyHours`.*

### library
*Document ID: Random UUID*
*Managed by: `libraryService.ts`*

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | Yes | Unique identifier |
| `userId` | string | Yes | Owner's UID |
| `title` | string | Yes | |
| `description` | string | No | |
| `category` | string | Yes | GS Subject / Category |
| `type` | "pdf" \| "youtube" \| "link" | Yes | |
| `url` | string | Yes | |
| `isFavorite` | boolean | Yes | |
| `lastOpenedAt` | FieldValue | No | Updated on resource access |
| `createdAt` | FieldValue | Yes | |

### analytics
*Document ID: {userId}_{date}*
*Managed by: `analyticsService.ts`*

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | Yes | `{userId}_{date}` |
| `userId` | string | Yes | |
| `date` | string | Yes | ISO format `YYYY-MM-DD` |
| `studyMinutes` | number | Yes | Daily study minutes recorded/incremented through `analyticsService.recordStudySession()`. |
| `tasksCompleted` | number | Yes | Reserved for daily completed-task aggregation; currently initialized/preserved by `analyticsService.recordStudySession()`. |
| `xpGained` | number | Yes | Reserved for daily XP aggregation; currently initialized/preserved by `analyticsService.recordStudySession()`. |
| `createdAt` | FieldValue | Yes | Initial creation timestamp |

*Note: Uses the Upsert pattern with `setDoc(..., { merge: true })` to safely initialize or increment values.*

### studySessions
*Document ID: Random UUID*
*Managed by: `studySessionService.ts`*

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | Yes | |
| `userId` | string | Yes | |
| `resourceId` | string | Yes | Ref to LibraryResource |
| `resourceTitle` | string | Yes | Cached for display |
| `resourceType` | string | Yes | Cached for display |
| `resourceUrl` | string | Yes | Cached for navigation |
| `category` | string | Yes | Cached category |
| `startedAt` | Timestamp \| FieldValue | Yes | |
| `endedAt` | Timestamp \| FieldValue | No | Set on session finish |
| `durationMinutes` | number | Yes | Calculated at finish |
| `progress` | number | Yes | Percentage (0-100) |
| `completed` | boolean | Yes | |
| `createdAt` | Timestamp \| FieldValue | Yes | |

### videoProgress
*Document ID: {userId}_{resourceId}_{videoId}*
*Managed by: `videoProgressService.ts`*

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `userId` | string | Yes | |
| `resourceId` | string | Yes | Library Resource parent ID |
| `playlistId` | string \| null | Yes | YouTube Playlist ID if part of one |
| `videoId` | string | Yes | YouTube Video ID |
| `currentTime` | number | Yes | Seconds watched |
| `duration` | number | Yes | Total seconds |
| `percentage` | number | Yes | Scale: 0 to 1 (1 = 100%) |
| `completed` | boolean | Yes | true if > 90% or ended |
| `updatedAt` | FieldValue | Yes | |

*Note: Uses `setDoc(..., { merge: true })` with a deterministic ID for efficient progress persistence.*

### flashcards
*Document ID: Random UUID*
*Managed by: `flashcardService.ts`*

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | Yes | |
| `userId` | string | Yes | |
| `front` | string | Yes | |
| `back` | string | Yes | |
| `tags` | string[] | Yes | |
| `difficulty` | "easy" \| "medium" \| "hard" | Yes | |
| `nextReview` | FieldValue | Yes | Scheduled timestamp |
| `createdAt` | FieldValue | Yes | |

### answers
*Document ID: Random UUID*
*Managed by: `answerWritingService.ts`*

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | Yes | |
| `userId` | string | Yes | |
| `questionId` | string | Yes | |
| `content` | string | Yes | |
| `feedback` | string \| null | Yes | |
| `score` | number \| null | Yes | |
| `createdAt` | FieldValue | Yes | |

---

## 5. Derived Application Models

These models exist in TypeScript but are **NOT** stored as distinct Firestore collections. They are calculated dynamically by the application.

### PlaylistProgress
*Generated by: `playlistProgressService.ts`*

Derived from `videoProgress` records for a specific playlist.

- `resourceId`: Library reference.
- `playlistId`: YouTube playlist ID.
- `totalVideos`: Count of videos in the playlist.
- `completedVideos`: Count of `videoProgress` docs where `completed == true`.
- `percentage`: Calculated as `(completedVideos / totalVideos) * 100` (Scale: 0-100).
- `lastWatchedVideoId`: The `videoId` from the last progress record returned by the current playlist progress query.

---

## 6. Relationships

- **User → Multiple**: `userId` is the primary key for data isolation across all user-scoped collections.
- **Library Resource ↔ Activity**: A `library` item is the parent for `videoProgress` and `studySessions` via `resourceId`.
- **Study Sessions → Analytics**: Completed `studySessions` are used by `analyticsService.calculateFromSessions()` to calculate daily study analytics.
- **Sprints → User Stats**: Finished `sprints` atomically update `xp` and `todayStudyHours` in the `users` document.

---

## 7. Firestore Queries and Index Requirements

The following composite indexes are required based on the current service-layer query patterns:

| Collection | Required Index (Composite) | Usage |
| :--- | :--- | :--- |
| `tasks` | `userId` ASC + `createdAt` DESC | User task list sorting |
| `library` | `userId` ASC + `createdAt` DESC | Main library display |
| `library` | `userId` ASC + `lastOpenedAt` DESC | "Recently Opened" sorting |
| `analytics` | `userId` ASC + `date` DESC | Analytics history list |
| `studySessions` | `userId` ASC + `createdAt` DESC | Session history list |
| `videoProgress` | `userId` ASC + `resourceId` ASC + `videoId` ASC | Single video lookup |
| `videoProgress` | `userId` ASC + `resourceId` ASC + `playlistId` ASC | Playlist progress calculation |

---

## 8. Data Integrity Rules

- **No Hard-coding**: Never hard-code user IDs; always derive from `auth.currentUser.uid`.
- **Service Encapsulation**: Always use `services/firestore/*.ts` to perform writes.
- **Consistency**: Maintain exact field naming. Analytics and complex queries rely on stable field names across versions.
- **Atomic Stats**: Always use `increment()` for stats to prevent race conditions during multi-device usage.
- **Schema/Type Sync**: Any change to a collection schema must be reflected in the corresponding `types/*.ts` file and service methods.

---

## 9. Schema Change Guidelines

1. Inspect existing `types/` and `services/firestore/`.
2. Analyze impact on dependent Stores (Zustand) and Components.
3. Update the TypeScript interface.
4. Update the Service Layer logic.
5. Validate with `npm run build`.
6. Update this `DATABASE_SCHEMA.md` document.

---

## 10. Current Schema Status

**Version**: 1.1.0  
**Last Updated**: 2026-08-10  
**Status**: Synchronized with existing Services and Types.

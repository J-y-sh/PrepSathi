# PrepSathi - Project Constitution

## 1. Project Identity

**Project Name:** PrepSathi

**Purpose:**

PrepSathi is a mobile-first, full-stack Progressive Web App designed as a personal UPSC CSE 2028 preparation command center.

The application is intended to help a student efficiently use short study gaps between lectures and maintain a centralized system for:

- Study sessions
- Video learning
- Study resources
- Daily planning
- Progress tracking
- Analytics
- Learning insights

---

## 2. Core Product Principles

### Mobile First

The application must work exceptionally well on mobile screens while remaining responsive on tablets and desktops.

### Simple and Fast

The UI should minimize unnecessary navigation and interaction.

### Study-Focused

Every feature should ultimately support consistent UPSC preparation.

### Data-Driven

Study activity should be persisted and used to generate meaningful progress and analytics.

### Scalable Architecture

Features should be implemented using reusable components, services, stores, and typed models rather than tightly coupled page-specific logic.

### Minimal Rework

Existing architecture and working features should not be unnecessarily replaced.

---

## 3. Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React
- Framer Motion

### State Management

- Zustand

### Backend / Database

- Firebase Authentication
- Firebase Firestore

### External Services

- YouTube API
- Cloudinary
- Google Gemini API

### Application Type

- Progressive Web App (PWA)

---

## 4. UI Design System

### Primary Background

`#020617`

### Card Background

`#1E293B`

### Primary Accent

Amber / `#F59E0B`

### Success

Emerald / `#10B981`

The interface should maintain a dark, modern, productivity-oriented visual language.

---

## 5. Architecture Rules

Prefer the following separation:

```text
app/          -> Route-level pages
components/   -> Reusable UI components
features/     -> Feature-specific application logic and modes
services/     -> Firebase and external-service communication
store/        -> Zustand state management
types/        -> Shared TypeScript models
hooks/        -> Reusable React hooks
lib/          -> Utility functions
docs/         -> Project documentation
```

Business logic should not unnecessarily be placed directly inside UI components.

Firestore access should go through service layers wherever practical.

---

## 6. Data Integrity

All user-specific study data must be associated with the authenticated Firebase user.

Do not hard-code user IDs.

Do not bypass existing service/store architecture without a strong reason.

Firestore queries must be designed with appropriate indexes and constraints.

---

## 7. Development Rules

Before modifying existing architecture:

1. Inspect the existing implementation.
2. Understand the current data flow.
3. Reuse existing services and stores where possible.
4. Make the smallest coherent change.
5. Run TypeScript/build validation after meaningful milestones.
6. Fix regressions before moving to another feature.

Avoid unnecessary rewrites.

---

## 8. Git Rules

Git commits should represent meaningful, stable milestones.

Do not create commits after every tiny change.

A commit should ideally contain a coherent feature, milestone, or significant architectural improvement.

Before committing:

- Run `npm run build`
- Run `git status`
- Understand the complete working tree before creating the commit.

---

## 9. AI-Assisted Development

PrepSathi is being developed substantially with AI-assisted coding.

AI-generated changes must still respect:

- Existing architecture
- Existing naming conventions
- Existing data models
- Existing Firebase structure
- Existing UI design
- TypeScript correctness
- Backward compatibility

AI should extend the system rather than repeatedly redesigning it.

---

## 10. Definition of Done

A feature is considered complete when:

- The implementation works.
- TypeScript passes.
- Production build passes where appropriate.
- Existing functionality is not unintentionally broken.
- Firestore interactions are correctly typed.
- UI is responsive.
- Relevant documentation is updated when architecture or behavior changes.
- The feature represents a stable milestone suitable for continued development.

---

## 11. Current Development Philosophy

Build PrepSathi incrementally.

Do not attempt to build every feature simultaneously.

Prioritize:

1. Stable foundation
2. Core study workflow
3. Data persistence
4. Progress tracking
5. Analytics
6. Intelligent study assistance
7. Polish and optimization
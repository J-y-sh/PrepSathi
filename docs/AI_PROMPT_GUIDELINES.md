\# PrepSathi - AI Prompt Guidelines



\## 1. Purpose



This document defines how AI assistants should work on the PrepSathi project.



PrepSathi is developed substantially through AI-assisted coding. AI must behave as a development partner that understands and extends the existing codebase rather than repeatedly redesigning it.



\---



\## 2. Before Writing Code



Before proposing or generating code:



1\. Understand the user's requested change.

2\. Inspect the relevant existing files.

3\. Identify the existing data flow.

4\. Identify related types, services, stores, hooks, and components.

5\. Reuse existing architecture wherever possible.

6\. Check whether a similar feature already exists.

7\. Avoid assumptions about files or APIs that have not been inspected.



If important context is missing, ask for the relevant file or command output instead of guessing.



\---



\## 3. Architecture Preservation



The existing architecture is authoritative.



AI should:



\- Extend existing services instead of creating duplicate services.

\- Reuse existing Zustand stores where appropriate.

\- Reuse existing TypeScript types.

\- Reuse existing UI components.

\- Follow established naming conventions.

\- Preserve existing Firebase collection structures.

\- Preserve existing authentication flow.

\- Avoid unnecessary changes to unrelated features.



Do not introduce a new architectural pattern unless there is a clear reason.



\---



\## 4. Minimal Coherent Changes



Prefer the smallest change that correctly solves the requested problem.



Do not:



\- Rewrite entire files unnecessarily.

\- Replace working implementations without justification.

\- Introduce duplicate functionality.

\- Change unrelated UI.

\- Rename existing concepts without a strong reason.

\- Modify multiple architectural layers when one layer is sufficient.



When a larger change is genuinely required, explain why before implementing it.



\---



\## 5. TypeScript Rules



TypeScript correctness is mandatory.



AI-generated code should:



\- Use existing shared types.

\- Avoid unnecessary `any`.

\- Avoid unsafe type assertions.

\- Keep function parameters and return types consistent.

\- Respect existing interfaces.

\- Update dependent code when a type intentionally changes.

\- Resolve TypeScript errors instead of suppressing them.



Do not use `as any` as a shortcut for an architectural mismatch unless there is a documented and justified reason.



\## 6. Firebase Rules



All user-specific data must belong to the authenticated Firebase user.



Never hard-code user IDs.



Before changing Firestore behavior:



1\. Inspect the existing service.

2\. Inspect the relevant type.

3\. Inspect the calling store or feature.

4\. Preserve existing collection names.

5\. Preserve existing field names unless a migration is intentionally planned.

6\. Consider Firestore query indexes when adding compound queries.



Firestore access should normally happen through the service layer rather than directly inside UI components.



\---



\## 7. State Management Rules



PrepSathi uses Zustand for client-side application state.



Before creating a new store:



\- Check whether an existing store already owns the required state.

\- Extend the existing store when appropriate.

\- Keep Firebase operations in services where practical.

\- Keep UI state separate from persistent database state when possible.



Avoid creating multiple stores that represent the same domain.



\---



\## 8. UI and Design Rules



Maintain the existing PrepSathi visual language.



Primary design values:



\- Background: `#020617`

\- Card background: `#1E293B`

\- Primary accent: `#F59E0B`

\- Success: `#10B981`



The UI should remain:



\- Mobile-first

\- Responsive

\- Dark themed

\- Clean

\- Study-focused

\- Fast to use

\- Consistent with existing components



Prefer existing UI primitives and components before creating new ones.



\---



\## 9. Feature Development Workflow



For a new feature, follow this sequence:



\### Step 1 - Understand



Identify:



\- User goal

\- Existing related functionality

\- Required UI

\- Required data

\- Required persistence

\- Required state



\### Step 2 - Inspect



Inspect relevant:



\- Types

\- Services

\- Stores

\- Components

\- Feature modes

\- Pages

\- Hooks



\### Step 3 - Plan



Define the smallest coherent implementation.



\### Step 4 - Implement



Modify only the necessary files.



\## 10. Debugging Workflow



When an error occurs:



1\. Read the complete error.

2\. Identify the exact file and line.

3\. Inspect the relevant implementation.

4\. Trace the data flow.

5\. Fix the root cause.

6\. Run the build again.

7\. Confirm that the fix did not introduce another regression.



Do not randomly change multiple files to make an error disappear.



\---



\## 11. Handling Existing Code



When the user provides existing code:



\- Treat it as the current source of truth.

\- Do not silently replace its architecture.

\- Preserve working behavior.

\- Explain conflicts between the requested change and existing implementation.

\- Provide complete replacement code only when necessary.

\- If only a small change is required, clearly identify the exact change.



\---



\## 12. Commands and Terminal Instructions



Terminal instructions should be:



\- Explicit

\- Sequential

\- Copy-paste friendly

\- Limited to the commands currently required



Do not mix explanatory prose into PowerShell commands.



When providing a command block, only commands that should be executed belong inside the block.



After asking the user to run a command, wait for the result before making assumptions about the result.



\---



\## 13. Git Workflow



Git commits should represent meaningful milestones.



Do not recommend committing after every small change.



Before recommending a commit:



```bash

npm run build

git status



\### Step 5 - Validate



Run:



```bash

npm run build



\## 14. Documentation Workflow



The project documentation should remain useful to future AI sessions.



Update documentation when there is a meaningful change to:



\- Architecture

\- Firestore schema

\- Major feature behavior

\- Development roadmap

\- AI development rules

\- Important project decisions



Do not update documentation for every tiny implementation detail.



\---



\## 15. Continuation Between AI Sessions



When continuing PrepSathi in a new AI conversation:



1\. Read `PROJECT\_CONSTITUTION.md`.

2\. Read `PROJECT\_ROADMAP.md`.

3\. Read `DATABASE\_SCHEMA.md`.

4\. Read `CHANGELOG.md`.

5\. Read `AI\_PROMPT\_GUIDELINES.md`.

6\. Inspect the current repository state when necessary.

7\. Use the documentation as context, but treat the actual codebase as the final source of truth.



The AI should continue from the existing architecture and current milestone rather than starting the project design again.



\---



\## 16. Response Style for Development Tasks



For implementation tasks, AI should:



\- Be direct.

\- Give one step at a time when terminal interaction is required.

\- Clearly distinguish commands from explanations.

\- Avoid unnecessary theory.

\- Explain important architectural decisions briefly.

\- Provide complete code when replacing a file.

\- Avoid overwhelming the user with unrelated future work.



When a task is complete, state the validation status clearly.



\---



\## 17. Critical Rule



Never optimize for producing the largest amount of code.



Optimize for:



\*\*Correctness + consistency + maintainability + minimal rework.\*\*



PrepSathi should evolve as one coherent system.


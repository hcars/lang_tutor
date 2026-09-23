# System Prompt: Language Tutor Monorepo Development Guidelines

> **Target Audience:** Autonomous AI Agents & Developers working in this Monorepo  
> **Repository Type:** Monorepo (Backend + Frontend)

---

## 1. Repository Overview & Technical Stack

You are working on the **Language Tutor** application—a text editing and linguistic support platform. All implementation work across user stories must strictly adhere to the following architecture:

* **Backend (`/backend`):** **Rust** using the **Rocket** framework. Handles database persistence, AES-256 entry encryption, OAuth2 provider linking, decay calculation jobs, and AI review integrations.
* **Frontend (`/frontend`):** **React** + **Vite**, managed exclusively with **Bun** (`bun install`, `bun run dev`, `bun test`). Manages the three-pane UI layout, client-side real-time token processing/spellchecking, and interactive feedback overlays.
* **Database:** Relational database (PostgreSQL/SQLite) storing unencrypted metadata (`title`, `created_at`, `user_id`), AES-256 encrypted entry bodies, vocabulary decay records, and OAuth2 account mappings.

---

## 2. Mandatory Rules & Operational Constraints

### 🚫 Git Workflow Constraint
* **NEVER run `git merge main` or merge directly into the `main` branch.**
* All development must occur on dedicated feature branches (`feature/story-id-description`).
* Submit work via pull requests (PRs) with passing test suites for review.

### 🧪 Testing & Quality Assurance Mandate
* **Test-Driven / Concurrent Testing Requirement:** You **MUST** implement comprehensive unit and integration tests alongside every user story you implement.
* **Backend (Rust):** Write tests using Rust's built-in `#[cfg(test)]` module and Rocket's `rocket::local::blocking::Client` for API integration tests.
* **Frontend (React/Bun):** Write component and hook tests using `bun test` and React Testing Library.
* **Regression Prevention:** No user story is considered "Done" until all existing tests pass and new tests cover happy paths, edge cases, and error boundaries.

---

## 3. UI Layout Architecture

The application interface is strictly structured into three core panes:
1. **Text Area (Left Pane):** Main text editor supporting real-time spellcheck, token highlighting, red/yellow underlines, and hover overlays.
2. **Grammar Panel (Upper-Right Box):** Displays real-time grammar feedback, parsing alerts, and language/instruction selectors.
3. **Current Word Panel (Lower-Right Box):** Displays metadata for the active or selected word and provides actions to save words for review.

---

## 4. Product Features & User Stories Specification

### Feature 1: Real-Time Spell Checking
* **Story #1.1 (Text Input & Spellcheck):** As text is typed into the Text Area, the system evaluates spelling in real time using an in-memory data structure (e.g., SymSpell/Trie/WASM) for rapid lookup without blocking the UI thread.

### Feature 2: Real-Time Grammar Review
* **Story #2.1 (Token Parsing & Grammar Feedback):** Text is parsed into tokens as generated, displaying grammar errors in the Grammar Panel.
* **Story #2.2 (Language & Instruction Configuration):** Allows users to select target languages and instruction parameters to tailor grammar feedback.

### Feature 3: Secure Entry Storage
* **Story #3.1 (Relational Database Storage):** Persists user entries, titles, and date-time stamps into the database.
* **Story #3.2 (Encryption Scope & Metadata Handling):** 
  * Main entry body text **MUST** be encrypted using symmetric **AES-256** encryption.
  * Entry metadata (`title`, `created_at`, `updated_at`, `user_id`) **MUST** remain unencrypted (plaintext) to allow indexing and fast database searching.

### Feature 4: Writing Feedback (AI Review)
* **Story #4.1 (Trigger AI Review):** Provides an on-demand AI review trigger for the active text.
* **Story #4.2 (Section Suggestions & Color-Coded Underlining):** Highlights text sections with specific underline colors:
  * 🔴 **Red Underline:** Serious grammatical or structural issues.
  * 🟡 **Yellow Underline:** Stylistic or minor errors.
  * **Hover UX:** Hovering over an underlined span renders a tooltip/overlay with actionable suggestions.
* **Story #4.3 (Holistic Review Dialogue):** Displays a high-level summary evaluation in a modal dialogue upon review completion.

### Feature 5: Vocabulary Tracking & Usage Reminders
* **Story #5.1 (Save Word for Review):** Allows saving active words from the Current Word Panel to the target language review list via a modal.
* **Story #5.2 (Word Usage Frequency Detection):** Scans saved entries in the database to log word occurrences and update `last_used_timestamp`.
* **Story #5.3 (Decay Function & Reminders):** Evaluates vocabulary retention using a time-decay algorithm ($S = e^{-\lambda \cdot t}$). If retention score $S$ drops below the threshold, triggers a user reminder.

### Feature 6: User Preferences & Settings Persistence
* **Story #6.1 (System Settings Persistence):** Saves source and target language selections to the user's database profile and restores them upon authentication.

### Feature 7: OAuth2 Account Management & Provider Linking
* **Story #7.1 (User Profile & Name Persistence):** Captures user name and email during OAuth2 registration and persists them in the `users` table (no passwords stored).
* **Story #7.2 (Multi-Provider Account Linking):** Maps external providers (Google, GitHub, Apple) via an `oauth_accounts` table, allowing users to link multiple OAuth2 providers to one profile.

---

## 5. Development Workflow Checklist for Agents

1. **Checkout Branch:** Create branch `feature/<story-number>-<short-name>` from `main`.
2. **Implement Feature & Tests:**
   * Rust Rocket backend changes $\rightarrow$ write unit/integration tests in `tests/` or module. Run `cargo test`.
   * React/Vite/Bun frontend changes $\rightarrow$ write test files (`*.test.tsx`). Run `bun test`.
3. **Verify Security & Schema Constraints:**
   * Confirm AES-256 is applied to entry bodies while `title` remains indexed plaintext.
   * Ensure OAuth2 authentication flow passes through `oauth_accounts`.
4. **Push & Create PR:** Push branch and open a Pull Request. **Do NOT attempt `git merge main`**.

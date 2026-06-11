
Detailed Design Plan: Phase 2 (Authentication, Authorization, & Security Filters)

Target Requirements: REQ-15 to REQ-18

---

Component 1: Identity Management Auth Handler

- **Requirements Covered:** REQ-15 (p. 1)
- **Role:** Lead Identity & Access Management (IAM) Engineer.
- **Task:** Build email and password authentication UI pages and wire them to a server-side signup/login handler (p. 1).
- **Context:** The application requires a reliable way to verify user identities before granting access to personal accounts or role-gated areas. The current auth pages at `src/app/auth/login/page.tsx` and `src/app/auth/signup/page.tsx` are static form shells — they render inputs but have no `onSubmit` handler, no API call, and no Supabase client integration. This component adds the submission logic and backend handler to actually create and authenticate users (pp. 1-2).
- **Constraints:**
    - Credentials must never be hardcoded or stored inside client-side frontend code.
    - All data transfer operations for login and registration payloads must be transmitted using standard secure JSON structures over HTTPS.
    - Must seamlessly pass structural user session values (such as an encrypted authentication token) down to the application's global storage context upon a verified server challenge response.
- **Format:** Next.js App Router page components (`src/app/auth/login/page.tsx`, `src/app/auth/signup/page.tsx`) with form submission logic and a Supabase client integration.
- **Acceptance Criteria:**
    - Submitting a newly registered email string along with a valid password successfully creates an authenticated user record inside the platform identity engine (p. 1). **(Not yet implemented — forms have no submission handler.)**
    - Submitting invalid credentials instantly blocks the workflow, generates a standardized user-friendly error message, and protects the system against credentials enumeration tracking. **(Not yet implemented.)**

---

Component 2: Automated Profile Creation Mapping Trigger

- **Requirements Covered:** REQ-16 (p. 1)
- **Role:** Database Engineer / Automation Specialist.
- **Task:** Create an automated database trigger function that executes instantly upon a new user registration event (p. 1).
- **Context:** To maintain system data integrity, user authentication profiles must mirror relational metadata rows (such as display names and telephone contacts) inside the application. Using a structural database trigger moves this tracking out of the application code tier and directly into the persistence engine, preventing broken relational records if an API route fails mid-execution.
- **Constraints:**
    - The trigger must run under native PostgreSQL transaction guidelines (`AFTER INSERT ON auth.users`).
    - Must execute immediately and automatically without manual frontend API triggers (p. 1).
    - Must fallback cleanly by injecting the user's email as the display name if optional registration metadata parameters are omitted from the client session signup payload.
- **Format:** Raw SQL Procedural Language (PL/pgSQL) relational database migration script (`supabase/migrations/002_profiles_trigger.sql`).
- **Acceptance Criteria:**
    - Registering a new identity through the auth provider fires the trigger seamlessly, auto-populating a matching structural record row directly inside the `profiles` table (p. 1). **(Trigger SQL exists in `002_profiles_trigger.sql` but is unreachable — no signup flow inserts into `auth.users`.)**
    - The automated row creation inherits the new user's exact unique index string (`UUID`) as a primary key restriction constraint.

---

Component 3: Server-Side Security-Definer Gating Wrapper

- **Requirements Covered:** REQ-17 (p. 1)
- **Role:** Database Security Engineer.
- **Task:** Implement a server-side `SECURITY DEFINER` helper function to safely verify user permissions (p. 1).
- **Context:** Validating access authorization on the client is vulnerable to manipulation. By defining a functional check directly inside an elevated, isolated database environment (`SECURITY DEFINER`), the execution engine evaluates structural user roles bypassing typical table-read restrictions, protecting the underlying row mappings from unauthorized snooping.
- **Constraints:**
    - The checking script must evaluate privilege parameters against the user role schema mapping tables strictly at the database engine level (p. 1).
    - Must verify user privileges utilizing secure internal session identification variables (`auth.uid()`).
    - The script logic must output a strict Boolean true/false structure to prevent error-based parameter leakage.
- **Format:** PostgreSQL PL/pgSQL functional definition block injected via data tier schema migrations (`supabase/migrations/003_rbac_function.sql`).
- **Acceptance Criteria:**
    - Calling the security function with a regular user session context correctly queries the `user_roles` entity layout and returns `false` (p. 1).
    - Calling the security function with a verified admin session row matches constraints and outputs `true`, ensuring clean server-controlled access validation (p. 1).

---

Component 4: Database Role-Gating for Admin Route Protection

- **Requirements Covered:** REQ-18 (p. 1)
- **Role:** Platform Security Architect / Full-Stack Engineer.
- **Task:** Add role-gating to the admin layout so that the `has_role()` security-definer function is called server-side before rendering admin panels (p. 1).
- **Context:** Rather than relying on client-side JavaScript checks which are vulnerable to manipulation, the admin layout component (`src/app/admin/layout.tsx`) must call the database-level `has_role()` function at render time. Currently it renders unconditionally with a hardcoded `[ ADMIN ACCESS - VERIFIED ]` badge — no role check, no redirect, no auth enforcement. Any user can access `/admin/*` (pp. 1-2).
- **Constraints:**
    - Must intercept all application path endpoints targeted towards administrative directory lines (`/admin/:path*`) (p. 1).
    - Role validation must execute via the `SECURITY DEFINER` database function (`public.has_role()`) defined in `supabase/migrations/003_rbac_function.sql` (p. 1).
    - Any route attempt that lacks a valid admin role mapping parameter must be blocked and redirected to a secure login or error fallback view (p. 1).
- **Format:** Server-side role validation added to the admin layout wrapper (`src/app/admin/layout.tsx`) backed by the security-definer function in (`supabase/migrations/003_rbac_function.sql`).
- **Acceptance Criteria:**
    - An unauthenticated or standard client session attempting to open a URL targeted within the `/admin` path gets blocked at the server level before rendering layout rows (p. 1). **(Not yet implemented — layout renders unconditionally.)**
    - A verified administrator session passes through the role check seamlessly, opening dashboard metrics views with zero layout presentation lag. **(Not yet implemented — no role check exists.)**

---

Component 5: Phase 2 Role & Access Automation Test Specifications

- **Requirements Covered:** Verification validation for REQ-15 through REQ-18 (p. 1)
- **Role:** Lead Quality Assurance (QA) Automation Engineer.
- **Task:** Develop isolated backend integration tests and role-based test cases to verify identity controls before building frontend design components.
- **Context:** To support sequential development, this module gives you the testing tools to check authorization logic, trigger performance, and path gating scripts without depending on functional UI interfaces.
- **Constraints:**
    - Must process test execution states cleanly within a local automated **Jest** sandbox environment.
    - Must use explicit mock configurations to replicate varying user token sessions safely. (Note: current tests directly hit the live database via `pool.query` — no mock structures or session isolation are used.)
    
- **Format:** Automated TypeScript test specification suites (`__tests__/backend/rbac-security.test.ts`).

- **Test Inventory:**

    - **TEST-201**: Profile trigger verification — implemented in `rbac-security.test.ts`. Covers: trigger existence check via `information_schema.triggers`, `display_name` NOT NULL constraint check. **Does not actually insert a user and verify profile row creation.** Uses live DB (no mocks). [REQ-15, REQ-16]

    - **TEST-202**: RBAC server-side gating — implemented in `rbac-security.test.ts`. Covers: `has_role` function existence check, `prosecdef` (SECURITY DEFINER) flag check, return type is boolean check. **Does not test 403/200 HTTP responses, does not simulate admin vs. non-admin sessions.** Uses live DB (no mocks). [REQ-17, REQ-18]

    - **TEST-203**: Auth input validation — implemented in `rbac-security.test.ts`. Covers: email regex validation (valid + invalid), password length checks. **Tests are unit-style (pure logic, no API calls) — no 400/401 HTTP response verification.** Does not test missing-required-fields or non-existent email login scenarios. [REQ-15]

    - **TEST-204**: Admin role toggle & persistence — implemented in `rbac-security.test.ts`. Covers: `has_role` returns a boolean (not specifically `false`), `unique_user_role` constraint EXISTS in schema. **Does not test that DELETE from `user_roles` immediately removes access, does not verify `false` return for unprivileged user.** Uses live DB (no mocks). [REQ-17]

---

Detailed Design Plan: Phase 5 (Gated Administrative Management Panels)

Target Requirements: REQ-37 to REQ-45

---

Component 1: Admin Workspace Layout & Sidebar Navigation Topology

- **Requirements Covered:** REQ-37, REQ-38, REQ-39
- **Role:** Principal Dashboard Architect / Full-Stack Engineer.
- **Task:** Construct the core layout shell for the administrative panel, featuring a fixed left-side management sidebar and a right-side borderless workspace data grid layout (p. 2).
- **Context:** Merchants need an efficient workspace to track business metrics and manage operations. This component provides the structural layout for the admin area, utilizing clean data tables and ensuring the interface is fully readable whether accessed on desktop screens or on mobile viewports (p. 3).
- **Constraints:**
    - The interface must render a fixed, persistent left-side navigation sidebar displaying administrative validation state markers (p. 2).
    - Main data displays must discard thick, boxy borders in favor of fluid, borderless data tracking tables to optimize clean visibility (p. 2).
    - The entire dashboard workspace layout, tables, and controls must be responsive and legibly rendered on mobile browser screens (p. 3).
- **Format:** Responsive dashboard layout controller shell (`src/app/admin/layout.tsx`) and a generic data grid UI element (`src/components/ui/table.tsx`).
- **Acceptance Criteria:**
    - Opening the admin path renders the navigation sidebar on the left and the clean data table layout on the right.
    - Resizing the dashboard down to smartphone viewports scales font sizes and table padding fluidly without clipping content boundaries.

- **Gaps Identified (cross-referenced against PRD.md §"Role-Gated Admin Dashboard", System Architecture.md §4, Requirements List.md REQ-37–39, Test Specification.md TEST-501/506/507, and actual codebase):**
    1. `src/components/ui/table.tsx` does **not exist** — data tables are built inline inside individual components (`order-table.tsx`, `user-grid.tsx`, `admin/products/page.tsx`) using `<table>` elements with `border-b border-border` row dividers. The design plan should reference the actual components rather than a non-existent generic table component.
    2. Admin role badge (`[ ADMIN ACCESS - VERIFIED ]`) in `src/app/admin/layout.tsx:14` is **hardcoded** — there is no call to `has_role('admin')` or any server-side role verification protecting this layout (same REQ-18 gap flagged in Phase 2, C4). The layout renders unconditionally.
    3. Sidebar is hidden completely on mobile via `className="...hidden lg:block"` (`admin/layout.tsx:10`). No hamburger menu, collapsible drawer, or alternative mobile navigation is provided. On mobile viewports the admin area has no sidebar at all — violating REQ-39 ("fully functional and responsive on mobile browser viewports").
    4. The design plan claims "borderless data tracking tables" — actual tables use bottom-border row dividers (`border-b border-border`), which is closer to the PRD's "clean horizontal division lines (no harsh grid boxes)" description. The design plan should use the PRD's wording.

---

Component 2: Business Health Analytics Row Component

- **Requirements Covered:** REQ-40
- **Role:** Analytics UI Developer.
- **Task:** Build a high-level statistics container displaying the three primary operational metrics: Total Orders, Calculated Store Revenue, and Pending Shipments (p. 3).
- **Context:** Quick decision-making requires access to overall store performance figures at a single glance. This section aggregates those key data blocks, adapting its structural layout fluidly across varying viewports to maximize readability on any device.
- **Constraints:**
    - Must display the three core business health fields explicitly: Total Orders, Calculated Revenue, and Pending Shipments (p. 3).
    - The data tiles must align horizontally in a side-by-side row on desktop monitor setups (p. 3).
    - The summary panel must transition into a top-to-bottom single vertical stack on mobile viewports to prevent layout breakages (p. 3).
- **Format:** Next.js Server Component metric shell (`src/app/admin/components/metrics-row.tsx`) using Tailwind layout configurations.
- **Acceptance Criteria:**
    - Opening the analytics module on a desktop viewport displays the three data metrics cards horizontally side-by-side.
    - Opening the same view on an iPhone or Android smartphone layout causes the three metrics modules to stack vertically.

- **Gaps Identified:**
    1. `src/app/admin/components/metrics-row.tsx` does **not exist**. The three metric cards are rendered inline in `src/app/admin/page.tsx:10-16` using a `grid grid-cols-1 md:grid-cols-3 gap-4` container. The design plan should reference the actual location.
    2. Metric values are **hardcoded placeholders** (`128` orders, `$12,450` revenue, `23` pending shipments) — not calculated from live database queries. This violates REQ-40's intent ("Calculated Store Revenue") and the PRD's requirement for "sum of active COD transactions" (`PRD.md` §"Role-Gated Admin Dashboard").
    3. The responsive stacking behavior **works correctly** via `grid-cols-1 md:grid-cols-3`.
    4. `StatsCard` component exists at `src/components/admin/stats-card.tsx` with label, value, and trend props.

---

Component 3: Product Inventory Management CRUD Workspace

- **Requirements Covered:** REQ-41, REQ-42, REQ-43
- **Role:** Core Forms Inventory Developer.
- **Task:** Design and implement a full management interface with input forms to support complete product CRUD operations, variant stock counts tracking, and media asset associations (p. 3).
- **Context:** Administrators need full control to modify the public-facing storefront catalog. This panel provides the interface to create, update, or remove base items, fine-tune exact variant stock volumes, and add product image URLs without manually writing database queries.
- **Constraints:**
    - Must provide distinct, functional forms within the admin panel to handle Create, Edit, and Delete actions for products (p. 3).
    - Must include inputs to manage specific product variant stock numbers (sizes and color combinations) (p. 3).
    - Must provide fields within the product forms to link, display, and edit product photo asset URLs (p. 3).
- **Format:** Interactive Next.js administration views (`src/app/admin/products/page.tsx` and nested directory layout structures).
- **Acceptance Criteria:**
    - Submitting the creation form writes a fresh entry into the `products` and `product_variants` tables, instantly updating the storefront display catalog.
    - Adjusting a numerical variant stock count field successfully fires a data tier row update, altering inventory depth parameters.

- **Gaps Identified:**
    1. **No variant management in product creation flow.** The `ProductForm` component (`src/components/admin/product-form.tsx`) has no inputs for sizes, colors, or stock quantities — only name, description, price, category, and image URL. REQ-42 requires "inputs to manage specific product variant stock numbers (sizes and color combinations)".
    2. **No delete action.** The product listing page (`src/app/admin/products/page.tsx`) renders a table with an "Actions" column header but no delete/edit buttons in the body. The "No products yet" placeholder row lacks any action controls.
    3. **Create and Edit forms use `console.log` instead of API calls.** `src/app/admin/products/create/page.tsx:9-11` and `src/app/admin/products/[id]/page.tsx:9-11` both call `console.log` and `router.push` — no HTTP request is made to persist data. REQ-41 requires "functional forms ... to create, edit, and delete products."
    4. **Edit form uses hardcoded empty initial data.** `src/app/admin/products/[id]/page.tsx:21` passes `initialData: { name: '', description: '', price: 0, categoryId: 1, imageUrl: '' }` — the form does not fetch the existing product record from the database.
    5. **Variant edit page is skeletal.** `src/app/admin/variants/[variant-id]/edit/page.tsx` renders a stock quantity input but the submit handler only calls `router.push('/admin/products')` — no API call to persist the update. REQ-42 requires "variant stock numbers tracking."
    6. **Image URL is a plain text input, not an upload widget.** REQ-43 says "upload and edit product photo assets" which implies file upload capability, not just a URL text field.
    7. **Product listing is static.** `src/app/admin/products/page.tsx` shows "No products yet" with no data fetching from the database. The product listing page should query the `products` table and render rows.

---

Component 4: Order Lifecycle State Modification Interface

- **Requirements Covered:** REQ-44
- **Role:** Fulfillment Operations Workflow Developer.
- **Task:** Build a data-table tracking view with dropdown update controls that lets admins change user order fulfillment states (p. 3).
- **Context:** As fulfillment teams pick, pack, and drop off items for Cash on Delivery delivery logistics, they need to update order tracking references. This interface connects directly to the backend lifecycle state machine, making order tracking straightforward.
- **Constraints:**
    - Must display the operational data grid using a clear, borderless data table layout (pp. 2-3).
    - Must render interactive update selection fields (such as a dropdown menu) to let admins modify order states (p. 3).
    - The interface tracking controls must restrict state progress updates to match the linear database constraint flow: `Pending` → `Confirmed` → `Shipped` → `Delivered` → `Cancelled` (pp. 1-2).
- **Format:** Interactive order tracking data table panel view (`src/app/admin/orders/page.tsx`).
- **Acceptance Criteria:**
    - Fulfillment staff can select an order row and change its state from `Pending` to `Confirmed`, instantly updating the record state.
    - Attempting to select an out-of-order transition (e.g., trying to shift an order directly from `Pending` to `Delivered`) is blocked at the interface level.

- **Gaps Identified:**
    1. **Dropdown does not block invalid transitions.** The `OrderTable` component (`src/components/admin/order-table.tsx:56-66`) renders a `<select>` with all 5 statuses as options at all times. An admin can select "Delivered" from a "Pending" order with no UI-level validation. The design plan says this must be blocked "at the interface level."
    2. **No server-side API call.** `src/app/admin/orders/page.tsx:8-9` — `handleStatusUpdate` only calls `console.log`. REQ-44 requires the interface to "connect directly to the backend lifecycle state machine."
    3. **No data fetching.** The `orders` array is initialized as empty `[]` (`orders/page.tsx:5`). No database query populates the order table. REQ-44 requires displaying order entries in the data grid.
    4. **Table layout is correct** — uses `border-b border-border` row dividers matching the PRD's "clean horizontal division lines (no harsh grid boxes)" specification.
    5. **StatusBadge component** (`src/components/admin/status-badge.tsx`) exists and renders colored badges for all 5 states.

---

Component 5: User Access Control & Privilege Management Registry

- **Requirements Covered:** REQ-45
- **Role:** Security Operations & Access Engineer.
- **Task:** Deploy an administration registry directory grid tracking system user identities with functional toggles to modify privilege levels (p. 3).
- **Context:** Platform safety requires a controlled process for assigning administrative roles. This component provides high-level security staff with a clean overview of system accounts, enabling them to add or remove workspace admin access tokens immediately.
- **Constraints:**
    - Must render a clear data grid table listing registered user identities (p. 3).
    - Must include individual action toggles or update triggers to assign or revoke user dashboard admin access credentials on demand (p. 3).
    - Modifying an access toggle must execute through a secure server-side call, instantly modifying permissions inside the database `user_roles` table (pp. 1-2).
- **Format:** Role management directory panel view (`src/app/admin/users/page.tsx`).
- **Acceptance Criteria:**
    - Toggling a specific user's permission switch to active inserts an admin role row for that profile in the database, granting dashboard entry privileges.
    - Toggling that same element off removes the corresponding access record row, immediately revoking administrative permissions.

- **Gaps Identified:**
    1. **No server-side role toggle.** `src/app/admin/users/page.tsx:7-9` — `handleToggleRole` only calls `console.log`. The design plan requires "executing through a secure server-side call, instantly modifying permissions inside the database `user_roles` table."
    2. **No data fetching.** The `users` array is initialized as empty `[]` (`users/page.tsx:5`). REQ-45 requires "a clear data grid table listing registered user identities."
    3. **No self-protection check.** The design plan's TEST-505 acceptance criteria say "the admin account cannot revoke their own admin privileges (self-protection)" — no such check exists anywhere in the users page or `UserGrid` component.
    4. **`UserGrid` component exists** at `src/components/admin/user-grid.tsx` with proper Grant Admin / Revoke Admin buttons and role badge styling — the UI shell is ready, but the backend wiring is missing.
    5. **Admin nav badge is hardcoded** — no `has_role()` call verifies the current user's role before rendering admin features (same gap as C1 and Phase 2 C4).

---

Component 6: Phase 5 Admin Dashboard Functional E2E Test Specifications

- **Requirements Covered:** Comprehensive functional layout validation checking for REQ-37 through REQ-45
- **Role:** QA Lead Automation Tester.
- **Task:** Script browser automation scenarios to verify the admin workspace layout, CRUD forms, and role-gated interactions across desktop and mobile devices.
- **Context:** Automation test suites guarantee dashboard routes and forms operate flawlessly before release, verifying that role validation filters correctly block unauthorized access and metrics blocks adapt layout arrangements cleanly across screens.
- **Constraints:**
    - Must execute cross-device test flows using the **Playwright** browser testing framework.
    - Must utilize pre-authenticated dashboard user state profiles to validate both authorized admin and blocked user scenarios.
- **Format:** Automated Playwright test files (`e2e/admin-dashboard.spec.ts` and `e2e/admin-crud.spec.ts`).
- **Acceptance Criteria:**
    - Running the Playwright command tests the administration components across desktop and mobile screen dimensions, passing all layout alignment, form submission, and access block checks with zero errors.

- **Gaps Identified (cross-referenced against Test Specification.md §Phase 5, TEST-501 through TEST-508):**
    1. **Tests are skeletal render-only checks.** Most test cases only assert that a page heading is visible (`expect(h1).toBeVisible()`). No actual CRUD operations, role toggles, state machine transitions, or form submissions are tested against real behavior.
    2. **No authenticated session setup.** Tests in `admin-crud.spec.ts` (TEST-502, 503, 504, 505, 508) require authenticated admin sessions per the Test Specification, but the tests run without any login/authentication step or cookie injection.
    3. **TEST-501 gaps:** Missing assertion for sidebar width (14rem/56 per spec). Missing assertion that "admin workspace uses borderless tables and clean layout divisions." The desktop sidebar test uses `if (sidebarVisible)` guard — if the sidebar is not rendered, the test passes silently. Mobile test only checks sidebar width if visible, not that it's properly hidden/replaced.
    4. **TEST-502 gaps (Product CRUD):** Tests exist for: page renders, create button exists, form fields present, submit/cancel buttons visible. **Missing:** actual product creation and verification in listing — "Assert the new product appears in the product listing table." Missing edit and delete action tests. Missing validation error test for missing required fields.
    5. **TEST-503 gaps (Variant Stock Management):** **Not implemented at all.** The spec requires: navigate to variant edit page, update stock, verify persistence, set stock to 0 and verify "Out of Stock" on storefront, assert negative stock rejected. None of these exist.
    6. **TEST-504 gaps (Order State Machine):** Only checks "orders page renders h1." **Missing:** all state machine transition tests — verify status dropdown updates, assert linear progression (pending→confirmed→shipped→delivered), assert invalid transitions (pending→delivered) rejected, assert cancelled from any non-terminal state.
    7. **TEST-505 gaps (User Role Toggle):** Only checks "users page renders h1." **Missing:** all role toggle tests — grant admin and verify role badge updates, revoke admin and verify role badge reverts, assert self-protection (admin cannot revoke own privileges).
    8. **TEST-506 gaps (Mobile Responsiveness):** Missing: "assert all CRUD forms remain functional on mobile," "assert orders table has horizontal scroll or responsive card layout on mobile."
    9. **TEST-507 gaps (Non-Admin Route Blocking):** Missing: "assert admin API routes (e.g., POST `/api/admin/products`) also return 403 for non-admin users (defense in depth)."
    10. **TEST-508 (Zero Variants Product):** Partially covered — test asserts product listing page renders. **Missing:** create product without variants and assert it appears in listing, assert "No variants available" on storefront, assert adding variants later is supported.

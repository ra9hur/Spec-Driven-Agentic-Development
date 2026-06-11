
Detailed Design Plan: Phase 3 (Transactional Logic & Fulfillment Lifecycles)

Target Requirements: REQ-19 to REQ-25 (p. 1)

---

Component 1: Transactional Cart Inventory Validation Engine

- **Requirements Covered:** REQ-19 (pp. 1-2)
- **Role:** Lead Backend Engineer / Transactional Systems Architect.
- **Task:** Implement verification logic to ensure that a customer's shopping cart contains at least one valid product variant line item before allowing checkout processing (pp. 1-2).
- **Context:** Relying strictly on client-side cart validation exposes the store to corrupt database entries or ghost orders. The checkout page (`src/app/checkout/page.tsx`) currently submits directly without server-side validation. This component adds a database-coupled pipeline that verifies variant IDs, stock levels, and cart emptiness before order creation (pp. 1-2).
- **Constraints:**
    - Validation logic must be executed within a strict transactional layer directly preceding order persistence workflows.
    - The engine must verify the requested variant IDs against active records in the `product_variants` table.
    - Any cart payload that is empty, contains non-existent variant identifiers, or requests quantities that exceed available stock numbers must throw an explicit execution error and stop checkout processing.
- **Format:** Checkout page component (`src/app/checkout/page.tsx`) with server-side validation invoked via a checkout submission handler, backed by a database query function.
- **Acceptance Criteria:**
    - Submitting an empty cart array payload to the checkout handler triggers a validation block, preventing an empty row entry from being created in the database.
    - Submitting an order for a valid product variant (e.g., Black Hoodie, Size L) checks out successfully if the inventory matches the transaction requirements (pp. 1-2).

---

Component 2: Frontend Client Session Cart Flushing Interface

- **Requirements Covered:** REQ-20 (p. 2)
- **Role:** Senior Frontend Engineer.
- **Task:** Wire the existing `clearCart()` function from the `use-cart` hook to execute immediately after a successful checkout transaction is registered (p. 2).
- **Context:** After a customer places a Cash on Delivery (COD) order, the app needs to clear the local shopping bag state. The `clearCart()` helper exists in `src/hooks/use-cart.ts` but is not currently invoked by the checkout submission handler (`src/app/checkout/page.tsx`). Clearing the cart state prevents accidental duplicate orders and resets the sliding Cart Drawer interface for subsequent browsing (pp. 1-2).
- **Constraints:**
    - The clearing process must execute immediately upon receiving a successful `200 OK` or `201 Created` JSON payload back from the checkout backend endpoint.
    - Must erase all local storage or context state bindings tracking active items to avoid persistent state mismatches.
    - Must reset the cart total counters to zero across both mobile bottom nav indicators and desktop header icons.
- **Format:** Cart state management hook (`src/hooks/use-cart.ts`) with the `clearCart` callback called from the checkout page handler (`src/app/checkout/page.tsx`). Cart Drawer component at `src/components/cart/cart-drawer.tsx` displays the cleared state.
- **Acceptance Criteria:**
    - When the database registers an order and returns a confirmation payload, the client cart state resets to empty.
    - The right-aligned sliding modal Cart Drawer slides closed automatically, and the cart total badge drops to `0`.

---

Component 3: Order State Machine Initialization & Progression Constraints

- **Requirements Covered:** REQ-21, REQ-22, REQ-23 (p. 2)
- **Role:** Systems Workflow Architect / Database Administrator.
- **Task:** Configure the database to default all new order checkouts to `pending`, restrict payment types to `COD`, and enforce a strict linear lifecycle progression constraint (p. 2).
- **Context:** The application operates exclusively on a Cash on Delivery model. To maintain accurate tracking across both frontend buyer profiles and admin fulfillment grids, orders must progress through a structured lifecycle state machine to prevent unconfirmed statuses from skipping directly to shipping pipelines (pp. 1-2).
- **Constraints:**
    - Every newly created database entry in the `orders` table must default to an initial lifecycle state string of `pending` (p. 2).
    - The `payment_method` database flag column must enforce a hard constraint defaulting to an absolute text string value of `COD` (p. 2).
    - State tracking transitions inside the database must be limited to a strict linear progression workflow: `Pending` → `Confirmed` → `Shipped` → `Delivered` → `Cancelled` (p. 2). Forward or backward status skipping (e.g., moving directly from `Pending` to `Delivered`) must be rejected.
- **Format:** Structured Database Migration definitions (`supabase/migrations/001_initial_schema.sql`) introducing the `order_status_enum` enumerated datatype and default column values. A `CHECK` constraint enforcing linear state progression must be added in a follow-up migration (currently absent). A `CHECK` constraint on `payment_method` rejecting non-COD values is also absent — the Test Specification (TEST-307) requires unsupported payment methods to be rejected.
- **Acceptance Criteria:**
    - Inserting an order row without passing explicit status metadata flags sets the record state directly to `pending` and its payment column to `COD` (p. 2).
    - An admin updating an order status from `Pending` directly to `Shipped` triggers a database check constraint failure, rejecting the update request. **(Not yet implemented — requires adding a `CHECK` constraint to the `orders` table.)**
    - Setting `payment_method` to a value other than `'COD'` (e.g., `'Credit Card'`, `'PayPal'`) is rejected by a database constraint. **(Not yet implemented — `payment_method` is `TEXT` with no CHECK constraint beyond the `DEFAULT 'COD'`.)**

---

Component 4: Immutable Line Item Purchase Snapshot Processor

- **Requirements Covered:** REQ-24 (p. 2)
- **Role:** Database Security & Financial Systems Engineer.
- **Task:** Develop a data processor that captures and copies a historical, unchangeable snapshot record of the individual item price into the `order_items` table at the exact millisecond of checkout completion (p. 2).
- **Context:** Product catalog prices fluctuate over time due to sales, updates, or catalog changes. Capturing the price at the millisecond of checkout completion ensures financial records remain accurate and prevents past transactions from changing when base values in the `products` master inventory table are modified (pp. 1-2).
- **Constraints:**
    - The system must read the current active catalog price from the master `products` table and inject that exact numerical value directly into the `order_items.price_at_purchase` column (pp. 1-2).
    - Once written to the transactional database row, the `price_at_purchase` field must be locked against future cascade updates targeting the parent inventory entity rows.
- **Format:** SQL relational checkout submission sub-queries embedded within a multi-table database transaction scope. The `order_items.price_at_purchase` column is defined in `supabase/migrations/001_initial_schema.sql` but the INSERT logic that reads `products.price` and writes it to `order_items` at checkout is not yet implemented.
- **Acceptance Criteria:**
    - When an order is created, the system copies the product's current base price (e.g., a mug priced at `$15.00`) directly into the matching line item row (pp. 1-2).
    - An admin changing that mug's base catalog price to `$18.00` later leaves the historical `$15.00` line item price unchanged.

---

Component 5: Responsive Storefront Canvas Homepage Layout

- **Requirements Covered:** REQ-25 (p. 2)
- **Role:** UI/UX Frontend Developer / Layout Specialist.
- **Task:** Build the homepage hero banner section within the root layout at `src/app/page.tsx` (currently a minimal placeholder with only a heading and subtitle) (pp. 1-2).
- **Context:** The landing layout establishes the visual design foundation for the platform across all screen resolutions. Implementing a clean, borderless top layout element sets up the brand aesthetic before customers interact with featured grids or use the semantic search query panel (pp. 1-2).
- **Constraints:**
    - The hero component layout must be completely borderless, filling out the entire display container width without clipping background graphics.
    - Must scale fluidly across desktop monitors and down onto narrow smartphone viewports to maintain structural symmetry across all devices.
- **Format:** Next.js App Router root viewport view template file (`src/app/page.tsx`) styled via unified Tailwind utility flags.
- **Acceptance Criteria:**
    - Loading the homepage URL on a widescreen browser renders the hero banner across the display canvas without layout padding gaps or structural alignment breaking.
    - Opening the homepage layout on an iPhone or Android smartphone scales the image and font sizes smoothly, keeping the layout legible on small screens.

---

Component 6: Transactional Order Lifecycle Automation Test Specifications

- **Requirements Covered:** Verification validation for REQ-19 through REQ-24 (p. 2)
- **Role:** QA Integration Automation Tester.
- **Task:** Script backend integration tests to verify the transactional logic, state machine limits, and database price snapshot persistence.
- **Context:** Automated test cases verify backend mechanics before building frontend UI views, making sure checkout constraints block corrupt payloads and keep transaction rows properly synchronized.
- **Constraints:**
    - Must execute in an isolated runtime environment using the local testing database framework via **Jest**.
    - Test assertions must verify that database transaction blocks successfully rollback state changes if an intentional error is injected during order item population.

- **Format:** Automated Jest integration test specification scripts (`__tests__/backend/cart-order-flow.test.ts`, `__tests__/backend/cart-logic.test.ts`).

- **Test Inventory:**

    - **TEST-301**: Checkout validation & order snapshots — assert empty cart rejection, defaults to `pending`/`COD`, price snapshot capture [REQ-19 to REQ-24]. (File: `__tests__/backend/cart-logic.test.ts` — not yet created.)

    - **TEST-302**: Cart state cleared after order submission — assert `clearCart()` invoked, `localStorage` cart key removed [REQ-20]. (File: `__tests__/backend/cart-order-flow.test.ts` — implemented as unit test.)

    - **TEST-303**: Order state machine rigid flow — assert valid sequence (`pending`→`confirmed`→`shipped`→`delivered`), invalid skips (`pending`→`delivered` rejected), terminal states [REQ-22]. (File: `__tests__/backend/cart-order-flow.test.ts` — not yet implemented.)

    - **TEST-304**: Cart invalid quantities — assert zero, negative, float, and excess-stock quantities rejected [REQ-19]. (File: `__tests__/backend/cart-order-flow.test.ts` — implemented as unit test.)

    - **TEST-305**: Duplicate variant merging — assert same variant added twice merges quantities [REQ-19, REQ-20]. (File: `__tests__/backend/cart-logic.test.ts` — not yet created.)

    - **TEST-306**: Price snapshot accuracy — assert `price_at_purchase` unchanged after catalog price update; new orders use updated price [REQ-24]. (File: `__tests__/backend/cart-order-flow.test.ts` — implemented as unit test.)

    - **TEST-307**: Payment method validation — assert `COD` default, explicit accept, unsupported methods rejected [REQ-23]. (File: `__tests__/backend/cart-order-flow.test.ts` — implemented as unit test.)

- **Note:** All existing tests (TEST-302, 304, 306, 307) are unit tests (pure logic, no database). The upstream Test Specification requires integration tests with database rollback verification. TEST-301, TEST-303, and TEST-305 are defined in the Test Specification but not yet implemented.

---
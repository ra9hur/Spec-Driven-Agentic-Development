
---

## Project Name: Postgres E-Com (`postgres-ecommerce-local-ai`)

Status: Baseline Specification (Frozen for Implementation)

---

## 1. Testing Strategy Overview

To support sequential, incremental verification as a developer, this project divides testing into two distinct execution runners:

1. Backend & Business Logic (Jest): Validates PostgreSQL connection integrity, local Ollama embedding response accuracy, mathematical threshold filtering, and role-based access rules purely at the server level.
2. Cross-Device Responsive Interactions (Playwright): Emulates structural rendering across three target viewports to ensure layouts behave correctly across varying screens:
    
    - Desktop Viewport: 1280px × 800px (Chrome / WebKit)
    - Mobile iOS Viewport: iPhone 14 Pro Max emulation (Safari Mobile)
    - Mobile Android Viewport: Pixel 7 emulation (Chrome Mobile)

---

## 2. Test Specifications by Phase

## Phase 1: Database & AI Core Infrastructure

## TEST-101: Local Embedding Construction Vector Alignment (`REQ-7` to `REQ-9`)

- Target File: `__tests__/backend/catalog-seed.test.ts`
- Type: Unit / Integration Test (Jest)
- Execution Setup:
    
    1. Mock the internal HTTP connection to Ollama (`http://localhost:11434`).
    2. Pass a mock product object containing variants (e.g., Size: L, Color: Neon Green) to the ingestion controller logic.
    
- Verification Steps:
    
    - Assert that the string parsing logic constructs a single concatenated string containing all title, description, category, and nested variant strings before sending it to the model.
    - Assert that the array length returned from the model processing function contains exactly 768 elements.
    - Assert that a product with zero variants still generates a valid payload (category + title + description only).
    - Assert that special characters in names or descriptions (apostrophes, ampersands, Unicode) are preserved in the concatenated payload.

## TEST-102: Sub-55ms Semantic Search Query Processing (`REQ-10` to `REQ-14`)

- Target File: `__tests__/backend/ai-search.test.ts`
- Type: Performance & Integration Test (Jest)
- Execution Setup: Use an active local testing PostgreSQL instance pre-seeded with 100 dummy product records utilizing a 768-dimension HNSW index.
- Verification Steps:
    
    - Execute a POST request to `/api/ai-search` with a contextual search string (e.g., `"something for working out"`).
    - Measure execution delta time: Assert that total request execution time from API entry to database response is strictly less than 55 milliseconds.
    - Assert that any item returned from the SQL Cosine Distance match query (`<=>`) possesses an absolute calculated similarity metric ($1 - \text{Cosine Distance}$) greater than or equal to `0.2`.
    

## TEST-103: Database Cluster & Extension Verification (`REQ-1` to `REQ-4`)

- Target File: `__tests__/backend/infrastructure.test.ts`
- Type: Integration Test (Jest / Database)
- Execution Setup: Direct database pool connection.
- Verification Steps:
    
    - Execute `SELECT version()` and assert the PostgreSQL major version is >= 13.
    - Execute `SELECT extversion FROM pg_extension WHERE extname = 'vector'` and assert extension is present and active.
    - Query `information_schema.tables` and assert all 7 tables exist: `profiles`, `user_roles`, `categories`, `products`, `product_variants`, `orders`, `order_items`.
    - Query `pg_indexes` and assert that `products_embedding_hnsw_idx` exists on `products` using `hnsw` access method.
    - Assert `products.embedding` column type is `vector(768)` via `information_schema.columns`.

## TEST-104: Ollama Service Availability (`REQ-5`, `REQ-6`)

- Target File: `__tests__/backend/infrastructure.test.ts`
- Type: Integration Test (Jest)
- Execution Setup: HTTP connection to local Ollama instance.
- Verification Steps:
    
    - Send a GET request to `http://localhost:11434/api/tags` and assert the service responds with 200.
    - Assert that the response body contains `nomic-embed-text` in the list of available models.
    - Assert that the embedding endpoint returns a 768-element array for a valid text input.
    - Assert that an empty string input returns a non-null embedding (graceful handling).

## TEST-105: Edge Cases - Search Security & Malformed Inputs (`REQ-10` to `REQ-13`)

- Target File: `__tests__/backend/ai-search.test.ts`
- Type: Security Test (Jest)
- Execution Setup: Direct API route invocation with malicious payloads.
- Verification Steps:
    
    - Assert that a search query containing SQL injection patterns (`' OR 1=1; DROP TABLE products; --`) returns a 400 error or sanitized empty results (never raw DB errors).
    - Assert that a search query containing XSS payloads (`<script>alert('xss')</script>`) is sanitized and returns results without executing scripts.
    - Assert that extremely long queries (10,000+ characters) are truncated or rejected with 413 without crashing.
    - Assert that queries with only whitespace are treated as empty queries (400 response).
    - Assert that non-string query types (array, object, number) are rejected with 400.

## TEST-106: Edge Cases - Ollama Service Degradation (`REQ-5`, `REQ-11`)

- Target File: `__tests__/backend/ai-search.test.ts`
- Type: Resilience Test (Jest)
- Execution Setup: Mock Ollama endpoint to simulate failures.
- Verification Steps:
    
    - Mock Ollama timeout (3s+ delay) and assert search returns a 503 error with graceful message (not a crash).
    - Mock Ollama returning malformed embedding (not 768 dimensions) and assert the pipeline rejects with a descriptive error.
    - Mock Ollama returning null/non-JSON response and assert the error handler catches it.

## TEST-107: Edge Cases - Seed Pipeline Resilience (`REQ-7`, `REQ-8`)

- Target File: `__tests__/backend/catalog-seed.test.ts`
- Type: Unit / Integration Test (Jest)
- Execution Setup: Mock product data with boundary values.
- Verification Steps:
    
    - Assert that seeding a product with empty name or description is rejected with validation error.
    - Assert that a product with zero variants still generates a valid text payload without variant strings.
    - Assert that a product with 50+ variants still generates within acceptable execution time (< 200ms per product).
    - Assert that duplicate seeding (same product twice) is idempotent (upsert behavior).

---

## Phase 2: Authentication, Authorization, & Security Filters

## TEST-201: Automated Profile Trigger Activation (`REQ-15`, `REQ-16`)

- Target File: `__tests__/backend/rbac-security.test.ts`
- Type: Integration Test (Jest / Database)
- Execution Setup: Direct database pool transaction.
- Verification Steps:
    
    - Execute an SQL statement inserting a fresh entry directly into the internal authentication user record system.
    - Query the public `profiles` table. Assert that a matching row with the exact corresponding identifier string was generated automatically by the database trigger engine.
    - Assert that the `display_name` field in the generated profile is NOT NULL.
    - Assert that inserting a second user with same email returns an error (duplicate detection).

## TEST-202: Server-Side RBAC Privilege Gating (`REQ-17`, `REQ-18`)

- Target File: `__tests__/backend/rbac-security.test.ts`
- Type: Security Test (Jest)
- Execution Setup: Instantiates two distinct mock session states: one session containing a basic `user` role flag, and one containing an authenticated `admin` role mapping.
- Verification Steps:
    
    - Simulate a client routing request to the backend dashboard endpoints or calling the database `has_role()` security-definer function as the basic user. Assert that the interface returns a strict `403 Forbidden` response.
    - Execute the same request utilizing the admin session properties. Assert that the request successfully executes with a `200 OK` response status code.

## TEST-203: Edge Cases - Authentication Input Validation (`REQ-15`)

- Target File: `__tests__/backend/rbac-security.test.ts`
- Type: Security Test (Jest)
- Execution Setup: API route invocation with malformed auth payloads.
- Verification Steps:
    
    - Assert that signup with an invalid email format (`not-an-email`, `@missing.com`) returns 400 validation error.
    - Assert that signup with a weak password (under 6 characters) is rejected.
    - Assert that signup with missing required fields returns 400.
    - Assert that login with non-existent email returns 401 (not 200).

## TEST-204: Edge Cases - Admin Role Toggle & Persistence (`REQ-17`, `REQ-18`)

- Target File: `__tests__/backend/rbac-security.test.ts`
- Type: Security Test (Jest)
- Execution Setup: Database pool query with role manipulation.
- Verification Steps:
    
    - Assert that a user with `admin` role removed via `DELETE` from `user_roles` immediately loses access (no caching).
    - Assert that a user can only have one role per the `unique_user_role` constraint.
    - Assert that the `has_role` function returns `false` for a user with no role entry (graceful default).

---

## Phase 3: Transactional Logic & Fulfillment Lifecycles

## TEST-301: Checkout Item Validation & Order Snapshots (`REQ-19` to `REQ-24`)

- Target File: `__tests__/backend/cart-logic.test.ts`
- Type: Integration Test (Jest)
- Execution Setup: Initialize a direct operational loop targeting order submission handling logic.
- Verification Steps:
    
    - Attempt to process an order request payload containing an empty cart array. Assert that the validation script actively throws an exception and halts the process.
    - Submit a valid cart transaction array containing a product line item. Check the database `orders` record: Assert that the `status` defaults strictly to `pending` and the `payment_method` matches `COD`.
    - Verify the `order_items` transactional table: Assert that the row captures and stores the exact current product base price, decoupling it from future changes to the active product master catalog pricing.

## TEST-302: Cart State Cleared After Order Submission (`REQ-20`)

- Target File: `__tests__/backend/cart-order-flow.test.ts`
- Type: Integration Test (Jest)
- Execution Setup: Simulated checkout flow with cart state.
- Verification Steps:
    
    - Initialize a mock cart with 3 line items.
    - Execute the order submission handler and capture the return response.
    - Assert that after successful order creation, the `clearCart()` function was invoked and the in-memory cart state is empty.
    - Assert that the `localStorage` equivalent cart key is removed.

## TEST-303: Order State Machine Rigid Flow Validation (`REQ-22`)

- Target File: `__tests__/backend/cart-order-flow.test.ts`
- Type: Integration Test (Jest)
- Execution Setup: Direct database order record manipulation.
- Verification Steps:
    
    - Assert that a new order defaults to `pending` status.
    - Assert that `pending` can transition to `confirmed`, then to `shipped`, then to `delivered` (valid sequence).
    - Assert that `pending` can transition directly to `cancelled` (valid cancellation).
    - Assert that `pending` cannot transition directly to `delivered` (skips confirmed and shipped) - returns error.
    - Assert that `confirmed` cannot transition back to `pending` (no reversal).
    - Assert that `delivered` cannot transition to any other state (terminal state).
    - Assert that `cancelled` cannot transition to any other state (terminal state).

## TEST-304: Edge Cases - Cart with Invalid Quantities (`REQ-19`)

- Target File: `__tests__/backend/cart-order-flow.test.ts`
- Type: Unit Test (Jest)
- Execution Setup: Direct validation logic invocation.
- Verification Steps:
    
    - Assert that a cart with a line item having `quantity: 0` is treated as invalid and rejected.
    - Assert that a cart with a line item having negative quantity is rejected.
    - Assert that a cart with a line item exceeding `variant.stock` is rejected with an out-of-stock message.
    - Assert that a cart with floating-point quantity (e.g., 2.5) is rejected or floored to integer.

## TEST-305: Edge Cases - Duplicate Variant in Cart (`REQ-19`, `REQ-20`)

- Target File: `__tests__/backend/cart-logic.test.ts`
- Type: Unit Test (Jest)
- Execution Setup: Cart state logic with duplicate additions.
- Verification Steps:
    
    - Assert that adding the same variant twice merges the quantities (2 + 3 = 5) instead of creating duplicate entries.
    - Assert that the merge still respects stock limits (merged quantity cannot exceed stock).

## TEST-306: Edge Cases - Order Price Snapshot Accuracy (`REQ-24`)

- Target File: `__tests__/backend/cart-order-flow.test.ts`
- Type: Integration Test (Jest)
- Execution Setup: Database order creation with price manipulation.
- Verification Steps:
    
    - Create an order with a product priced at $25.00.
    - After order creation, update the product's price in the catalog to $30.00.
    - Assert that the `order_items.price_at_purchase` remains $25.00 (not affected by catalog update).
    - Assert that subsequent new orders use the updated $30.00 price.

## TEST-307: Edge Cases - Payment Method Validation (`REQ-23`)

- Target File: `__tests__/backend/cart-order-flow.test.ts`
- Type: Integration Test (Jest)
- Execution Setup: Database order creation with different payment values.
- Verification Steps:
    
    - Assert that creating an order without specifying `payment_method` defaults to `'COD'`.
    - Assert that explicitly setting `payment_method` to `'COD'` is accepted.
    - Assert that setting `payment_method` to an unsupported value (e.g., `'Credit Card'`, `'PayPal'`) is rejected.

---

## Phase 4: Storefront Interface Layout (Minimal Obsidian Tech Theme)

## TEST-401: Adaptive Visual Navigation & Breakpoint Architecture (`REQ-27` to `REQ-29`)

- Target File: `e2e/responsive-nav.spec.ts`
- Type: Cross-Device End-to-End Test (Playwright)
- Verification Steps:
    
    - Desktop Configuration: Set browser window dimensions to 1280px width. Verify that the center AI search text panel is visible, and the monospaced indicator phrase `[Press ⌘K to ask AI]` renders correctly. Verify that the mobile bottom layout navigation tray is hidden (`display: none`).
    - Mobile iOS/Android Configurations: Emulate an iPhone and Android user-agent environment. Verify that the wide horizontal text link cluster is completely removed from view. Assert that the sticky baseline navigational tray is rendered on screen within reachable touch thresholds.
    - Assert that the mobile bottom nav contains exactly 4 touch targets: `Home`, `Search`, `Cart`, `Account`.

## TEST-402: Multi-Column Dynamic Grid Scaling (`REQ-30`)

- Target File: `e2e/search-overlay.spec.ts`
- Type: Cross-Device End-to-End Test (Playwright)
- Verification Steps:
    
    - Load the `/shop` route in Desktop view. Query the underlying page structure and assert that the layout handles product elements inside an active 4-column CSS grid template alignment.
    - Transition Playwright viewport properties into a Mobile layout width (< 768px). Evaluate visual element attributes and assert that the grid columns automatically scale down to a 2-column image layout stack to prevent layout clipping.

## TEST-403: Global Obsidian Theme CSS Verification (`REQ-26`)

- Target File: `e2e/responsive-nav.spec.ts`
- Type: Cross-Device End-to-End Test (Playwright)
- Verification Steps:
    
    - Load the home page and assert that `body` has `background-color: #090D16` (obsidian canvas).
    - Assert that `header` has `background-color: #111827` (charcoal container).
    - Assert that secondary containers and cards have `border-color: #1F2937` (deep-gray borders).
    - Assert that body text computes to `color: #F3F4F6` (off-white typography).
    - Assert that interactive elements (buttons, links) use accent colors `#10B981` or `#8B5CF6`.

## TEST-404: Desktop Header Structure (`REQ-27`)

- Target File: `e2e/responsive-nav.spec.ts`
- Type: Cross-Device End-to-End Test (Playwright)
- Execution Setup: Desktop viewport (1280px).
- Verification Steps:
    
    - Assert the header contains the store logo/branding text.
    - Assert the centered semantic search input is present with placeholder or hint text.
    - Assert all 3 navigation links are present and labeled: `Shop`, `Cart`, `Account`.
    - Assert the navigation links are visible (not hidden by mobile media queries).

## TEST-405: Mobile Bottom Navigation Tray (`REQ-28`, `REQ-29`)

- Target File: `e2e/responsive-nav.spec.ts`
- Type: Cross-Device End-to-End Test (Playwright)
- Execution Setup: Mobile viewport (375px).
- Verification Steps:
    
    - Assert the mobile bottom nav is `position: fixed` and `bottom: 0`.
    - Assert the tray has `background-color: #111827` with `border-top: 1px solid #1F2937`.
    - Assert all 4 touch targets (`Home`, `Search`, `Cart`, `Account`) are present and clickable.
    - Assert the condensed upper header shows only branding + search icon (no text nav links).

## TEST-406: Category Sorting & Price Filters (`REQ-31`)

- Target File: `e2e/search-overlay.spec.ts`
- Type: Cross-Device End-to-End Test (Playwright)
- Execution Setup: Desktop viewport, `/shop/[category]` route.
- Verification Steps:
    
    - Assert that a sort dropdown/select exists on the category page.
    - Assert that selecting a sort option (e.g., "Price: Low to High") reorders the product grid.
    - Assert that a price slider/range input exists for filtering.
    - Assert that adjusting the price range filter updates displayed product grid.

## TEST-407: Product Detail Page Layout & Variant Selectors (`REQ-32`, `REQ-33`)

- Target File: `e2e/product-detail.spec.ts`
- Type: Cross-Device End-to-End Test (Playwright)
- Execution Setup: Desktop and mobile viewports.
- Verification Steps:
    
    - Desktop: Assert the PDP renders in a 2-column layout (image left, content right) using `grid` or `flex`.
    - Mobile (< 768px): Assert the PDP stacks into a single column (image above content).
    - Assert that size variant chips/dropdowns are present and clickable.
    - Assert that color variant chips/dropdowns are present and clickable.
    - Assert that selecting a variant updates the UI (price, availability).
    - Assert that the "Add to Cart" button is present and enabled when a valid variant is selected.

## TEST-408: Cart Drawer Component (`REQ-34`)

- Target File: `e2e/cart-drawer.spec.ts`
- Type: Cross-Device End-to-End Test (Playwright)
- Execution Setup: Desktop and mobile viewports.
- Verification Steps:
    
    - Assert the cart drawer slides in from the right side (not left, top, or bottom).
    - Assert the drawer has a semi-transparent backdrop overlay.
    - Assert that the drawer displays cart items, quantity controls, and total.
    - Assert that the drawer is scrollable when cart has many items.
    - Assert that clicking the backdrop closes the drawer.
    - Assert that the drawer is responsive: full-width on mobile, 24rem fixed on desktop.

## TEST-409: Checkout Split Layout Responsive (`REQ-35`)

- Target File: `e2e/order-flow.spec.ts`
- Type: Cross-Device End-to-End Test (Playwright)
- Execution Setup: Desktop and mobile viewports.
- Verification Steps:
    
    - Desktop (1280px): Assert the checkout page uses a side-by-side layout (form left, summary right) via CSS grid.
    - Mobile (< 768px): Assert the checkout page stacks vertically (form above summary).
    - Assert that the order summary is sticky on desktop (remains visible during scrolling).
    - Assert that all required fields exist: Name, Phone, Address, City, Pincode.

## TEST-410: Unique Order ID on Confirmation (`REQ-36`)

- Target File: `e2e/order-flow.spec.ts`
- Type: Cross-Device End-to-End Test (Playwright)
- Execution Setup: Complete a checkout flow.
- Verification Steps:
    
    - Submit a valid checkout form and capture the resulting order ID from the confirmation screen.
    - Assert the order ID matches the format `ORD-XXXXXXXX` (uppercase alphanumeric with dashes).
    - Assert the order ID is unique (two consecutive submissions produce different IDs).

## TEST-411: Edge Cases - Invalid Category Route (`REQ-30`)

- Target File: `e2e/search-overlay.spec.ts`
- Type: Cross-Device End-to-End Test (Playwright)
- Execution Setup: Navigate to non-existent category.
- Verification Steps:
    
    - Navigate to `/shop/non-existent-category`.
    - Assert the application returns a 404 page (not a broken layout or infinite load).
    - Assert the 404 page has a "Back to Shop" link.

## TEST-412: Edge Cases - Missing Required Checkout Fields (`REQ-35`)

- Target File: `e2e/order-flow.spec.ts`
- Type: Cross-Device End-to-End Test (Playwright)
- Execution Setup: Desktop viewport.
- Verification Steps:
    
    - Attempt to submit the checkout form without filling in the Name field.
    - Assert that the browser or app validation prevents submission (native `required` or custom validation message).
    - Assert that form highlights/indicates which field is missing.
    - Repeat for empty Phone, Address, City, Pincode fields.

---

## Phase 5: Gated Administrative Management Panels

## TEST-501: Administrative Responsive Workspace Layout Elements (`REQ-37`, `REQ-38`, `REQ-40`)

- Target File: `e2e/admin-dashboard.spec.ts`
- Type: Cross-Device End-to-End Test (Playwright)
- Verification Steps:
    
    - Authenticate an admin session state and load the `/admin` path in Desktop layout. Assert that the left-hand command sidebar nav is anchored fixed to the edge.
    - Assert that the sidebar has width of 14rem (56) and contains navigation links: Dashboard, Products, Orders, Users, Settings.
    - Assert the three key data reporting panels (Total Orders, Total Revenue, Pending Shipments) expand horizontally side-by-side on desktop.
    - Load the same layout under Mobile dimensions. Verify that the sidebar is hidden (non-admin mobile layout) and the metric summary cards stack cleanly into a vertical top-to-bottom single file configuration.
    - Assert the admin workspace uses borderless tables and clean layout divisions.

## TEST-502: Admin Product CRUD Operations (`REQ-41`)

- Target File: `e2e/admin-crud.spec.ts`
- Type: Cross-Device End-to-End Test (Playwright)
- Execution Setup: Authenticated admin session.
- Verification Steps:
    
    - Navigate to `/admin/products/create`. Fill in all required fields (name, description, price, category) and submit.
    - Assert the new product appears in the product listing table.
    - Click the edit action on the product. Modify the price and submit. Assert the table reflects the updated price.
    - Click the delete action on the product. Assert the product is removed from the listing.
    - Assert that attempting to create a product with missing required fields shows validation errors.

## TEST-503: Admin Variant Stock Management (`REQ-42`)

- Target File: `e2e/admin-crud.spec.ts`
- Type: Cross-Device End-to-End Test (Playwright)
- Execution Setup: Authenticated admin session, existing product with variants.
- Verification Steps:
    
    - Navigate to a product's variant edit page.
    - Update the stock quantity for a variant. Submit and assert the new value is persisted.
    - Set stock to 0 and assert the variant shows as "Out of Stock" on the storefront.
    - Assert that stock values cannot be negative (validation rejection).

## TEST-504: Admin Order State Machine Updates (`REQ-44`)

- Target File: `e2e/admin-crud.spec.ts`
- Type: Cross-Device End-to-End Test (Playwright)
- Execution Setup: Authenticated admin session with existing orders.
- Verification Steps:
    
    - Load the orders table at `/admin/orders`. Assert all orders are displayed with status badges.
    - Change an order status from `pending` to `confirmed` via the dropdown. Assert the badge updates.
    - Assert that transitions follow the rigid lifecycle: `confirmed` → `shipped` → `delivered`.
    - Assert that invalid transitions (e.g., `pending` → `delivered`) are rejected.
    - Assert that `cancelled` is available from any non-terminal state.

## TEST-505: Admin User Role Toggle (`REQ-45`)

- Target File: `e2e/admin-crud.spec.ts`
- Type: Cross-Device End-to-End Test (Playwright)
- Execution Setup: Authenticated admin session with user listing.
- Verification Steps:
    
    - Load the user grid at `/admin/users`. Assert all registered users are displayed.
    - Click "Grant Admin" on a regular user. Assert the user's role badge updates to `admin`.
    - Click "Revoke Admin" on an admin user. Assert the user's role badge updates to `user`.
    - Assert that the admin account cannot revoke their own admin privileges (self-protection).

## TEST-506: Admin Mobile Responsiveness (`REQ-39`)

- Target File: `e2e/admin-dashboard.spec.ts`
- Type: Cross-Device End-to-End Test (Playwright)
- Execution Setup: Mobile viewport with admin session.
- Verification Steps:
    
    - Load `/admin` on mobile viewport (375px width).
    - Assert the left sidebar is hidden (replaced by a hamburger menu or fully responsive stack).
    - Assert all CRUD forms remain functional on mobile (fields are full-width, no horizontal overflow).
    - Assert the orders table has horizontal scroll or responsive card layout on mobile.

## TEST-507: Edge Cases - Non-Admin Route Blocking (`REQ-18`)

- Target File: `e2e/admin-dashboard.spec.ts`
- Type: Security Test (Playwright)
- Execution Setup: Unauthenticated session and non-admin user session.
- Verification Steps:
    
    - As an unauthenticated user, navigate to `/admin`. Assert redirect to login or 403 page.
    - As a non-admin authenticated user, navigate to `/admin`. Assert 403 access denied (not a blank page or broken UI).
    - Assert that the admin API routes (e.g., POST `/api/admin/products`) also return 403 for non-admin users (defense in depth).

## TEST-508: Edge Cases - Product with Zero Variants (`REQ-41`)

- Target File: `e2e/admin-crud.spec.ts`
- Type: Cross-Device End-to-End Test (Playwright)
- Execution Setup: Authenticated admin session.
- Verification Steps:
    
    - Create a new product without adding any variants.
    - Assert the product still appears in the admin product listing.
    - Assert the product appears in the storefront but shows "No variants available" or equivalent.
    - Assert adding variants later is supported (edit product → add variant).

---

## 3. Automation Framework Test Configurations

To support cross-device testing with Playwright, configure your system environment using this boilerplate mapping configuration:

## `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Desktop_Chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'Mobile_iOS',
      use: { ...devices['iPhone 14 Pro Max'] },
    },
    {
      name: 'Mobile_Android',
      use: { ...devices['Pixel 7'] },
    },
  ],
});
```

---

## 4. Test File Inventory

| File | Tests | Phase Coverage |
|------|-------|----------------|
| `__tests__/backend/infrastructure.test.ts` | TEST-103, TEST-104 | Phase 1 infrastructure & Ollama health |
| `__tests__/backend/catalog-seed.test.ts` | TEST-101, TEST-107 | Phase 1 seed pipeline |
| `__tests__/backend/ai-search.test.ts` | TEST-102, TEST-105, TEST-106 | Phase 1 search execution & edge cases |
| `__tests__/backend/rbac-security.test.ts` | TEST-201, TEST-202, TEST-203, TEST-204 | Phase 2 auth, RBAC, edge cases |
| `__tests__/backend/cart-logic.test.ts` | TEST-301, TEST-305 | Phase 3 cart validation |
| `__tests__/backend/cart-order-flow.test.ts` | TEST-302, TEST-303, TEST-304, TEST-306, TEST-307 | Phase 3 order flow & state machine |
| `e2e/responsive-nav.spec.ts` | TEST-401, TEST-403, TEST-404, TEST-405 | Phase 4 navigation & theme |
| `e2e/search-overlay.spec.ts` | TEST-402, TEST-406, TEST-411 | Phase 4 grid, filters, 404 |
| `e2e/product-detail.spec.ts` | TEST-407 | Phase 4 PDP & variant selectors |
| `e2e/cart-drawer.spec.ts` | TEST-408 | Phase 4 cart drawer |
| `e2e/order-flow.spec.ts` | TEST-409, TEST-410, TEST-412 | Phase 4 checkout & confirmation |
| `e2e/admin-dashboard.spec.ts` | TEST-501, TEST-506, TEST-507 | Phase 5 dashboard & security |
| `e2e/admin-crud.spec.ts` | TEST-502, TEST-503, TEST-504, TEST-505, TEST-508 | Phase 5 admin operations |

---

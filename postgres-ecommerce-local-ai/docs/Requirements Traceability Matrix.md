
---

Requirement Traceability Matrix (RTM)

Project Name: Postgres E-Com (`postgres-ecommerce-local-ai`)

**Status:** Verification Baseline (Frozen for Testing Lifecycle)

---

## 1. Traceability Mapping Matrix

### Phase 1: Database & AI Core Infrastructure

| Requirement ID | Requirement Description | Implementation File Target | Verification Test Case ID | Test File Destination |
|---|---|---|---|---|
| **REQ-1** | Provision a local PostgreSQL database cluster (v13+). | `supabase/migrations/001_initial_schema.sql` | TEST-103 | `__tests__/backend/infrastructure.test.ts` |
| **REQ-2** | Initialize and enable the open-source `pgvector` extension. | `supabase/migrations/001_initial_schema.sql` | TEST-103 | `__tests__/backend/infrastructure.test.ts` |
| **REQ-3** | Implement full relational schema layout. | `supabase/migrations/001_initial_schema.sql` | TEST-103 | `__tests__/backend/infrastructure.test.ts` |
| **REQ-4** | Attach an HNSW index to the product embedding column. | `supabase/migrations/001_initial_schema.sql` | TEST-103 | `__tests__/backend/infrastructure.test.ts` |
| **REQ-5** | Establish a persistent local Ollama background service. | `src/lib/ollama.ts` | TEST-104, TEST-106 | `__tests__/backend/infrastructure.test.ts` |
| **REQ-6** | Pull and host the `nomic-embed-text` model locally. | `src/lib/ollama.ts` | TEST-104 | `__tests__/backend/infrastructure.test.ts` |
| **REQ-7** | Build the catalog data ingestion pipeline at `/api/seed`. | `src/app/api/seed/route.ts` | TEST-101, TEST-107 | `__tests__/backend/catalog-seed.test.ts` |
| **REQ-8** | Concatenate title, description, category, and variant properties. | `src/app/api/seed/route.ts` | TEST-101, TEST-107 | `__tests__/backend/catalog-seed.test.ts` |
| **REQ-9** | Enforce an exact 768-dimension vector format output. | `src/app/api/seed/route.ts` | TEST-101 | `__tests__/backend/catalog-seed.test.ts` |
| **REQ-10** | Expose a secure search POST endpoint at `/api/ai-search`. | `src/app/api/ai-search/route.ts` | TEST-102, TEST-105 | `__tests__/backend/ai-search.test.ts` |
| **REQ-11** | Convert search query string parameter inputs to vectors. | `src/app/api/ai-search/route.ts` | TEST-102, TEST-106 | `__tests__/backend/ai-search.test.ts` |
| **REQ-12** | Execute SQL matching algorithms utilizing Cosine Distance (`<=>`). | `src/app/api/ai-search/route.ts` | TEST-102, TEST-105 | `__tests__/backend/ai-search.test.ts` |
| **REQ-13** | Enforce a strict minimum cosine similarity filter boundary of `0.2`. | `src/app/api/ai-search/route.ts` | TEST-102, TEST-105 | `__tests__/backend/ai-search.test.ts` |
| **REQ-14** | Return clean JSON tracking latencies strictly under 55ms. | `src/app/api/ai-search/route.ts` | TEST-102 | `__tests__/backend/ai-search.test.ts` |

### Phase 2: Authentication, Authorization, & Security Filters

| Requirement ID | Requirement Description | Implementation File Target | Verification Test Case ID | Test File Destination |
|---|---|---|---|---|
| **REQ-15** | Deploy an email/password user signup and login handler. | `src/app/auth/login/page.tsx`, `src/app/auth/signup/page.tsx` | TEST-201, TEST-203 | `__tests__/backend/rbac-security.test.ts` |
| **REQ-16** | Trigger automated matching row generation in `profiles`. | `supabase/migrations/002_profiles_trigger.sql` | TEST-201 | `__tests__/backend/rbac-security.test.ts` |
| **REQ-17** | Implement server-side security-definer helper function. | `supabase/migrations/003_rbac_function.sql` | TEST-202, TEST-204 | `__tests__/backend/rbac-security.test.ts` |
| **REQ-18** | Block non-admin client dashboard routing attempts. | `supabase/migrations/003_rbac_function.sql` | TEST-202, TEST-507 | `__tests__/backend/rbac-security.test.ts`, `e2e/admin-dashboard.spec.ts` |

### Phase 3: Transactional Logic & Fulfillment Lifecycles

| Requirement ID | Requirement Description | Implementation File Target | Verification Test Case ID | Test File Destination |
|---|---|---|---|---|
| **REQ-19** | Enforce valid variant stock quantities before order entry. | `src/app/checkout/page.tsx` | TEST-301, TEST-304, TEST-305 | `__tests__/backend/cart-logic.test.ts` |
| **REQ-20** | Clear frontend client cart tracking data states instantly. | `src/components/cart/cart-drawer.tsx` | TEST-302, TEST-305 | `__tests__/backend/cart-order-flow.test.ts` |
| **REQ-21** | Default all new database order logs to a status of `pending`. | `supabase/migrations/001_initial_schema.sql` | TEST-301, TEST-303 | `__tests__/backend/cart-logic.test.ts`, `__tests__/backend/cart-order-flow.test.ts` |
| **REQ-22** | Enforce linear order state updates. | `src/app/admin/orders/page.tsx` | TEST-303, TEST-504 | `__tests__/backend/cart-logic.test.ts`, `e2e/admin-crud.spec.ts` |
| **REQ-23** | Default transaction column row inputs to a value of `COD`. | `supabase/migrations/001_initial_schema.sql` | TEST-301, TEST-307 | `__tests__/backend/cart-logic.test.ts`, `__tests__/backend/cart-order-flow.test.ts` |
| **REQ-24** | Freeze immutable item price snapshots inside `order_items`. | `src/app/checkout/page.tsx` | TEST-301, TEST-306 | `__tests__/backend/cart-logic.test.ts`, `__tests__/backend/cart-order-flow.test.ts` |
| **REQ-25** | Ensure homepage displays a borderless hero banner section. | `src/app/page.tsx` | TEST-403 | `e2e/responsive-nav.spec.ts` |

### Phase 4: Storefront Interface Layout (Minimal Obsidian Tech Theme)

| Requirement ID | Requirement Description | Implementation File Target | Verification Test Case ID | Test File Destination |
|---|---|---|---|---|
| **REQ-26** | Enforce Obsidian dark aesthetics theme rules globally. | `src/app/globals.css` | TEST-403 | `e2e/responsive-nav.spec.ts` |
| **REQ-27** | Render the widescreen header configuration layout. | `src/components/layout/header.tsx` | TEST-401, TEST-404 | `e2e/responsive-nav.spec.ts` |
| **REQ-28** | Collapse mobile navigation visibility limits. | `src/components/layout/header.tsx` | TEST-401, TEST-405 | `e2e/responsive-nav.spec.ts` |
| **REQ-29** | Render the thumb-accessible bottom navigation tray. | `src/components/layout/mobile-bottom-nav.tsx` | TEST-401, TEST-405 | `e2e/responsive-nav.spec.ts` |
| **REQ-30** | Auto-scale product listings dynamically from 4 to 2 columns. | `src/app/shop/page.tsx` | TEST-402, TEST-411 | `e2e/search-overlay.spec.ts` |
| **REQ-31** | Provide functional sorting and price slider selection filters. | `src/app/shop/[category]/page.tsx` | TEST-406 | `e2e/search-overlay.spec.ts` |
| **REQ-32** | Stacks the Product Detail Page vertically on mobile screens. | `src/app/products/[id]/page.tsx` | TEST-407 | `e2e/product-detail.spec.ts` |
| **REQ-33** | Render interactive variant choice chips or selectors. | `src/app/products/[id]/page.tsx` | TEST-407 | `e2e/product-detail.spec.ts` |
| **REQ-34** | Provide right-aligned sliding modal Cart Drawer component. | `src/components/cart/cart-drawer.tsx` | TEST-408 | `e2e/cart-drawer.spec.ts` |
| **REQ-35** | Layout checkout as a side-by-side or stacked grid layout. | `src/app/checkout/page.tsx` | TEST-409, TEST-412 | `e2e/order-flow.spec.ts` |
| **REQ-36** | Output an uppercase alphanumeric tracking ID (`ORD-XXXXXXXX`). | `src/app/checkout/confirmation/page.tsx` | TEST-410 | `e2e/order-flow.spec.ts` |

### Phase 5: Gated Administrative Management Panels

| Requirement ID | Requirement Description | Implementation File Target | Verification Test Case ID | Test File Destination |
|---|---|---|---|---|
| **REQ-37** | Render fixed administrative command navigation sidebar. | `src/app/admin/layout.tsx` | TEST-501 | `e2e/admin-dashboard.spec.ts` |
| **REQ-38** | Render borderless grid tracking tables. | `src/components/admin/order-table.tsx` | TEST-501 | `e2e/admin-dashboard.spec.ts` |
| **REQ-39** | Ensure admin dashboard is fully functional on mobile viewports. | `src/app/admin/page.tsx` | TEST-506 | `e2e/admin-dashboard.spec.ts` |
| **REQ-40** | Stacks business health tiles vertically on mobile devices. | `src/app/admin/page.tsx` | TEST-501 | `e2e/admin-dashboard.spec.ts` |
| **REQ-41** | Build functional forms inside admin to handle product CRUD. | `src/app/admin/products/page.tsx`, `src/app/admin/products/create/page.tsx`, `src/app/admin/products/[id]/page.tsx` | TEST-502, TEST-508 | `e2e/admin-crud.spec.ts` |
| **REQ-42** | Build fields to track variant stock volumes. | `src/app/admin/variants/[variant-id]/edit/page.tsx` | TEST-503 | `e2e/admin-crud.spec.ts` |
| **REQ-43** | Build forms to link and modify photo assets. | `src/app/admin/products/[id]/page.tsx` | TEST-502 | `e2e/admin-crud.spec.ts` |
| **REQ-44** | Render interactive order lifecycle status state modification tools. | `src/app/admin/orders/page.tsx` | TEST-504 | `e2e/admin-crud.spec.ts` |
| **REQ-45** | Render registry system toggles to modify privilege levels. | `src/app/admin/users/page.tsx` | TEST-505 | `e2e/admin-crud.spec.ts` |

---

## 2. Coverage Metrics Summary

- **Total Requirements Defined:** 45 (`REQ-1` to `REQ-45`)
- **Total Test Specifications Mapped:** 38 distinct test configurations (TEST-101 to TEST-508)
- **Backend Verification Coverage (Jest):** 24/45 Requirements (53.3%) — REQ-1 to REQ-24
- **Frontend Responsive Component Coverage (Playwright/E2E):** 21/45 Requirements (46.7%) — REQ-25 to REQ-45
- **Absolute Traceability Coverage Rate:** **100% Fully Documented** — every requirement maps to at least one implementation file and one test case

## 3. Test File Inventory by Phase

| Test Configuration | Requirement Coverage | Test File | Layer |
|---|---|---|---|
| TEST-101, TEST-107 | REQ-7, REQ-8, REQ-9 | `__tests__/backend/catalog-seed.test.ts` | Backend |
| TEST-102, TEST-105, TEST-106 | REQ-10, REQ-11, REQ-12, REQ-13, REQ-14 | `__tests__/backend/ai-search.test.ts` | Backend |
| TEST-103, TEST-104 | REQ-1, REQ-2, REQ-3, REQ-4, REQ-5, REQ-6 | `__tests__/backend/infrastructure.test.ts` | Backend |
| TEST-201, TEST-202, TEST-203, TEST-204 | REQ-15, REQ-16, REQ-17 | `__tests__/backend/rbac-security.test.ts` | Backend |
| TEST-301, TEST-305 | REQ-19, REQ-21, REQ-23, REQ-24 | `__tests__/backend/cart-logic.test.ts` | Backend |
| TEST-302, TEST-303, TEST-304, TEST-306, TEST-307 | REQ-20, REQ-21, REQ-22, REQ-23, REQ-24 | `__tests__/backend/cart-order-flow.test.ts` | Backend |
| TEST-401, TEST-403, TEST-404, TEST-405 | REQ-26, REQ-27, REQ-28, REQ-29 | `e2e/responsive-nav.spec.ts` | E2E |
| TEST-402, TEST-406, TEST-411 | REQ-30, REQ-31 | `e2e/search-overlay.spec.ts` | E2E |
| TEST-407 | REQ-32, REQ-33 | `e2e/product-detail.spec.ts` | E2E |
| TEST-408 | REQ-34 | `e2e/cart-drawer.spec.ts` | E2E |
| TEST-409, TEST-410, TEST-412 | REQ-35, REQ-36 | `e2e/order-flow.spec.ts` | E2E |
| TEST-501, TEST-506, TEST-507 | REQ-37, REQ-38, REQ-39, REQ-40, REQ-18 | `e2e/admin-dashboard.spec.ts` | E2E |
| TEST-502, TEST-503, TEST-504, TEST-505, TEST-508 | REQ-41, REQ-42, REQ-43, REQ-44, REQ-45 | `e2e/admin-crud.spec.ts` | E2E |

---

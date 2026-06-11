# Project Structure: postgres-ecommerce-local-ai

```
postgres-ecommerce-local-ai/
├── .env.local                  # Local environment variables (DB URLs, Ollama endpoint)
├── next.config.js              # Next.js compiler and runtime configuration
├── package.json                # Project dependencies (jest, playwright, pg, next) & test scripts
├── playwright.config.ts        # Playwright setup for mobile/desktop emulation testing
├── jest.config.ts              # Jest test engine layout and directory path mapping
├── tailwind.config.js          # Unified theme specifications (Obsidian colors, breakpoints)
├── tsconfig.json               # TypeScript configuration with path aliases
│
├── supabase/                   # Local database migrations and seeding environment
│   └── migrations/             
│       ├── 001_initial_schema.sql
│       ├── 002_profiles_trigger.sql
│       └── 003_rbac_function.sql
│   └── seed/                      
│       └── 001_seed_catalog.sql
│
├── __tests__/                  # Phase 1 & Phase 2 Unit & Integration Tests (Jest)
│   ├── backend/
│   │   ├── ai-search.test.ts   # Tests sub-55ms vector calculation & matching logic
│   │   ├── catalog-seed.test.ts# Tests multi-variant string concatenation logic
│   │   └── rbac-security.test.ts# Tests server-side role validation execution logic
│   └── frontend/
│       └── cart-logic.test.ts  # Tests item counter adjustments & price calculations
│
├── e2e/                        # Phase 4 & Phase 5 Cross-Device E2E Layout Tests (Playwright)
│   ├── responsive-nav.spec.ts  # Tests desktop header vs thumb-accessible sticky mobile bar
│   ├── search-overlay.spec.ts  # Tests desktop 4-column grid scales to mobile 2-column stack
│   ├── order-flow.spec.ts      # Tests split-view checkout form on desktop vs stacked on mobile
│   └── admin-dashboard.spec.ts # Tests role-gating blocks access & metrics cards stack on mobile
│
└── src/                        # Main codebase root
    ├── lib/                    # Shared system connection utilities
    │   ├── db.ts               # PostgreSQL pooled connection handling
    │   ├── ollama.ts           # Local vector mapping HTTP bridge wrapper
    │   ├── auth.ts             # Supabase client initialization & auth helpers
    │   └── utils/              # Shared utility functions
    │       ├── format.ts       # Currency, date, time formatting
    │       ├── validation.ts   # Input sanitization & validation helpers
    │       └── order.ts        # Order ID generation & tracking logic
    │
    ├── hooks/                  # Custom React hooks for client-side state
    │   ├── use-cart.ts         # Cart state management & persistence
    │   ├── use-auth.ts         # User authentication state & session handling
    │   ├── use-search.ts       # AI search state & query handling
    │   └── use-toast.ts        # Notification/feedback state management
    │
    ├── app/                    # Next.js App Router (Routing and Server Components)
    │   ├── layout.tsx          # Global structural shell containing the visual layout theme
    │   ├── page.tsx            # Responsive Homepage featuring hero banners and grid views
    │   ├── manifest.ts         # PWA manifest configuration
    │   │
    │   ├── auth/               # Authentication routes
    │   │   ├── login/          # User login handler
    │   │   │   └── page.tsx
    │   │   └── signup/         # User signup handler
    │   │       └── page.tsx
    │   │
    │   ├── account/            # User account management
    │   │   ├── page.tsx        # Account overview & order history
    │   │   └── orders/         # User's past orders
    │   │       └── page.tsx
    │   │
    │   ├── shop/               # Public Storefront category navigation
    │   │   ├── page.tsx        # Category listing grid
    │   │   └── [category]/     # Dynamic category pages
    │   │       └── page.tsx
    │   │
    │   ├── cart/               # Shopping cart views
    │   │   ├── page.tsx        # Cart summary & checkout entry
    │   │   └── components/     # CartDrawer component in separate file
    │   │
    │   ├── products/           # Product detail pages
    │   │   └── [id]/           # Individual product detail view
    │   │       └── page.tsx
    │   │
    │   ├── checkout/           # Checkout processing view
    │   │   ├── page.tsx        # Checkout form entry (split-view desktop, stacked mobile)
    │   │   └── confirmation/   # Order confirmation screen
    │   │       └── page.tsx
    │   │
    │   ├── search/             # Search overlay/mobility views
    │   │   └── overlay.tsx     # Full-screen search interface (mobile/desktop toggle)
    │   │
    │   ├── admin/              # Role-gated Administration Control dashboard
    │   │   ├── page.tsx        # Admin dashboard overview (metrics, quick stats)
    │   │   ├── products/       # Product management sub-section
    │   │   │   ├── page.tsx    # Product listing & CRUD entry points
    │   │   │   ├── [id]/       # Individual product editing
    │   │   │   │   └── page.tsx
    │   │   │   └── create/     # New product creation form
    │   │   │       └── page.tsx
    │   │   ├── variants/       # Variant stock management
    │   │   │   └── [variant-id]/
    │   │   │       └── edit/
    │   │   │           └── page.tsx
    │   │   ├── orders/         # Order lifecycle management
    │   │   │   ├── page.tsx    # Order table view with status filters
    │   │   │   └── [order-id]/ # Individual order modification
    │   │   │       └── page.tsx
    │   │   ├── users/          # User access control grid
    │   │   │   └── page.tsx    # User list with admin toggle functionality
    │   │   └── settings/       # Admin configuration & system settings
    │   │       └── page.tsx
    │   │
    │   └── api/                # Backend API REST routes
    │       ├── ai-search/      # Semantic search endpoint
    │       │   └── route.ts
    │       └── seed/           # Catalog ingestion pipeline
    │           └── route.ts
    │
    └── components/             # Reusable UI component modules
        ├── layout/             # Structural layout components
        │   ├── header.tsx      # Desktop persistent layout header
        │   ├── mobile-nav.tsx  # Thumb-accessible sticky mobile baseline navigation tray
        │   ├── mobile-drawer.tsx # Mobile top navigation drawer
        │   └── mobile-bottom-nav.tsx # Fixed bottom navigation tray
        │
        ├── shared/             # Components used across public & admin views
        │   ├── container.tsx   # Responsive layout container wrapper
        │   ├── button.tsx      # Themed button variants (primary, secondary, ghost)
        │   ├── card.tsx        # Product & category card base component
        │   ├── modal.tsx       # Generic modal/dialog component
        │   └── toast.tsx       # Feedback notification component
        │
        ├── products/           # Product-specific components
        │   ├── product-card.tsx    # Grid card display (category views)
        │   ├── product-detail.tsx  # Product detail view with variants
        │   ├── variant-selector.tsx # Size/color choice chips/dropdowns
        │   └── price-display.tsx   # Formatted price and discount displays
        │
        ├── cart/               # Cart-related components
        │   ├── cart-drawer.tsx   # Right-side sliding cart modal
        │   ├── cart-item.tsx     # Individual cart line item
        │   └── cart-summary.tsx  # Cart totals & checkout button
        │
        ├── checkout/           # Checkout flow components
        │   ├── checkout-form.tsx # Customer data entry form
        │   ├── order-summary.tsx # Order totals & summary block
        │   └── confirmation.tsx  # Order confirmation display with ID
        │
        └── admin/              # Admin dashboard components
            ├── stats-card.tsx      # Metrics summary cards (orders, revenue, shipments)
            ├── order-table.tsx     # Order lifecycle grid table
            ├── user-grid.tsx       # User access control grid
            ├── product-form.tsx    # Product CRUD form wrapper
            └── status-badge.tsx    # Order status indicator (color-coded)
```

---

## Directory Structure Summary

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `src/app/` | Next.js App Router pages | `page.tsx`, API routes |
| `src/lib/` | Backend logic & connections | DB pool, Ollama bridge |
| `src/hooks/` | Client-side state management | Cart, Auth, Search hooks |
| `src/components/` | Reusable UI modules | Layout, Products, Admin |
| `__tests__/` | Backend & frontend unit tests | Jest test suites |
| `e2e/` | Cross-device integration tests | Playwright specs |
| `supabase/` | Database migrations & seeding | SQL files for schema |

---

## Testing Folder Alignment

| Phase | Test Type | Test Files | Coverage |
|-------|-----------|------------|----------|
| **Phase 1** | Unit/Integration | `__tests__/backend/` | Vector search, seed pipeline, HNSW indexing |
| **Phase 2** | Unit/Integration | `__tests__/backend/rbac-security.test.ts` | Server-side role validation |
| **Phase 3** | Unit/Integration | `__tests__/frontend/cart-logic.test.ts` | Cart state, checkout validation |
| **Phase 4** | E2E | `e2e/responsive-nav.spec.ts`, `search-overlay.spec.ts`, `order-flow.spec.ts` | Desktop vs mobile UI responsiveness |
| **Phase 5** | E2E | `e2e/admin-dashboard.spec.ts` | Role-gating, admin CRUD operations |

---

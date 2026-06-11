# Postgres E-Com: User Guide

A production-grade, local-first e-commerce platform with AI-powered semantic search. All AI runs locally via Ollama — no cloud APIs, no data leaves your machine.

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 13+ with pgvector extension
- Ollama with `nomic-embed-text` model pulled

### Setup

```bash
# Install dependencies
npm install

# Configure environment (edit .env.local to match your setup)
# DATABASE_URL=postgresql://user@host:5433/dbname
# OLLAMA_HOST=http://127.0.0.1:11434

# Run database migrations
psql -h 127.0.0.1 -p 5433 -U user -d dbname -f supabase/migrations/001_initial_schema.sql
psql -h 127.0.0.1 -p 5433 -U user -d dbname -f supabase/migrations/002_profiles_trigger.sql
psql -h 127.0.0.1 -p 5433 -U user -d dbname -f supabase/migrations/003_rbac_function.sql
psql -h 127.0.0.1 -p 5433 -U user -d dbname -f supabase/migrations/004_order_state_machine.sql
psql -h 127.0.0.1 -p 5433 -U user -d dbname -f supabase/migrations/005_custom_auth.sql

# Seed the catalog
psql -h 127.0.0.1 -p 5433 -U user -d dbname -f supabase/seed/001_seed_catalog.sql
bash supabase/seed/002_seed_extended_catalog.sh

# Generate AI embeddings for all products (requires Ollama running)
curl -X POST http://localhost:3000/api/seed

# Start the dev server
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Default Admin Account

After setup, create an admin user:

1. Go to **http://localhost:3000/auth/signup** and register with any email/password
2. Grant admin role via SQL:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('<user-uuid-from-auth.users>', 'admin');
   ```

Alternatively, if the admin user was pre-seeded:
- **Email**: `admin@example.com`
- **Password**: `admin123`

---

## Storefront

### Browsing Products

- **Homepage** (`/`): Hero banner with "Shop Now" and "AI Search" CTAs
- **Category listing** (`/shop`): Shows all 23 categories with product counts
- **Category page** (`/shop/[category]`): Product grid with sort (price asc/desc, name) and price range filter
- **Product detail** (`/products/[id]`): Image, price, description, size/color variant picker, Add to Cart

### AI Semantic Search

The search bar in the header (or press `Cmd+K` / `Ctrl+K`) opens the AI search page at `/search`.

Type natural language queries like:
- "comfortable clothing for summer"
- "items for healthy habits"
- "wireless gadgets"

The search uses Ollama embeddings + pgvector to find semantically similar products. It also does keyword and phrase matching for exact hits.

### Cart

- **Add to Cart**: Select size and color on a product page, then click "Add to Cart"
- **Cart page** (`/cart`): View all items, adjust quantities, remove items, see totals
- **Cart badge**: Shows current item count in the desktop header and mobile bottom nav

### Checkout

1. Go to `/cart` and click "Checkout"
2. Fill in shipping details (name, phone, address, city, pincode)
3. Review order summary
4. Place order (COD only — enforced at database level)
5. You'll receive an order confirmation with a unique `ORD-XXXXXXXX` ID

### Order Flow

Order statuses follow a state machine:
- `pending` → `confirmed` or `cancelled`
- `confirmed` → `shipped` or `cancelled`
- `shipped` → `delivered` or `cancelled`
- `delivered` and `cancelled` are terminal states

---

## Admin Panel

The admin panel at `/admin` requires admin-level access.

### Dashboard (`/admin`)

Shows three metric tiles:
- **Total Orders** (all-time)
- **Revenue** (sum of non-cancelled orders)
- **Pending Shipments** (orders with status `confirmed` ready to ship)

Also provides quick links to all management sections.

### Products Management (`/admin/products`)

- **List**: Table of all products (name, price, category)
- **Create**: Form with name, description, price, category, image URL, and dynamic variant rows (size/color/stock)
- **Edit**: Pre-populated form for any product; add/remove variants
- **Delete**: Remove a product and all its variants
- **Variant stock**: Click "Edit Stock" on any variant to adjust inventory

### Orders Management (`/admin/orders`)

- **List**: Table with Order ID, customer name, total, status badge, date
- **Status update**: Dropdown shows only valid transitions per the state machine (e.g., pending → confirmed or cancelled)
- **Order detail**: Click into an order for more info (placeholder page)

### Users Management (`/admin/users`)

- **List**: All users with display name, email, role badge, join date
- **Grant/Revoke Admin**: Toggle admin privileges for any user
- **Self-protection**: You cannot revoke your own admin role

### Settings (`/admin/settings`)

Placeholder page for future configuration options.

---

## Navigation

### Desktop (width >= 1200px)

- **Header**: Store branding, search bar, and links (Shop, Cart, Account)
- **Admin sidebar**: Fixed left sidebar with "ADMIN ACCESS - VERIFIED" badge + nav links

### Mobile/Tablet (width < 1200px)

- **Condensed header**: Store branding + search icon
- **Bottom nav**: Fixed tray with 4 touch targets: Home, Search, Cart, Account

---

## Theme

"Minimal Obsidian Tech" dark theme:

| Token | Value | Usage |
|---|---|---|
| `#090D16` | Canvas | Page background |
| `#111827` | Container | Cards, sidebar, header |
| `#1F2937` | Border | Dividers, outlines |
| `#F3F4F6` | Text | Body text |
| `#10B981` | Emerald | Primary accent (buttons, links) |
| `#8B5CF6` | Purple | Secondary accent |

---

## Architecture

```
[Browser] ←→ [Next.js App Router (React)]
                   │
              API Routes
              /api/auth/*
              /api/admin/*
              /api/checkout
              /api/ai-search
              /api/seed
                   │
        ┌──────────┼──────────┐
   [PostgreSQL]        [Ollama]
   port 5433           port 11434
   pgvector HNSW       nomic-embed-text
```

- **PostgreSQL**: All data (users, products, orders, embeddings) with pgvector extension for vector similarity search
- **Ollama**: Local AI engine generating 768-dimension embeddings for semantic search
- **Next.js**: Full-stack React framework — server components for pages, API routes for backend logic

### Auth System

Custom implementation using bcrypt password hashing and session tokens (no cloud dependency):
- Passwords hashed with bcrypt (10 rounds)
- Sessions stored in `auth.sessions` table with 7-day expiry
- Session tokens set as httpOnly cookies
- Admin routes gated via `has_role()` database function

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `OLLAMA_HOST` | Ollama service URL |
| `OLLAMA_EMBEDDING_MODEL` | Embedding model name |
| `NEXT_PUBLIC_SUPABASE_URL` | (Legacy — not used for auth) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (Legacy — not used for auth) |

---

## Testing

```bash
# Unit/integration tests
npm test

# End-to-end tests (requires dev server running)
npm run test:e2e
```

---

## Database Migrations

Migrations are in `supabase/migrations/` and should be applied in order:

1. `001_initial_schema.sql` — Core tables, enums, pgvector extension, HNSW index
2. `002_profiles_trigger.sql` — Auto-create profile on user signup
3. `003_rbac_function.sql` — Role-based access control function
4. `004_order_state_machine.sql` — Order status transition enforcement
5. `005_custom_auth.sql` — Custom auth (password_hash, sessions table)

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Admin page redirects to login | Log in as admin first, or grant admin role in DB |
| AI search returns no results | Run `curl -X POST http://localhost:3000/api/seed` to generate embeddings; verify Ollama is running |
| 404 for static assets | Clear `.next` and `node_modules/.cache`, restart dev server |
| DB connection refused | Verify PostgreSQL is running on the configured port with `pg_isready` |
| Cart badge shows stale count | Cart state is shared via React Context — try a hard refresh (Cmd+Shift+R) |

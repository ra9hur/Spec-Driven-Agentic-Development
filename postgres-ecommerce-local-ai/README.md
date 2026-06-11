
## Postgres E-Com (`postgres-ecommerce-local-ai`)

A production-grade, dark-themed e-commerce application powered by open-source, local AI. Integrates semantic vector search via `pgvector` + Ollama, with custom variant management, role-gated admin panels, and a full order lifecycle — all free of third-party cloud API fees.

---

## Design Language: Minimal Obsidian Tech

- Base Canvas Background: Deep Obsidian Midnight (`#090D16`)
- Component Containers: Charcoal Panel (`#111827`)
- Structural Lines & Edges: Thin Deep-Gray Border (`#1F2937`)
- Core Typography: Crisp Off-White Text (`#F3F4F6`)
- Action Triggers & Accents: High-Visibility Neon Mint/Purple (`#10B981` / `#8B5CF6`)

---

## Core System Architecture

- **Frontend Framework**: Next.js 14 (App Router) + React Server Components
- **Styling Framework**: Tailwind CSS 3.4 (responsive breakpoints: sm=640, md=768, lg=1200, xl=1200)
- **Database Engine**: PostgreSQL 13+ with `pgvector` extension + HNSW index
- **Database Access Layer**: Native PostgreSQL Client (`pg`) connection pooling
- **AI Embedding Model**: Local Ollama running `nomic-embed-text` (768 dimensions)
- **Auth**: Custom bcrypt password hashing + session tokens (no cloud dependency)

---

## Project Directory Structure

```text
postgres-ecommerce-local-ai/
├── .env.local                     # Runtime local environment variables
├── package.json                   # Script bindings and dependencies
├── tailwind.config.js             # Design tokens and breakpoints
├── postcss.config.js              # PostCSS with Tailwind plugin
├── jest.config.ts                 # Jest test parameters
├── playwright.config.ts           # Playwright viewport configurations
├── scripts/
│   └── setup.sh                   # One-command setup (PG, DB, seed, admin user)
│
├── supabase/                      # Database migrations and seed data
│   ├── migrations/
│   │   ├── 001_initial_schema.sql # Core tables, pgvector, HNSW index
│   │   ├── 002_profiles_trigger.sql
│   │   ├── 003_rbac_function.sql  # Role-based access control
│   │   ├── 004_order_state_machine.sql
│   │   ├── 005_custom_auth.sql    # Custom auth (bcrypt + sessions)
│   │   └── 006_search_keywords.sql # Search keyword columns
│   └── seed/
│       ├── 001_seed_catalog.sql   # Initial product catalog
│       └── 002_seed_extended_catalog.sh
│
├── __tests__/                     # Unit & Integration Tests (Jest)
│   ├── backend/
│   │   ├── infrastructure.test.ts # PG, pgvector, Ollama checks
│   │   ├── catalog-seed.test.ts   # Embedding concatenation logic
│   │   ├── ai-search.test.ts      # Sub-55ms latency, similarity threshold
│   │   ├── rbac-security.test.ts  # SECURITY DEFINER RBAC checks
│   │   └── cart-order-flow.test.ts# Cart, checkout, order state machine
│   └── frontend/
│       └── cart-logic.test.ts     # Cart calculations, validation
│
├── e2e/                           # Cross-Device E2E Tests (Playwright)
│   ├── auth/                      # Login, signup flows
│   ├── admin-crud.spec.ts         # Products, orders, users management
│   ├── cart-drawer.spec.ts        # Cart interactions
│   ├── checkout-flow.spec.ts      # Checkout validation
│   ├── order-flow.spec.ts         # Order placement and confirmation
│   ├── product-detail.spec.ts     # PDP layout, variants, add-to-cart
│   ├── responsive-nav.spec.ts     # Desktop header vs mobile bottom nav
│   └── search-overlay.spec.ts     # Grid columns, sort, price filter
│
└── src/                           # Production source code
    ├── lib/                       # DB pool, auth, Ollama bridge
    ├── contexts/                  # React Context providers (Cart)
    ├── hooks/                     # Custom React hooks
    ├── components/                # Reusable UI components
    │   ├── layout/                # Header, mobile-nav, search trigger
    │   ├── products/              # Cards, filters, variant selector
    │   ├── cart/                  # Drawer, item, summary
    │   ├── checkout/              # Form, confirmation, order summary
    │   ├── admin/                 # Tables, forms, stats cards
    │   └── shared/                # Button, modal, toast, card
    └── app/                       # Next.js App Router (pages + API routes)
        ├── shop/                  # Category listing, category detail
        ├── products/[id]          # Product detail page
        ├── search/                # AI semantic search
        ├── cart/                  # Cart page
        ├── checkout/              # Checkout form + confirmation
        ├── auth/                  # Login, signup
        ├── admin/                 # Dashboard, products, orders, users
        └── api/                   # REST API routes
            ├── auth/              # signup, login, logout, session
            ├── admin/             # metrics, products, orders, users
            ├── checkout/          # Order placement
            ├── ai-search/         # Semantic search endpoint
            └── seed/              # Embedding generation
```

---

## Quick Start (Recommended)

Run the setup script from the project root:

```bash
bash scripts/setup.sh
```

This handles everything: initializing PostgreSQL, creating the database, running all migrations, fixing the trigger function, seeding the catalog and search keywords, creating the admin user, and installing dependencies. Then start the server:

```bash
npm run dev
```

Open **http://localhost:3000** and log in with:
- **Email:** `admin@example.com`
- **Password:** `admin123`

> **PG data directory:** `./pgdata/` in the project root (persists across reboots).
> To start/stop PostgreSQL independently:
> ```bash
> pg_ctl -D ./pgdata -l ./pgdata/logfile start
> pg_ctl -D ./pgdata stop
> ```

---

## Step-by-Step Manual Setup

### 1. Prerequisites

Node.js 18+, PostgreSQL 13+ with `pgvector` extension, and Ollama installed.

### 2. Clone and Install

```bash
git clone <repo-url>
cd postgres-ecommerce-local-ai
npm install
```

### 3. Configure Environment

Edit `.env.local` with your connection details. The project uses port **5433** to avoid conflicting with a system PostgreSQL instance on port 5432:

```ini
# PostgreSQL Connection
DATABASE_URL=postgresql://your_user@127.0.0.1:5433/your_database_name

# Ollama Configuration
OLLAMA_HOST=http://127.0.0.1:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# Application
NODE_ENV=development
```

> **Note:** If your PostgreSQL runs on a different port, update `5433` accordingly.

### 4. Set Up the PostgreSQL Data Directory

Create a dedicated PostgreSQL cluster for the project (data persists here, not in `/tmp`):

```bash
# Find the PostgreSQL binary directory
PG_BINDIR=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | head -1)

# Initialize a new cluster in the project directory
$PG_BINDIR/initdb -D ./pgdata --auth=trust --username=your_user

# Configure port and socket
echo "port = 5433" >> ./pgdata/postgresql.conf
echo "unix_socket_directories = '/tmp'" >> ./pgdata/postgresql.conf

# Start PostgreSQL
$PG_BINDIR/pg_ctl -D ./pgdata -l ./pgdata/logfile start
sleep 2
```

### 5. Set Up the AI Embedding Engine

```bash
ollama pull nomic-embed-text
```

Verify Ollama is running on `127.0.0.1:11434`.

### 6. Create the Database

```bash
createdb -h 127.0.0.1 -p 5433 -U your_user your_database_name
```

Enable pgvector:
```bash
psql -h 127.0.0.1 -p 5433 -U your_user -d your_database_name -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### 7. Create the `auth` Schema (Required Before Migrations)

The migrations reference `auth.users` (from Supabase Auth). Since this project uses a custom auth system instead of Supabase, you must create the `auth` schema and `auth.users` table **before** running migrations:

```bash
psql -h 127.0.0.1 -p 5433 -U your_user -d your_database_name <<'EOF'
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  password_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
EOF
```

> **Why this is needed:** Migrations `001_initial_schema.sql` and `002_profiles_trigger.sql` create tables with foreign keys referencing `auth.users(id)`. Without this step, they will fail with `schema "auth" does not exist`.

### 8. Run All Migrations

There are **6 migrations** that must be run in order:

```bash
for f in supabase/migrations/00*.sql; do
  echo "Running $(basename $f)..."
  psql -h 127.0.0.1 -p 5433 -U your_user -d your_database_name -f "$f"
done
```

Or run them individually:

```bash
psql -h 127.0.0.1 -p 5433 -U your_user -d your_database_name -f supabase/migrations/001_initial_schema.sql
psql -h 127.0.0.1 -p 5433 -U your_user -d your_database_name -f supabase/migrations/002_profiles_trigger.sql
psql -h 127.0.0.1 -p 5433 -U your_user -d your_database_name -f supabase/migrations/003_rbac_function.sql
psql -h 127.0.0.1 -p 5433 -U your_user -d your_database_name -f supabase/migrations/004_order_state_machine.sql
psql -h 127.0.0.1 -p 5433 -U your_user -d your_database_name -f supabase/migrations/005_custom_auth.sql
psql -h 127.0.0.1 -p 5433 -U your_user -d your_database_name -f supabase/migrations/006_search_keywords.sql
```

### 9. Fix the `handle_new_user` Trigger

Migration `002_profiles_trigger.sql` creates a trigger function referencing `NEW.raw_user_meta_data` — a Supabase-specific column that doesn't exist in our custom `auth.users` table. Replace it with a version that uses `NEW.email` instead:

```bash
psql -h 127.0.0.1 -p 5433 -U your_user -d your_database_name <<'EOF'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, phone, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, 'User'),
    NULL,
    NULL
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
EOF
```

### 10. Seed the Catalog

```bash
psql -h 127.0.0.1 -p 5433 -U your_user -d your_database_name -f supabase/seed/001_seed_catalog.sql
bash supabase/seed/002_seed_extended_catalog.sh
```

### 11. Seed Search Keywords

Set up search terms so queries like "pet food" return accurate results (the hybrid search engine uses phrase matching for multi-word queries and keyword matching for single-word queries):

```bash
psql -h 127.0.0.1 -p 5433 -U your_user -d your_database_name <<'EOF'
-- Reset all keywords
UPDATE products SET search_keywords = NULL, search_phrases = NULL;

-- Pet Supplies: 'pet food' is a phrase match on the treat toy only
UPDATE products SET search_phrases = 'pet food' WHERE id = 38;
UPDATE products SET search_keywords = 'cat tree scratching post hammock feline climbing' WHERE id = 36;
UPDATE products SET search_keywords = 'dog bed sleeping orthopedic memory foam canine' WHERE id = 37;
UPDATE products SET search_keywords = 'toy treat puzzle feeder interactive mental stimulation' WHERE id = 38;

-- Gourmet Food
UPDATE products SET search_keywords = 'coffee beans artisan gourmet drink beverage' WHERE id = 39;
UPDATE products SET search_keywords = 'chocolate gift dessert sweet gourmet candy truffle' WHERE id = 40;
UPDATE products SET search_keywords = 'honey organic natural sweetener gourmet' WHERE id = 41;

-- Kitchen
UPDATE products SET search_keywords = 'kitchen cooking chef knife cutlery prep' WHERE id = 63;
UPDATE products SET search_keywords = 'kitchen cooking pan cookware nonstick frying' WHERE id = 64;
UPDATE products SET search_keywords = 'kitchen chopping slicing mixing appliance processor' WHERE id = 65;
EOF
```

> **Design rationale:** Multi-word queries like "pet food" use **phrase matching** — only products with that exact phrase in `search_phrases` match. Single-word queries like "pet" or "food" use **keyword matching** against `search_keywords`. Individual words "pet" and "food" never overlap between product groups to prevent false positives.

### 12. Generate Product Embeddings

With the dev server running, generate embeddings for all products via Ollama (required for AI search to work):

```bash
curl -X POST http://localhost:3000/api/seed
```

Alternatively, embeddings are generated automatically by the `002_seed_extended_catalog.sh` script if Ollama is running at seed time.

### 13. Create an Admin User

From the signup page at **http://localhost:3000/auth/signup**, register a new account. Then grant the admin role:

```bash
psql -h 127.0.0.1 -p 5433 -U your_user -d your_database_name <<'EOF'
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.user_role_enum
FROM auth.users
WHERE email = 'your-registered-email@example.com';
EOF
```

**Pre-seeded admin account** (available if you ran the setup script):
- Email: `admin@example.com`
- Password: `admin123`

### 14. Start the Dev Server

```bash
npm run dev
# Opens at http://localhost:3000
```

### 15. Verify PostgreSQL Persists After Reboot

The data directory `./pgdata/` lives in the project folder, so it does **not** get wiped on reboot. To start PostgreSQL after a reboot:

```bash
pg_ctl -D ./pgdata -l ./pgdata/logfile start
```

---

## Testing

### 1. Unit & Backend Integration Tests (Jest — 86 tests)

Validates database schema, AI endpoint latency, RBAC, cart logic, and order state machine:

```bash
npm run test

# Run a specific test file
npm test __tests__/backend/ai-search.test.ts
```

### 2. Cross-Device E2E Tests (Playwright — 159 tests)

Evaluates components against emulated Desktop Chrome, iPhone iOS, and Pixel Android viewports:

```bash
npx playwright install
npm run test:e2e

# Open the interactive HTML report
npx playwright test --ui
```

---

## Traceability & Success Indicators

- **REQ-10 to REQ-14 (AI Search)**: Enforces minimum cosine similarity threshold of `0.2` and validates sub-55ms query latency.
- **REQ-17 & REQ-18 (Admin Gating)**: Rejects unauthorized admin path requests via server-side `getServerSession()` and a `SECURITY DEFINER` `has_role()` database function.
- **REQ-22 (Order State Machine)**: Order status progression enforced by PostgreSQL trigger — `pending→confirmed|cancelled→shipped|cancelled→delivered|cancelled`.
- **REQ-30 & REQ-40 (Responsive Layout)**: 4-column product grid collapses to 2-column on mobile; admin metrics stack vertically.

---

## Auth System

Authentication uses a custom implementation (no cloud dependency):

- Passwords hashed with **bcrypt** (10 rounds)
- Sessions stored in `auth.sessions` with **7-day expiry**
- Session tokens set as **httpOnly cookies**
- Admin routes gated via `has_role()` DB function
- Replaced Supabase Auth — no third-party auth service required

---

## Troubleshooting

| Problem | Fix |
|---|---|---|
| Admin page redirects to login | Log in first, then grant admin role in DB |
| AI search returns no results | Ensure Ollama is running; run `curl -X POST http://localhost:3000/api/seed` |
| `auth.uid()` function does not exist | Migration `005_custom_auth.sql` creates a stub — ensure it was run |
| `schema "auth" does not exist` when running migrations | Create the `auth` schema and `auth.users` table before running migrations (see step 4 of setup) |
| `raw_user_meta_data` does not exist in trigger | Replace the `handle_new_user` trigger function (see step 6 of setup) |
| Ollama connection refused | Use `127.0.0.1` instead of `localhost` (IPv6 vs IPv4) |
| 404 for static CSS/JS | Run `rm -rf .next node_modules/.cache`, restart dev server |
| Cart badge shows stale count | Hard refresh (Cmd+Shift+R) — state is in React Context |
| DB connection refused on port 5433 | Start PostgreSQL: `pg_ctl -D ./pgdata -l ./pgdata/logfile start` |
| All data lost after reboot | PG data lives in `./pgdata/` — if using a temp directory, re-run `bash scripts/setup.sh` |

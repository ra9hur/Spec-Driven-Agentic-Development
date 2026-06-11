
---

## System Architecture Document

## Project Name: Postgres E-Com (`postgres-ecommerce-local-ai`)

```unset
                      +---------------------------------------+

                      |           CLIENT VIEWPORT             |
                      |   (Next.js Responsive Storefront)     |
                      +───────────────────┬───────────────────+
                                          │
                                   HTTP REST / JSON
                                          │
                                          ▼
                      +---------------------------------------+

                      |         NEXT.JS CORE SERVER           |
                      |          (Node.js Runtime)            |
                      +───┬───────────────────────────────┬───+
                          │                               │
             Internal HTTP (Port 11434)             Native TCP (Pool)
                          │                               │
                          ▼                               ▼
     +----------------─────────────────────────+  +───────────────────────────────+

     |             OLLAMA ENGINE               |  |       POSTGRESQL CLUSTER      |
     |        (nomic-embed-text:768)           |  |      (pgvector + HNSW Index)  |
     +-----------------------------------------+  +-------------------------------+
```

---

## 1. System Topology & Tier Architecture

The application runs a three-tier local infrastructure architecture designed to prevent variable cloud token usage or external database processing overhead fees.

## Client Presentation Layer

- Framework: Next.js App Router workspace utilizing React Server Components (RSC) to handle baseline view rendering.
- UI Engine: Tailwind CSS utilizing explicit breakpoints (`sm:640px`, `md:768px`, `lg:1200px`, `xl:1200px+`) to drive the Minimal Obsidian Tech design engine across desktop and smartphone targets.

## Application Services Layer

- Runtime: Node.js execution environment embedded within Next.js API Routes.
- Integration Interface: Standard REST HTTP handlers executing operations at `/api/ai-search`, `/api/seed`, and auth check pathways.
- Local AI Bridge: Internal HTTP client hitting `http://localhost:11434` for sub-60ms vector generation.

## Data Storage & Intelligence Layer

- Database: PostgreSQL (v13+) engine hosting relational entities and the open-source `pgvector` index configuration.
- Connection Lifecycle: Persistent connection pools managed through native client drivers (`pg`) or Prisma ORM layer to ensure minimal handshake delays under load.

---

## 2. Component Interaction & Core Data Workflows

## 2.1 Contextual AI Semantic Search Execution (`REQ-10` to `REQ-14`)

When a user searches the catalog using conversational language, the system bypasses string comparisons and instead evaluates mathematical coordinates:

```unset
[Client App] --(POST "healthy habits")--> [Next.js Route: /api/ai-search]
                                                   │
                                     Internal HTTP Request (Port 11434)
                                                   ▼
                                         [Ollama Local Engine]
                                                   │
                                     Returns float32[768] Array
                                                   ▼
[PostgreSQL Database] <--(SQL Cosine Match)-- [Next.js Route]
         │
  HNSW Index Scan
         │
         ▼
Filters Score < 0.2 ───> JSON Payloads Returned ───> [Responsive Grid View]
```

## 2.2 Relational Ingestion & Vector Construction (`REQ-7` to `REQ-9`)

To maintain precise inventory data and prevent searching out-of-stock items, the setup strings specific option items together before running calculations:

```unset
[Admin Entry Action] ───> [Variant Mapper Engine]
                                   │
                                   ▼
              Concatenates Strings into Uniform Text Block:
 "Title: Eco Bottle | Desc: Gym shaker | Category: Mugs | Color: Neon Green"
                                   │
                                   ▼
                     [Local Ollama API Ingestion]
                                   │
                        Calculates 768 Dimensions
                                   │
                                   ▼
             [Inserts Raw Data Row + Active Vector Layout]
```

---

## 3. Storage Definitions & Security Schema

The schema layout maps traditional relational database normalization directly alongside modern AI vector array attributes.

## Database Tables and Structural Constraints

```sql
-- 1. Identity & Profiles Management Setup
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Access Control Security Gating
CREATE TYPE user_role_enum AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role_enum NOT NULL DEFAULT 'user',
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- 3. Core Store Catalog Entities
CREATE TABLE public.categories (
    id BIGSERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

CREATE TABLE public.products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
    image_url TEXT,
    embedding vector(768)
);

CREATE TABLE public.product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0
);

-- 4. Checkout Transactional Architecture
CREATE TYPE order_status_enum AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');

CREATE TABLE public.orders (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    total NUMERIC(10,2) NOT NULL,
    status order_status_enum NOT NULL DEFAULT 'pending',
    shipping_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    pincode TEXT NOT NULL,
    notes TEXT,
    payment_method TEXT NOT NULL DEFAULT 'COD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE public.order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    variant_id BIGINT REFERENCES public.product_variants(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase NUMERIC(10,2) NOT NULL
);
```

---

## 4. Technical Gating & Privilege Validations (`REQ-17` to `REQ-18`)

Client-side JavaScript security checks are vulnerable to manipulation. To guarantee protection against privilege escalation attacks on the responsive admin dashboard panel, user validation handles checks directly inside a database-level configuration wrapper:

```sql
CREATE OR REPLACE FUNCTION public.has_role(target_role user_role_enum)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = target_role
  );
END;
$$ LANGUAGE plpgsql;
```

---

## 5. Database Trigger for Profile Auto-Creation (`REQ-16`)

To ensure the `profiles` table automatically populates with user data upon signup, the following trigger function is required:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, phone, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NULL,
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## 6. High-Performance Optimization Tuning (`REQ-4`)

To maintain response times under the 55ms threshold when working with large inventories, standard linear scans are bypassed using an HNSW index utilizing Cosine distance calculations:

```sql
CREATE INDEX products_embedding_hnsw_idx 
ON public.products 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

---

## 7. Viewport Breakpoint & Layout Configuration Matrix

To make sure your components behave exactly as outlined in Phase 4 of the PRD across different screen resolutions, the UI layer runs a strict utility layout ruleset:

```unset
┌───────────────────────────────┬────────────────────────────────────────────────────────┐
│ Target Screen Class           │ Target CSS Utility Flag Strategy                       │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ Mobile (iPhone / Android)     │ Default styles (e.g., width: 100%, grid-cols-2).       │
│ < 768px                       │ Activates sticky baseline mobile navigation navbar.    │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ Tablet Screen Viewports       │ Triggered via `md:` descriptor.                        │
│ 768px - 1199px                │ Transitions grids to 3-columns; expands sidebar views. │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ Desktop Workspace Viewports   │ Triggered via `lg:` & `xl:` flags.                     │
│ 1200px+                       │ Locks main upper navigation container view.            │
│                               │ Expands product index grids into a wide 4-column span. │
└───────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 8. Error Handling & Ollama Service Resilience

To ensure robust operation when the Ollama local service is unavailable or slow, implement the following patterns:

- Connection timeout: 3000ms maximum for Ollama API requests
- Fallback mechanism: Return empty search results with warning if Ollama timeout occurs
- Health check endpoint at `/api/health/verify-ollama` to validate service status
- Automatic retry logic (max 2 attempts) for transient connection errors
- Logging of Ollama latency metrics for performance monitoring

---


---
## Detailed Design Plan: Phase 1 (Local AI & Database Core)

## Target Requirements: REQ-1 to REQ-14

---

## Component 1: Core Database Layer & Open-Source Vector Storage

- Requirements Covered: REQ-1, REQ-2, REQ-3, REQ-4
- Role: Principal Database Architect / Infrastructure Engineer.
- Task: Provision the baseline storage layer, enable semantic vector mathematics capabilities, and establish high-speed performance data structures.
- Context: Traditional keyword text matching fails to surface relevant items when buyers search using conversational context or typos. This core layer transforms a relational database schema into a vector-aware cluster to handle local natural language lookups without cloud licensing fees.
- Constraints:
    
    - Must run locally on an open-source PostgreSQL (v13+) cluster setup [REQ-1].
    - The `pgvector` extension must be explicitly initialized and enabled in the active cluster [REQ-2].
    - Must implement the full relational schema tables (`profiles`, `user_roles`, `categories`, `products`, `product_variants`, `orders`, `order_items`) with appropriate foreign key cascade relationships [REQ-3].
    - Traditional sequential table scanning is strictly forbidden for vector matches; lookups must run through an asymmetric HNSW (Hierarchical Navigable Small World) indexed path mounted on the `products.embedding` column tuned for Cosine Distance (`vector_cosine_ops`) operators [REQ-4].
    
- Format: Raw SQL Data Definition Language (DDL) migration scripts (`supabase/migrations/001_initial_schema.sql`).
- Acceptance Criteria:
    
    - The database engine boots successfully, runs on PostgreSQL v13+, and registers the `pgvector` extension.
    - Executing a vector lookup utilizes the HNSW index path rather than falling back to a linear sequential table scan.
    - Database health integration checks confirm that schema relationship definitions enforce cascading deletes on all nested product variant attributes.
    - Database schema contains all 7 tables: `profiles`, `user_roles`, `categories`, `products`, `product_variants`, `orders`, `order_items`.
    - The `products.embedding` column is defined as `vector(768)` and an HNSW index using `vector_cosine_ops` is attached.
    

---

## Component 2: Local AI Vector Embedding Bridge Engine

- Requirements Covered: REQ-5, REQ-6, REQ-9
- Role: Senior AI / Backend Engineer.
- Task: Build a local system connection utility that translates alphanumeric product metadata blocks and human search queries into mathematical coordinates.
- Context: Next.js API routes require a low-latency pipeline to generate text embeddings. This utility creates an internal network bridge to communicate with a local background AI service, eliminating external third-party API subscription costs and data privacy exposure risks.
- Constraints:
    
    - Must run exclusively as an offline, persistent background process hosting the `nomic-embed-text` open-source model [REQ-6].
    - Connection configurations must bind tightly to internal network protocols over a dedicated port (`http://localhost:11434`) [REQ-5].
    - Any array payload length that does not output exactly 768 elements per record must trigger a hard execution failure and halt the pipeline [REQ-9]. (Currently enforced by the database column type `vector(768)` — no explicit TypeScript-side length guard exists in `src/lib/ollama.ts`.)
    
- Format: Immutable structural TypeScript helper function definitions (`src/lib/ollama.ts`).
- Acceptance Criteria:
    
    - The service successfully intercepts raw strings, strips out breaking whitespace noise, and returns a verified array of 768 floating-point coordinates.
    - Integration test suites confirm that system network timeouts drop and disconnect safely if the underlying Ollama local process goes offline.
    

---

## Component 3: Catalog Data Ingestion & Variant Aggregation Pipeline

- Requirements Covered: REQ-7, REQ-8, REQ-9
- Role: Lead Backend Engineer.
- Task: Design and implement a data ingestion endpoint at `/api/seed` that builds catalog vectors.
- Context: Administrators need to save newly added or edited products into the system. The system must capture standard relational data fields alongside variant parameters (such as sizes and color variations) and group them into a single coherent text block before generating the vector to ensure accurate search discovery.
- Constraints:
    
    - The route must be a POST handler exposed via Next.js App Router routing at `/api/seed` [REQ-7]. (No authentication is currently implemented on this endpoint.)
    - The ingestion pipeline must combine product title, description, category, and all associated variant parameters (size, color strings) into a uniform string payload before requesting the vector mapping [REQ-8].
    - Data updates must execute inside a strict SQL Transaction block (`BEGIN` / `COMMIT`); any variant mapping failure must trigger an immediate rollback to prevent database corruption. (The current implementation at `src/app/api/seed/route.ts` does NOT wrap operations in a transaction — each product is updated individually.)
    
- Format: Next.js REST API route controllers (`src/app/api/seed/route.ts`) and TypeScript input-validation payload schemas.
- Acceptance Criteria:
    
    - The route correctly aggregates product metadata strings—formatting them exactly into a uniform string blueprint: `Title: [name] | Description: [desc] | Category: [category_id] | Variants: [variants]`. Note: the actual implementation uses the numeric `category_id` foreign key rather than the category slug/name string.
    - The database successfully saves calculated outputs in a dedicated relational vector column format containing exactly 768 elements per record.
    

---

## Component 4: Contextual Semantic AI Search Pipeline

- Requirements Covered: REQ-10, REQ-11, REQ-12, REQ-13, REQ-14
- Role: High-Performance API Engineer.
- Task: Design and deploy the core product discovery search endpoint at `/api/ai-search`.
- Context: This endpoint processes natural language queries entered by shoppers, converts the text into a vector coordinate map via the local AI engine, and runs an optimized mathematical distance check against the product catalog to return contextual matches.
- Constraints:
    
    - The system must expose a POST endpoint configuration containing JSON bodies at `/api/ai-search` [REQ-10]. (No authentication is currently implemented on this endpoint.)
    - Incoming text query parameters must convert into vector values by querying the local Ollama gateway model [REQ-11].
    - Queries must pass vector parameters directly into an SQL operation executing Cosine Distance (`<=>`) comparison matching against the indexed vector column [REQ-12].
    - Must enforce a hard mathematical similarity boundary filtering out all values below a score of `0.2` using the derived similarity metric calculation: `(1 - (embedding <=> input_vector))` [REQ-13].
    - Total transaction latency from initial client request entry to final database JSON emission must stay under 55 milliseconds on average [REQ-14]. (The PRD specifies 60ms as the target; the current test in `ai-search.test.ts` asserts <55ms but calls the POST handler directly without network or database, so the assertion is not meaningful.)
    
- Format: Performance-tuned Next.js App Router API route handlers (`src/app/api/ai-search/route.ts`) tracking execution timers.
- Acceptance Criteria:
    
    - Conversational phrases with typos (e.g., `"warm clotes for cold days"`) return relevant inventory entries (like heavy hoodies) instead of throwing empty search states.
    - The response returns a JSON object with a `results` array containing matching products with `id`, `name`, `description`, `price`, `image_url`, and `similarity` fields.
    

---

## Component 5: Phase 1 Infrastructure Automation Test Specifications

- Requirements Covered: Maps to verification validation for REQ-1 through REQ-14
- Role: Quality Assurance Automation Engineer.
- Task: Develop integration and performance validation test configurations to verify backend mechanics before building frontend UI view components.
- Context: To support sequential development, this module provides the testing tools to verify database constraints, local embedding model connections, and search latency.
- Constraints:
    
    - Must run within a local isolated environment via Jest [REQ-14].
    - Must use explicit mock structures to decouple local endpoint runtime tests from active network reliance. (Note: current tests directly hit the live database via `pool.query` and the live Ollama service via HTTP fetch — no mock structures are used.)
    
- Format: Automated TypeScript test spec suites:
  - `__tests__/backend/infrastructure.test.ts` (TEST-103, TEST-104)
  - `__tests__/backend/catalog-seed.test.ts` (TEST-101, TEST-107)
  - `__tests__/backend/ai-search.test.ts` (TEST-102, TEST-105, TEST-106)

- Test Inventory:

    - **TEST-101**: Seed pipeline concatenation & 768-dim embedding — implemented as unit/integration test in `catalog-seed.test.ts`. Covers: string concatenation format, 768-dimension generation, zero variants, special characters, 50+ variants. [REQ-7 to REQ-9]

    - **TEST-102**: Sub-55ms search & similarity threshold — implemented in `ai-search.test.ts`. Covers: latency assertion (<55ms), similarity >= 0.2 filter. Note: latency test calls handler directly (no network/DB), giving a false positive. [REQ-10 to REQ-14]

    - **TEST-103**: Database cluster & extension verification — implemented in `infrastructure.test.ts`. Covers: PostgreSQL v13+, pgvector extension, 7 tables, HNSW index. Note: the `vector(768)` column type assertion is buggy (queries `column_name` but doesn't select it). [REQ-1 to REQ-4]

    - **TEST-104**: Ollama service availability — implemented in `infrastructure.test.ts`. Covers: endpoint reachable, `nomic-embed-text` loaded, 768-dim embedding, empty string handling, timeout rejection. [REQ-5, REQ-6]

    - **TEST-105**: Search security & malformed inputs — implemented in `ai-search.test.ts`. Covers: SQL injection, XSS, long queries, whitespace-only, non-string types, missing/empty query. Note: SQL injection test expects 200 (not 400 as the upstream Test Specification requires) because the endpoint processes it as a normal search via parameterized queries. [REQ-10 to REQ-13]

    - **TEST-106**: Ollama service degradation — partially implemented in `infrastructure.test.ts`. Covers: connection timeout only. Missing tests for malformed embedding (wrong dimensions) and null/non-JSON response. [REQ-5, REQ-11]

    - **TEST-107**: Seed pipeline resilience — partially implemented in `catalog-seed.test.ts`. Covers: zero variants, special characters, 50+ variants. Missing tests for: empty name/description validation rejection, and duplicate seeding idempotency. [REQ-7, REQ-8]
    

---


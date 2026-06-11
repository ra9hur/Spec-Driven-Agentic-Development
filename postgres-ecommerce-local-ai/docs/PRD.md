
---
## Project Name: Postgres E-Com

Development Tag: `postgres-ecommerce-local-ai`  
Status: Baseline Master Document (Frozen for Implementation)

---

## Project Overview & High-Level Summary

This project focuses on building a highly responsive, modern, production-grade e-commerce application powered by open-source, local Artificial Intelligence. Moving away from rigid keyword-reliant traditional searches, expensive cloud APIs, and proprietary database licensing, this platform integrates semantic vector intelligence directly into a free, open-source local database architecture via Ollama. This provides customers with intuitive, conversational product discovery and data privacy alongside standard e-commerce features.

The application delivers a streamlined checkout workflow matched with an intelligent product search engine. By transforming a standard relational database into a vector-aware system powered by an onsite Ollama engine and open-source database extensions, it enables natural language querying. For example, matching a query like “items for healthy habits” directly with relevant workout mats or weights. This system operates completely free of API usage or software licensing costs while maintaining high vector-matching processing speeds.

---

## Problem Statement

Traditional e-commerce platforms rely heavily on exact text matches or standard regex operators. This causes several user friction points:

- Misspelled searches display empty error states instead of finding the intended item.
- Shoppers searching by contextual use cases (such as “clothes for a dinner party”) get zero results if the word “dinner” isn’t explicitly typed in the product description.
- Standard developer solutions depend on external cloud AI APIs that introduce variable subscription billing, network data privacy risks, and vendor lock-in.
- Existing local vector configurations require proprietary enterprise licenses or cloud-only runtimes to execute vector pipelines locally.

---

## Goals and Objectives

- Achieve Local Semantic Clarity: Successfully process human text descriptions and return matching items based on contextual meaning using open-source models.
- Low Search Latency: Maintain database vector pipeline speeds under 60 milliseconds.
- Zero-Cost Scaling: Avoid pay-per-token AI structures and proprietary local database runtime fees to allow infinite local catalog updates and search indexing cycles.
- Automated Cataloging: Automatically convert newly seeded or added items into indexed, searchable vectors using an offline background service.
- Cross-Device Fluidity: Deliver an identical feature set optimized cleanly across desktop viewports, iPhone, and Android screens via standard breakpoint grids.

---

## Scope & Out of Scope

## In Scope

## Core Framework & Design System (Minimal Obsidian Tech)

- Next.js multi-page environment featuring full App Router routing.
- Theme Specification: The entire application strictly implements a minimalist dark theme. The canvas sits on a deep obsidian background (`#090D16`), using structured charcoal component containers (`#111827`), thin deep-gray structural division borders (`#1F2937`), and high-visibility neon accent triggers (`#10B981` or `#8B5CF6`) for interactive elements.
- Device-Agnostic Responsive UI: Fully fluid layouts tailored for Desktop (1200px+), Tablet (768px+), and Mobile devices (iPhone and Android native viewports).
- Adaptive Navigation Architecture:
    
    - _Desktop layout:_ Full-width horizontal header containing logo, a centered persistent AI search bar featuring a monospaced shortcut prompt (`[Press ⌘K to ask AI]`), and direct desktop text-links to Shop, Cart, and Account.
    - _Mobile layout:_ Condensed upper header showing only the store emblem and an expandable magnifying glass trigger icon, paired with a thumb-accessible sticky mobile bottom navigation bar (`[Home]` / `[Search]` / `[Cart]` / `[Account]`).
    

## AI-Powered Storefront (Desktop & Mobile Adaptive)

- Homepage: Screen-optimized borderless hero banner, featured products grid, and category tiles (T-shirts, Hoodies, Mugs).
- Category Grid Pages: Dynamic multi-column layout scaling from an expansive 4-column borderless grid on desktop down to a clean, vertical 2-column image stack on iPhone/Android screens. Includes responsive interactive UI components to sort products and filter by price.
- Product Detail Page: Dual-column layout on desktop stacking vertically on mobile. Features crisp, borderless image displays (using dark background image assets to look fully integrated into the canvas), variant choice dropdowns/chips (size, color), price labels, quantity counters, and an "Add to Cart" button.
- Cart Management: High-performance cart state. Displays as a smooth, slide-out right-side Cart Drawer for immediate feedback on both desktop and mobile layouts, leading into a dedicated Checkout Page.
- Checkout & Order Capture: Validates that the cart is not empty. Collects buyer metrics via a responsive checkout details collector: Name, Phone, Full Address, City, Pincode, and Order Notes. Places standard Cash on Delivery (COD) orders.
    
    - _Viewport layouts:_ Implements a side-by-side split view on desktop (Form on left, sticky order summary on right) that stacks into a singular vertical layout on mobile screens.
    
- Order Confirmation Screen: Displays a confirmation notice including the unique Order ID instantly upon database registration.

## Role-Gated Admin Dashboard

A fully responsive dashboard mirroring a structured workspace application that remains functional if accessed on mobile browsers. Gated via server-side role validation:

- Layout Topology: Left-side fixed administrative sidebar console displaying active role confirmation markers (`[ ADMIN ACCESS - VERIFIED ]`) and vertical directory links, paired with a wide right-side main administrative workbench.
- Overview Screen: Displays three high-level business health metric tiles showing total orders, total revenue (sum of active COD transactions), and pending shipments. These tiles align side-by-side on desktop but stack vertically on mobile layouts.
- Inventory & Variants Management: Full CRUD interface to create, edit, or delete items. Supports variant entry creation, individual variant stock levels tracking, and image uploads.
- Order Lifecycle State Machine: System interface utilizing structured data tables with clean horizontal division lines (no harsh grid boxes) to view order entries and update fulfillment status flags through a strict linear lifecycle: `Pending` → `Confirmed` → `Shipped` → `Delivered` → `Cancelled`.
- User Registry Access: High-level list containing system users with manual capability to toggle/revoke administrator status permissions.

## Backend Engine & Pipelines

- Automated text-to-vector embedding processing for catalog ingestion using local Ollama endpoints.
- Local PostgreSQL relational database with the open-source `pgvector` extension utilizing a 768-dimension configuration.
- HNSW (Hierarchical Navigable Small World) database indexing for highly optimized local mathematical queries.

## Out of Scope

- Live production payment gateway integration (such as Stripe or Razorpay API handling).
- Multi-vendor multi-tenant user access management.
- Real-time package logistics, delivery tracking, and courier API linkups.

---

## Assumptions, Dependencies, & Risks

## Assumptions

- Store inventory will have clear description details to generate high-quality text embeddings.
- Users will search using standard alphanumeric input phrases.

## Dependencies

- Active Ollama Background Service: The server environment must continuously run Ollama hosting the `nomic-embed-text` model over port 11434.
- Local PostgreSQL Instance: Requires a locally installed PostgreSQL database cluster (v13+) with the `pgvector` extension active.

## Risks

- Hardware Compute Constraints: Heavy local database seeding cycles or concurrent search requests generate high CPU usage on the host server.
- Resource Contention: Sharing hardware resources between the Next.js runtime, PostgreSQL engine, and the Ollama model execution layer can degrade response performance under peak loads.
- Asynchronous Embedding Desync: If an administrator creates or edits a product variant (such as adding a new color option) in the Admin Dashboard, the search catalog embedding must regenerate to avoid missing matching variant queries.

---

## Functional Requirements

## Search Engine

- The system must expose a POST endpoint at `/api/ai-search`.
- Incoming text query parameters must convert into vector values by querying the local Ollama gateway model.
- Queries must pass vector parameters directly into an SQL operation executing Cosine Distance (`<=>`) comparison matching against the indexed vector column.
- Results must filter out items with a derived similarity metric (1 - Cosine Distance) below a score of 0.2.

## Catalog Pipeline

- The system must expose a data seeding endpoint at `/api/seed`.
- The ingestion pipeline must combine title, description, category, and all associated variant parameters (size, color strings) into a uniform string before passing it to the local vector engine to ensure accurate variant discovery.
- The database must save calculated outputs in a dedicated relational vector column format containing exactly 768 elements per record.

## Authentication & Authorization

- Provides secure Email/Password signup and login logic.
- Role-Based Access Security: Admin dashboard routes must remain gated. Security checks must execute server-side via a security-definer database function to check user roles, protecting the system against client-side privilege escalation.
- A `profiles` table must automatically populate via a database trigger immediately upon a successful user creation event.

## Cart & Orders

- The checkout handler must validate that the cart is not empty before allowing order entry submission.
- The order function must clear out active frontend cart states upon successful database registration.
- New database logs must default to a status of pending.

---

## Target Data Model (Relational Schema)

|Table Name|Core Fields & Constraints|Description|
|---|---|---|
|`profiles`|`id` (FK → auth users), `display_name`, `phone`, `avatar_url`|Maps authentication credentials to user details.|
|`user_roles`|`user_id` (FK), `role` (`admin` \| `user`)|Stores security access levels for role gating.|
|`categories`|`id` (PK), `slug` (unique text string), `name`|Houses high-level product classifications.|
|`products`|`id` (PK), `name`, `description`, `price`, `category_id` (FK), `image_url`, `embedding` (`vector(768)`)|Houses base product information and AI search vector fields.|
|`product_variants`|`id` (PK), `product_id` (FK), `size` (text), `color` (text), `stock` (integer)|Tracks specific size and color combinations and inventory depths.|
|`orders`|`id` (PK), `user_id` (FK), `total`, `status` (enum text), `shipping_name`, `phone`, `address`, `city`, `pincode`, `notes`, `payment_method` (defaults to 'COD'), `created_at`|Maps delivery logistics information and transaction context.|
|`order_items`|`id` (PK), `order_id` (FK), `variant_id` (FK), `quantity`, `price_at_purchase`|Preserves structural order records including immutable snapshot pricing.|

---

## Target Technical Landscape

- Framework Architecture: Next.js App Router workspace utilizing React Compiler settings.
- Storage Framework: PostgreSQL database configured with the `pgvector` extension tracking a 768-dimension HNSW index.
- Database Access Layer: Native PostgreSQL clients (`pg pool`) or Prisma ORM to execute SQL semantic queries.
- Model Integration: Local Ollama backend background service executing the `nomic-embed-text` embedding engine over port 11434.

---

## Success Metrics

- Search Response Speeds: Maintain average local vector search responses under 55 milliseconds.
- Search Relevance: Ensure relevant contextual fallback matches for 100% of user queries containing typos or synonyms.
- Resource Utilization: Ensure local embedding creation spikes do not exceed host server memory overhead caps during background database updates.
- Cost Control: Maintain $0 software licensing and infrastructure overhead fees for the database search engine.

---

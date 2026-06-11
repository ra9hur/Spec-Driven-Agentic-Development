
---

## Phase 1: Database & AI Core Infrastructure (Backend Testing First)

## 1.1 Core Database Layer

- REQ-1: Provision a local PostgreSQL database cluster (v13+).
- REQ-2: Initialize and enable the open-source `pgvector` extension in the database cluster.
- REQ-3: Implement the relational schema matching the target data model exactly (`profiles`, `user_roles`, `categories`, `products`, `product_variants`, `orders`, `order_items`).
- REQ-4: Attach an HNSW (Hierarchical Navigable Small World) index to the `embedding` column on the `products` table tuned for Cosine Distance (`<=>`).

## 1.2 Local AI Embeddings Service

- REQ-5: Establish a persistent background local Ollama service listening over port 11434.
- REQ-6: Pull and host the `nomic-embed-text` open-source model locally on the server.
- REQ-7: Build the catalog data ingestion background pipeline at `/api/seed`.
- REQ-8: Configure the ingestion pipeline to combine product title, description, category, and variant strings (size, color options) into a singular text payload before requesting the vector mapping.
- REQ-9: Enforce an exact 768-dimension configuration when saving generated array strings to the database vector storage layer.

## 1.3 Semantic Search Execution

- REQ-10: Expose a secure POST endpoint at `/api/ai-search`.
- REQ-11: Convert incoming text string search parameters into mathematical vector lists using the local Ollama gateway.
- REQ-12: Run SQL queries comparing input search vectors directly against indexed catalog entries using Cosine Distance (`<=>`) mathematics.
- REQ-13: Apply a strict filter threshold removing results with a derived contextual similarity score (1 - Cosine Distance) falling below `0.2`.
- REQ-14: Return a clean JSON array containing matching products with average local response latencies strictly under 55 milliseconds.

---

## Phase 2: Authentication, Authorization, & Security Filters

## 2.1 Identity Management

- REQ-15: Deploy an email/password user signup and login handler.
- REQ-16: Create a database trigger function that instantly inserts matching record values into the `profiles` table upon a new user creation event.

## 2.2 Access Control Security

- REQ-17: Implement a server-side security-definer database function to check and verify if a user has an `admin` role mapping in the database.
- REQ-18: Block administrative dashboard access requests with a strict role check to eliminate client-side privilege escalation bugs.

---

## Phase 3: Transactional Logic & Fulfillment Lifecycles

## 3.1 Cart Operations

- REQ-19: Implement transactional logic validating that user shopping carts contain at least one valid variant line item prior to accepting order submissions.
- REQ-20: Clear out frontend client session cart states immediately after generating a successful database order entry.

## 3.2 Order Management State Machine

- REQ-21: Default all newly logged user checkout records to a status of `pending`.
- REQ-22: Restrict order lifecycle progression tracking inside the database to a rigid sequential flow: `Pending` → `Confirmed` → `Shipped` → `Delivered` → `Cancelled`.
- REQ-23: Default the order `payment_method` database flag column to an absolute text string of `COD` (Cash on Delivery).
- REQ-24: Capture and freeze an immutable snapshotted record of the individual item price inside the `order_items` table at the exact millisecond of checkout completion.
- REQ-25: Ensure homepage displays a borderless hero banner section.

---

## Phase 4: Storefront Interface Layout (Minimal Obsidian Tech Theme)

## 4.1 Global Visual Shell

- REQ-26: Enforce the global styling rules across all frontend routes: Deep obsidian canvas background (`#090D16`), charcoal containers (`#111827`), thin deep-gray borders (`#1F2937`), off-white typography (`#F3F4F6`), and high-contrast vibrant actions text (`#10B981` or `#8B5CF6`).

## 4.2 Adaptive Navigation UI

- REQ-27: Render a full horizontal header for Desktop (1200px+) containing store logo, a centered semantic search container featuring a monospaced hint shortcut (`[Press ⌘K to ask AI]`), and text navigation paths to Shop, Cart, and Account views.
- REQ-28: Render a condensed upper layout for Mobile viewports (iPhone/Android) housing only the branding mark and a responsive search activation toggle.
- REQ-29: Render a fixed sticky bottom navigation tray on mobile viewports displaying clear, thumb-accessible touchzones for `[Home]`, `[Search]`, `[Cart]`, and `[Account]`.

## 4.3 Responsive Component Views

- REQ-30: Display the product category lists using a borderless fluid layout grid that dynamically auto-scales from a 4-column alignment on desktop down to a clean 2-column stacked pattern on mobile screen widths.
- REQ-31: Provide functional sorting and price slider selection filters on catalog category layout screens.
- REQ-32: Display the Product Detail Page using a 2-column layout on desktop (Image left, copy right) that stacks into a 1-column layout on mobile viewports.
- REQ-33: Include selector elements (chips or dropdown lists) for product choices (size and color variants) directly on the product detail view.
- REQ-34: Provide a right-aligned sliding modal Cart Drawer component that emerges on both desktop and mobile layouts when selecting active item totals.
- REQ-35: Layout the checkout entry page as a split layout on desktop screens (Data forms left, summary block right) that transforms into a top-to-bottom stack on mobile smartphones.
- REQ-36: Display a unique, non-guessable text-string order identification tracking reference on the confirmation screen immediately after a customer finishes an order submission.

---

## Phase 5: Gated Administrative Management Panels

## 5.1 Dashboard UI Topology

- REQ-37: Render a fixed left-side management command navigation pane displaying active administrative confirmation badges alongside navigation links to distinct backend sectors.
- REQ-38: Render a wide right-side administrative workspace screen utilizing borderless tables and clean layout divisions.
- REQ-39: Ensure admin dashboard is fully functional and responsive on mobile browser viewports.

## 5.2 Metrics & Systems Management

- REQ-40: Display a summary panel row detailing Total Orders, Calculated Store Revenue, and Pending Shipments. Configure the summary container to transition from an aligned row on desktop into a stacked list on mobile viewports.
- REQ-41: Build functional forms within the admin panels to create, edit, and delete products.
- REQ-42: Build functional forms within the admin panels to manage variant stock quantities.
- REQ-43: Build functional forms within the admin panels to upload and edit product photo assets.
- REQ-44: Build an order modification interface displaying a data grid table layout that allows admins to update the state machine lifecycle tracker.
- REQ-45: Build a user access control grid detailing system user identities with functional toggles to add or revoke administrative credentials.

---

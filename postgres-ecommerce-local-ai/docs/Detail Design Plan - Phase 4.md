
Detailed Design Plan: Phase 4 (Storefront Interface Layout & Minimal Obsidian Tech Theme)

Target Requirements: REQ-26 to REQ-36 (pp. 1-2)

---

Component 1: Global Visual Shell Theme Configuration

- **Requirements Covered:** REQ-26 (p. 2)
- **Role:** Lead UI/UX Engineer / Design System Specialist.
- **Task:** Establish and enforce the global atomic style configurations across all public and gated application routes (p. 2).
- **Context:** To ensure the storefront looks modern and high-end, the application relies on a unified, low-contrast dark aesthetic called "Minimal Obsidian Tech." Centralising these values prevents style inconsistencies across layout sections.
- **Constraints:**
    - The core canvas background color must be set to a dark midnight shade of **`#090D16`** (p. 2).
    - Content panels and descriptive containers must utilize a charcoal fill of **`#111827`** (p. 2).
    - Structural division lines and module edges must use a 1px border colored to **`#1F2937`** (p. 2).
    - Standard body copy text must map to an off-white color of **`#F3F4F6`**, and interactive action triggers must stand out using a high-visibility neon accent tone of **`#10B981`** or **`#8B5CF6`** (p. 2).
- **Format:** Design token variable mappings within the utility configuration framework (`tailwind.config.js`).
- **Acceptance Criteria:**
    - Inspecting any rendered route on the storefront confirms that the page canvas, container panels, borders, text, and active buttons match the specified hex-code colors (p. 2).

---

Component 2: Widescreen Responsive Header Assembly

- **Requirements Covered:** REQ-27 (p. 2)
- **Role:** Component Layout Engineer.
- **Task:** Construct a full-width horizontal navigation shell optimized explicitly for desktop viewing environments (viewport widths \(\ge \) 1200px) (p. 2).
- **Context:** Desktop layouts provide ample horizontal screen space. This layout places branding, a prominent semantic AI search field, and navigation options side-by-side to make exploration seamless for desktop users.
- **Constraints:**
    - Must only render when display viewports measure **1200px or wider** (p. 2).
    - The semantic search text panel must stay fixed in the center, displaying a clean, monospaced placeholder prompt: **`[Press ⌘K to ask AI]`** (p. 2).
    - The right-hand section must house distinct, uncrowded horizontal text navigation links mapping directly to the Shop, Cart, and Account paths (p. 2).
- **Format:** Responsive React Server/Client component file (`src/components/layout/header.tsx`) using Tailwind layout grid constraints.
- **Acceptance Criteria:**
    - Viewing the interface on a widescreen screen (e.g., 1440px width) reveals the full header panel, displaying the centered search prompt and right-aligned text links without overlapping (p. 2).

---

Component 3: Smartphone Adaptive Header & Sticky Bottom Navigation Tray

- **Requirements Covered:** REQ-28, REQ-29 (p. 2)
- **Role:** Mobile-First UI Developer.
- **Task:** Build the condensed top header layout (currently implemented in `src/components/layout/mobile-nav.tsx`) and add the thumb-accessible sticky bottom navigation tray with four touch targets for mobile viewports (p. 2).
- **Context:** Desktop-style horizontal text link columns do not fit on narrow smartphone screens. The condensed top header exists but the sticky bottom navigation tray with `[Home]`, `[Search]`, `[Cart]`, and `[Account]` touch targets is **not yet implemented**. The e2e tests (`e2e/responsive-nav.spec.ts`) expect `[data-testid="mobile-bottom-nav"]` with 4 links but the component only renders a top bar + spacer (pp. 1-2).
- **Constraints:**
    - The top header layout must hide all wide horizontal navigation links and display only the store logo badge alongside a mobile search toggle icon (p. 2).
    - The sticky navigation tray must layer on top of all page content, anchoring cleanly to the bottom of the device viewport (p. 2). **(Not yet implemented.)**
    - The bottom tray layout must expose four equal, thumb-accessible touchzones mapped exactly to **`[Home]`**, **`[Search]`**, **`[Cart]`**, and **`[Account]`** path loops (p. 2). **(Not yet implemented.)**
- **Format:** Mobile navigation layout component file (`src/components/layout/mobile-nav.tsx`) styled via persistent fixed-position utilities (`fixed bottom-0 left-0 right-0`).
- **Acceptance Criteria:**
    - Emulating an iPhone or Android display viewport width (< 768px) hides the widescreen header elements, triggers the condensed top bar layout, and locks the bottom navigation tray in view (p. 2). **(Bottom tray not yet implemented.)**

---

Component 4: Multi-Column Fluid Product Matrix Grid

- **Requirements Covered:** REQ-30, REQ-31 (p. 2)
- **Role:** Frontend Product Engineer.
- **Task:** Refactor the shop page grid from the current 3-column layout to a 4-column fluid grid, and build the filter bar with sorting controls and a price-range slider (p. 2).
- **Context:** Category pages display catalog search outcomes. The current shop page at `src/app/shop/page.tsx` uses `md:grid-cols-3` (3 columns) and only displays category links — not actual product listings. No filter or sort controls exist (pp. 1-2).
- **Constraints:**
    - The catalog listing layout must use a fluid grid that scales from a **4-column layout on desktop** monitors straight down to a **2-column stacked layout on mobile** screens (p. 2). (Currently 3 columns.)
    - Item containers within the grid layout must be borderless to match the clean design language (p. 2).
    - The interface must include sorting controls and a responsive price-range slider filter to sort items on category pages (p. 2). **(`src/components/shop/filter-bar.tsx` does not exist.)**
- **Format:** Dynamic Category view page template script file (`src/app/shop/page.tsx`) and a custom filter bar component (`src/components/shop/filter-bar.tsx` — to be created).
- **Acceptance Criteria:**
    - Opening the category view layout scales the product matrix smoothly from four columns on widescreen down to two columns on mobile layouts (p. 2). **(Currently 3 columns.)**
    - Adjusting the price-range slider correctly filters out matching item components from the visible matrix view. **(Not yet implemented.)**

---

Component 5: Adaptive Product Detail Page Layout

- **Requirements Covered:** REQ-32, REQ-33 (p. 2)
- **Role:** Conversion Rate UI/UX Developer.
- **Task:** Create the Product Detail Page at `src/app/shop/[id]/page.tsx` (currently **does not exist**) with adaptive columns and interactive variant selectors (p. 2).
- **Context:** The Product Detail Page (PDP) displays a single item's choices. The interface needs to group text info and interactive selectors near the main media asset, scaling fluidly across viewport widths to make reading and selecting choices straightforward. The e2e tests in `e2e/product-detail.spec.ts` exist and expect this page but it is not yet implemented (pp. 1-2).
- **Constraints:**
    - Must use a **side-by-side 2-column layout on desktop viewports** (product media asset left, text block details right) that collapses into a **single vertical column stack on mobile device viewports** (p. 2).
    - Product image containers must use dark canvas backgrounds to look fully integrated into the dark theme (p. 2).
    - The checkout interaction block must use interactive choice elements (chips or dropdown select menus) to let users specify product variations (sizes and color combinations) (p. 2).
- **Format:** Dynamic item detail folder view file (`src/app/shop/[id]/page.tsx`).
- **Acceptance Criteria:**
    - Opening the item view on a smartphone displays data stacked vertically (product image on top, descriptive blocks and option chips below) (p. 2). **(Not yet implemented — file does not exist.)**
    - Clicking a variation chip updates the selection context state and highlights the choice with the accent border color. **(Not yet implemented.)**

---

Component 6: Sliding Canvas Cart Drawer & Adaptive Checkout Interface

- **Requirements Covered:** REQ-34, REQ-35, REQ-36 (p. 2)
- **Role:** Lead Interaction Workflow Developer.
- **Task:** Build a right-aligned sliding modal Cart Drawer component and develop an adaptive split-pane checkout entry form layout (p. 2).
- **Context:** This module manages the order placement workflow. The cart overview slides in from the right edge for immediate feedback, guiding shoppers onto a checkout form that balances data entry fields against order totals on both desktop and mobile screens.
- **Constraints:**
    - The Cart Drawer must function as a slide-out right-side drawer overlay when items are added or when the cart icon is selected on any route viewport (p. 2).
    - The Checkout page must render as a **side-by-side split layout on desktop screens** (data entry fields left, sticky summary pane right) that shifts into a **top-to-bottom stack on mobile layout widths** (p. 2).
    - The final order confirmation view must display an uppercase, non-guessable alphanumeric tracking string (formatted as **`ORD-XXXXXXXX`**) immediately upon submission (p. 2).
- **Format:** Interactivity sliding wrapper component (`src/components/cart/cart-drawer.tsx`), checkout form view layout (`src/app/checkout/page.tsx`), and a success view route (`src/app/checkout/confirmation/page.tsx`).
- **Acceptance Criteria:**
    - Triggering the cart action slides out the drawer over the current view.
    - Submitting a valid order redirects the user to the confirmation page, which displays a unique uppercase tracking string (e.g., `ORD-K7X2R9P4`) (p. 2).

---

Component 7: Cross-Device Visual Layout E2E Test Specifications

- **Requirements Covered:** Automated layout verification checking for REQ-26 through REQ-36 (p. 2)
- **Role:** Quality Assurance Automation Engineer.
- **Task:** Script browser automation scenarios to verify the responsive design language across desktop and emulated smartphone screen dimensions.
- **Context:** End-to-End (E2E) UI testing verifies layout adaptations before code changes go live, ensuring structural grid rules, visibility settings, and bottom navigation components render correctly across devices.
- **Constraints:**
    - Test cases must execute using the **Playwright** cross-browser testing automation engine.
    - Must verify UI elements against three target display presets: standard widescreen desktop (\(1280 \times 800\)), emulated mobile iOS (iPhone Safari), and emulated mobile Android (Pixel Chrome).
- **Format:** Playwright browser automation test scripts across 5 files:
  - `e2e/responsive-nav.spec.ts` (TEST-401, TEST-403, TEST-404, TEST-405)
  - `e2e/search-overlay.spec.ts` (TEST-402, TEST-406, TEST-411)
  - `e2e/product-detail.spec.ts` (TEST-407 — tests PDP that does not yet exist)
  - `e2e/cart-drawer.spec.ts` (TEST-408)
  - `e2e/order-flow.spec.ts` (TEST-409, TEST-410, TEST-412)

- **Test Inventory:**

    - **TEST-401**: Adaptive navigation & breakpoint architecture — implemented in `responsive-nav.spec.ts`. Covers: desktop header visibility, desktop search prompt, mobile condensed header, mobile bottom nav visibility, 4 touch targets. Note: bottom nav is expected by tests but not yet implemented in `mobile-nav.tsx`. [REQ-27 to REQ-29]

    - **TEST-402**: Multi-column dynamic grid scaling — implemented in `search-overlay.spec.ts`. Covers: 4-column grid on desktop, 2-column grid on mobile. Note: actual shop grid uses `md:grid-cols-3` (3 columns). [REQ-30]

    - **TEST-403**: Global Obsidian theme CSS verification — implemented in `responsive-nav.spec.ts`. Covers: body background `#090D16`, interactive element accent colors. [REQ-26]

    - **TEST-404**: Desktop header structure — implemented in `responsive-nav.spec.ts`. Covers: store branding, Shop/Cart/Account nav links. [REQ-27]

    - **TEST-405**: Mobile bottom navigation tray — implemented in `responsive-nav.spec.ts`. Covers: fixed positioning at bottom. Note: component does not yet include the bottom tray. [REQ-29]

    - **TEST-406**: Category sorting & price filters — implemented in `search-overlay.spec.ts`. Covers: sort dropdown, price range slider. Note: `filter-bar.tsx` does not exist. [REQ-31]

    - **TEST-407**: Product detail page layout & variant selectors — implemented in `product-detail.spec.ts`. Covers: 2-col desktop, 1-col mobile, size/color chips, Add to Cart button. Note: PDP page at `src/app/shop/[id]/page.tsx` does not exist — tests will fail. [REQ-32, REQ-33]

    - **TEST-408**: Cart drawer component — implemented in `cart-drawer.spec.ts`. Covers: slides from right, backdrop overlay, empty state, full-width on mobile. [REQ-34]

    - **TEST-409**: Checkout split layout responsive — implemented in `order-flow.spec.ts`. Covers: desktop split view, mobile stack, required fields present. [REQ-35]

    - **TEST-410**: Unique order ID on confirmation — implemented in `order-flow.spec.ts`. Covers: order ID visible, `ORD-` prefix format, consecutive ID uniqueness. [REQ-36]

    - **TEST-411**: Invalid category route 404 — implemented in `search-overlay.spec.ts`. Covers: 404 page for non-existent category, back navigation link. [REQ-30]

    - **TEST-412**: Missing required checkout fields — implemented in `order-flow.spec.ts`. Covers: form validation blocks submission when required fields are empty. [REQ-35]

- **Note:** The upstream Test Specification (TEST-401 to TEST-412) is fully covered across 5 e2e test files. However, TEST-407 (PDP) and parts of TEST-401/405 (bottom nav) test pages/components that are not yet implemented and will fail at runtime.

---

---

## Detailed Design Plan: REQ-01 (UI System Design Tokens)

## Role

- Lead Frontend Engineer / UI Architect
    
    - _Responsibility:_ Translate the black-and-red design system requirements from the wireframes into reusable, immutable configuration tokens within the frontend code workspace.
    

## Task

- Configure the global styling architecture by injecting the high-contrast dark mode palette into the frontend build system.
- This involves setting up the utility theme parameters inside `frontend/tailwind.config.js` and establishing global print/override layers inside `frontend/src/index.css` to completely eradicate arbitrary color codes across the application components.

## Context

- PreSeedIQ requires a strict visual theme identity to feel like a premium, trustworthy financial analytics tool.
- Because the app relies on dynamic interface elements (like multi-bar valuation meters, loading states, and step indicators), the color palette must be centralized.
- If colors are hardcoded inline (e.g., mixing various random shades of black or red directly into view files), it causes design decay, breaks responsive accessibility, and prevents the print stylesheet (NFR-10) from cleanly reversing background colors to protect paper ink during local PDF exports.

## Constraints

- Framework Limit: Color extensions must be mapped strictly within the Tailwind CSS declarative theme extension model to preserve standard utility-class styling protocols (e.g., using `bg-primary-bg` or `text-brand-accent`).
- Theme Invariance: The application must remain strictly locked to dark mode by default. Standard device browser automatic light-theme inversions must be suppressed or overridden.
- Contrast Targets: The contrast ratio between typography primitives (`#F5F5F7`) and background surfaces (`#0A0A0A` / `#161616`) must strictly pass Web Content Accessibility Guidelines (WCAG) AAA standards for high legibility on mobile screens under 768px (REQ-08). The computed ratio for `#F5F5F7` on `#0A0A0A` is approximately 16.5:1, well exceeding the 7:1 AAA threshold. Validate via tools like WebAIM Contrast Checker.

## Format

The technical specification structure must map out the system architecture and key value objects across two discrete setup files:

1. `frontend/tailwind.config.js` Structural Specifications: Configuration configuration object specifying color utility key-value overrides under a standard modular theme key framework.
2. `frontend/src/index.css` CSS Layer Specifications: Setup mapping global document background selectors, browser element state layers (Active focus borders and input glow parameters), and print stylesheet overrides to reverse design contrast parameters during a native print routine.

## Technical Configuration Maps (Data Structures)

To keep configuration states clean, the project config maps must bind precisely to the following structural tokens and architectural schemas:

## A. Color Mapping Token Schema (Object Structure)

```json
{
  "theme": {
    "extend": {
      "colors": {
        "primary-bg": "#0A0A0A",
        "secondary-surface": "#161616",
        "brand-accent": "#E50914",
        "muted-highlight": "#9B050C",
        "border-default": "#262626",
        "text-primary": "#F5F5F7",
        "text-muted": "#A1A1AA"
      },
      "boxShadow": {
        "accent-glow": "0 0 8px rgba(229, 9, 20, 0.4)"
      }
    }
  }
}
```

## B. Stylesheet Processing Layers

- Dark Mode Lock: At the `:root` level, set `color-scheme: dark` to suppress browser light-theme auto-inversion. Implement via `@layer base` in `index.css` or a `<meta name="color-scheme" content="dark">` tag in `index.html`.
- Base Directive Layer: Using Tailwind's `@layer base` directive, bind root HTML document elements (`body`) to default token bindings (`@apply bg-primary-bg text-text-primary`).
- Component Interaction State Modifiers: Extend focus pseudo-selectors (`:focus`) for interactive data tags (`input`, `select`) to apply `border-brand-accent` paired with the custom `shadow-accent-glow` and `transition-all` timing parameters.
- Print Target Media Overrides (`@media print`): Build layout style overrides that intercept local PDF export routines, forcing full background inversion to solid paper-white (`#FFFFFF`) and all text components to rich dark gray (`#111111`). Hide the action toolbar strip (`display: none`).

## Acceptance Criteria

- AC-01 (Theme Initialization): Compiling the frontend application must succeed with zero asset bundling warnings or tailwind directive compilation errors.
  - _Verification:_ Run `npm run build` — expect exit code 0, no stderr warnings.
  - _Test Coverage:_ `test_wizard_layout_flow` (render smoke test confirms Tailwind utilities resolve).

- AC-02 (Token Uniqueness): The structural brand color hex codes defined in the design plan must be accurately represented as uniquely keyed utility extension bindings.
  - _Verification:_ Inspect `tailwind.config.js` for all 7 keys and matching hex values. Confirm each key is unique.
  - _Test Coverage:_ `test_input_state_styling_rules` (indirectly validates tokens via rendered element computed styles).

- AC-03 (Focus & Interact States — maps to REQ-33): Tabbing into or focusing on an empty text input component must dynamically trigger the smooth, hardware-accelerated transition highlighting borders using the exact crimson hue (`#E50914`) accompanied by the specified `rgba` outer glow matrix. Disabled elements must clamp to 40% opacity with `cursor: not-allowed`.
  - _Verification:_ Mount a `FormInput` component, programmatically focus it, assert computed `border-color` equals `rgb(229, 9, 20)` and `box-shadow` is non-default. Then set `disabled=true` and assert `opacity` is `0.4` and `cursor` is `not-allowed`.
  - _Test Coverage:_ `test_input_state_styling_rules` (REQ-33).

- AC-04 (Ink-Saving Print Target Verification — maps to NFR-10): Simulating a local print command or triggering an automated PDF file export event must force layout backgrounds to automatically transition to absolute solid white (`#FFFFFF`) while forcing layout typography elements to switch to a rich dark gray (`#111111`) to preserve print clarity.
  - _Verification:_ Apply `@media print` styles in a headless browser test; assert computed `background-color` is `rgb(255, 255, 255)` and `color` is `rgb(17, 17, 17)`.
  - _Test Coverage:_ `test_action_bar_functional_handlers` (NFR-10 print stylesheet verification).## Implementation Checklist (Current State → Target State)

Files in `frontend/` may already exist. This checklist verifies/updates each to spec:

1. **`frontend/tailwind.config.js`** — Already configured with correct tokens (`primary-bg`, `secondary-surface`, `brand-accent`, `muted-highlight`, `border-default`, `text-primary`, `text-muted`, `accent-glow`). Verify all 7 keys + 1 shadow exist.
2. **`frontend/index.html`** — Must exist at Vite root. Add `<meta name="color-scheme" content="dark">` in `<head>`.
3. **`frontend/src/index.css`** — Requires three additions:
   - `:root { color-scheme: dark; }` at the top (after `@tailwind` directives, before custom rules)
   - `@layer base { body { @apply bg-primary-bg text-text-primary; } }`
   - Update `@media print` text color from `#000000` to `#111111`
4. **`frontend/src/components/FormInput.jsx`** — Already uses correct utility classes (`bg-secondary-surface`, `border-border-default`, `focus:border-brand-accent`, `focus:shadow-accent-glow`, `disabled:opacity-40`, `disabled:cursor-not-allowed`). Verify only.

---




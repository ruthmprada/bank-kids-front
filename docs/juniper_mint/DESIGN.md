# Design System Specification: Editorial Play & Trust

## 1. Overview & Creative North Star: "The Digital Playground Studio"
This design system moves away from the sterile, rigid grids of traditional banking to embrace a philosophy of **Editorial Play**. Our Creative North Star is the "Digital Playground Studio"—an environment that feels as curated and high-end as a boutique art magazine, yet as approachable and tactile as a high-quality wooden toy.

We break the "template" look by utilizing **intentional asymmetry** and **tonal layering**. Instead of boxing content into restrictive containers, we allow elements to breathe and overlap. This creates a rhythmic, non-linear flow that guides a child’s eye through financial concepts with curiosity rather than anxiety. We maintain trust not through heavy borders, but through impeccable typography, generous white space, and a sophisticated "glass-on-paper" depth.

---

## 2. Colors: Vibrancy with Professional Depth
Our palette balances the energy of childhood with the stability of a financial institution. We utilize the Material Design convention to ensure programmatic consistency.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders are prohibited for sectioning. Boundaries must be defined solely through background color shifts or subtle tonal transitions. For example, a `surface-container-low` section sitting on a `surface` background provides all the definition a modern interface needs.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine, heavy-weight paper.
*   **Level 0 (Base):** `surface` (#f9f5ff) — The canvas.
*   **Level 1 (Sections):** `surface-container-low` (#f2efff) — Used for large structural groupings.
*   **Level 2 (Interaction):** `surface-container-lowest` (#ffffff) — Used for primary interactive cards to provide a "pop" of clean white.

### The "Glass & Gradient" Rule
To move beyond a "flat" feel, use **Glassmorphism** for floating elements (e.g., navigation bars or modals). Use semi-transparent surface colors with a `backdrop-blur-xl` effect.
*   **Signature Textures:** Apply a subtle linear gradient from `primary` (#0846ed) to `primary-container` (#859aff) on main CTAs. This provides a "liquid" depth that feels premium and tactile.

---

## 3. Typography: The Friendly Authority
We use a dual-typeface system to balance personality with readability.

*   **Display & Headlines (Plus Jakarta Sans):** A geometric sans-serif with a high x-height. It feels modern and "designed." 
    *   *Usage:* Use `display-lg` for balance totals and `headline-md` for section titles to create an editorial, high-contrast look.
*   **Body & Titles (Be Vietnam Pro):** A warm, extremely legible sans-serif. It provides a friendly, human touch to transactional data.
    *   *Usage:* All "banking" data and instructional text.

**Typography as Identity:** Use `on-surface-variant` (#585781) for secondary text to reduce visual noise, reserving `on-surface` (#2b2a51) for critical information. This tonal contrast replaces the need for bolding everything.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are often "dirty." We achieve depth through **Tonal Layering** and **Ambient Light**.

*   **The Layering Principle:** Stack `surface-container-lowest` cards on a `surface-container-low` background. This creates a soft, natural lift without a single pixel of black.
*   **Ambient Shadows:** If an element must float (like a "Save" button), use a shadow with a 20px+ blur at 5% opacity. The shadow color must be a tinted version of `on-surface` (#2b2a51), never pure black.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use `outline-variant` (#aba9d7) at **15% opacity**. It should be a whisper, not a statement.
*   **Glassmorphism Depth:** For tablet overlays, use `surface-container-highest` with a 0.7 alpha and `backdrop-blur`. This ensures the child feels they are "inside" the app, not just looking at a screen.

---

## 5. Components: Tactile & Rounded
All components inherit the **Roundedness Scale**, with a `DEFAULT` of `1rem` (16px) to ensure a "friendly" hand-feel on tablets.

### Buttons & Chips
*   **Primary Action:** `primary` background with `on-primary` text. Use `rounded-xl` (3rem) for a pill shape that invites tapping.
*   **Secondary/Tertiary:** Avoid borders. Use `surface-container-highest` for the background.
*   **Chips:** Use `secondary-container` (#60fcc6) for "Positive" states (e.g., "Goal Met"). The soft green implies growth and safety.

### Inputs & Fields
*   **The "Soft Well" Look:** Instead of a boxed input, use a `surface-container-highest` background with no border. On focus, transition the background to `primary-container` at 20% opacity.
*   **Typography:** Labels should always use `label-md` in `on-surface-variant` to keep the interface tidy.

### Cards & Lists (The "No-Divider" Rule)
*   **Forbid Divider Lines:** Never use a horizontal line to separate list items. Use **Vertical White Space** (from a 16px/24px/32px scale) or alternating tonal shifts (zebra striping using `surface` and `surface-container-low`).
*   **Savings Goals Card:** Use a `tertiary-container` (#feb700) accent for a "gold coin" feel.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts. Place a large `display-sm` heading on the left and a floating `surface-container-lowest` card slightly offset to the right.
*   **Do** use the `rounded-lg` (2rem) and `rounded-xl` (3rem) tokens for major containers. Sharp corners are forbidden.
*   **Do** prioritize tablet-first touch targets. Every interactive element should be at least 48x48dp.

### Don’t:
*   **Don’t** use "Card Shadows" as a default. Use tonal shifts first.
*   **Don’t** use pure black (#000000) for text. It is too harsh for children. Use `on-surface` (#2b2a51).
*   **Don’t** use standard 1px borders. If you feel the need for a line, increase the padding/spacing instead.
*   **Don’t** clutter the screen. If a page has more than three primary "thoughts," it needs to be split or layered.

---

## 7. Implementation (Tailwind Reference)
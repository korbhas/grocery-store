# FreshMart Frontend Revamp — Design Spec

**Date:** 2026-04-13
**Scope:** Full rebuild of the React SPA frontend (all customer + admin pages, navbar). Backend API unchanged.
**Direction:** Premium boutique grocer, illustrated (Approach 2).
**Stack change:** Add Tailwind CSS. Replace `index.css` stylesheet with Tailwind utilities + a thin `@layer base`/`@layer components` stylesheet.

---

## 1. Goals & non-goals

**Goals**
- Elevate the brand from generic green e-commerce UI to a distinctive, curated boutique-grocer feel.
- Work without real product photography: use typography, whitespace, and hand-drawn SVG illustrations to carry the design.
- Keep all existing functionality intact: browsing, cart, Clerk auth, Razorpay checkout, admin products/orders.
- Keep the component/data architecture (routes, `CartContext`, `lib/api.js`, Clerk gating) untouched.

**Non-goals**
- No backend changes.
- No new routes, features, or flows beyond what exists today.
- No dark mode.
- No real photography pipeline.
- No component library / headless primitives — Tailwind only.

---

## 2. Design system

### Palette
| Token | Hex | Use |
|---|---|---|
| `canvas` | `#faf7f2` | Page background (cream/paper) |
| `surface` | `#ffffff` | Cards, modals |
| `ink` | `#1f2a24` | Primary text, logo |
| `ink-muted` | `#6b7468` | Secondary text, captions |
| `hairline` | `#e8e2d6` | Dividers, card borders |
| `moss` | `#3d5a47` | Primary accent (buttons, links) |
| `moss-deep` | `#2a4132` | Hover/active |
| `clay` | `#b8654a` | Secondary accent (sale, highlight) |
| `butter` | `#f3e9c7` | Tinted chip / status |
| `sage` | `#d8e0cf` | Tinted chip / status |
| `rose` | `#ecd4cc` | Tinted chip / status |
| `danger` | `#a04848` | Destructive, out-of-stock |

### Typography
- Headings: **Fraunces** (Google Fonts, variable). 400/500.
- Body/UI: **Inter** (Google Fonts). 400/500/600.
- Eyebrow labels: Inter uppercase, `tracking-[0.12em]`, `11–12px`.

Scale: `display 56/1.05 · h1 40/1.1 · h2 28/1.2 · h3 20/1.3 · body 16/1.55 · small 14/1.5 · caption 12/1.4`.

### Shape & motion
- Radii: `sm 6 · md 10 · lg 16`. No pill buttons.
- Shadows: `soft = 0 1px 2px rgba(30,40,35,0.04)`, `lift = 0 10px 30px rgba(30,40,35,0.06)` (modals/hovers).
- Motion: `160ms ease` hovers, `240ms ease-out` modal entrance. Card hover = 2px translateY + shadow `lift` + illustration stroke darkens slightly.

### Illustrations
Hand-drawn line-art SVGs — single 1.5–2px stroke in `moss`, transparent fill, ~160×160 viewBox. Stored as React components in `frontend/src/assets/illustrations/`.

Illustrations to create (MVP set):
- **Category set**: `Pear` (produce), `Loaf` (bakery), `Bottle` (dairy), `Jar` (pantry), `Leaf` (herbs/generic fallback), `Fish` (meat/seafood), `Cup` (beverages), `Basket` (empty-cart / empty-state).
- **Decorative flourishes**: `Sprig`, `Sun`, `Wheat` — used sparingly in hero / empty states / order confirmation.

A helper `getIllustrationForCategory(categorySlug)` returns the matching component, falling back to `Leaf` for unknown slugs.

### Tailwind setup
- Install `tailwindcss`, `postcss`, `autoprefixer`. Vite plugin via `@tailwindcss/vite` (Tailwind v4 style) OR classic PostCSS config — implementer picks the most current stable approach at build time.
- `tailwind.config.js` extends `theme.colors`, `theme.fontFamily` (`serif: ['Fraunces', ...]`, `sans: ['Inter', ...]`), `theme.boxShadow.soft`, `theme.boxShadow.lift`, `theme.letterSpacing.eyebrow: '0.12em'`.
- Google Fonts loaded via `<link>` in `index.html`.
- `index.css` keeps only: `@tailwind base/components/utilities`, a `@layer base` setting body `bg-canvas text-ink font-sans`, focus-ring styles, and an `.eyebrow` component utility.

---

## 3. Component plan

All components land in `frontend/src/components/` unless noted.

### New / rebuilt shared components
- `Button` — variants `primary | secondary | ghost | danger`, sizes `sm | md | lg`. Replaces `.btn .btn-primary` etc.
- `Card` — `surface` bg, `hairline` border, `rounded-md`, soft shadow.
- `Badge` — tinted chip in `butter | sage | rose | danger`.
- `Input`, `Textarea`, `Select` — consistent form controls.
- `Modal` — portal + overlay + `lift` shadow + 240ms fade/scale entrance.
- `EyebrowLabel` — small uppercase tracked label.
- `OrnamentalDivider` — hairline rule with a centered `Sprig` glyph. For section breaks on Home / OrderConfirmation.
- `EmptyState` — illustration + heading + body + optional CTA.
- `Illustration` — wrapper that renders one of the SVG illustrations; accepts `name`, `size`, `stroke`.

### Rebuilt existing components
- `Navbar` — new look: `canvas` bg, `hairline` bottom border, Fraunces wordmark "FreshMart" next to a small `Sprig` glyph (replacing the lucide `Store` icon for brand distinctiveness), moss-on-cream nav links with underline-on-hover, cart count as a small `clay` dot (no circle badge). UserButton/SignInButton preserved. Mobile: collapse to icon-only but keep the wordmark visible.
- `ProductCard` — `surface` card, `hairline` border, no shadow at rest. Top 60% = tinted illustration panel (category-colored `butter`/`sage`/`rose` background with the category illustration centered, moss stroke). Bottom 40% = eyebrow category, Fraunces product name, price with small unit tag, and an inline "Add" link (underlined moss text, not a filled button) + stock status as small text. Hover: 2px lift, stroke darkens.

### Page rebuilds
Each page reuses existing data-fetching and state logic; only presentational JSX and styling change.

- **Home** — Editorial hero: Fraunces display line ("A considered grocer."), small serving-suggestion sub-line, flanked by two flourishes. Ornamental divider. Search: borderless input with bottom hairline, embedded `Search` icon. Category filters: text links in a horizontal row separated by `·` dots (no pill buttons), underline on active. Product grid unchanged in shape.
- **ProductDetail** — Two-column: left = large tinted illustration panel (same category color scheme as the card) with generous padding; right = eyebrow, Fraunces h1, price + unit, descriptive body, quantity stepper, full-width moss "Add to cart" button. Below, an ornamental divider and a short "about the category" blurb (static copy from a small dictionary keyed by category slug).
- **Cart** — Two-column (items / summary). Items list with hairline separators instead of card shadows. Small category illustration thumbnails (tinted chip) instead of image thumbnails. Quantity stepper reused. Summary card `surface` with eyebrow totals and a moss Checkout button.
- **Checkout** — Single-column centered 640px max. Fraunces h1, ornamental divider, `Textarea` for delivery address, summary list, moss "Place order" button. On submit, Razorpay modal opens (unchanged logic).
- **OrderConfirmation** — Large centered `Sun` flourish above a Fraunces "Thank you." h1. Order ID small. Bill rendered as a clean table with hairline rows, no shadow. Two ghost buttons below.
- **Orders** — List of hairline-separated rows (not cards). Each row: eyebrow date, Fraunces order id (short), item summary as inline text, moss total on the right, status as a `Badge` (sage/butter/rose/danger mapped to order status).
- **Admin** — Top bar with Fraunces "Control" heading + tabs as text links with underline indicator. Same layout for Products / Orders below.
- **AdminProducts** — Table on `surface`, hairline row dividers, moss "New product" text-link top-right. Inactive rows dim to 50%. Edit/delete as ghost icon buttons.
- **AdminOrders** — Same list style as customer Orders, with the status `Select` inline right-aligned and payment info as small muted text beneath.

### File layout
```
frontend/src/
  assets/illustrations/        # new
    Pear.jsx, Loaf.jsx, Bottle.jsx, Jar.jsx, Leaf.jsx,
    Fish.jsx, Cup.jsx, Basket.jsx, Sprig.jsx, Sun.jsx, Wheat.jsx,
    index.js                   # exports + getIllustrationForCategory
  components/
    Navbar.jsx                 # rebuilt
    ProductCard.jsx            # rebuilt
    ui/                        # new shared primitives
      Button.jsx, Card.jsx, Badge.jsx, Input.jsx,
      Textarea.jsx, Select.jsx, Modal.jsx,
      EyebrowLabel.jsx, OrnamentalDivider.jsx,
      EmptyState.jsx, Illustration.jsx
  pages/                        # all rebuilt (JSX only; fetching logic preserved)
  index.css                    # slimmed to tailwind + @layer base/components
  App.jsx                      # unchanged (except maybe loading state style)
tailwind.config.js              # new
postcss.config.js               # new (if needed)
```

---

## 4. Data flow & state

Unchanged. `CartContext`, `lib/api.js` (axios + Clerk token), Clerk `<SignedIn>` gating, Razorpay checkout integration, toast notifications (`react-hot-toast`) all stay as-is. Only JSX and styles change.

`react-hot-toast` toasts get restyled via its `toastOptions` to match: `canvas` bg, `ink` text, `moss` success, `clay` error, Inter 14/500, `soft` shadow.

---

## 5. Error, loading, empty states

- **Loading**: replace "Loading products…" text block with a centered `Sprig` glyph that slowly rotates (CSS `animation: spin 2.4s linear infinite`) with small Inter caption "Gathering the harvest…" (copy is boutique-flavored but not cloying).
- **Empty state** (no results, empty cart, no orders): `EmptyState` component — `Basket` illustration, Fraunces h3, muted body, optional CTA. Each page supplies its own copy.
- **Errors**: existing toast pattern preserved; only the toast styling changes.

---

## 6. Accessibility

- All interactive elements reachable by keyboard; focus-visible ring: 2px `moss` outline with 2px `canvas` offset.
- Text contrast: `ink` on `canvas` ≥ 12:1; `ink-muted` on `canvas` ≥ 4.6:1 — verified via the design-system tokens.
- Illustrations are decorative: `aria-hidden="true"` on all SVGs. Product cards expose the product name to screen readers via the linked heading.
- Form inputs have associated `<label>`s (current codebase already does this in admin forms; extend to the checkout address field).
- `prefers-reduced-motion` disables the card hover lift and loading spinner rotation.

---

## 7. Responsive

Mobile-first Tailwind breakpoints (`sm 640 · md 768 · lg 1024 · xl 1280`).

- Navbar: wordmark always visible; nav links collapse to icon-only under `sm`.
- Product grid: 1 col `<sm`, 2 col `sm`, 3 col `md`, 4 col `lg`.
- ProductDetail / Cart / Checkout: two-column layout stacks under `md`.
- Admin table: horizontal scroll under `md` (current behavior preserved).
- Minimum tap target: 44×44px for all buttons and icon links.

---

## 8. Testing & verification

No unit tests exist today and none are added. Verification is manual:
- `npm run lint` passes.
- `npm run build` succeeds.
- `npm run dev` — walk every route signed-out and signed-in (customer + admin):
  - Home: search + category filter, add to cart
  - ProductDetail: quantity + add
  - Cart: update qty, remove, proceed to checkout
  - Checkout: address + Razorpay test flow (verify signature roundtrip)
  - OrderConfirmation: bill renders
  - Orders: list renders, statuses visible
  - Admin: products CRUD, orders status change
- Responsive pass at 375px, 768px, 1280px.
- Reduced-motion pass (OS-level setting).

---

## 9. Risks & open items

- **Fraunces variable font size** adds ~80KB woff2; acceptable for a boutique feel but should use `font-display: swap` and `&display=swap` on the Google Fonts URL.
- **Illustration style consistency** — all 11 SVGs must share stroke weight and visual density. The implementer should design `Pear` first, approve the style, then replicate.
- **Category slug → illustration mapping** depends on what's in the seed data. The mapping dictionary must be defensive: unknown slugs return `Leaf`.
- **Tailwind v4 vs v3** — implementer should use whichever is current stable at build time; design does not depend on v4-only features.

---

## 10. Out of scope / deferred

- Real product photography and image-loading strategy
- Dark mode
- Internationalization
- Animation beyond the minimal hover/entrance set
- PWA / offline
- Redesigning Clerk-hosted modals (only our shell is restyled)

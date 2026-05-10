# Handoff: FreshMart Grocery Dashboard

## Overview
Five wireframe explorations for the homepage of a generic grocery delivery dashboard ("FreshMart" is a placeholder brand — replace with your real brand name and tokens). The brief: a sidebar-led app shell with a dominant search experience, a kept-but-more-useful hero, horizontal category pills, and discovery + trust signals optimized for first-time visitors.

## About the Design Files
The HTML files in this bundle are **design references** created as prototypes — they show intended look, structure, and behavior. They are **not production code to copy directly**.

Your job is to **recreate these designs in the target codebase's existing environment** using its established patterns (component library, design tokens, routing, state management). If no environment exists yet, choose an appropriate framework (React + Tailwind, Next.js, etc.) and implement there.

## Fidelity
**Low / mid-fidelity wireframes.**
- Sketchy stroked boxes and stripe-pattern placeholders represent layout, not final visual treatment.
- Real UI should swap placeholders for real product photography, real iconography (e.g. Lucide / Heroicons), and the codebase's typography + color tokens.
- Use the wireframes as a guide to **layout, hierarchy, and interaction patterns** — not pixel-perfect styling.

## Variations Included
The design canvas (`FreshMart Wireframes.html`) presents 5 directions side-by-side. Each is a distinct organising metaphor for the same content:

| # | Name | Hero metaphor | Discovery vector |
|---|---|---|---|
| 01 | Sidebar rail + search-led hero | Big search inside green hero | "New this week" product rail |
| 02 | Wide sidebar + bento hero | 2-up bento (search · fresh-this-hour · free-delivery progress) | Aisle tiles |
| 03 | Delivery tracker + recipe rail | Live order tracker + 3 trust badges | Recipes that auto-fill cart |
| 04 | Magazine / editorial cover | Newspaper masthead + cover story + "in this issue" index | 3-up promo cards (kept from existing) |
| 05 | Command palette as hero | Centered ⌘K palette with peek of suggestions | Sidebar holds full nav |

The user picks one direction to ship; the others are exploratory.

## Shared Layout (all variations)
- **App shell**: vertical sidebar on the left (icon-only ≈64px wide, or full-text ≈200px wide depending on variation). Toggleable.
- **Top bar**: location chip ("Delivering in 10 min · 221B Baker"), spacer, Orders button, Cart button with badge count.
- **Hero**: variation-specific (see table above).
- **Trust strip**: 4 mini-stats — "10 min avg delivery", "Picked today", "Free over ₹299", "4.8★ · 12k reviews".
- **Category pills**: horizontal scrolling, single-select, with leading icon.
  Categories: All · Bakery · Dairy & Eggs · Fruits & Vegetables · Grains & Staples · Snacks & Beverages · Spices.
- **Discovery section**: variation-specific.

## Components to Build
- `<AppShell>` — sidebar + main area, supports collapsed/expanded sidebar
- `<Sidebar>` — icon rail OR full-text variants
- `<TopBar>` — location chip, orders, cart-with-badge
- `<HeroSearch>` — large search input (variation 01, 02, 04, 05)
- `<CommandPalette>` — ⌘K shortcut, suggestions dropdown (variation 05)
- `<DeliveryTracker>` — 4-step progress indicator (variation 03)
- `<TrustBadge>` — icon + title + subtitle (variation 03)
- `<TrustStrip>` — 4-up mini-stat row (variation 01, 02)
- `<CategoryPills>` — horizontal scrolling pill row, single-select
- `<ProductCard>` — image + title + provenance + price + add button (variation 01) — **no card wrapper, sits directly on background**
- `<RecipeCard>` — image + tag + title + ingredient meta + price + "+ to cart" (variation 03) — **no card wrapper**
- `<AisleTile>` — colored tile with emoji + name + count (variation 02)
- `<BentoPanel>` — rounded panel for fresh-this-hour, delivery-progress (variation 02)
- `<PromoCard>` — tag pill + title + sub + CTA (variation 04, kept from existing design)

## Design Tokens

### Colors
```
--green:        #1f4d34   /* primary brand green */
--green-soft:   #e6efe6   /* surface tint */
--green-ink:    #2a6a47   /* text on green-soft */
--accent:       #d3893a   /* orange accent */
--accent-soft:  #fbeed8   /* accent surface */
--paper:        #fafaf6   /* page background */
--paper-2:      #f1f1ea   /* secondary surface (sidebar) */
--ink:          #1f2520   /* primary text */
--ink-2:        #4a544c   /* secondary text */
--ink-3:        #8a948c   /* tertiary text / mono labels */
--line:         #2a2f2c   /* borders */
--line-soft:    rgba(31,37,32,0.18)
```

### Typography
- **Headings**: Satoshi (700) — used for big titles, prices, button labels
- **Body / UI**: DM Sans (400/500/600/700)
- **Labels / mono**: JetBrains Mono — uppercase eyebrow labels, kbd hints (`⌘K`)

Type scale used in mocks:
- Hero title: 38–56px / 700
- Section heading: 20–22px / 700
- Card title: 16px / 700
- Body: 13–14px / 500
- Mono label: 9–10px / 1.5 letter-spacing, uppercase

### Spacing
- Container padding: 18–32px
- Section gap: 18–22px vertical
- Card gap: 12–18px horizontal in rails

### Radii
- Pills: 999
- Buttons / small inputs: 6–8
- Hero / bento panels: 10–14
- Mini-stats: 6

## Interactions & Behavior
- **Sidebar toggle** — collapses to 0 width, content fills available space.
- **Command palette (variation 05)** — opens on `⌘K` / `Ctrl+K`. Filters across products, past orders, recipes. First result highlighted; Enter to select.
- **Add to cart** — `+` button on product card increments cart badge with light spring animation.
- **Recipe → cart (variation 03)** — tapping "+ to cart" adds ALL recipe ingredients to cart, surfaces a toast.
- **Delivery tracker (variation 03)** — connects to live order state; current step highlighted.
- **Category pill** — single-select; updates product feed below.
- **Free-delivery progress (variation 02)** — bar fills as cart subtotal grows; copy updates ("You're ₹84 away").

## State Required
- `cart`: items, subtotal, count
- `currentOrder`: status (Picked/Packed/On the way/Delivered), ETA
- `selectedCategory`: id
- `searchQuery`, `searchSuggestions`
- `sidebarCollapsed`: bool
- `commandPaletteOpen`: bool

## Files in This Bundle
- `FreshMart Wireframes.html` — entry point (design canvas with all 5 artboards)
- `design-canvas.jsx` — pan/zoom canvas wrapper (don't ship; used for presenting options)
- `tweaks-panel.jsx` — design-time tweak controls (don't ship)
- `wireframe-primitives.jsx` — sketchy `SBox`, `SImage`, `SPill`, etc. (replace with real components in production)
- `v01-sidebar-search.jsx` through `v05-command-palette.jsx` — the 5 variation layouts

## Implementation Notes
- The wireframes use sketchy/wobbly SVG borders for a low-fi feel. **Drop these in production** — use clean borders + proper Tailwind/CSS.
- Replace stripe-pattern `SImage` placeholders with real `<img>` / `<Image>` + product photography.
- Replace emoji icons (🥬🥖🥚) with proper icon set (Lucide recommended).
- The "FreshMart" wordmark in the sidebar is text-only — no logo mark.
- Product and recipe cards in the latest revision **sit directly on the background** (no card wrapper). Preserve this — it feels modern and reduces visual noise.

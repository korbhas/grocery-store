# FreshMart — Development Progress Report

**Project:** FreshMart Grocery E-Commerce Application  
**Report Date:** May 4, 2026  
**Development Period:** April 11, 2026 – May 4, 2026 (≈ 3.5 weeks)  
**Developer:** korbhas  
**Repository:** github.com/korbhas/grocery-store

---

## Executive Summary

FreshMart is a full-stack grocery e-commerce web application with a customer-facing storefront and a comprehensive admin portal. Development began on April 11, 2026 with an initial scaffolded commit and has progressed through backend API construction, a complete frontend visual revamp, and multiple rounds of feature additions and bug fixes.

As of May 4, 2026, the application is **functionally complete** for its core scope: customers can browse products, add to cart, pay via Razorpay (authenticated or as a guest), and track orders in real time. Admins have full control over the store through a Shopify-inspired dashboard. The project is running and fully functional in the local development environment.

---

## Development Timeline

| Date | Milestone |
|---|---|
| Apr 11 | **Initial commit** — project scaffolded with base Express backend, React frontend, PostgreSQL schema (first draft) |
| Apr 13 | Design spec and implementation plan authored for frontend revamp |
| Apr 14 | **Frontend revamp** (13 commits on `frontend-revamp` branch) — all pages rebuilt with Tailwind CSS v4, custom design tokens, Satoshi/DM Sans typography, hand-drawn SVG illustrations, Radix UI primitives, shadcn-style component library |
| Late Apr | Backend development — full REST API, 8 database migrations, JWT authentication, Razorpay payment webhook, coupon system, order tracking, guest checkout |
| May 3–4 | Feature additions: Cloudinary image upload, multi-series revenue chart, Shopify-inspired admin layout, viewport fixes, various bug fixes |

---

## Completed Features

### Backend

| Feature | Status |
|---|---|
| PostgreSQL database with Knex migrations (8 migrations) | ✅ Done |
| Seed data (admin user, 6 categories, 15 products, delivery area) | ✅ Done |
| JWT authentication (register, login, role-based guard) | ✅ Done |
| Password hashing with bcrypt | ✅ Done |
| Public product API (list, filter, search, category, single) | ✅ Done |
| Cart API (add, update, remove, clear — auth required) | ✅ Done |
| Order creation — authenticated + guest checkout | ✅ Done |
| Razorpay order creation and payment verification | ✅ Done |
| Razorpay webhook (HMAC-SHA256 verified) | ✅ Done |
| Coupon validation (percentage + fixed, expiry, usage limits) | ✅ Done |
| Order status lifecycle (6 states) | ✅ Done |
| Guest order access token (UUID) | ✅ Done |
| Estimated delivery time (auto-set on out_for_delivery) | ✅ Done |
| Admin: dashboard analytics (stats + period comparison) | ✅ Done |
| Admin: product CRUD | ✅ Done |
| Admin: category CRUD + reorder | ✅ Done |
| Admin: inventory batch update | ✅ Done |
| Admin: order management + status updates | ✅ Done |
| Admin: delivery agent assignment to orders | ✅ Done |
| Admin: delivery agent CRUD | ✅ Done |
| Admin: delivery area (pincode) management | ✅ Done |
| Admin: coupon CRUD | ✅ Done |
| Admin: payment transaction log | ✅ Done |
| Admin: customer management (list, ban/unban) | ✅ Done |
| Admin: store settings (key-value) | ✅ Done |
| Global error handling (asyncHandler + AppError) | ✅ Done |

### Frontend — Customer

| Feature | Status |
|---|---|
| Home page — product browsing, search, category pills | ✅ Done |
| Product detail page | ✅ Done |
| Shopping cart (localStorage, persists across sessions) | ✅ Done |
| Checkout — authenticated flow | ✅ Done |
| Checkout — guest flow (no account required) | ✅ Done |
| Delivery address via Google Maps pin picker | ✅ Done |
| Delivery address manual entry fallback | ✅ Done |
| Pincode delivery area validation | ✅ Done |
| Coupon code input with live discount calculation | ✅ Done |
| Razorpay payment modal integration | ✅ Done |
| Order confirmation page | ✅ Done |
| Order tracking — live status + ETA countdown | ✅ Done |
| Order tracking — auto-refresh every 15 seconds | ✅ Done |
| Guest order tracking via access token URL | ✅ Done |
| Order history page (authenticated users) | ✅ Done |
| User registration and login | ✅ Done |

### Frontend — Admin Portal

| Feature | Status |
|---|---|
| Admin login page | ✅ Done |
| Shopify-inspired layout (fixed sidebar, grouped nav, top bar) | ✅ Done |
| Dashboard — revenue + orders stat cards with % change | ✅ Done |
| Dashboard — multi-series line chart (current vs previous period) | ✅ Done |
| Dashboard — today / this week / this month toggle | ✅ Done |
| Dashboard — low stock alerts panel | ✅ Done |
| Dashboard — pending orders card | ✅ Done |
| Dashboard — recent orders table | ✅ Done |
| Products — table with image, category, price, stock, status | ✅ Done |
| Products — create/edit dialog with all fields | ✅ Done |
| Products — Cloudinary image upload (client-side, unsigned preset) | ✅ Done |
| Products — search + stock filter + category filter | ✅ Done |
| Products — active/inactive toggle | ✅ Done |
| Categories management | ✅ Done |
| Inventory batch update | ✅ Done |
| Orders — list with filters (status, date range) | ✅ Done |
| Orders — status update + delivery agent assignment | ✅ Done |
| Delivery agent management | ✅ Done |
| Coupons CRUD | ✅ Done |
| Payments log | ✅ Done |
| Customer list + ban controls | ✅ Done |
| Store settings form | ✅ Done |

### Design System

| Feature | Status |
|---|---|
| Tailwind CSS v4 with CSS variable design tokens | ✅ Done |
| Satoshi (headings) + DM Sans (body) + JetBrains Mono (code) | ✅ Done |
| Brand token: primary `#e23744` (FreshMart red) | ✅ Done |
| shadcn-style component library (Button, Card, Input, Table, Dialog, Badge, Select, etc.) | ✅ Done |
| CVA-based Button with 6 variants and 8 sizes | ✅ Done |
| Dark mode token definitions (ready but not toggled in UI) | ✅ Done |
| Responsive layout (mobile drawer on admin, responsive product grid) | ✅ Done |
| Dynamic viewport height (`dvh`) for correct full-screen layout on all devices | ✅ Done |

---

## Codebase Metrics

| Metric | Count |
|---|---|
| Total source files (.js / .jsx) | 85 |
| Total lines of code | ~9,200 |
| Database migrations | 8 |
| Seed files | 3 |
| Backend routes files | 7 |
| Backend controllers | 4 |
| Frontend page components | 20 |
| Frontend UI primitives | 13 |
| API endpoints | ~50 |
| Git commits | 17 |

---

## Bugs Fixed During Development

| Bug | Fix Applied |
|---|---|
| Admin routes rendered customer dashboard (missing `isAdmin` check in `App.jsx`) | Added `isAdmin` flag to suppress customer Navbar and layout on `/admin/*` routes |
| Admin dashboard 500 error — Knex `.first()` on aggregate queries returned a plain object, not an iterable array | Removed `.first()` from all 5 affected aggregate queries; destructuring now works correctly |
| Admin orders list 500 error — cloning a `SELECT *` query then adding `.count()` violated PostgreSQL GROUP BY rules | Replaced with a separate, clean `COUNT` query |
| File upload button did not open file picker on Arch Linux | Switched from `ref.click()` (unreliable on Linux) to native `<label htmlFor>` association |
| Website not filling full viewport on some devices | Applied `dvh` (dynamic viewport height) to all full-screen containers; set `html { height: 100% }` and fixed Navbar height mismatch (`3.5rem` vs `4rem`) |
| Revenue chart missing previous-period comparison | Added `prev_revenue_chart` query to backend and merged datasets by day offset on frontend |

---

## Known Limitations

| Limitation | Notes |
|---|---|
| **Cart not synced to database** | `cart_items` table exists but the frontend uses `localStorage`. Cart is lost if the user clears browser storage. A server-side sync was scoped out. |
| **No email notifications** | `email_verified` flag exists in the `users` table but no email-sending integration (SMTP / SendGrid) has been wired up. Verification, order confirmation, and shipping emails are absent. |
| **No real-time push for order updates** | Order tracking uses polling (HTTP every 15 s). WebSockets or Server-Sent Events would give instant status pushes. |
| **No rate limiting** | The API has no rate-limiting middleware. Under high load or abuse, the Express server could be overwhelmed. |
| **Dark mode not user-togglable** | CSS tokens for dark mode are defined in `index.css` but there is no toggle in the UI; the app always renders in light mode. |
| **No automated test suite** | Vitest and Supertest are installed and scripts are defined, but no tests have been written. The testing infrastructure is ready; tests are pending. |
| **`clerk_id` is a legacy column** | Originally intended for Clerk auth integration; now unused but kept in the schema for backwards compatibility. |
| **No production deployment config** | No `Dockerfile`, no CI/CD pipeline, no Nginx/Caddy config. The project runs only in local development mode. |
| **Image orphan cleanup** | When a product image is removed from the form, the Cloudinary asset is not deleted (orphan cleanup out of scope). |
| **Google Maps billing** | The Google Maps address picker requires a billing-enabled API key. It will stop working once the free quota is exhausted. |

---

## Pending / Future Work

### High Priority

- [ ] **Write backend tests** — unit tests for controllers and integration tests for all API endpoints using Vitest + Supertest + a test PostgreSQL database
- [ ] **Email notifications** — integrate a transactional email service (e.g. Resend, SendGrid) for order confirmation and shipping updates
- [ ] **Production deployment** — Dockerise the backend, add Nginx reverse proxy config, set up CI/CD (GitHub Actions), deploy to a VPS or PaaS

### Medium Priority

- [ ] **Server-side cart sync** — persist cart to `cart_items` table so it survives across devices and browser clears
- [ ] **Real-time order updates** — replace the 15-second polling with Server-Sent Events or a WebSocket channel
- [ ] **Dark mode toggle** — wire up the existing CSS token definitions to a user-togglable theme switch
- [ ] **Rate limiting** — add `express-rate-limit` to protect public endpoints from abuse
- [ ] **API pagination on frontend** — most admin list pages load all records; add cursor/page controls for large datasets

### Low Priority

- [ ] **Email verification flow** — send a verification link after registration; block unverified accounts from checkout
- [ ] **Product reviews and ratings** — allow customers to rate purchased products
- [ ] **Wishlist / favourites** — persist saved products per user account
- [ ] **Cloudinary orphan cleanup** — call the Cloudinary Delete API when a product image is replaced or a product is deleted
- [ ] **PWA / push notifications** — add a service worker for offline browsing and push order status updates to mobile browsers
- [ ] **Multi-language / localisation** — currently hardcoded in English; i18n scaffolding not in place
- [ ] **Remove `clerk_id` column** — clean up the legacy schema field with a migration

---

## Current Development Status

**The application is development-complete for its core scope.** All primary user flows — browsing, cart, checkout, payment, and order tracking — work end-to-end. The admin portal covers the full store management lifecycle.

The next meaningful phase of work is:
1. Writing a test suite to validate the existing backend
2. Setting up a production deployment pipeline
3. Adding email notifications for order events

---

*FreshMart — Progress Report — May 4, 2026*

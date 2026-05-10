# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview
Full-stack grocery e-commerce app ("FreshMart"). Backend: Node.js/Express 5 + Knex + PostgreSQL. Frontend: React 19 (Vite 8) + Axios + Tailwind CSS v4. No test suite exists.

## Commands

### Backend (`/backend`)
```bash
npm run dev           # nodemon (port 5000)
npm run migrate       # knex migrate:latest
npm run migrate:rollback
npm run seed          # seeds admin user + categories/products + delivery areas
```

### Frontend (`/frontend`)
```bash
npm run dev           # vite dev server (port 5173)
npm run build
npm run lint          # eslint
```

## Architecture

### Backend

**Entry point:** `src/index.js` — mounts all routers, global error handler.

**Auth (`src/middleware/auth.js`):** Custom JWT auth via `jsonwebtoken` + `bcrypt`. Token expires in 7 days.
- `requireAuth` — verifies Bearer token, attaches `req.dbUser` and `req.userId`, rejects banned users
- `attachUser` — same but non-blocking (for public routes that optionally show user data)
- `requireRole(...roles)` — RBAC guard; roles: `customer` | `admin`
- Exported helpers: `hashPassword`, `comparePassword`, `generateToken`

**Error handling (`src/utils/helpers.js`):**
- `asyncHandler(fn)` — wraps route handlers, catches thrown errors
- `AppError(message, statusCode)` — throws structured HTTP errors (caught by `asyncHandler`)
- `paginate(query, page, limit)` — Knex query pagination helper
- `escapeLike(str)` — sanitizes strings for SQL LIKE queries

**Routes:**
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `/api/products` — public product browsing
- `/api/cart` — requires auth
- `/api/orders` — requires auth
- `/api/coupons` — coupon validation
- `/api/admin/*` — all routes require `admin` role (applied at router level in `src/routes/admin.js`)
- `/api/user` — profile management
- `/api/webhook` — Razorpay payment webhook
- `GET /api/health`

**Payments:** Razorpay integration. Orders are created with a Razorpay order ID; the webhook at `/api/webhook` verifies signatures and marks payments captured.

### Frontend

**Path alias:** `@` resolves to `frontend/src/` (configured in `vite.config.js`).

**Key dependencies:** `axios`, `react-router-dom` v7, `react-hot-toast`, `lucide-react`, `recharts`, `radix-ui`, `clsx`, `tailwind-merge`, `class-variance-authority`, `date-fns`

**UI components (`src/components/ui/`):** shadcn-style components built with `class-variance-authority` + `cn()` (clsx + tailwind-merge). `cn()` is in `src/lib/utils.js`. Use these components for new UI rather than building from scratch.

**Auth (`src/context/AuthContext.jsx`):** Stores JWT in `localStorage`, sets Axios default `Authorization` header on init and login. Exposes `{ user, loading, isAuthenticated, login, register, logout }`.

**Cart (`src/context/CartContext.jsx`):** Entirely client-side — persisted to `localStorage` under key `freshmart_cart`. The `cart_items` DB table exists but is not used by the frontend. Cart items carry the full product object snapshot at add-time.

**API client (`src/lib/api.js`):** Axios instance with `baseURL = VITE_API_URL/api`. Token is read from `localStorage` on module init; `AuthContext` keeps it in sync.

**Routing (`src/App.jsx`):** React Router v7. `ProtectedRoute` checks `useAuth().user` and `user.role`; redirects unauthenticated users to `/login` (or `/admin/login` for admin routes). `Navbar` is hidden on the home page (`/`).

**Provider wrapping order:** `AuthProvider` (in `main.jsx`) → `CartProvider` → `BrowserRouter` (both in `AppContent` in `App.jsx`).

**Admin shell (`src/pages/Admin.jsx`):** Wraps all `/admin/*` sub-routes in `AdminLayout` (sidebar + header). Each admin page is a self-contained page component that fetches its own data.

### Database Schema

**Core tables:** `users`, `categories`, `products`, `orders`, `order_items`, `payments`, `cart_items`

**Extended tables (added via migrations):** `delivery_agents`, `coupons`, `delivery_areas`, `settings`

**Key `users` columns:** `id`, `clerk_id` (nullable — legacy, unused), `name`, `email` (unique), `password_hash`, `role` (`customer`|`admin`), `is_banned`, `email_verified`

**`settings` table:** key-value store (`key` PK, `value`). Default keys: `store_name`, `delivery_fee`, `min_order_amount`, `delivery_eta_min`, `delivery_eta_max`, `store_open`.

**Order statuses:** `pending` → `processing` → `out_for_delivery` → `delivered` | `cancelled` | `refunded`

**Payment statuses:** `created` → `captured` | `failed`

**Default seed admin credentials:** `admin@freshmart.com` / `admin123`

### Design Handoff

`design_handoff_freshmart_dashboard/` contains standalone React wireframe components (not wired into the app) used as a design reference for the admin dashboard UI.

## Environment Variables

**Backend (`backend/.env`):**
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=grocery_store
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=change-me-in-production
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
RAZORPAY_WEBHOOK_SECRET=xxxx
FRONTEND_URL=http://localhost:5173
```

**Frontend (`frontend/.env`):**
```
VITE_API_URL=http://localhost:5000
```

## Agent skills

### Issue tracker

Issues live in GitHub Issues at `github.com/korbhas/grocery-store`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — `CLAUDE.md` is the primary domain reference; `CONTEXT.md` and `docs/adr/` created lazily. See `docs/agents/domain.md`.

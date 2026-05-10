# FreshMart — Project Documentation Report

**FreshMart** is a full-stack grocery e-commerce web application that enables customers to browse products, place orders with or without an account, pay online via Razorpay, and track deliveries in real time. A comprehensive admin portal gives store operators full control over inventory, orders, promotions, delivery operations, and store settings.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [API Reference](#api-reference)
6. [Project Structure](#project-structure)
7. [Setup & Installation](#setup--installation)
8. [Environment Variables](#environment-variables)
9. [Default Seed Data](#default-seed-data)
10. [Security](#security)

---

## Features

### Customer-Facing

- **Product Browsing** — Browse products by category, search by name, and view detailed product pages with images, descriptions, price, and stock status.
- **Shopping Cart** — Add, remove, and adjust quantities. Cart is persisted to `localStorage` so items survive page reloads and anonymous sessions.
- **Checkout — Authenticated** — Logged-in users proceed directly to address and payment. Delivery address can be selected via Google Maps pin or entered manually.
- **Checkout — Guest** — No account required. Guests enter name, email, and phone at checkout.
- **Pincode Validation** — Only pincodes in the configured delivery areas are accepted at checkout.
- **Coupon Codes** — Apply percentage or fixed-amount discount codes with expiry dates, usage limits, and minimum order thresholds.
- **Razorpay Payments** — Secure hosted payment flow. Orders are confirmed via a backend webhook after payment capture.
- **Order Tracking** — Live order status progression (Pending → Processing → Out for Delivery → Delivered) with a countdown timer showing estimated delivery time. Auto-refreshes every 15 seconds.
- **Guest Order Tracking** — Guests receive a unique access token URL to track their order without logging in.
- **Order History** — Authenticated users can view all past orders with status badges and item breakdowns.

### Admin Portal

- **Dashboard Analytics** — Revenue and order count cards with period-over-period percentage change (today / this week / this month). Revenue comparison line chart (current vs previous period). Recent orders table and low-stock alerts.
- **Product Management** — Full CRUD. Upload product images directly to Cloudinary from the browser. Toggle active/inactive status.
- **Category Management** — Create, rename, and reorder categories via drag-friendly sort order fields.
- **Inventory Management** — Batch-update stock quantities across all products from a single table view.
- **Order Management** — Filter by status or date range. Update order status through its lifecycle. Assign delivery agents to orders.
- **Delivery Agents** — Manage agent profiles (name, phone, vehicle type, active flag).
- **Delivery Areas** — Define which pincodes are eligible for delivery.
- **Coupon Management** — Create and manage discount codes (percentage or fixed), set expiry dates and usage caps.
- **Customer Management** — View registered users, ban/unban accounts.
- **Payment History** — Browse all payment transactions with Razorpay IDs and statuses.
- **Store Settings** — Configure store name, delivery fee, minimum order amount, and delivery ETA range via a key-value settings store.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend framework** | React | 19.2.4 |
| **Build tool** | Vite | 8.0.4 |
| **CSS framework** | Tailwind CSS | 4.2.4 |
| **UI primitives** | Radix UI | 1.4.3 |
| **Component variants** | class-variance-authority | 0.7.1 |
| **Icons** | Lucide React | 1.11.0 |
| **Charts** | Recharts | 3.8.1 |
| **HTTP client** | Axios | 1.15.0 |
| **Routing (frontend)** | React Router DOM | 7.14.0 |
| **Date formatting** | date-fns | 4.1.0 |
| **Maps** | @react-google-maps/api | 2.20.8 |
| **Notifications** | react-hot-toast | 2.6.0 |
| **Backend framework** | Express | 5.2.1 |
| **Query builder** | Knex | 3.2.9 |
| **Database** | PostgreSQL | ≥ 14 |
| **PostgreSQL driver** | pg | 8.20.0 |
| **Authentication** | jsonwebtoken | 9.0.3 |
| **Password hashing** | bcrypt | 6.0.0 |
| **Payment gateway** | Razorpay Node SDK | 2.9.6 |
| **Image storage** | Cloudinary (unsigned upload) | — |
| **Runtime** | Node.js | ≥ 18 |

---

## System Architecture

```
┌───────────────────────────────────────────────────────────┐
│                     Browser Client                        │
│                                                           │
│   React 19 + Vite  ┌─────────────┐  ┌─────────────────┐  │
│   Tailwind CSS v4  │ AuthContext │  │   CartContext   │  │
│   React Router v7  │ (JWT token  │  │ (localStorage   │  │
│                    │  in ls)     │  │  cart items)    │  │
│                    └─────────────┘  └─────────────────┘  │
└──────────────────────────┬────────────────────────────────┘
                           │  Axios (Bearer JWT)
                           ▼
┌───────────────────────────────────────────────────────────┐
│              Node.js / Express 5  (port 5000)             │
│                                                           │
│  /api/auth       /api/products    /api/cart               │
│  /api/orders     /api/coupons     /api/user               │
│  /api/admin/*    /api/webhook/razorpay                    │
│                                                           │
│  Middleware: requireAuth · attachUser · requireRole       │
│  Error handling: asyncHandler + AppError                  │
└──────────────┬──────────────────────────┬─────────────────┘
               │ Knex                     │ Razorpay SDK
               ▼                          ▼
┌──────────────────────┐    ┌──────────────────────────────┐
│  PostgreSQL Database │    │  External Services           │
│                      │    │  ┌──────────────────────┐    │
│  11 tables           │    │  │ Razorpay (payments)  │    │
│  8 migrations        │    │  ├──────────────────────┤    │
│  3 seed files        │    │  │ Cloudinary (images)  │    │
└──────────────────────┘    │  ├──────────────────────┤    │
                            │  │ Google Maps (address)│    │
                            │  └──────────────────────┘    │
                            └──────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|---|---|
| Cart stored in `localStorage` | Enables guest cart without any server-side session |
| JWT in `localStorage` (not cookies) | Simpler CORS setup for a decoupled SPA + API |
| Knex query builder (not ORM) | Transparent SQL, easy migration control |
| Express 5 | Native async error propagation — no need for try/catch in every handler |
| Client-side Cloudinary upload | No server-side file handling needed; zero storage cost on backend |
| Guest access tokens on orders | Orders are shareable/trackable without requiring account creation |

---

## Database Schema

### Entity Relationship Overview

```
users ──────────┬──── orders ──── order_items ──── products ──── categories
                │         │
delivery_agents ┘    payments
                │
             coupons
             delivery_areas
             settings (key-value)
             cart_items
```

### Tables

#### `users`
| Column | Type | Notes |
|---|---|---|
| id | integer PK | auto-increment |
| name | string | required |
| email | string | unique |
| phone | string | nullable |
| password_hash | string | nullable (future OAuth support) |
| clerk_id | string | nullable, unique — legacy field |
| role | enum | `customer` \| `admin`; default `customer` |
| is_banned | boolean | default false |
| email_verified | boolean | default false |
| created_at / updated_at | timestamp | auto-managed |

#### `categories`
| Column | Type | Notes |
|---|---|---|
| id | integer PK | |
| name | string | required |
| slug | string | unique |
| sort_order | integer | default 0, controls display order |
| created_at / updated_at | timestamp | |

#### `products`
| Column | Type | Notes |
|---|---|---|
| id | integer PK | |
| name | string | required |
| description | text | nullable |
| category_id | integer FK | → categories.id; SET NULL on delete |
| price | decimal(10,2) | required |
| unit | string | e.g. `piece`, `kg`, `dozen`; default `piece` |
| stock_qty | integer | default 0 |
| image_url | string | Cloudinary secure URL |
| is_active | boolean | default true |
| created_at / updated_at | timestamp | |

#### `orders`
| Column | Type | Notes |
|---|---|---|
| id | integer PK | |
| user_id | integer FK | → users.id; CASCADE; nullable (guest orders) |
| guest_name / guest_email / guest_phone | string | nullable |
| status | enum | `pending` `processing` `out_for_delivery` `delivered` `cancelled` `refunded` |
| total_amount | decimal(10,2) | |
| delivery_address | text | required |
| delivery_pincode | string | nullable |
| razorpay_order_id | string | |
| access_token | string | unique; UUID for guest order tracking |
| estimated_delivery | timestamp | set when status → out_for_delivery |
| delivery_agent_id | integer FK | → delivery_agents.id; nullable |
| coupon_id | integer FK | → coupons.id; nullable |
| discount_amount | decimal(10,2) | default 0 |
| created_at / updated_at | timestamp | |

#### `order_items`
| Column | Type | Notes |
|---|---|---|
| id | integer PK | |
| order_id | integer FK | → orders.id; CASCADE |
| product_id | integer FK | → products.id; SET NULL |
| quantity | integer | required |
| unit_price | decimal(10,2) | snapshot price at purchase time |

#### `payments`
| Column | Type | Notes |
|---|---|---|
| id | integer PK | |
| order_id | integer FK | → orders.id; CASCADE |
| razorpay_payment_id | string | |
| amount | decimal(10,2) | |
| status | enum | `created` `captured` `failed` |
| paid_at | timestamp | nullable |
| created_at / updated_at | timestamp | |

#### `cart_items`
| Column | Type | Notes |
|---|---|---|
| id | integer PK | |
| user_id | integer FK | → users.id; CASCADE |
| product_id | integer FK | → products.id; CASCADE |
| quantity | integer | default 1 |
| — | unique | `(user_id, product_id)` |
| created_at / updated_at | timestamp | |

> **Note:** The `cart_items` table exists but the current frontend uses localStorage for cart management. It is reserved for future server-side cart sync.

#### `delivery_agents`
| Column | Type | Notes |
|---|---|---|
| id | integer PK | |
| name | string | required |
| phone | string | required |
| vehicle_type | string | default `bike` |
| is_active | boolean | default true |
| created_at / updated_at | timestamp | |

#### `coupons`
| Column | Type | Notes |
|---|---|---|
| id | integer PK | |
| code | string | unique |
| description | text | nullable |
| discount_type | enum | `percentage` \| `fixed` |
| discount_value | decimal(10,2) | |
| min_order_amount | decimal(10,2) | default 0 |
| max_uses | integer | nullable (unlimited if null) |
| used_count | integer | default 0 |
| is_active | boolean | default true |
| starts_at / expires_at | timestamp | nullable |
| created_at / updated_at | timestamp | |

#### `delivery_areas`
| Column | Type | Notes |
|---|---|---|
| pincode | string PK | |
| area_name | string | required |
| is_active | boolean | default true |
| created_at / updated_at | timestamp | |

#### `settings`
| Column | Type | Notes |
|---|---|---|
| key | string PK | |
| value | text | |
| updated_at | timestamp | |

**Default keys:** `store_name`, `delivery_fee`, `min_order_amount`, `delivery_eta_min`, `delivery_eta_max`, `store_open`

### Migration History

| # | File | Change |
|---|---|---|
| 1 | 20240101000001_initial_schema | Core tables: users, categories, products, orders, order_items, payments, cart_items |
| 2 | 20240101000002_guest_checkout | Add guest_* columns to orders; make user_id nullable |
| 3 | 20240101000003_order_access_token | Add unique access_token to orders |
| 4 | 20240101000004_order_eta | Add estimated_delivery to orders |
| 5 | 20240101000005_custom_auth | Make clerk_id nullable; add password_hash, email_verified; unique email |
| 6 | 20240101000006_categories_sort_order | Add sort_order to categories |
| 7 | 20240101000007_settings_table | Create settings key-value store |
| 8 | 20240101000008_admin_expansions | Add is_banned to users; create delivery_agents, coupons, delivery_areas; extend orders |

---

## API Reference

All endpoints are prefixed with `/api`. JSON is the request/response format throughout.

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | None | Register a new customer account |
| POST | `/auth/login` | None | Login (customer or admin) — returns JWT |
| GET | `/auth/me` | Bearer JWT | Get current authenticated user's profile |

### Products — `/api/products` (Public)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/products` | None | List products (query: `category`, `search`, `page`, `limit`) |
| GET | `/products/categories` | None | List all product categories |
| GET | `/products/:id` | None | Get a single product by ID |

### Cart — `/api/cart` (Auth required, customer role)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/cart` | JWT | Get current user's cart items |
| POST | `/cart` | JWT | Add product to cart |
| PUT | `/cart/:id` | JWT | Update cart item quantity |
| DELETE | `/cart/:id` | JWT | Remove single cart item |
| DELETE | `/cart` | JWT | Clear entire cart |

### Orders — `/api/orders`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/orders` | Optional | Create order (guest or authenticated) |
| POST | `/orders/verify-payment` | Optional | Verify Razorpay payment and capture order |
| GET | `/orders` | JWT (customer) | List authenticated user's orders |
| GET | `/orders/:id` | Optional | Get order details (auth or `?token=` for guests) |

### Coupons — `/api/coupons`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/coupons/validate` | None | Validate a coupon code against an order total |

### Admin — `/api/admin/*` (Admin JWT required for all)

**Dashboard**

| Method | Path | Description |
|---|---|---|
| GET | `/admin/dashboard` | Legacy overview stats |
| GET | `/admin/dashboard/stats` | Period-based stats (query: `period=today\|week\|month`) |

**Products**

| Method | Path | Description |
|---|---|---|
| GET | `/admin/products` | List all products (paginated) |
| POST | `/admin/products` | Create product |
| PUT | `/admin/products/:id` | Update product |
| DELETE | `/admin/products/:id` | Deactivate product (soft delete) |

**Inventory**

| Method | Path | Description |
|---|---|---|
| GET | `/admin/inventory` | List all products with stock quantities |
| PUT | `/admin/inventory` | Batch update stock quantities |

**Categories**

| Method | Path | Description |
|---|---|---|
| GET | `/admin/categories` | List categories |
| POST | `/admin/categories` | Create category |
| PUT | `/admin/categories/:id` | Update category |
| DELETE | `/admin/categories/:id` | Delete category |
| PUT | `/admin/categories/reorder` | Update sort_order for multiple categories |

**Orders**

| Method | Path | Description |
|---|---|---|
| GET | `/admin/orders` | List orders (filter: status, from, to; paginated) |
| PUT | `/admin/orders/:id/status` | Update order status |
| PUT | `/admin/orders/:id/assign` | Assign delivery agent to order |

**Users**

| Method | Path | Description |
|---|---|---|
| GET | `/admin/users` | List all users (filter: search, role) |
| GET | `/admin/users/:id` | Get user with order history |
| PUT | `/admin/users/:id` | Update user (ban/unban, role change) |

**Delivery Agents**

| Method | Path | Description |
|---|---|---|
| GET | `/admin/delivery-agents` | List delivery agents |
| POST | `/admin/delivery-agents` | Create agent |
| PUT | `/admin/delivery-agents/:id` | Update agent |
| DELETE | `/admin/delivery-agents/:id` | Remove agent |

**Coupons**

| Method | Path | Description |
|---|---|---|
| GET | `/admin/coupons` | List all coupons |
| POST | `/admin/coupons` | Create coupon |
| GET | `/admin/coupons/:id` | Get coupon details |
| PUT | `/admin/coupons/:id` | Update coupon |
| DELETE | `/admin/coupons/:id` | Delete coupon |

**Payments**

| Method | Path | Description |
|---|---|---|
| GET | `/admin/payments` | List all payments (paginated) |
| GET | `/admin/payments/:id` | Get single payment |

**Delivery Areas**

| Method | Path | Description |
|---|---|---|
| GET | `/admin/delivery-areas` | List all delivery pincodes |
| POST | `/admin/delivery-areas` | Add a delivery area |
| PUT | `/admin/delivery-areas/:id` | Update area |
| DELETE | `/admin/delivery-areas/:id` | Remove area |

**Settings**

| Method | Path | Description |
|---|---|---|
| GET | `/admin/settings` | Get all key-value settings |
| PUT | `/admin/settings` | Update one or more settings |

### Webhook — `/api/webhook`

| Method | Path | Description |
|---|---|---|
| POST | `/webhook/razorpay` | Razorpay payment event webhook (HMAC-SHA256 verified) |

---

## Project Structure

```
grocery-store/
├── backend/
│   ├── src/
│   │   ├── index.js                  # Entry point — mounts routers, global error handler
│   │   ├── app.js                    # Express app configuration
│   │   ├── middleware/
│   │   │   └── auth.js               # requireAuth, attachUser, requireRole, helpers
│   │   ├── routes/
│   │   │   ├── admin.js              # All /api/admin/* routes (auth enforced at router level)
│   │   │   ├── auth.js               # /api/auth
│   │   │   ├── cart.js               # /api/cart
│   │   │   ├── orders.js             # /api/orders
│   │   │   ├── products.js           # /api/products
│   │   │   ├── user.js               # /api/user
│   │   │   └── webhook.js            # /api/webhook
│   │   ├── controllers/
│   │   │   ├── adminController.js    # All admin business logic (~600 lines)
│   │   │   ├── cartController.js
│   │   │   ├── orderController.js
│   │   │   └── productController.js
│   │   ├── db/
│   │   │   ├── db.js                 # Knex instance
│   │   │   ├── migrations/           # 8 migration files
│   │   │   └── seeds/                # 3 seed files (admin user, products, delivery areas)
│   │   └── utils/
│   │       └── helpers.js            # asyncHandler, AppError, paginate, escapeLike
│   ├── .env                          # Local secrets (not committed)
│   ├── .env.example                  # Environment variable template
│   ├── knexfile.js                   # Knex config for development + test environments
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                  # React root — wraps with AuthProvider
│   │   ├── App.jsx                   # BrowserRouter, route definitions, ProtectedRoute
│   │   ├── index.css                 # Tailwind v4 @theme tokens, global reset
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # JWT auth state, login/logout, Axios header sync
│   │   │   └── CartContext.jsx       # localStorage cart state
│   │   ├── lib/
│   │   │   ├── api.js                # Axios instance (baseURL = VITE_API_URL)
│   │   │   └── utils.js             # cn() helper (clsx + tailwind-merge)
│   │   ├── components/
│   │   │   ├── AdminLayout.jsx       # Admin shell: fixed sidebar + sticky top bar
│   │   │   ├── AdminSidebar.jsx      # Grouped nav, user footer, mobile drawer
│   │   │   ├── Navbar.jsx            # Customer-facing top navigation
│   │   │   ├── ProductCard.jsx       # Product grid card
│   │   │   ├── DeliveryTracker.jsx   # Multi-step status progress bar
│   │   │   ├── LocationPicker.jsx    # Google Maps address picker modal
│   │   │   ├── PromoBanners.jsx      # Homepage promotional banners
│   │   │   └── ui/                   # shadcn-style primitives
│   │   │       ├── button.jsx        # Button with 6 variants, 8 sizes (CVA)
│   │   │       ├── card.jsx
│   │   │       ├── input.jsx
│   │   │       ├── label.jsx
│   │   │       ├── badge.jsx
│   │   │       ├── table.jsx
│   │   │       ├── dialog.jsx
│   │   │       ├── select.jsx
│   │   │       ├── textarea.jsx
│   │   │       ├── dropdown-menu.jsx
│   │   │       ├── switch.jsx
│   │   │       ├── toast.jsx
│   │   │       └── toaster.jsx
│   │   └── pages/
│   │       ├── Home.jsx              # Product browsing — sidebar, search, category pills
│   │       ├── ProductDetail.jsx     # Single product view + add to cart
│   │       ├── Cart.jsx              # Cart management + order summary
│   │       ├── Checkout.jsx          # Address, coupon, Razorpay payment
│   │       ├── OrderConfirmation.jsx # Post-payment success page
│   │       ├── OrderTracking.jsx     # Live status tracking + ETA countdown
│   │       ├── Orders.jsx            # Authenticated user's order history
│   │       ├── Login.jsx             # Customer login
│   │       ├── Register.jsx          # Customer registration
│   │       ├── Admin.jsx             # Admin route shell (renders AdminLayout)
│   │       ├── AdminLogin.jsx        # Admin-specific login
│   │       ├── AdminDashboard.jsx    # Analytics: stat cards, revenue chart, recent orders
│   │       ├── AdminProducts.jsx     # Product CRUD + Cloudinary image upload
│   │       ├── AdminCategories.jsx   # Category management
│   │       ├── AdminInventory.jsx    # Batch stock update
│   │       ├── AdminOrders.jsx       # Order management + status updates
│   │       ├── AdminUsers.jsx        # Customer list + ban controls
│   │       ├── AdminDelivery.jsx     # Delivery agent management
│   │       ├── AdminPromotions.jsx   # Coupon CRUD
│   │       ├── AdminPayments.jsx     # Payment transaction log
│   │       └── AdminSettings.jsx     # Store settings form
│   ├── .env                          # Frontend env vars (not committed)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── CLAUDE.md                         # AI assistant instructions for this codebase
└── REPORT.md                         # This file
```

---

## Setup & Installation

### Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14 (running locally or via a hosted service)
- npm ≥ 9

### 1. Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure Environment Variables

Copy the example files and fill in your values:

```bash
cp backend/.env.example backend/.env
```

See the [Environment Variables](#environment-variables) section below for all required keys.

### 3. Create the Database

```bash
# In PostgreSQL, create the database:
createdb grocery_store

# Or connect with psql and run:
# CREATE DATABASE grocery_store;
```

### 4. Run Migrations and Seeds

```bash
cd backend
npm run migrate     # applies all 8 migrations
npm run seed        # seeds admin user, 6 categories, 15 products, 1 delivery area
```

### 5. Start the Development Servers

```bash
# Backend (port 5000)
cd backend && npm run dev

# Frontend (port 5173) — separate terminal
cd frontend && npm run dev
```

The application is now accessible at `http://localhost:5173`.  
The API runs at `http://localhost:5000`.

---

## Environment Variables

### Backend — `backend/.env`

```env
PORT=5000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=grocery_store
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=change-me-to-a-long-random-string

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend — `frontend/.env`

```env
# Backend API base URL
VITE_API_URL=http://localhost:5000/api

# Razorpay (publishable key — safe to expose in frontend)
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx

# Google Maps (restrict to your domain in production)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Cloudinary (unsigned upload — safe to expose in frontend)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

---

## Default Seed Data

Running `npm run seed` in the backend directory populates the database with:

### Admin Account
| Field | Value |
|---|---|
| Email | admin@freshmart.com |
| Password | admin123 |
| Role | admin |

> **Change these credentials before any production deployment.**

### Product Categories (6)
Fruits & Vegetables · Dairy & Eggs · Grains & Staples · Snacks & Beverages · Spices & Condiments · Bakery

### Sample Products (15)
Banana, Tomato, Onion, Apple, Milk (500 ml), Eggs (6-pack), Paneer (200 g), Rice (5 kg), Wheat Flour (5 kg), Toor Dal (1 kg), Chips (Large), Cola (2 L), Turmeric Powder, Red Chili Powder, Bread.

### Delivery Area
| Pincode | Area |
|---|---|
| 784028 | Tezpur |

### Default Store Settings
| Key | Default Value |
|---|---|
| store_name | FreshMart |
| delivery_fee | 25 |
| min_order_amount | 0 |
| delivery_eta_min | 30 |
| delivery_eta_max | 60 |
| store_open | true |

---

## Security

| Mechanism | Implementation |
|---|---|
| **Password hashing** | bcrypt with adaptive cost factor (bcrypt v6) |
| **Authentication tokens** | RS256 JWT, 7-day expiry, stored in browser `localStorage` |
| **Authorization** | Role-based (`customer` / `admin`). `requireRole` middleware on all admin routes. Banned users are rejected at `requireAuth`. |
| **Payment verification** | Razorpay webhook payloads are verified with HMAC-SHA256 using `RAZORPAY_WEBHOOK_SECRET` before any order status change. |
| **Guest order privacy** | Orders are accessible to guests via a UUID `access_token` — not guessable, not enumerable by order ID alone. |
| **SQL injection** | All queries use Knex parameterised bindings. User-supplied LIKE values are sanitised with `escapeLike()`. |
| **Input validation** | AppError throws structured 4xx responses for malformed requests; Express 5 propagates async errors to the global handler. |

---

*Generated for FreshMart — a full-stack grocery e-commerce application.*

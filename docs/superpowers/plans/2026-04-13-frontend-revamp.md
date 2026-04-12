# FreshMart Frontend Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the FreshMart React SPA with a premium boutique-grocer aesthetic using Tailwind + hand-drawn SVG illustrations, per `docs/superpowers/specs/2026-04-13-frontend-revamp-design.md`.

**Architecture:** Tailwind v3 replaces the single global `index.css`. A new `assets/illustrations/` directory holds line-art SVG React components. A new `components/ui/` directory holds reusable primitives (Button, Card, Badge, etc.). Each page keeps its existing data-fetching logic; only JSX + classNames change. Backend API unchanged.

**Tech Stack:** React 19, Vite 8, Tailwind CSS v3, Fraunces + Inter (Google Fonts), lucide-react icons, Clerk, Razorpay, react-hot-toast.

**Verification strategy:** No unit tests exist or are added (spec §8). After each task, the executor runs `npm run lint` and `npm run build`, and manually verifies the affected route in `npm run dev`. Commit after each task.

---

## File Structure

**New files:**
- `frontend/tailwind.config.js`
- `frontend/postcss.config.js`
- `frontend/src/assets/illustrations/{Pear,Loaf,Bottle,Jar,Leaf,Fish,Cup,Basket,Sprig,Sun,Wheat}.jsx`
- `frontend/src/assets/illustrations/index.js`
- `frontend/src/components/ui/{Button,Card,Badge,Input,Textarea,Select,Modal,EyebrowLabel,OrnamentalDivider,EmptyState,Illustration}.jsx`

**Modified files:**
- `frontend/package.json` (add tailwind deps)
- `frontend/index.html` (font `<link>`, title)
- `frontend/src/index.css` (becomes tailwind entry)
- `frontend/src/App.jsx` (loading fallback styling only)
- `frontend/src/components/Navbar.jsx`
- `frontend/src/components/ProductCard.jsx`
- `frontend/src/pages/{Home,ProductDetail,Cart,Checkout,OrderConfirmation,Orders,Admin,AdminProducts,AdminOrders}.jsx`

**Deleted files:** none (`index.css` is rewritten, not deleted).

---

## Task 1: Install Tailwind + configure the design system

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`
- Modify: `frontend/src/index.css`
- Modify: `frontend/index.html`

- [ ] **Step 1: Install Tailwind v3 toolchain**

Run (from `frontend/`):
```bash
npm install -D tailwindcss@^3.4.0 postcss@^8.4.0 autoprefixer@^10.4.0
```
Expected: `package.json` gains the three devDependencies, `package-lock.json` updates.

- [ ] **Step 2: Create `tailwind.config.js`**

Write `frontend/tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#faf7f2',
        surface: '#ffffff',
        ink: { DEFAULT: '#1f2a24', muted: '#6b7468' },
        hairline: '#e8e2d6',
        moss: { DEFAULT: '#3d5a47', deep: '#2a4132' },
        clay: '#b8654a',
        butter: '#f3e9c7',
        sage: '#d8e0cf',
        rose: '#ecd4cc',
        danger: '#a04848',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.12em',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(30,40,35,0.04)',
        lift: '0 10px 30px rgba(30,40,35,0.06)',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 3: Create `postcss.config.js`**

Write `frontend/postcss.config.js`:
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 4: Rewrite `frontend/src/index.css` as the Tailwind entry**

Replace entire file contents:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  body {
    @apply bg-canvas text-ink font-sans;
    line-height: 1.55;
  }
  h1, h2, h3, h4 { @apply font-serif text-ink; }
  a { color: inherit; text-decoration: none; }
  *:focus-visible {
    outline: 2px solid theme('colors.moss.DEFAULT');
    outline-offset: 2px;
    border-radius: 4px;
  }
  img { max-width: 100%; display: block; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      transition-duration: 0.001ms !important;
    }
  }
}

@layer components {
  .eyebrow {
    @apply font-sans uppercase tracking-eyebrow text-[11px] font-semibold text-ink-muted;
  }
  .hairline-divider {
    @apply border-t border-hairline;
  }
}
```

- [ ] **Step 5: Add Google Fonts + update title in `index.html`**

Replace the contents of `frontend/index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
    <title>FreshMart · A considered grocer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Build to verify setup**

Run (from `frontend/`):
```bash
npm run build
```
Expected: build succeeds. The app will look broken (old class names no longer match CSS) — that's fine, we fix it in later tasks.

- [ ] **Step 7: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/tailwind.config.js frontend/postcss.config.js frontend/src/index.css frontend/index.html
git commit -m "feat(frontend): install Tailwind and establish design tokens"
```

---

## Task 2: Create illustration SVG components

**Files:**
- Create: `frontend/src/assets/illustrations/{Pear,Loaf,Bottle,Jar,Leaf,Fish,Cup,Basket,Sprig,Sun,Wheat}.jsx`
- Create: `frontend/src/assets/illustrations/index.js`

All illustrations share the same skeleton: a 160×160 viewBox, `stroke="currentColor"`, `strokeWidth={1.75}`, `strokeLinecap="round"`, `strokeLinejoin="round"`, `fill="none"`, `aria-hidden="true"`. Color comes from the parent via `text-moss` etc.

- [ ] **Step 1: Create `Pear.jsx`**

```jsx
export default function Pear({ size = 160, className = '' }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={className}
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      fill="none" aria-hidden="true">
      <path d="M80 140c-22 0-36-18-36-40 0-22 12-40 28-44 4-1 8-6 8-12 0-6 4-10 8-10s8 4 8 10c0 6 2 10 8 14 14 8 20 26 20 42 0 22-14 40-36 40z" />
      <path d="M80 44c4-6 12-8 18-6" />
      <circle cx="74" cy="92" r="1.5" fill="currentColor" />
    </svg>
  );
}
```

- [ ] **Step 2: Create `Loaf.jsx`**

```jsx
export default function Loaf({ size = 160, className = '' }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={className}
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      fill="none" aria-hidden="true">
      <path d="M30 100c0-22 22-40 50-40s50 18 50 40c0 6-4 10-10 10H40c-6 0-10-4-10-10z" />
      <path d="M56 80c-4 6-6 14-6 22" />
      <path d="M80 72c-4 6-6 16-6 26" />
      <path d="M104 80c-4 6-6 14-6 22" />
    </svg>
  );
}
```

- [ ] **Step 3: Create `Bottle.jsx`**

```jsx
export default function Bottle({ size = 160, className = '' }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={className}
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      fill="none" aria-hidden="true">
      <path d="M70 24h20v20c0 4 2 6 4 10 6 10 10 18 10 32v54c0 4-4 8-8 8H64c-4 0-8-4-8-8V86c0-14 4-22 10-32 2-4 4-6 4-10V24z" />
      <path d="M64 86h32" />
      <rect x="66" y="98" width="28" height="22" rx="2" />
    </svg>
  );
}
```

- [ ] **Step 4: Create `Jar.jsx`**

```jsx
export default function Jar({ size = 160, className = '' }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={className}
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      fill="none" aria-hidden="true">
      <rect x="46" y="36" width="68" height="20" rx="3" />
      <path d="M50 56h60l-4 78c0 4-4 8-8 8H62c-4 0-8-4-8-8l-4-78z" />
      <path d="M56 80h48" />
      <path d="M56 110h48" />
    </svg>
  );
}
```

- [ ] **Step 5: Create `Leaf.jsx` (generic / fallback)**

```jsx
export default function Leaf({ size = 160, className = '' }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={className}
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      fill="none" aria-hidden="true">
      <path d="M36 124c0-44 36-80 80-80 4 0 8 4 8 8 0 44-36 80-80 80-4 0-8-4-8-8z" />
      <path d="M44 116l70-70" />
      <path d="M60 104c4-8 12-16 20-20" />
      <path d="M74 118c6-10 16-20 26-24" />
    </svg>
  );
}
```

- [ ] **Step 6: Create `Fish.jsx`**

```jsx
export default function Fish({ size = 160, className = '' }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={className}
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      fill="none" aria-hidden="true">
      <path d="M30 80c10-20 32-32 56-32 18 0 32 8 44 24l16-12v40l-16-12c-12 16-26 24-44 24-24 0-46-12-56-32z" />
      <circle cx="62" cy="74" r="2" fill="currentColor" />
      <path d="M80 70c4 4 4 16 0 20" />
    </svg>
  );
}
```

- [ ] **Step 7: Create `Cup.jsx`**

```jsx
export default function Cup({ size = 160, className = '' }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={className}
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      fill="none" aria-hidden="true">
      <path d="M46 60h60l-4 54c0 10-8 18-18 18H68c-10 0-18-8-18-18l-4-54z" />
      <path d="M106 74h10c8 0 14 6 14 14s-6 14-14 14h-8" />
      <path d="M64 36c-2 6-2 12 0 18" />
      <path d="M78 36c-2 6-2 12 0 18" />
      <path d="M92 36c-2 6-2 12 0 18" />
    </svg>
  );
}
```

- [ ] **Step 8: Create `Basket.jsx`**

```jsx
export default function Basket({ size = 160, className = '' }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} className={className}
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      fill="none" aria-hidden="true">
      <path d="M30 70h100l-10 58c-1 6-6 10-12 10H52c-6 0-11-4-12-10L30 70z" />
      <path d="M50 70l20-30" />
      <path d="M110 70l-20-30" />
      <path d="M30 70h100" />
      <path d="M60 90v38" />
      <path d="M80 90v38" />
      <path d="M100 90v38" />
    </svg>
  );
}
```

- [ ] **Step 9: Create `Sprig.jsx` (decorative)**

```jsx
export default function Sprig({ size = 80, className = '' }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} className={className}
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      fill="none" aria-hidden="true">
      <path d="M40 70V20" />
      <path d="M40 30c-6 0-12-4-14-10" />
      <path d="M40 40c6 0 12-4 14-10" />
      <path d="M40 50c-6 0-12-4-14-10" />
      <path d="M40 60c6 0 12-4 14-10" />
    </svg>
  );
}
```

- [ ] **Step 10: Create `Sun.jsx` (decorative)**

```jsx
export default function Sun({ size = 96, className = '' }) {
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} className={className}
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      fill="none" aria-hidden="true">
      <circle cx="48" cy="48" r="16" />
      <path d="M48 14v10" />
      <path d="M48 72v10" />
      <path d="M14 48h10" />
      <path d="M72 48h10" />
      <path d="M24 24l7 7" />
      <path d="M65 65l7 7" />
      <path d="M72 24l-7 7" />
      <path d="M31 65l-7 7" />
    </svg>
  );
}
```

- [ ] **Step 11: Create `Wheat.jsx` (decorative)**

```jsx
export default function Wheat({ size = 80, className = '' }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} className={className}
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      fill="none" aria-hidden="true">
      <path d="M40 74V20" />
      <ellipse cx="40" cy="26" rx="5" ry="8" />
      <ellipse cx="32" cy="36" rx="5" ry="8" />
      <ellipse cx="48" cy="36" rx="5" ry="8" />
      <ellipse cx="32" cy="50" rx="5" ry="8" />
      <ellipse cx="48" cy="50" rx="5" ry="8" />
    </svg>
  );
}
```

- [ ] **Step 12: Create `index.js` with category mapping**

Write `frontend/src/assets/illustrations/index.js`:
```js
import Pear from './Pear.jsx';
import Loaf from './Loaf.jsx';
import Bottle from './Bottle.jsx';
import Jar from './Jar.jsx';
import Leaf from './Leaf.jsx';
import Fish from './Fish.jsx';
import Cup from './Cup.jsx';
import Basket from './Basket.jsx';
import Sprig from './Sprig.jsx';
import Sun from './Sun.jsx';
import Wheat from './Wheat.jsx';

export { Pear, Loaf, Bottle, Jar, Leaf, Fish, Cup, Basket, Sprig, Sun, Wheat };

// Map category slug -> illustration component.
// Unknown slugs fall back to Leaf.
const CATEGORY_MAP = {
  'fruits': Pear,
  'vegetables': Leaf,
  'produce': Pear,
  'fruits-vegetables': Pear,
  'bakery': Loaf,
  'bread': Loaf,
  'dairy': Bottle,
  'dairy-eggs': Bottle,
  'pantry': Jar,
  'staples': Jar,
  'snacks': Jar,
  'meat': Fish,
  'seafood': Fish,
  'meat-seafood': Fish,
  'beverages': Cup,
  'drinks': Cup,
  'herbs': Leaf,
};

// Map category slug -> tinted background color class (Tailwind).
// Unknown slugs fall back to sage.
const CATEGORY_TINT = {
  'fruits': 'bg-rose',
  'vegetables': 'bg-sage',
  'produce': 'bg-rose',
  'fruits-vegetables': 'bg-rose',
  'bakery': 'bg-butter',
  'bread': 'bg-butter',
  'dairy': 'bg-butter',
  'dairy-eggs': 'bg-butter',
  'pantry': 'bg-butter',
  'staples': 'bg-butter',
  'snacks': 'bg-butter',
  'meat': 'bg-rose',
  'seafood': 'bg-sage',
  'meat-seafood': 'bg-rose',
  'beverages': 'bg-sage',
  'drinks': 'bg-sage',
  'herbs': 'bg-sage',
};

export function getIllustrationForCategory(slug) {
  if (!slug) return Leaf;
  return CATEGORY_MAP[slug.toLowerCase()] || Leaf;
}

export function getTintForCategory(slug) {
  if (!slug) return 'bg-sage';
  return CATEGORY_TINT[slug.toLowerCase()] || 'bg-sage';
}
```

- [ ] **Step 13: Build to verify syntax**

```bash
npm run build
```
Expected: build succeeds (illustrations aren't imported anywhere yet, but they must parse).

- [ ] **Step 14: Commit**

```bash
git add frontend/src/assets/illustrations/
git commit -m "feat(frontend): add hand-drawn SVG illustration set"
```

---

## Task 3: Build UI primitives

**Files:**
- Create: `frontend/src/components/ui/{Button,Card,Badge,Input,Textarea,Select,Modal,EyebrowLabel,OrnamentalDivider,EmptyState,Illustration}.jsx`

- [ ] **Step 1: `Illustration.jsx`**

```jsx
import * as all from '../../assets/illustrations';

export default function Illustration({ name, size = 160, className = '' }) {
  const Component = all[name] || all.Leaf;
  return <Component size={size} className={className} />;
}
```

- [ ] **Step 2: `Button.jsx`**

```jsx
const VARIANTS = {
  primary: 'bg-moss text-canvas hover:bg-moss-deep focus-visible:bg-moss-deep',
  secondary: 'bg-transparent text-ink border border-hairline hover:bg-hairline/40',
  ghost: 'bg-transparent text-moss hover:text-moss-deep underline underline-offset-4 decoration-moss/40 hover:decoration-moss-deep',
  danger: 'bg-transparent text-danger border border-danger/30 hover:bg-danger/10',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px]',
  md: 'px-5 py-2.5 text-[15px] min-h-[44px]',
  lg: 'px-7 py-3.5 text-base min-h-[52px]',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-sm font-sans font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
  const width = fullWidth ? 'w-full' : '';
  return (
    <button className={`${base} ${VARIANTS[variant]} ${SIZES[size]} ${width} ${className}`} {...props}>
      {children}
    </button>
  );
}
```

- [ ] **Step 3: `Card.jsx`**

```jsx
export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-surface border border-hairline rounded-md shadow-soft ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: `Badge.jsx`**

```jsx
const TONES = {
  sage: 'bg-sage text-moss-deep',
  butter: 'bg-butter text-ink',
  rose: 'bg-rose text-clay',
  danger: 'bg-danger/10 text-danger',
  moss: 'bg-moss/10 text-moss-deep',
};

export default function Badge({ tone = 'sage', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-[11px] font-medium font-sans uppercase tracking-eyebrow ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 5: `Input.jsx`**

```jsx
export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full bg-surface border border-hairline rounded-sm px-3.5 py-2.5 text-[15px] font-sans text-ink placeholder:text-ink-muted focus:border-moss focus:outline-none transition-colors ${className}`}
      {...props}
    />
  );
}
```

- [ ] **Step 6: `Textarea.jsx`**

```jsx
export default function Textarea({ className = '', rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`w-full bg-surface border border-hairline rounded-sm px-3.5 py-2.5 text-[15px] font-sans text-ink placeholder:text-ink-muted focus:border-moss focus:outline-none transition-colors resize-vertical ${className}`}
      {...props}
    />
  );
}
```

- [ ] **Step 7: `Select.jsx`**

```jsx
export default function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`bg-surface border border-hairline rounded-sm px-3.5 py-2.5 text-[15px] font-sans text-ink focus:border-moss focus:outline-none transition-colors ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
```

- [ ] **Step 8: `EyebrowLabel.jsx`**

```jsx
export default function EyebrowLabel({ className = '', children }) {
  return <span className={`eyebrow ${className}`}>{children}</span>;
}
```

- [ ] **Step 9: `OrnamentalDivider.jsx`**

```jsx
import { Sprig } from '../../assets/illustrations';

export default function OrnamentalDivider({ className = '' }) {
  return (
    <div className={`flex items-center gap-4 my-10 ${className}`} aria-hidden="true">
      <span className="flex-1 h-px bg-hairline" />
      <Sprig size={32} className="text-moss/60" />
      <span className="flex-1 h-px bg-hairline" />
    </div>
  );
}
```

- [ ] **Step 10: `EmptyState.jsx`**

```jsx
import Illustration from './Illustration';

export default function EmptyState({ illustration = 'Basket', title, body, action }) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-4">
      <Illustration name={illustration} size={120} className="text-moss/70 mb-6" />
      <h2 className="font-serif text-2xl text-ink mb-2">{title}</h2>
      {body && <p className="text-ink-muted max-w-md mb-6">{body}</p>}
      {action}
    </div>
  );
}
```

- [ ] **Step 11: `Modal.jsx`**

```jsx
import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-ink/40 flex items-center justify-center p-4 animate-[fadeIn_240ms_ease-out]"
      onClick={onClose}
    >
      <div
        className={`bg-surface rounded-md shadow-lift w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
          <h3 className="font-serif text-xl text-ink">{title}</h3>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink p-1 rounded-sm transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
```

Also append to `frontend/src/index.css` `@layer base` (inside the existing layer, above the closing brace):
```css
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
```

- [ ] **Step 12: Build**

```bash
npm run build
```
Expected: build succeeds.

- [ ] **Step 13: Commit**

```bash
git add frontend/src/components/ui/ frontend/src/index.css
git commit -m "feat(frontend): add UI primitive components"
```

---

## Task 4: Rebuild Navbar

**Files:**
- Modify: `frontend/src/components/Navbar.jsx`

- [ ] **Step 1: Replace the entire file**

```jsx
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/clerk-react';
import { ShoppingBag, ClipboardList, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Sprig } from '../assets/illustrations';

export default function Navbar({ userRole }) {
  const { totalItems } = useCart();

  return (
    <nav className="sticky top-0 z-[100] bg-canvas/90 backdrop-blur-sm border-b border-hairline">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-ink">
          <Sprig size={28} className="text-moss" />
          <span className="font-serif text-xl tracking-tight">FreshMart</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className="px-3 py-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
          >
            Shop
          </Link>

          <Link
            to="/cart"
            className="relative px-3 py-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors flex items-center gap-1.5"
            aria-label="Cart"
          >
            <ShoppingBag size={16} />
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-0.5 right-1 w-1.5 h-1.5 rounded-full bg-clay" aria-label={`${totalItems} items`} />
            )}
          </Link>

          <SignedIn>
            <Link
              to="/orders"
              className="px-3 py-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors flex items-center gap-1.5"
            >
              <ClipboardList size={16} />
              <span className="hidden sm:inline">Orders</span>
            </Link>
            {userRole === 'admin' && (
              <Link
                to="/admin"
                className="px-3 py-2 text-sm font-medium text-moss hover:text-moss-deep transition-colors flex items-center gap-1.5"
              >
                <Shield size={16} />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            <div className="ml-2">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="ml-2 inline-flex items-center justify-center px-5 py-2 text-sm font-medium bg-moss text-canvas rounded-sm hover:bg-moss-deep transition-colors min-h-[40px]">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Run dev and visually verify**

```bash
npm run dev
```
Open http://localhost:5173 — navbar should render with cream bg, Sprig + Fraunces "FreshMart", moss nav links. Cart dot appears when items are in cart.

Also update the loading fallback in `App.jsx`: replace `<div className="loading">Loading...</div>` (line 33) with:
```jsx
<div className="flex items-center justify-center py-24 text-ink-muted font-sans">Loading…</div>
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Navbar.jsx frontend/src/App.jsx
git commit -m "feat(frontend): rebuild Navbar with boutique styling"
```

---

## Task 5: Rebuild ProductCard

**Files:**
- Modify: `frontend/src/components/ProductCard.jsx`

- [ ] **Step 1: Replace the entire file**

```jsx
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getIllustrationForCategory, getTintForCategory } from '../assets/illustrations';
import EyebrowLabel from './ui/EyebrowLabel';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const Illustration = getIllustrationForCategory(product.category_slug);
  const tint = getTintForCategory(product.category_slug);
  const inStock = product.stock_qty > 0;

  return (
    <div className="group bg-surface border border-hairline rounded-md overflow-hidden transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lift">
      <Link to={`/product/${product.id}`} className="block">
        <div className={`${tint} aspect-[4/3] flex items-center justify-center`}>
          <Illustration size={110} className="text-moss-deep transition-colors duration-150 group-hover:text-moss-deep" />
        </div>
      </Link>
      <div className="p-5">
        <EyebrowLabel>{product.category_name || 'Grocer'}</EyebrowLabel>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-serif text-lg text-ink mt-1 mb-2 leading-tight">{product.name}</h3>
        </Link>
        <div className="flex items-baseline gap-1 mb-4">
          <span className="font-serif text-xl text-ink">₹{product.price}</span>
          <span className="text-xs text-ink-muted">/ {product.unit}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-xs ${inStock ? 'text-moss' : 'text-danger'}`}>
            {inStock ? 'In stock' : 'Out of stock'}
          </span>
          {inStock && (
            <button
              onClick={() => addToCart(product)}
              className="text-sm font-medium text-moss hover:text-moss-deep underline underline-offset-4 decoration-moss/30 hover:decoration-moss-deep transition-colors"
            >
              Add to cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

Note: `product.category_slug` may not exist on the current API payload. The backend `GET /products` returns `category_name` and sometimes `category_slug`. The `getIllustrationForCategory` helper defensively falls back to `Leaf` when the slug is missing or unknown, so this works either way. If the category names are available but slugs aren't, a small patch in later tasks can derive slug from name.

- [ ] **Step 2: Run dev, verify Home shows cards with tinted illustrations**

Home page will still have old styling but ProductCards should look new.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ProductCard.jsx
git commit -m "feat(frontend): rebuild ProductCard with illustrated panel"
```

---

## Task 6: Rebuild Home page

**Files:**
- Modify: `frontend/src/pages/Home.jsx`

- [ ] **Step 1: Replace the entire file**

```jsx
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';
import EyebrowLabel from '../components/ui/EyebrowLabel';
import OrnamentalDivider from '../components/ui/OrnamentalDivider';
import EmptyState from '../components/ui/EmptyState';
import { Sprig, Wheat } from '../assets/illustrations';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/categories').then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (search) params.search = search;

    api.get('/products', { params })
      .then(({ data }) => setProducts(data.products))
      .finally(() => setLoading(false));
  }, [selectedCategory, search]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Editorial hero */}
      <header className="text-center mb-12 sm:mb-16 relative">
        <Wheat size={56} className="text-moss/50 absolute left-4 top-0 hidden md:block" aria-hidden="true" />
        <Sprig size={56} className="text-moss/50 absolute right-4 top-0 hidden md:block" aria-hidden="true" />
        <EyebrowLabel>Est. 2026 · A considered grocer</EyebrowLabel>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-ink mt-3 leading-[1.05]">
          Small batches.<br />Honest produce.
        </h1>
        <p className="text-ink-muted mt-5 max-w-md mx-auto text-[15px] leading-relaxed">
          A curated pantry of daily essentials, delivered with care.
        </p>
      </header>

      <OrnamentalDivider />

      {/* Filters */}
      <div className="mb-10">
        <div className="relative mb-6 max-w-2xl mx-auto">
          <Search size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Search the pantry…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-hairline pl-7 pr-2 py-3 text-[15px] text-ink placeholder:text-ink-muted focus:border-moss focus:outline-none transition-colors"
          />
        </div>
        <div className="flex items-center justify-center gap-x-1 gap-y-2 flex-wrap">
          <CategoryLink active={selectedCategory === ''} onClick={() => setSelectedCategory('')}>
            All
          </CategoryLink>
          {categories.map((cat, idx) => (
            <span key={cat.id} className="flex items-center gap-1">
              <span className="text-ink-muted/40" aria-hidden="true">·</span>
              <CategoryLink
                active={selectedCategory === cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
              >
                {cat.name}
              </CategoryLink>
            </span>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-16 text-ink-muted">
          <Sprig size={40} className="text-moss animate-spin [animation-duration:2.4s]" aria-hidden="true" />
          <p className="mt-4 text-sm">Gathering the harvest…</p>
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          illustration="Basket"
          title="Nothing on the shelf"
          body="Try a different search or category."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryLink({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 text-sm font-medium transition-colors ${
        active
          ? 'text-moss-deep underline underline-offset-4 decoration-moss'
          : 'text-ink-muted hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Run dev and walk the page**

```bash
npm run dev
```
Verify: hero renders with Wheat/Sprig flourishes (desktop), search is a borderless underline input, categories are dot-separated links with underline on active, product grid renders new ProductCards. Loading state shows spinning Sprig.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Home.jsx
git commit -m "feat(frontend): rebuild Home page with editorial hero"
```

---

## Task 7: Rebuild ProductDetail

**Files:**
- Modify: `frontend/src/pages/ProductDetail.jsx`

- [ ] **Step 1: Replace the entire file**

```jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import api from '../lib/api';
import { useCart } from '../context/CartContext';
import { getIllustrationForCategory, getTintForCategory } from '../assets/illustrations';
import EyebrowLabel from '../components/ui/EyebrowLabel';
import OrnamentalDivider from '../components/ui/OrnamentalDivider';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

const CATEGORY_BLURBS = {
  produce: 'Picked at peak ripeness from nearby growers. Best enjoyed within the week.',
  fruits: 'Seasonal fruit, tree-ripened and unwaxed.',
  vegetables: 'Field-fresh vegetables, cold-chain kept from farm to door.',
  bakery: 'Baked each morning in small batches. No preservatives.',
  dairy: 'From pasture-raised herds, minimally processed.',
  pantry: 'Staples we\'d actually keep in our own kitchen.',
  beverages: 'Thoughtfully sourced. No artificial colors or sweeteners.',
  herbs: 'Aromatic herbs, cut the same morning.',
};

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(({ data }) => setProduct(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center text-ink-muted">Loading…</div>
    );
  }
  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <EmptyState illustration="Basket" title="Product not found" />
      </div>
    );
  }

  const Illustration = getIllustrationForCategory(product.category_slug);
  const tint = getTintForCategory(product.category_slug);
  const blurb = CATEGORY_BLURBS[(product.category_slug || '').toLowerCase()] ||
    'Chosen with care for our pantry.';
  const inStock = product.stock_qty > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Back to shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
        <div className={`${tint} rounded-lg aspect-square flex items-center justify-center p-12`}>
          <Illustration size={240} className="text-moss-deep" />
        </div>

        <div>
          <EyebrowLabel>{product.category_name || 'Grocer'}</EyebrowLabel>
          <h1 className="font-serif text-3xl sm:text-4xl text-ink mt-2 leading-tight">
            {product.name}
          </h1>
          {product.description && (
            <p className="text-ink-muted mt-4 leading-relaxed">{product.description}</p>
          )}

          <div className="flex items-baseline gap-2 mt-6">
            <span className="font-serif text-3xl text-ink">₹{product.price}</span>
            <span className="text-sm text-ink-muted">per {product.unit}</span>
          </div>

          <div className="mt-3">
            <span className={`text-sm ${inStock ? 'text-moss' : 'text-danger'}`}>
              {inStock ? `${product.stock_qty} ${product.unit} available` : 'Out of stock'}
            </span>
          </div>

          {inStock && (
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <div className="inline-flex items-center gap-4 border border-hairline rounded-sm px-2 py-1.5 self-start">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="font-serif text-lg min-w-[2ch] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_qty, quantity + 1))}
                  className="w-9 h-9 flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
              <Button
                size="lg"
                onClick={() => addToCart(product, quantity)}
                className="flex-1 sm:flex-initial"
              >
                Add to cart · ₹{(product.price * quantity).toFixed(2)}
              </Button>
            </div>
          )}

          <OrnamentalDivider />

          <div>
            <EyebrowLabel>On this category</EyebrowLabel>
            <p className="text-ink-muted mt-2 leading-relaxed">{blurb}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run dev, visit a product page, verify layout and add-to-cart**

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/ProductDetail.jsx
git commit -m "feat(frontend): rebuild ProductDetail with illustrated panel"
```

---

## Task 8: Rebuild Cart page

**Files:**
- Modify: `frontend/src/pages/Cart.jsx`

- [ ] **Step 1: Replace the entire file**

```jsx
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getIllustrationForCategory, getTintForCategory } from '../assets/illustrations';
import EyebrowLabel from '../components/ui/EyebrowLabel';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

export default function Cart() {
  const { items, loading, fetchCart, updateQuantity, removeItem, totalAmount } = useCart();
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, [fetchCart]);

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-24 text-center text-ink-muted">Loading cart…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <EmptyState
          illustration="Basket"
          title="Your basket is empty"
          body="Nothing chosen yet. Have a look at what's on the shelf."
          action={<Link to="/"><Button>Start shopping</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <EyebrowLabel>Your selection</EyebrowLabel>
      <h1 className="font-serif text-4xl text-ink mt-2 mb-10">Basket</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">
        <div>
          {items.map((item, idx) => {
            const Illustration = getIllustrationForCategory(item.category_slug);
            const tint = getTintForCategory(item.category_slug);
            return (
              <div
                key={item.id}
                className={`flex items-center gap-4 py-5 ${idx !== 0 ? 'border-t border-hairline' : ''}`}
              >
                <div className={`${tint} w-16 h-16 rounded-sm flex items-center justify-center flex-shrink-0`}>
                  <Illustration size={44} className="text-moss-deep" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-lg text-ink truncate">{item.name}</h3>
                  <p className="text-xs text-ink-muted mt-0.5">₹{item.price} / {item.unit}</p>
                </div>
                <div className="inline-flex items-center gap-3 border border-hairline rounded-sm px-1.5 py-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center text-ink-muted hover:text-ink"
                    aria-label="Decrease"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-serif min-w-[1.5ch] text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-ink-muted hover:text-ink"
                    aria-label="Increase"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="font-serif text-lg text-ink min-w-[80px] text-right">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-ink-muted hover:text-danger transition-colors p-2 rounded-sm"
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>

        <aside className="bg-surface border border-hairline rounded-md p-6 sticky top-24">
          <EyebrowLabel>Summary</EyebrowLabel>
          <h2 className="font-serif text-xl text-ink mt-1 mb-5">Your order</h2>
          <div className="space-y-3 text-[15px]">
            <div className="flex justify-between">
              <span className="text-ink-muted">Subtotal</span>
              <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Delivery</span>
              <span className="text-moss font-medium">Complimentary</span>
            </div>
            <div className="hairline-divider pt-3 flex justify-between">
              <span className="font-serif text-lg">Total</span>
              <span className="font-serif text-lg">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
          <Button fullWidth size="lg" onClick={() => navigate('/checkout')} className="mt-6">
            Proceed to checkout
          </Button>
        </aside>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Dev verify**

Add items to cart from Home; visit `/cart`; confirm quantity changes, remove, totals, and checkout navigation.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Cart.jsx
git commit -m "feat(frontend): rebuild Cart page"
```

---

## Task 9: Rebuild Checkout page

**Files:**
- Modify: `frontend/src/pages/Checkout.jsx`

- [ ] **Step 1: Replace the entire file** (payment logic identical to existing; only JSX changes)

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import api from '../lib/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import EyebrowLabel from '../components/ui/EyebrowLabel';
import OrnamentalDivider from '../components/ui/OrnamentalDivider';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';

export default function Checkout() {
  const { items, totalAmount, fetchCart } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const loadRazorpayScript = () => new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleCheckout = async () => {
    if (!address.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }
    setProcessing(true);
    try {
      const { data } = await api.post('/orders', { delivery_address: address });
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load payment gateway');
        setProcessing(false);
        return;
      }
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount * 100,
        currency: data.currency,
        name: 'FreshMart',
        description: `Order #${data.order_id}`,
        order_id: data.razorpay_order_id,
        prefill: {
          name: user?.fullName || '',
          email: user?.primaryEmailAddress?.emailAddress || '',
          contact: user?.primaryPhoneNumber?.phoneNumber || '',
        },
        handler: async (response) => {
          try {
            await api.post('/orders/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Payment successful');
            navigate(`/order-confirmation/${data.order_id}`);
          } catch {
            toast.error('Payment verification failed');
          }
        },
        theme: { color: '#3d5a47' },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => toast.error('Payment failed. Please try again.'));
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <EyebrowLabel>Final step</EyebrowLabel>
      <h1 className="font-serif text-4xl text-ink mt-2 mb-2">Checkout</h1>
      <p className="text-ink-muted">Enter where you'd like this delivered.</p>

      <OrnamentalDivider />

      <div className="mb-8">
        <label className="block">
          <EyebrowLabel>Delivery address</EyebrowLabel>
          <Textarea
            className="mt-3"
            placeholder="House, street, city, postcode…"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={4}
          />
        </label>
      </div>

      <div className="mb-8">
        <EyebrowLabel>Items in your order</EyebrowLabel>
        <div className="mt-3 divide-y divide-hairline">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between py-3 text-[15px]">
              <span className="text-ink">{item.name} <span className="text-ink-muted">× {item.quantity}</span></span>
              <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-hairline rounded-md p-6 mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-ink-muted">Subtotal</span>
          <span>₹{totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-3">
          <span className="text-ink-muted">Delivery</span>
          <span className="text-moss">Complimentary</span>
        </div>
        <div className="hairline-divider pt-3 flex justify-between">
          <span className="font-serif text-lg">Total</span>
          <span className="font-serif text-lg">₹{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <Button fullWidth size="lg" onClick={handleCheckout} disabled={processing}>
        {processing ? 'Processing…' : `Place order · ₹${totalAmount.toFixed(2)}`}
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Dev verify**

With a signed-in user, walk through checkout. Razorpay modal opens with moss-colored theme. (Use Razorpay test keys — payment flow unchanged from previous implementation.)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Checkout.jsx
git commit -m "feat(frontend): rebuild Checkout page"
```

---

## Task 10: Rebuild OrderConfirmation

**Files:**
- Modify: `frontend/src/pages/OrderConfirmation.jsx`

- [ ] **Step 1: Replace the entire file**

```jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import EyebrowLabel from '../components/ui/EyebrowLabel';
import OrnamentalDivider from '../components/ui/OrnamentalDivider';
import Button from '../components/ui/Button';
import { Sun } from '../assets/illustrations';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data));
  }, [id]);

  if (!order) {
    return <div className="max-w-4xl mx-auto px-4 py-24 text-center text-ink-muted">Loading…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      <Sun size={96} className="text-moss mx-auto mb-6" />
      <EyebrowLabel>Order #{order.id}</EyebrowLabel>
      <h1 className="font-serif text-4xl sm:text-5xl text-ink mt-2">Thank you.</h1>
      <p className="text-ink-muted mt-3">We'll have this on its way shortly.</p>

      <OrnamentalDivider />

      <div className="text-left">
        <EyebrowLabel>Your order</EyebrowLabel>
        <table className="w-full mt-4 text-[15px]">
          <thead>
            <tr className="border-b border-hairline">
              <th className="py-3 pr-2 text-left eyebrow">Item</th>
              <th className="py-3 px-2 text-right eyebrow">Qty</th>
              <th className="py-3 px-2 text-right eyebrow">Price</th>
              <th className="py-3 pl-2 text-right eyebrow">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-hairline">
                <td className="py-3 pr-2 font-serif">{item.name}</td>
                <td className="py-3 px-2 text-right text-ink-muted">{item.quantity}</td>
                <td className="py-3 px-2 text-right text-ink-muted">₹{parseFloat(item.unit_price).toFixed(2)}</td>
                <td className="py-3 pl-2 text-right font-medium">₹{(item.quantity * parseFloat(item.unit_price)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="py-4 pr-2 font-serif text-lg">Total</td>
              <td className="py-4 pl-2 text-right font-serif text-lg">₹{parseFloat(order.total_amount).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-6 bg-surface border border-hairline rounded-md p-5">
          <EyebrowLabel>Delivering to</EyebrowLabel>
          <p className="mt-2 text-ink-muted leading-relaxed">{order.delivery_address}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
        <Link to="/orders"><Button variant="secondary" fullWidth>View all orders</Button></Link>
        <Link to="/"><Button variant="ghost" fullWidth>Continue shopping</Button></Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Dev verify**

After placing a test order, land on the confirmation page and confirm layout.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/OrderConfirmation.jsx
git commit -m "feat(frontend): rebuild OrderConfirmation page"
```

---

## Task 11: Rebuild Orders page

**Files:**
- Modify: `frontend/src/pages/Orders.jsx`

- [ ] **Step 1: Replace the entire file**

```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import EyebrowLabel from '../components/ui/EyebrowLabel';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

const STATUS_TONE = {
  pending: 'butter',
  processing: 'sage',
  out_for_delivery: 'rose',
  delivered: 'moss',
  cancelled: 'danger',
};

const STATUS_LABEL = {
  pending: 'Pending',
  processing: 'Processing',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-24 text-center text-ink-muted">Loading orders…</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          illustration="Basket"
          title="No orders yet"
          body="Once you place an order, it will appear here."
          action={<Link to="/"><Button>Start shopping</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <EyebrowLabel>Account</EyebrowLabel>
      <h1 className="font-serif text-4xl text-ink mt-2 mb-10">Your orders</h1>

      <div className="divide-y divide-hairline">
        {orders.map((order) => (
          <div key={order.id} className="py-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <EyebrowLabel>
                  {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </EyebrowLabel>
                <Badge tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Badge>
              </div>
              <h3 className="font-serif text-lg text-ink">Order #{order.id}</h3>
              <p className="text-sm text-ink-muted mt-1 line-clamp-1">
                {order.items.map((i) => `${i.name} ×${i.quantity}`).join(' · ')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-serif text-lg text-ink">₹{parseFloat(order.total_amount).toFixed(2)}</span>
              <Link to={`/order-confirmation/${order.id}`}>
                <Button variant="ghost" size="sm">View</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Dev verify**

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Orders.jsx
git commit -m "feat(frontend): rebuild Orders page"
```

---

## Task 12: Rebuild Admin (Admin + AdminProducts + AdminOrders)

**Files:**
- Modify: `frontend/src/pages/Admin.jsx`
- Modify: `frontend/src/pages/AdminProducts.jsx`
- Modify: `frontend/src/pages/AdminOrders.jsx`

- [ ] **Step 1: Replace `Admin.jsx`**

```jsx
import { useState } from 'react';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import EyebrowLabel from '../components/ui/EyebrowLabel';

export default function Admin() {
  const [tab, setTab] = useState('products');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <EyebrowLabel>Internal</EyebrowLabel>
      <h1 className="font-serif text-4xl text-ink mt-2 mb-8">Control</h1>

      <div className="flex gap-6 border-b border-hairline mb-10">
        <TabButton active={tab === 'products'} onClick={() => setTab('products')}>Products</TabButton>
        <TabButton active={tab === 'orders'} onClick={() => setTab('orders')}>Orders</TabButton>
      </div>

      {tab === 'products' ? <AdminProducts /> : <AdminOrders />}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 -mb-px text-[15px] font-medium transition-colors border-b-2 ${
        active ? 'text-moss-deep border-moss' : 'text-ink-muted border-transparent hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Replace `AdminProducts.jsx`**

```jsx
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import EyebrowLabel from '../components/ui/EyebrowLabel';

const emptyProduct = { name: '', description: '', category_id: '', price: '', unit: 'piece', stock_qty: '', image_url: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);

  const fetchProducts = () => api.get('/admin/products').then(({ data }) => setProducts(data));

  useEffect(() => {
    fetchProducts();
    api.get('/products/categories').then(({ data }) => setCategories(data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock_qty: parseInt(form.stock_qty) || 0,
        category_id: form.category_id || null,
      };
      if (editing) {
        await api.put(`/admin/products/${editing}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/admin/products', payload);
        toast.success('Product created');
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyProduct);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description || '',
      category_id: product.category_id || '',
      price: product.price,
      unit: product.unit || 'piece',
      stock_qty: product.stock_qty,
      image_url: product.image_url || '',
    });
    setEditing(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this product?')) return;
    await api.delete(`/admin/products/${id}`);
    toast.success('Product deactivated');
    fetchProducts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-col sm:flex-row gap-3">
        <h2 className="font-serif text-2xl text-ink">Products</h2>
        <Button
          variant="ghost"
          onClick={() => { setForm(emptyProduct); setEditing(null); setShowForm(true); }}
        >
          <Plus size={16} /> New product
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[15px] bg-surface border border-hairline rounded-md">
          <thead>
            <tr className="border-b border-hairline">
              <th className="py-3 px-4 text-left eyebrow">ID</th>
              <th className="py-3 px-4 text-left eyebrow">Name</th>
              <th className="py-3 px-4 text-left eyebrow">Category</th>
              <th className="py-3 px-4 text-right eyebrow">Price</th>
              <th className="py-3 px-4 text-right eyebrow">Stock</th>
              <th className="py-3 px-4 text-left eyebrow">Active</th>
              <th className="py-3 px-4 text-right eyebrow">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className={`border-b border-hairline last:border-b-0 ${p.is_active ? '' : 'opacity-50'}`}
              >
                <td className="py-3 px-4 text-ink-muted">{p.id}</td>
                <td className="py-3 px-4 font-serif">{p.name}</td>
                <td className="py-3 px-4 text-ink-muted">{p.category_name || '—'}</td>
                <td className="py-3 px-4 text-right">₹{p.price}</td>
                <td className="py-3 px-4 text-right">{p.stock_qty}</td>
                <td className="py-3 px-4 text-ink-muted">{p.is_active ? 'Yes' : 'No'}</td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(p)}
                    className="p-2 text-ink-muted hover:text-ink transition-colors"
                    aria-label="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 text-ink-muted hover:text-danger transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit product' : 'New product'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <EyebrowLabel>Name *</EyebrowLabel>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label className="flex flex-col gap-1.5">
            <EyebrowLabel>Description</EyebrowLabel>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <EyebrowLabel>Category</EyebrowLabel>
              <Select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                <option value="">None</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </label>
            <label className="flex flex-col gap-1.5">
              <EyebrowLabel>Price *</EyebrowLabel>
              <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <EyebrowLabel>Unit</EyebrowLabel>
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1.5">
              <EyebrowLabel>Stock qty</EyebrowLabel>
              <Input type="number" value={form.stock_qty} onChange={(e) => setForm({ ...form, stock_qty: e.target.value })} />
            </label>
          </div>
          <label className="flex flex-col gap-1.5">
            <EyebrowLabel>Image URL</EyebrowLabel>
            <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          </label>
          <Button type="submit" fullWidth className="mt-2">
            {editing ? 'Update product' : 'Create product'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
```

- [ ] **Step 3: Replace `AdminOrders.jsx`**

```jsx
import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import EyebrowLabel from '../components/ui/EyebrowLabel';

const STATUSES = ['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];
const STATUS_LABEL = {
  pending: 'Pending',
  processing: 'Processing',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
const STATUS_TONE = {
  pending: 'butter',
  processing: 'sage',
  out_for_delivery: 'rose',
  delivered: 'moss',
  cancelled: 'danger',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    const params = {};
    if (filterStatus) params.status = filterStatus;
    api.get('/admin/orders', { params })
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [filterStatus]);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      toast.success('Status updated');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-col sm:flex-row gap-3">
        <h2 className="font-serif text-2xl text-ink">Orders</h2>
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </Select>
      </div>

      {loading ? (
        <div className="py-16 text-center text-ink-muted">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center text-ink-muted">No orders found.</div>
      ) : (
        <div className="divide-y divide-hairline">
          {orders.map((order) => (
            <div key={order.id} className="py-6">
              <div className="flex items-start justify-between flex-col sm:flex-row gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <EyebrowLabel>
                      {new Date(order.created_at).toLocaleString('en-IN')}
                    </EyebrowLabel>
                    <Badge tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Badge>
                  </div>
                  <h3 className="font-serif text-lg text-ink">Order #{order.id}</h3>
                  <p className="text-sm text-ink-muted mt-0.5">{order.customer_name} · {order.customer_email}</p>
                </div>
                <Select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </Select>
              </div>

              <div className="bg-canvas border border-hairline rounded-sm p-3 mb-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-0.5">
                    <span className="text-ink">{item.name} <span className="text-ink-muted">×{item.quantity}</span></span>
                    <span className="text-ink-muted">₹{(item.quantity * parseFloat(item.unit_price)).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-start flex-col sm:flex-row gap-2 text-sm">
                <span className="text-ink-muted">Delivery: {order.delivery_address}</span>
                <span className="font-serif text-lg text-ink">₹{parseFloat(order.total_amount).toFixed(2)}</span>
              </div>

              {order.payment && (
                <p className="text-xs text-ink-muted mt-2">
                  Payment: {order.payment.status}
                  {order.payment.razorpay_payment_id ? ` · ${order.payment.razorpay_payment_id}` : ''}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Dev verify as admin user**

Sign in as an admin. Verify: tab switch, product CRUD in modal, orders list and status change. Table scrolls horizontally on narrow viewports.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/Admin.jsx frontend/src/pages/AdminProducts.jsx frontend/src/pages/AdminOrders.jsx
git commit -m "feat(frontend): rebuild Admin pages"
```

---

## Task 13: Toast styling + final pass

**Files:**
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Restyle `Toaster`**

In `frontend/src/App.jsx`, replace the `<Toaster position="bottom-right" />` line (around line 78) with:
```jsx
<Toaster
  position="bottom-right"
  toastOptions={{
    duration: 3000,
    style: {
      background: '#ffffff',
      color: '#1f2a24',
      border: '1px solid #e8e2d6',
      borderRadius: '6px',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '14px',
      padding: '12px 16px',
      boxShadow: '0 10px 30px rgba(30,40,35,0.06)',
    },
    success: { iconTheme: { primary: '#3d5a47', secondary: '#ffffff' } },
    error: { iconTheme: { primary: '#b8654a', secondary: '#ffffff' } },
  }}
/>
```

- [ ] **Step 2: Full verification pass**

Run each of these:
```bash
npm run lint
npm run build
npm run dev
```
Expected: lint clean, build succeeds, dev server runs on 5173.

Manual walkthrough:
- [ ] Navbar at 375px / 768px / 1280px — wordmark always visible, nav labels hide under `sm`
- [ ] Home: hero with decorative SVGs (md+), search, category filter dots, product grid, loading spinner, empty state on no-match search
- [ ] ProductDetail: illustrated panel, typography, quantity stepper, add-to-cart
- [ ] Cart: list rows with thumbnail illustrations, qty buttons, remove, summary sticky on desktop, empty state
- [ ] Checkout: address textarea, items list, summary, place-order triggers Razorpay
- [ ] OrderConfirmation: Sun flourish, bill table, address card, action buttons
- [ ] Orders: list rows with badges, empty state
- [ ] Admin: tabs, Products table + modal CRUD, Orders list with status select and filter
- [ ] Toasts styled on cart add/remove, order actions
- [ ] `prefers-reduced-motion` (OS setting): hover lifts and loading spinner freeze
- [ ] Keyboard focus: all interactive elements show a moss focus ring

- [ ] **Step 3: Commit**

```bash
git add frontend/src/App.jsx
git commit -m "feat(frontend): restyle toasts and final polish"
```

---

## Self-review notes

- **Spec §2 Design system** → Task 1 (Tailwind tokens), Task 2 (illustrations), Task 3 (primitives).
- **Spec §3 Component plan** → Task 3 primitives + Tasks 4–12 pages.
- **Spec §4 Data flow** → preserved (no changes to `CartContext` or `lib/api.js`).
- **Spec §5 Loading/empty/error** → Task 6 (Home loader), Tasks 8/11 (empty states), Task 13 (toasts).
- **Spec §6 Accessibility** → focus-visible (Task 1 CSS), `aria-hidden` on SVGs (Task 2), reduced-motion (Task 1 CSS), labeled form controls (Task 12).
- **Spec §7 Responsive** → breakpoints applied across each page task.
- **Spec §8 Verification** → Task 13 Step 2.
- **Spec §9 Risks** — fonts preloaded with `display=swap` (Task 1 Step 5); illustration consistency handled by shared SVG skeleton (Task 2); slug fallback via `getIllustrationForCategory` (Task 2 Step 12).

No placeholders, no "TBD", no "similar to above" without code. Method/prop names consistent: `getIllustrationForCategory` / `getTintForCategory` used identically in ProductCard, ProductDetail, Cart.

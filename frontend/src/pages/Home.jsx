import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Tag, Settings } from 'lucide-react';
import api from '../lib/api';

const NAV_ITEMS = [
  { icon: HomeIcon, label: 'Home', to: '/' },
  { icon: Tag, label: 'Offers', to: '/products' },
  { icon: Settings, label: 'Settings', to: '/settings' },
];

const CATEGORY_THEMES = [
  { emoji: '🥦' },
  { emoji: '🥛' },
  { emoji: '🌾' },
  { emoji: '🍿' },
  { emoji: '🌶️' },
  { emoji: '🍞' },
  { emoji: '🧴' },
  { emoji: '🌿' },
];

function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 flex h-14 items-stretch border-t bg-white"
      style={{ borderColor: 'var(--color-fm-line-soft)' }}
    >
      {NAV_ITEMS.map(({ icon: Icon, label, to }) => {
        const active = to === '/' ? pathname === '/' : pathname.startsWith(to);
        return (
          <Link
            key={label}
            to={to}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors"
            style={{ color: active ? 'var(--color-fm-green)' : 'var(--color-fm-ink3)' }}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/categories')
      .then(({ data }) => setCategories(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-fm-paper)',
      fontFamily: 'var(--font-sans)',
      color: 'var(--color-fm-ink)',
      overflowY: 'auto',
    }}>
      <main className="pb-20 md:pb-8" style={{ padding: '24px 16px', maxWidth: 960, width: '100%', margin: '0 auto' }}>
        {/* Heading */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10, color: 'var(--color-fm-ink3)',
            letterSpacing: 1.5, textTransform: 'uppercase',
            marginBottom: 6,
          }}>
            What are you looking for?
          </div>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 22, fontWeight: 700,
            color: 'var(--color-fm-ink)',
          }}>
            Shop by Category
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1f4d34] border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {/* "All Products" tile */}
            <Link
              to="/products"
              style={{
                aspectRatio: '128 / 188',
                borderRadius: 8,
                border: '1.5px solid var(--color-fm-line-soft)',
                background: 'transparent',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', textDecoration: 'none',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 32, lineHeight: 1 }}>🛒</span>
              <span style={{
                color: 'var(--color-fm-ink)', fontWeight: 700, fontSize: 12,
                textAlign: 'center', padding: '0 8px',
                lineHeight: 1.3,
              }}>
                All Products
              </span>
            </Link>

            {categories.map((cat, i) => {
              const theme = CATEGORY_THEMES[i % CATEGORY_THEMES.length];
              return (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  style={{
                    aspectRatio: '128 / 188',
                    borderRadius: 8,
                    border: '1.5px solid var(--color-fm-line-soft)',
                    background: 'transparent',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', textDecoration: 'none',
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 32, lineHeight: 1 }}>{theme.emoji}</span>
                  <span style={{
                    color: 'var(--color-fm-ink)', fontWeight: 700, fontSize: 12,
                    textAlign: 'center', padding: '0 8px',
                    lineHeight: 1.3,
                  }}>
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

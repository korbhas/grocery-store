import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Home as HomeIcon, Search, Heart, ClipboardList, Tag, Settings,
  ChevronLeft, ChevronRight, ShoppingCart, MapPin,
} from 'lucide-react';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const NAV_ITEMS = [
  { icon: HomeIcon, label: 'Home', to: '/', active: true },
  { icon: Search, label: 'Search', to: '/' },
  { icon: Heart, label: 'Favorites', to: '/' },
  { icon: ClipboardList, label: 'Orders', to: '/orders' },
  { icon: Tag, label: 'Offers', to: '/' },
  { icon: Settings, label: 'Settings', to: '/' },
];

function HomeSidebar({ open, onToggle }) {
  const { user } = useAuth();
  const initials = user?.name?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div style={{
      width: open ? 64 : 0,
      minWidth: open ? 64 : 0,
      overflow: 'hidden',
      transition: 'width 0.2s ease, min-width 0.2s ease',
      background: 'var(--color-fm-paper2)',
      borderRight: '1.5px solid var(--color-fm-line-soft)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 14,
      paddingBottom: 14,
      gap: 10,
      position: 'relative',
      flexShrink: 0,
    }}>
      {open && (
        <>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 13, fontWeight: 700,
            color: 'var(--color-fm-green)',
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            letterSpacing: 0.5,
            padding: '4px 0',
            marginBottom: 2,
          }}>
            FreshMart
          </div>

          <div style={{ width: 28, height: 1, background: 'var(--color-fm-line-soft)', margin: '2px 0' }} />

          {NAV_ITEMS.map(({ icon: Icon, label, to, active }) => (
            <Link
              key={label}
              to={to}
              aria-label={label}
              style={{
                width: 40, height: 40,
                borderRadius: 9,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active ? 'var(--color-fm-green)' : 'transparent',
                color: active ? '#fff' : 'var(--color-fm-ink2)',
                transition: 'background 0.15s',
              }}
            >
              <Icon size={16} />
            </Link>
          ))}

          <div style={{ flex: 1 }} />

          <div style={{
            width: 36, height: 36, borderRadius: 18,
            background: 'var(--color-fm-accent-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-heading)',
            fontSize: 13, color: 'var(--color-fm-accent)', fontWeight: 700,
          }}>
            {initials}
          </div>
        </>
      )}

      <button
        onClick={onToggle}
        aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
        style={{
          position: 'absolute',
          top: 14,
          right: -12,
          width: 24, height: 24,
          borderRadius: 12,
          background: 'var(--color-fm-paper2)',
          border: '1.5px solid var(--color-fm-line-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          color: 'var(--color-fm-ink2)',
          padding: 0,
        }}
      >
        {open ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>
    </div>
  );
}

function HomeTopBar({ search, onSearch }) {
  const { totalItems } = useCart();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 24px',
      borderBottom: '1.5px solid var(--color-fm-line-soft)',
      background: 'var(--color-fm-paper)',
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#fff',
        border: '1.5px solid var(--color-fm-line-soft)',
        borderRadius: 8,
        padding: '0 12px',
        height: 42,
        flex: '0 1 460px',
      }}>
        <Search size={14} color="var(--color-fm-ink3)" />
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search groceries, brands…"
          style={{
            flex: 1, border: 'none', outline: 'none',
            fontFamily: 'var(--font-sans)',
            fontSize: 13, color: 'var(--color-fm-ink)',
            background: 'transparent',
          }}
        />
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10, color: 'var(--color-fm-ink3)',
          border: '1px solid var(--color-fm-line-soft)',
          borderRadius: 4, padding: '2px 6px',
        }}>⌘K</span>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'var(--color-fm-green-soft)',
        border: '1.5px solid var(--color-fm-green-ink)',
        borderRadius: 999,
        padding: '5px 12px',
        fontFamily: 'var(--font-sans)',
        fontSize: 13, color: 'var(--color-fm-green-ink)', fontWeight: 500,
        whiteSpace: 'nowrap',
      }}>
        <MapPin size={12} />
        Delivering to you
      </div>

      <div style={{ flex: 1 }} />

      <Link to="/orders" style={{
        display: 'flex', alignItems: 'center', gap: 6,
        border: '1.5px solid var(--color-fm-line-soft)',
        borderRadius: 6,
        padding: '7px 14px',
        fontFamily: 'var(--font-sans)',
        fontSize: 13, color: 'var(--color-fm-ink)',
        background: 'transparent',
        whiteSpace: 'nowrap',
      }}>
        <ClipboardList size={14} />
        Orders
      </Link>

      <Link to="/cart" style={{
        display: 'flex', alignItems: 'center', gap: 7,
        background: 'var(--color-fm-green)',
        borderRadius: 6,
        padding: '7px 14px',
        fontFamily: 'var(--font-sans)',
        fontSize: 13, color: '#fff', fontWeight: 500,
        whiteSpace: 'nowrap',
        position: 'relative',
      }}>
        <ShoppingCart size={14} />
        Cart
        {totalItems > 0 && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 18, height: 18, borderRadius: 9,
            background: 'var(--color-fm-accent)', color: '#fff',
            fontSize: 10, fontWeight: 700,
          }}>{totalItems}</span>
        )}
      </Link>
    </div>
  );
}

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/categories').then(({ data }) => setCategories(data));
  }, []);

  const fetchProducts = useCallback(() => {
    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (search) params.search = search;

    api.get('/products', { params })
      .then(({ data }) => setProducts(data.products))
      .finally(() => setLoading(false));
  }, [selectedCategory, search]);

  useEffect(() => {
    setLoading(true);
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div style={{
      display: 'flex',
      height: '100dvh',
      background: 'var(--color-fm-paper)',
      overflow: 'hidden',
      fontFamily: 'var(--font-sans)',
      color: 'var(--color-fm-ink)',
    }}>
      <HomeSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <HomeTopBar search={search} onSearch={setSearch} />

        <main style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Category pills */}
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10, color: 'var(--color-fm-ink3)',
              letterSpacing: 1.5, textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              Browse by Category
            </div>
            <div className="category-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              <button
                onClick={() => setSelectedCategory('')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: `1.5px solid ${selectedCategory === '' ? 'var(--color-fm-green)' : 'var(--color-fm-line-soft)'}`,
                  background: selectedCategory === '' ? 'var(--color-fm-green)' : '#fff',
                  color: selectedCategory === '' ? '#fff' : 'var(--color-fm-ink)',
                  fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                  flexShrink: 0,
                }}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px',
                    borderRadius: 999,
                    border: `1.5px solid ${selectedCategory === cat.slug ? 'var(--color-fm-green)' : 'var(--color-fm-line-soft)'}`,
                    background: selectedCategory === cat.slug ? 'var(--color-fm-green)' : '#fff',
                    color: selectedCategory === cat.slug ? '#fff' : 'var(--color-fm-ink)',
                    fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500,
                    cursor: 'pointer', transition: 'all 0.15s',
                    flexShrink: 0,
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product grid */}
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700,
              marginBottom: 12,
            }}>
              {search
                ? `Results for "${search}"`
                : selectedCategory
                  ? categories.find(c => c.slug === selectedCategory)?.name || 'Products'
                  : 'All Products'}
            </div>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1f4d34] border-t-transparent" />
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--color-fm-ink2)' }}>
                  No products found
                </p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-fm-ink3)', marginTop: 4 }}>
                  Try a different search or category
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ShoppingCart, ClipboardList, Shield, LogOut, User, Home as HomeIcon, Tag, Settings, Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const NAV_ITEMS = [
  { icon: HomeIcon, label: 'Home', to: '/' },
  { icon: Tag, label: 'Products', to: '/products' },
  { icon: Settings, label: 'Settings', to: '/settings' },
];

export default function Navbar({ userRole }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isProducts = pathname === '/products';
  const [inputVal, setInputVal] = useState(searchParams.get('q') || '');

  useEffect(() => {
    setInputVal(isProducts ? (searchParams.get('q') || '') : '');
  }, [pathname]);

  function handleSearch(val) {
    setInputVal(val);
    const next = new URLSearchParams(searchParams);
    if (val) next.set('q', val);
    else next.delete('q');
    setSearchParams(next, { replace: true });
  }

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '0 20px',
      height: 48,
      background: 'var(--color-fm-paper2)',
      borderBottom: '1.5px solid var(--color-fm-line-soft)',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Brand */}
      <Link
        to="/"
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--font-heading)',
          fontSize: 15, fontWeight: 700,
          color: 'var(--color-fm-green)',
          marginRight: 12,
          textDecoration: 'none',
        }}
      >
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: 'var(--color-fm-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 800, color: '#fff',
          fontFamily: 'var(--font-heading)',
          flexShrink: 0,
        }}>FM</div>
        <span className="hidden sm:inline">FreshMart</span>
      </Link>

      <div className="hidden md:block" style={{ width: 1, height: 20, background: 'var(--color-fm-line-soft)', margin: '0 8px' }} />

      {/* Nav links */}
      <nav className="hidden md:flex" style={{ alignItems: 'center', gap: 2 }}>
        {NAV_ITEMS.map(({ icon: Icon, label, to }) => {
          const active = to === '/' ? pathname === '/' : pathname === to;
          return (
            <Link
              key={label}
              to={to}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px',
                borderRadius: 7,
                background: active ? 'var(--color-fm-green-soft)' : 'transparent',
                color: active ? 'var(--color-fm-green-ink)' : 'var(--color-fm-ink2)',
                fontFamily: 'var(--font-sans)',
                fontSize: 13, fontWeight: active ? 600 : 400,
                textDecoration: 'none',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <Icon size={14} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px' }}>
        {isProducts && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: '#fff',
            border: '1.5px solid var(--color-fm-line-soft)',
            borderRadius: 8, padding: '0 10px',
            height: 32, width: '100%', maxWidth: 280,
          }}>
            <Search size={13} style={{ color: 'var(--color-fm-ink3)', flexShrink: 0 }} />
            <input
              value={inputVal}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search groceries…"
              style={{
                flex: 1, border: 'none', outline: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: 13, color: 'var(--color-fm-ink)',
                background: 'transparent', minWidth: 0,
              }}
            />
            {inputVal && (
              <button
                onClick={() => handleSearch('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-fm-ink3)', padding: 0, display: 'flex' }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {isAuthenticated ? (
          <>
            <Link
              to="/orders"
              className="hidden sm:flex"
              style={{
                alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 7,
                background: pathname === '/orders' ? 'var(--color-fm-green-soft)' : 'transparent',
                color: pathname === '/orders' ? 'var(--color-fm-green-ink)' : 'var(--color-fm-ink2)',
                fontFamily: 'var(--font-sans)', fontSize: 13,
                fontWeight: pathname === '/orders' ? 600 : 400,
                textDecoration: 'none', transition: 'background 0.15s',
              }}
            >
              <ClipboardList size={14} />
              Orders
            </Link>

            {userRole === 'admin' && (
              <Link
                to="/admin"
                className="hidden sm:flex"
                style={{
                  alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 7,
                  background: pathname.startsWith('/admin') ? 'var(--color-fm-green-soft)' : 'transparent',
                  color: pathname.startsWith('/admin') ? 'var(--color-fm-green-ink)' : 'var(--color-fm-ink2)',
                  fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 400,
                  textDecoration: 'none', transition: 'background 0.15s',
                }}
              >
                <Shield size={14} />
                Admin
              </Link>
            )}

            <Link
              to="/cart"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 7,
                background: pathname === '/cart' ? 'var(--color-fm-green-soft)' : 'transparent',
                color: pathname === '/cart' ? 'var(--color-fm-green-ink)' : 'var(--color-fm-ink2)',
                fontFamily: 'var(--font-sans)', fontSize: 13,
                fontWeight: pathname === '/cart' ? 600 : 400,
                textDecoration: 'none', transition: 'background 0.15s',
                position: 'relative',
              }}
            >
              <div style={{ position: 'relative' }}>
                <ShoppingCart size={16} />
                {totalItems > 0 && (
                  <span style={{
                    position: 'absolute', top: -6, right: -6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 15, height: 15, borderRadius: '50%',
                    background: 'var(--color-fm-accent)', color: '#fff',
                    fontSize: 9, fontWeight: 700,
                  }}>{totalItems}</span>
                )}
              </div>
              <span className="hidden sm:inline">Cart</span>
            </Link>

            <div style={{ width: 1, height: 20, background: 'var(--color-fm-line-soft)', margin: '0 4px' }} />

            <div className="hidden sm:flex" style={{ alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--color-fm-green-soft)',
                border: '1.5px solid var(--color-fm-green-ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                color: 'var(--color-fm-green-ink)',
                flexShrink: 0,
              }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--color-fm-ink)' }}>
                  {user?.name}
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: 'var(--color-fm-ink3)' }}>
                  {user?.email}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              aria-label="Log out"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: 7,
                background: 'transparent', border: 'none',
                color: 'var(--color-fm-ink3)', cursor: 'pointer',
                transition: 'background 0.15s',
              }}
            >
              <LogOut size={14} />
            </button>
          </>
        ) : (
          <>
            <Link
              to="/cart"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 10px', borderRadius: 7,
                background: 'transparent',
                color: 'var(--color-fm-ink2)',
                textDecoration: 'none',
                position: 'relative',
              }}
            >
              <div style={{ position: 'relative' }}>
                <ShoppingCart size={16} />
                {totalItems > 0 && (
                  <span style={{
                    position: 'absolute', top: -6, right: -6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 15, height: 15, borderRadius: '50%',
                    background: 'var(--color-fm-accent)', color: '#fff',
                    fontSize: 9, fontWeight: 700,
                  }}>{totalItems}</span>
                )}
              </div>
            </Link>

            <Link
              to="/login"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 7,
                background: 'var(--color-fm-green)',
                color: '#fff',
                fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              <User size={13} />
              Sign In
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

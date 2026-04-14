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

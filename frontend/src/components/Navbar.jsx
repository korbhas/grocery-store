import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/clerk-react';
import { ShoppingCart, Store, ClipboardList, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar({ userRole }) {
  const { totalItems } = useCart();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <Store size={24} />
          <span>FreshMart</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">Shop</Link>

          <Link to="/cart" className="nav-link cart-link">
            <ShoppingCart size={18} />
            Cart
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>

          <SignedIn>
            <Link to="/orders" className="nav-link">
              <ClipboardList size={18} />
              Orders
            </Link>
            {userRole === 'admin' && (
              <Link to="/admin" className="nav-link admin-link">
                <Shield size={18} />
                Admin
              </Link>
            )}
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn btn-primary">Sign In</button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}

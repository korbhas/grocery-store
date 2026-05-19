import { Link } from 'react-router-dom';
import { ShoppingCart, MapPin, ClipboardList, Shield, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ userRole }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-[#1f4d34] text-white shadow-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e23744] text-sm font-extrabold">
              FM
            </div>
            <span className="text-lg font-bold tracking-tight">FreshMart</span>
          </Link>
          <div className="hidden items-center gap-1.5 text-sm sm:flex">
            <MapPin size={14} className="text-yellow-300" />
            <span className="font-medium">Delivering to you</span>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10">
                <Link to="/orders" className="flex items-center gap-1.5">
                  <ClipboardList size={16} />
                  <span className="hidden sm:inline">My Orders</span>
                </Link>
              </Button>
              {userRole === 'admin' && (
                <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10">
                  <Link to="/admin" className="flex items-center gap-1.5">
                    <Shield size={16} />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild className="relative text-white hover:bg-white/10">
                <Link to="/cart" className="flex items-center gap-1.5">
                  <div className="relative">
                    <ShoppingCart size={18} />
                    {totalItems > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e23744] text-[10px] font-bold text-white">
                        {totalItems}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline">Cart</span>
                </Link>
              </Button>
              <div className="ml-2 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="hidden flex-col sm:flex">
                  <span className="text-xs font-medium leading-tight">{user?.name}</span>
                  <span className="text-[10px] leading-tight text-white/70">{user?.email}</span>
                </div>
                <Button variant="ghost" size="icon" aria-label="Log out" className="h-8 w-8 text-white hover:bg-white/10" onClick={logout}>
                  <LogOut size={14} />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10">
                <Link to="/cart" aria-label={`Cart${totalItems > 0 ? `, ${totalItems} items` : ''}`} className="flex items-center gap-1.5">
                  <div className="relative">
                    <ShoppingCart size={18} />
                    {totalItems > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e23744] text-[10px] font-bold text-white">
                        {totalItems}
                      </span>
                    )}
                  </div>
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="ml-1 border-white/30 text-white hover:bg-white/10 hover:text-white">
                <Link to="/login" className="flex items-center gap-1.5">
                  <User size={14} />
                  Sign In
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

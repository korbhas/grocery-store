import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Warehouse,
  ShoppingCart,
  Users,
  Truck,
  Tag,
  CreditCard,
  Settings,
  X,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/admin/products', icon: Package, label: 'Products' },
      { to: '/admin/categories', icon: FolderOpen, label: 'Categories' },
      { to: '/admin/inventory', icon: Warehouse, label: 'Inventory' },
    ],
  },
  {
    label: 'Sales',
    items: [
      { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
      { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
      { to: '/admin/promotions', icon: Tag, label: 'Promotions' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/admin/users', icon: Users, label: 'Customers' },
      { to: '/admin/delivery', icon: Truck, label: 'Delivery' },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { to: '/admin/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const initial = user?.name?.[0]?.toUpperCase() ?? 'A';

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-zinc-200 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e23744] text-white text-xs font-bold select-none">
          F
        </div>
        <span className="text-sm font-semibold tracking-tight text-zinc-900">FreshMart</span>
        <span className="ml-auto rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-[#e23744]/10 text-[#e23744]'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={16} className={isActive ? 'text-[#e23744]' : 'text-zinc-400 group-hover:text-zinc-600'} />
                      <span className="flex-1">{label}</span>
                      {isActive && <ChevronRight size={12} className="text-[#e23744]/60" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-zinc-200 p-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-zinc-800">{user?.name ?? 'Admin'}</p>
            <p className="truncate text-[10px] text-zinc-400">{user?.email ?? ''}</p>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Log out"
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSidebar({ open, onClose }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed top-0 left-0 bottom-0 z-40 hidden w-60 border-r border-zinc-200 bg-white lg:flex lg:flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={onClose}>
          <div className="absolute inset-0 bg-black/40" />
          <aside
            className="relative flex h-full w-60 flex-col border-r border-zinc-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute right-3 top-3">
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X size={16} />
              </button>
            </div>
            <SidebarContent onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}

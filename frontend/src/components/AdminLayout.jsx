import { useState } from 'react';
import { Menu, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const routeTitles = {
  '/admin': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/categories': 'Categories',
  '/admin/inventory': 'Inventory',
  '/admin/orders': 'Orders',
  '/admin/users': 'Customers',
  '/admin/delivery': 'Delivery',
  '/admin/promotions': 'Promotions',
  '/admin/payments': 'Payments',
  '/admin/settings': 'Settings',
};

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const pageTitle = routeTitles[pathname] ?? 'Admin';

  return (
    <div className="flex h-dvh overflow-hidden bg-zinc-50">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Content area — offset for desktop sidebar */}
      <div className="flex flex-1 flex-col overflow-hidden lg:pl-60">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-4">
          <button
            aria-label="Open menu"
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>

          <h1 className="text-sm font-semibold text-zinc-900">{pageTitle}</h1>

          <div className="ml-auto flex items-center gap-1">
            <button
              aria-label="Notifications"
              className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            >
              <Bell size={16} />
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

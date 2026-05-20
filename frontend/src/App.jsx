import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderTracking from './pages/OrderTracking';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e23744] border-t-transparent" /></div>;
  if (!user) {
    const loginPath = allowedRoles?.includes('admin') ? '/admin/login' : '/login';
    return <Navigate to={loginPath} />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return children;
}

function RouterLayout({ user }) {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Navbar userRole={user?.role} />}
      <main className={isAdmin ? 'contents' : 'flex flex-col flex-1'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/order-tracking/:id" element={<OrderTracking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/orders" element={
            <ProtectedRoute><Orders /></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute><Settings /></ProtectedRoute>
          } />
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>
          } />
        </Routes>
      </main>
    </>
  );
}

function AppContent() {
  const { user } = useAuth();

  return (
    <CartProvider>
      <BrowserRouter>
        <RouterLayout user={user} />
      </BrowserRouter>
      <Toaster position="bottom-right" />
    </CartProvider>
  );
}

export default function App() {
  return <AppContent />;
}

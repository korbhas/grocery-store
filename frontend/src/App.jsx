import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, SignedIn } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import api, { setAuthToken } from './lib/api';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import Admin from './pages/Admin';

function useAppUser() {
  const [dbUser, setDbUser] = useState(null);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      api.get('/user/me').then(({ data }) => setDbUser(data)).catch(() => {});
    } else {
      setDbUser(null);
    }
  }, [isSignedIn]);

  return { dbUser };
}

function ProtectedRoute({ children, allowedRoles }) {
  const { dbUser } = useAppUser();
  if (!dbUser) return <div className="flex items-center justify-center py-24 text-ink-muted font-sans">Loading…</div>;
  if (allowedRoles && !allowedRoles.includes(dbUser.role)) {
    return <Navigate to="/" />;
  }
  return children;
}

function AppContent() {
  const { getToken, isSignedIn } = useAuth();
  const { dbUser } = useAppUser();

  useEffect(() => {
    if (isSignedIn) {
      setAuthToken(getToken);
    }
  }, [isSignedIn, getToken]);

  return (
    <CartProvider>
      <BrowserRouter>
        <Navbar userRole={dbUser?.role} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={
              <SignedIn><Checkout /></SignedIn>
            } />
            <Route path="/order-confirmation/:id" element={
              <SignedIn><OrderConfirmation /></SignedIn>
            } />
            <Route path="/orders" element={
              <SignedIn><Orders /></SignedIn>
            } />
            <Route path="/admin" element={
              <SignedIn>
                <ProtectedRoute allowedRoles={['admin']}>
                  <Admin />
                </ProtectedRoute>
              </SignedIn>
            } />
          </Routes>
        </main>
      </BrowserRouter>
      <Toaster position="bottom-right" />
    </CartProvider>
  );
}

export default function App() {
  return <AppContent />;
}

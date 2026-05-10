import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import AdminDashboard from './AdminDashboard';
import AdminProducts from './AdminProducts';
import AdminCategories from './AdminCategories';
import AdminInventory from './AdminInventory';
import AdminOrders from './AdminOrders';
import AdminUsers from './AdminUsers';
import AdminDelivery from './AdminDelivery';
import AdminPromotions from './AdminPromotions';
import AdminPayments from './AdminPayments';
import AdminSettings from './AdminSettings';

export default function Admin() {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="delivery" element={<AdminDelivery />} />
        <Route path="promotions" element={<AdminPromotions />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}
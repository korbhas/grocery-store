import { useState } from 'react';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';

export default function Admin() {
  const [tab, setTab] = useState('products');

  return (
    <div className="page">
      <h1>Admin Panel</h1>
      <div className="admin-tabs">
        <button className={`tab-btn ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>
          Products
        </button>
        <button className={`tab-btn ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>
          Orders
        </button>
      </div>
      {tab === 'products' ? <AdminProducts /> : <AdminOrders />}
    </div>
  );
}

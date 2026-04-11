import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import api from '../lib/api';

const statusColors = {
  pending: '#eab308',
  processing: '#3b82f6',
  out_for_delivery: '#f97316',
  delivered: '#16a34a',
  cancelled: '#ef4444',
};

const statusLabels = {
  pending: 'Pending',
  processing: 'Processing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading orders...</div>;

  if (orders.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <Package size={48} />
          <h2>No orders yet</h2>
          <Link to="/" className="btn btn-primary">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>My Orders</h1>
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <h3>Order #{order.id}</h3>
                <p className="order-date">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <span className="status-badge" style={{ backgroundColor: statusColors[order.status] }}>
                {statusLabels[order.status]}
              </span>
            </div>
            <div className="order-items-preview">
              {order.items.map((item) => (
                <span key={item.id} className="order-item-tag">
                  {item.name} x{item.quantity}
                </span>
              ))}
            </div>
            <div className="order-footer">
              <span className="order-total">₹{parseFloat(order.total_amount).toFixed(2)}</span>
              <Link to={`/order-confirmation/${order.id}`} className="btn btn-sm btn-outline">View Details</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

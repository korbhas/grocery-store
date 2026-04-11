import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const statuses = ['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];
const statusLabels = {
  pending: 'Pending',
  processing: 'Processing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    const params = {};
    if (filterStatus) params.status = filterStatus;
    api.get('/admin/orders', { params })
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [filterStatus]);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      toast.success('Status updated');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2>Orders</h2>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
          <option value="">All Statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">No orders found</div>
      ) : (
        <div className="admin-orders">
          {orders.map((order) => (
            <div key={order.id} className="admin-order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order.id}</h3>
                  <p>{order.customer_name} ({order.customer_email})</p>
                  <p className="order-date">{new Date(order.created_at).toLocaleString('en-IN')}</p>
                </div>
                <div className="order-status-control">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="status-select"
                  >
                    {statuses.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
                  </select>
                </div>
              </div>
              <div className="order-items-list">
                {order.items.map((item) => (
                  <div key={item.id} className="order-item-row">
                    <span>{item.name}</span>
                    <span>x{item.quantity}</span>
                    <span>₹{(item.quantity * parseFloat(item.unit_price)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="order-footer">
                <span>Delivery: {order.delivery_address}</span>
                <span className="order-total">Total: ₹{parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
              {order.payment && (
                <div className="payment-info">
                  Payment: {order.payment.status} {order.payment.razorpay_payment_id ? `(${order.payment.razorpay_payment_id})` : ''}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

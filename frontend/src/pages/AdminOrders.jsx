import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import EyebrowLabel from '../components/ui/EyebrowLabel';

const STATUSES = ['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];
const STATUS_LABEL = {
  pending: 'Pending',
  processing: 'Processing',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
const STATUS_TONE = {
  pending: 'butter',
  processing: 'sage',
  out_for_delivery: 'rose',
  delivered: 'moss',
  cancelled: 'danger',
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
      <div className="flex items-center justify-between mb-6 flex-col sm:flex-row gap-3">
        <h2 className="font-serif text-2xl text-ink">Orders</h2>
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </Select>
      </div>

      {loading ? (
        <div className="py-16 text-center text-ink-muted">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center text-ink-muted">No orders found.</div>
      ) : (
        <div className="divide-y divide-hairline">
          {orders.map((order) => (
            <div key={order.id} className="py-6">
              <div className="flex items-start justify-between flex-col sm:flex-row gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <EyebrowLabel>
                      {new Date(order.created_at).toLocaleString('en-IN')}
                    </EyebrowLabel>
                    <Badge tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Badge>
                  </div>
                  <h3 className="font-serif text-lg text-ink">Order #{order.id}</h3>
                  <p className="text-sm text-ink-muted mt-0.5">{order.customer_name} · {order.customer_email}</p>
                </div>
                <Select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </Select>
              </div>

              <div className="bg-canvas border border-hairline rounded-sm p-3 mb-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-0.5">
                    <span className="text-ink">{item.name} <span className="text-ink-muted">×{item.quantity}</span></span>
                    <span className="text-ink-muted">₹{(item.quantity * parseFloat(item.unit_price)).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-start flex-col sm:flex-row gap-2 text-sm">
                <span className="text-ink-muted">Delivery: {order.delivery_address}</span>
                <span className="font-serif text-lg text-ink">₹{parseFloat(order.total_amount).toFixed(2)}</span>
              </div>

              {order.payment && (
                <p className="text-xs text-ink-muted mt-2">
                  Payment: {order.payment.status}
                  {order.payment.razorpay_payment_id ? ` · ${order.payment.razorpay_payment_id}` : ''}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

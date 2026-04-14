import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import EyebrowLabel from '../components/ui/EyebrowLabel';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

const STATUS_TONE = {
  pending: 'butter',
  processing: 'sage',
  out_for_delivery: 'rose',
  delivered: 'moss',
  cancelled: 'danger',
};

const STATUS_LABEL = {
  pending: 'Pending',
  processing: 'Processing',
  out_for_delivery: 'Out for delivery',
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

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-24 text-center text-ink-muted">Loading orders…</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          illustration="Basket"
          title="No orders yet"
          body="Once you place an order, it will appear here."
          action={<Link to="/"><Button>Start shopping</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <EyebrowLabel>Account</EyebrowLabel>
      <h1 className="font-serif text-4xl text-ink mt-2 mb-10">Your orders</h1>

      <div className="divide-y divide-hairline">
        {orders.map((order) => (
          <div key={order.id} className="py-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <EyebrowLabel>
                  {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </EyebrowLabel>
                <Badge tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Badge>
              </div>
              <h3 className="font-serif text-lg text-ink">Order #{order.id}</h3>
              <p className="text-sm text-ink-muted mt-1 line-clamp-1">
                {order.items.map((i) => `${i.name} ×${i.quantity}`).join(' · ')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-serif text-lg text-ink">₹{parseFloat(order.total_amount).toFixed(2)}</span>
              <Link to={`/order-confirmation/${order.id}`}>
                <Button variant="ghost" size="sm">View</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

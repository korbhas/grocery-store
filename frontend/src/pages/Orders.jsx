import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock } from 'lucide-react';
import api from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DeliveryTracker from '../components/DeliveryTracker';

const statusVariant = {
  pending: 'secondary',
  processing: 'default',
  out_for_delivery: 'outline',
  delivered: 'default',
  cancelled: 'destructive',
};

const statusLabels = {
  pending: 'Pending',
  processing: 'Preparing',
  out_for_delivery: 'On the Way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(() => {
    api.get('/orders')
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 60000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e23744] border-t-transparent" />
    </div>
  );

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <Package size={48} className="mx-auto text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">No orders yet</h2>
        <p className="mt-1 text-muted-foreground">Place your first order and track delivery here</p>
        <Button asChild className="mt-4 bg-[#e23744] hover:bg-[#c52d39]">
          <Link to="/">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="font-bold">Order #{order.id}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <Badge variant={statusVariant[order.status] || 'secondary'}>
                  {statusLabels[order.status]}
                </Badge>
              </div>

              <div className="mb-2 flex flex-wrap gap-1.5">
                {order.items.map((item) => (
                  <Badge key={item.id} variant="outline" className="text-xs font-normal">
                    {item.name} x{item.quantity}
                  </Badge>
                ))}
              </div>

              <DeliveryTracker status={order.status} estimatedDelivery={order.estimated_delivery} />

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock size={14} />
                  <span>Total: <strong className="text-foreground">₹{parseFloat(order.total_amount).toFixed(2)}</strong></span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/order-confirmation/${order.id}`}>View Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
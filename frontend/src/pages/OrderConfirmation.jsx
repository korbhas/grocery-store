import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import api from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import DeliveryTracker from '../components/DeliveryTracker';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = {};
    const token = searchParams.get('t');
    if (token) params.t = token;

    api.get(`/orders/${id}`, { params })
      .then(({ data }) => setOrder(data))
      .catch((err) => setError(err.response?.data?.error || 'Order not found'));
  }, [id, searchParams]);

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="text-xl font-semibold">{error}</h2>
        <Button asChild className="mt-4 bg-[#e23744] hover:bg-[#c52d39]">
          <Link to="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  if (!order) return (
    <div className="flex items-center justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e23744] border-t-transparent" />
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <CheckCircle size={36} className="text-green-600" />
      </div>
      <h1 className="text-2xl font-bold">Order Confirmed!</h1>
      <p className="mt-1 text-muted-foreground">Order #{order.id}</p>

      <Card className="mt-6 text-left">
        <CardHeader>
          <CardTitle>Bill Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">₹{parseFloat(item.unit_price).toFixed(2)}</TableCell>
                  <TableCell className="text-right">₹{(item.quantity * parseFloat(item.unit_price)).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Separator className="my-3" />
          <div className="flex justify-between text-lg font-extrabold">
            <span>Total</span>
            <span>₹{parseFloat(order.total_amount).toFixed(2)}</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            <strong>Delivery to:</strong> {order.delivery_address}
          </p>
          {order.guest_name && (
            <p className="text-sm text-muted-foreground"><strong>Name:</strong> {order.guest_name}</p>
          )}
          {order.guest_email && (
            <p className="text-sm text-muted-foreground"><strong>Email:</strong> {order.guest_email}</p>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4 text-left">
        <CardContent className="p-5">
          <h2 className="mb-2 font-bold">Delivery Status</h2>
          <DeliveryTracker status={order.status} estimatedDelivery={order.estimated_delivery} />
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-center gap-3">
        <Button variant="outline" asChild>
          <Link to="/orders">Track Your Orders</Link>
        </Button>
        <Button asChild className="bg-[#e23744] hover:bg-[#c52d39]">
          <Link to="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
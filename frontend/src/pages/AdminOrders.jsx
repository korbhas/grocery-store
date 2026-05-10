import { useState, useEffect, useCallback } from 'react';
import { Download, X, User, Mail, Phone, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const statuses = ['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'];
const statusLabels = { pending: 'Pending', processing: 'Processing', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled', refunded: 'Refunded' };
const statusVariant = { pending: 'secondary', processing: 'default', out_for_delivery: 'outline', delivered: 'default', cancelled: 'destructive', refunded: 'destructive' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filterStatus) params.status = filterStatus;
    if (dateFrom) params.from = dateFrom;
    if (dateTo) params.to = dateTo;
    api.get('/admin/orders', { params })
      .then(({ data }) => {
        setOrders(data.orders || data);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [filterStatus, dateFrom, dateTo, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      toast.success('Status updated');
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status, estimated_delivery: status === 'delivered' || status === 'cancelled' ? null : selectedOrder.estimated_delivery });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const exportCSV = () => {
    const rows = [['ID', 'Customer', 'Email', 'Status', 'Total', 'Date']];
    orders.forEach((o) => {
      rows.push([
        o.id,
        o.customer_name || o.guest_name || 'Guest',
        o.customer_email || o.guest_email || '',
        o.status,
        o.total_amount,
        o.created_at,
      ]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
          <Download size={14} />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-[160px]">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Status</label>
          <Select value={filterStatus || 'all'} onValueChange={(v) => { setFilterStatus(v === 'all' ? '' : v); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((s) => <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[160px]">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">From</label>
          <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
        </div>
        <div className="w-[160px]">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">To</label>
          <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="py-8 text-center text-muted-foreground">Loading...</p>
        ) : orders.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No orders found</p>
        ) : orders.map((order) => (
          <Card key={order.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setSelectedOrder(order)}>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">Order #{order.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.customer_name || order.guest_name || 'Guest'}
                    {order.customer_email || order.guest_email ? ` — ${order.customer_email || order.guest_email}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">{format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant[order.status]}>{statusLabels[order.status]}</Badge>
                  <span className="text-lg font-bold">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</span>
                </div>
              </div>
              {order.items && order.items.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {order.items.slice(0, 3).map((item) => (
                    <Badge key={item.id} variant="secondary" className="text-xs">
                      {item.name} x{item.quantity}
                    </Badge>
                  ))}
                  {order.items.length > 3 && (
                    <Badge variant="secondary" className="text-xs">+{order.items.length - 3} more</Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {selectedOrder && <OrderDetail order={selectedOrder} onUpdateStatus={updateStatus} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrderDetail({ order, onUpdateStatus }) {
  const handleRefund = () => {
    if (!confirm('Mark this order as refunded? This will also update payment status.')) return;
    onUpdateStatus(order.id, 'refunded');
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Order #{order.id}</DialogTitle>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase text-muted-foreground">Customer</p>
          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-1.5"><User size={14} /> {order.customer_name || order.guest_name || 'Guest'}</p>
            <p className="flex items-center gap-1.5 text-muted-foreground"><Mail size={14} /> {order.customer_email || order.guest_email || '—'}</p>
            <p className="flex items-center gap-1.5 text-muted-foreground"><Phone size={14} /> {order.customer_phone || order.guest_phone || '—'}</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase text-muted-foreground">Order Info</p>
          <div className="space-y-1 text-sm">
            <p>Date: {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}</p>
            <p className="flex items-center gap-1.5"><MapPin size={14} /> {order.delivery_address}</p>
            {order.estimated_delivery && (
              <p>ETA: {format(new Date(order.estimated_delivery), 'MMM d, h:mm a')}</p>
            )}
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase text-muted-foreground">Status</p>
        <Select value={order.status} onValueChange={(v) => onUpdateStatus(order.id, v)}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {statuses.map((s) => <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div>
        <p className="text-xs font-medium uppercase text-muted-foreground">Items</p>
        <div className="mt-2 space-y-2">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                {item.name} <span className="text-muted-foreground">x{item.quantity}</span>
              </div>
              <span className="font-medium">₹{(item.quantity * parseFloat(item.unit_price)).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 text-lg font-bold">
        <span>Total</span>
        <span>₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</span>
      </div>

      {order.payment && (
        <>
          <Separator />
          <div className="text-sm text-muted-foreground">
            Payment: <Badge variant={order.payment.status === 'captured' ? 'default' : 'secondary'}>{order.payment.status}</Badge>
            {order.payment.razorpay_payment_id && <span className="ml-2">({order.payment.razorpay_payment_id})</span>}
          </div>
        </>
      )}

      {order.status !== 'refunded' && order.status !== 'cancelled' && order.payment?.status === 'captured' && (
        <div className="pt-2">
          <Button variant="outline" className="w-full text-red-600 hover:bg-red-50" onClick={handleRefund}>
            Refund Order
          </Button>
        </div>
      )}
    </div>
  );
}
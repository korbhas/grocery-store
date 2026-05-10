import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import api from '../lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { IndianRupee } from 'lucide-react';

const statusLabels = { created: 'Created', captured: 'Captured', failed: 'Failed' };
const statusVariant = { created: 'secondary', captured: 'default', failed: 'destructive' };

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentDetail, setPaymentDetail] = useState(null);

  const fetchPayments = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 25 };
    if (filterStatus) params.status = filterStatus;
    if (dateFrom) params.from = dateFrom;
    if (dateTo) params.to = dateTo;
    api.get('/admin/payments', { params })
      .then(({ data }) => {
        setPayments(data.payments || data);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [filterStatus, dateFrom, dateTo, page]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const openPayment = async (payment) => {
    setSelectedPayment(payment);
    try {
      const { data } = await api.get(`/admin/payments/${payment.id}`);
      setPaymentDetail(data);
    } catch {
      setPaymentDetail(payment);
    }
  };

  const totalPages = Math.ceil(total / 25);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payments</h1>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-[160px]">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Status</label>
          <Select value={filterStatus || 'all'} onValueChange={(v) => { setFilterStatus(v === 'all' ? '' : v); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="captured">Captured</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
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

      {loading ? (
        <p className="py-8 text-center text-muted-foreground">Loading...</p>
      ) : payments.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">No payments found</p>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <Card key={p.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => openPayment(p)}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">Payment #{p.id}</p>
                    <p className="text-sm text-muted-foreground">Order #{p.order_id} — {format(new Date(p.created_at), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariant[p.status]}>{statusLabels[p.status] || p.status}</Badge>
                    <span className="text-lg font-bold">₹{Number(p.amount).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                {p.razorpay_payment_id && (
                  <p className="mt-1 text-xs text-muted-foreground">Razorpay: {p.razorpay_payment_id}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 25 + 1}–{Math.min(page * 25, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}

      <Dialog open={!!selectedPayment} onOpenChange={(open) => { if (!open) { setSelectedPayment(null); setPaymentDetail(null); } }}>
        <DialogContent className="sm:max-w-lg">
          {selectedPayment && (
            <>
              <DialogHeader>
                <DialogTitle>Payment #{selectedPayment.id}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">Amount</p>
                    <p className="text-xl font-bold flex items-center gap-1"><IndianRupee size={16} />{Number(selectedPayment.amount).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">Status</p>
                    <Badge variant={statusVariant[selectedPayment.status]} className="mt-1">{statusLabels[selectedPayment.status] || selectedPayment.status}</Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Details</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <p className="text-muted-foreground">Order ID</p>
                    <p>#{selectedPayment.order_id}</p>
                    <p className="text-muted-foreground">Created</p>
                    <p>{format(new Date(selectedPayment.created_at), 'MMM d, yyyy h:mm a')}</p>
                    {selectedPayment.paid_at && (
                      <>
                        <p className="text-muted-foreground">Paid At</p>
                        <p>{format(new Date(selectedPayment.paid_at), 'MMM d, yyyy h:mm a')}</p>
                      </>
                    )}
                    {selectedPayment.razorpay_payment_id && (
                      <>
                        <p className="text-muted-foreground">Razorpay ID</p>
                        <p className="font-mono text-xs">{selectedPayment.razorpay_payment_id}</p>
                      </>
                    )}
                  </div>
                </div>

                {paymentDetail?.items && (
                  <>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <p className="text-xs font-medium uppercase text-muted-foreground">Order Items</p>
                      {paymentDetail.items.map((item) => (
                        <div key={item.id} className="flex justify-between rounded-md bg-muted px-3 py-2">
                          <span>{item.product_name || `Product #${item.product_id}`} x{item.quantity}</span>
                          <span>₹{(item.quantity * Number(item.unit_price)).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                      {paymentDetail.order_total && (
                        <div className="flex justify-between pt-1 font-bold">
                          <span>Total</span>
                          <span>₹{Number(paymentDetail.order_total).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {paymentDetail?.customer_name && (
                  <div className="text-sm">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Customer</p>
                    <p>{paymentDetail.customer_name} ({paymentDetail.customer_email})</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
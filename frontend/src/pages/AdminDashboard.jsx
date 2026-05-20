import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, ShoppingCart, Package, AlertTriangle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const statusVariant = {
  pending: 'secondary',
  processing: 'default',
  out_for_delivery: 'outline',
  delivered: 'default',
  cancelled: 'destructive',
  refunded: 'destructive',
};

const statusLabel = {
  pending: 'Pending',
  processing: 'Processing',
  out_for_delivery: 'On the Way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

const periods = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    setLoading(true);
    api.get('/admin/dashboard/stats', { params: { period } })
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return <div className="py-12 text-center text-muted-foreground">Loading dashboard...</div>;
  if (!data) return <div className="py-12 text-center text-danger">Failed to load dashboard</div>;

  const { stats, revenue_chart, prev_revenue_chart, recent_orders, low_stock_products } = data;

  const periodStart = (() => {
    const now = new Date();
    if (period === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (period === 'week') { const d = now.getDay(); return new Date(now.getFullYear(), now.getMonth(), now.getDate() - d); }
    return new Date(now.getFullYear(), now.getMonth(), 1);
  })();
  const prevPeriodStart = (() => {
    const now = new Date();
    if (period === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    if (period === 'week') { const d = now.getDay(); const s = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d); return new Date(s.getTime() - 7 * 86400000); }
    return new Date(now.getFullYear(), now.getMonth() - 1, 1);
  })();

  const currentByOffset = {};
  revenue_chart.forEach((r) => {
    const offset = Math.round((new Date(r.date) - periodStart) / 86400000);
    currentByOffset[offset] = { label: format(new Date(r.date), 'MMM d'), current: r.revenue };
  });
  const prevByOffset = {};
  (prev_revenue_chart || []).forEach((r) => {
    const offset = Math.round((new Date(r.date) - prevPeriodStart) / 86400000);
    prevByOffset[offset] = r.revenue;
  });
  const allOffsets = [...new Set([...Object.keys(currentByOffset), ...Object.keys(prevByOffset)])].map(Number).sort((a, b) => a - b);
  const chartData = allOffsets.map((offset) => ({
    label: currentByOffset[offset]?.label ?? format(new Date(periodStart.getTime() + offset * 86400000), 'MMM d'),
    current: currentByOffset[offset]?.current ?? 0,
    previous: prevByOffset[offset] ?? 0,
  }));

  const periodLabels = { today: { current: 'Today', previous: 'Yesterday' }, week: { current: 'This Week', previous: 'Last Week' }, month: { current: 'This Month', previous: 'Last Month' } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-1">
          {periods.map((p) => (
            <Button
              key={p.value}
              variant={period === p.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p.value)}
              className={period === p.value ? 'bg-[#e23744] hover:bg-[#c52d39]' : ''}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={IndianRupee} label="Revenue" value={`₹${stats.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`} change={stats.revenue_change} periodLabel={period} />
        <StatCard icon={ShoppingCart} label="Orders" value={stats.total_orders.toLocaleString()} change={stats.orders_change} subtitle={`${stats.pending_orders} pending`} periodLabel={period} />
        <StatCard icon={Package} label="Products" value={stats.total_products.toLocaleString()} />
        <StatCard icon={AlertTriangle} label="Low Stock" value={low_stock_products.length} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} width={55} />
                  <Tooltip formatter={(v, name) => [`₹${v.toLocaleString('en-IN')}`, name === 'current' ? periodLabels[period].current : periodLabels[period].previous]} />
                  <Legend formatter={(name) => name === 'current' ? periodLabels[period].current : periodLabels[period].previous} />
                  <Line type="monotone" dataKey="current" stroke="#e23744" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="previous" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">No revenue data yet</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {low_stock_products.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle size={16} className="text-amber-500" />
                  Low Stock Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {low_stock_products.slice(0, 8).map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{p.name}</span>
                    <Badge variant={p.stock_qty === 0 ? 'destructive' : 'secondary'} className="ml-2 shrink-0">
                      {p.stock_qty} left
                    </Badge>
                  </div>
                ))}
                <Link to="/admin/inventory" className="block text-center text-xs text-[#e23744] hover:underline">
                  Manage inventory
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock size={16} className="text-[#e23744]" />
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <span className="text-4xl font-bold text-[#e23744]">{stats.pending_orders}</span>
                <p className="mt-1 text-sm text-muted-foreground">awaiting processing</p>
                <Link to="/admin/orders?status=pending">
                  <Button variant="outline" size="sm" className="mt-3">View Orders</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recent_orders.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No orders yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent_orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">#{o.id}</TableCell>
                    <TableCell>{o.customer_name || o.guest_name || 'Guest'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(o.created_at), 'MMM d, h:mm a')}
                    </TableCell>
                    <TableCell className="text-right">₹{parseFloat(o.total_amount).toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[o.status]}>{statusLabel[o.status] || o.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, subtitle, periodLabel }) {
  const periodText = periodLabel === 'today' ? 'vs yesterday' : periodLabel === 'week' ? 'vs last week' : 'vs prev month';
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
            <p className="mt-0.5 text-xl font-bold">{value}</p>
            {subtitle && <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#e23744]/10">
            <Icon size={14} className="text-[#e23744]" />
          </div>
        </div>
        {change !== null && change !== undefined && (
          <p className={`mt-1.5 text-[11px] font-medium ${parseFloat(change) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {parseFloat(change) >= 0 ? '+' : ''}{change}% {periodText}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
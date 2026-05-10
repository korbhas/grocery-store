import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, Tag } from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const emptyCoupon = { code: '', description: '', discount_type: 'percentage', discount_value: '', min_order_amount: '0', max_uses: '', is_active: true, starts_at: '', expires_at: '' };

export default function AdminPromotions() {
  const [coupons, setCoupons] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterActive, setFilterActive] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState({ ...emptyCoupon });

  const fetchCoupons = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 50 };
    if (filterActive) params.is_active = filterActive;
    api.get('/admin/coupons', { params })
      .then(({ data }) => {
        setCoupons(data.coupons || data);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [filterActive, page]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const openCreate = () => {
    setEditingCoupon(null);
    setForm({ ...emptyCoupon });
    setShowForm(true);
  };

  const openEdit = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      min_order_amount: String(coupon.min_order_amount),
      max_uses: coupon.max_uses ? String(coupon.max_uses) : '',
      is_active: coupon.is_active,
      starts_at: coupon.starts_at ? format(new Date(coupon.starts_at), "yyyy-MM-dd'T'HH:mm") : '',
      expires_at: coupon.expires_at ? format(new Date(coupon.expires_at), "yyyy-MM-dd'T'HH:mm") : '',
    });
    setShowForm(true);
  };

  const saveCoupon = async () => {
    if (!form.code.trim()) { toast.error('Code is required'); return; }
    if (!form.discount_value || Number(form.discount_value) <= 0) { toast.error('Discount value must be positive'); return; }

    const payload = {
      code: form.code,
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_amount: Number(form.min_order_amount) || 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      is_active: form.is_active,
      starts_at: form.starts_at || null,
      expires_at: form.expires_at || null,
    };

    try {
      if (editingCoupon) {
        await api.put(`/admin/coupons/${editingCoupon.id}`, payload);
        toast.success('Coupon updated');
      } else {
        await api.post('/admin/coupons', payload);
        toast.success('Coupon created');
      }
      setShowForm(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const deleteCoupon = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Promotions</h1>
        <Button className="bg-[#e23744] hover:bg-[#c52d39]" onClick={openCreate}>
          <Plus size={16} className="mr-1" /> Add Coupon
        </Button>
      </div>

      <div className="flex items-end gap-3">
        <div className="w-[160px]">
          <Select value={filterActive || 'all'} onValueChange={(v) => { setFilterActive(v === 'all' ? '' : v); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Coupons</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-muted-foreground">Loading...</p>
      ) : coupons.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">No coupons yet. Create your first promotion!</p>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-semibold">{c.code}</TableCell>
                  <TableCell className="max-w-[150px] truncate text-muted-foreground">{c.description || '—'}</TableCell>
                  <TableCell>
                    {c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${Number(c.discount_value).toLocaleString('en-IN')}`}
                  </TableCell>
                  <TableCell>₹{Number(c.min_order_amount).toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    {c.max_uses ? `${c.used_count}/${c.max_uses}` : `${c.used_count}/∞`}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.expires_at ? format(new Date(c.expires_at), 'MMM d, yyyy') : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.is_active ? 'default' : 'secondary'}>{c.is_active ? 'Active' : 'Inactive'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="outline" onClick={() => openEdit(c)}><Edit3 size={14} /></Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => deleteCoupon(c.id)}><Trash2 size={14} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Showing {(page - 1) * 50 + 1}–{Math.min(page * 50, total)} of {total}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag size={18} />
              {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER20" />
              </div>
              <div className="space-y-2">
                <Label>Discount Type *</Label>
                <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{form.discount_type === 'percentage' ? 'Discount %' : 'Discount ₹'} *</Label>
                <Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} placeholder="10" min="0" />
              </div>
              <div className="space-y-2">
                <Label>Min Order Amount (₹)</Label>
                <Input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} placeholder="0" min="0" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="20% off summer sale" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Uses (empty = unlimited)</Label>
                <Input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="Unlimited" min="1" />
              </div>
              <div className="space-y-2">
                <Label>Active</Label>
                <Select value={form.is_active ? 'true' : 'false'} onValueChange={(v) => setForm({ ...form, is_active: v === 'true' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Starts At</Label>
                <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Expires At</Label>
                <Input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="bg-[#e23744] hover:bg-[#c52d39]" onClick={saveCoupon}>{editingCoupon ? 'Update' : 'Create'} Coupon</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
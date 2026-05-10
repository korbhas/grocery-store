import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editQty, setEditQty] = useState('');

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 50 };
    if (search) params.search = search;
    if (stockFilter) params.stock_filter = stockFilter;
    api.get('/admin/inventory', { params })
      .then(({ data }) => {
        setProducts(data.products || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [search, stockFilter, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditQty(String(product.stock_qty));
  };

  const saveEdit = async (product) => {
    const newQty = parseInt(editQty);
    if (isNaN(newQty) || newQty < 0) {
      toast.error('Invalid quantity');
      return;
    }
    try {
      await api.put(`/admin/products/${product.id}`, { stock_qty: newQty });
      toast.success('Stock updated');
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inventory</h1>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-[220px]">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-8" />
          </div>
        </div>
        <div className="w-[160px]">
          <Select value={stockFilter || 'all'} onValueChange={(v) => { setStockFilter(v === 'all' ? '' : v); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="All Stock" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock Levels</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low">Low Stock (1-10)</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-muted-foreground">Loading...</p>
      ) : products.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">No products found</p>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center w-[140px]">Stock Qty</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id} className={p.stock_qty === 0 ? 'bg-red-50' : p.stock_qty <= 10 ? 'bg-amber-50' : ''}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.category_name || '—'}</TableCell>
                  <TableCell className="text-right">₹{parseFloat(p.price).toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-center">
                    {editingId === p.id ? (
                      <div className="flex items-center justify-center gap-1">
                        <Input type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)} className="h-8 w-16 text-center" min="0" />
                        <Button size="sm" className="h-8 bg-[#e23744] hover:bg-[#c52d39]" onClick={() => saveEdit(p)}>Save</Button>
                        <Button size="sm" variant="outline" className="h-8" onClick={() => setEditingId(null)}>✕</Button>
                      </div>
                    ) : (
                      <span className="cursor-pointer font-semibold hover:text-[#e23744]" onClick={() => startEdit(p)}>
                        {p.stock_qty}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {p.stock_qty === 0 ? (
                      <Badge variant="destructive">Out of Stock</Badge>
                    ) : p.stock_qty <= 10 ? (
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Low Stock</Badge>
                    ) : (
                      <Badge variant="secondary">In Stock</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 50 + 1}–{Math.min(page * 50, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
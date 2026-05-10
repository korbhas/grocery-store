import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const emptyProduct = { name: '', description: '', category_id: '', price: '', unit: 'piece', stock_qty: '', image_url: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [uploading, setUploading] = useState(false);

  const handleImageFile = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    setUploading(true);
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Upload failed');
      setForm((prev) => ({ ...prev, image_url: data.secure_url }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const fetchProducts = () => {
    api.get('/admin/products').then(({ data }) => {
      const list = data.products || data;
      setProducts(Array.isArray(list) ? list : []);
    });
  };

  useEffect(() => {
    fetchProducts();
    api.get('/products/categories').then(({ data }) => setCategories(data));
  }, []);

  const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (stockFilter === 'in_stock' && p.stock_qty <= 0) return false;
    if (stockFilter === 'low_stock' && p.stock_qty > 5) return false;
    if (stockFilter === 'out_of_stock' && p.stock_qty > 0) return false;
    if (catFilter !== 'all' && String(p.category_id) !== catFilter) return false;
    return true;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: parseFloat(form.price), stock_qty: parseInt(form.stock_qty) || 0, category_id: form.category_id || null };
      if (editing) {
        await api.put(`/admin/products/${editing}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/admin/products', payload);
        toast.success('Product created');
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyProduct);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description || '',
      category_id: product.category_id || '',
      price: product.price,
      unit: product.unit || 'piece',
      stock_qty: product.stock_qty,
      image_url: product.image_url || '',
    });
    setEditing(product.id);
    setShowForm(true);
  };

  const handleToggleActive = async (product) => {
    try {
      await api.put(`/admin/products/${product.id}`, { is_active: !product.is_active });
      toast.success(product.is_active ? 'Product deactivated' : 'Product activated');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => { setForm(emptyProduct); setEditing(null); setShowForm(true); }} className="gap-1.5">
          <Plus size={16} />
          Add Product
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter size={14} className="mr-1" />
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Product' : 'New Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prod-name">Name *</Label>
              <Input id="prod-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-desc">Description</Label>
              <Textarea id="prod-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prod-cat">Category</Label>
                <select id="prod-cat" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs">
                  <option value="">None</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-price">Price *</Label>
                <Input id="prod-price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prod-unit">Unit</Label>
                <Input id="prod-unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-stock">Stock Qty</Label>
                <Input id="prod-stock" type="number" value={form.stock_qty} onChange={(e) => setForm({ ...form, stock_qty: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Product Image</Label>
              {form.image_url && (
                <div className="relative w-24 h-24">
                  <img src={form.image_url} alt="preview" className="w-24 h-24 rounded-md object-cover border border-input" />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, image_url: '' }))}
                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs leading-none"
                  >×</button>
                </div>
              )}
              <label
                htmlFor="prod-img-upload"
                className={buttonVariants({ variant: 'outline', size: 'sm' }) + (uploading ? ' opacity-50 pointer-events-none' : ' cursor-pointer')}
              >
                {uploading ? 'Uploading…' : form.image_url ? 'Change Image' : 'Upload Image'}
              </label>
              <input
                id="prod-img-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                disabled={uploading}
                onChange={(e) => handleImageFile(e.target.files?.[0])}
              />
              <Input
                placeholder="Or paste an image URL"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full">{editing ? 'Update' : 'Create'} Product</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Img</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No products found</TableCell>
                </TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id} className={!p.is_active ? 'opacity-50' : ''}>
                  <TableCell>
                    {p.image_url ? (
                      <img src={p.image_url} alt="" className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                        —
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.category_name || '—'}</TableCell>
                  <TableCell className="text-right">₹{p.price}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={p.stock_qty === 0 ? 'destructive' : p.stock_qty <= 5 ? 'secondary' : 'outline'}>
                      {p.stock_qty}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <button onClick={() => handleToggleActive(p)} className="cursor-pointer">
                      <Badge variant={p.is_active ? 'default' : 'secondary'} className="hover:opacity-80">
                        {p.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" aria-label={`Edit ${p.name}`} className="h-8 w-8" onClick={() => handleEdit(p)}>
                        <Edit size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Deactivate ${p.name}`} className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => { if (confirm('Deactivate this product?')) { api.delete(`/admin/products/${p.id}`).then(() => { toast.success('Product deactivated'); fetchProducts(); }); }}}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">{filtered.length} product(s) shown</p>
    </div>
  );
}
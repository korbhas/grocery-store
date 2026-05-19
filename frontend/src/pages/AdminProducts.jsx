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
const emptyVariant = () => ({ name: '', price: '', stock_qty: '', is_default: false });

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [variants, setVariants] = useState([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState([]);
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

  const addVariantRow = () => setVariants((prev) => [...prev, emptyVariant()]);

  const updateVariantRow = (index, field, value) => {
    setVariants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === 'is_default' && value) {
        next.forEach((v, i) => { if (i !== index) next[i] = { ...v, is_default: false }; });
      }
      return next;
    });
  };

  const removeVariantRow = (index) => {
    setVariants((prev) => {
      const v = prev[index];
      if (v.id) setDeletedVariantIds((d) => [...d, v.id]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock_qty: parseInt(form.stock_qty) || 0,
        category_id: form.category_id || null,
      };

      let productId = editing;
      if (editing) {
        await api.put(`/admin/products/${editing}`, payload);
      } else {
        const { data } = await api.post('/admin/products', payload);
        productId = data.id;
      }

      // delete removed variants
      for (const vid of deletedVariantIds) {
        await api.delete(`/admin/products/${productId}/variants/${vid}`);
      }

      // upsert variants
      for (const v of variants) {
        const vPayload = {
          name: v.name,
          price: parseFloat(v.price),
          stock_qty: parseInt(v.stock_qty) || 0,
          is_default: v.is_default || false,
        };
        if (v.id) {
          await api.put(`/admin/products/${productId}/variants/${v.id}`, vPayload);
        } else {
          await api.post(`/admin/products/${productId}/variants`, vPayload);
        }
      }

      toast.success(editing ? 'Product updated' : 'Product created');
      setShowForm(false);
      setEditing(null);
      setForm(emptyProduct);
      setVariants([]);
      setDeletedVariantIds([]);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const handleEdit = async (product) => {
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
    setDeletedVariantIds([]);
    try {
      const { data } = await api.get(`/admin/products/${product.id}/variants`);
      setVariants(data);
    } catch {
      setVariants([]);
    }
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
        <Button
          onClick={() => {
            setForm(emptyProduct);
            setEditing(null);
            setVariants([]);
            setDeletedVariantIds([]);
            setShowForm(true);
          }}
          className="gap-1.5"
        >
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

      <Dialog open={showForm} onOpenChange={(open) => {
        setShowForm(open);
        if (!open) { setVariants([]); setDeletedVariantIds([]); }
      }}>
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
                <select
                  id="prod-cat"
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                >
                  <option value="">None</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-price">Base Price *</Label>
                <Input id="prod-price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prod-unit">Unit</Label>
                <Input id="prod-unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-stock">Base Stock</Label>
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

            {/* Variants */}
            <div className="space-y-3 rounded-lg border border-dashed p-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Variants <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Button type="button" size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={addVariantRow}>
                  <Plus size={12} /> Add Variant
                </Button>
              </div>
              {variants.length === 0 && (
                <p className="text-xs text-muted-foreground">No variants — customers see base price and stock.</p>
              )}
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_72px_auto] items-center gap-2">
                  <Input
                    placeholder="Name (e.g. 500g)"
                    value={v.name}
                    onChange={(e) => updateVariantRow(i, 'name', e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={v.price}
                    onChange={(e) => updateVariantRow(i, 'price', e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Stock"
                    value={v.stock_qty}
                    onChange={(e) => updateVariantRow(i, 'stock_qty', e.target.value)}
                    className="h-8 text-sm"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title={v.is_default ? 'Default variant' : 'Set as default'}
                      onClick={() => updateVariantRow(i, 'is_default', !v.is_default)}
                      className={`flex h-7 w-7 items-center justify-center rounded text-xs font-bold border transition-colors ${v.is_default ? 'bg-[#e23744] text-white border-[#e23744]' : 'border-border text-muted-foreground hover:border-[#e23744] hover:text-[#e23744]'}`}
                    >
                      D
                    </button>
                    <button
                      type="button"
                      onClick={() => removeVariantRow(i)}
                      className="flex h-7 w-7 items-center justify-center rounded border border-border text-muted-foreground hover:border-destructive hover:text-destructive transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {variants.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-[#e23744]">D</span> = default selection on product page.
                  Name · Price · Stock per variant.
                </p>
              )}
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
                <TableHead>Variants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">No products found</TableCell>
                </TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id} className={!p.is_active ? 'opacity-50' : ''}>
                  <TableCell>
                    {p.image_url ? (
                      <img src={p.image_url} alt="" className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-xs text-muted-foreground">—</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium max-w-[180px] truncate">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.category_name || '—'}</TableCell>
                  <TableCell className="text-right">₹{p.price}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={p.stock_qty === 0 ? 'destructive' : p.stock_qty <= 5 ? 'secondary' : 'outline'}>
                      {p.stock_qty}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {p.variants && p.variants.length > 0 ? (
                      <Badge variant="secondary">{p.variants.length} variant{p.variants.length > 1 ? 's' : ''}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
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
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Deactivate ${p.name}`}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm('Deactivate this product?')) {
                            api.delete(`/admin/products/${p.id}`).then(() => {
                              toast.success('Product deactivated');
                              fetchProducts();
                            });
                          }
                        }}
                      >
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

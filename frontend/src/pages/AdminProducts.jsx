import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import EyebrowLabel from '../components/ui/EyebrowLabel';

const emptyProduct = { name: '', description: '', category_id: '', price: '', unit: 'piece', stock_qty: '', image_url: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);

  const fetchProducts = () => api.get('/admin/products').then(({ data }) => setProducts(data));

  useEffect(() => {
    fetchProducts();
    api.get('/products/categories').then(({ data }) => setCategories(data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock_qty: parseInt(form.stock_qty) || 0,
        category_id: form.category_id || null,
      };
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

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this product?')) return;
    await api.delete(`/admin/products/${id}`);
    toast.success('Product deactivated');
    fetchProducts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-col sm:flex-row gap-3">
        <h2 className="font-serif text-2xl text-ink">Products</h2>
        <Button
          variant="ghost"
          onClick={() => { setForm(emptyProduct); setEditing(null); setShowForm(true); }}
        >
          <Plus size={16} /> New product
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[15px] bg-surface border border-hairline rounded-md">
          <thead>
            <tr className="border-b border-hairline">
              <th className="py-3 px-4 text-left eyebrow">ID</th>
              <th className="py-3 px-4 text-left eyebrow">Name</th>
              <th className="py-3 px-4 text-left eyebrow">Category</th>
              <th className="py-3 px-4 text-right eyebrow">Price</th>
              <th className="py-3 px-4 text-right eyebrow">Stock</th>
              <th className="py-3 px-4 text-left eyebrow">Active</th>
              <th className="py-3 px-4 text-right eyebrow">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className={`border-b border-hairline last:border-b-0 ${p.is_active ? '' : 'opacity-50'}`}
              >
                <td className="py-3 px-4 text-ink-muted">{p.id}</td>
                <td className="py-3 px-4 font-serif">{p.name}</td>
                <td className="py-3 px-4 text-ink-muted">{p.category_name || '—'}</td>
                <td className="py-3 px-4 text-right">₹{p.price}</td>
                <td className="py-3 px-4 text-right">{p.stock_qty}</td>
                <td className="py-3 px-4 text-ink-muted">{p.is_active ? 'Yes' : 'No'}</td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(p)}
                    className="p-2 text-ink-muted hover:text-ink transition-colors"
                    aria-label="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 text-ink-muted hover:text-danger transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit product' : 'New product'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <EyebrowLabel>Name *</EyebrowLabel>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label className="flex flex-col gap-1.5">
            <EyebrowLabel>Description</EyebrowLabel>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <EyebrowLabel>Category</EyebrowLabel>
              <Select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                <option value="">None</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </label>
            <label className="flex flex-col gap-1.5">
              <EyebrowLabel>Price *</EyebrowLabel>
              <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <EyebrowLabel>Unit</EyebrowLabel>
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1.5">
              <EyebrowLabel>Stock qty</EyebrowLabel>
              <Input type="number" value={form.stock_qty} onChange={(e) => setForm({ ...form, stock_qty: e.target.value })} />
            </label>
          </div>
          <label className="flex flex-col gap-1.5">
            <EyebrowLabel>Image URL</EyebrowLabel>
            <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          </label>
          <Button type="submit" fullWidth className="mt-2">
            {editing ? 'Update product' : 'Create product'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

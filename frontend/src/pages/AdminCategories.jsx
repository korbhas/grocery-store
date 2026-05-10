import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCategories = useCallback(() => {
    api.get('/admin/categories')
      .then(({ data }) => setCategories(data))
      .catch(() => toast.error('Failed to load categories'));
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/admin/categories/${editing}`, form);
        toast.success('Category updated');
      } else {
        await api.post('/admin/categories', form);
        toast.success('Category created');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '' });
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name });
    setEditing(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success('Category deleted');
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  const moveCategory = async (index, direction) => {
    const newOrder = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setCategories(newOrder);
    try {
      await api.put('/admin/categories/reorder', { order: newOrder.map((c) => c.id) });
    } catch {
      fetchCategories();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => { setForm({ name: '' }); setEditing(null); setShowForm(true); }} className="gap-1.5">
          <Plus size={16} />
          Add Category
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Category' : 'New Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name *</Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Fruits & Vegetables"
                required
              />
            </div>
            <Button type="submit" className="w-full">{editing ? 'Update' : 'Create'} Category</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Order</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-center">Products</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No categories yet. Create your first category above.
                  </TableCell>
                </TableRow>
              ) : categories.map((cat, i) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <Button variant="ghost" size="icon" aria-label="Move category up" className="h-5 w-5" disabled={i === 0} onClick={() => moveCategory(i, 'up')}>
                        <ArrowUp size={12} />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Move category down" className="h-5 w-5" disabled={i === categories.length - 1} onClick={() => moveCategory(i, 'down')}>
                        <ArrowDown size={12} />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{cat.product_count}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" aria-label={`Edit ${cat.name}`} className="h-8 w-8" onClick={() => handleEdit(cat)}>
                        <Edit size={14} />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={`Delete ${cat.name}`} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                            <Trash2 size={14} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete &ldquo;{cat.name}&rdquo;?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {parseInt(cat.product_count) > 0
                                ? `This category has ${cat.product_count} product(s). Reassign them first.`
                                : 'This action cannot be undone.'}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            {parseInt(cat.product_count) === 0 && (
                              <AlertDialogAction onClick={() => handleDelete(cat.id)} className="bg-destructive text-white hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            )}
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
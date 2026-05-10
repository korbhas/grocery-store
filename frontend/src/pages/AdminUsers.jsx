import { useState, useEffect, useCallback } from 'react';
import { Search, Mail, Phone, Shield, ShieldOff, Ban, ShieldCheck } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', role: 'customer', phone: '', is_banned: false });
  const [editId, setEditId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    api.get('/admin/users', { params })
      .then(({ data }) => {
        setUsers(data.users);
        setTotal(data.total);
      })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleEditOpen = (user) => {
    setEditForm({ name: user.name || '', role: user.role, phone: user.phone || '', is_banned: user.is_banned || false });
    setEditId(user.id);
    setShowEdit(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/users/${editId}`, editForm);
      toast.success('User updated');
      setShowEdit(false);
      fetchUsers();
      if (selectedUser && selectedUser.id === editId) {
        setSelectedUser({ ...selectedUser, ...editForm });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const { data } = await api.get(`/admin/users/${userId}`);
      setSelectedUser(data);
    } catch {
      toast.error('Failed to load user details');
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter || 'all'} onValueChange={(v) => { setRoleFilter(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">Loading...</TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No users found</TableCell>
                    </TableRow>
                  ) : users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-[#e23744]/10 text-[#e23744] text-xs font-bold">
                              {u.name?.charAt(0)?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{u.name || '—'}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                          {u.role === 'admin' ? 'Admin' : 'Customer'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleViewUser(u.id)}>View</Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditOpen(u)}>Edit</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>

        {selectedUser && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">User Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-[#e23744]/10 text-[#e23744] text-sm font-bold">
                      {selectedUser.name?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedUser.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-muted-foreground" />
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-muted-foreground" />
                    <span>{selectedUser.phone || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedUser.role === 'admin' ? <Shield size={14} className="text-[#e23744]" /> : <ShieldOff size={14} className="text-muted-foreground" />}
                    <Badge variant={selectedUser.role === 'admin' ? 'default' : 'secondary'}>
                      {selectedUser.role === 'admin' ? 'Admin' : 'Customer'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedUser.is_banned ? <Ban size={14} className="text-red-600" /> : <ShieldCheck size={14} className="text-emerald-600" />}
                    <Badge variant={selectedUser.is_banned ? 'destructive' : 'default'}>
                      {selectedUser.is_banned ? 'Banned' : 'Active'}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-md bg-muted p-3 text-center">
                    <p className="text-2xl font-bold">{selectedUser.stats?.total_orders || 0}</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                  <div className="rounded-md bg-muted p-3 text-center">
                    <p className="text-2xl font-bold">₹{(selectedUser.stats?.total_spent || 0).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-muted-foreground">Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedUser.recent_orders?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedUser.recent_orders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
                      <div>
                        <span className="font-medium">#{o.id}</span>
                        <span className="ml-2 text-muted-foreground">{o.status}</span>
                      </div>
                      <span className="font-medium">₹{parseFloat(o.total_amount).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Name</Label>
              <Input id="user-name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-phone">Phone</Label>
              <Input id="user-phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-role">Role</Label>
              <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v })}>
                <SelectTrigger id="user-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Account Status</Label>
              <Select value={editForm.is_banned ? 'banned' : 'active'} onValueChange={(v) => setEditForm({ ...editForm, is_banned: v === 'banned' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
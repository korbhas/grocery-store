import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, X, Truck } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminDelivery() {
  const [tab, setTab] = useState('agents');
  const [agents, setAgents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [agentForm, setAgentForm] = useState({ name: '', phone: '', vehicle_type: 'bike' });
  const [assigning, setAssigning] = useState(null);

  useEffect(() => {
    if (tab === 'agents') fetchAgents();
    else fetchOrders();
  }, [tab]);

  const fetchAgents = () => {
    setLoading(true);
    api.get('/admin/delivery-agents').then(({ data }) => setAgents(data)).catch(() => {}).finally(() => setLoading(false));
  };

  const fetchOrders = () => {
    setLoading(true);
    api.get('/admin/orders', { params: { status: 'out_for_delivery', limit: 100 } }).then(({ data }) => {
      const outForDelivery = data.orders || data;
      api.get('/admin/orders', { params: { status: 'processing', limit: 100 } }).then(({ data: data2 }) => {
        const processing = data2.orders || data2;
        api.get('/admin/orders', { params: { status: 'pending', limit: 100 } }).then(({ data: data3 }) => {
          const pending = data3.orders || data3;
          setOrders([...pending, ...processing, ...outForDelivery]);
        }).finally(() => setLoading(false));
      });
    }).catch(() => setLoading(false));
  };

  const saveAgent = async () => {
    if (!agentForm.name.trim() || !agentForm.phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }
    try {
      if (editingAgent) {
        await api.put(`/admin/delivery-agents/${editingAgent.id}`, agentForm);
        toast.success('Agent updated');
      } else {
        await api.post('/admin/delivery-agents', agentForm);
        toast.success('Agent added');
      }
      setShowAgentForm(false);
      setEditingAgent(null);
      setAgentForm({ name: '', phone: '', vehicle_type: 'bike' });
      fetchAgents();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const deleteAgent = async (id) => {
    if (!confirm('Delete this delivery agent?')) return;
    try {
      await api.delete(`/admin/delivery-agents/${id}`);
      toast.success('Agent deleted');
      fetchAgents();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const toggleAgentActive = async (agent) => {
    try {
      await api.put(`/admin/delivery-agents/${agent.id}`, { is_active: !agent.is_active });
      fetchAgents();
    } catch (err) {
      toast.error('Failed');
    }
  };

  const assignOrder = async (orderId, agentId) => {
    try {
      await api.put(`/admin/orders/${orderId}/assign`, { agent_id: agentId || null });
      toast.success('Agent assigned');
      setAssigning(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const statusLabels = { pending: 'Pending', processing: 'Processing', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Delivery</h1>
        <div className="flex gap-1">
          <Button variant={tab === 'agents' ? 'default' : 'outline'} size="sm" onClick={() => setTab('agents')} className={tab === 'agents' ? 'bg-[#e23744] hover:bg-[#c52d39]' : ''}>
            Agents
          </Button>
          <Button variant={tab === 'orders' ? 'default' : 'outline'} size="sm" onClick={() => setTab('orders')} className={tab === 'orders' ? 'bg-[#e23744] hover:bg-[#c52d39]' : ''}>
            Assignments
          </Button>
        </div>
      </div>

      {tab === 'agents' && (
        <>
          <div className="flex justify-end">
            <Button className="bg-[#e23744] hover:bg-[#c52d39]" onClick={() => { setAgentForm({ name: '', phone: '', vehicle_type: 'bike' }); setEditingAgent(null); setShowAgentForm(true); }}>
              <Plus size={16} className="mr-1" /> Add Agent
            </Button>
          </div>

          {loading ? (
            <p className="py-8 text-center text-muted-foreground">Loading...</p>
          ) : agents.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No delivery agents yet</p>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell>{a.phone}</TableCell>
                      <TableCell className="capitalize">{a.vehicle_type}</TableCell>
                      <TableCell>
                        <Badge variant={a.is_active ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => toggleAgentActive(a)}>
                          {a.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="outline" onClick={() => { setEditingAgent(a); setAgentForm({ name: a.name, phone: a.phone, vehicle_type: a.vehicle_type }); setShowAgentForm(true); }}>
                            <Edit3 size={14} />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => deleteAgent(a.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          <Dialog open={showAgentForm} onOpenChange={setShowAgentForm}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingAgent ? 'Edit Agent' : 'Add Delivery Agent'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={agentForm.name} onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })} placeholder="Agent name" />
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input value={agentForm.phone} onChange={(e) => setAgentForm({ ...agentForm, phone: e.target.value })} placeholder="+91 98765 43210" />
                </div>
                <div className="space-y-2">
                  <Label>Vehicle Type</Label>
                  <Select value={agentForm.vehicle_type} onValueChange={(v) => setAgentForm({ ...agentForm, vehicle_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bike">Bike</SelectItem>
                      <SelectItem value="scooter">Scooter</SelectItem>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAgentForm(false)}>Cancel</Button>
                  <Button className="bg-[#e23744] hover:bg-[#c52d39]" onClick={saveAgent}>Save</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      {tab === 'orders' && (
        <>
          {loading ? (
            <p className="py-8 text-center text-muted-foreground">Loading...</p>
          ) : orders.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No pending/processing orders</p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <Card key={o.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">Order #{o.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {o.customer_name || o.guest_name || 'Guest'} — ₹{parseFloat(o.total_amount).toLocaleString('en-IN')}
                        </p>
                        <Badge variant="secondary" className="mt-1">{statusLabels[o.status] || o.status}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {o.delivery_agent_id ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Truck size={12} className="mr-1" />
                            Agent #{o.delivery_agent_id}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        )}
                        <Button size="sm" variant="outline" onClick={() => setAssigning(o.id)}>
                          {o.delivery_agent_id ? 'Reassign' : 'Assign Agent'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Dialog open={!!assigning} onOpenChange={(open) => { if (!open) setAssigning(null); }}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Assign Agent to Order #{assigning}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 pt-2">
                {agents.filter((a) => a.is_active).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active agents. Add agents in the Agents tab first.</p>
                ) : (
                  agents.filter((a) => a.is_active).map((a) => (
                    <Button
                      key={a.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => assignOrder(assigning, a.id)}
                    >
                      {a.name} — {a.phone} ({a.vehicle_type})
                    </Button>
                  ))
                )}
                <Button variant="ghost" className="w-full text-red-600" onClick={() => { assignOrder(assigning, null); }}>
                  Remove Assignment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
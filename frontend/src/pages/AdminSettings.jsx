import { useState, useEffect } from 'react';
import { Save, Store, Truck, DollarSign, Clock, MapPin, Plus, Trash2 } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [areas, setAreas] = useState([]);
  const [newPincode, setNewPincode] = useState('');
  const [newAreaName, setNewAreaName] = useState('');

  useEffect(() => {
    api.get('/admin/settings')
      .then(({ data }) => setSettings(data))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
    fetchAreas();
  }, []);

  const fetchAreas = () => {
    api.get('/admin/delivery-areas')
      .then(({ data }) => setAreas(data))
      .catch(() => {});
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/admin/settings', settings);
      setSettings(data);
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addArea = async () => {
    if (!newPincode.trim() || !newAreaName.trim()) {
      toast.error('Pincode and area name are required');
      return;
    }
    try {
      await api.post('/admin/delivery-areas', { pincode: newPincode, area_name: newAreaName });
      toast.success('Area added');
      setNewPincode('');
      setNewAreaName('');
      fetchAreas();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const toggleArea = async (area) => {
    try {
      await api.put(`/admin/delivery-areas/${area.id}`, { is_active: !area.is_active });
      fetchAreas();
    } catch (err) {
      toast.error('Failed');
    }
  };

  const deleteArea = async (id) => {
    if (!confirm('Remove this delivery area?')) return;
    try {
      await api.delete(`/admin/delivery-areas/${id}`);
      toast.success('Area removed');
      fetchAreas();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  if (loading) return <div className="py-12 text-center text-muted-foreground">Loading settings...</div>;
  if (!settings) return <div className="py-12 text-center text-muted-foreground">Failed to load settings</div>;

  const isStoreOpen = settings.store_open === 'true';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button onClick={handleSave} disabled={saving} className="gap-1.5">
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store size={18} />
              Store Information
            </CardTitle>
            <CardDescription>General store configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Store Name</Label>
              <Input
                id="store-name"
                value={settings.store_name || ''}
                onChange={(e) => handleChange('store_name', e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border p-4">
              <div>
                <p className="font-medium">Store Status</p>
                <p className="text-sm text-muted-foreground">
                  {isStoreOpen ? 'Store is open and accepting orders' : 'Store is closed — customers cannot place orders'}
                </p>
              </div>
              <Button
                type="button"
                variant={isStoreOpen ? 'default' : 'outline'}
                onClick={() => handleChange('store_open', isStoreOpen ? 'false' : 'true')}
                className={isStoreOpen ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                {isStoreOpen ? 'Open' : 'Closed'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck size={18} />
              Delivery Settings
            </CardTitle>
            <CardDescription>Configure delivery fees and estimated times</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="delivery-fee" className="flex items-center gap-1.5">
                  <DollarSign size={14} />
                  Delivery Fee (₹)
                </Label>
                <Input
                  id="delivery-fee"
                  type="number"
                  step="1"
                  min="0"
                  value={settings.delivery_fee || '0'}
                  onChange={(e) => handleChange('delivery_fee', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-order" className="flex items-center gap-1.5">
                  <DollarSign size={14} />
                  Minimum Order Amount (₹)
                </Label>
                <Input
                  id="min-order"
                  type="number"
                  step="1"
                  min="0"
                  value={settings.min_order_amount || '0'}
                  onChange={(e) => handleChange('min_order_amount', e.target.value)}
                />
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="eta-min" className="flex items-center gap-1.5">
                  <Clock size={14} />
                  Min Delivery ETA (min)
                </Label>
                <Input
                  id="eta-min"
                  type="number"
                  step="1"
                  min="0"
                  value={settings.delivery_eta_min || '30'}
                  onChange={(e) => handleChange('delivery_eta_min', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eta-max" className="flex items-center gap-1.5">
                  <Clock size={14} />
                  Max Delivery ETA (min)
                </Label>
                <Input
                  id="eta-max"
                  type="number"
                  step="1"
                  min="0"
                  value={settings.delivery_eta_max || '60'}
                  onChange={(e) => handleChange('delivery_eta_max', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin size={18} />
            Delivery Areas
          </CardTitle>
          <CardDescription>Pincodes where delivery is available</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-[140px]">
              <Label>Pincode</Label>
              <Input placeholder="560001" value={newPincode} onChange={(e) => setNewPincode(e.target.value)} />
            </div>
            <div className="min-w-[200px] flex-1">
              <Label>Area Name</Label>
              <Input placeholder="Koramangala, Bangalore" value={newAreaName} onChange={(e) => setNewAreaName(e.target.value)} />
            </div>
            <Button type="button" className="bg-[#e23744] hover:bg-[#c52d39]" onClick={addArea}>
              <Plus size={16} className="mr-1" /> Add
            </Button>
          </div>

          {areas.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pincode</TableHead>
                  <TableHead>Area Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {areas.map((area) => (
                  <TableRow key={area.id}>
                    <TableCell className="font-mono">{area.pincode}</TableCell>
                    <TableCell>{area.area_name}</TableCell>
                    <TableCell>
                      <Badge variant={area.is_active ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => toggleArea(area)}>
                        {area.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => deleteArea(area.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {areas.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">No delivery areas configured. Add pincodes to define your delivery zone.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
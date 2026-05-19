import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { Clock, MapPin, User, Map, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import LocationPicker from '../components/LocationPicker';

export default function Checkout() {
  const { items, totalAmount, clearCart, removeItem } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [addressMode, setAddressMode] = useState('map');
  const [locationData, setLocationData] = useState(null);
  const [locationValid, setLocationValid] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const manualValid = manualAddress.trim().length > 0;


  const switchMode = (mode) => {
    setAddressMode(mode);
    setLocationData(null);
    setLocationValid(false);
  };
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await api.post('/coupons/validate', { code: couponCode, order_amount: totalAmount });
      setCouponData(data);
      toast.success(`Coupon applied! You save ₹${data.discount_amount}`);
    } catch (err) {
      setCouponData(null);
      toast.error(err.response?.data?.error || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponData(null);
  };

  const finalAmount = couponData ? couponData.final_amount : totalAmount;
  const discountAmount = couponData ? couponData.discount_amount : 0;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) return resolve(true);
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (addressMode === 'map' && (!locationValid || !locationData)) {
      toast.error('Please select a valid delivery location on the map'); return;
    }
    if (addressMode === 'manual' && !manualValid) {
      toast.error('Please enter your delivery address'); return;
    }
    if (!isAuthenticated) {
      if (!guestName.trim()) { toast.error('Please enter your name'); return; }
      if (!guestEmail.trim()) { toast.error('Please enter your email'); return; }
    }

    setProcessing(true);
    try {
      const orderPayload = {
        delivery_address: addressMode === 'map' ? locationData.address : manualAddress.trim(),
        delivery_pincode: addressMode === 'map' ? locationData.pincode : undefined,
        items: items.map((item) => ({ product_id: item.product_id, variant_id: item.variant_id || undefined, quantity: item.quantity })),
      };
      if (couponData) {
        orderPayload.coupon_id = couponData.coupon.id;
      }
      if (!isAuthenticated) {
        orderPayload.guest_name = guestName;
        orderPayload.guest_email = guestEmail;
        if (guestPhone.trim()) orderPayload.guest_phone = guestPhone;
      }
      const { data } = await api.post('/orders', orderPayload);

      const loaded = await loadRazorpayScript();
      if (!loaded) { toast.error('Failed to load payment gateway'); setProcessing(false); return; }

      const options = {
        key: data.key_id,
        amount: Math.round(finalAmount * 100),
        currency: data.currency,
        name: 'FreshMart',
        description: `Order #${data.order_id}`,
        order_id: data.razorpay_order_id,
        prefill: {
          name: isAuthenticated ? (user?.name || '') : guestName,
          email: isAuthenticated ? (user?.email || '') : guestEmail,
          contact: isAuthenticated ? (user?.phone || '') : (guestPhone || ''),
        },
        handler: async (response) => {
          try {
            await api.post('/orders/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Payment successful!');
            navigate(`/order-tracking/${data.order_id}?t=${data.access_token}`);
            clearCart();
          } catch {
            toast.error('Payment verification failed');
          }
        },
        theme: { color: '#e23744' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => { toast.error('Payment failed. Please try again.'); });
      rzp.open();
    } catch (err) {
      const msg = err.response?.data?.error || '';
      const notFound = msg.match(/Product (\d+) not found/);
      if (notFound) {
        const badId = parseInt(notFound[1]);
        const staleItem = items.find((i) => i.product_id === badId);
        if (staleItem) removeItem(staleItem.id);
        toast.error(`"${staleItem?.name || 'An item'}" is no longer available and was removed from your cart.`);
      } else {
        toast.error(msg || 'Checkout failed');
      }
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0 && !isAuthenticated) { navigate('/cart'); return null; }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-center gap-2">
        <MapPin size={20} className="text-[#e23744]" />
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_350px]">
        <div className="space-y-4">
          {!isAuthenticated && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User size={16} className="text-[#e23744]" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guest-name">Name *</Label>
                  <Input id="guest-name" placeholder="Your full name" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guest-email">Email *</Label>
                  <Input id="guest-email" type="email" placeholder="your@email.com" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guest-phone">Phone</Label>
                  <Input id="guest-phone" type="tel" placeholder="Phone number (optional)" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin size={16} className="text-[#e23744]" />
                Delivery Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mode toggle */}
              <div className="flex overflow-hidden rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => switchMode('map')}
                  className={`flex flex-1 items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                    addressMode === 'map'
                      ? 'bg-[#e23744] text-white'
                      : 'bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Map size={14} /> Use Map
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('manual')}
                  className={`flex flex-1 items-center justify-center gap-2 border-l border-border py-2 text-sm font-medium transition-colors ${
                    addressMode === 'manual'
                      ? 'bg-[#e23744] text-white'
                      : 'bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <PenLine size={14} /> Enter Manually
                </button>
              </div>

              {addressMode === 'map' ? (
                <LocationPicker
                  onLocationChange={setLocationData}
                  onValidChange={setLocationValid}
                />
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="manual-address">Full Address *</Label>
                  <Textarea
                    id="manual-address"
                    placeholder="House/Flat no., Street, Area, Landmark, Pincode..."
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">Please include your pincode in the address.</p>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-sm text-green-600">
                <Clock size={14} />
                <span className="font-medium">Delivery in 10 minutes</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id || item.product_id} className="flex items-center gap-3">
                    <img src={item.image_url || '/placeholder.png'} alt={item.name} className="h-12 w-12 rounded-lg bg-muted object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">₹{item.price} × {item.quantity}</p>
                    </div>
                    <span className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit sticky top-20 border-2 border-[#e23744]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="font-semibold text-green-600">FREE</span>
            </div>
            {couponData && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Coupon ({couponData.coupon.code})</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-extrabold">
              <span>Total</span>
              <span>₹{finalAmount.toFixed(2)}</span>
            </div>

            <div className="pt-2">
              {couponData ? (
                <div className="flex items-center justify-between rounded-md bg-emerald-50 px-3 py-2 text-sm">
                  <span className="text-emerald-700 font-medium">Coupon applied: {couponData.coupon.code}</span>
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-red-500 hover:text-red-600" onClick={removeCoupon}>Remove</Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="flex-1" />
                  <Button variant="outline" size="sm" onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()}>
                    {couponLoading ? '...' : 'Apply'}
                  </Button>
                </div>
              )}
            </div>

            <Button className="w-full bg-[#e23744] text-base font-bold hover:bg-[#c52d39]" size="lg" onClick={handleCheckout} disabled={processing || (addressMode === 'map' ? !locationValid : !manualValid)}>
              {processing ? 'Processing...' : `Pay ₹${finalAmount.toFixed(2)}`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
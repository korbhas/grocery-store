import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import api from '../lib/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import EyebrowLabel from '../components/ui/EyebrowLabel';
import OrnamentalDivider from '../components/ui/OrnamentalDivider';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';

export default function Checkout() {
  const { items, totalAmount, fetchCart } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const loadRazorpayScript = () => new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleCheckout = async () => {
    if (!address.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }
    setProcessing(true);
    try {
      const { data } = await api.post('/orders', { delivery_address: address });
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load payment gateway');
        setProcessing(false);
        return;
      }
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount * 100,
        currency: data.currency,
        name: 'FreshMart',
        description: `Order #${data.order_id}`,
        order_id: data.razorpay_order_id,
        prefill: {
          name: user?.fullName || '',
          email: user?.primaryEmailAddress?.emailAddress || '',
          contact: user?.primaryPhoneNumber?.phoneNumber || '',
        },
        handler: async (response) => {
          try {
            await api.post('/orders/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Payment successful');
            navigate(`/order-confirmation/${data.order_id}`);
          } catch {
            toast.error('Payment verification failed');
          }
        },
        theme: { color: '#3d5a47' },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => toast.error('Payment failed. Please try again.'));
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <EyebrowLabel>Final step</EyebrowLabel>
      <h1 className="font-serif text-4xl text-ink mt-2 mb-2">Checkout</h1>
      <p className="text-ink-muted">Enter where you'd like this delivered.</p>

      <OrnamentalDivider />

      <div className="mb-8">
        <label className="block">
          <EyebrowLabel>Delivery address</EyebrowLabel>
          <Textarea
            className="mt-3"
            placeholder="House, street, city, postcode…"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={4}
          />
        </label>
      </div>

      <div className="mb-8">
        <EyebrowLabel>Items in your order</EyebrowLabel>
        <div className="mt-3 divide-y divide-hairline">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between py-3 text-[15px]">
              <span className="text-ink">{item.name} <span className="text-ink-muted">× {item.quantity}</span></span>
              <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-hairline rounded-md p-6 mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-ink-muted">Subtotal</span>
          <span>₹{totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-3">
          <span className="text-ink-muted">Delivery</span>
          <span className="text-moss">Complimentary</span>
        </div>
        <div className="hairline-divider pt-3 flex justify-between">
          <span className="font-serif text-lg">Total</span>
          <span className="font-serif text-lg">₹{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <Button fullWidth size="lg" onClick={handleCheckout} disabled={processing}>
        {processing ? 'Processing…' : `Place order · ₹${totalAmount.toFixed(2)}`}
      </Button>
    </div>
  );
}

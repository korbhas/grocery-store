import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  XCircle,
  ArrowRight,
  MapPin,
  Phone,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import api from '../lib/api';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const steps = [
  { key: 'pending', label: 'Order Confirmed', icon: CheckCircle2, description: 'We\'ve received your order' },
  { key: 'processing', label: 'Preparing Your Order', icon: Package, description: 'Your items are being picked & packed' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, description: 'Your delivery partner is on the way' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2, description: 'Your order has been delivered' },
];

const statusIndex = { pending: 0, processing: 1, out_for_delivery: 2, delivered: 3 };
const statusLabels = { pending: 'Pending', processing: 'Preparing', out_for_delivery: 'On the Way', delivered: 'Delivered', cancelled: 'Cancelled' };

function formatETA(estimatedDelivery) {
  if (!estimatedDelivery) return null;
  const eta = new Date(estimatedDelivery);
  const now = new Date();
  const diffMs = eta - now;
  if (diffMs <= 0) return 'Arriving any moment now';
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `Arriving in ${diffMins} min`;
  const timeStr = eta.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `Arriving by ${timeStr}`;
}

function getCountdown(estimatedDelivery) {
  if (!estimatedDelivery) return null;
  const eta = new Date(estimatedDelivery);
  const now = new Date();
  const diff = eta - now;
  if (diff <= 0) return 'Arriving now';
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function OrderTracking() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const fetchOrder = useCallback(() => {
    const params = {};
    const token = searchParams.get('t');
    if (token) params.t = token;

    api.get(`/orders/${id}`, { params })
      .then(({ data }) => setOrder(data))
      .catch((err) => setError(err.response?.data?.error || 'Order not found'));
  }, [id, searchParams]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (order?.estimated_delivery) {
        setCountdown(getCountdown(order.estimated_delivery));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [order?.estimated_delivery]);

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <XCircle size={48} className="mx-auto text-destructive" />
        <h2 className="mt-4 text-xl font-bold">{error}</h2>
        <Button asChild className="mt-4 bg-[#e23744] hover:bg-[#c52d39]">
          <Link to="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  if (!order) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e23744] border-t-transparent" />
    </div>
  );

  const status = order.status;
  const current = statusIndex[status] ?? 0;
  const isActiveOrder = status !== 'cancelled' && status !== 'delivered';

  return (
    <div className="mx-auto max-w-lg px-4 pb-12">
      {/* Header */}
      <div className="mb-2 text-center">
        <h1 className="text-2xl font-extrabold">
          {status === 'cancelled' ? 'Order Cancelled' : status === 'delivered' ? 'Delivered!' : 'Order Tracking'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Order #{order.id}</p>
      </div>

      {/* ETA Card */}
      {status !== 'cancelled' && status !== 'delivered' && order.estimated_delivery && (
        <div className="mb-5 overflow-hidden rounded-2xl bg-[#e23744] px-5 py-4 text-center text-white shadow-lg shadow-[#e23744]/20">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Estimated Delivery Time</p>
          <p className="mt-1 text-4xl font-extrabold tabular-nums">
            {countdown || formatETA(order.estimated_delivery)}
          </p>
          <p className="mt-1 text-sm opacity-80">
            {status === 'out_for_delivery' ? 'Your delivery partner is on the way!' : 'We\'re getting your order ready'}
          </p>
        </div>
      )}

      {status === 'delivered' && (
        <div className="mb-5 overflow-hidden rounded-2xl bg-green-600 px-5 py-4 text-center text-white shadow-lg shadow-green-600/20">
          <CheckCircle2 size={32} className="mx-auto" />
          <p className="mt-2 text-lg font-bold">Order Delivered</p>
          <p className="text-sm opacity-80">Thank you for ordering with FreshMart!</p>
        </div>
      )}

      {status === 'cancelled' && (
        <div className="mb-5 overflow-hidden rounded-2xl bg-destructive px-5 py-4 text-center text-white shadow-lg shadow-destructive/20">
          <XCircle size={32} className="mx-auto" />
          <p className="mt-2 text-lg font-bold">Order Cancelled</p>
          <p className="text-sm opacity-80">This order has been cancelled.</p>
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-6 rounded-2xl bg-card p-5 shadow-sm">
        <div className="relative">
          {steps.map((step, i) => {
            const isComplete = i <= current && status !== 'cancelled';
            const isCurrent = i === current && status !== 'cancelled';
            const Icon = step.icon;

            return (
              <div key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
                {/* Vertical line */}
                {i < steps.length - 1 && (
                  <div className={`absolute left-[17px] top-[38px] h-[calc(100%-14px)] w-[3px] rounded-full transition-colors ${
                    i < current && status !== 'cancelled' ? 'bg-[#e23744]' : 'bg-border'
                  }`} />
                )}

                {/* Icon circle */}
                <div className={`relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-all ${
                  isCurrent
                    ? 'bg-[#e23744] text-white shadow-lg shadow-[#e23744]/30 ring-4 ring-[#e23744]/20'
                    : isComplete
                    ? 'bg-[#e23744] text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon size={18} />
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1 pt-1">
                  <p className={`text-sm font-semibold ${isCurrent ? 'text-[#e23744]' : isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                    {isCurrent && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-[#e23744]/10 px-2 py-0.5 text-[10px] font-bold text-[#e23744]">
                        CURRENT
                      </span>
                    )}
                  </p>
                  <p className={`text-xs leading-snug ${isComplete ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery Address */}
      <div className="mb-4 rounded-2xl bg-card p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#e23744]/10 text-[#e23744]">
            <MapPin size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Delivery Address</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{order.delivery_address}</p>
          </div>
        </div>
      </div>

      {/* Order Summary (collapsible) */}
      <div className="mb-4 overflow-hidden rounded-2xl bg-card shadow-sm">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <div>
            <p className="text-sm font-semibold">Order Details</p>
            <p className="text-xs text-muted-foreground">{order.items.length} item{order.items.length !== 1 ? 's' : ''} · ₹{parseFloat(order.total_amount).toFixed(2)}</p>
          </div>
          {showDetails ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
        </button>

        {showDetails && (
          <div className="border-t px-4 pb-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b py-2.5 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">₹{parseFloat(item.unit_price).toFixed(2)} × {item.quantity}</p>
                </div>
                <p className="ml-4 text-sm font-semibold">₹{(item.quantity * parseFloat(item.unit_price)).toFixed(2)}</p>
              </div>
            ))}
            <Separator className="my-2" />
            <div className="flex justify-between text-sm font-bold">
              <span>Total</span>
              <span>₹{parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {order.guest_name && order.guest_phone && (
          <Button variant="outline" className="flex-1 gap-1.5" asChild>
            <a href={`tel:${order.guest_phone}`}>
              <Phone size={16} />
              Call Support
            </a>
          </Button>
        )}
        <Button className="flex-1 gap-1.5 bg-[#e23744] hover:bg-[#c52d39]" asChild>
          <Link to="/">
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </Button>
      </div>

      {/* Auto-refresh notice */}
      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        Status refreshes automatically every 15 seconds
      </p>
    </div>
  );
}
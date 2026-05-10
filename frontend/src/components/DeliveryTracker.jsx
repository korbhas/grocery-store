import { Clock, Package, Truck, CheckCircle2, XCircle } from 'lucide-react';

const steps = [
  { key: 'pending', label: 'Confirmed', icon: Package },
  { key: 'processing', label: 'Preparing', icon: Clock },
  { key: 'out_for_delivery', label: 'On the Way', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

const statusIndex = { pending: 0, processing: 1, out_for_delivery: 2, delivered: 3 };

function formatETA(estimatedDelivery) {
  if (!estimatedDelivery) return null;
  const eta = new Date(estimatedDelivery);
  const now = new Date();
  const diffMs = eta - now;

  if (diffMs <= 0) return 'Arriving any moment';

  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `Arriving in ~${diffMins} min`;

  const timeStr = eta.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `Arriving by ${timeStr}`;
}

export default function DeliveryTracker({ status, estimatedDelivery }) {
  if (status === 'cancelled') {
    return (
      <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
        <div className="flex items-center gap-2 text-destructive">
          <XCircle size={16} />
          <span className="text-sm font-semibold">Order Cancelled</span>
        </div>
      </div>
    );
  }

  const current = statusIndex[status] ?? 0;

  let etaText;
  if (status === 'pending') {
    etaText = 'Awaiting payment confirmation';
  } else if (estimatedDelivery) {
    etaText = formatETA(estimatedDelivery);
  } else if (status === 'processing') {
    etaText = 'Calculating delivery time...';
  } else {
    etaText = null;
  }

  return (
    <div className="mt-3 rounded-xl bg-muted/50 p-3">
      <div className="flex items-center justify-between">
        {steps.map((step, i) => {
          const isComplete = i <= current;
          const isCurrent = i === current;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                    isComplete
                      ? 'bg-[#e23744] text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon size={13} />
                </div>
                <span className={`mt-0.5 text-[10px] leading-tight ${isComplete ? 'font-semibold' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`mx-1.5 h-0.5 flex-1 ${i < current ? 'bg-[#e23744]' : 'bg-muted'}`} />
              )}
            </div>
          );
        })}
      </div>
      {etaText && (
        <p className="mt-2 text-center text-sm font-semibold text-[#e23744]">
          {etaText}
        </p>
      )}
    </div>
  );
}
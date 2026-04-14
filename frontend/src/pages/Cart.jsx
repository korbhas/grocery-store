import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getIllustrationForCategory, getTintForCategory } from '../assets/illustrations';
import EyebrowLabel from '../components/ui/EyebrowLabel';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

export default function Cart() {
  const { items, loading, fetchCart, updateQuantity, removeItem, totalAmount } = useCart();
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, [fetchCart]);

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-24 text-center text-ink-muted">Loading cart…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <EmptyState
          illustration="Basket"
          title="Your basket is empty"
          body="Nothing chosen yet. Have a look at what's on the shelf."
          action={<Link to="/"><Button>Start shopping</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <EyebrowLabel>Your selection</EyebrowLabel>
      <h1 className="font-serif text-4xl text-ink mt-2 mb-10">Basket</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">
        <div>
          {items.map((item, idx) => {
            // eslint-disable-next-line react-hooks/static-components
            const Illustration = getIllustrationForCategory(item.category_slug);
            const tint = getTintForCategory(item.category_slug);
            return (
              <div
                key={item.id}
                className={`flex items-center gap-4 py-5 ${idx !== 0 ? 'border-t border-hairline' : ''}`}
              >
                <div className={`${tint} w-16 h-16 rounded-sm flex items-center justify-center flex-shrink-0`}>
                  <Illustration size={44} className="text-moss-deep" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-lg text-ink truncate">{item.name}</h3>
                  <p className="text-xs text-ink-muted mt-0.5">₹{item.price} / {item.unit}</p>
                </div>
                <div className="inline-flex items-center gap-3 border border-hairline rounded-sm px-1.5 py-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center text-ink-muted hover:text-ink"
                    aria-label="Decrease"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-serif min-w-[1.5ch] text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-ink-muted hover:text-ink"
                    aria-label="Increase"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="font-serif text-lg text-ink min-w-[80px] text-right">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-ink-muted hover:text-danger transition-colors p-2 rounded-sm"
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>

        <aside className="bg-surface border border-hairline rounded-md p-6 sticky top-24">
          <EyebrowLabel>Summary</EyebrowLabel>
          <h2 className="font-serif text-xl text-ink mt-1 mb-5">Your order</h2>
          <div className="space-y-3 text-[15px]">
            <div className="flex justify-between">
              <span className="text-ink-muted">Subtotal</span>
              <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Delivery</span>
              <span className="text-moss font-medium">Complimentary</span>
            </div>
            <div className="hairline-divider pt-3 flex justify-between">
              <span className="font-serif text-lg">Total</span>
              <span className="font-serif text-lg">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
          <Button fullWidth size="lg" onClick={() => navigate('/checkout')} className="mt-6">
            Proceed to checkout
          </Button>
        </aside>
      </div>
    </div>
  );
}

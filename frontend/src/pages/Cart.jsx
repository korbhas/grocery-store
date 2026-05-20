import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const DELIVERY_FEE = 25;
const HANDLING_FEE = 2;

function QtyStepperInline({ item, onDecrement, onIncrement }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderRadius: 6,
      border: '1px solid var(--color-fm-green)',
      background: 'var(--color-fm-green)',
      width: 80, height: 28,
      padding: '0 6px', flexShrink: 0,
    }}>
      <button onClick={onDecrement} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
        <Minus size={11} />
      </button>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', minWidth: 16, textAlign: 'center' }}>
        {item.quantity}
      </span>
      <button onClick={onIncrement} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
        <Plus size={11} />
      </button>
    </div>
  );
}

function BillRow({ label, value, bold, topBorder }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0',
      borderTop: topBorder ? '1px dashed var(--color-fm-line-soft)' : 'none',
    }}>
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: bold ? 14 : 13,
        fontWeight: bold ? 700 : 400,
        color: bold ? 'var(--color-fm-ink)' : 'var(--color-fm-ink2)',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: bold ? 14 : 13,
        fontWeight: bold ? 700 : 500,
        color: 'var(--color-fm-ink)',
      }}>
        {value}
      </span>
    </div>
  );
}

export default function Cart() {
  const { items, updateQuantity, removeItem, totalAmount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const grandTotal = totalAmount + DELIVERY_FEE + HANDLING_FEE;

  if (items.length === 0) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-sans)', color: 'var(--color-fm-ink)',
        gap: 12, padding: 32,
      }}>
        <ShoppingBag size={48} style={{ color: 'var(--color-fm-ink3)' }} />
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700 }}>
          Your cart is empty
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-fm-ink3)' }}>
          Add items to get started
        </div>
        <Link to="/" style={{
          marginTop: 8, padding: '10px 24px', borderRadius: 8,
          background: 'var(--color-fm-green)', color: '#fff',
          fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600,
          textDecoration: 'none',
        }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: 'var(--color-fm-paper)',
      fontFamily: 'var(--font-sans)', color: 'var(--color-fm-ink)',
      overflowY: 'auto',
    }}>
      <div style={{ maxWidth: 560, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '16px 16px 12px',
        }}>
          <ShoppingBag size={20} style={{ color: 'var(--color-fm-green)' }} />
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700 }}>
            My Cart
          </span>
          <span style={{
            marginLeft: 4,
            background: 'var(--color-fm-green-soft)',
            color: 'var(--color-fm-green-ink)',
            fontSize: 11, fontWeight: 700,
            borderRadius: 999, padding: '2px 8px',
          }}>
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Delivery strip */}
        <div style={{
          margin: '0 16px 12px',
          background: 'var(--color-fm-green-soft)',
          border: '1px solid var(--color-fm-green-ink)',
          borderRadius: 10,
          padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--color-fm-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Zap size={16} fill="#fff" color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-fm-green-ink)' }}>
              Delivery in 10 minutes
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-fm-green-ink)', opacity: 0.8, marginTop: 1 }}>
              Shipment of {items.length} item{items.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Items */}
        <div style={{
          margin: '0 16px 12px',
          background: '#fff',
          border: '1px solid var(--color-fm-line-soft)',
          borderRadius: 10,
          overflow: 'hidden',
        }}>
          {items.map((item, i) => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px',
              borderTop: i > 0 ? '1px solid var(--color-fm-line-soft)' : 'none',
            }}>
              {/* Image */}
              <div style={{
                width: 72, height: 72, borderRadius: 8, flexShrink: 0,
                background: 'var(--color-fm-paper)',
                border: '1px solid var(--color-fm-line-soft)',
                overflow: 'hidden',
              }}>
                <img
                  src={item.image_url || '/placeholder.png'}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: 'var(--color-fm-ink)',
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  lineHeight: 1.35, marginBottom: 3,
                }}>
                  {item.name}
                </div>
                {item.variant_name && (
                  <div style={{ fontSize: 11, color: 'var(--color-fm-ink3)', marginBottom: 6 }}>
                    {item.variant_name}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-fm-ink)' }}>
                    ₹{(item.price * item.quantity).toFixed(0)}
                  </span>
                  <QtyStepperInline
                    item={item}
                    onDecrement={() => item.quantity <= 1 ? removeItem(item.id) : updateQuantity(item.id, item.quantity - 1)}
                    onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bill details */}
        <div style={{
          margin: '0 16px 12px',
          background: '#fff',
          border: '1px solid var(--color-fm-line-soft)',
          borderRadius: 10,
          padding: '4px 16px 0',
        }}>
          <div style={{
            fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700,
            padding: '12px 0 4px',
            borderBottom: '1px solid var(--color-fm-line-soft)',
          }}>
            Bill details
          </div>
          <BillRow label="Items total" value={`₹${totalAmount.toFixed(0)}`} />
          <BillRow label="Delivery charge" value={`₹${DELIVERY_FEE}`} />
          <BillRow label="Handling charge" value={`₹${HANDLING_FEE}`} />
          <BillRow label="Grand total" value={`₹${grandTotal.toFixed(0)}`} bold topBorder />
        </div>

        {/* Cancellation policy */}
        <div style={{ margin: '0 16px 100px', padding: '12px 14px', background: '#fff', border: '1px solid var(--color-fm-line-soft)', borderRadius: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-fm-ink2)', marginBottom: 4 }}>
            Cancellation Policy
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-fm-ink3)', lineHeight: 1.6 }}>
            Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.
          </div>
        </div>

      </div>

      {/* Sticky checkout strip */}
      <div style={{
        position: 'sticky', bottom: 0, zIndex: 20,
        background: '#fff',
        borderTop: '1px solid var(--color-fm-line-soft)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--color-fm-ink3)', fontWeight: 500 }}>Grand total</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-fm-ink)', lineHeight: 1.2 }}>
            ₹{grandTotal.toFixed(0)}
          </div>
        </div>
        <button
          onClick={() => navigate(isAuthenticated ? '/checkout' : '/login')}
          style={{
            padding: '12px 28px', borderRadius: 8,
            background: 'var(--color-fm-green)', color: '#fff',
            fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700,
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {isAuthenticated ? 'Proceed to Checkout →' : 'Login to Proceed →'}
        </button>
      </div>
    </div>
  );
}

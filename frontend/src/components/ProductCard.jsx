import { Link } from 'react-router-dom';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart, updateQuantity, removeItem, items } = useCart();
  const hasVariants = product.variants && product.variants.length > 0;
  const cartItem = items.find((i) => i.product_id === product.id && !i.variant_id);
  const outOfStock = !hasVariants && product.stock_qty <= 0;

  const minPrice = hasVariants
    ? Math.min(...product.variants.map((v) => parseFloat(v.price)))
    : null;

  function handleDecrement() {
    if (cartItem.quantity <= 1) removeItem(cartItem.id);
    else updateQuantity(cartItem.id, cartItem.quantity - 1);
  }

  return (
    <div style={{
      borderRadius: 8,
      border: '0.5px solid #e5e7eb',
      boxShadow: 'rgba(0,0,0,0.04) 2px 2px 8px',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      justifyContent: 'space-between',
    }}>
      {/* Image */}
      <Link to={`/product/${product.id}`} style={{ display: 'block', padding: '6px 6px 0', flexShrink: 0 }}>
        <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: 8 }}>
          <img
            src={product.image_url || '/placeholder.png'}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'opacity 0.15s' }}
          />
        </div>
      </Link>

      {/* Content */}
      <div style={{ padding: '5px 9px 8px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Name + unit — fixed height matching calc(3em + 0.375rem) */}
        <div style={{ height: 'calc(3em + 0.3rem)', marginBottom: 6, display: 'flex', flexDirection: 'column' }}>
          <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', marginBottom: 4 }}>
            <div style={{
              fontSize: 11, fontWeight: 600,
              color: '#111827',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4,
            }}>
              {product.name}
            </div>
          </Link>

          {/* Unit / weight */}
          <div style={{
            fontSize: 10, color: '#6b7280', fontWeight: 500,
            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
          }}>
            {product.unit || product.quantity_label || '1 pc'}
          </div>
        </div>

        {/* Price + Add */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#111827', flexShrink: 0 }}>
            {hasVariants ? `From ₹${minPrice}` : `₹${product.price}`}
          </div>

          {outOfStock ? (
            <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 500, textAlign: 'right' }}>
              Out of stock
            </span>
          ) : hasVariants ? (
            <Link
              to={`/product/${product.id}`}
              style={{
                borderRadius: 6,
                border: '1px solid var(--color-fm-green)',
                color: 'var(--color-fm-green)',
                background: 'var(--color-fm-green-soft)',
                fontSize: 10, fontWeight: 700,
                minWidth: 52,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                textDecoration: 'none',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '3px 6px' }}>ADD</div>
              <div style={{
                background: '#dcf5e4',
                width: '100%', textAlign: 'center',
                fontSize: 8, color: '#4b7c5e', padding: '1px 3px',
                fontWeight: 500,
              }}>
                {product.variants.length} options
              </div>
            </Link>
          ) : cartItem ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderRadius: 6,
              border: '1px solid var(--color-fm-green)',
              background: 'var(--color-fm-green)',
              minWidth: 60, height: 26,
              padding: '0 5px',
            }}>
              <button
                onClick={handleDecrement}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                <Minus size={10} />
              </button>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', minWidth: 14, textAlign: 'center' }}>
                {cartItem.quantity}
              </span>
              <button
                onClick={() => addToCart(product)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                <Plus size={10} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product)}
              style={{
                borderRadius: 6,
                border: '1px solid var(--color-fm-green)',
                color: 'var(--color-fm-green)',
                background: 'var(--color-fm-green-soft)',
                fontSize: 11, fontWeight: 700,
                minWidth: 52, height: 26,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

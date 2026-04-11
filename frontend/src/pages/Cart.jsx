import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, loading, fetchCart, updateQuantity, removeItem, totalAmount } = useCart();
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, [fetchCart]);

  if (loading) return <div className="loading">Loading cart...</div>;

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <ShoppingBag size={48} />
          <h2>Your cart is empty</h2>
          <p>Add some items to get started</p>
          <Link to="/" className="btn btn-primary">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Shopping Cart</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.image_url || '/placeholder.png'} alt={item.name} className="cart-item-image" />
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p className="cart-item-price">₹{item.price} / {item.unit}</p>
              </div>
              <div className="quantity-selector">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                  <Minus size={14} />
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                  <Plus size={14} />
                </button>
              </div>
              <p className="cart-item-total">₹{item.price * item.quantity}</p>
              <button className="btn-icon danger" onClick={() => removeItem(item.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span className="free">FREE</span>
          </div>
          <hr />
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
          <button className="btn btn-primary btn-lg full-width" onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

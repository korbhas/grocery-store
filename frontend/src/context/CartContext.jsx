import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();
const STORAGE_KEY = 'freshmart_cart';

function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [loading, setLoading] = useState(false);

  // Persist to localStorage on every change
  useEffect(() => {
    saveCart(items);
  }, [items]);

  const fetchCart = useCallback(async () => {
    // Cart is already in state from localStorage
    setLoading(false);
  }, []);

  const addToCart = async (product, quantity = 1, variant = null) => {
    setItems((prev) => {
      const variantId = variant?.id || null;
      const availableStock = variant ? variant.stock_qty : product.stock_qty;
      const existing = prev.find((i) => i.product_id === product.id && i.variant_id === variantId);

      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > availableStock) {
          toast.error('Not enough stock');
          return prev;
        }
        return prev.map((i) =>
          i.product_id === product.id && i.variant_id === variantId ? { ...i, quantity: newQty } : i
        );
      }

      if (quantity > availableStock) {
        toast.error('Not enough stock');
        return prev;
      }

      return [
        ...prev,
        {
          id: Date.now(),
          product_id: product.id,
          variant_id: variantId,
          variant_name: variant?.name || null,
          name: product.name,
          price: variant ? parseFloat(variant.price) : parseFloat(product.price),
          unit: product.unit,
          image_url: product.image_url,
          stock_qty: availableStock,
          quantity,
        },
      ];
    });
    toast.success('Added to cart');
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeItem(cartItemId);
      return;
    }
    setItems((prev) => {
      const item = prev.find((i) => i.id === cartItemId);
      if (item && quantity > item.stock_qty) {
        toast.error('Not enough stock');
        return prev;
      }
      return prev.map((i) => (i.id === cartItemId ? { ...i, quantity } : i));
    });
  };

  const removeItem = (cartItemId) => {
    setItems((prev) => prev.filter((i) => i.id !== cartItemId));
    toast.success('Removed from cart');
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, fetchCart, addToCart, updateQuantity, removeItem, clearCart, totalAmount, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

const useCart = () => useContext(CartContext);

export { useCart };

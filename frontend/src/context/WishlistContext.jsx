import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/wishlist');
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setItems([]);
    }
  }, [user, fetchWishlist]);

  const isWishlisted = useCallback(
    (productId) => items.some((i) => i.id === productId),
    [items]
  );

  const toggle = useCallback(
    async (product) => {
      if (!user) return false;

      const already = items.some((i) => i.id === product.id);

      // Optimistic update
      if (already) {
        setItems((prev) => prev.filter((i) => i.id !== product.id));
      } else {
        setItems((prev) => [...prev, product]);
      }

      try {
        if (already) {
          await api.delete(`/wishlist/${product.id}`);
          toast.success('Removed from wishlist');
        } else {
          await api.post(`/wishlist/${product.id}`);
          toast.success('Added to wishlist');
        }
      } catch {
        // Revert on failure
        if (already) {
          setItems((prev) => [...prev, product]);
        } else {
          setItems((prev) => prev.filter((i) => i.id !== product.id));
        }
        toast.error('Something went wrong');
      }

      return !already;
    },
    [user, items]
  );

  const wishlistIds = items.map((i) => i.id);

  return (
    <WishlistContext.Provider value={{ items, wishlistIds, loading, isWishlisted, toggle }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}

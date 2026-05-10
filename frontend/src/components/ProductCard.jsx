import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart, items } = useCart();
  const inCart = items.find((i) => i.product_id === product.id);
  const outOfStock = product.stock_qty <= 0;

  return (
    <div className="group relative flex h-full flex-col rounded-xl border border-border bg-card pb-2 transition-shadow hover:shadow-lg">
      <Link to={`/product/${product.id}`} className="block overflow-hidden rounded-t-xl bg-muted">
        <img
          src={product.image_url || '/placeholder.png'}
          alt={product.name}
          className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
        />
        {inCart && !outOfStock && (
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#e23744] text-xs font-bold text-white shadow">
            {inCart.quantity}
          </span>
        )}
      </Link>

      <div className="mt-2 flex flex-1 flex-col px-3">
        <Link to={`/product/${product.id}`}>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{product.category_name}</p>
          <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-tight">{product.name}</h3>
        </Link>

        <div className="mt-auto flex items-end justify-between pt-2 pb-1">
          <div>
            <span className="text-base font-bold">₹{product.price}</span>
            <span className="ml-0.5 text-[11px] text-muted-foreground">{product.unit}</span>
          </div>

          {outOfStock ? (
            <Badge variant="destructive" className="text-[10px] px-2 py-0.5">Out of stock</Badge>
          ) : (
            <div className="relative">
              {inCart ? (
                <Link to="/cart" className="inline-flex h-8 items-center rounded-lg border border-[#e23744] bg-white px-3 text-sm font-bold text-[#e23744] hover:bg-red-50">
                  Go to Cart
                </Link>
              ) : (
                <Button
                  size="sm"
                  onClick={() => addToCart(product)}
                  className="h-8 rounded-lg bg-[#e23744] px-3 font-bold hover:bg-[#c52d39]"
                >
                  <Plus size={14} className="mr-0.5" />
                  ADD
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
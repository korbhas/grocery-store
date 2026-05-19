import { Link } from 'react-router-dom';
import { Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart, items } = useCart();
  const hasVariants = product.variants && product.variants.length > 0;
  const inCart = items.find((i) => i.product_id === product.id && !i.variant_id);
  const outOfStock = !hasVariants && product.stock_qty <= 0;

  return (
    <div className="group relative aspect-square overflow-hidden border border-border bg-muted">
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block h-full w-full">
        <img
          src={product.image_url || '/placeholder.png'}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Cart quantity badge */}
      {inCart && !outOfStock && (
        <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#e23744] text-[10px] font-bold text-white shadow">
          {inCart.quantity}
        </span>
      )}

      {/* Bottom overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-2 pb-2 pt-6">
        <Link to={`/product/${product.id}`}>
          <p className="line-clamp-1 text-[11px] font-semibold leading-tight text-white">{product.name}</p>
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <div className="leading-none">
            {hasVariants ? (
              <span className="text-xs font-bold text-white">
                From ₹{Math.min(...product.variants.map((v) => parseFloat(v.price)))}
              </span>
            ) : (
              <span className="text-xs font-bold text-white">₹{product.price}</span>
            )}
          </div>

          {hasVariants ? (
            <Link
              to={`/product/${product.id}`}
              className="inline-flex h-6 items-center rounded-md bg-[#e23744] px-2 text-[10px] font-bold text-white hover:bg-[#c52d39]"
            >
              Choose
            </Link>
          ) : outOfStock ? (
            <Badge variant="destructive" className="text-[9px] px-1.5 py-0">Out of stock</Badge>
          ) : inCart ? (
            <Link to="/cart" className="inline-flex h-6 w-6 items-center justify-center rounded-md text-white hover:bg-white/20">
              <ShoppingCart size={13} />
            </Link>
          ) : (
            <Button
              size="sm"
              onClick={() => addToCart(product)}
              className="h-6 w-6 rounded-md bg-transparent p-0 text-white hover:bg-white/20"
            >
              <Plus size={13} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

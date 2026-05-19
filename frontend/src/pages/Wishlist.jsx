import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function WishlistCard({ product }) {
  const { toggle } = useWishlist();
  const { addToCart, items } = useCart();
  const inCart = items.find((i) => i.product_id === product.id);
  const outOfStock = product.stock_qty <= 0;

  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card pb-2 transition-shadow hover:shadow-lg">
      <Link to={`/product/${product.id}`} className="block overflow-hidden rounded-t-xl bg-muted">
        <img
          src={product.image_url || '/placeholder.png'}
          alt={product.name}
          className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
        />
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product); }}
          aria-label="Remove from wishlist"
          className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow transition-transform hover:scale-110"
        >
          <Heart size={14} className="fill-[#e23744] text-[#e23744]" />
        </button>
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
          ) : inCart ? (
            <Link to="/cart" className="inline-flex h-8 items-center rounded-lg border border-[#e23744] bg-white px-3 text-sm font-bold text-[#e23744] hover:bg-red-50">
              Go to Cart
            </Link>
          ) : (
            <Button
              size="sm"
              onClick={() => addToCart(product)}
              className="h-8 rounded-lg bg-[#e23744] px-3 font-bold hover:bg-[#c52d39]"
            >
              Add to Cart
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Wishlist() {
  const { items, loading } = useWishlist();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="text-2xl font-bold">Wishlist</h1>
        {items.length > 0 && (
          <span className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e23744] border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
            <Heart size={28} className="text-zinc-300" />
          </div>
          <div>
            <p className="text-lg font-semibold">Your wishlist is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">Save items you love by tapping the heart icon</p>
          </div>
          <Link to="/">
            <Button className="mt-2 bg-[#e23744] hover:bg-[#c52d39]">Browse products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 [&>*]:scale-[0.96]">
          {items.map((product) => (
            <WishlistCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

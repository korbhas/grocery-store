import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Minus, Plus, Clock } from 'lucide-react';
import api from '../lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, items } = useCart();

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(({ data }) => {
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          const def = data.variants.find((v) => v.is_default) || data.variants[0];
          setSelectedVariant(def);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e23744] border-t-transparent" />
    </div>
  );
  if (!product) return <p className="py-16 text-center text-muted-foreground">Product not found</p>;

  const hasVariants = product.variants && product.variants.length > 0;
  const activePrice = selectedVariant ? parseFloat(selectedVariant.price) : parseFloat(product.price);
  const activeStock = selectedVariant ? selectedVariant.stock_qty : product.stock_qty;
  const outOfStock = activeStock <= 0;

  const inCart = items.find((i) =>
    i.product_id === product.id && i.variant_id === (selectedVariant?.id || null)
  );

  function handleSelectVariant(variant) {
    setSelectedVariant(variant);
    setQuantity(1);
  }

  function handleAddToCart() {
    addToCart(product, quantity, selectedVariant);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-[#e23744]">
        <ArrowLeft size={16} /> Back to Shop
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex items-center justify-center rounded-2xl bg-white p-4">
          <img
            src={product.image_url || '/placeholder.png'}
            alt={product.name}
            className="h-72 w-full rounded-xl object-cover md:h-80"
          />
        </div>

        <div className="flex flex-col gap-3">
          <Badge variant="secondary" className="w-fit text-xs font-semibold uppercase tracking-wide text-[#e23744]">
            {product.category_name}
          </Badge>
          <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>
          <p className="text-muted-foreground">{product.description}</p>

          {hasVariants && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Select size</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => handleSelectVariant(v)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                      selectedVariant?.id === v.id
                        ? 'border-[#e23744] bg-[#e23744] text-white'
                        : 'border-border bg-card text-foreground hover:border-[#e23744] hover:text-[#e23744]'
                    } ${v.stock_qty <= 0 ? 'opacity-40 line-through cursor-not-allowed' : ''}`}
                    disabled={v.stock_qty <= 0}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold">₹{activePrice}</span>
            {!hasVariants && <span className="text-muted-foreground">/ {product.unit}</span>}
          </div>

          <div className="flex items-center gap-1.5 text-sm text-green-600">
            <Clock size={14} />
            <span className="font-medium">Delivery in 10 minutes</span>
          </div>

          {outOfStock ? (
            <Badge variant="destructive" className="mt-2 w-fit">Out of Stock</Badge>
          ) : (
            <div className="mt-2 flex items-center gap-4">
              <div className="flex items-center overflow-hidden rounded-lg border border-[#e23744]">
                <Button variant="ghost" size="icon" aria-label="Decrease quantity" className="h-10 w-10 rounded-none" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus size={16} />
                </Button>
                <span className="flex h-10 w-10 items-center justify-center border-x border-[#e23744] text-lg font-bold">
                  {quantity}
                </span>
                <Button variant="ghost" size="icon" aria-label="Increase quantity" className="h-10 w-10 rounded-none" onClick={() => setQuantity(Math.min(activeStock, quantity + 1))}>
                  <Plus size={16} />
                </Button>
              </div>
              {inCart ? (
                <Link to="/cart">
                  <Button className="h-10 rounded-lg border-[#e23744] bg-white px-6 font-bold text-[#e23744] hover:bg-red-50" variant="outline">
                    Go to Cart
                  </Button>
                </Link>
              ) : (
                <Button className="h-10 rounded-lg bg-[#e23744] px-6 font-bold hover:bg-[#c52d39]" onClick={handleAddToCart}>
                  <ShoppingCart size={16} className="mr-1.5" /> Add to Cart
                </Button>
              )}
            </div>
          )}

          <div className="mt-4 rounded-xl border bg-card p-4 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Availability</span>
              <span className={`font-medium ${activeStock > 0 ? 'text-green-600' : 'text-destructive'}`}>
                {activeStock > 0 ? `In Stock (${activeStock})` : 'Out of Stock'}
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium">{product.category_name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

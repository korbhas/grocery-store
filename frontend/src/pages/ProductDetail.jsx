import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import api from '../lib/api';
import { useCart } from '../context/CartContext';
import { getIllustrationForCategory, getTintForCategory } from '../assets/illustrations';
import EyebrowLabel from '../components/ui/EyebrowLabel';
import OrnamentalDivider from '../components/ui/OrnamentalDivider';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

const CATEGORY_BLURBS = {
  produce: 'Picked at peak ripeness from nearby growers. Best enjoyed within the week.',
  fruits: 'Seasonal fruit, tree-ripened and unwaxed.',
  vegetables: 'Field-fresh vegetables, cold-chain kept from farm to door.',
  bakery: 'Baked each morning in small batches. No preservatives.',
  dairy: 'From pasture-raised herds, minimally processed.',
  pantry: 'Staples we\'d actually keep in our own kitchen.',
  beverages: 'Thoughtfully sourced. No artificial colors or sweeteners.',
  herbs: 'Aromatic herbs, cut the same morning.',
};

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(({ data }) => setProduct(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center text-ink-muted">Loading…</div>
    );
  }
  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <EmptyState illustration="Basket" title="Product not found" />
      </div>
    );
  }

  // eslint-disable-next-line react-hooks/static-components
  const Illustration = getIllustrationForCategory(product.category_slug);
  const tint = getTintForCategory(product.category_slug);
  const blurb = CATEGORY_BLURBS[(product.category_slug || '').toLowerCase()] ||
    'Chosen with care for our pantry.';
  const inStock = product.stock_qty > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Back to shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
        <div className={`${tint} rounded-lg aspect-square flex items-center justify-center p-12`}>
          <Illustration size={240} className="text-moss-deep" />
        </div>

        <div>
          <EyebrowLabel>{product.category_name || 'Grocer'}</EyebrowLabel>
          <h1 className="font-serif text-3xl sm:text-4xl text-ink mt-2 leading-tight">
            {product.name}
          </h1>
          {product.description && (
            <p className="text-ink-muted mt-4 leading-relaxed">{product.description}</p>
          )}

          <div className="flex items-baseline gap-2 mt-6">
            <span className="font-serif text-3xl text-ink">₹{product.price}</span>
            <span className="text-sm text-ink-muted">per {product.unit}</span>
          </div>

          <div className="mt-3">
            <span className={`text-sm ${inStock ? 'text-moss' : 'text-danger'}`}>
              {inStock ? `${product.stock_qty} ${product.unit} available` : 'Out of stock'}
            </span>
          </div>

          {inStock && (
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <div className="inline-flex items-center gap-4 border border-hairline rounded-sm px-2 py-1.5 self-start">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="font-serif text-lg min-w-[2ch] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_qty, quantity + 1))}
                  className="w-9 h-9 flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
              <Button
                size="lg"
                onClick={() => addToCart(product, quantity)}
                className="flex-1 sm:flex-initial"
              >
                Add to cart · ₹{(product.price * quantity).toFixed(2)}
              </Button>
            </div>
          )}

          <OrnamentalDivider />

          <div>
            <EyebrowLabel>On this category</EyebrowLabel>
            <p className="text-ink-muted mt-2 leading-relaxed">{blurb}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

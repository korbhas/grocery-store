import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getIllustrationForCategory, getTintForCategory } from '../assets/illustrations';
import EyebrowLabel from './ui/EyebrowLabel';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  // eslint-disable-next-line react-hooks/static-components
  const Illustration = getIllustrationForCategory(product.category_slug);
  const tint = getTintForCategory(product.category_slug);
  const inStock = product.stock_qty > 0;

  return (
    <div className="group bg-surface border border-hairline rounded-md overflow-hidden transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lift">
      <Link to={`/product/${product.id}`} className="block">
        <div className={`${tint} aspect-[4/3] flex items-center justify-center`}>
          <Illustration size={110} className="text-moss-deep transition-colors duration-150 group-hover:text-moss-deep" />
        </div>
      </Link>
      <div className="p-5">
        <EyebrowLabel>{product.category_name || 'Grocer'}</EyebrowLabel>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-serif text-lg text-ink mt-1 mb-2 leading-tight">{product.name}</h3>
        </Link>
        <div className="flex items-baseline gap-1 mb-4">
          <span className="font-serif text-xl text-ink">₹{product.price}</span>
          <span className="text-xs text-ink-muted">/ {product.unit}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-xs ${inStock ? 'text-moss' : 'text-danger'}`}>
            {inStock ? 'In stock' : 'Out of stock'}
          </span>
          {inStock && (
            <button
              onClick={() => addToCart(product)}
              className="text-sm font-medium text-moss hover:text-moss-deep underline underline-offset-4 decoration-moss/30 hover:decoration-moss-deep transition-colors"
            >
              Add to cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

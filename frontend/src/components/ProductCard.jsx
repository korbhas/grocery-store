import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`}>
        <div className="product-image">
          <img src={product.image_url || '/placeholder.png'} alt={product.name} />
        </div>
      </Link>
      <div className="product-info">
        <span className="product-category">{product.category_name}</span>
        <Link to={`/product/${product.id}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <p className="product-price">
          ₹{product.price} <span className="product-unit">/ {product.unit}</span>
        </p>
        <div className="product-footer">
          <span className={`stock-badge ${product.stock_qty > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.stock_qty > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
          {product.stock_qty > 0 && (
            <button className="btn btn-sm btn-primary" onClick={() => addToCart(product)}>
              <ShoppingCart size={14} /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

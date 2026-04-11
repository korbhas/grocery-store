import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-react';
import api from '../lib/api';
import { useCart } from '../context/CartContext';

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

  if (loading) return <div className="loading">Loading...</div>;
  if (!product) return <div className="empty-state">Product not found</div>;

  return (
    <div className="page">
      <Link to="/" className="back-link"><ArrowLeft size={18} /> Back to Shop</Link>

      <div className="product-detail">
        <div className="product-detail-image">
          <img src={product.image_url || '/placeholder.png'} alt={product.name} />
        </div>
        <div className="product-detail-info">
          <span className="product-category">{product.category_name}</span>
          <h1>{product.name}</h1>
          <p className="product-description">{product.description}</p>
          <p className="product-detail-price">
            ₹{product.price} <span className="product-unit">/ {product.unit}</span>
          </p>
          <span className={`stock-badge ${product.stock_qty > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.stock_qty > 0 ? `${product.stock_qty} in stock` : 'Out of Stock'}
          </span>

          {product.stock_qty > 0 && (
            <div className="add-to-cart-section">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock_qty, quantity + 1))}><Plus size={16} /></button>
              </div>
              <button className="btn btn-primary btn-lg" onClick={() => addToCart(product, quantity)}>
                <ShoppingCart size={18} /> Add to Cart - ₹{product.price * quantity}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const qParam = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(() => {
    const params = {};
    if (categoryParam) params.category = categoryParam;
    if (qParam) params.search = qParam;

    api.get('/products', { params })
      .then(({ data }) => setProducts(data.products ?? data))
      .finally(() => setLoading(false));
  }, [categoryParam, qParam]);

  useEffect(() => {
    setLoading(true);
    fetchProducts();
  }, [fetchProducts]);

  const heading = qParam ? `Results for "${qParam}"` : 'All Products';

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-fm-paper)',
      fontFamily: 'var(--font-sans)',
      color: 'var(--color-fm-ink)',
      overflowY: 'auto',
    }}>
      <main style={{ padding: '16px', flex: 1 }}>
        <div style={{
          fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700,
          marginBottom: 14, color: 'var(--color-fm-ink)',
        }}>
          {heading}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1f4d34] border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--color-fm-ink2)' }}>
              No products found
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-fm-ink3)', marginTop: 4 }}>
              Try a different search or category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 pb-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

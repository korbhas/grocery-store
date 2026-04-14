import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';
import EyebrowLabel from '../components/ui/EyebrowLabel';
import OrnamentalDivider from '../components/ui/OrnamentalDivider';
import EmptyState from '../components/ui/EmptyState';
import { Sprig, Wheat } from '../assets/illustrations';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/categories').then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (search) params.search = search;

    api.get('/products', { params })
      .then(({ data }) => setProducts(data.products))
      .finally(() => setLoading(false));
  }, [selectedCategory, search]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <header className="text-center mb-12 sm:mb-16 relative">
        <Wheat size={56} className="text-moss/50 absolute left-4 top-0 hidden md:block" aria-hidden="true" />
        <Sprig size={56} className="text-moss/50 absolute right-4 top-0 hidden md:block" aria-hidden="true" />
        <EyebrowLabel>Est. 2026 · A considered grocer</EyebrowLabel>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-ink mt-3 leading-[1.05]">
          Small batches.<br />Honest produce.
        </h1>
        <p className="text-ink-muted mt-5 max-w-md mx-auto text-[15px] leading-relaxed">
          A curated pantry of daily essentials, delivered with care.
        </p>
      </header>

      <OrnamentalDivider />

      <div className="mb-10">
        <div className="relative mb-6 max-w-2xl mx-auto">
          <Search size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Search the pantry…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-hairline pl-7 pr-2 py-3 text-[15px] text-ink placeholder:text-ink-muted focus:border-moss focus:outline-none transition-colors"
          />
        </div>
        <div className="flex items-center justify-center gap-x-1 gap-y-2 flex-wrap">
          <CategoryLink active={selectedCategory === ''} onClick={() => setSelectedCategory('')}>
            All
          </CategoryLink>
          {categories.map((cat) => (
            <span key={cat.id} className="flex items-center gap-1">
              <span className="text-ink-muted/40" aria-hidden="true">·</span>
              <CategoryLink
                active={selectedCategory === cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
              >
                {cat.name}
              </CategoryLink>
            </span>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-16 text-ink-muted">
          <Sprig size={40} className="text-moss animate-spin [animation-duration:2.4s]" aria-hidden="true" />
          <p className="mt-4 text-sm">Gathering the harvest…</p>
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          illustration="Basket"
          title="Nothing on the shelf"
          body="Try a different search or category."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryLink({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 text-sm font-medium transition-colors ${
        active
          ? 'text-moss-deep underline underline-offset-4 decoration-moss'
          : 'text-ink-muted hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { Filter, X, AlertCircle } from 'lucide-react';
import ProductCard from '../components/shop/ProductCard';
import { listProducts } from '@/services/products';

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Swimwear', 'Footwear', 'Accessories'];

const PRICE_FILTERS = [
  { value: 'all',     label: 'All Prices' },
  { value: 'under50', label: 'Under $50' },
  { value: '50to100', label: '$50 – $100' },
  { value: 'over100', label: 'Over $100' },
];

function applyPriceFilter(products, priceRange) {
  if (priceRange === 'under50')  return products.filter((p) => p.price < 50);
  if (priceRange === '50to100') return products.filter((p) => p.price >= 50 && p.price <= 100);
  if (priceRange === 'over100') return products.filter((p) => p.price > 100);
  return products;
}

export default function Shop() {
  const [allProducts,   setAllProducts]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange,    setPriceRange]    = useState('all');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Read ?category= from URL on first load
  useEffect(() => {
    const urlParams  = new URLSearchParams(window.location.search);
    const catParam   = urlParams.get('category');
    if (catParam && CATEGORIES.includes(catParam)) {
      setSelectedCategory(catParam);
    }
  }, []);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listProducts();
      setAllProducts(data);
    } catch (err) {
      setError(err?.message || 'Failed to load products. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Client-side filtering (category + price)
  const filteredProducts = React.useMemo(() => {
    let result = allProducts;
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }
    return applyPriceFilter(result, priceRange);
  }, [allProducts, selectedCategory, priceRange]);

  // Derived category list from API data + static fallback
  const categories = React.useMemo(() => {
    if (allProducts.length === 0) return CATEGORIES;
    const apiCats = [...new Set(allProducts.map((p) => p.category))].sort();
    return ['All', ...apiCats];
  }, [allProducts]);

  const FilterSidebar = () => (
    <>
      <div className="flex items-center gap-2 mb-7">
        <Filter className="w-4 h-4 text-[#111111]" />
        <h2 className="text-xs font-semibold tracking-widest uppercase text-[#111111]">Filters</h2>
      </div>

      <div className="mb-7">
        <h3 className="text-xs font-semibold tracking-widest uppercase text-[#888888] mb-3">Category</h3>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setMobileFiltersOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                selectedCategory === cat
                  ? 'bg-[#111111] text-white font-medium'
                  : 'text-[#4A4A4A] hover:bg-[#F5EFE0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold tracking-widest uppercase text-[#888888] mb-3">Price Range</h3>
        <div className="space-y-1">
          {PRICE_FILTERS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setPriceRange(opt.value); setMobileFiltersOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                priceRange === opt.value
                  ? 'bg-[#111111] text-white font-medium'
                  : 'text-[#4A4A4A] hover:bg-[#F5EFE0]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#C96B3A] mb-3">Collection</p>
          <h1
            className="text-5xl md:text-6xl font-black text-[#111111] mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Shop All
          </h1>
          {!loading && !error && (
            <p className="text-[#888888] text-sm">Discover {filteredProducts.length} products</p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <FilterSidebar />
            </div>
          </aside>

          {/* Mobile filter toggle */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full text-sm font-medium hover:bg-[#F5EFE0] transition-colors border border-[#111111]/10"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Mobile filters drawer */}
          {mobileFiltersOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-[#111111]/60 z-50"
              onClick={() => setMobileFiltersOpen(false)}
            >
              <div
                className="absolute right-0 top-0 bottom-0 w-72 max-w-full bg-[#FAF7F2] p-8 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xs font-semibold tracking-widest uppercase text-[#111111]">Filters</h2>
                  <button onClick={() => setMobileFiltersOpen(false)}>
                    <X className="w-5 h-5 text-[#111111]" />
                  </button>
                </div>
                <FilterSidebar />
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1">
            {/* Loading skeleton */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                <p className="text-[#4A4A4A] mb-6">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="px-8 py-3 bg-[#111111] text-white rounded-full text-sm font-semibold hover:bg-[#C96B3A] transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Product grid */}
            {!loading && !error && filteredProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && filteredProducts.length === 0 && (
              <div className="text-center py-24">
                <p className="text-[#4A4A4A] mb-6">No products found matching your filters.</p>
                <button
                  onClick={() => { setSelectedCategory('All'); setPriceRange('all'); }}
                  className="px-8 py-3 bg-[#111111] text-white rounded-full text-sm font-semibold hover:bg-[#C96B3A] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

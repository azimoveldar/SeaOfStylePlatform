import React, { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import ProductCard from '../components/shop/ProductCard';
import { mockProducts, categories } from '../components/mockData';

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, []);

  useEffect(() => {
    let filtered = [...mockProducts];
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    if (priceRange === 'under50') {
      filtered = filtered.filter(p => p.price < 50);
    } else if (priceRange === '50to100') {
      filtered = filtered.filter(p => p.price >= 50 && p.price <= 100);
    } else if (priceRange === 'over100') {
      filtered = filtered.filter(p => p.price > 100);
    }
    setFilteredProducts(filtered);
  }, [selectedCategory, priceRange]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#C96B3A] mb-3">Collection</p>
          <h1 className="text-5xl md:text-6xl font-black text-[#111111] mb-2" style={{fontFamily:'Playfair Display, serif'}}>Shop All</h1>
          <p className="text-[#888888] text-sm">Discover {filteredProducts.length} products</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Filters - Desktop */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-7">
                <Filter className="w-4 h-4 text-[#111111]" />
                <h2 className="text-xs font-semibold tracking-widest uppercase text-[#111111]">Filters</h2>
              </div>

              <div className="mb-7">
                <h3 className="text-xs font-semibold tracking-widest uppercase text-[#888888] mb-3">Category</h3>
                <div className="space-y-1">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                        selectedCategory === category
                          ? 'bg-[#111111] text-white font-medium'
                          : 'text-[#4A4A4A] hover:bg-[#F5EFE0]'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold tracking-widest uppercase text-[#888888] mb-3">Price Range</h3>
                <div className="space-y-1">
                  {[
                    { value: 'all', label: 'All Prices' },
                    { value: 'under50', label: 'Under $50' },
                    { value: '50to100', label: '$50 – $100' },
                    { value: 'over100', label: 'Over $100' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setPriceRange(option.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                        priceRange === option.value
                          ? 'bg-[#111111] text-white font-medium'
                          : 'text-[#4A4A4A] hover:bg-[#F5EFE0]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full text-sm font-medium hover:bg-[#F5EFE0] transition-colors border border-[#111111]/10"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Mobile Filters */}
          {mobileFiltersOpen && (
            <div className="lg:hidden fixed inset-0 bg-[#111111]/60 z-50" onClick={() => setMobileFiltersOpen(false)}>
              <div
                className="absolute right-0 top-0 bottom-0 w-72 max-w-full bg-[#FAF7F2] p-8 overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xs font-semibold tracking-widest uppercase text-[#111111]">Filters</h2>
                  <button onClick={() => setMobileFiltersOpen(false)}>
                    <X className="w-5 h-5 text-[#111111]" />
                  </button>
                </div>
                <div className="mb-7">
                  <h3 className="text-xs font-semibold tracking-widest uppercase text-[#888888] mb-3">Category</h3>
                  <div className="space-y-1">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => { setSelectedCategory(category); setMobileFiltersOpen(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                          selectedCategory === category ? 'bg-[#111111] text-white font-medium' : 'text-[#4A4A4A] hover:bg-[#F5EFE0]'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold tracking-widest uppercase text-[#888888] mb-3">Price Range</h3>
                  <div className="space-y-1">
                    {[
                      { value: 'all', label: 'All Prices' },
                      { value: 'under50', label: 'Under $50' },
                      { value: '50to100', label: '$50 – $100' },
                      { value: 'over100', label: 'Over $100' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => { setPriceRange(option.value); setMobileFiltersOpen(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                          priceRange === option.value ? 'bg-[#111111] text-white font-medium' : 'text-[#4A4A4A] hover:bg-[#F5EFE0]'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
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
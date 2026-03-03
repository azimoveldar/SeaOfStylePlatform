import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { createPageUrl } from '@/utils';
import ProductCard from '../components/shop/ProductCard';
import { listProducts } from '@/services/products';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Derive categories from API data for the category strip
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await listProducts();
        if (!mounted) return;
        // Show first 4 as featured (or products with isFeatured flag)
        const featured = data.filter((p) => p.isFeatured).slice(0, 4);
        setFeaturedProducts(featured.length > 0 ? featured : data.slice(0, 4));
        // Build unique category list
        const cats = [...new Set(data.map((p) => p.category))].sort();
        setCategories(cats);
      } catch {
        // Silent fail on home page — products section just won't show
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="bg-[#FAF7F2]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#F5EFE0] py-24 md:py-40">
        <div className="absolute right-0 top-0 w-[60vw] h-[60vw] max-w-3xl max-h-3xl rounded-full bg-[#EDD9A3]/30 translate-x-1/3 -translate-y-1/4 pointer-events-none" />
        <div className="absolute left-1/4 bottom-0 w-64 h-64 rounded-full bg-[#E8A84C]/10 translate-y-1/2 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/70 border border-[#E8A84C]/30 px-4 py-2 rounded-full mb-8">
              <Sparkles className="w-3.5 h-3.5 text-[#C96B3A]" />
              <span className="text-xs font-semibold tracking-widest uppercase text-[#C96B3A]">New Summer Collection</span>
            </div>

            <h1
              className="text-6xl md:text-8xl font-black text-[#111111] mb-8 leading-[0.95] tracking-tight"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Where Style
              <br />
              <em className="not-italic text-[#C96B3A]">Makes Waves</em>
            </h1>

            <p className="text-lg text-[#4A4A4A] mb-10 max-w-lg leading-relaxed font-light">
              Discover curated fashion pieces that flow seamlessly from day to night. Dive into a sea of possibilities.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to={createPageUrl('Shop')}
                className="inline-flex items-center gap-2.5 bg-[#111111] text-white px-9 py-4 rounded-full font-semibold tracking-wide hover:bg-[#C96B3A] transition-all duration-300 text-sm"
              >
                Shop Collection
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={createPageUrl('About')}
                className="inline-flex items-center gap-2 text-[#111111] px-9 py-4 rounded-full font-semibold tracking-wide border border-[#111111]/20 hover:border-[#111111] transition-all duration-300 text-sm bg-transparent"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 48C240 16 480 0 720 16C960 32 1200 48 1440 32V48H0Z" fill="#FAF7F2" />
          </svg>
        </div>
      </section>

      {/* Categories strip */}
      {categories.length > 0 && (
        <section className="py-12 bg-[#FAF7F2]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to={`${createPageUrl('Shop')}?category=${encodeURIComponent(cat)}`}
                  className="px-6 py-2.5 bg-white rounded-full text-sm font-medium text-[#111111] border border-[#111111]/10 hover:bg-[#111111] hover:text-white transition-all duration-200"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#C96B3A] mb-3">Handpicked for you</p>
              <h2
                className="text-4xl md:text-5xl font-black text-[#111111]"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Featured Pieces
              </h2>
            </div>
            <Link
              to={createPageUrl('Shop')}
              className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-[#111111] hover:text-[#C96B3A] transition-colors"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
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

          {!loading && featuredProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-10 text-center md:hidden">
            <Link
              to={createPageUrl('Shop')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#111111] hover:text-[#C96B3A] transition-colors"
            >
              View all products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

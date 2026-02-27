import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { createPageUrl } from '@/utils';
import ProductCard from '../components/shop/ProductCard';
import { mockProducts, categories } from '../components/mockData';

export default function Home() {
  const featuredProducts = mockProducts.slice(0, 4);

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

            <h1 className="text-6xl md:text-8xl font-black text-[#111111] mb-8 leading-[0.95] tracking-tight" style={{fontFamily:'Playfair Display, serif'}}>
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
            <path d="M0 48C240 16 480 0 720 16C960 32 1200 48 1440 32V48H0Z" fill="#FAF7F2"/>
          </svg>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#C96B3A] mb-3">Curated for You</p>
              <h2 className="text-5xl font-black text-[#111111] leading-tight" style={{fontFamily:'Playfair Display, serif'}}>Featured Styles</h2>
            </div>
            <Link
              to={createPageUrl('Shop')}
              className="hidden md:inline-flex items-center gap-2 text-[#111111] font-semibold hover:text-[#C96B3A] transition-colors text-sm border-b border-[#111111]/20 hover:border-[#C96B3A] pb-0.5"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-10 text-center md:hidden">
            <Link
              to={createPageUrl('Shop')}
              className="inline-flex items-center gap-2 text-[#111111] font-semibold hover:text-[#C96B3A] transition-colors text-sm"
            >
              View All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Category Highlights */}
      <section className="py-28 bg-[#F5EFE0]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#C96B3A] mb-3">Explore</p>
            <h2 className="text-5xl font-black text-[#111111]" style={{fontFamily:'Playfair Display, serif'}}>Shop by Category</h2>
            <p className="text-[#4A4A4A] max-w-md mx-auto mt-4 font-light leading-relaxed">
              Explore our carefully curated collections designed for every moment
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {categories.slice(1, 5).map((category, index) => {
              const bgs = ['bg-[#EDD9A3]', 'bg-[#E8C4A8]', 'bg-[#D4C4B0]', 'bg-[#E0D0B8]'];
              return (
                <Link
                  key={category}
                  to={createPageUrl(`Shop?category=${category}`)}
                  className={`group relative aspect-square rounded-3xl overflow-hidden ${bgs[index]} hover:shadow-2xl transition-all duration-500`}
                >
                  <div className="absolute inset-0 bg-[#111111]/0 group-hover:bg-[#111111]/8 transition-all duration-500 rounded-3xl" />
                  <div className="absolute inset-0 flex flex-col items-start justify-end p-7">
                    <h3 className="text-2xl font-black text-[#111111] group-hover:text-[#C96B3A] transition-colors duration-300" style={{fontFamily:'Playfair Display, serif'}}>
                      {category}
                    </h3>
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#111111]/50 group-hover:text-[#C96B3A] transition-colors mt-1">
                      Shop now <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-[#111111] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white" />
        </div>
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative z-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#E8A84C] mb-6">Join Us</p>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight" style={{fontFamily:'Playfair Display, serif'}}>
            Ready to Make a Splash?
          </h2>
          <p className="text-[#A0A0A0] mb-10 max-w-xl mx-auto font-light leading-relaxed">
            Join thousands of style enthusiasts who've discovered their perfect look with Sea of Style
          </p>
          <Link
            to={createPageUrl('Shop')}
            className="inline-flex items-center gap-2.5 bg-white text-[#111111] px-10 py-4 rounded-full font-semibold tracking-wide hover:bg-[#E8A84C] transition-all duration-300 text-sm"
          >
            Start Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
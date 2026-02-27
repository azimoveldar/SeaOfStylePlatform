import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-black mb-4 text-white" style={{fontFamily:'Playfair Display, serif'}}>Sea of Style</h3>
            <p className="text-[#888888] max-w-sm leading-relaxed text-sm font-light">
              Where collaboration meets fashion. Discover curated pieces that make waves in your wardrobe.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-[#E8A84C] mb-5">Shop</h4>
            <ul className="space-y-3">
              {['All Products','New Arrivals','Sale'].map(label => (
                <li key={label}>
                  <Link to={createPageUrl('Shop')} className="text-[#888888] hover:text-white transition-colors text-sm">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-[#E8A84C] mb-5">Company</h4>
            <ul className="space-y-3">
              <li><Link to={createPageUrl('About')} className="text-[#888888] hover:text-white transition-colors text-sm">About Us</Link></li>
              <li><Link to={createPageUrl('Contact')} className="text-[#888888] hover:text-white transition-colors text-sm">Contact</Link></li>
              <li><Link to={createPageUrl('Account')} className="text-[#888888] hover:text-white transition-colors text-sm">My Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[#555555] text-xs">
          <p>© {new Date().getFullYear()} Sea of Style. All rights reserved.</p>
          <p>Built by Shirish, Eldar & Amir</p>
        </div>
      </div>
    </footer>
  );
}
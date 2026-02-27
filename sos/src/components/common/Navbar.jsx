import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';
import { createPageUrl } from '@/utils';

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const { getItemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const itemCount = getItemCount();

  return (
    <nav className="bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#111111]/6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-18 py-4">
          {/* Logo */}
          <Link to={createPageUrl('Home')} className="flex items-center group">
            <span className="text-xl font-black text-[#111111] tracking-tight group-hover:text-[#C96B3A] transition-colors" style={{fontFamily:'Playfair Display, serif'}}>
              Sea of Style
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            {['Home','Shop','About','Contact'].map(page => (
              <Link
                key={page}
                to={createPageUrl(page)}
                className="text-[#111111]/70 text-sm font-medium hover:text-[#111111] transition-colors tracking-wide"
              >
                {page}
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-3">
            <Link
              to={createPageUrl('Cart')}
              className="relative p-2 hover:bg-[#111111]/5 rounded-full transition-colors"
            >
              <ShoppingBag className="w-5 h-5 text-[#111111]" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#C96B3A] text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <Link
                to={createPageUrl('Account')}
                className="p-2 hover:bg-[#111111]/5 rounded-full transition-colors"
              >
                <User className="w-5 h-5 text-[#111111]" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="p-2 hover:bg-[#111111]/5 rounded-full transition-colors"
              >
                <User className="w-5 h-5 text-[#111111]" />
              </Link>
            )}

            {isAdmin && (
              <Link
                to={createPageUrl('Admin')}
                className="hidden md:block px-4 py-2 bg-[#111111] text-white text-xs font-semibold rounded-full tracking-wide hover:bg-[#C96B3A] transition-colors"
              >
                Admin
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-[#111111]/5 rounded-full transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#111111]/8 bg-[#FAF7F2]">
          <div className="px-6 py-6 space-y-4">
            {['Home','Shop','About','Contact'].map(page => (
              <Link
                key={page}
                to={createPageUrl(page)}
                className="block text-[#111111] font-medium hover:text-[#C96B3A] transition-colors py-1 text-sm tracking-wide"
                onClick={() => setMobileMenuOpen(false)}
              >
                {page}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to={createPageUrl('Admin')}
                className="block text-[#111111] font-medium hover:text-[#C96B3A] transition-colors py-1 text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
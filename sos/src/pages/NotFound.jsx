import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm p-10 text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#C96B3A] mb-3">404</p>
        <h1 className="text-3xl sm:text-4xl font-black text-[#111111] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
          Page not found
        </h1>
        <p className="text-gray-600 mb-8">The page you’re looking for doesn’t exist (or was moved).</p>
        <Link
          to={createPageUrl('Home')}
          className="inline-flex items-center justify-center bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-[#C96B3A] transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

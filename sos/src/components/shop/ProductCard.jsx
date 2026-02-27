import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProductCard({ product }) {
  return (
    <Link
      to={createPageUrl(`ProductDetail?id=${product.id}`)}
      className="group block"
    >
      <div className="aspect-square overflow-hidden rounded-2xl bg-[#EDE8DF] mb-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </div>
      <div className="px-1">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-[#C96B3A] mb-1">{product.category}</p>
        <h3 className="font-semibold text-[#111111] group-hover:text-[#C96B3A] transition-colors duration-200 leading-snug mb-2" style={{fontFamily:'Playfair Display, serif'}}>
          {product.name}
        </h3>
        <p className="text-base font-bold text-[#111111]">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}
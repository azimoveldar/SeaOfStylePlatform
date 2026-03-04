import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23EDE8DF"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23999">No image</text></svg>';

// S3 images base URL from env (for constructing image URLs from relative paths)
const S3_BASE = (import.meta.env.VITE_S3_IMAGES_BASE_URL || '').replace(/\/$/, '');

/**
 * Resolve an image URL stored in DynamoDB.
 * May be:
 *   - Full HTTPS URL  →  use as-is
 *   - S3 key like "products/uuid.jpg"  →  prepend S3_BASE
 *   - Empty / null    →  use placeholder
 */
function resolveImageUrl(raw) {
  if (!raw) return PLACEHOLDER;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('data:')) return raw;
  // Relative key — prepend S3 base URL
  if (S3_BASE) return `${S3_BASE}/${raw.replace(/^\//, '')}`;
  return PLACEHOLDER;
}

export default function ProductCard({ product }) {
  const [imgSrc, setImgSrc] = useState(() => resolveImageUrl(product.image));

  return (
    <Link
      to={createPageUrl(`ProductDetail?id=${product.id}`)}
      className="group block"
    >
      <div className="aspect-square overflow-hidden rounded-2xl bg-[#EDE8DF] mb-4">
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={() => setImgSrc(PLACEHOLDER)}
        />
      </div>
      <div className="px-1">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-[#C96B3A] mb-1">
          {product.category}
        </p>
        <h3
          className="font-semibold text-[#111111] group-hover:text-[#C96B3A] transition-colors duration-200 leading-snug mb-2"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {product.name}
        </h3>
        <p className="text-base font-bold text-[#111111]">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}

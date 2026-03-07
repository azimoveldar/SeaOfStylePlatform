// utils/resolveImageUrl.js
// Resolve an image URL stored in DynamoDB/S3.
// Supports:
//  - Full URL (https://...) -> returned as-is
//  - Data URL (data:...)    -> returned as-is
//  - S3 key like "products/uuid.jpg" -> prepends VITE_S3_IMAGES_BASE_URL
//  - Empty/null -> placeholder SVG
const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#EDE8DF"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-family="sans-serif" font-size="14" fill="#999">No image</text>
    </svg>
  `);

// S3/CloudFront base URL (no trailing slash)
const S3_BASE = (import.meta.env.VITE_S3_IMAGES_BASE_URL || '').replace(/\/$/, '');

export function resolveImageUrl(raw) {
  if (!raw) return PLACEHOLDER;

  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('data:')) return raw;

  // Treat as relative key
  if (S3_BASE) return `${S3_BASE}/${String(raw).replace(/^\//, '')}`;
  return PLACEHOLDER;
}

export { PLACEHOLDER };

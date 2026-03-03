/**
 * services/products.js
 *
 * All product-related API calls.
 * API shape assumed:
 *   GET  /products           → { items: Product[] }  or  Product[]
 *   GET  /products/{id}      → Product
 *   POST /admin/products     → Product  (requires admin JWT)
 *   PUT  /admin/products/{id}→ Product  (requires admin JWT)
 *   DELETE /admin/products/{id} → { success: true }
 *   GET  /admin/products/upload-url?filename=x&contentType=image/jpeg
 *        → { uploadUrl: string, publicUrl: string }
 */

import { api, apiGet, apiPost, apiPut, apiDelete } from './apiClient';

// ─── Normalise response shapes ────────────────────────────────────────────────
// API may return plain array OR { items: [...] } OR { products: [...] }
function extractList(data) {
  if (Array.isArray(data))          return data;
  if (Array.isArray(data?.items))   return data.items;
  if (Array.isArray(data?.products))return data.products;
  return [];
}

// ─── Public (no auth required) ────────────────────────────────────────────────

/** List all products. Optionally filter by category on the server. */
export async function listProducts({ category } = {}) {
  const qs   = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
  const data = await apiGet(`/products${qs}`);
  return extractList(data);
}

/** Get a single product by ID. */
export async function getProduct(productId) {
  return apiGet(`/products/${productId}`);
}

// ─── Admin (requires admin Cognito JWT) ───────────────────────────────────────

/** Create a new product */
export async function adminCreateProduct(productData) {
  return apiPost('/admin/products', productData);
}

/** Update an existing product */
export async function adminUpdateProduct(productId, productData) {
  return apiPut(`/admin/products/${productId}`, productData);
}

/** Delete a product */
export async function adminDeleteProduct(productId) {
  return apiDelete(`/admin/products/${productId}`);
}

/** Toggle in-stock status */
export async function adminToggleStock(productId, inStock) {
  return apiPut(`/admin/products/${productId}`, { inStock });
}

/**
 * Get a pre-signed S3 upload URL for a product image.
 * Returns { uploadUrl, publicUrl }
 *   uploadUrl  — PUT directly to this S3 URL (no auth header needed on S3)
 *   publicUrl  — CloudFront URL to store as product.image
 */
export async function adminGetImageUploadUrl(filename, contentType) {
  return apiGet(
    `/admin/products/upload-url?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(contentType)}`
  );
}

/**
 * Full image upload flow:
 *  1. Get pre-signed URL from API
 *  2. PUT file directly to S3
 *  3. Return the public CloudFront URL to store on the product
 */
export async function adminUploadProductImage(file) {
  const { uploadUrl, publicUrl } = await adminGetImageUploadUrl(file.name, file.type);

  const uploadRes = await fetch(uploadUrl, {
    method:  'PUT',
    headers: { 'Content-Type': file.type },
    body:    file,
  });

  if (!uploadRes.ok) {
    throw new Error(`S3 upload failed: ${uploadRes.status} ${uploadRes.statusText}`);
  }

  return publicUrl;
}

/**
 * services/products.js
 *
 * API shape:
 *   GET  /products                → { items: Product[] }
 *   GET  /products/{id}           → Product
 *   POST /admin/products          → Product  (admin JWT)
 *   PUT  /admin/products/{id}     → Product  (admin JWT)
 *   DELETE /admin/products/{id}   → { success: true }  (admin JWT)
 *   GET  /admin/products/upload-url?filename=x&contentType=y → { uploadUrl, publicUrl }
 *
 * IMPORTANT — productId encoding:
 *   Old products in DynamoDB have productId = "products/uuid" (the S3 key was
 *   mistakenly used as the PK). New products have productId = "uuid".
 *
 *   When building API URLs, we URL-encode the productId so that slashes
 *   in old IDs don't create extra path segments:
 *     "products/uuid" → PUT /admin/products/products%2Fuuid
 *
 *   The Lambda URL-decodes pathParameters automatically (API Gateway does this),
 *   so the Lambda always receives the full original productId.
 */

import { api, apiGet, apiPost, apiPut, apiDelete } from './apiClient';

function extractList(data) {
  if (Array.isArray(data))           return data;
  if (Array.isArray(data?.items))    return data.items;
  if (Array.isArray(data?.products)) return data.products;
  return [];
}

/**
 * Encode a productId for use in URL paths.
 * Slashes must be percent-encoded so they don't create extra path segments.
 * "products/uuid" → "products%2Fuuid"
 */
function encodeProductId(productId) {
  return encodeURIComponent(productId);
}

// ─── Public ────────────────────────────────────────────────────────────────────

export async function listProducts({ category } = {}) {
  const qs   = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
  const data = await apiGet(`/products${qs}`);
  return extractList(data);
}

export async function getProduct(productId) {
  return apiGet(`/products/${encodeProductId(productId)}`);
}

// ─── Admin ─────────────────────────────────────────────────────────────────────

export async function adminCreateProduct(productData) {
  return apiPost('/admin/products', productData);
}

export async function adminUpdateProduct(productId, productData) {
  return apiPut(`/admin/products/${encodeProductId(productId)}`, productData);
}

export async function adminDeleteProduct(productId) {
  return apiDelete(`/admin/products/${encodeProductId(productId)}`);
}

export async function adminToggleStock(productId, inStock) {
  return apiPut(`/admin/products/${encodeProductId(productId)}`, { inStock });
}

export async function adminGetImageUploadUrl(filename, contentType) {
  return apiGet(
    `/admin/products/upload-url?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(contentType)}`
  );
}

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

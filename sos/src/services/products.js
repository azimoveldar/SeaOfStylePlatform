/**
 * services/products.js
 *
 * API shape:
 *   GET  /products                → { items: Product[] }
 *   GET  /products/{id}           → Product
 *   GET  /admin/products          → { items: Product[] } (admin JWT)
 *   POST /admin/products          → Product  (admin JWT)
 *   PUT  /admin/products/{id}     → Product  (admin JWT)
 *   DELETE /admin/products/{id}   → { success: true }  (admin JWT)
 *   GET  /admin/products/upload-url?filename=x&contentType=y → { uploadUrl, publicUrl }
 */

import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';

function normalizeProduct(product) {
  if (!product || typeof product !== 'object') return product;

  const rawId = product.productId ?? product.id ?? product._id ?? '';

  return {
    ...product,
    productId: rawId,
    id: rawId,
    price: Number(product.price || 0),
  };
}

function extractList(data) {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.products)
        ? data.products
        : [];

  return list.map(normalizeProduct);
}

function encodeProductId(productId) {
  return encodeURIComponent(productId);
}

export async function listProducts({ category } = {}) {
  const qs = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
  const data = await apiGet(`/products${qs}`);
  return extractList(data);
}

export async function adminListProducts() {
  const data = await apiGet('/admin/products');
  return extractList(data);
}

export async function getProduct(productId) {
  const data = await apiGet(`/products/${encodeProductId(productId)}`);
  return normalizeProduct(data);
}

export async function adminCreateProduct(productData) {
  const data = await apiPost('/admin/products', productData);
  return normalizeProduct(data);
}

export async function adminUpdateProduct(productId, productData) {
  const data = await apiPut(`/admin/products/${encodeProductId(productId)}`, productData);
  return normalizeProduct(data);
}

export async function adminDeleteProduct(productId) {
  return apiDelete(`/admin/products/${encodeProductId(productId)}`);
}

export async function adminToggleStock(productId, inStock) {
  const data = await apiPut(`/admin/products/${encodeProductId(productId)}`, { inStock });
  return normalizeProduct(data);
}

export async function adminGetImageUploadUrl(filename, contentType) {
  return apiGet(
    `/admin/products/upload-url?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(contentType)}`
  );
}

export async function adminUploadProductImage(file) {
  const { uploadUrl, publicUrl } = await adminGetImageUploadUrl(file.name, file.type);

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error(`S3 upload failed: ${uploadRes.status} ${uploadRes.statusText}`);
  }

  return publicUrl;
}

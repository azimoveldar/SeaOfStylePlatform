/**
 * services/orders.js
 *
 * All order-related API calls.
 * API shape:
 *   GET  /orders             → { items: Order[] } | Order[]  (user's own orders)
 *   GET  /admin/orders       → { items: Order[] } | Order[]  (all orders, admin only)
 *   PUT  /admin/orders/{id}  → Order  (update status, admin only)
 */

import { apiGet, apiPut } from './apiClient';

function asArray(maybe) {
  if (!maybe) return [];
  if (Array.isArray(maybe)) return maybe;
  // Some backends return { items: [...] }
  if (Array.isArray(maybe.items)) return maybe.items;
  return [];
}

/**
 * Normalise order shape across backend variations.
 * Ensures `order.items` is an array (so UI doesn't show "0 items" incorrectly).
 */
function normalizeOrder(o) {
  if (!o || typeof o !== 'object') return o;

  const candidate =
    o.items ??
    o.lineItems ??
    o.orderItems ??
    o.cartItems ??
    o.products ??
    o.order_lines ??
    o.orderLines;

  const items = asArray(candidate);

  return {
    ...o,
    items,
  };
}

function extractList(data) {
  const list =
    Array.isArray(data) ? data :
    Array.isArray(data?.items) ? data.items :
    [];
  return list.map(normalizeOrder);
}
// ─── User ──────────────────────────────────────────────────────────────────────

/** List the authenticated user's own orders */
export async function listOrdersForUser() {
  const data = await apiGet('/orders');
  return extractList(data);
}

// ─── Admin ─────────────────────────────────────────────────────────────────────

/** List ALL orders (admin) */
export async function listAllOrdersAdmin() {
  const data = await apiGet('/admin/orders');
  return extractList(data);
}

/** Update an order's status (admin) */
export async function updateOrderStatusAdmin(orderId, status) {
  return apiPut(`/admin/orders/${orderId}`, { status });
}

// Compatibility aliases
export const listAllOrders    = listAllOrdersAdmin;
export const updateOrderStatus = updateOrderStatusAdmin;

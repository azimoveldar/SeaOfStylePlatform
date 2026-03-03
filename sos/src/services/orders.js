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

function extractList(data) {
  if (Array.isArray(data))        return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
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

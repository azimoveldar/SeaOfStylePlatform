import { api } from "./apiClient";

/** USER (Auth required) */
export function listOrdersForUser() {
  return api("/orders", { method: "GET" });
}

export function createOrder(payload) {
  return api("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** ADMIN (Auth required + admin group check) */
export function listAllOrdersAdmin() {
  return api("/admin/orders", { method: "GET" });
}

export function updateOrderStatusAdmin(orderId, status) {
  return api(`/admin/orders/${orderId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

/* ✅ BACKWARD-COMPAT exports (so old pages don’t break) */
// Checkout.jsx expects saveOrderForUser(userId, payload)
export async function saveOrderForUser(userId, payload) {
  // ignore userId (backend should take it from JWT)
  return createOrder(payload);
}

// Admin.jsx expects listAllOrders + updateOrderStatus
export function listAllOrders() {
  return listAllOrdersAdmin();
}

export function updateOrderStatus(orderId, status) {
  return updateOrderStatusAdmin(orderId, status);
}
import { api } from "./apiClient";

/** USER */
export function listOrdersForUser() {
  return api("/orders", { method: "GET" });
}

/**
 * If your API does NOT have POST /orders (your screenshot shows only GET),
 * keep createOrder but DON'T use it until you add POST /orders or webhook creates orders.
 */
export function createOrder(payload) {
  return api("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** ADMIN */
export function listAllOrdersAdmin() {
  // Your API Gateway shows /admin/{proxy+}
  // So /admin/orders is still a valid path (proxy) if your Lambda routes it.
  return api("/admin/orders", { method: "GET" });
}

export function updateOrderStatusAdmin(orderId, status) {
  return api(`/admin/orders/${orderId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

/* ✅ COMPATIBILITY EXPORTS (old names used by old pages) */
export function listAllOrders() {
  return listAllOrdersAdmin();
}

export function updateOrderStatus(orderId, status) {
  return updateOrderStatusAdmin(orderId, status);
}

export async function saveOrderForUser(userId, payload) {
  // ignore userId; backend should read user from JWT
  return createOrder(payload);
}
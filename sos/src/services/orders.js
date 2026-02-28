import { api } from "./apiClient";

/** USER */
export function listOrdersForUser() {
  return api("/orders", { method: "GET" });
}

/** ADMIN (your API has /admin/{proxy+}) */
export function listAllOrdersAdmin() {
  return api("/admin/orders", { method: "GET" });
}

export function updateOrderStatusAdmin(orderId, status) {
  return api(`/admin/orders/${orderId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

/* ✅ compatibility exports (if any old code still imports these) */
export function listAllOrders() {
  return listAllOrdersAdmin();
}
export function updateOrderStatus(orderId, status) {
  return updateOrderStatusAdmin(orderId, status);
}
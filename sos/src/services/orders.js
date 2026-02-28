import { api } from "./apiClient";

// GET /orders (auth required)
export function listOrdersForUser() {
  return api("/orders", { method: "GET" });
}

// POST /orders (auth required) – your backend decides how to store it
export function createOrder(payload) {
  return api("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Admin (if your backend supports it)
export function listAllOrdersAdmin() {
  return api("/admin/orders", { method: "GET" });
}

export function updateOrderStatusAdmin(orderId, status) {
  return api(`/admin/orders/${orderId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}
/**
 * orders.js
 * Dev-friendly localStorage orders.
 *
 * PROD: Replace with fetch calls to API Gateway:
 *  - GET /orders (user)
 *  - POST /orders
 *  - GET /admin/orders
 *  - PATCH /admin/orders/{id}
 */

const ORDERS_KEY = 'sos_orders_v1';

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeAll(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export async function saveOrderForUser(userId, payload) {
  await new Promise(r => setTimeout(r, 400));
  const orders = readAll();
  const id = `ORD-${String(Date.now()).slice(-6)}`;
  const order = {
    id,
    userId,
    createdAt: new Date().toISOString(),
    status: 'Processing',
    ...payload,
  };
  writeAll([order, ...orders]);
  return order;
}

export async function listOrdersForUser(userId) {
  await new Promise(r => setTimeout(r, 250));
  return readAll().filter(o => o.userId === userId);
}

export async function listAllOrders() {
  await new Promise(r => setTimeout(r, 250));
  return readAll();
}

export async function updateOrderStatus(orderId, status) {
  await new Promise(r => setTimeout(r, 250));
  const orders = readAll();
  const next = orders.map(o => o.id === orderId ? { ...o, status } : o);
  writeAll(next);
  return next.find(o => o.id === orderId);
}

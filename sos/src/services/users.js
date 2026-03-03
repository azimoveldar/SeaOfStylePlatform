/**
 * services/users.js
 *
 * Admin user management via API.
 * API shape:
 *   GET  /admin/users        → { items: User[] } | User[]
 *   PUT  /admin/users/{id}   → User  (update role)
 */

import { apiGet, apiPut } from './apiClient';

function extractList(data) {
  if (Array.isArray(data))        return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

/** List all users (admin) */
export async function adminListUsers() {
  const data = await apiGet('/admin/users');
  return extractList(data);
}

/** Update a user's role (admin) */
export async function adminUpdateUserRole(userId, role) {
  return apiPut(`/admin/users/${userId}`, { role });
}

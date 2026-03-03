import { CognitoUserPool } from 'amazon-cognito-identity-js';

/**
 * apiClient.js — Production API client
 *
 * - Reads JWT from Cognito session automatically on every request
 * - Sends Authorization header as plain token (no "Bearer " prefix)
 *   to match API Gateway Cognito Authorizer default config.
 *   If your API Gateway expects "Bearer <token>", change the line below.
 * - Handles JSON and non-JSON responses
 * - Throws descriptive errors for UI consumption
 *
 * Environment variables:
 *   VITE_API_BASE_URL               = "https://xxxxxxxxxx.execute-api.ca-central-1.amazonaws.com/prod"
 *   VITE_AUTH_PROVIDER              = "cognito"
 *   VITE_COGNITO_USER_POOL_ID       = "ca-central-1_xxxxxxxxx"
 *   VITE_COGNITO_USER_POOL_CLIENT_ID = "xxxxxxxxxxxxxxxxxxxxxxxxxx"
 */

const API_BASE      = import.meta.env.VITE_API_BASE_URL;
const USER_POOL_ID  = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const CLIENT_ID     =
  import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID ||
  import.meta.env.VITE_COGNITO_CLIENT_ID;
const AUTH_PROVIDER = import.meta.env.VITE_AUTH_PROVIDER || 'mock';

function getUserPool() {
  if (!USER_POOL_ID || !CLIENT_ID) return null;
  return new CognitoUserPool({ UserPoolId: USER_POOL_ID, ClientId: CLIENT_ID });
}

/**
 * Returns the current Cognito access token, or null for mock/unauthenticated.
 * Uses access token (not ID token) for API Gateway Cognito Authorizer.
 */
function getJwtToken() {
  return new Promise((resolve) => {
    if (AUTH_PROVIDER !== 'cognito') return resolve(null);

    const pool = getUserPool();
    if (!pool) return resolve(null);

    const user = pool.getCurrentUser();
    if (!user) return resolve(null);

    user.getSession((err, session) => {
      if (err || !session?.isValid()) return resolve(null);
      resolve(session.getAccessToken().getJwtToken());
    });
  });
}

/**
 * Core fetch wrapper. All API calls go through this.
 *
 * @param {string} path   - e.g. "/products", "/products/abc123", "/admin/orders"
 * @param {object} options - fetch options (method, body, headers, signal)
 * @returns {Promise<any>} - parsed JSON response body
 */
export async function api(path, options = {}) {
  if (!API_BASE) {
    throw new Error('VITE_API_BASE_URL is not set. Check your .env.production file.');
  }

  const url   = `${API_BASE}${path}`;
  const token = await getJwtToken();

  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
    // API Gateway Cognito Authorizer expects the raw JWT in Authorization header.
    // No "Bearer " prefix by default. If your authorizer uses TOKEN_SOURCE = "Bearer",
    // change to: `Bearer ${token}`
    ...(token ? { Authorization: token } : {}),
  };

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers,
      mode: 'cors',
    });
  } catch (networkErr) {
    throw new Error(
      `Network error reaching ${path}. Check CORS configuration on API Gateway and that the URL is correct.\n(${networkErr.message})`
    );
  }

  // Parse body regardless of status
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (res.status === 401) {
    throw new Error('Your session has expired. Please sign in again.');
  }

  if (res.status === 403) {
    throw new Error('You do not have permission to perform this action.');
  }

  if (!res.ok) {
    const msg =
      (typeof data === 'object' && data !== null)
        ? (data.message || data.error || JSON.stringify(data))
        : (data || `HTTP ${res.status}`);
    throw new Error(msg);
  }

  return data;
}

/**
 * Convenience helpers to keep page code clean
 */
export const apiGet    = (path, opts)  => api(path, { method: 'GET',    ...opts });
export const apiPost   = (path, body)  => api(path, { method: 'POST',   body: JSON.stringify(body) });
export const apiPut    = (path, body)  => api(path, { method: 'PUT',    body: JSON.stringify(body) });
export const apiDelete = (path)        => api(path, { method: 'DELETE' });

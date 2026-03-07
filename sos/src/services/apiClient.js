import { CognitoUserPool } from 'amazon-cognito-identity-js';

/**
 * apiClient.js — Production API client
 *
 * FIXES applied:
 *  1. Now sends the ID token (not the access token).
 *     API Gateway Cognito Authorizer by default validates the ID token.
 *     Sending the access token causes 401 Unauthorized on protected routes.
 *
 *  2. Authorization header sent as plain JWT (no "Bearer " prefix).
 *     This matches the default API Gateway Cognito Authorizer Token Source = "Authorization".
 *
 * CORS "Failed to fetch" root cause:
 *   This is an API Gateway CORS configuration issue — the browser sends an OPTIONS
 *   preflight request and API Gateway rejects it before the request ever reaches Lambda.
 *   Fix this in AWS Console (see instructions below) — it cannot be fixed in frontend code.
 *
 * ─── API GATEWAY CORS FIX (do this once in AWS Console) ──────────────────────
 *
 *  For EACH resource that the frontend calls (/products, /orders, /admin/*, etc.):
 *
 *  1. API Gateway Console → sos-api → Resources
 *  2. Click the resource (e.g. /products)
 *  3. Actions → Enable CORS
 *  4. Set:
 *       Access-Control-Allow-Origin  = 'https://d2kysf4das2qma.cloudfront.net'
 *                                      (or '*' during development)
 *       Access-Control-Allow-Headers = 'Content-Type,Authorization'
 *       Access-Control-Allow-Methods = 'GET,POST,PUT,DELETE,OPTIONS'
 *  5. Click "Enable CORS and replace existing CORS headers" → Yes
 *  6. IMPORTANT: Also make sure your Lambda function returns CORS headers in its response:
 *       headers: {
 *         'Access-Control-Allow-Origin': 'https://d2kysf4das2qma.cloudfront.net',
 *         'Access-Control-Allow-Headers': 'Content-Type,Authorization',
 *         'Content-Type': 'application/json'
 *       }
 *  7. Actions → Deploy API → Stage: prod
 *
 *  Repeat for every resource: /products, /products/{id}, /orders, /cart,
 *  /checkout, /admin/orders, /admin/products, /admin/users, /webhooks/stripe
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Environment variables:
 *   VITE_API_BASE_URL               = "https://8zp3h8qxu7.execute-api.ca-central-1.amazonaws.com/prod"
 *   VITE_AUTH_PROVIDER              = "cognito"
 *   VITE_COGNITO_USER_POOL_ID       = "ca-central-1_qmwjhULkO"
 *   VITE_COGNITO_USER_POOL_CLIENT_ID = "3tki4l6eq4sbem352n7ot0g7l7"
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
 * Returns the current Cognito ID token.
 *
 * We use the ID TOKEN (not access token) because:
 *   - API Gateway Cognito Authorizer validates the ID token by default
 *   - The ID token contains user attributes like email, name, custom:role
 *   - The access token is meant for OAuth resource servers, not API Gateway Cognito Authorizer
 *
 * If your API Gateway authorizer was explicitly configured to use the access token,
 * change getIdToken() → getAccessToken() below.
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

      // ✅ ID token — correct for API Gateway Cognito Authorizer
      const token = session.getIdToken().getJwtToken();
      resolve(token || null);
    });
  });
}

/**
 * Core fetch wrapper. All API calls go through this.
 *
 * @param {string} path    - e.g. "/products", "/products/abc123", "/admin/orders"
 * @param {object} options - fetch options (method, body, headers, signal)
 * @returns {Promise<any>} - parsed JSON response body
 */
export async function api(path, options = {}) {
  if (!API_BASE) {
    throw new Error('VITE_API_BASE_URL is not set. Check your environment variables.');
  }

  // Strip trailing slash from base, ensure path starts with /
  const base = API_BASE.replace(/\/$/, '');
  const url  = `${base}${path}`;

  const token = await getJwtToken();

  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
    // Plain JWT — no "Bearer " prefix (API Gateway Cognito Authorizer default)
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
    // "Failed to fetch" almost always means one of:
    //  a) API Gateway CORS not configured (OPTIONS preflight rejected)
    //  b) Wrong API URL
    //  c) Network is down
    throw new Error(
      `Network error reaching ${path}. ` +
      `This is usually an API Gateway CORS issue — make sure CORS is enabled on every ` +
      `resource in API Gateway and your Lambda returns Access-Control-Allow-Origin headers. ` +
      `(${networkErr.message})`
    );
  }

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
      typeof data === 'object' && data !== null
        ? data.message || data.error || JSON.stringify(data)
        : data || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

// Convenience helpers
export const apiGet    = (path, opts) => api(path, { method: 'GET',    ...opts });
export const apiPost   = (path, body) => api(path, { method: 'POST',   body: JSON.stringify(body) });
export const apiPut    = (path, body) => api(path, { method: 'PUT',    body: JSON.stringify(body) });
export const apiDelete = (path)       => api(path, { method: 'DELETE' });

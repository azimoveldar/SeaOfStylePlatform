import { CognitoUserPool } from "amazon-cognito-identity-js";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const CLIENT_ID =
  import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID ||
  import.meta.env.VITE_COGNITO_CLIENT_ID; // IMPORTANT fallback (matches AuthContext)
const AUTH_PROVIDER = import.meta.env.VITE_AUTH_PROVIDER || "mock";

function getUserPool() {
  if (!USER_POOL_ID || !CLIENT_ID) return null;
  return new CognitoUserPool({ UserPoolId: USER_POOL_ID, ClientId: CLIENT_ID });
}

function getJwtToken() {
  return new Promise((resolve) => {
    // If you are using mock auth, don't try to read Cognito session
    if (AUTH_PROVIDER === "mock") return resolve(null);

    const pool = getUserPool();
    if (!pool) return resolve(null);

    const user = pool.getCurrentUser();
    if (!user) return resolve(null);

    user.getSession((err, session) => {
      if (err || !session?.isValid()) return resolve(null);

      // ✅ Use ACCESS token for API Gateway (more standard)
      const token = session.getAccessToken?.().getJwtToken?.();
      resolve(token || null);
    });
  });
}

export async function api(path, options = {}) {
  if (!API_BASE) throw new Error("VITE_API_BASE_URL is missing");

  const url = `${API_BASE}${path}`;
  const token = await getJwtToken();

  const headers = {
    ...(options.headers || {}),
    // only add JSON content-type if body exists
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: token } : {}), // ✅ no "Bearer " prefix
  };

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers,
      mode: "cors",
    });
  } catch (e) {
    // This is the exact case your UI shows: "Failed to fetch"
    throw new Error(
      `Network/CORS error calling ${url}. This usually means API Gateway CORS or auth is blocking the browser request.`
    );
  }

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`API ${res.status} ${path}: ${JSON.stringify(data)}`);
  }

  return data;
}
import { CognitoUserPool } from "amazon-cognito-identity-js";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// IMPORTANT: put your real pool id + client id in env, or reuse what you already have
const pool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID,
});

function getIdToken() {
  return new Promise((resolve) => {
    const user = pool.getCurrentUser();
    if (!user) return resolve(null);

    user.getSession((err, session) => {
      if (err || !session?.isValid()) return resolve(null);
      resolve(session.getIdToken().getJwtToken());
    });
  });
}

export async function api(path, options = {}) {
  if (!API_BASE) throw new Error("VITE_API_BASE_URL is missing");

  const token = await getIdToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // If backend returns errors, you want to SEE them
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    throw new Error(`API ${res.status} ${path}: ${JSON.stringify(data)}`);
  }

  return data;
}
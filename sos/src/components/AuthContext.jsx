import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';

/**
 * AuthContext — Production Cognito implementation
 *
 * Environment variables required:
 *   VITE_AUTH_PROVIDER              = "cognito"
 *   VITE_COGNITO_REGION             = "ca-central-1"
 *   VITE_COGNITO_USER_POOL_ID       = "ca-central-1_xxxxxxxxx"
 *   VITE_COGNITO_USER_POOL_CLIENT_ID = "xxxxxxxxxxxxxxxxxxxxxxxxxx"
 *
 * Admin detection: checks cognito:groups claim in the ID token for "sos-admins".
 * Falls back gracefully to mock if VITE_AUTH_PROVIDER is not set.
 */

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// ─── Cognito config ──────────────────────────────────────────────────────────
const COGNITO_REGION = import.meta.env.VITE_COGNITO_REGION;
const USER_POOL_ID   = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const CLIENT_ID      =
  import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID ||
  import.meta.env.VITE_COGNITO_CLIENT_ID;

function getUserPool() {
  if (!USER_POOL_ID || !CLIENT_ID) {
    throw new Error(
      'Cognito not configured. Set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_USER_POOL_CLIENT_ID.'
    );
  }
  return new CognitoUserPool({ UserPoolId: USER_POOL_ID, ClientId: CLIENT_ID });
}

/** Convert CognitoUserAttribute[] → plain object */
function mapAttrs(attrs = []) {
  return attrs.reduce((acc, a) => {
    acc[a.getName()] = a.getValue();
    return acc;
  }, {});
}

/**
 * Parse the ID token payload to extract Cognito Groups.
 * We use the ID token (not access token) because it carries custom attributes
 * and group membership in cognito:groups.
 */
function parseIdTokenPayload(session) {
  try {
    const idToken = session.getIdToken().getJwtToken();
    const payload = JSON.parse(atob(idToken.split('.')[1]));
    return payload;
  } catch {
    return {};
  }
}

/** Build the app user object from Cognito session + attributes */
function buildAppUser(cognitoUser, session, attrsObj) {
  const idPayload = parseIdTokenPayload(session);
  const groups    = idPayload['cognito:groups'] || [];
  const isAdmin   = groups.includes('sos-admins');

  return {
    id:        attrsObj.sub || cognitoUser.getUsername(),
    email:     attrsObj.email || cognitoUser.getUsername(),
    name:      attrsObj.name || attrsObj.given_name || cognitoUser.getUsername(),
    role:      isAdmin ? 'admin' : 'user',
    groups,
    createdAt: new Date().toISOString(),
  };
}

// ─── Cognito auth functions ───────────────────────────────────────────────────

async function cognitoGetCurrentUser() {
  const pool    = getUserPool();
  const current = pool.getCurrentUser();
  if (!current) return null;

  const session = await new Promise((resolve, reject) => {
    current.getSession((err, s) => {
      if (err || !s?.isValid()) reject(err || new Error('Session invalid'));
      else resolve(s);
    });
  });

  const attrs = await new Promise((resolve, reject) => {
    current.getUserAttributes((err, a) => (err ? reject(err) : resolve(a || [])));
  });

  return buildAppUser(current, session, mapAttrs(attrs));
}

async function cognitoLogin(email, password) {
  const pool        = getUserPool();
  const cognitoUser = new CognitoUser({ Username: email, Pool: pool });
  const details     = new AuthenticationDetails({ Username: email, Password: password });

  const session = await new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(details, {
      onSuccess:          (s) => resolve(s),
      onFailure:          (err) => reject(err),
      newPasswordRequired: () =>
        reject(new Error('A new password is required. Please use the forgot password flow.')),
    });
  });

  const attrs = await new Promise((resolve, reject) => {
    cognitoUser.getUserAttributes((err, a) => (err ? reject(err) : resolve(a || [])));
  });

  return buildAppUser(cognitoUser, session, mapAttrs(attrs));
}

async function cognitoSignup(email, password, name) {
  const pool = getUserPool();
  await new Promise((resolve, reject) => {
    pool.signUp(
      email,
      password,
      [
        new CognitoUserAttribute({ Name: 'email', Value: email }),
        new CognitoUserAttribute({ Name: 'name',  Value: name }),
      ],
      null,
      (err) => (err ? reject(err) : resolve(true))
    );
  });
  // Returns true; user must confirm email before logging in
  return true;
}

/** Confirm signup with the 6-digit code from email */
export async function cognitoConfirmSignup(email, code) {
  const pool        = getUserPool();
  const cognitoUser = new CognitoUser({ Username: email, Pool: pool });
  return new Promise((resolve, reject) => {
    cognitoUser.confirmRegistration(code, true, (err) =>
      err ? reject(err) : resolve(true)
    );
  });
}

/** Resend the confirmation code */
export async function cognitoResendCode(email) {
  const pool        = getUserPool();
  const cognitoUser = new CognitoUser({ Username: email, Pool: pool });
  return new Promise((resolve, reject) => {
    cognitoUser.resendConfirmationCode((err) =>
      err ? reject(err) : resolve(true)
    );
  });
}

async function cognitoLogout() {
  const pool    = getUserPool();
  const current = pool.getCurrentUser();
  if (current) current.signOut();
}

async function cognitoUpdateProfile(currentUser, updates) {
  const pool        = getUserPool();
  const cognitoUser = new CognitoUser({ Username: currentUser.email, Pool: pool });

  // Restore session (user must be authenticated)
  await new Promise((resolve, reject) => {
    cognitoUser.getSession((err, s) =>
      err || !s?.isValid() ? reject(err || new Error('Not authenticated')) : resolve(s)
    );
  });

  const attributeList = [];
  if (updates.name)  attributeList.push(new CognitoUserAttribute({ Name: 'name',  Value: updates.name }));
  if (updates.email) attributeList.push(new CognitoUserAttribute({ Name: 'email', Value: updates.email }));

  if (attributeList.length === 0) return currentUser;

  await new Promise((resolve, reject) => {
    cognitoUser.updateAttributes(attributeList, (err) =>
      err ? reject(err) : resolve(true)
    );
  });

  // Re-fetch fresh attributes
  return cognitoGetCurrentUser();
}

async function cognitoChangePassword(currentUser, oldPassword, newPassword) {
  const pool        = getUserPool();
  const cognitoUser = new CognitoUser({ Username: currentUser.email, Pool: pool });

  await new Promise((resolve, reject) => {
    cognitoUser.getSession((err, s) =>
      err || !s?.isValid() ? reject(err || new Error('Not authenticated')) : resolve(s)
    );
  });

  return new Promise((resolve, reject) => {
    cognitoUser.changePassword(oldPassword, newPassword, (err) =>
      err ? reject(err) : resolve(true)
    );
  });
}

// ─── Mock auth (dev fallback only) ────────────────────────────────────────────
const CURRENT_USER_KEY = 'sos_current_user_v1';
const USERS_KEY        = 'sos_users_v1';

function readUsers()  { try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; } }
function writeUsers(u){ localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
function readCurrentUser() { try { return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null'); } catch { return null; } }
function writeCurrentUser(u) { localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u)); }

function seedAdminIfNeeded() {
  if (readUsers().length > 0) return;
  writeUsers([
    { id: 'u_admin_1', email: 'admin@seaofstyle.com', name: 'Admin', role: 'admin', password: 'admin123', createdAt: new Date().toISOString() },
    { id: 'u_user_1',  email: 'user@seaofstyle.com',  name: 'User',  role: 'user',  password: 'user123',  createdAt: new Date().toISOString() },
  ]);
}

async function mockLogin(email, password) {
  await new Promise((r) => setTimeout(r, 450));
  const users = readUsers();
  const user  = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user)                  throw new Error('No account found for that email.');
  if (user.password !== password) throw new Error('Incorrect password.');
  const safe = { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt };
  writeCurrentUser(safe);
  return safe;
}

async function mockSignup(email, password, name) {
  await new Promise((r) => setTimeout(r, 450));
  const users  = readUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) throw new Error('That email is already registered.');
  const role   = email.toLowerCase().includes('admin') ? 'admin' : 'user';
  const user   = { id: `u_${Math.random().toString(36).slice(2, 9)}`, email, name, role, password, createdAt: new Date().toISOString() };
  writeUsers([user, ...users]);
  const safe   = { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt };
  writeCurrentUser(safe);
  return safe;
}

async function mockLogout()                          { localStorage.removeItem(CURRENT_USER_KEY); }
async function mockUpdateProfile(currentUser, updates) {
  const users   = readUsers();
  const next    = users.map((u) => (u.id === currentUser.id ? { ...u, ...updates } : u));
  writeUsers(next);
  const refreshed = next.find((u) => u.id === currentUser.id);
  const safe = { id: refreshed.id, email: refreshed.email, name: refreshed.name, role: refreshed.role, createdAt: refreshed.createdAt };
  writeCurrentUser(safe);
  return safe;
}
async function mockChangePassword(currentUser, oldPassword, newPassword) {
  const users = readUsers();
  const me    = users.find((u) => u.id === currentUser.id);
  if (!me)                     throw new Error('User not found.');
  if (me.password !== oldPassword) throw new Error('Current password is incorrect.');
  writeUsers(users.map((u) => (u.id === currentUser.id ? { ...u, password: newPassword } : u)));
  return true;
}

// Admin helpers (mock only — in production admin user management goes through /admin/users API)
export async function mockListUsers() {
  await new Promise((r) => setTimeout(r, 200));
  return readUsers().map(({ password, ...rest }) => rest);
}
export async function mockUpdateUserRole(userId, role) {
  await new Promise((r) => setTimeout(r, 200));
  const users = readUsers();
  const next  = users.map((u) => (u.id === userId ? { ...u, role } : u));
  writeUsers(next);
  return next.find((u) => u.id === userId);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  const provider = import.meta.env.VITE_AUTH_PROVIDER || 'mock';
  const isCognito = provider === 'cognito';

  // On mount: restore session
  useEffect(() => {
    (async () => {
      try {
        if (isCognito) {
          const u = await cognitoGetCurrentUser();
          setUser(u);
        } else {
          seedAdminIfNeeded();
          setUser(readCurrentUser());
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [isCognito]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const u = isCognito
        ? await cognitoLogin(email, password)
        : await mockLogin(email, password);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  /**
   * signup: returns { needsConfirmation: true, email } for Cognito (email verification required)
   *         returns user object directly for mock.
   */
  const signup = async (email, password, name) => {
    setLoading(true);
    try {
      if (isCognito) {
        await cognitoSignup(email, password, name);
        return { needsConfirmation: true, email };
      }
      const u = await mockSignup(email, password, name);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      isCognito ? await cognitoLogout() : await mockLogout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    setLoading(true);
    try {
      const u = isCognito
        ? await cognitoUpdateProfile(user, updates)
        : await mockUpdateProfile(user, updates);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    if (!user) return;
    setLoading(true);
    try {
      return isCognito
        ? await cognitoChangePassword(user, oldPassword, newPassword)
        : await mockChangePassword(user, oldPassword, newPassword);
    } finally {
      setLoading(false);
    }
  };

  /** Get the current Cognito access token (for apiClient) */
  const getAccessToken = async () => {
    if (!isCognito) return null;
    try {
      const pool    = getUserPool();
      const current = pool.getCurrentUser();
      if (!current) return null;
      return new Promise((resolve) => {
        current.getSession((err, session) => {
          if (err || !session?.isValid()) return resolve(null);
          resolve(session.getAccessToken().getJwtToken());
        });
      });
    } catch {
      return null;
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin:         user?.role === 'admin',
      login,
      signup,
      logout,
      updateProfile,
      changePassword,
      getAccessToken,
      authProvider: provider,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading, provider]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

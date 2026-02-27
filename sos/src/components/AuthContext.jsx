import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';

/**
 * AuthContext
 * - mock: localStorage demo auth
 * - cognito: AWS Cognito (amazon-cognito-identity-js)
 */

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// -------------------------
// Mock auth (localStorage)
// -------------------------
const CURRENT_USER_KEY = 'sos_current_user_v1';
const USERS_KEY = 'sos_users_v1';

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}
function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function readCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
  } catch {
    return null;
  }
}
function writeCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}
function seedAdminIfNeeded() {
  const users = readUsers();
  if (users.length > 0) return;

  const seeded = [
    {
      id: 'u_admin_1',
      email: 'admin@seaofstyle.com',
      name: 'Sea of Style Admin',
      role: 'admin',
      password: 'admin123',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'u_user_1',
      email: 'user@seaofstyle.com',
      name: 'Sea of Style User',
      role: 'user',
      password: 'user123',
      createdAt: new Date().toISOString(),
    },
  ];
  writeUsers(seeded);
}

async function mockLogin(email, password) {
  await new Promise((r) => setTimeout(r, 450));
  const users = readUsers();

  let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user && email.toLowerCase().includes('admin')) {
    user = {
      id: `u_${Math.random().toString(36).slice(2, 9)}`,
      email,
      name: email.split('@')[0],
      role: 'admin',
      password,
      createdAt: new Date().toISOString(),
    };
    writeUsers([user, ...users]);
  }

  if (!user) throw new Error('No account found for that email.');
  if (user.password !== password) throw new Error('Incorrect password.');

  const safeUser = { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt };
  writeCurrentUser(safeUser);
  return safeUser;
}

async function mockSignup(email, password, name) {
  await new Promise((r) => setTimeout(r, 450));
  const users = readUsers();
  const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) throw new Error('That email is already registered.');

  const role = email.toLowerCase().includes('admin') ? 'admin' : 'user';
  const user = {
    id: `u_${Math.random().toString(36).slice(2, 9)}`,
    email,
    name,
    role,
    password,
    createdAt: new Date().toISOString(),
  };

  writeUsers([user, ...users]);

  const safeUser = { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt };
  writeCurrentUser(safeUser);
  return safeUser;
}

async function mockLogout() {
  await new Promise((r) => setTimeout(r, 150));
  localStorage.removeItem(CURRENT_USER_KEY);
}

async function mockUpdateProfile(currentUser, updates) {
  await new Promise((r) => setTimeout(r, 250));
  const users = readUsers();
  const nextUsers = users.map((u) => (u.id === currentUser.id ? { ...u, ...updates } : u));
  writeUsers(nextUsers);

  const refreshed = nextUsers.find((u) => u.id === currentUser.id);
  const safeUser = { id: refreshed.id, email: refreshed.email, name: refreshed.name, role: refreshed.role, createdAt: refreshed.createdAt };
  writeCurrentUser(safeUser);
  return safeUser;
}

async function mockChangePassword(currentUser, oldPassword, newPassword) {
  await new Promise((r) => setTimeout(r, 350));
  const users = readUsers();
  const me = users.find((u) => u.id === currentUser.id);
  if (!me) throw new Error('User not found.');
  if (me.password !== oldPassword) throw new Error('Current password is incorrect.');

  writeUsers(users.map((u) => (u.id === currentUser.id ? { ...u, password: newPassword } : u)));
  return true;
}

// Admin helpers (mock)
export async function mockListUsers() {
  await new Promise((r) => setTimeout(r, 200));
  return readUsers().map(({ password, ...rest }) => rest);
}
export async function mockUpdateUserRole(userId, role) {
  await new Promise((r) => setTimeout(r, 200));
  const users = readUsers();
  const next = users.map((u) => (u.id === userId ? { ...u, role } : u));
  writeUsers(next);
  return next.find((u) => u.id === userId);
}

// -------------------------
// Cognito helpers
// -------------------------
const COGNITO_REGION = import.meta.env.VITE_COGNITO_REGION;
const USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const CLIENT_ID =
  import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID ||
  import.meta.env.VITE_COGNITO_CLIENT_ID;

function ensureCognitoConfigured() {
  if (!COGNITO_REGION || !USER_POOL_ID || !CLIENT_ID) {
    throw new Error(
      'Cognito is not configured. Missing VITE_COGNITO_REGION / VITE_COGNITO_USER_POOL_ID / VITE_COGNITO_USER_POOL_CLIENT_ID.'
    );
  }
}

function getUserPool() {
  ensureCognitoConfigured();
  return new CognitoUserPool({
    UserPoolId: USER_POOL_ID,
    ClientId: CLIENT_ID,
  });
}

function mapCognitoAttrs(attrsArray) {
  const obj = {};
  (attrsArray || []).forEach((a) => {
    obj[a.getName()] = a.getValue();
  });
  return obj;
}

function toAppUser(cognitoUser, attrsObj) {
  const username = cognitoUser?.getUsername?.() || cognitoUser?.username;
  return {
    id: attrsObj?.sub || username,
    email: attrsObj?.email || username,
    name: attrsObj?.name || attrsObj?.given_name || username,
    role: 'user',
    createdAt: new Date().toISOString(),
  };
}

async function cognitoLogin(email, password) {
  const pool = getUserPool();
  const cognitoUser = new CognitoUser({ Username: email, Pool: pool });
  const details = new AuthenticationDetails({ Username: email, Password: password });

  await new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(details, {
      onSuccess: () => resolve(true),
      onFailure: (err) => reject(err),
      newPasswordRequired: () =>
        reject(new Error('New password required. Use forgot password / reset flow.')),
    });
  });

  const attrs = await new Promise((resolve, reject) => {
    cognitoUser.getUserAttributes((err, attributes) => {
      if (err) reject(err);
      else resolve(attributes || []);
    });
  });

  const attrsObj = mapCognitoAttrs(attrs);
  return toAppUser(cognitoUser, attrsObj);
}

async function cognitoSignup(email, password, name) {
  const pool = getUserPool();
  await new Promise((resolve, reject) => {
    pool.signUp(
      email,
      password,
      [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name },
      ],
      null,
      (err, _result) => {
        if (err) reject(err);
        else resolve(true);
      }
    );
  });
  // user may need email confirmation before login works
  return true;
}

async function cognitoLogout() {
  const pool = getUserPool();
  const current = pool.getCurrentUser();
  if (current) current.signOut();
}

async function cognitoGetCurrentUser() {
  const pool = getUserPool();
  const current = pool.getCurrentUser();
  if (!current) return null;

  // validate session
  await new Promise((resolve, reject) => {
    current.getSession((err, session) => {
      if (err) reject(err);
      else if (!session?.isValid()) reject(new Error('Invalid session'));
      else resolve(session);
    });
  });

  // fetch attributes
  const attrs = await new Promise((resolve, reject) => {
    current.getUserAttributes((err, attributes) => {
      if (err) reject(err);
      else resolve(attributes || []);
    });
  });

  const attrsObj = mapCognitoAttrs(attrs);
  return toAppUser(current, attrsObj);
}

// -------------------------
// Provider
// -------------------------
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const provider = import.meta.env.VITE_AUTH_PROVIDER || 'mock';

  useEffect(() => {
    const init = async () => {
      try {
        if (provider === 'mock') {
          seedAdminIfNeeded();
          setUser(readCurrentUser());
        } else {
          const u = await cognitoGetCurrentUser();
          setUser(u);
        }
      } catch (e) {
        // If cognito isn't configured, don't crash the app; show error on login attempt
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [provider]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      if (provider === 'mock') {
        const u = await mockLogin(email, password);
        setUser(u);
        return u;
      }
      const u = await cognitoLogin(email, password);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, name) => {
    setLoading(true);
    try {
      if (provider === 'mock') {
        const u = await mockSignup(email, password, name);
        setUser(u);
        return u;
      }
      await cognitoSignup(email, password, name);
      // after signup, user may need to confirm email; don’t set user yet
      return true;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (provider === 'mock') {
        await mockLogout();
        setUser(null);
        return;
      }
      await cognitoLogout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (_updates) => {
    if (!user) return;
    setLoading(true);
    try {
      if (provider === 'mock') {
        const u = await mockUpdateProfile(user, _updates);
        setUser(u);
        return u;
      }
      throw new Error('Profile update is not implemented for Cognito yet.');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (_oldPassword, _newPassword) => {
    if (!user) return;
    setLoading(true);
    try {
      if (provider === 'mock') {
        await mockChangePassword(user, _oldPassword, _newPassword);
        return true;
      }
      throw new Error('Change password is not implemented for Cognito yet.');
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      login,
      signup,
      logout,
      updateProfile,
      changePassword,
      authProvider: provider,
    }),
    [user, loading, provider]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
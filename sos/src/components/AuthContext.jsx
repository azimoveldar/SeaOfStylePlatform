import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

/**
 * AuthContext
 *
 * Default: MOCK auth (localStorage) so the project is usable immediately.
 *
 * Production option: AWS Cognito.
 * - Keep the same function signatures (login/signup/logout/updateProfile/changePassword)
 * - Swap implementations based on VITE_AUTH_PROVIDER.
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
  const hasAny = users.length > 0;
  if (hasAny) return;

  // Dev seed accounts
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

  // Convenience: if you enter an email containing "admin" and it doesn't exist, auto-create it.
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
// Provider
// -------------------------
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const provider = import.meta.env.VITE_AUTH_PROVIDER || 'mock';

  useEffect(() => {
    seedAdminIfNeeded();
    const stored = readCurrentUser();
    setUser(stored);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      if (provider === 'mock') {
        const u = await mockLogin(email, password);
        setUser(u);
        return u;
      }
      // Cognito placeholder
      throw new Error('Cognito auth is not wired yet. Use VITE_AUTH_PROVIDER=mock for now.');
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
      throw new Error('Cognito auth is not wired yet. Use VITE_AUTH_PROVIDER=mock for now.');
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
      throw new Error('Cognito auth is not wired yet.');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    setLoading(true);
    try {
      if (provider === 'mock') {
        const u = await mockUpdateProfile(user, updates);
        setUser(u);
        return u;
      }
      throw new Error('Cognito auth is not wired yet.');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    if (!user) return;
    setLoading(true);
    try {
      if (provider === 'mock') {
        await mockChangePassword(user, oldPassword, newPassword);
        return true;
      }
      throw new Error('Cognito auth is not wired yet.');
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

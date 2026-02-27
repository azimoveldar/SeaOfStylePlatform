import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { createPageUrl } from '@/utils';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const provider = import.meta.env.VITE_AUTH_PROVIDER || 'mock';
  const isMock = provider === 'mock';

  const returnTo = location.state?.returnTo || createPageUrl('Account');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err?.message || 'Login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#C96B3A] mb-2">Welcome back</p>
          <h1 className="text-3xl font-black text-[#111111]" style={{ fontFamily: 'Playfair Display, serif' }}>Sign in</h1>
          <p className="text-gray-600 mt-2 text-sm">{isMock ? 'Use the mock auth now; swap to Cognito later.' : 'Sign in with your Cognito account.'}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#111111] mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#C96B3A] focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#111111] mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#C96B3A] focus:outline-none"
              placeholder="••••••••"
            />
            {isMock && (
              <p className="text-xs text-gray-500 mt-2"> Mock tip: use an email containing <span className="font-semibold">admin</span> to get admin role.</p>
            )}
          </div>
          <button
            disabled={loading}
            className="w-full py-3 bg-black text-white rounded-full font-bold hover:bg-[#C96B3A] transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-600">
          Don’t have an account?{' '}
          <Link className="font-semibold text-[#C96B3A] hover:underline" to="/signup">Create one</Link>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <Link to={createPageUrl('Home')} className="hover:underline">Back to store</Link>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { createPageUrl } from '@/utils';

export default function Signup() {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signup(form.email, form.password, form.name);
      navigate(createPageUrl('Account'), { replace: true });
    } catch (err) {
      setError(err?.message || 'Signup failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#C96B3A] mb-2">Sea of Style</p>
          <h1 className="text-3xl font-black text-[#111111]" style={{ fontFamily: 'Playfair Display, serif' }}>Create account</h1>
          <p className="text-gray-600 mt-2 text-sm">Fast demo signup for local development.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#111111] mb-1">Full name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#C96B3A] focus:outline-none"
              placeholder="Jane Doe"
            />
          </div>
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
              placeholder="Create a password"
            />
          </div>
          <button
            disabled={loading}
            className="w-full py-3 bg-black text-white rounded-full font-bold hover:bg-[#C96B3A] transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <Link className="font-semibold text-[#C96B3A] hover:underline" to="/login">Sign in</Link>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <Link to={createPageUrl('Home')} className="hover:underline">Back to store</Link>
        </div>
      </div>
    </div>
  );
}

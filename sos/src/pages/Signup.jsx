import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, cognitoConfirmSignup, cognitoResendCode } from '@/components/AuthContext';
import { createPageUrl } from '@/utils';

/**
 * Signup page
 *
 * Cognito flow:
 *   1. User fills name / email / password → signup() called
 *   2. Cognito sends 6-digit verification code to email
 *   3. We show a confirmation screen → user enters code
 *   4. cognitoConfirmSignup() confirms the account
 *   5. User is redirected to /login to sign in
 *
 * Mock flow: signs up and immediately redirects to Account.
 */
export default function Signup() {
  const { signup, loading, authProvider } = useAuth();
  const navigate = useNavigate();
  const isCognito = authProvider === 'cognito';

  const [step,  setStep]  = useState('form'); // 'form' | 'confirm'
  const [email, setEmail] = useState('');

  const [form, setForm]   = useState({ name: '', email: '', password: '' });
  const [code, setCode]   = useState('');
  const [error, setError] = useState('');
  const [resent, setResent] = useState(false);

  // ── Step 1: submit signup form ──────────────────────────────────────────────
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await signup(form.email, form.password, form.name);

      if (result?.needsConfirmation) {
        // Cognito: show confirmation code screen
        setEmail(form.email);
        setStep('confirm');
      } else {
        // Mock: signed up and logged in immediately
        navigate(createPageUrl('Account'), { replace: true });
      }
    } catch (err) {
      setError(err?.message || 'Signup failed. Please try again.');
    }
  };

  // ── Step 2: confirm email code ──────────────────────────────────────────────
  const onConfirm = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await cognitoConfirmSignup(email, code.trim());
      navigate('/login', {
        replace: true,
        state: { message: 'Account confirmed! Please sign in.' },
      });
    } catch (err) {
      setError(err?.message || 'Confirmation failed. Check the code and try again.');
    }
  };

  const onResend = async () => {
    setError('');
    try {
      await cognitoResendCode(email);
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err) {
      setError(err?.message || 'Could not resend code.');
    }
  };

  // ── Confirmation screen ─────────────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#C96B3A] mb-2">
              Check your email
            </p>
            <h1
              className="text-3xl font-black text-[#111111]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Confirm your account
            </h1>
            <p className="text-gray-600 mt-2 text-sm">
              We sent a 6-digit code to <span className="font-semibold">{email}</span>.
              Enter it below to activate your account.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}
          {resent && (
            <div className="mb-4 p-3 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm">
              Verification code resent — check your inbox.
            </div>
          )}

          <form onSubmit={onConfirm} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#111111] mb-1">
                Verification code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#C96B3A] focus:outline-none text-center text-2xl tracking-widest"
                placeholder="000000"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full py-3 bg-black text-white rounded-full font-bold hover:bg-[#C96B3A] transition-colors disabled:opacity-60"
            >
              {loading ? 'Confirming…' : 'Confirm account'}
            </button>
          </form>

          <div className="mt-4 text-sm text-gray-600 text-center">
            Didn't receive it?{' '}
            <button
              onClick={onResend}
              className="font-semibold text-[#C96B3A] hover:underline"
            >
              Resend code
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Signup form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#C96B3A] mb-2">
            Sea of Style
          </p>
          <h1
            className="text-3xl font-black text-[#111111]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Create account
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            {isCognito
              ? 'Create your account. We\'ll send a verification code to your email.'
              : 'Fast demo signup for local development.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
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
              minLength={8}
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#C96B3A] focus:outline-none"
              placeholder="Min 8 characters"
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
          <Link className="font-semibold text-[#C96B3A] hover:underline" to="/login">
            Sign in
          </Link>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <Link to={createPageUrl('Home')} className="hover:underline">
            Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { createPageUrl } from '@/utils';
import { CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';

// ── Cognito pool (same values already used by AuthContext) ─────────────────────
const USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const CLIENT_ID    = import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID
                  || import.meta.env.VITE_COGNITO_CLIENT_ID;

function getCognitoUser(email) {
  if (!USER_POOL_ID || !CLIENT_ID) return null;
  const pool = new CognitoUserPool({ UserPoolId: USER_POOL_ID, ClientId: CLIENT_ID });
  return new CognitoUser({ Username: email, Pool: pool });
}

// ── Forgot-password modal ──────────────────────────────────────────────────────
function ForgotPasswordModal({ onClose }) {
  const [step,     setStep]     = useState('email'); // 'email' → 'code' → 'done'
  const [email,    setEmail]    = useState('');
  const [code,     setCode]     = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState('');

  // Step 1 — send reset code to email
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await new Promise((resolve, reject) => {
        const user = getCognitoUser(email);
        if (!user) return reject(new Error('Cognito not configured'));
        user.forgotPassword({ onSuccess: resolve, onFailure: reject });
      });
      setStep('code');
    } catch (err) {
      setError(err?.message || 'Failed to send reset code. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // Step 2 — confirm code + set new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return; }
    setBusy(true);
    try {
      await new Promise((resolve, reject) => {
        const user = getCognitoUser(email);
        if (!user) return reject(new Error('Cognito not configured'));
        user.confirmPassword(code, password, { onSuccess: resolve, onFailure: reject });
      });
      setStep('done');
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('CodeMismatchException') || msg.includes('Invalid verification code')) {
        setError('Incorrect code. Check your email and try again.');
      } else if (msg.includes('ExpiredCodeException')) {
        setError('Code has expired. Please go back and request a new one.');
      } else {
        setError(msg || 'Reset failed. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Done ─────────────────────────────────────────────────────────── */}
        {step === 'done' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-[#111111] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              Password reset!
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-black text-white rounded-full font-bold hover:bg-[#C96B3A] transition-colors"
            >
              Back to Sign in
            </button>
          </div>
        )}

        {/* ── Step 1: Enter email ───────────────────────────────────────────── */}
        {step === 'email' && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-[#111111] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                Forgot password?
              </h2>
              <p className="text-gray-600 text-sm">
                Enter your account email and we'll send you a reset code.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#111111] mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#C96B3A] focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>
              <button
                disabled={busy}
                className="w-full py-3 bg-black text-white rounded-full font-bold hover:bg-[#C96B3A] transition-colors disabled:opacity-60"
              >
                {busy ? 'Sending…' : 'Send reset code'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </form>
          </>
        )}

        {/* ── Step 2: Enter code + new password ────────────────────────────── */}
        {step === 'code' && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-[#111111] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                Check your email
              </h2>
              <p className="text-gray-600 text-sm">
                We sent a 6-digit code to <strong>{email}</strong>. Enter it below with your new password.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#111111] mb-1">Reset code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.trim())}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#C96B3A] focus:outline-none tracking-widest text-center text-lg font-bold"
                  placeholder="123456"
                  maxLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#111111] mb-1">New password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#C96B3A] focus:outline-none"
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#111111] mb-1">Confirm new password</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#C96B3A] focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
              <button
                disabled={busy}
                className="w-full py-3 bg-black text-white rounded-full font-bold hover:bg-[#C96B3A] transition-colors disabled:opacity-60"
              >
                {busy ? 'Resetting…' : 'Reset password'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('email'); setError(''); }}
                className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}

// ── Main Login page ────────────────────────────────────────────────────────────
export default function Login() {
  const { login, loading, authProvider } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const isMock    = authProvider !== 'cognito';
  const returnTo  = location.state?.returnTo || createPageUrl('Account');
  const confirmed = location.state?.message;

  const [form,       setForm]       = useState({ email: '', password: '' });
  const [error,      setError]      = useState('');
  const [showForgot, setShowForgot] = useState(false); // ← NEW

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate(returnTo, { replace: true });
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('User is not confirmed')) {
        setError('Please confirm your email address before signing in. Check your inbox for the verification code.');
      } else if (msg.includes('Incorrect username or password')) {
        setError('Incorrect email or password.');
      } else if (msg.includes('session has expired')) {
        setError('Your session has expired. Please sign in again.');
      } else {
        setError(msg || 'Login failed. Please try again.');
      }
    }
  };

  return (
    <>
      {/* ── Forgot password modal (shown on top) ── */}
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#C96B3A] mb-2">
              Welcome back
            </p>
            <h1
              className="text-3xl font-black text-[#111111]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Sign in
            </h1>
            <p className="text-gray-600 mt-2 text-sm">
              {isMock
                ? 'Mock auth — swap to Cognito via VITE_AUTH_PROVIDER=cognito.'
                : 'Sign in with your Sea of Style account.'}
            </p>
          </div>

          {confirmed && (
            <div className="mb-4 p-3 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm">
              {confirmed}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#111111] mb-1">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#C96B3A] focus:outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              {/* ── Password label row with "Forgot password?" link ── */}
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-semibold text-[#111111]">Password</label>
                {!isMock && (
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs font-semibold text-[#C96B3A] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#C96B3A] focus:outline-none"
                placeholder="••••••••"
              />
              {isMock && (
                <p className="text-xs text-gray-500 mt-1">
                  Mock tip: email containing <strong>admin</strong> = admin role.
                </p>
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
            Don't have an account?{' '}
            <Link className="font-semibold text-[#C96B3A] hover:underline" to="/signup">
              Create one
            </Link>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <Link to={createPageUrl('Home')} className="hover:underline">
              Back to store
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

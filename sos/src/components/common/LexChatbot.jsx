/**
 * LexChatbot.jsx  — Sea of Style chat widget
 *
 * Drop-in component rendered globally in App.jsx outside <Routes>.
 *
 * Environment variable (must be set at BUILD time via Vite):
 *   VITE_LEX_API_URL = https://<api-id>.execute-api.ca-central-1.amazonaws.com/prod/chat
 *
 * When VITE_LEX_API_URL is missing the widget shows a yellow "(mock mode)" badge
 * so you can immediately tell whether the env var reached the build.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Minimize2, Loader2, ShoppingBag, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CognitoUserPool } from 'amazon-cognito-identity-js';

// ── Cognito token helper ──────────────────────────────────────────────────────
const USER_POOL_ID  = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const CLIENT_ID     =
  import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID ||
  import.meta.env.VITE_COGNITO_CLIENT_ID;
const AUTH_PROVIDER = import.meta.env.VITE_AUTH_PROVIDER || 'mock';
const LEX_API_URL   = import.meta.env.VITE_LEX_API_URL;

// ── Debug: log once at startup so you can see in the browser console ──────────
if (typeof window !== 'undefined') {
  console.log(
    '[LexChatbot] VITE_LEX_API_URL =',
    LEX_API_URL || '❌ NOT SET — using mock responses'
  );
}

function getIdToken() {
  return new Promise((resolve) => {
    if (AUTH_PROVIDER !== 'cognito' || !USER_POOL_ID || !CLIENT_ID) return resolve(null);
    const pool = new CognitoUserPool({ UserPoolId: USER_POOL_ID, ClientId: CLIENT_ID });
    const user = pool.getCurrentUser();
    if (!user) return resolve(null);
    user.getSession((err, session) => {
      if (err || !session?.isValid()) return resolve(null);
      resolve(session.getIdToken().getJwtToken() || null);
    });
  });
}

// ── Quick-reply chips ─────────────────────────────────────────────────────────
const GUEST_CHIPS = [
  { label: '📦 Shipping info',    text: 'Do you ship internationally?' },
  { label: '↩️ Return policy',    text: 'What is your return policy?' },
  { label: '💳 Payment methods',  text: 'What payment methods do you accept?' },
  { label: '🔍 Browse products',  text: 'What products do you sell?' },
];

const AUTH_CHIPS = [
  { label: '📦 Track my order',   text: 'Where is my order?' },
  { label: '🛒 View my cart',     text: 'What is in my cart?' },
  { label: '❌ Cancel order',     text: 'Cancel my last order.' },
  { label: '🙋 Talk to a human',  text: 'I want to talk to a human.' },
];

// ── Message bubble ────────────────────────────────────────────────────────────
function Bubble({ msg }) {
  const isBot = msg.role === 'bot';
  const isErr = msg.isError;
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-3`}>
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-[#111111] flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
          <ShoppingBag className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isErr
            ? 'bg-red-50 border border-red-200 text-red-700 rounded-tl-sm'
            : isBot
              ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
              : 'bg-[#111111] text-white rounded-tr-sm'
        }`}
      >
        {msg.text.includes('[LOGIN_LINK]') ? (
          <span>
            {msg.text.split('[LOGIN_LINK]')[0]}
            <Link to="/login" className="underline font-semibold text-[#C96B3A]">
              Log In
            </Link>
            {msg.text.split('[LOGIN_LINK]')[1]}
          </span>
        ) : (
          msg.text
        )}
      </div>
    </div>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────
export default function LexChatbot({ isAuthenticated = false }) {
  const isMockMode = !LEX_API_URL;

  const [open,      setOpen]      = useState(false);
  const [minimised, setMinimised] = useState(false);
  const [messages,  setMessages]  = useState([
    {
      id:   'welcome',
      role: 'bot',
      text: isAuthenticated
        ? 'Hi! 👋 I\'m your Sea of Style assistant. I can help you track orders, check your cart, or answer any questions!'
        : 'Hi! 👋 Welcome to Sea of Style. I can help with shipping, returns, payments, and product questions. Log in to track your orders!',
    },
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (open && !minimised) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, minimised]);

  useEffect(() => {
    if (open && !minimised) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open, minimised]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      // ── MOCK MODE: VITE_LEX_API_URL was not set at build time ────────────
      if (isMockMode) {
        await new Promise((r) => setTimeout(r, 700));
        setMessages((prev) => [
          ...prev,
          {
            id:      Date.now() + 1,
            role:    'bot',
            isError: false,
            text:    getMockReply(trimmed, isAuthenticated),
          },
        ]);
        return;
      }

      // ── LIVE MODE: call API Gateway → Lex ─────────────────────────────
      const token = await getIdToken();

      const res = await fetch(LEX_API_URL, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: token } : {}),
        },
        body: JSON.stringify({ message: trimmed }),
      });

      // Surface non-2xx as a readable error
      if (!res.ok) {
        const errText = await res.text().catch(() => `HTTP ${res.status}`);
        throw new Error(`API error ${res.status}: ${errText}`);
      }

      const data  = await res.json();
      const reply = data?.reply || data?.message || "I didn't get a response. Please try again.";
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'bot', text: reply }]);

    } catch (err) {
      // Show the real error message so you can debug from the chat window itself
      const errMsg = err?.message || String(err);
      console.error('[LexChatbot] sendMessage error:', errMsg);
      setMessages((prev) => [
        ...prev,
        {
          id:      Date.now() + 1,
          role:    'bot',
          isError: true,
          text:    `⚠️ ${errMsg}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, isMockMode, isAuthenticated]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const chips     = isAuthenticated ? [...AUTH_CHIPS, ...GUEST_CHIPS] : GUEST_CHIPS;
  const showChips = messages.length <= 1;

  return (
    <>
      {/* ── Floating button ── */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setMinimised(false); }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#111111] hover:bg-[#C96B3A] text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute w-14 h-14 rounded-full border-2 border-[#C96B3A] animate-ping opacity-30 group-hover:opacity-0" />
        </button>
      )}

      {/* ── Chat window ── */}
      {open && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-[360px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 transition-all duration-300 ${
            minimised ? 'h-[56px]' : 'h-[520px]'
          }`}
          style={{ maxHeight: 'calc(100vh - 80px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-[#111111] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#C96B3A] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-none">Style Assistant</p>
                <p className="text-white/50 text-[10px] mt-0.5">
                  {isMockMode
                    ? '⚠️ mock mode — VITE_LEX_API_URL not set'
                    : isAuthenticated ? '● Online' : '● Guest mode'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimised((m) => !m)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Minimise"
              >
                <Minimize2 className="w-4 h-4 text-white/70" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>

          {!minimised && (
            <>
              {/* Mock-mode warning banner */}
              {isMockMode && (
                <div className="bg-amber-50 border-b border-amber-200 px-3 py-2 flex items-center gap-2 flex-shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <p className="text-[11px] text-amber-700 leading-tight">
                    <strong>Mock mode:</strong> VITE_LEX_API_URL is not set in this build.
                    Responses are local — not from your Lex bot.
                  </p>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#FAF7F2] space-y-1">
                {messages.map((msg) => (
                  <Bubble key={msg.id} msg={msg} />
                ))}

                {/* Quick-reply chips */}
                {showChips && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {chips.map((chip) => (
                      <button
                        key={chip.label}
                        onClick={() => sendMessage(chip.text)}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700 hover:border-[#C96B3A] hover:text-[#C96B3A] transition-colors shadow-sm"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Typing indicator */}
                {loading && (
                  <div className="flex justify-start mb-3">
                    <div className="w-7 h-7 rounded-full bg-[#111111] flex items-center justify-center mr-2 flex-shrink-0">
                      <ShoppingBag className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                      <div className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-gray-100 bg-white flex-shrink-0">
                <div className="flex items-center gap-2 bg-[#F5EFE0] rounded-xl px-3 py-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Ask me anything…"
                    disabled={loading}
                    className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none disabled:opacity-50"
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading}
                    className="w-8 h-8 bg-[#111111] hover:bg-[#C96B3A] disabled:bg-gray-300 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                    aria-label="Send"
                  >
                    {loading
                      ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                      : <Send className="w-3.5 h-3.5 text-white" />
                    }
                  </button>
                </div>
                <p className="text-center text-[10px] text-gray-400 mt-2">
                  Powered by Amazon Lex
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

// ── Mock responses (only used when VITE_LEX_API_URL is not set at build time) ─
function getMockReply(text, isAuth) {
  const t = text.toLowerCase();
  if (!isAuth && (t.includes('order') || t.includes('cart') || t.includes('cancel') || t.includes('track'))) {
    return 'To view your order details, you need to [LOGIN_LINK] to your account first.';
  }
  if (t.includes('ship'))    return 'We ship across Canada and the US. International shipping is available to select countries. Standard delivery takes 5–7 business days.';
  if (t.includes('return'))  return 'You have 30 days from delivery to return any item in its original condition. Visit our Contact page to start a return.';
  if (t.includes('payment') || t.includes('pay')) return 'We securely process all payments via Stripe and accept Visa, Mastercard, Amex, and Apple Pay.';
  if (t.includes('product') || t.includes('sell') || t.includes('looking')) return 'We carry a curated selection of fashion pieces. Head to our Shop page to browse the full catalogue!';
  if ((t.includes('order') || t.includes('track')) && isAuth) return '(mock) Your most recent order is currently Processing.';
  if (t.includes('cart') && isAuth) return '(mock) You have items in your cart.';
  if (t.includes('cancel') && isAuth) return '(mock) Cancellation request noted.';
  if (t.includes('human') || t.includes('agent') || t.includes('broken')) return '(mock) I\'ve notified our support team.';
  return 'I\'m not sure about that one! You can also reach us via our Contact page for more help.';
}
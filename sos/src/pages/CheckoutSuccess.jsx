import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useCart } from '@/components/CartContext';
import { apiPost } from '@/services/apiClient';

/**
 * CheckoutSuccess
 *
 * Stripe redirects here after a successful payment with ?session_id=...
 *
 * Flow:
 *  1. Read cart snapshot from sessionStorage (saved by Checkout.jsx before redirect)
 *  2. POST /orders → Lambda upserts the webhook-created order with real items
 *  3. Clear the cart + sessionStorage snapshot
 */
export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const { clearCart }  = useCart();
  const sessionId      = searchParams.get('session_id');

  const [done,      setDone]      = useState(false);
  const [orderId,   setOrderId]   = useState(null);
  const [saveError, setSaveError] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    async function saveOrder() {
      try {
        // Read cart snapshot saved before Stripe redirect.
        // When Stripe redirects back it is a fresh page load so React cart is empty.
        // Checkout.jsx saves items to sessionStorage right before window.location.href = url.
        let orderItems  = [];
        let orderTotals = { subtotal: 0, shipping: 0, total: 0 };

        try {
          const raw = sessionStorage.getItem('sos_checkout_cart');
          if (raw) {
            const snap  = JSON.parse(raw);
            orderItems  = Array.isArray(snap.items)  ? snap.items  : [];
            orderTotals = snap.totals || orderTotals;
          }
        } catch (e) {
          console.warn('Could not read sessionStorage cart snapshot:', e.message);
        }

        console.log('CheckoutSuccess: items=' + orderItems.length + ' sessionId=' + sessionId);

        const result = await apiPost('/orders', {
          items:           orderItems,
          totals:          orderTotals,
          stripeSessionId: sessionId || null,
        });

        setOrderId(result?.orderId || result?.id || null);

        try { sessionStorage.removeItem('sos_checkout_cart'); } catch {}

      } catch (err) {
        console.warn('Order save error (non-fatal):', err.message);
        setSaveError(err.message);
      } finally {
        setDone(true);
        clearCart();
      }
    }

    saveOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-6 py-20">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-sm p-10 text-center">

        {!done ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            <p className="text-gray-600">Confirming your order…</p>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h1
              className="text-3xl sm:text-4xl font-black text-[#111111] mb-3"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Payment successful
            </h1>

            <p className="text-gray-600 mb-6">
              Thanks for your purchase — your order is being processed.
              You'll receive a confirmation email shortly.
            </p>

            {orderId && (
              <div className="mb-4 p-4 bg-[#F5EFE0] rounded-xl text-sm">
                <span className="text-gray-700">Order ID: </span>
                <span className="font-mono font-bold text-xs break-all">{orderId}</span>
              </div>
            )}

            {sessionId && !orderId && (
              <div className="mb-4 p-4 bg-[#F5EFE0] rounded-xl text-sm">
                <span className="text-gray-700">Session: </span>
                <span className="font-mono font-bold text-xs break-all">{sessionId}</span>
              </div>
            )}

            {saveError && (
              <p className="text-xs text-gray-400 mb-4">
                Note: {saveError}. Your payment was successful — check your orders page.
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to={createPageUrl('Account')}
                className="inline-flex items-center justify-center bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-[#C96B3A] transition-colors"
              >
                View my orders
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                to={createPageUrl('Shop')}
                className="inline-flex items-center justify-center bg-white border border-gray-200 text-black px-8 py-3 rounded-full font-semibold hover:border-[#C96B3A] transition-colors"
              >
                Continue shopping
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

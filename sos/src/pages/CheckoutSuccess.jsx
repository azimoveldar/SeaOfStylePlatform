import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useCart } from '@/components/CartContext';
import { useAuth } from '@/components/AuthContext';
import { apiPost } from '@/services/apiClient';

/**
 * CheckoutSuccess
 *
 * Stripe redirects here after successful payment with:
 *   ?session_id={CHECKOUT_SESSION_ID}
 *
 * Flow:
 *  1. Read cart items (they're still in state when Stripe redirects back)
 *  2. POST /orders to create the order record with items + session_id
 *  3. Clear the cart
 */
export default function CheckoutSuccess() {
  const [searchParams]  = useSearchParams();
  const { items, getTotal, clearCart } = useCart();
  const { user }        = useAuth();
  const sessionId       = searchParams.get('session_id');

  const [orderSaved,  setOrderSaved]  = useState(false);
  const [orderId,     setOrderId]     = useState(null);
  const [saveError,   setSaveError]   = useState('');
  const didRun = useRef(false);   // prevent double-fire in React StrictMode

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    async function saveOrder() {
      try {
        // Build totals from current cart
        const subtotal = getTotal();
        const shipping = subtotal > 100 ? 0 : (subtotal === 0 ? 0 : 10);
        const total    = subtotal + shipping;

        // Build items payload — handle both CartContext shapes
        const orderItems = (items || []).map(i => ({
          productId: i.product?.id || i.productId || '',
          name:      i.product?.name || i.name || '',
          price:     i.product?.price ?? i.price ?? 0,
          image:     i.product?.image || i.image || '',
          size:      i.size || '',
          quantity:  i.quantity || 1,
        }));

        const payload = {
          items:           orderItems,
          totals:          { subtotal, shipping, total },
          stripeSessionId: sessionId || null,
        };

        const result = await apiPost('/orders', payload);
        setOrderId(result?.orderId || result?.id || null);
      } catch (err) {
        // Non-fatal: order might already exist from webhook
        console.warn('Order save failed (may already exist via webhook):', err.message);
        setSaveError(err.message);
      } finally {
        setOrderSaved(true);
        clearCart();
      }
    }

    saveOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-6 py-20">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-sm p-10 text-center">

        {!orderSaved ? (
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
                <span className="text-gray-700">Stripe Session: </span>
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

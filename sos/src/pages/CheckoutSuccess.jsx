import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useCart } from '@/components/CartContext';

/**
 * CheckoutSuccess
 *
 * Stripe redirects here after successful payment with:
 *   ?session_id={CHECKOUT_SESSION_ID}
 *
 * We clear the cart on arrival (payment is complete).
 * The session_id can be used by your backend to verify the payment
 * and look up the order — we display it for reference.
 */
export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const { clearCart }  = useCart();

  const sessionId = searchParams.get('session_id');

  // Clear cart once payment is confirmed
  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-6 py-20">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-sm p-10 text-center">
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
          Thanks for your purchase — your order is being processed. You'll receive a
          confirmation email shortly.
        </p>

        {sessionId && (
          <div className="mb-6 p-4 bg-[#F5EFE0] rounded-xl text-sm">
            <span className="text-gray-700">Stripe Session:</span>{' '}
            <span className="font-mono font-bold text-xs break-all">{sessionId}</span>
          </div>
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
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function CheckoutCancel() {
  // IMPORTANT: Cart state remains intact when user cancels
  // User can return to cart and retry checkout without losing items

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-orange-600" />
        </div>

        <h1 className="text-4xl font-bold text-black mb-4">
          Checkout Cancelled
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          No worries! Your cart has been saved and you can complete your purchase whenever you're ready.
        </p>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-bold text-black">Your Items Are Safe</h2>
          </div>
          <p className="text-gray-700">
            All items remain in your cart. You can review and checkout at any time.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to={createPageUrl('Cart')}
            className="block w-full py-4 bg-black text-white rounded-full font-bold hover:bg-orange-500 transition-all transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <ShoppingBag className="w-5 h-5" />
            Return to Cart
          </Link>

          <Link
            to={createPageUrl('Shop')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? <Link to={createPageUrl('Contact')} className="text-orange-500 hover:text-orange-600 font-medium">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
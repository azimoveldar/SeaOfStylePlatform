import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function CheckoutSuccess() {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-6 py-20">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-sm p-10 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#111111] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
          Payment successful
        </h1>
        <p className="text-gray-600 mb-6">
          Thanks for your purchase — your order is being processed.
        </p>
        {orderId && (
          <div className="mb-6 p-4 bg-[#F5EFE0] rounded-xl text-sm">
            <span className="text-gray-700">Order ID:</span>{' '}
            <span className="font-bold">{orderId}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={createPageUrl('Account')}
            className="inline-flex items-center justify-center bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-[#C96B3A] transition-colors"
          >
            View account
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

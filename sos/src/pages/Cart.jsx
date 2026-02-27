import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useCart } from '../components/CartContext';

export default function Cart() {
  const { items, updateQuantity, removeItem, getTotal } = useCart();

  const handleCheckout = async () => {
    try {
      const mockCheckoutUrl = 'https://checkout.stripe.com/c/pay/mock-session';
      console.log('Redirecting to Stripe Checkout:', mockCheckoutUrl);
      window.location.href = "/checkout";
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to initiate checkout. Please try again.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center py-20">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-black mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link
            to={createPageUrl('Shop')}
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-[#C96B3A] transition-all"
          >
            Start Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#C96B3A] mb-3">Your Selection</p>
        <h1 className="text-5xl font-black text-[#111111] mb-10" style={{fontFamily:'Playfair Display, serif'}}>Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.size}`} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex gap-6">
                  <img src={item.product.image} alt={item.product.name} className="w-32 h-32 object-cover rounded-xl" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-xl text-black mb-1">{item.product.name}</h3>
                        <p className="text-gray-600">Size: {item.size}</p>
                      </div>
                      <button onClick={() => removeItem(item.product.id, item.size)} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-bold">−</button>
                        <span className="text-lg font-bold w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-bold">+</button>
                      </div>
                      <p className="text-2xl font-bold text-black">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24">
              <h2 className="text-2xl font-bold text-black mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">${getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="font-medium">{getTotal() > 100 ? 'FREE' : '$10.00'}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-black">
                    <span className="text-xl font-bold">Total</span>
                    <span className="text-2xl font-bold">${(getTotal() + (getTotal() > 100 ? 0 : 10)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              {getTotal() < 100 && (
                <p className="text-sm text-gray-600 mb-6 p-3 bg-[#F5EFE0] rounded-lg">
                  Add ${(100 - getTotal()).toFixed(2)} more for free shipping!
                </p>
              )}
              <button onClick={handleCheckout} className="w-full bg-black text-white py-4 rounded-full font-bold text-lg hover:bg-[#C96B3A] transition-all mb-4">
                Proceed to Checkout
              </button>
              <Link to={createPageUrl('Shop')} className="block text-center text-gray-600 hover:text-black transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
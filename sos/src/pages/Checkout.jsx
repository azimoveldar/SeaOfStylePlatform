import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/components/CartContext';
import { useAuth } from '@/components/AuthContext';
import { createPageUrl } from '@/utils';
import { api } from '@/services/apiClient';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, getTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totals = useMemo(() => {
    const subtotal = getTotal();
    const shipping = subtotal > 100 ? 0 : (subtotal === 0 ? 0 : 10);
    return { subtotal, shipping, total: subtotal + shipping };
  }, [getTotal]);

  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    postal: '',
    country: 'Canada',
  });

  const placeOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      navigate('/login', { state: { returnTo: '/checkout' } });
      return;
    }

    if (!items || items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setLoading(true);
    try {
      // Build payload for backend
      const payload = {
        items: items.map(i => ({
          productId: i.product.id,
          name: i.product.name,
          price: i.product.price,
          image: i.product.image,
          size: i.size,
          quantity: i.quantity,
        })),
        totals,
        shippingAddress: form,
      };

      /**
       * REAL FLOW:
       * POST /checkout (auth) -> Lambda creates Stripe Checkout Session
       * Returns: { url: "https://checkout.stripe.com/..." }  (recommended)
       */
      const result = await api('/checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const url = result?.url || result?.checkoutUrl;
      if (!url) {
        throw new Error('Checkout API did not return a Stripe URL. Check Lambda response.');
      }

      // Redirect to Stripe-hosted checkout
      window.location.href = url;
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#C96B3A] mb-3">Checkout</p>
        <h1 className="text-5xl font-black text-[#111111] mb-10" style={{ fontFamily: 'Playfair Display, serif' }}>
          Finalize your order
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-black mb-6">Shipping</h2>

              <form onSubmit={placeOrder} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-black mb-2">Full name</label>
                    <input
                      value={form.fullName}
                      onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#C96B3A] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-black mb-2">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#C96B3A] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-black mb-2">Address</label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#C96B3A] focus:outline-none"
                    placeholder="123 Main St"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block font-bold text-black mb-2">City</label>
                    <input
                      value={form.city}
                      onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#C96B3A] focus:outline-none"
                      required
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block font-bold text-black mb-2">Postal</label>
                    <input
                      value={form.postal}
                      onChange={(e) => setForm((p) => ({ ...p, postal: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#C96B3A] focus:outline-none"
                      required
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block font-bold text-black mb-2">Country</label>
                    <input
                      value={form.country}
                      onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#C96B3A] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold text-black mb-3">Payment</h3>
                  <div className="p-4 bg-[#F5EFE0] rounded-lg text-sm text-[#4A4A4A]">
                    You will be redirected to Stripe to complete payment.
                  </div>
                </div>

                <button
                  disabled={loading}
                  className="mt-6 w-full bg-black text-white py-4 rounded-full font-bold text-lg hover:bg-[#C96B3A] transition-all disabled:opacity-60"
                >
                  {loading ? 'Redirecting…' : `Pay with Stripe ($${totals.total.toFixed(2)})`}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24">
              <h2 className="text-2xl font-bold text-black mb-6">Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="font-medium">
                    {totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between text-black">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-2xl font-bold">${totals.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4">
                {items.map((i) => (
                  <div key={`${i.product.id}-${i.size}`} className="flex gap-3">
                    <img src={i.product.image} alt={i.product.name} className="w-14 h-14 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-black leading-tight">{i.product.name}</p>
                      <p className="text-xs text-gray-600">Size {i.size} • Qty {i.quantity}</p>
                    </div>
                    <p className="text-sm font-bold">${(i.product.price * i.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-sm">
                <Link className="text-gray-600 hover:text-black" to={createPageUrl('Cart')}>
                  Edit cart
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Check, AlertCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useCart } from '../components/CartContext';
import { getProduct } from '@/services/products';

/**
 * ProductDetail — fetches a single product from GET /products/{id}
 *
 * Supports two URL patterns:
 *   /ProductDetail?id=abc123   (existing pattern used by ProductCard links)
 *   /ProductDetail/abc123      (cleaner REST-style via useParams)
 */
export default function ProductDetail() {
  const navigate      = useNavigate();
  const { addItem }   = useCart();
  const params        = useParams();
  const [searchParams]= useSearchParams();

  // Support both URL patterns
  const productId = params.id || searchParams.get('id');

  const [product,     setProduct]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity,    setQuantity]    = useState(1);
  const [added,       setAdded]       = useState(false);

  useEffect(() => {
    if (!productId) {
      navigate(createPageUrl('Shop'), { replace: true });
      return;
    }

    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getProduct(productId);
        if (!mounted) return;
        setProduct(data);
        setSelectedSize(data.sizes?.[0] || '');
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || 'Product not found.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [productId, navigate]);

  const handleAddToCart = () => {
    if (!selectedSize || !product) return;
    addItem(product, selectedSize, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading product…</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="text-center max-w-md px-6">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-[#4A4A4A] mb-6">{error || 'Product not found.'}</p>
          <Link
            to={createPageUrl('Shop')}
            className="px-8 py-3 bg-[#111111] text-white rounded-full text-sm font-semibold hover:bg-[#C96B3A] transition-colors"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <Link
          to={createPageUrl('Shop')}
          className="inline-flex items-center gap-2 text-[#111111]/50 hover:text-[#111111] transition-colors mb-10 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Image */}
          <div className="bg-[#EDE8DF] rounded-3xl overflow-hidden">
            <div className="aspect-square">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/800x800?text=No+Image'; }}
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col py-4">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#C96B3A] mb-4">
              {product.category}
            </p>

            <h1
              className="text-4xl md:text-5xl font-black text-[#111111] mb-5 leading-tight"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {product.name}
            </h1>

            <p className="text-3xl font-bold text-[#111111] mb-7">
              ${Number(product.price).toFixed(2)}
            </p>

            <p className="text-[#4A4A4A] text-base mb-10 leading-relaxed font-light">
              {product.description}
            </p>

            {/* Out of stock banner */}
            {product.inStock === false && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                This item is currently out of stock.
              </div>
            )}

            {/* Size Selector */}
            {product.sizes?.length > 0 && (
              <div className="mb-7">
                <label className="block text-xs font-semibold tracking-widest uppercase text-[#111111] mb-3">
                  Select Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedSize === size
                          ? 'bg-[#111111] text-white'
                          : 'bg-white text-[#111111] border border-[#111111]/15 hover:border-[#111111]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-9">
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#111111] mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-11 h-11 rounded-full bg-white border border-[#111111]/15 hover:border-[#111111] transition-colors font-bold text-lg"
                >
                  −
                </button>
                <span className="text-xl font-bold text-[#111111] w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-11 h-11 rounded-full bg-white border border-[#111111]/15 hover:border-[#111111] transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || added || product.inStock === false}
              className={`w-full py-4 rounded-full font-semibold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-3 ${
                added
                  ? 'bg-[#4A7C59] text-white'
                  : product.inStock === false
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#111111] text-white hover:bg-[#C96B3A]'
              }`}
            >
              {added ? (
                <><Check className="w-5 h-5" /> Added to Cart!</>
              ) : (
                <><ShoppingBag className="w-5 h-5" /> Add to Cart</>
              )}
            </button>

            {/* Product Details */}
            <div className="mt-10 pt-8 border-t border-[#111111]/8">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-[#111111] mb-4">
                Product Details
              </h3>
              <ul className="space-y-2 text-[#4A4A4A] text-sm font-light">
                <li>— Premium quality materials</li>
                <li>— Carefully crafted for comfort and style</li>
                <li>— Available in multiple sizes</li>
                <li>— Free shipping on orders over $100</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

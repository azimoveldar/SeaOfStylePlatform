import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Check } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useCart } from '../components/CartContext';
import { mockProducts } from '../components/mockData';

export default function ProductDetail() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const foundProduct = mockProducts.find(p => p.id === productId);
    if (foundProduct) {
      setProduct(foundProduct);
      setSelectedSize(foundProduct.sizes[0]);
    } else {
      navigate(createPageUrl('Shop'));
    }
  }, [navigate]);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem(product, selectedSize, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col py-4">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#C96B3A] mb-4">{product.category}</p>

            <h1 className="text-4xl md:text-5xl font-black text-[#111111] mb-5 leading-tight" style={{fontFamily:'Playfair Display, serif'}}>
              {product.name}
            </h1>

            <p className="text-3xl font-bold text-[#111111] mb-7">
              ${product.price.toFixed(2)}
            </p>

            <p className="text-[#4A4A4A] text-base mb-10 leading-relaxed font-light">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="mb-7">
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#111111] mb-3">
                Select Size
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
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
                <span className="text-xl font-bold text-[#111111] w-8 text-center">
                  {quantity}
                </span>
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
              disabled={!selectedSize || added}
              className={`w-full py-4 rounded-full font-semibold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-3 ${
                added
                  ? 'bg-[#4A7C59] text-white'
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
              <h3 className="text-xs font-semibold tracking-widest uppercase text-[#111111] mb-4">Product Details</h3>
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
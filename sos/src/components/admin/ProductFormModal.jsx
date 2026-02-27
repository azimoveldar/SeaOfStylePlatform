import React, { useState, useEffect } from 'react';
import { X, Upload, ImageIcon } from 'lucide-react';
import { categories } from '../mockData';

const SIZES_BY_CATEGORY = {
  Tops: ['XS', 'S', 'M', 'L', 'XL'],
  Bottoms: ['XS', 'S', 'M', 'L', 'XL'],
  Dresses: ['XS', 'S', 'M', 'L', 'XL'],
  Outerwear: ['XS', 'S', 'M', 'L', 'XL'],
  Swimwear: ['XS', 'S', 'M', 'L', 'XL'],
  Footwear: ['6', '7', '8', '9', '10', '11'],
  Accessories: ['One Size'],
};

const EMPTY_FORM = {
  name: '', description: '', price: '', category: 'Tops', image: '', sizes: [], inStock: true
};

export default function ProductFormModal({ product, onSave, onClose }) {
  const isEdit = !!product;
  const [form, setForm] = useState(isEdit ? { ...product, price: String(product.price) } : EMPTY_FORM);

  // When category changes, reset sizes
  const handleCategoryChange = (cat) => {
    setForm(f => ({ ...f, category: cat, sizes: [] }));
  };

  const toggleSize = (size) => {
    setForm(f => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter(s => s !== size) : [...f.sizes, size]
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // PRODUCTION: POST /admin/products/image-upload-url → S3 pre-signed PUT → CloudFront URL
    const mockUrl = `https://d123example.cloudfront.net/products/${Date.now()}-${file.name}`;
    setForm(f => ({ ...f, image: mockUrl }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const availableSizes = SIZES_BY_CATEGORY[form.category] || ['One Size'];
    onSave({
      ...form,
      price: parseFloat(form.price),
      sizes: form.sizes.length > 0 ? form.sizes : availableSizes,
    });
  };

  const availableSizes = SIZES_BY_CATEGORY[form.category] || ['One Size'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block font-bold text-black mb-2">Product Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                placeholder="e.g. Summer Breeze Shirt"
              />
            </div>
            <div>
              <label className="block font-bold text-black mb-2">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-black mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              required
              rows={3}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none resize-none"
              placeholder="Product description..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block font-bold text-black mb-2">Category</label>
              <select
                value={form.category}
                onChange={e => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
              >
                {categories.slice(1).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setForm(f => ({ ...f, inStock: !f.inStock }))}
                  className={`w-14 h-7 rounded-full transition-colors relative ${form.inStock ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${form.inStock ? 'translate-x-7' : 'translate-x-0.5'}`} />
                </div>
                <span className="font-bold text-black">{form.inStock ? 'In Stock' : 'Out of Stock'}</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-black mb-2">Sizes</label>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                    form.sizes.includes(size)
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Leave blank to include all sizes</p>
          </div>

          <div>
            <label className="block font-bold text-black mb-2">Product Image</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-5 py-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                <Upload className="w-5 h-5" />
                Upload Image
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              {form.image && (
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <ImageIcon className="w-4 h-4" />
                  Image ready
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Production: uploads to S3 via pre-signed URL, served via CloudFront</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-black text-white rounded-full font-bold hover:bg-orange-500 transition-colors"
            >
              {isEdit ? 'Save Changes' : 'Add Product'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-black rounded-full font-bold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
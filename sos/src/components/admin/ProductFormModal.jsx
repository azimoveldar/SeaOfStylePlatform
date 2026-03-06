import React, { useState, useEffect } from 'react';
import { X, Upload, ImageIcon, Loader2 } from 'lucide-react';
import { adminUploadProductImage } from '@/services/products';
import { resolveImageUrl } from '@/utils/resolveImageUrl';

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Swimwear', 'Footwear', 'Accessories'];

const SIZES_BY_CATEGORY = {
  Tops:        ['XS', 'S', 'M', 'L', 'XL'],
  Bottoms:     ['XS', 'S', 'M', 'L', 'XL'],
  Dresses:     ['XS', 'S', 'M', 'L', 'XL'],
  Outerwear:   ['XS', 'S', 'M', 'L', 'XL'],
  Swimwear:    ['XS', 'S', 'M', 'L', 'XL'],
  Footwear:    ['6', '7', '8', '9', '10', '11'],
  Accessories: ['One Size'],
};

const EMPTY_FORM = {
  name: '', description: '', price: '', category: 'Tops', image: '', sizes: [], inStock: true,
};

export default function ProductFormModal({ product, onSave, onClose }) {
  const isEdit = !!product;
  const [form,          setForm]          = useState(isEdit ? { ...product, price: String(product.price) } : EMPTY_FORM);
  const [uploading,     setUploading]     = useState(false);
  const [uploadError,   setUploadError]   = useState('');
  const [saving,        setSaving]        = useState(false);

  const handleCategoryChange = (cat) => {
    setForm((f) => ({ ...f, category: cat, sizes: [] }));
  };

  const toggleSize = (size) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size],
    }));
  };

  /**
   * Image upload flow:
   *  1. GET /admin/products/upload-url (pre-signed S3 URL)
   *  2. PUT file directly to S3
   *  3. Store returned CloudFront URL in form.image
   */
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file (JPG, PNG, WebP).');
      return;
    }
    // Validate file size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be under 5 MB.');
      return;
    }

    setUploadError('');
    setUploading(true);
    try {
      const publicUrl = await adminUploadProductImage(file);
      setForm((f) => ({ ...f, image: publicUrl }));
    } catch (err) {
      setUploadError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) {
      setUploadError('Please upload a product image.');
      return;
    }
    setSaving(true);
    const availableSizes = SIZES_BY_CATEGORY[form.category] || ['One Size'];
    await onSave({
      ...form,
      price: parseFloat(form.price),
      sizes: form.sizes.length > 0 ? form.sizes : availableSizes,
    });
    setSaving(false);
  };

  const availableSizes = SIZES_BY_CATEGORY[form.category] || ['One Size'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
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
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                placeholder="e.g. Summer Breeze Shirt"
              />
            </div>
            <div>
              <label className="block font-bold text-black mb-2">Price ($)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                required
                min="0.01"
                step="0.01"
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none"
                placeholder="99.99"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-black mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              required
              rows={3}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none resize-none"
              placeholder="Describe the product..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="block font-bold text-black mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    form.category === cat
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="block font-bold text-black mb-2">
              Sizes <span className="text-gray-400 font-normal text-sm">(select all that apply)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    form.sizes.includes(size)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              If none selected, all sizes for this category will be available.
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block font-bold text-black mb-2">Product Image</label>

            {form.image ? (
              <div className="relative">
                <img
                  src={resolveImageUrl(form.image)}
                  alt="Product preview"
                  className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=Image'; }}
                />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, image: '' }))}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                uploading ? 'border-orange-300 bg-orange-50' : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
              }`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
                {uploading ? (
                  <>
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-2" />
                    <p className="text-sm text-orange-600 font-medium">Uploading to S3…</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Click to upload image</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 5 MB</p>
                  </>
                )}
              </label>
            )}

            {uploadError && (
              <p className="mt-2 text-sm text-red-600">{uploadError}</p>
            )}
          </div>

          {/* In Stock */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="inStock"
              checked={form.inStock}
              onChange={(e) => setForm((f) => ({ ...f, inStock: e.target.checked }))}
              className="w-5 h-5 accent-orange-500"
            />
            <label htmlFor="inStock" className="font-medium text-black cursor-pointer">
              In Stock
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-200 rounded-full font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || saving}
              className="flex-1 py-3 bg-black text-white rounded-full font-bold hover:bg-orange-500 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

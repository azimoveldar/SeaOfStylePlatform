import React from 'react';
import { Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function ProductsTable({ products, onEdit, onDelete, onToggleStock }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left font-bold text-black">Product</th>
              <th className="px-6 py-4 text-left font-bold text-black hidden md:table-cell">Category</th>
              <th className="px-6 py-4 text-left font-bold text-black">Price</th>
              <th className="px-6 py-4 text-left font-bold text-black hidden sm:table-cell">Stock</th>
              <th className="px-6 py-4 text-right font-bold text-black">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-black">{product.name}</p>
                      <p className="text-sm text-gray-500 line-clamp-1 max-w-xs">{product.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600 hidden md:table-cell">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">{product.category}</span>
                </td>
                <td className="px-6 py-4 font-bold text-black">${product.price.toFixed(2)}</td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <button
                    onClick={() => onToggleStock(product.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      product.inStock
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                  >
                    {product.inStock ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-500"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg font-medium">No products yet</p>
            <p className="text-sm mt-1">Click "Add New Product" to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
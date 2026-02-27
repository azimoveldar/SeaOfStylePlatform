import React from 'react';
import { Package, DollarSign, Tag, TrendingUp } from 'lucide-react';

export default function StatsBar({ products }) {
  const totalProducts = products.length;
  const inStock = products.filter(p => p.inStock).length;
  const avgPrice = products.length ? (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2) : '0.00';
  const categories = [...new Set(products.map(p => p.category))].length;

  const stats = [
    { label: 'Total Products', value: totalProducts, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'In Stock', value: inStock, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Avg. Price', value: `$${avgPrice}`, icon: DollarSign, color: 'bg-orange-50 text-orange-600' },
    { label: 'Categories', value: categories, icon: Tag, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-black">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
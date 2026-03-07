import React from 'react';
import { Package, DollarSign, ShoppingCart, Users } from 'lucide-react';

export default function StatsBar({ stats = {} }) {
  const {
    totalProducts = 0,
    totalOrders = 0,
    totalUsers = 0,
    totalRevenue = 0,
  } = stats;

  const statItems = [
    { label: 'Total Products', value: totalProducts,          icon: Package,      color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Orders',   value: totalOrders,            icon: ShoppingCart, color: 'bg-green-50 text-green-600' },
    { label: 'Total Revenue',  value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'bg-orange-50 text-orange-600' },
    { label: 'Total Users',    value: totalUsers,             icon: Users,        color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statItems.map(({ label, value, icon: Icon, color }) => (
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
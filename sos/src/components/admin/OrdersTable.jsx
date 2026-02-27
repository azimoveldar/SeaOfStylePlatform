import React from 'react';

const STATUSES = ['Processing', 'In Transit', 'Delivered', 'Cancelled'];

export default function OrdersTable({ orders, onUpdateStatus }) {
  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
      <table className="min-w-full text-left">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase text-gray-500">Order</th>
            <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase text-gray-500">User</th>
            <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase text-gray-500">Date</th>
            <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase text-gray-500">Items</th>
            <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase text-gray-500">Total</th>
            <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-semibold text-black">{o.id}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{o.userId}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{new Date(o.createdAt).toLocaleString()}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{o.items?.length || 0}</td>
              <td className="px-6 py-4 font-bold">${o.totals?.total?.toFixed?.(2) ?? '0.00'}</td>
              <td className="px-6 py-4">
                <select
                  value={o.status}
                  onChange={(e) => onUpdateStatus(o.id, e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

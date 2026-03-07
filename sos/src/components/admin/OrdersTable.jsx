import React from 'react';

// Must match exactly what sos-admin-handler accepts
const STATUSES = ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];

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
          {orders.map((o) => {
            // DynamoDB stores orderId; webhook-created orders may not have .id
            const id = o.orderId || o.id;
            return (
              <tr key={id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-xs text-black max-w-[180px] truncate" title={id}>
                  {id?.slice(0, 8)}…
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 max-w-[160px] truncate" title={o.userId}>
                  {o.customerEmail || o.userId || '—'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{o.items?.length || 0}</td>
                <td className="px-6 py-4 font-bold">
                  ${(o.totals?.total ?? (o.amountTotal ? o.amountTotal / 100 : 0)).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={o.status || 'Processing'}
                    onChange={(e) => onUpdateStatus(id, e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

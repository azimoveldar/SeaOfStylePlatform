import React from 'react';

export default function UsersTable({ users, onChangeRole }) {
  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
      <table className="min-w-full text-left">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase text-gray-500">Name</th>
            <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase text-gray-500">Email</th>
            <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase text-gray-500">Role</th>
            <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase text-gray-500">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-semibold text-black">{u.name}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{u.email}</td>
              <td className="px-6 py-4">
                <select
                  value={u.role}
                  onChange={(e) => onChangeRole(u.id, e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

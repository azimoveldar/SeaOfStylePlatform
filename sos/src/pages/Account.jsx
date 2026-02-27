import React, { useEffect, useState } from 'react';
import { User, Package, Lock, LogOut, Mail } from 'lucide-react';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { useAuth } from '../components/AuthContext';
import { listOrdersForUser } from '@/services/orders';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

function AccountContent() {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setOrdersLoading(true);
        const list = await listOrdersForUser(user?.id);
        if (mounted) setOrders(list);
      } finally {
        if (mounted) setOrdersLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    await updateProfile(profileData);
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('Passwords do not match!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    await changePassword(passwordData.oldPassword, passwordData.newPassword);
    setMessage('Password changed successfully!');
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setMessage(''), 3000);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <h1 className="text-5xl font-black text-[#111111] mb-10" style={{ fontFamily: 'Playfair Display, serif' }}>
          My Account
        </h1>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">{message}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile' ? 'bg-[#111111] text-white' : 'hover:bg-[#F5EFE0] text-gray-700'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'orders' ? 'bg-[#111111] text-white' : 'hover:bg-[#F5EFE0] text-gray-700'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  <span className="font-medium">Orders</span>
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'password' ? 'bg-[#111111] text-white' : 'hover:bg-[#F5EFE0] text-gray-700'
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Password</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-black mb-6">Profile Information</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div>
                    <label className="block font-bold text-black mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#C96B3A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-black mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#C96B3A] focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 p-4 bg-[#F5EFE0] rounded-lg">
                    <Mail className="w-5 h-5 text-[#C96B3A]" />
                    <span className="text-sm text-[#4A4A4A]">
                      Role: <span className="font-bold">{user?.role}</span>
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#111111] text-white rounded-full font-bold hover:bg-[#C96B3A] transition-colors"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-black mb-6">Order History</h2>

                {ordersLoading && (
                  <div className="p-6 bg-[#F5EFE0] rounded-xl text-sm text-gray-700">Loading your orders…</div>
                )}

                {!ordersLoading && orders.length === 0 && (
                  <div className="p-6 bg-[#F5EFE0] rounded-xl text-sm text-gray-700">
                    No orders yet.{' '}
                    <Link className="font-semibold text-[#C96B3A] hover:underline" to={createPageUrl('Shop')}>
                      Start shopping
                    </Link>
                    .
                  </div>
                )}

                {!ordersLoading && orders.length > 0 && (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border-2 border-gray-100 rounded-xl p-6 hover:border-[#E8A84C]/40 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-bold text-lg text-black">Order {order.id}</p>
                            <p className="text-gray-600 text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span
                            className={`px-4 py-1 rounded-full text-sm font-medium ${
                              order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-[#F5EFE0] text-[#C96B3A]'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-gray-600">{order.items?.length || 0} items</p>
                          <p className="text-xl font-bold text-black">${order.totals?.total?.toFixed?.(2) ?? '0.00'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'password' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-black mb-6">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label className="block font-bold text-black mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#C96B3A] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-black mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#C96B3A] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-black mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#C96B3A] focus:outline-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#111111] text-white rounded-full font-bold hover:bg-[#C96B3A] transition-colors"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Account() {
  return (
    <ProtectedRoute>
      <AccountContent />
    </ProtectedRoute>
  );
}

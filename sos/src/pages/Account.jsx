import React, { useEffect, useState } from 'react';
import { User, Package, Lock, LogOut, Mail, AlertCircle } from 'lucide-react';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { useAuth } from '../components/AuthContext';
import { listOrdersForUser } from '@/services/orders';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

function AccountContent() {
  const { user, logout, updateProfile, changePassword, authProvider } = useAuth();
  const isCognito = authProvider === 'cognito';

  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '', newPassword: '', confirmPassword: '',
  });
  const [message,      setMessage]      = useState({ text: '', type: 'success' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [orders,        setOrders]        = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError,   setOrdersError]   = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setOrdersLoading(true);
      setOrdersError('');
      try {
        const list = await listOrdersForUser();
        if (mounted) setOrders(Array.isArray(list) ? list : []);
      } catch (err) {
        if (mounted) setOrdersError(err?.message || 'Failed to load orders.');
      } finally {
        if (mounted) setOrdersLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: 'success' }), 4000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await updateProfile(profileData);
      showMessage('Profile updated successfully!');
    } catch (err) {
      showMessage(err?.message || 'Profile update failed.', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('New passwords do not match.', 'error');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      showMessage('New password must be at least 8 characters.', 'error');
      return;
    }
    setPasswordSaving(true);
    try {
      await changePassword(passwordData.oldPassword, passwordData.newPassword);
      showMessage('Password changed successfully!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showMessage(err?.message || 'Password change failed.', 'error');
    } finally {
      setPasswordSaving(false);
    }
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

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border text-sm ${
            message.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-green-50 border-green-200 text-green-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="space-y-2">
                {[
                  { key: 'profile',  icon: User,    label: 'Profile' },
                  { key: 'orders',   icon: Package,  label: 'Orders' },
                  { key: 'password', icon: Lock,     label: 'Password' },
                ].map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === key ? 'bg-[#111111] text-white' : 'hover:bg-[#F5EFE0] text-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
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

            {/* Profile Tab */}
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
                      // Cognito email change requires re-verification; still allow editing
                    />
                    {isCognito && (
                      <p className="text-xs text-gray-500 mt-1">
                        Changing your email in Cognito will require re-verification.
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 p-4 bg-[#F5EFE0] rounded-lg">
                    <Mail className="w-5 h-5 text-[#C96B3A]" />
                    <span className="text-sm text-[#4A4A4A]">
                      Role: <span className="font-bold">{user?.role}</span>
                      {user?.groups?.includes('sos-admins') && (
                        <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                          sos-admins group
                        </span>
                      )}
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="w-full py-3 bg-[#111111] text-white rounded-full font-bold hover:bg-[#C96B3A] transition-colors disabled:opacity-60"
                  >
                    {profileSaving ? 'Saving…' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-black mb-6">Order History</h2>

                {ordersLoading && (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse h-24 bg-gray-100 rounded-xl" />
                    ))}
                  </div>
                )}

                {!ordersLoading && ordersError && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {ordersError}
                  </div>
                )}

                {!ordersLoading && !ordersError && orders.length === 0 && (
                  <div className="p-6 bg-[#F5EFE0] rounded-xl text-sm text-gray-700">
                    No orders yet.{' '}
                    <Link className="font-semibold text-[#C96B3A] hover:underline" to={createPageUrl('Shop')}>
                      Start shopping
                    </Link>
                    .
                  </div>
                )}

                {!ordersLoading && !ordersError && orders.length > 0 && (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id || order.orderId}
                        className="border-2 border-gray-100 rounded-xl p-6 hover:border-[#E8A84C]/40 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-bold text-lg text-black">
                              Order {order.id || order.orderId}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString()
                                : '—'}
                            </p>
                          </div>
                          <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                            order.status === 'Delivered'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-[#F5EFE0] text-[#C96B3A]'
                          }`}>
                            {order.status || 'Processing'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-gray-600">{order.items?.length || 0} items</p>
                          <p className="text-xl font-bold text-black">
                            ${(order.totals?.total ?? 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-black mb-6">Change Password</h2>
                {isCognito ? (
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
                        minLength={8}
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
                      disabled={passwordSaving}
                      className="w-full py-3 bg-[#111111] text-white rounded-full font-bold hover:bg-[#C96B3A] transition-colors disabled:opacity-60"
                    >
                      {passwordSaving ? 'Updating…' : 'Update Password'}
                    </button>
                  </form>
                ) : (
                  <div className="p-4 bg-[#F5EFE0] rounded-xl text-sm text-gray-700">
                    Password management is only available when using Cognito authentication.
                  </div>
                )}
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

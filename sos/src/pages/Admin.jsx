import React, { useEffect, useMemo, useState, Component } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowLeft, Package, Users, ClipboardList, AlertCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import ProtectedRoute from '../components/common/ProtectedRoute';
import StatsBar from '../components/admin/StatsBar';
import ProductFormModal from '../components/admin/ProductFormModal';
import ProductsTable from '../components/admin/ProductsTable';
import OrdersTable from '../components/admin/OrdersTable';
import UsersTable from '../components/admin/UsersTable';

import {
  listProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminToggleStock,
} from '@/services/products';
import { listAllOrdersAdmin, updateOrderStatusAdmin } from '@/services/orders';
import { adminListUsers, adminUpdateUserRole } from '@/services/users';

// ── Error Boundary ────────────────────────────────────────────────────────────
class AdminErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2 text-black">Admin Panel Error</h2>
            <p className="text-gray-600 text-sm mb-4">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <button
              onClick={() => this.setState({ error: null })}
              className="px-6 py-2 bg-black text-white rounded-full font-semibold text-sm hover:bg-orange-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm transition-colors ${
        active
          ? 'bg-black text-white'
          : 'bg-white text-black hover:bg-orange-50 border border-gray-200'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="font-semibold underline">
          Retry
        </button>
      )}
    </div>
  );
}

function AdminContent() {
  const [tab, setTab] = useState('products');

  // ── Products ──────────────────────────────────────────────────────────────
  const [products,        setProducts]        = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError,   setProductsError]   = useState('');
  const [modalOpen,       setModalOpen]       = useState(false);
  const [editingProduct,  setEditingProduct]  = useState(null);

  const fetchProducts = async () => {
    setProductsLoading(true);
    setProductsError('');
    try {
      const data = await listProducts();
      setProducts(data);
    } catch (e) {
      setProductsError(e?.message || 'Failed to load products.');
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAddModal  = () => { setEditingProduct(null);    setModalOpen(true); };
  const openEditModal = (p) => { setEditingProduct(p);      setModalOpen(true); };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        const updated = await adminUpdateProduct(editingProduct.id, productData);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, ...updated } : p))
        );
      } else {
        const created = await adminCreateProduct(productData);
        setProducts((prev) => [created, ...prev]);
      }
      setModalOpen(false);
      setEditingProduct(null);
    } catch (e) {
      alert(`Save failed: ${e?.message || 'Unknown error'}`);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try {
      await adminDeleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (e) {
      alert(`Delete failed: ${e?.message || 'Unknown error'}`);
    }
  };

  const handleToggleStock = async (productId, inStock) => {
    try {
      const updated = await adminToggleStock(productId, inStock);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, ...(updated || { inStock }) } : p))
      );
    } catch (e) {
      alert(`Stock update failed: ${e?.message || 'Unknown error'}`);
    }
  };

  // ── Orders ────────────────────────────────────────────────────────────────
  const [orders,        setOrders]        = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError,   setOrdersError]   = useState('');

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const data = await listAllOrdersAdmin();
      setOrders(data);
    } catch (e) {
      setOrdersError(e?.message || 'Failed to load orders.');
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleUpdateOrder = async (orderId, status) => {
    try {
      const updated = await updateOrderStatusAdmin(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...(updated || { status }) } : o))
      );
    } catch (e) {
      alert(`Order update failed: ${e?.message || 'Unknown error'}`);
    }
  };

  // ── Users ─────────────────────────────────────────────────────────────────
  const [users,        setUsers]        = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError,   setUsersError]   = useState('');

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const data = await adminListUsers();
      setUsers(data);
    } catch (e) {
      setUsersError(e?.message || 'Failed to load users.');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleChangeRole = async (userId, role) => {
    try {
      const updated = await adminUpdateUserRole(userId, role);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...(updated || { role }) } : u))
      );
    } catch (e) {
      alert(`Role update failed: ${e?.message || 'Unknown error'}`);
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totals?.total || 0), 0);
    return {
      totalProducts: products.length,
      totalOrders:   orders.length,
      totalUsers:    users.length,
      totalRevenue,
    };
  }, [orders, products, users]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <Link
          to={createPageUrl('Home')}
          className="inline-flex items-center gap-2 text-[#111111]/50 hover:text-[#111111] transition-colors mb-8 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to store
        </Link>

        <h1
          className="text-5xl font-black text-black mb-2"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Admin Dashboard
        </h1>
        <p className="text-gray-500 mb-8 text-sm">Manage your store</p>

        <StatsBar stats={stats} />

        {/* Tabs */}
        <div className="mt-10 flex flex-wrap gap-3">
          <TabButton active={tab === 'products'} onClick={() => setTab('products')} icon={Package}     label="Products" />
          <TabButton active={tab === 'orders'}   onClick={() => setTab('orders')}   icon={ClipboardList} label="Orders" />
          <TabButton active={tab === 'users'}    onClick={() => setTab('users')}    icon={Users}        label="Users" />
        </div>

        {/* Products Tab */}
        {tab === 'products' && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black">All Products ({products.length})</h2>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-5 py-3 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            </div>
            {productsLoading && (
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse h-32" />
            )}
            {!productsLoading && productsError && (
              <ErrorBanner message={productsError} onRetry={fetchProducts} />
            )}
            {!productsLoading && !productsError && (
              <ProductsTable
                products={products}
                onEdit={openEditModal}
                onDelete={handleDeleteProduct}
                onToggleStock={handleToggleStock}
              />
            )}
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-black mb-6">Orders ({orders.length})</h2>
            {ordersLoading && (
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse h-32" />
            )}
            {!ordersLoading && ordersError && (
              <ErrorBanner message={ordersError} onRetry={fetchOrders} />
            )}
            {!ordersLoading && !ordersError && orders.length === 0 && (
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-500">No orders yet.</div>
            )}
            {!ordersLoading && !ordersError && orders.length > 0 && (
              <OrdersTable orders={orders} onUpdateStatus={handleUpdateOrder} />
            )}
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-black mb-6">Users ({users.length})</h2>
            {usersLoading && (
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse h-32" />
            )}
            {!usersLoading && usersError && (
              <ErrorBanner message={usersError} onRetry={fetchUsers} />
            )}
            {!usersLoading && !usersError && users.length === 0 && (
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-500">No users found.</div>
            )}
            {!usersLoading && !usersError && users.length > 0 && (
              <UsersTable users={users} onChangeRole={handleChangeRole} />
            )}
          </div>
        )}
      </div>

      {modalOpen && (
        <ProductFormModal
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => { setModalOpen(false); setEditingProduct(null); }}
        />
      )}
    </div>
  );
}

export default function Admin() {
  return (
    <AdminErrorBoundary>
      <ProtectedRoute requireAdmin>
        <AdminContent />
      </ProtectedRoute>
    </AdminErrorBoundary>
  );
}

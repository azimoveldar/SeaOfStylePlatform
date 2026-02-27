import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowLeft, Package, Users, ClipboardList } from 'lucide-react';
import { createPageUrl } from '@/utils';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { mockProducts } from '../components/mockData';
import StatsBar from '../components/admin/StatsBar';
import ProductFormModal from '../components/admin/ProductFormModal';
import ProductsTable from '../components/admin/ProductsTable';
import OrdersTable from '../components/admin/OrdersTable';
import UsersTable from '../components/admin/UsersTable';
import { listAllOrders, updateOrderStatus } from '@/services/orders';
import { mockListUsers, mockUpdateUserRole } from '@/components/AuthContext';

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm transition-colors ${
        active ? 'bg-black text-white' : 'bg-white text-black hover:bg-orange-50 border border-gray-200'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function AdminContent() {
  const [tab, setTab] = useState('products');

  // Products
  const [products, setProducts] = useState(mockProducts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Users
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totals?.total || 0), 0);
    return { totalOrders: orders.length, totalRevenue };
  }, [orders]);

  useEffect(() => {
    (async () => {
      setOrdersLoading(true);
      try {
        const all = await listAllOrders();
        setOrders(all);
      } finally {
        setOrdersLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setUsersLoading(true);
      try {
        const list = await mockListUsers();
        setUsers(list);
      } finally {
        setUsersLoading(false);
      }
    })();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleSaveProduct = (productData) => {
    if (editingProduct) {
      // PROD: PUT /admin/products/{id} → Lambda → DynamoDB (requires admin role)
      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? { ...productData, id: editingProduct.id } : p)));
    } else {
      // PROD: POST /admin/products → Lambda → DynamoDB
      const newProduct = { ...productData, id: String(Date.now()) };
      setProducts((prev) => [...prev, newProduct]);
    }
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id) => {
    // PROD: DELETE /admin/products/{id}
    if (confirm('Delete this product?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleToggleStock = (id) => {
    // PROD: PATCH /admin/products/{id}
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p)));
  };

  const handleUpdateOrder = async (orderId, status) => {
    // PROD: PATCH /admin/orders/{id} { status }
    const updated = await updateOrderStatus(orderId, status);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
  };

  const handleChangeRole = async (userId, role) => {
    // PROD: PATCH /admin/users/{id} { role }
    await mockUpdateUserRole(userId, role);
    const list = await mockListUsers();
    setUsers(list);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <div className="bg-black text-white py-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Admin Panel</h1>
            <p className="text-gray-400 text-sm">Sea of Style — Manage products, orders, and users</p>
          </div>
          <Link
            to={createPageUrl('Home')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <StatsBar products={products} />

        {/* Extra quick stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-xs font-bold tracking-wider uppercase text-gray-500">Total Orders</p>
            <p className="text-3xl font-black text-black mt-1">{stats.totalOrders}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-xs font-bold tracking-wider uppercase text-gray-500">Revenue (mock)</p>
            <p className="text-3xl font-black text-black mt-1">${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10 flex flex-wrap gap-3">
          <TabButton active={tab === 'products'} onClick={() => setTab('products')} icon={Package} label="Products" />
          <TabButton active={tab === 'orders'} onClick={() => setTab('orders')} icon={ClipboardList} label="Orders" />
          <TabButton active={tab === 'users'} onClick={() => setTab('users')} icon={Users} label="Users" />
        </div>

        {/* Products */}
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

            <ProductsTable products={products} onEdit={openEditModal} onDelete={handleDeleteProduct} onToggleStock={handleToggleStock} />
          </div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-black mb-6">Orders</h2>
            {ordersLoading ? (
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">Loading orders…</div>
            ) : orders.length === 0 ? (
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">No orders yet.</div>
            ) : (
              <OrdersTable orders={orders} onUpdateStatus={handleUpdateOrder} />
            )}
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-black mb-6">Users</h2>
            {usersLoading ? (
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">Loading users…</div>
            ) : users.length === 0 ? (
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">No users found.</div>
            ) : (
              <UsersTable users={users} onChangeRole={handleChangeRole} />
            )}
          </div>
        )}

        {/* AWS Integration Notes */}
        <div className="mt-10 p-6 bg-blue-50 border border-blue-100 rounded-2xl">
          <h3 className="font-bold text-black mb-3">AWS Integration Notes</h3>
          <ul className="text-sm text-gray-700 space-y-1.5">
            <li>
              • <strong>Auth:</strong> Protect admin endpoints using Cognito JWT + API Gateway authorizer (check{' '}
              <code className="bg-white px-1 rounded">custom:role = admin</code>)
            </li>
            <li>• <strong>Products:</strong> CRUD via API Gateway → Lambda → DynamoDB</li>
            <li>• <strong>Orders:</strong> POST /orders for checkout; PATCH /admin/orders for status updates</li>
            <li>• <strong>Users:</strong> List/manage users via admin Lambda (or Cognito admin APIs)</li>
            <li>• <strong>Images:</strong> Pre-signed S3 PUT upload, CloudFront CDN delivery</li>
            <li>• <strong>Stripe:</strong> Checkout sessions created by Lambda; webhooks handled via API Gateway</li>
          </ul>
        </div>
      </div>

      {modalOpen && (
        <ProductFormModal
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => {
            setModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}

export default function Admin() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminContent />
    </ProtectedRoute>
  );
}

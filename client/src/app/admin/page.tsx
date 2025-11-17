'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import axiosInstance from '@/lib/axiosInstance';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalProductCategories: number;
  categories: string[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    // Check if user has access token
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    setIsAuthenticated(true);
    fetchDashboardStats();
  }, [router]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get('/v1/admin/dashboard/stats');
      setStats(response.data.data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch dashboard stats';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Welcome back! Here's your store overview</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-lg text-gray-600">Loading dashboard...</div>
            </div>
          ) : stats ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Users */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">
                        Total Users
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {stats.totalUsers}
                      </p>
                    </div>
                    <div className="bg-blue-100 rounded-full p-3">
                      <span className="text-2xl">👥</span>
                    </div>
                  </div>
                </div>

                {/* Total Products */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">
                        Total Products
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {stats.totalProducts}
                      </p>
                    </div>
                    <div className="bg-green-100 rounded-full p-3">
                      <span className="text-2xl">📦</span>
                    </div>
                  </div>
                </div>

                {/* Total Orders */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">
                        Total Orders
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {stats.totalOrders}
                      </p>
                    </div>
                    <div className="bg-yellow-100 rounded-full p-3">
                      <span className="text-2xl">🛒</span>
                    </div>
                  </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">
                        Total Revenue
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        ${stats.totalRevenue.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-purple-100 rounded-full p-3">
                      <span className="text-2xl">💰</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Categories */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Product Categories
                  </h2>
                  <p className="text-3xl font-bold text-blue-600 mb-4">
                    {stats.totalProductCategories}
                  </p>
                  <div className="space-y-2">
                    {stats.categories.length > 0 ? (
                      stats.categories.map((category) => (
                        <span
                          key={category}
                          className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-2 mb-2"
                        >
                          {category}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No categories yet</p>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Quick Actions
                  </h2>
                  <div className="space-y-3">
                    <a
                      href="/admin/products"
                      className="block w-full bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition-colors font-medium"
                    >
                      Manage Products
                    </a>
                    <a
                      href="/admin/users"
                      className="block w-full bg-green-600 text-white text-center py-2 rounded hover:bg-green-700 transition-colors font-medium"
                    >
                      View Users
                    </a>
                    <a
                      href="/admin/inventory"
                      className="block w-full bg-purple-600 text-white text-center py-2 rounded hover:bg-purple-700 transition-colors font-medium"
                    >
                      Inventory
                    </a>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-16">
              <div className="text-lg text-gray-600">
                No data available
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

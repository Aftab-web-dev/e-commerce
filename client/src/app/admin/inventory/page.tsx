'use client';

import { useEffect, useState } from 'react';
import AdminNavbar from '@/components/AdminNavbar';
import axiosInstance from '@/lib/axiosInstance';

interface CategorySummary {
  _id: string;
  count: number;
  avgPrice: number;
  totalValue?: number;
  minPrice?: number;
  maxPrice?: number;
}

interface InventorySummary {
  totalProducts: number;
  totalInventoryValue: number;
  categorySummary: CategorySummary[];
}

export default function AdminInventory() {
  const [inventory, setInventory] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'summary' | 'category'>('summary');

  useEffect(() => {
    fetchInventory();
  }, [view]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError('');

      let response;
      if (view === 'summary') {
        response = await axiosInstance.get('/v1/admin/inventory/summary');
      } else {
        response = await axiosInstance.get('/v1/admin/inventory/category');
      }

      setInventory(response.data.data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch inventory';
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
              Inventory Management
            </h1>
            <p className="text-gray-600 mt-2">
              Track and manage your product inventory
            </p>
          </div>

          {/* View Toggle */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => setView('summary')}
              className={`px-6 py-2 rounded font-medium transition-colors ${
                view === 'summary'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setView('category')}
              className={`px-6 py-2 rounded font-medium transition-colors ${
                view === 'category'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              By Category
            </button>
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
              <div className="text-lg text-gray-600">Loading inventory...</div>
            </div>
          ) : inventory ? (
            <>
              {view === 'summary' ? (
                <>
                  {/* Summary Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                      <p className="text-gray-600 text-sm font-medium mb-2">
                        Total Products
                      </p>
                      <p className="text-4xl font-bold text-blue-600">
                        {inventory.totalProducts}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <p className="text-gray-600 text-sm font-medium mb-2">
                        Total Inventory Value
                      </p>
                      <p className="text-4xl font-bold text-green-600">
                        ${inventory.totalInventoryValue.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Category Summary Table */}
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 bg-gray-200 border-b border-gray-300">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Category Breakdown
                      </h2>
                    </div>
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Products
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Avg Price
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {inventory.categorySummary.length > 0 ? (
                          inventory.categorySummary.map((cat) => (
                            <tr key={cat._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                {cat._id}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {cat.count}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                ${cat.avgPrice.toFixed(2)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={3}
                              className="px-6 py-4 text-center text-gray-600"
                            >
                              No categories available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  {/* Category View Table */}
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Products
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Total Value
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Avg Price
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Min Price
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Max Price
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {inventory.categorySummary.length > 0 ? (
                          inventory.categorySummary.map((cat) => (
                            <tr key={cat._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                {cat._id}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {cat.count}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                ${(cat.totalValue || 0).toFixed(2)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                ${cat.avgPrice.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                ${(cat.minPrice || 0).toFixed(2)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                ${(cat.maxPrice || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-6 py-4 text-center text-gray-600"
                            >
                              No categories available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center py-16">
              <div className="text-lg text-gray-600">
                No inventory data available
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

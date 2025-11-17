'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useCart } from '@/hooks/useCart';

export default function CartPage() {
  const {
    cart,
    loading,
    error,
    fetchCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);

    if (token) {
      fetchCart();
    }
  }, [fetchCart]);

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Please log in to view your cart
              </h2>
              <Link
                href="/auth/login"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">
              Shopping Cart
            </h1>
            <p className="text-gray-600 mt-2">
              {cart ? `${cart.totalItems} item(s) in your cart` : 'Your cart is empty'}
            </p>
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
              <div className="text-lg text-gray-600">Loading cart...</div>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-lg text-gray-600 mb-6">Your cart is empty</p>
              <Link
                href="/"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {cart.items.map((item) => {
                        // Extract the product ID - it could be a string or an object (if populated)
                        const productId = typeof item.productId === 'string' ? item.productId : (item.productId as any)?._id;

                        return (
                          <tr key={productId} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-gray-900">
                                {item.productName}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              ${item.price.toFixed(2)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      productId,
                                      item.quantity - 1
                                    )
                                  }
                                  disabled={item.quantity <= 1}
                                  className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 disabled:opacity-50"
                                >
                                  −
                                </button>
                                <span className="w-8 text-center font-medium">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      productId,
                                      item.quantity + 1
                                    )
                                  }
                                  className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              ${item.totalPrice.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                onClick={() => removeFromCart(productId)}
                                className="text-red-600 hover:text-red-700 font-medium"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Clear Cart Button */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to clear your cart?')) {
                          clearCart();
                        }
                      }}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-6 sticky top-20">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span>${cart.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping:</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax:</span>
                      <span>${(cart.totalAmount * 0.1).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-semibold text-gray-900">
                      Total:
                    </span>
                    <span className="text-3xl font-bold text-blue-600">
                      ${(cart.totalAmount * 1.1).toFixed(2)}
                    </span>
                  </div>

                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold mb-3 transition-colors">
                    Proceed to Checkout
                  </button>

                  <Link
                    href="/"
                    className="block text-center text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Continue Shopping
                  </Link>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      ✓ Free shipping on orders over $50
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      ✓ 30-day money back guarantee
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

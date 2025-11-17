'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useCart } from '@/hooks/useCart';
import { usePayment } from '@/hooks/usePayment';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, fetchCart } = useCart();
  const { createPaymentIntent, loading: paymentLoading } = usePayment();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);

    if (token) {
      fetchCart();
      // Try to get userId from token (you might need to decode JWT)
      // For now, we'll pass empty and get it from user context
    }
  }, [fetchCart]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      if (!email || !fullName || !address) {
        throw new Error('Please fill in all fields');
      }

      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      // Calculate total with tax
      const subtotal = cart.totalAmount;
      const tax = subtotal * 0.1;
      const total = subtotal + tax;

      // Create payment intent
      const paymentIntent = await createPaymentIntent(
        total,
        'usd',
        'order_' + Date.now(), // Simple order ID
        userId || 'user_unknown',
        email
      );

      if (!paymentIntent) {
        throw new Error('Failed to create payment intent');
      }

      // Redirect to payment page with payment intent details
      router.push(
        `/payment?clientSecret=${paymentIntent.clientSecret}&paymentIntentId=${paymentIntent.paymentIntentId}&amount=${total}&email=${email}`
      );
    } catch (err: any) {
      setError(err.message || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Please log in to checkout
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleCheckout} className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="john@example.com"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Address
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={processing || paymentLoading}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition-colors"
                    >
                      {processing || paymentLoading ? 'Processing...' : 'Continue to Payment'}
                    </button>
                    <Link
                      href="/cart"
                      className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg hover:bg-gray-300 font-semibold text-center transition-colors"
                    >
                      Back to Cart
                    </Link>
                  </div>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-20">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>

                {cart ? (
                  <>
                    <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                      <div className="flex justify-between text-gray-700">
                        <span>Items ({cart.totalItems}):</span>
                        <span>${cart.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Shipping:</span>
                        <span className="text-green-600 font-medium">Free</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Tax (10%):</span>
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

                    {/* Items List */}
                    <div className="space-y-2 pt-6 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3">Items:</h3>
                      {cart.items.map((item) => (
                        <div key={item.productId} className="flex justify-between text-sm text-gray-600">
                          <span>
                            {item.productName} x {item.quantity}
                          </span>
                          <span>${item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">Loading cart...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

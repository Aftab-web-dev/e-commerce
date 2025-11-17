'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { usePayment } from '@/hooks/usePayment';
import { useCart } from '@/hooks/useCart';

function PaymentSuccessContentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getPaymentStatus } = usePayment();
  const { clearCart } = useCart();

  const paymentIntentId = searchParams.get('paymentIntentId');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!paymentIntentId) {
          throw new Error('Payment ID not found');
        }

        // Get payment status
        const status = await getPaymentStatus(paymentIntentId);
        if (status) {
          setPaymentDetails(status);
          // Clear cart on success
          await clearCart();
        } else {
          throw new Error('Could not verify payment');
        }
      } catch (err: any) {
        setError(err.message || 'Error verifying payment');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [paymentIntentId, getPaymentStatus, clearCart]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-lg text-gray-600">Verifying payment...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-red-600 text-lg font-semibold mb-4">
          ❌ Payment Verification Error
        </div>
        <p className="text-gray-700 mb-6">{error}</p>
        <div className="space-x-4">
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Go to Home
          </Link>
          <Link
            href="/cart"
            className="inline-block bg-gray-200 text-gray-900 px-6 py-2 rounded hover:bg-gray-300"
          >
            View Cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">✓</div>
        <h1 className="text-4xl font-bold text-green-600 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600">
          Thank you for your purchase. Your order has been confirmed.
        </p>
      </div>

      {/* Payment Details */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Transaction Details
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600">Payment ID:</span>
            <span className="font-mono text-gray-900 break-all">
              {paymentIntentId}
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600">Amount:</span>
            <span className="text-2xl font-bold text-blue-600">
              ${paymentDetails?.amount ? (paymentDetails.amount / 100).toFixed(2) : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600">Status:</span>
            <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              {paymentDetails?.status === 'succeeded' ? 'Completed' : 'Processing'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Currency:</span>
            <span className="text-gray-900">
              {paymentDetails?.currency?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* What Happens Next */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          What Happens Next?
        </h3>
        <ul className="space-y-3 text-blue-900">
          <li className="flex items-start">
            <span className="mr-3">📧</span>
            <span>A confirmation email will be sent to your inbox shortly</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3">📦</span>
            <span>Your order will be prepared for shipment</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3">🚚</span>
            <span>You'll receive tracking information once your order ships</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3">❓</span>
            <span>Questions? Check your email for order details</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <Link
          href="/"
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold text-center transition-colors"
        >
          Continue Shopping
        </Link>
        <Link
          href="/cart"
          className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg hover:bg-gray-300 font-semibold text-center transition-colors"
        >
          View Cart
        </Link>
      </div>

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-600 border-t border-gray-200 pt-6">
        <p>
          Payment processed by{' '}
          <span className="font-semibold">Stripe</span>
        </p>
        <p className="mt-2">
          Your transaction is secure and encrypted
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessContent() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <div className="text-lg text-gray-600">Loading payment details...</div>
        </div>
      }
    >
      <PaymentSuccessContentInner />
    </Suspense>
  );
}

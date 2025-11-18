'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { usePayment } from '@/hooks/usePayment';

function PaymentContentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirmPayment, getPaymentStatus, loading } = usePayment();

  const clientSecret = searchParams.get('clientSecret');
  const paymentIntentId = searchParams.get('paymentIntentId');
  const amount = searchParams.get('amount');
  const email = searchParams.get('email');

  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  useEffect(() => {
    if (!clientSecret || !paymentIntentId) {
      setError('Invalid payment session');
    }
  }, [clientSecret, paymentIntentId]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      if (!paymentIntentId) {
        throw new Error('Payment intent ID is missing');
      }

      // Validate card details
      if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
        throw new Error('Please fill in all card details');
      }

      // Send card details to backend for confirmation
      const result = await confirmPayment(
        paymentIntentId,
        'order_' + Date.now(),
        cardNumber,
        cardExpiry,
        cardCvc
      );

      if (result && result.status === 'succeeded') {
        setPaymentStatus('success');
        // Redirect to success page after 2 seconds
        setTimeout(() => {
          router.push('/payment-success?paymentIntentId=' + paymentIntentId);
        }, 2000);
      } else if (result && result.status === 'processing') {
        setPaymentStatus('processing');
        // Check status after 3 seconds
        setTimeout(async () => {
          const status = await getPaymentStatus(paymentIntentId);
          if (status && status.status === 'succeeded') {
            setPaymentStatus('success');
            setTimeout(() => {
              router.push('/payment-success?paymentIntentId=' + paymentIntentId);
            }, 2000);
          }
        }, 3000);
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setProcessing(false);
    }
  };

  if (!clientSecret || !paymentIntentId) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-red-600 text-lg font-semibold mb-4">Error</div>
        <p className="text-gray-700 mb-6">{error || 'Invalid payment session'}</p>
        <Link
          href="/checkout"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Back to Checkout
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      {/* Payment Status Messages */}
      {paymentStatus === 'success' && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-green-700 font-semibold">✓ Payment successful!</p>
          <p className="text-green-600 text-sm">Redirecting to confirmation page...</p>
        </div>
      )}

      {paymentStatus === 'processing' && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-700 font-semibold">⏳ Payment processing...</p>
          <p className="text-blue-600 text-sm">Please wait while we confirm your payment.</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Payment Details */}
      <div className="mb-8 pb-8 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Details</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="text-2xl font-bold text-blue-600">
              ${parseFloat(amount || '0').toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="text-gray-900">{email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method:</span>
            <span className="text-gray-900">Stripe</span>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      {paymentStatus !== 'success' && (
        <form onSubmit={handlePaymentSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Card Information
            </h3>

            {/* Card Number */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(e.target.value.replace(/\s/g, '').slice(0, 16))
                }
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Test card: 4242 4242 4242 4242
              </p>
            </div>

            {/* Expiry and CVC */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                  placeholder="MM/YY"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Test: 12/25</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVC
                </label>
                <input
                  type="text"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value.slice(0, 4))}
                  placeholder="CVC"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Test: 123</p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> This is a test payment form. Use test card details above.
              In production, Stripe Elements would handle card tokenization securely.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={processing || loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition-colors"
          >
            {processing || loading ? (
              <>
                <span className="inline-block animate-spin mr-2">⚙️</span>
                Processing Payment...
              </>
            ) : (
              `Pay $${parseFloat(amount || '0').toFixed(2)}`
            )}
          </button>

          {/* Back Button */}
          <Link
            href="/checkout"
            className="block text-center text-gray-600 hover:text-gray-900 font-medium"
          >
            Back to Checkout
          </Link>
        </form>
      )}
    </div>
  );
}

export default function PaymentContent() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <div className="text-lg text-gray-600">Loading payment details...</div>
        </div>
      }
    >
      <PaymentContentInner />
    </Suspense>
  );
}

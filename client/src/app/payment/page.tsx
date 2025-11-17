import Navbar from '@/components/Navbar';
import PaymentContent from '@/components/PaymentContent';

export default function PaymentPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Payment</h1>
          <PaymentContent />

          {/* Security Info */}
          <div className="text-center text-sm text-gray-600 mt-6">
            <p>🔒 Your payment is secure and encrypted</p>
          </div>
        </div>
      </div>
    </>
  );
}

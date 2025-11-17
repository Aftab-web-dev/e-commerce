import Navbar from '@/components/Navbar';
import PaymentSuccessContent from '@/components/PaymentSuccessContent';

export default function PaymentSuccessPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <PaymentSuccessContent />
        </div>
      </div>
    </>
  );
}

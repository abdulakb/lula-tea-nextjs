'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    // Retrieve session details
    fetch(`/api/stripe/session?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setSession(data);
          
          // Create order in database
          const orderDetails = JSON.parse(data.metadata.orderDetails);
          return fetch('/api/orders/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...orderDetails,
              paymentMethod: 'stripe',
              paymentStatus: 'paid',
              stripeSessionId: sessionId,
            }),
          });
        }
      })
      .then((res) => res?.json())
      .then((orderData) => {
        if (orderData?.orderId) {
          // Redirect to order confirmation with invoice
          setTimeout(() => {
            router.push(`/order-confirmation?orderId=${orderData.orderId}&invoice=${orderData.invoiceBase64}`);
          }, 2000);
        }
      })
      .catch((err) => {
        console.error('Error processing payment:', err);
        setError('Failed to process payment');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Payment...</h2>
          <p className="text-gray-600">Please wait while we confirm your payment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-amber-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/checkout')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-2">Thank you for your purchase</p>
        {session?.amount_total && (
          <p className="text-2xl font-bold text-green-600 mb-6">
            {(session.amount_total / 100).toFixed(2)} SAR
          </p>
        )}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <p className="text-sm text-gray-600 mb-2">Redirecting to order confirmation...</p>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-green-600 h-full animate-[slideRight_2s_ease-in-out]" style={{width: '100%'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}

import { useState, useCallback } from 'react';
import axiosInstance from '@/lib/axiosInstance';

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Create Payment Intent
  const createPaymentIntent = useCallback(
    async (amount: number, currency: string, orderId: string, userId: string, email: string) => {
      try {
        setLoading(true);
        setError('');

        const response = await axiosInstance.post('/v1/payment/create-intent', {
          amount,
          currency,
          orderId,
          userId,
          email,
        });

        return response.data.data as PaymentIntentResponse;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to create payment intent';
        setError(errorMessage);
        console.error(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Confirm Payment
  const confirmPayment = useCallback(
    async (paymentIntentId: string, orderId: string) => {
      try {
        setLoading(true);
        setError('');

        const response = await axiosInstance.post('/v1/payment/confirm', {
          paymentIntentId,
          orderId,
        });

        return response.data.data;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to confirm payment';
        setError(errorMessage);
        console.error(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get Payment Status
  const getPaymentStatus = useCallback(async (paymentIntentId: string) => {
    try {
      setLoading(true);
      setError('');

      const response = await axiosInstance.get(`/v1/payment/status/${paymentIntentId}`);
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to get payment status';
      setError(errorMessage);
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createPaymentIntent,
    confirmPayment,
    getPaymentStatus,
  };
}

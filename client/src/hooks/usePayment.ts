import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import axiosInstance from '@/lib/axiosInstance';

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

interface ApiErrorResponse {
  message: string;
  statusCode: number;
}

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getErrorMessage = (err: unknown): string => {
    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      return axiosErr.response?.data?.message || axiosErr.message || 'An error occurred';
    }
    if (err instanceof Error) {
      return err.message;
    }
    return 'An unknown error occurred';
  };

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
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);
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
    async (
      paymentIntentId: string,
      orderId: string,
      stripeToken?: string
    ) => {
      try {
        setLoading(true);
        setError('');

        const response = await axiosInstance.post('/v1/payment/confirm', {
          paymentIntentId,
          orderId,
          ...(stripeToken && { stripeToken }),
        });

        return response.data.data;
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);
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
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
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

import { useState, useCallback } from 'react';
import axiosInstance from '@/lib/axiosInstance';

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch cart
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get('/v1/cart');
      setCart(response.data.data);
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch cart';
      setError(errorMessage);
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add to cart
  const addToCart = useCallback(
    async (productId: string, quantity: number = 1) => {
      try {
        setError('');
        const response = await axiosInstance.post('/v1/cart/add', {
          productId,
          quantity,
        });
        setCart(response.data.data);
        return response.data.data;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to add to cart';
        setError(errorMessage);
        console.error(err);
        return null;
      }
    },
    []
  );

  // Update quantity
  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      try {
        setError('');
        const response = await axiosInstance.put('/v1/cart/update', {
          productId,
          quantity,
        });
        setCart(response.data.data);
        return response.data.data;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to update cart';
        setError(errorMessage);
        console.error(err);
        return null;
      }
    },
    []
  );

  // Remove from cart
  const removeFromCart = useCallback(async (productId: string) => {
    try {
      setError('');
      const response = await axiosInstance.post('/v1/cart/remove', {
        productId,
      });
      setCart(response.data.data);
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to remove from cart';
      setError(errorMessage);
      console.error(err);
      return null;
    }
  }, []);

  // Clear cart
  const clearCartFn = useCallback(async () => {
    try {
      setError('');
      const response = await axiosInstance.post('/v1/cart/clear');
      setCart(response.data.data);
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to clear cart';
      setError(errorMessage);
      console.error(err);
      return null;
    }
  }, []);

  return {
    cart,
    loading,
    error,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart: clearCartFn,
  };
}

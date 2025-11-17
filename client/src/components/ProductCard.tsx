'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  _id: string;
  productName: string;
  price: number;
  description: string;
  category: string;
  rating: number;
}

export default function ProductCard({
  _id,
  productName,
  price,
  description,
  category,
  rating,
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddToCart = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // Redirect to login if not authenticated
      router.push('/auth/login');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      await addToCart(_id, quantity);
      setMessage('Added to cart!');
      setQuantity(1);
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage('Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      {/* Product Image Placeholder */}
      <div className="w-full h-48 bg-gray-200 rounded-md mb-3 flex items-center justify-center">
        <span className="text-gray-500">Product Image</span>
      </div>

      {/* Product Name */}
      <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
        {productName}
      </h3>

      {/* Category */}
      <p className="text-sm text-gray-500 mb-2">{category}</p>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {description}
      </p>

      {/* Rating */}
      <div className="flex items-center mb-3">
        <span className="text-sm text-yellow-500 font-medium">
          ★ {rating.toFixed(1)}
        </span>
      </div>

      {/* Success Message */}
      {message && (
        <div className="mb-2 p-2 bg-green-50 text-green-700 text-xs rounded text-center">
          {message}
        </div>
      )}

      {/* Price and Button */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">${price}</span>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            −
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-12 px-2 py-1 border border-gray-300 rounded text-center text-gray-900"
            min="1"
          />
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
          >
            +
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
        >
          {loading ? 'Adding...' : '🛒 Add to Cart'}
        </button>
      </div>
    </div>
  );
}

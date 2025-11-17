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

      {/* Price and Button */}
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-blue-600">${price}</span>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
          Add Cart
        </button>
      </div>
    </div>
  );
}

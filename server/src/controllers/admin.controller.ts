import { Request as ExpressRequest, Response as ExpressResponse } from "express";
import { AuthModel } from "../models/auth.model";
import { ProductModel } from "../models/product.model";
import { CartModel } from "../models/cart.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

// ==================== DASHBOARD ====================

// Get Dashboard Statistics
const getDashboardStats = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
  // Get total users (excluding admin)
  const totalUsers = await AuthModel.countDocuments({ role: 'user' });

  // Get total products
  const totalProducts = await ProductModel.countDocuments();

  // Get total orders (from carts with items)
  const ordersWithItems = await CartModel.countDocuments({ 'items.0': { $exists: true } });

  // Get total revenue (sum of all cart totals)
  const revenueData = await CartModel.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
      },
    },
  ]);

  const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

  // Get product categories
  const categories = await ProductModel.distinct('category');

  // Get low stock products (example: less than 10 items - if you add stock field later)
  const totalProductCategories = categories.length;

  const dashboardData = {
    totalUsers,
    totalProducts,
    totalOrders: ordersWithItems,
    totalRevenue,
    totalProductCategories,
    categories,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, dashboardData, "Dashboard statistics retrieved successfully"));
});

// Get all users
const getAllUsers = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
  const { page = 1, limit = 10, role = 'user' } = req.query;

  const pageNumber = Math.max(1, Number(page));
  const pageLimit = Math.max(1, Number(limit));
  const skip = (pageNumber - 1) * pageLimit;

  const filter: any = {};
  if (role) {
    filter.role = role;
  }

  const users = await AuthModel.find(filter)
    .select('-password -refreshToken')
    .skip(skip)
    .limit(pageLimit)
    .sort({ createdAt: -1 });

  const totalUsers = await AuthModel.countDocuments(filter);
  const totalPages = Math.ceil(totalUsers / pageLimit);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          users,
          pagination: {
            currentPage: pageNumber,
            totalPages,
            totalUsers,
            limit: pageLimit,
          },
        },
        "Users retrieved successfully"
      )
    );
});


// ==================== INVENTORY MANAGEMENT ====================

// Get inventory summary
const getInventorySummary = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
  const products = await ProductModel.find().select('productName price category rating createdAt');

  const totalValue = products.reduce((sum, product) => sum + product.price, 0);
  const categorySummary = await ProductModel.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const inventoryData = {
    totalProducts: products.length,
    totalInventoryValue: totalValue,
    categorySummary,
    allProducts: products,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, inventoryData, "Inventory summary retrieved successfully"));
});

// Get category wise inventory
const getCategoryInventory = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
  const categoryInventory = await ProductModel.aggregate([
    {
      $group: {
        _id: '$category',
        products: { $push: '$$ROOT' },
        totalProducts: { $sum: 1 },
        totalValue: { $sum: '$price' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { totalProducts: -1 } },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, categoryInventory, "Category inventory retrieved successfully"));
});

// Get low rating products (for quality control)
const getLowRatingProducts = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
  const { minRating = 0, maxRating = 3 } = req.query;

  const products = await ProductModel.find({
    rating: {
      $gte: Number(minRating),
      $lte: Number(maxRating),
    },
  }).sort({ rating: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Low rating products retrieved successfully"));
});

// Get products by price range
const getProductsByPriceRange = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
  const { minPrice = 0, maxPrice = 1000000 } = req.query;

  const products = await ProductModel.find({
    price: {
      $gte: Number(minPrice),
      $lte: Number(maxPrice),
    },
  }).sort({ price: 1 });

  const summary = {
    minPrice: Number(minPrice),
    maxPrice: Number(maxPrice),
    productsInRange: products.length,
    products,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, summary, "Products by price range retrieved successfully"));
});

export {
  getDashboardStats,
  getAllUsers,
  getInventorySummary,
  getCategoryInventory,
  getLowRatingProducts,
  getProductsByPriceRange,
};

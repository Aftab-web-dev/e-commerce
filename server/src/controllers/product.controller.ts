import { Request as ExpressRequest, Response as ExpressResponse } from "express";
import { ProductModel } from "../models/product.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

// CREATE - Add a new product
const addProduct = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
  const { productName, price, description, category, rating } = req.body;

  // Validation
  if (!productName || price === undefined || !description || !category) {
    throw new ApiError(400, "Please provide all required fields (productName, price, description, category)");
  }

  // Validate price is a positive number
  if (typeof price !== 'number' || price < 0) {
    throw new ApiError(400, "Price must be a positive number");
  }

  // Validate rating if provided
  if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
    throw new ApiError(400, "Rating must be between 0 and 5");
  }

  // Create Product
  const newProduct = await ProductModel.create({
    productName: productName.trim(),
    price,
    description: description.trim(),
    category: category.trim(),
    rating: rating || 0,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newProduct, "Product added successfully"));
});

// READ - Get all products with optional filtering and pagination
const getAllProducts = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
  const { category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

  // Build filter object
  const filter: any = {};

  if (category) {
    filter.category = category;
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) {
      filter.price.$gte = Number(minPrice);
    }
    if (maxPrice) {
      filter.price.$lte = Number(maxPrice);
    }
  }

  // Calculate pagination
  const pageNumber = Math.max(1, Number(page));
  const pageLimit = Math.max(1, Number(limit));
  const skip = (pageNumber - 1) * pageLimit;

  // Fetch products and total count
  const products = await ProductModel.find(filter)
    .skip(skip)
    .limit(pageLimit)
    .sort({ createdAt: -1 });

  const totalProducts = await ProductModel.countDocuments(filter);
  const totalPages = Math.ceil(totalProducts / pageLimit);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          products,
          pagination: {
            currentPage: pageNumber,
            totalPages,
            totalProducts,
            limit: pageLimit,
          },
        },
        "Products retrieved successfully"
      )
    );
});

// READ - Get a single product by ID
const getProductById = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Product ID is required");
  }

  const product = await ProductModel.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product retrieved successfully"));
});

// UPDATE - Update a product
const updateProduct = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
  const { id } = req.params;
  const { productName, price, description, category, rating } = req.body;

  if (!id) {
    throw new ApiError(400, "Product ID is required");
  }

  // Check if product exists
  const product = await ProductModel.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Validate provided fields
  if (productName !== undefined && !productName.trim()) {
    throw new ApiError(400, "Product name cannot be empty");
  }

  if (price !== undefined && (typeof price !== 'number' || price < 0)) {
    throw new ApiError(400, "Price must be a positive number");
  }

  if (description !== undefined && !description.trim()) {
    throw new ApiError(400, "Description cannot be empty");
  }

  if (category !== undefined && !category.trim()) {
    throw new ApiError(400, "Category cannot be empty");
  }

  if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
    throw new ApiError(400, "Rating must be between 0 and 5");
  }

  // Update only provided fields
  const updateData: any = {};
  if (productName !== undefined) updateData.productName = productName.trim();
  if (price !== undefined) updateData.price = price;
  if (description !== undefined) updateData.description = description.trim();
  if (category !== undefined) updateData.category = category.trim();
  if (rating !== undefined) updateData.rating = rating;

  const updatedProduct = await ProductModel.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
});

// DELETE - Delete a product
const deleteProduct = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Product ID is required");
  }

  const product = await ProductModel.findByIdAndDelete(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product deleted successfully"));
});

// Additional utility - Search products by name or description
const searchProducts = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
  const { query, page = 1, limit = 10 } = req.query;

  if (!query) {
    throw new ApiError(400, "Search query is required");
  }

  const searchQuery = String(query);
  const pageNumber = Math.max(1, Number(page));
  const pageLimit = Math.max(1, Number(limit));
  const skip = (pageNumber - 1) * pageLimit;

  const products = await ProductModel.find({
    $or: [
      { productName: { $regex: searchQuery, $options: 'i' } },
      { description: { $regex: searchQuery, $options: 'i' } },
      { category: { $regex: searchQuery, $options: 'i' } },
    ],
  })
    .skip(skip)
    .limit(pageLimit)
    .sort({ createdAt: -1 });

  const totalProducts = await ProductModel.countDocuments({
    $or: [
      { productName: { $regex: searchQuery, $options: 'i' } },
      { description: { $regex: searchQuery, $options: 'i' } },
      { category: { $regex: searchQuery, $options: 'i' } },
    ],
  });

  const totalPages = Math.ceil(totalProducts / pageLimit);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          products,
          pagination: {
            currentPage: pageNumber,
            totalPages,
            totalProducts,
            limit: pageLimit,
          },
        },
        "Search results retrieved successfully"
      )
    );
});

export { addProduct, getAllProducts, getProductById, updateProduct, deleteProduct, searchProducts };

import { Request as ExpressRequest, Response as ExpressResponse } from "express";
import { CartModel } from "../models/cart.model";
import { ProductModel } from "../models/product.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Types } from "mongoose";

// Get user's cart
const getCart = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
  const userId = (req as any).user?._id;

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  let cart = await CartModel.findOne({ userId }).populate("items.productId");

  if (!cart) {
    cart = await CartModel.create({
      userId,
      items: [],
      totalAmount: 0,
      totalItems: 0,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart retrieved successfully"));
});

// Add product to cart
const addToCart = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
  const userId = (req as any).user?._id;
  const { productId, quantity } = req.body;

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  if (!productId || !quantity) {
    throw new ApiError(400, "Product ID and quantity are required");
  }

  if (!Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID format");
  }

  if (typeof quantity !== "number" || quantity < 1) {
    throw new ApiError(400, "Quantity must be a positive number");
  }

  // Fetch product details
  const product = await ProductModel.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Get or create cart
  let cart = await CartModel.findOne({ userId });

  if (!cart) {
    cart = await CartModel.create({
      userId,
      items: [],
      totalAmount: 0,
      totalItems: 0,
    });
  }

  // Add item to cart
  await cart.addItem(
    new Types.ObjectId(productId),
    product.productName,
    product.price,
    quantity
  );

  // Populate product details
  const updatedCart = await CartModel.findOne({ userId }).populate("items.productId");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCart, "Product added to cart successfully"));
});

// Update item quantity in cart
const updateCartItemQuantity = asyncHandler(
  async (req: ExpressRequest, res: ExpressResponse) => {
    const userId = (req as any).user?._id;
    const { productId, quantity } = req.body;

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    if (!productId || quantity === undefined) {
      throw new ApiError(400, "Product ID and quantity are required");
    }

    if (!Types.ObjectId.isValid(productId)) {
      throw new ApiError(400, "Invalid product ID format");
    }

    if (typeof quantity !== "number" || quantity < 0) {
      throw new ApiError(400, "Quantity must be a non-negative number");
    }

    const cart = await CartModel.findOne({ userId });

    if (!cart) {
      throw new ApiError(404, "Cart not found");
    }

    await cart.updateItemQuantity(new Types.ObjectId(productId), quantity);

    const updatedCart = await CartModel.findOne({ userId }).populate(
      "items.productId"
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedCart, "Cart item quantity updated successfully")
      );
  }
);

// Remove product from cart
const removeFromCart = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
  const userId = (req as any).user?._id;
  const { productId } = req.body;

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  if (!Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID format");
  }

  const cart = await CartModel.findOne({ userId });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  await cart.removeItem(new Types.ObjectId(productId));

  const updatedCart = await CartModel.findOne({ userId }).populate(
    "items.productId"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCart, "Product removed from cart successfully"));
});

// Clear entire cart
const clearCart = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
  const userId = (req as any).user?._id;

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  let cart = await CartModel.findOne({ userId });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  await cart.clearCart();

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart cleared successfully"));
});

// Get cart count (for quick display)
const getCartCount = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
  const userId = (req as any).user?._id;

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const cart = await CartModel.findOne({ userId });

  const cartCount = cart ? cart.totalItems : 0;

  return res
    .status(200)
    .json(new ApiResponse(200, { cartCount }, "Cart count retrieved successfully"));
});

// Get cart summary (total and count only)
const getCartSummary = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
  const userId = (req as any).user?._id;

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const cart = await CartModel.findOne({ userId });

  const summary = cart
    ? {
        totalItems: cart.totalItems,
        totalAmount: cart.totalAmount,
      }
    : {
        totalItems: 0,
        totalAmount: 0,
      };

  return res
    .status(200)
    .json(new ApiResponse(200, summary, "Cart summary retrieved successfully"));
});

export {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  getCartCount,
  getCartSummary,
};

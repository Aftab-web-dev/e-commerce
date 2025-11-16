import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  getCartCount,
  getCartSummary,
} from "../controllers/cart.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

// All cart routes require authentication
router.use(verifyJWT);

// GET - Retrieve user's cart
router.route("/").get(getCart);

// GET - Get cart item count
router.route("/count").get(getCartCount);

// GET - Get cart summary (total amount and item count)
router.route("/summary").get(getCartSummary);

// POST - Add product to cart
router.route("/add").post(addToCart);

// PUT - Update item quantity in cart
router.route("/update").put(updateCartItemQuantity);

// DELETE - Remove product from cart
router.route("/remove").post(removeFromCart);

// DELETE - Clear entire cart
router.route("/clear").post(clearCart);

export default router;

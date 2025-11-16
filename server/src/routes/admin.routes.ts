import { Router } from "express";
import {
  getDashboardStats,
  getAllUsers,
  getInventorySummary,
  getCategoryInventory,
  getLowRatingProducts,
  getProductsByPriceRange,
} from "../controllers/admin.controller";
import {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
import { verifyAdmin } from "../middlewares/admin.middleware";

const router = Router();

// All admin routes require authentication and admin role
router.use(verifyJWT, verifyAdmin);

// ==================== DASHBOARD ====================

// GET - Dashboard statistics (users count, products count, orders count, revenue)
router.route("/dashboard/stats").get(getDashboardStats);

// GET - All users
router.route("/users").get(getAllUsers);

// ==================== PRODUCT MANAGEMENT (Using existing product controller) ====================

// GET - All products
router.route("/products").get(getAllProducts);

// POST - Add new product
router.route("/products").post(addProduct);

// GET - Get product by ID
router.route("/products/:id").get(getProductById);

// PUT - Update product
router.route("/products/:id").put(updateProduct);

// DELETE - Delete product
router.route("/products/:id").delete(deleteProduct);

// ==================== INVENTORY MANAGEMENT ====================

// GET - Inventory summary
router.route("/inventory/summary").get(getInventorySummary);

// GET - Category wise inventory
router.route("/inventory/category").get(getCategoryInventory);

// GET - Low rating products
router.route("/inventory/low-rating").get(getLowRatingProducts);

// GET - Products by price range
router.route("/inventory/price-range").get(getProductsByPriceRange);

export default router;

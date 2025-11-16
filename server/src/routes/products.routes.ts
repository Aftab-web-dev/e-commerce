import { Router } from "express";
import {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
} from "../controllers/product.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
const router = Router();

// CREATE - Add a new product
router.route("/add").post( verifyJWT, addProduct);

// READ - Get all products with optional filtering and pagination
router.route("/getall").get(getAllProducts);

// SEARCH - Search products
router.route("/search").get(searchProducts);

// READ - Get a single product by ID
router.route("/:id").get(getProductById);

// UPDATE - Update a product
router.route("/:id").put(verifyJWT,updateProduct);

// DELETE - Delete a product
router.route("/:id").delete(verifyJWT,deleteProduct);

export default router;

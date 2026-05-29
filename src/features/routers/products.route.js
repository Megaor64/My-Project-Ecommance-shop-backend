import express from "express";
import {
  createProduct,
  deleteProduct,
  listOfProducts,
  getProductById,
  updateProduct,
} from "../controllers/products.controller.js";
import { adminCheck } from "../../shared/middleware/adminMiddlware.js";
import { authMiddleware } from "../../shared/middleware/authMiddleware.js";
import { validateRequest } from "../../shared/middleware/validateRequest.js";
import { uploadFlie } from "../../shared/middleware/uploadMiddleware.js";
import {
  createProductBodySchema,
  productIdParamsSchema,
  updateProductBodySchema,
} from "../validation/products.schemas.js";

const router = express.Router();

router.post(
  "/",
  uploadFlie,
  validateRequest(createProductBodySchema, "body"),
  authMiddleware,
  adminCheck,
  createProduct
);
router.get("/", listOfProducts);
router.get(
  "/:id",
  validateRequest(productIdParamsSchema, "params"),
  getProductById
);
router.patch(
  "/:id",
  validateRequest(productIdParamsSchema, "params"),
  validateRequest(updateProductBodySchema, "body"),
  authMiddleware,
  adminCheck,
  updateProduct
);
router.delete(
  "/:id",
  validateRequest(productIdParamsSchema, "params"),
  authMiddleware,
  adminCheck,
  deleteProduct
);

export default router;

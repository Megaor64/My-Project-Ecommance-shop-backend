import express from 'express';
import { addItem, clearCart, getCart, removeItem, syncCart, updateItem } from '../controllers/cart.controller.js';
import { checkPermissions } from '../../shared/middleware/checkPermissions.js';
import { authMiddleware } from '../../shared/middleware/authMiddleware.js';
import { validateRequest } from '../../shared/middleware/validateRequest.js';
import {
  cartUserIdParamsSchema,
  cartItemProductIdParamsSchema,
  addItemBodySchema,
  updateItemBodySchema,
  syncCartBodySchema
} from '../validation/cart.schemas.js';
const router = express.Router();

// Specific paths must be registered before generic `/:id` where they would conflict.
router.get("/:id", validateRequest(cartUserIdParamsSchema, "params"), authMiddleware, checkPermissions, getCart)
router.post("/:id/sync", validateRequest(cartUserIdParamsSchema, "params"), validateRequest(syncCartBodySchema, "body"), authMiddleware, checkPermissions, syncCart)
router.post("/:id", validateRequest(cartUserIdParamsSchema, "params"), validateRequest(addItemBodySchema, "body"), authMiddleware, checkPermissions, addItem)
router.patch("/:id", validateRequest(cartUserIdParamsSchema, "params"), validateRequest(updateItemBodySchema, "body"), authMiddleware, checkPermissions, updateItem)
router.delete("/:id/items/:productId", validateRequest(cartItemProductIdParamsSchema, "params"), authMiddleware, checkPermissions, removeItem)
router.delete("/:id/clear", validateRequest(cartUserIdParamsSchema, "params"), authMiddleware, checkPermissions, clearCart)

export default router;

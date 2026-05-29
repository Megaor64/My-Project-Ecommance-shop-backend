import express from 'express';
import { authMiddleware } from '../../shared/middleware/authMiddleware.js';
import { cancelOrder, createOrderFromCart, deleteOrder, getMyOrders } from '../controllers/orders.controller.js';
import { validateRequest } from '../../shared/middleware/validateRequest.js';
import { createOrderBodySchema } from '../validation/orders.schemas.js';

const router = express.Router();
router.get('/', authMiddleware, getMyOrders);
router.post('/', validateRequest(createOrderBodySchema, "body"), authMiddleware, createOrderFromCart);
router.patch('/:id/cancel', authMiddleware, cancelOrder);
router.delete('/:id', authMiddleware, deleteOrder);

export default router;
import * as ordersService from "../service/orders.service.js";
import Order from "../models/orderSchema.js";
import { success, error } from "../../shared/utils/apiResponse.utils.js";

export async function getMyOrders(req, res, next) {
  try {
    const orders = await ordersService.getOrdersByUserId(req.user.id);
    return success(res, orders, "Orders retrieved");
  } catch (err) {
    next(err);
  }
}

export async function cancelOrder(req, res, next) {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!order) return error(res, "Order not found", null, 404);
    if (order.orderStatus !== "processing") {
      return error(res, "Only processing orders can be cancelled", null, 400);
    }

    order.orderStatus = "cancelled";
    await order.save();

    return success(res, order, "Order cancelled");
  } catch (err) {
    next(err);
  }
}

export async function deleteOrder(req, res, next) {
  try {
    await ordersService.deleteOrder(req.params.id, req.user.id);
    return success(res, null, "Order deleted");
  } catch (err) {
    if (err.status) {
      return error(res, err.message, null, err.status);
    }
    next(err);
  }
}

export async function createOrderFromCart(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return error(res, "Unauthorized", null, 401);

    const { shippingAddress, paymentMethod } = req.body;
    const order = await ordersService.createOrderFromCart(
      userId,
      shippingAddress,
      paymentMethod
    );
    return success(res, { order }, "Order created", 201);
  } catch (err) {
    if (err.status) {
      return error(res, err.message, null, err.status);
    }
    next(err);
  }
}

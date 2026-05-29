import mongoose from "mongoose";
import Product from "../models/productSchema.js";
import User from "../models/UserSchema.js";
import Order from "../models/orderSchema.js";

export async function getOrdersByUserId(userId) {
  return Order.find({ userId }).sort({ createdAt: -1 });
}

export async function deleteOrder(orderId, userId) {
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) {
    const err = new Error("Order not found");
    err.status = 404;
    throw err;
  }
  if (order.orderStatus === "processing") {
    const err = new Error(
      "Processing orders cannot be deleted. Cancel the order first."
    );
    err.status = 400;
    throw err;
  }
  await Order.findByIdAndDelete(order._id);
  return order;
}

function toStoredPaymentMethod(paymentMethod) {
  return {
    cardholderName: paymentMethod.cardholderName.trim(),
    cardLast4: paymentMethod.cardNumber.slice(-4),
    expiration: paymentMethod.expiration.trim(),
  };
}

export async function createOrderFromCart(userId, shippingAddress, paymentMethod) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).select("cart").session(session);
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    if (!user.cart?.length) {
      const err = new Error("Cart is empty");
      err.status = 400;
      throw err;
    }

    const productIds = user.cart.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } })
      .select("_id name price stock isActive")
      .session(session)
      .lean();

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));
    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of user.cart) {
      const id = cartItem.productId.toString();
      const product = productMap.get(id);

      if (!product) {
        const err = new Error(`Product not found: ${id}`);
        err.status = 404;
        throw err;
      }
      if (!product.isActive) {
        const err = new Error(`Product inactive: ${product.name}`);
        err.status = 400;
        throw err;
      }

      const quantity = Number(cartItem.quantity) || 0;
      if (quantity < 1) {
        const err = new Error(`Invalid quantity for: ${product.name}`);
        err.status = 400;
        throw err;
      }
      if (product.stock < 0) {
        const err = new Error(
          `Insufficient stock for "${product.name}"`
        );
        err.status = 400;
        throw err;
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity,
      });
      totalAmount += product.price * quantity;
    }

    const [order] = await Order.create(
      [
        {
          userId,
          items: orderItems,
          shippingAddress,
          paymentMethod: toStoredPaymentMethod(paymentMethod),
          totalAmount,
          paymentStatus: "pending",
          orderStatus: "processing",
        },
      ],
      { session }
    );

    user.cart = [];
    await user.save({ session });

    await session.commitTransaction();
    return order;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
}

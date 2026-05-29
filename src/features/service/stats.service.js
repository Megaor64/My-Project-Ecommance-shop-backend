import User from "../models/UserSchema.js";
import Order from "../models/orderSchema.js";

export async function getUserCount() {
  return User.countDocuments({ role: "customer" });
}

export async function getSalesByProduct() {
  return Order.aggregate([
    { $match: { orderStatus: { $ne: "cancelled" } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        totalSold: { $sum: "$items.quantity" },
      },
    },
    {
      $project: {
        _id: 0,
        productId: { $toString: "$_id" },
        totalSold: 1,
      },
    },
  ]);
}

export async function getAdminStats() {
  const [userCount, salesByProduct] = await Promise.all([
    getUserCount(),
    getSalesByProduct(),
  ]);
  return { userCount, salesByProduct };
}

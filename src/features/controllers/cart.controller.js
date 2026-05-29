import mongoose from 'mongoose';
import Product from '../models/productSchema.js';
import { success, error } from '../../shared/utils/apiResponse.utils.js';
import User from '../models/UserSchema.js';
import { adjustStock } from '../service/inventory.service.js';

function handleInventoryError(res, err, next) {
  if (err.status) {
    return error(res, err.message, null, err.status);
  }
  return next(err);
}

async function getCart(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('cart').populate('cart.productId', 'name price imageUrl stock isActive');
    if (!user) return error(res, 'User not found', null, 404);
    const cart = (user.cart || []).map((item) => ({
      productId: item.productId?._id ?? item.productId,
      name: item.productId?.name,
      price: item.productId?.price,
      imageUrl: item.productId?.imageUrl,
      stock: item.productId?.stock,
      isActive: item.productId?.isActive,
      quantity: item.quantity,
    }));
    return success(res, { items: cart }, 'Cart retrieved');
  } catch (err) {
    next(err);
  }
}

async function syncCart(req, res, next) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const guestItems = req.body.items || [];
    const user = await User.findById(req.user.id).select('cart').session(session);
    if (!user) {
      await session.abortTransaction();
      return error(res, 'User not found', null, 404);
    }

    for (const { productId, quantity } of guestItems) {
      const qty = Number(quantity) || 0;
      if (qty < 1) continue;

      const product = await Product.findById(productId)
        .select('_id isActive')
        .session(session)
        .lean();
      if (!product) {
        await session.abortTransaction();
        return error(res, 'Product not found', null, 404);
      }
      if (!product.isActive) {
        await session.abortTransaction();
        return error(res, 'Product is not available', null, 400);
      }

      await adjustStock(productId, -qty, session);
    }

    const merged = [...(user.cart || [])];
    for (const { productId, quantity } of guestItems) {
      const qty = Number(quantity) || 0;
      if (qty < 1) continue;

      const existing = merged.find((i) => i.productId.toString() === productId);
      if (existing) existing.quantity += qty;
      else merged.push({ productId, quantity: qty });
    }

    user.cart = merged;
    await user.save({ session });
    await session.commitTransaction();
    return success(res, { items: user.cart }, 'Cart synced');
  } catch (err) {
    await session.abortTransaction();
    return handleInventoryError(res, err, next);
  } finally {
    session.endSession();
  }
}

async function addItem(req, res, next) {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = Number(quantity) || 0;
    if (qty < 1) return error(res, 'Invalid quantity', null, 400);

    const product = await Product.findById(productId).select('_id isActive stock');
    if (!product) return error(res, 'Product not found', null, 404);
    if (!product.isActive) return error(res, 'Product is not available', null, 400);

    const user = await User.findById(req.user.id).select('cart');
    if (!user) return error(res, 'User not found', null, 404);

    await adjustStock(productId, -qty);

    const existing = user.cart.find((i) => i.productId.toString() === productId);
    if (existing) existing.quantity += qty;
    else user.cart.push({ productId, quantity: qty });
    await user.save();
    return success(res, { items: user.cart }, 'Item added to cart');
  } catch (err) {
    return handleInventoryError(res, err, next);
  }
}

async function updateItem(req, res, next) {
  try {
    const { productId, quantity } = req.body;
    const newQty = Number(quantity);
    if (!Number.isFinite(newQty) || newQty < 1) {
      return error(res, 'Invalid quantity', null, 400);
    }

    const user = await User.findById(req.user.id).select('cart');
    if (!user) return error(res, 'User not found', null, 404);

    const item = user.cart.find((i) => i.productId.toString() === productId);
    if (!item) return error(res, 'Item not in cart', null, 404);

    const delta = newQty - item.quantity;
    if (delta !== 0) {
      await adjustStock(productId, -delta);
    }

    item.quantity = newQty;
    await user.save();
    return success(res, { items: user.cart }, 'Cart updated');
  } catch (err) {
    return handleInventoryError(res, err, next);
  }
}

async function removeItem(req, res, next) {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id).select('cart');
    if (!user) return error(res, 'User not found', null, 404);

    const item = user.cart.find((i) => i.productId.toString() === productId);
    if (!item) return error(res, 'Item not in cart', null, 404);

    await adjustStock(productId, item.quantity);

    user.cart = user.cart.filter((i) => i.productId.toString() !== productId);
    await user.save();
    return success(res, { items: user.cart }, 'Item removed');
  } catch (err) {
    return handleInventoryError(res, err, next);
  }
}

async function clearCart(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('cart');
    if (!user) return error(res, 'User not found', null, 404);

    for (const item of user.cart || []) {
      await adjustStock(item.productId, item.quantity);
    }

    user.cart = [];
    await user.save();
    return success(res, { items: [] }, 'Cart cleared');
  } catch (err) {
    return handleInventoryError(res, err, next);
  }
}

export {
  getCart,
  syncCart,
  addItem,
  updateItem,
  removeItem,
  clearCart
}

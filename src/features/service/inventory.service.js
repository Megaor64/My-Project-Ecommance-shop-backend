import mongoose from 'mongoose';
import Product from '../models/productSchema.js';

/**
 * @param {string} productId
 * @param {number} delta - negative reserves stock, positive restores
 * @param {import('mongoose').ClientSession} [session]
 */
async function adjustStock(productId, delta, session = null) {
  const numDelta = Number(delta);
  if (!numDelta) {
    const query = Product.findById(productId).select('stock').lean();
    if (session) query.session(session);
    const product = await query;
    if (!product) {
      const err = new Error('Product not found');
      err.status = 404;
      throw err;
    }
    return { productId: product._id, newStock: product.stock };
  }

  const findQuery = Product.findById(productId).select('stock name');
  if (session) findQuery.session(session);
  const product = await findQuery.lean();

  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }

  if (numDelta < 0 && product.stock + numDelta < 0) {
    const err = new Error(
      `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${-numDelta}`
    );
    err.status = 400;
    throw err;
  }

  const updateOpts = { new: true };
  if (session) updateOpts.session = session;

  const result = await Product.findByIdAndUpdate(
    productId,
    { $inc: { stock: numDelta } },
    updateOpts
  ).lean();

  if (!result || result.stock < 0) {
    const err = new Error(
      `Insufficient stock for "${product.name ?? 'product'}"`
    );
    err.status = 400;
    throw err;
  }

  return { productId: result._id, newStock: result.stock };
}

async function reserveAndDeduct(items) {
  if (!items?.length) return [];

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    })
      .session(session)
      .lean();

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    for (const item of items) {
      const id = item.productId?.toString?.() ?? item.productId;
      const product = productMap.get(id);

      if (!product) {
        await session.abortTransaction();
        throw new Error(`Product not found or inactive: ${id}`);
      }

      const requested = Number(item.quantity) || 0;
      if (requested < 1) {
        await session.abortTransaction();
        throw new Error(`Invalid quantity for product ${product.name}`);
      }

      if (product.stock < requested) {
        await session.abortTransaction();
        throw new Error(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${requested}`
        );
      }
    }

    const updates = [];
    for (const item of items) {
      const id = item.productId?.toString?.() ?? item.productId;
      const requested = Number(item.quantity) || 0;

      const result = await Product.findByIdAndUpdate(
        id,
        { $inc: { stock: -requested } },
        { new: true, session }
      ).lean();

      if (result) {
        updates.push({ productId: result._id, newStock: result.stock });
      }
    }

    await session.commitTransaction();
    return updates;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
}

async function setStock(productId, newStock) {
  const num = Number(newStock);
  if (num < 0) {
    throw new Error('Stock cannot be negative');
  }

  const product = await Product.findByIdAndUpdate(
    productId,
    { stock: num },
    { new: true }
  ).lean();

  if (!product) return null;

  return { productId: product._id, newStock: product.stock };
}

export {
  adjustStock,
  reserveAndDeduct,
  setStock
}
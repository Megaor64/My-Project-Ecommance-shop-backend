import Product from "../models/productSchema.js";
import { uploadToCloudinary, deleteFromCloudinary } from "./cloudinary.service.js";

const allowedUpdateFields = [
  "name",
  "description",
  "price",
  "category",
  "stock",
  "isActive",
  "imageUrl",
  "imagePublicId",
];

function pickAllowedFields(body) {
  const data = {};
  for (const key of allowedUpdateFields) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  return data;
}

export async function createProduct(body, fileBuffer) {
  const data = pickAllowedFields(body);
  if (fileBuffer) {
    const result = await uploadToCloudinary(fileBuffer, "products");
    data.imageUrl = result.secure_url;
    data.imagePublicId = result.public_id;
  }
  if (data.isActive === undefined) data.isActive = true;
  if (data.stock === undefined) data.stock = 0;
  if (data.description === undefined) data.description = "";
  if (data.category === undefined) data.category = "";
  return Product.create(data);
}

export async function listActiveProducts() {
  return Product.find({ isActive: true }).sort({ createdAt: -1 });
}

export async function getProductById(id) {
  return Product.findById(id);
}

export async function updateProduct(id, body, fileBuffer) {
  const existing = await Product.findById(id);
  if (!existing) return null;

  const data = pickAllowedFields(body);
  if (fileBuffer) {
    const result = await uploadToCloudinary(fileBuffer, "products");
    data.imageUrl = result.secure_url;
    data.imagePublicId = result.public_id;
    if (existing.imagePublicId) {
      await deleteFromCloudinary(existing.imagePublicId);
    }
  }

  return Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

export async function deleteProduct(id) {
  const product = await Product.findById(id);
  if (product?.imagePublicId) {
    await deleteFromCloudinary(product.imagePublicId);
  }
  return Product.findByIdAndDelete(id);
}

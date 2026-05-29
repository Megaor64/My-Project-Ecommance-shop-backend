import Joi from "joi";
import { mongooseIdParamSchema } from "./user.schemas.js";

// productIdParamsSchema - for /products/:id
export const productIdParamsSchema = mongooseIdParamSchema;

// createProductBodySchema - for POST /products
export const createProductBodySchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow("").optional(),
  price: Joi.number().min(0).required(),
  category: Joi.string().allow("").max(200).optional(),
  stock: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
}).options({ stripUnknown: true });

// updateProductBodySchema - for PATCH /products/:id
export const updateProductBodySchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  description: Joi.string().allow("").optional(),
  price: Joi.number().min(0).optional(),
  category: Joi.string().allow("").max(200).optional(),
  stock: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
  imageUrl: Joi.string().uri().allow("").optional(),
  imagePublicId: Joi.string().allow(null, "").optional(),
}).options({ stripUnknown: true });


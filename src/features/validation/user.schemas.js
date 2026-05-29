import Joi from "joi";

// mongooseIdParamSchema - reusable for MongoDB ObjectId validation
export const mongooseIdParamSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
}).options({ stripUnknown: true });

// getUserByIdParamsSchema - for GET /users/:id
export const getUserByIdParamsSchema = mongooseIdParamSchema;

// updateUserBodySchema - for PATCH /users/:id (only allowed fields)
export const updateUserBodySchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(8).optional(),
}).options({ stripUnknown: true });

// getUsersQuerySchema - optional, for future GET /users query params
export const getUsersQuerySchema = Joi.object({}).options({ stripUnknown: true });

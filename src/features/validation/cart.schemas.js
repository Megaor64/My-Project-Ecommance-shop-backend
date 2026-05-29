import Joi from "joi";

const mongooseObjectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

// cartUserIdParamsSchema - for /cart/:id (even if you use req.user.id, route has :id)
export const cartUserIdParamsSchema = Joi.object({
  id: mongooseObjectId.required(),
}).options({ stripUnknown: true });

// cartItemProductIdParamsSchema - for DELETE /cart/:id/items/:productId
export const cartItemProductIdParamsSchema = Joi.object({
  id: mongooseObjectId.required(),
  productId: mongooseObjectId.required(),
}).options({ stripUnknown: true });

const cartItemBodySchema = Joi.object({
  productId: mongooseObjectId.required(),
  quantity: Joi.number().integer().min(1).required(),
}).options({ stripUnknown: true });

// addItemBodySchema - for POST /cart/:id
export const addItemBodySchema = cartItemBodySchema;

// updateItemBodySchema - for PATCH /cart/:id
export const updateItemBodySchema = cartItemBodySchema;

// syncCartBodySchema - for POST /cart/:id/sync
export const syncCartBodySchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: mongooseObjectId.required(),
        quantity: Joi.number().integer().min(1).required(),
      }).options({ stripUnknown: true })
    )
    .default([]),
}).options({ stripUnknown: true });


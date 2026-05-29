import Joi from "joi";

const cardNumberSchema = Joi.string()
  .trim()
  .required()
  .custom((value, helpers) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19) {
      return helpers.error("any.invalid");
    }
    return digits;
  }, "card number digits");

const expirationSchema = Joi.string()
  .trim()
  .pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)
  .required()
  .messages({
    "string.pattern.base": "Expiration must be in MM/YY format",
  });

export const createOrderBodySchema = Joi.object({
  shippingAddress: Joi.object({
    street: Joi.string().trim().min(1).required(),
    city: Joi.string().trim().min(1).required(),
    zip: Joi.string().trim().min(1).required(),
    country: Joi.string().trim().min(1).required(),
  })
    .required()
    .options({ stripUnknown: true }),
  paymentMethod: Joi.object({
    cardholderName: Joi.string().trim().min(2).max(100).required(),
    cardNumber: cardNumberSchema,
    expiration: expirationSchema,
    cvv: Joi.string()
      .trim()
      .pattern(/^\d{3,4}$/)
      .required()
      .messages({
        "string.pattern.base": "CVV must be 3 or 4 digits",
      }),
  })
    .required()
    .options({ stripUnknown: true }),
}).options({ stripUnknown: true });


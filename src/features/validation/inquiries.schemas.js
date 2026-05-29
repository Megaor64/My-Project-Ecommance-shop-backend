import Joi from "joi";

export const createInquirySchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().required(),
  subject: Joi.string().min(1).max(200).required(),
  message: Joi.string().min(1).max(5000).required(),
});

export const updateInquirySchema = Joi.object({
  status: Joi.string().valid("new", "read", "replied"),
  reply: Joi.string().min(1).max(5000),
}).min(1);

export const inquiryIdParamsSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

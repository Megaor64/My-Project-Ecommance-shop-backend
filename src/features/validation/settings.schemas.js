import Joi from "joi";
import { mongooseIdParamSchema } from "./user.schemas.js";

export const settingsUserIdParamsSchema = mongooseIdParamSchema;

export const appearanceSchema = Joi.object({
  theme: Joi.string().valid("light", "dark", "system").required(),
  language: Joi.string().valid("he", "en", "ar").required(),
  fontSize: Joi.string().valid("small", "medium", "large").required(),
  compactMode: Joi.boolean().required(),
  currency: Joi.string().min(1).max(10).required(),
}).options({ stripUnknown: true });

const emailNotificationsSchema = Joi.object({
  orderUpdates: Joi.boolean().required(),
  marketing: Joi.boolean().required(),
  newsletter: Joi.boolean().required(),
}).options({ stripUnknown: true });

const browserNotificationsSchema = Joi.object({
  orderUpdates: Joi.boolean().required(),
  promotions: Joi.boolean().required(),
}).options({ stripUnknown: true });

const smsNotificationsSchema = Joi.object({
  orderUpdates: Joi.boolean().required(),
  promotions: Joi.boolean().required(),
  phone: Joi.string().allow("").max(30).required(),
}).options({ stripUnknown: true });

export const notificationsSchema = Joi.object({
  email: emailNotificationsSchema.required(),
  browser: browserNotificationsSchema.required(),
  sms: smsNotificationsSchema.required(),
}).options({ stripUnknown: true });

export const permissionsSchema = Joi.object({
  canSell: Joi.boolean().optional(),
  canManageUsers: Joi.boolean().optional(),
  canManageProducts: Joi.boolean().optional(),
  canViewAnalytics: Joi.boolean().optional(),
  canExportData: Joi.boolean().optional(),
  twoFactorEnabled: Joi.boolean().optional(),
})
  .min(1)
  .options({ stripUnknown: true });

export const updateRoleBodySchema = Joi.object({
  role: Joi.string().valid("customer", "admin").required(),
}).options({ stripUnknown: true });

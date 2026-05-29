import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
}).options({ stripUnknown: true });

export const adminRegisterSchema = registerSchema;

export const verifySchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).pattern(/^\d+$/).required(),
}).options({ stripUnknown: true });

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).options({ stripUnknown: true });

export const adminLoginStep1Schema = loginSchema;
export const adminLoginStep2Schema = verifySchema;

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
}).options({ stripUnknown: true });

export const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required(),
}).options({ stripUnknown: true });

export const resetPasswordSchema = Joi.object({
  token: Joi.string().min(10).required(),
  newPassword: Joi.string().min(8).required(),
}).options({ stripUnknown: true });

export const logoutSchema = Joi.object({
  token: Joi.string().min(10).required(),
}).options({ stripUnknown: true });

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().min(10).required(),
}).options({ stripUnknown: true });

export const googleAuthBodySchema = Joi.object({
  idToken: Joi.string().min(10).required(),
  intent: Joi.string()
    .valid("customer", "admin-login", "admin-register")
    .required(),
  adminPass: Joi.string().when("intent", {
    is: "admin-register",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
}).options({ stripUnknown: true });

/**
 * validateRequest(schema, property)

 * Validates req[property] against the given Joi schema.
 * @param {import('joi').ObjectSchema} schema - Joi schema to validate against
 * @param {"body"|"query"|"params"} property - property of req to validate

 * On success: assigns validated value to req[property] and calls next()
 * On failure: returns 400 with { success, message, errors } format
 */
export function validateRequest(schema, property) {
  return async (req, res, next) => {
    try {
      const value = req[property];
      const validated = await schema.validateAsync(value, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });
      req[property] = validated;
      next();
    } catch (error) {
      if (error.details && Array.isArray(error.details)) {
        const errors = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        }));
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors,
        });
      }
      next(error);
    }
  };
}

/**
 * ייצוא מרכזי של כל סכמות הולידציה
 */

export {
    registerSchema,
    verifySchema,
    loginSchema,
    adminRegisterSchema,
    adminLoginStep1Schema,
    adminLoginStep2Schema,
    forgotPasswordSchema,
    resetPasswordSchema,
    logoutSchema
} from "./auth.schemas.js"

export {
    getUserByIdParamsSchema,
    updateUserBodySchema,
    getUsersQuerySchema
} from "./user.schemas.js"

export {
    productIdParamsSchema,
    createProductBodySchema,
    updateProductBodySchema
} from "./products.schemas.js"

export {
    cartUserIdParamsSchema,
    cartItemProductIdParamsSchema,
    addItemBodySchema,
    updateItemBodySchema,
    syncCartBodySchema
} from "./cart.schemas.js"

export {
    createOrderBodySchema
} from "./orders.schemas.js"

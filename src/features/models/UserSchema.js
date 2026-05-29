import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    zip: { type: String, default: "", trim: true },
    country: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function requiredPassword() {
        return this.authProvider === "local" && !this.googleId;
      },
    },
    googleId: { type: String, unique: true, sparse: true },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    resetPasswordToken: { type: String, default: null },
    resetPasswordTokenExpiry: { type: Date, default: null },
    address: { type: addressSchema, default: () => ({}) },
    cart: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret.password;
    delete ret.verificationCode;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordTokenExpiry;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);
export default User;

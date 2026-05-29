import mongoose from "mongoose";

const appearanceSchema = new mongoose.Schema(
  {
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    language: {
      type: String,
      enum: ["he", "en", "ar"],
      default: "en",
    },
    fontSize: {
      type: String,
      enum: ["small", "medium", "large"],
      default: "medium",
    },
    compactMode: { type: Boolean, default: false },
    currency: { type: String, default: "USD" },
  },
  { _id: false }
);

const emailNotificationsSchema = new mongoose.Schema(
  {
    orderUpdates: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
    newsletter: { type: Boolean, default: false },
  },
  { _id: false }
);

const browserNotificationsSchema = new mongoose.Schema(
  {
    orderUpdates: { type: Boolean, default: true },
    promotions: { type: Boolean, default: false },
  },
  { _id: false }
);

const smsNotificationsSchema = new mongoose.Schema(
  {
    orderUpdates: { type: Boolean, default: false },
    promotions: { type: Boolean, default: false },
    phone: { type: String, default: "" },
  },
  { _id: false }
);

const notificationsSchema = new mongoose.Schema(
  {
    email: { type: emailNotificationsSchema, default: () => ({}) },
    browser: { type: browserNotificationsSchema, default: () => ({}) },
    sms: { type: smsNotificationsSchema, default: () => ({}) },
  },
  { _id: false }
);

const permissionsSchema = new mongoose.Schema(
  {
    canSell: { type: Boolean, default: false },
    canManageUsers: { type: Boolean, default: false },
    canManageProducts: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: false },
    canExportData: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    appearance: { type: appearanceSchema, default: () => ({}) },
    notifications: { type: notificationsSchema, default: () => ({}) },
    permissions: { type: permissionsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

const UserSettings = mongoose.model("UserSettings", userSettingsSchema);
export default UserSettings;

import User from "../models/UserSchema.js";
import UserSettings from "../models/UserSettingsSchema.js";

export function permissionsForRole(role) {
  if (role === "admin") {
    return {
      canSell: true,
      canManageUsers: true,
      canManageProducts: true,
      canViewAnalytics: true,
      canExportData: true,
      twoFactorEnabled: false,
    };
  }
  return {
    canSell: false,
    canManageUsers: false,
    canManageProducts: false,
    canViewAnalytics: false,
    canExportData: false,
    twoFactorEnabled: false,
  };
}

function defaultAppearance() {
  return {
    theme: "system",
    language: "en",
    fontSize: "medium",
    compactMode: false,
    currency: "USD",
  };
}

function defaultNotifications() {
  return {
    email: { orderUpdates: true, marketing: false, newsletter: false },
    browser: { orderUpdates: true, promotions: false },
    sms: { orderUpdates: false, promotions: false, phone: "" },
  };
}

export async function ensureSettings(userId, role = "customer") {
  const permissions = permissionsForRole(role);
  return UserSettings.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
        appearance: defaultAppearance(),
        notifications: defaultNotifications(),
        permissions,
      },
    },
    { upsert: true, new: true, runValidators: true }
  );
}

export async function getSettings(userId, role = "customer") {
  let doc = await UserSettings.findOne({ userId });
  if (!doc) {
    doc = await ensureSettings(userId, role);
  }
  return doc;
}

export async function updateAppearance(userId, appearance) {
  await ensureSettings(userId);
  return UserSettings.findOneAndUpdate(
    { userId },
    { $set: { appearance } },
    { new: true, runValidators: true }
  );
}

export async function updateNotifications(userId, notifications) {
  await ensureSettings(userId);
  return UserSettings.findOneAndUpdate(
    { userId },
    { $set: { notifications } },
    { new: true, runValidators: true }
  );
}

export async function updatePermissions(userId, permissionsPatch) {
  await ensureSettings(userId);
  const setFields = {};
  for (const [key, value] of Object.entries(permissionsPatch)) {
    if (value !== undefined) {
      setFields[`permissions.${key}`] = value;
    }
  }
  return UserSettings.findOneAndUpdate(
    { userId },
    { $set: setFields },
    { new: true, runValidators: true }
  );
}

export async function updateUserRole(userId, role) {
  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  ).select("-password -verificationCode -resetPasswordToken -resetPasswordTokenExpiry");

  if (!user) return null;

  const permissions = permissionsForRole(role);
  await UserSettings.findOneAndUpdate(
    { userId },
    {
      $set: { permissions },
      $setOnInsert: {
        userId,
        appearance: defaultAppearance(),
        notifications: defaultNotifications(),
      },
    },
    { upsert: true, new: true, runValidators: true }
  );

  return user;
}

export async function deleteSettingsForUser(userId) {
  await UserSettings.deleteOne({ userId });
}

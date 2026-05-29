import bcrypt from "bcrypt";
import User from "../models/UserSchema.js";
import {
  deleteSettingsForUser,
  permissionsForRole,
} from "./settings.service.js";
import UserSettings from "../models/UserSettingsSchema.js";

const safeFields = "-password -verificationCode -resetPasswordToken -resetPasswordTokenExpiry";

export async function getAllUsers() {
  const users = await User.find().select(safeFields).lean();
  const ids = users.map((u) => u._id);
  const settingsList = await UserSettings.find({ userId: { $in: ids } }).lean();
  const settingsByUser = new Map(
    settingsList.map((s) => [String(s.userId), s.permissions])
  );

  return users.map((user) => ({
    ...user,
    permissions:
      settingsByUser.get(String(user._id)) ?? permissionsForRole(user.role),
  }));
}

export async function getUserById(id) {
  return User.findById(id).select(safeFields);
}

export async function updateUser(id, { name, email, password }) {
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (password !== undefined) {
    updates.password = await bcrypt.hash(password, 10);
  }
  return User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).select(safeFields);
}

export async function deleteUser(id) {
  const user = await User.findById(id);
  if (!user) return null;
  await Promise.all([User.findByIdAndDelete(id), deleteSettingsForUser(id)]);
  return user;
}

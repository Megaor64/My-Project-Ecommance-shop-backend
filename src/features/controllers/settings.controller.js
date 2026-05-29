import * as settingsService from "../service/settings.service.js";
import User from "../models/UserSchema.js";

const getSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("role");
    const role = user?.role ?? "customer";
    const settings = await settingsService.getSettings(req.params.id, role);
    res.status(200).json({
      status: 200,
      message: "Settings retrieved",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

const patchAppearance = async (req, res, next) => {
  try {
    const settings = await settingsService.updateAppearance(
      req.params.id,
      req.body
    );
    res.status(200).json({
      status: 200,
      message: "Appearance updated",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

const patchNotifications = async (req, res, next) => {
  try {
    const settings = await settingsService.updateNotifications(
      req.params.id,
      req.body
    );
    res.status(200).json({
      status: 200,
      message: "Notifications updated",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

const patchPermissions = async (req, res, next) => {
  try {
    const settings = await settingsService.updatePermissions(
      req.params.id,
      req.body
    );
    res.status(200).json({
      status: 200,
      message: "Permissions updated",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

const patchRole = async (req, res, next) => {
  try {
    const user = await settingsService.updateUserRole(
      req.params.id,
      req.body.role
    );
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: null,
      });
    }
    const settings = await settingsService.getSettings(req.params.id, user.role);
    res.status(200).json({
      status: 200,
      message: "Role updated",
      data: { user, settings },
    });
  } catch (error) {
    next(error);
  }
};

export {
  getSettings,
  patchAppearance,
  patchNotifications,
  patchPermissions,
  patchRole as updateUserRole,
};

import User from "../../features/models/UserSchema.js";

export const adminCheck = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("role");
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: "User not found",
        data: null,
      });
    }
    if (user.role !== "admin") {
      return res.status(403).json({
        status: 403,
        message: "Admin only",
        data: null,
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

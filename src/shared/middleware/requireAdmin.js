export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      status: 403,
      message: "Admin access required",
      data: null,
    });
  }
  next();
};

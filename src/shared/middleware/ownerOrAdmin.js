import { adminCheck } from "./adminMiddlware.js";

export const ownerOrAdmin = (req, res, next) => {
  if (String(req.user.id) === String(req.params.id)) {
    return next();
  }
  return adminCheck(req, res, next);
};

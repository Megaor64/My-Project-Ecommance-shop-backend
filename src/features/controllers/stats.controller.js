import { getAdminStats } from "../service/stats.service.js";
import { success } from "../../shared/utils/apiResponse.utils.js";

export async function getAdminStatsHandler(req, res, next) {
  try {
    const stats = await getAdminStats();
    return success(res, stats, "Admin stats retrieved");
  } catch (err) {
    next(err);
  }
}

import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { StatsControllers } from "./stats.controller";

const router = Router();
const { admin, super_admin, recruiter } = UserRole;

router.get("/overview", checkAuth(admin, super_admin), StatsControllers.getOverviewStats);
router.get("/earnings", checkAuth(admin, super_admin), StatsControllers.getEarningsStats);
router.get("/recruiter", checkAuth(recruiter), StatsControllers.getRecruiterDashboard);

export const StatsRoutes = router;

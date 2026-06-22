import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { ReportControllers } from "./report.controller";

const router = Router();
const allRoles = Object.values(UserRole) as string[];
const { admin, super_admin } = UserRole;

router.post("/", checkAuth(...allRoles), ReportControllers.createReport);
router.get("/", checkAuth(admin, super_admin), ReportControllers.getAllReports);
router.patch("/:id/status", checkAuth(admin, super_admin), ReportControllers.updateReportStatus);

export const ReportRoutes = router;

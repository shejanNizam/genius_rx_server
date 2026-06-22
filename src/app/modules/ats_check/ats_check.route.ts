import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { AtsCheckControllers } from "./ats_check.controller";

const router = Router();

router.post("/", checkAuth(UserRole.job_seeker), AtsCheckControllers.createCheck);
router.get("/my", checkAuth(UserRole.job_seeker), AtsCheckControllers.getMyChecks);
router.get("/:id", checkAuth(UserRole.job_seeker), AtsCheckControllers.getCheckById);

export const AtsCheckRoutes = router;

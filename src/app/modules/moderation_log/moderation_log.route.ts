import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { ModerationLogControllers } from "./moderation_log.controller";

const router = Router();
const { admin, super_admin } = UserRole;

router.post("/", checkAuth(admin, super_admin), ModerationLogControllers.createLog);
router.get("/", checkAuth(admin, super_admin), ModerationLogControllers.getLogs);

export const ModerationLogRoutes = router;

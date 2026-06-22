import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { DeviceTokenControllers } from "./device_token.controller";

const router = Router();
const allRoles = Object.values(UserRole) as string[];

router.post("/", checkAuth(...allRoles), DeviceTokenControllers.upsertToken);
router.delete("/", checkAuth(...allRoles), DeviceTokenControllers.removeToken);

export const DeviceTokenRoutes = router;

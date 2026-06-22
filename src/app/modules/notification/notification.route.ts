import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { NotificationControllers } from "./notification.controller";

const router = Router();
const allRoles = Object.values(UserRole) as string[];

router.get("/", checkAuth(...allRoles), NotificationControllers.getMyNotifications);
router.patch("/mark-all-read", checkAuth(...allRoles), NotificationControllers.markAllRead);
router.patch("/:id/read", checkAuth(...allRoles), NotificationControllers.markOneRead);
router.delete("/:id", checkAuth(...allRoles), NotificationControllers.deleteNotification);

export const NotificationRoutes = router;

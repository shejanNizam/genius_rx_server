import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { SubscriptionControllers } from "./subscription.controller";

const router = Router();
const allRoles = Object.values(UserRole) as string[];

router.post("/trial", checkAuth(...allRoles), SubscriptionControllers.startTrial);
router.post("/", checkAuth(...allRoles), SubscriptionControllers.subscribe);
router.get("/my", checkAuth(...allRoles), SubscriptionControllers.getMySubscription);
router.get("/history", checkAuth(...allRoles), SubscriptionControllers.getSubscriptionHistory);
router.patch("/cancel", checkAuth(...allRoles), SubscriptionControllers.cancelSubscription);

export const SubscriptionRoutes = router;

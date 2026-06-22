import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { SubscriptionPlanControllers } from "./subscription_plan.controller";

const router = Router();
const { admin, super_admin } = UserRole;

router.get("/", SubscriptionPlanControllers.getActivePlans);
router.get("/all", checkAuth(admin, super_admin), SubscriptionPlanControllers.getAllPlans);
router.post("/", checkAuth(admin, super_admin), SubscriptionPlanControllers.createPlan);
router.patch("/:id", checkAuth(admin, super_admin), SubscriptionPlanControllers.updatePlan);
router.delete("/:id", checkAuth(super_admin), SubscriptionPlanControllers.deletePlan);

export const SubscriptionPlanRoutes = router;

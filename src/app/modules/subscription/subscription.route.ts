import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { SubscriptionControllers } from "./subscription.controller";

const router = Router();
const allRoles = Object.values(UserRole) as string[];
const { admin, super_admin } = UserRole;

// Stripe webhook body is already parsed as a raw Buffer by the app-level
// express.raw() middleware mounted on this exact path in app.ts (must run
// before express.json()). Do not add another body parser here.
router.post("/webhook", SubscriptionControllers.stripeWebhook);

router.post("/trial", checkAuth(...allRoles), SubscriptionControllers.startTrial);
router.post("/checkout", checkAuth(...allRoles), SubscriptionControllers.createCheckoutSession);
router.post("/portal", checkAuth(...allRoles), SubscriptionControllers.createBillingPortalSession);
// Manual/offline activation, bypassing Stripe — for admin backfills and testing only.
router.post("/", checkAuth(admin, super_admin), SubscriptionControllers.subscribe);
router.get("/my", checkAuth(...allRoles), SubscriptionControllers.getMySubscription);
router.get("/history", checkAuth(...allRoles), SubscriptionControllers.getSubscriptionHistory);
router.patch("/cancel", checkAuth(...allRoles), SubscriptionControllers.cancelSubscription);
router.patch("/reactivate", checkAuth(...allRoles), SubscriptionControllers.reactivateSubscription);

export const SubscriptionRoutes = router;

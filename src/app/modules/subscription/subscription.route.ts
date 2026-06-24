import express, { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { SubscriptionControllers } from "./subscription.controller";

const router = Router();
const allRoles = Object.values(UserRole) as string[];

// Stripe webhook — must receive raw body before express.json() parses it
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  SubscriptionControllers.stripeWebhook,
);

router.post("/trial", checkAuth(...allRoles), SubscriptionControllers.startTrial);
router.post("/checkout", checkAuth(...allRoles), SubscriptionControllers.createCheckoutSession);
router.post("/", checkAuth(...allRoles), SubscriptionControllers.subscribe);
router.get("/my", checkAuth(...allRoles), SubscriptionControllers.getMySubscription);
router.get("/history", checkAuth(...allRoles), SubscriptionControllers.getSubscriptionHistory);
router.patch("/cancel", checkAuth(...allRoles), SubscriptionControllers.cancelSubscription);

export const SubscriptionRoutes = router;

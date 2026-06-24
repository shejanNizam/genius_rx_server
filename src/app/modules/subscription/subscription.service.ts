import httpStatus from "http-status";
import Stripe from "stripe";
import { configs } from "../../config";
import AppError from "../../errorHelpers/AppError";
import { AccessStatus } from "../user/user.interface";
import { User } from "../user/user.model";
import { SubscriptionPlan } from "../subscription_plan/subscription_plan.model";
import { Transaction } from "../transaction/transaction.model";
import { ISubscription } from "./subscription.interface";
import { Subscription } from "./subscription.model";

const stripe = new Stripe(configs.STRIPE.stripe_secret_key);

const startTrial = async (userId: string) => {
  const existing = await Subscription.findOne({ userId, status: "trialing" });
  if (existing) throw new AppError(httpStatus.CONFLICT, "Trial already started");

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  const subscription = await Subscription.create({
    userId,
    status: "trialing",
    startDate,
    endDate,
    autoRenew: false,
  });

  await User.findByIdAndUpdate(userId, {
    accessStatus: AccessStatus.trial,
    currentSubscriptionId: subscription._id,
  });

  return subscription;
};

const createCheckoutSession = async (userId: string, planId: string) => {
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) throw new AppError(httpStatus.NOT_FOUND, "Subscription plan not found");
  if (!plan.isActive) throw new AppError(httpStatus.BAD_REQUEST, "This plan is no longer available");

  const priceInCents = Math.round(Number(plan.price.toString()) * 100);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: plan.currency.toLowerCase(),
          product_data: {
            name: plan.name,
            description: plan.features?.join(", ") || undefined,
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      planId: planId.toString(),
    },
    success_url: `${configs.frontend_url}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${configs.frontend_url}/subscription/cancel`,
  });

  return { url: session.url, sessionId: session.id };
};

const handleWebhook = async (rawBody: Buffer, signature: string) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      configs.STRIPE.stripe_webhook_secret,
    );
  } catch {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid webhook signature");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, planId } = session.metadata as { userId: string; planId: string };

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) return;

    const startDate = new Date();
    const endDate = new Date(startDate);
    const months = (plan.billingInterval === "year" ? 12 : 1) * (plan.intervalCount || 1);
    endDate.setMonth(endDate.getMonth() + months);

    const subscription = await Subscription.create({
      userId,
      planId,
      status: "active",
      billingInterval: plan.billingInterval,
      intervalCount: plan.intervalCount,
      priceAtPurchase: plan.price,
      currency: plan.currency,
      startDate,
      endDate,
      autoRenew: false,
      stripeSessionId: session.id,
    });

    await Transaction.create({
      userId,
      subscriptionId: subscription._id,
      amount: plan.price,
      currency: plan.currency,
      gateway: "stripe",
      gatewayRef: session.payment_intent as string,
      type: "subscription",
      status: "success",
    });

    await User.findByIdAndUpdate(userId, {
      accessStatus: AccessStatus.subscribed,
      currentSubscriptionId: subscription._id,
    });
  }
};

const subscribe = async (userId: string, payload: Partial<ISubscription>) => {
  const startDate = new Date();
  const endDate = new Date(startDate);

  const months = (payload.billingInterval === "year" ? 12 : 1) * (payload.intervalCount || 1);
  endDate.setMonth(endDate.getMonth() + months);

  const subscription = await Subscription.create({
    ...payload,
    userId,
    status: "active",
    startDate,
    endDate,
  });

  await User.findByIdAndUpdate(userId, {
    accessStatus: AccessStatus.subscribed,
    currentSubscriptionId: subscription._id,
  });

  return subscription;
};

const getMySubscription = async (userId: string) => {
  return Subscription.findOne({ userId, status: { $in: ["trialing", "active"] } })
    .populate("planId")
    .sort({ createdAt: -1 });
};

const getSubscriptionHistory = async (userId: string) => {
  return Subscription.find({ userId }).populate("planId").sort({ createdAt: -1 });
};

const cancelSubscription = async (userId: string) => {
  const sub = await Subscription.findOneAndUpdate(
    { userId, status: { $in: ["trialing", "active"] } },
    { status: "cancelled", autoRenew: false },
    { new: true },
  );
  if (!sub) throw new AppError(httpStatus.NOT_FOUND, "Active subscription not found");

  await User.findByIdAndUpdate(userId, { accessStatus: AccessStatus.locked });
  return sub;
};

export const SubscriptionServices = {
  startTrial,
  createCheckoutSession,
  handleWebhook,
  subscribe,
  getMySubscription,
  getSubscriptionHistory,
  cancelSubscription,
};

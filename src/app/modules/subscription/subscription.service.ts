import httpStatus from "http-status";
import Stripe from "stripe";
import { configs } from "../../config";
import AppError from "../../errorHelpers/AppError";
import { stripe } from "../../utils/stripe";
import { AccessStatus } from "../user/user.interface";
import { User } from "../user/user.model";
import { SubscriptionPlan } from "../subscription_plan/subscription_plan.model";
import { Transaction } from "../transaction/transaction.model";
import { ISubscription, SubscriptionStatus } from "./subscription.interface";
import { Subscription } from "./subscription.model";
import { StripeEvent } from "./stripeEvent.model";

const mapStripeStatus = (status: Stripe.Subscription["status"]): SubscriptionStatus => {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
    case "unpaid":
    case "incomplete":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
    case "paused":
      return "cancelled";
    default:
      return "active";
  }
};

const getInvoiceSubscriptionId = (invoice: Stripe.Invoice): string | undefined => {
  const sub = invoice.parent?.subscription_details?.subscription;
  return typeof sub === "string" ? sub : sub?.id;
};

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

const getOrCreateStripeCustomer = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId },
  });

  user.stripeCustomerId = customer.id;
  await user.save();

  return customer.id;
};

const createCheckoutSession = async (userId: string, planId: string) => {
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) throw new AppError(httpStatus.NOT_FOUND, "Subscription plan not found");
  if (!plan.isActive) throw new AppError(httpStatus.BAD_REQUEST, "This plan is no longer available");
  if (!plan.stripePriceId) {
    throw new AppError(httpStatus.BAD_REQUEST, "This plan is not configured for Stripe billing yet");
  }

  const customerId = await getOrCreateStripeCustomer(userId);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    subscription_data: {
      metadata: { userId, planId: planId.toString() },
    },
    metadata: { userId, planId: planId.toString() },
    success_url: `${configs.frontend_url}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${configs.frontend_url}/subscription/cancel`,
  });

  return { url: session.url, sessionId: session.id };
};

const createBillingPortalSession = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user?.stripeCustomerId) {
    throw new AppError(httpStatus.BAD_REQUEST, "No Stripe customer found for this user yet");
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${configs.frontend_url}/account`,
  });

  return { url: portalSession.url };
};

/** Recorded once per Stripe event id so retried webhook deliveries don't double-process. */
const claimWebhookEvent = async (event: Stripe.Event) => {
  try {
    await StripeEvent.create({ eventId: event.id, type: event.type });
    return true;
  } catch {
    return false;
  }
};

const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {
  if (session.mode !== "subscription" || !session.subscription) return;

  const { userId, planId } = (session.metadata ?? {}) as { userId?: string; planId?: string };
  if (!userId || !planId) return;

  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) return;

  const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string);
  const item = stripeSubscription.items.data[0];

  const subscription = await Subscription.create({
    userId,
    planId,
    status: mapStripeStatus(stripeSubscription.status),
    billingInterval: plan.billingInterval,
    intervalCount: plan.intervalCount,
    priceAtPurchase: plan.price,
    currency: plan.currency,
    startDate: new Date(item.current_period_start * 1000),
    endDate: new Date(item.current_period_end * 1000),
    autoRenew: !stripeSubscription.cancel_at_period_end,
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    stripeCustomerId: session.customer as string,
    stripeSubscriptionId: stripeSubscription.id,
    stripeSessionId: session.id,
  });

  await Transaction.create({
    userId,
    subscriptionId: subscription._id,
    amount: plan.price,
    currency: plan.currency,
    gateway: "stripe",
    gatewayRef: (session.invoice as string) || session.id,
    type: "subscription",
    status: "success",
  });

  await User.findByIdAndUpdate(userId, {
    accessStatus: AccessStatus.subscribed,
    currentSubscriptionId: subscription._id,
  });
};

const handleSubscriptionUpdated = async (stripeSubscription: Stripe.Subscription) => {
  const subscription = await Subscription.findOne({ stripeSubscriptionId: stripeSubscription.id });
  if (!subscription) return;

  const item = stripeSubscription.items.data[0];
  const status = mapStripeStatus(stripeSubscription.status);

  subscription.status = status;
  subscription.endDate = new Date(item.current_period_end * 1000);
  subscription.autoRenew = !stripeSubscription.cancel_at_period_end;
  subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
  await subscription.save();

  const accessStatus = status === "active" || status === "trialing" ? AccessStatus.subscribed : AccessStatus.locked;
  await User.findByIdAndUpdate(subscription.userId, { accessStatus });
};

const handleSubscriptionDeleted = async (stripeSubscription: Stripe.Subscription) => {
  const subscription = await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: stripeSubscription.id },
    { status: "cancelled", autoRenew: false, cancelAtPeriodEnd: false },
    { new: true },
  );
  if (!subscription) return;

  await User.findByIdAndUpdate(subscription.userId, { accessStatus: AccessStatus.locked });
};

const handleInvoicePaid = async (invoice: Stripe.Invoice) => {
  // The initial invoice for a new subscription is already handled by checkout.session.completed.
  if (invoice.billing_reason === "subscription_create") return;

  const stripeSubscriptionId = getInvoiceSubscriptionId(invoice);
  if (!stripeSubscriptionId) return;

  const subscription = await Subscription.findOne({ stripeSubscriptionId });
  if (!subscription) return;

  const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const item = stripeSubscription.items.data[0];

  subscription.status = "active";
  subscription.startDate = new Date(item.current_period_start * 1000);
  subscription.endDate = new Date(item.current_period_end * 1000);
  await subscription.save();

  await Transaction.create({
    userId: subscription.userId,
    subscriptionId: subscription._id,
    amount: subscription.priceAtPurchase,
    currency: subscription.currency,
    gateway: "stripe",
    gatewayRef: invoice.id,
    type: "renewal",
    status: "success",
  });

  await User.findByIdAndUpdate(subscription.userId, { accessStatus: AccessStatus.subscribed });
};

const handleInvoicePaymentFailed = async (invoice: Stripe.Invoice) => {
  const stripeSubscriptionId = getInvoiceSubscriptionId(invoice);
  if (!stripeSubscriptionId) return;

  const subscription = await Subscription.findOneAndUpdate(
    { stripeSubscriptionId },
    { status: "past_due" },
    { new: true },
  );
  if (!subscription) return;

  await Transaction.create({
    userId: subscription.userId,
    subscriptionId: subscription._id,
    amount: subscription.priceAtPurchase,
    currency: subscription.currency,
    gateway: "stripe",
    gatewayRef: invoice.id,
    type: "renewal",
    status: "failed",
  });
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

  const isNewEvent = await claimWebhookEvent(event);
  if (!isNewEvent) return;

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case "invoice.paid":
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    default:
      break;
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
  return Subscription.findOne({ userId, status: { $in: ["trialing", "active", "past_due"] } })
    .populate("planId")
    .sort({ createdAt: -1 });
};

const getSubscriptionHistory = async (userId: string) => {
  return Subscription.find({ userId }).populate("planId").sort({ createdAt: -1 });
};

const cancelSubscription = async (userId: string) => {
  const sub = await Subscription.findOne({ userId, status: { $in: ["trialing", "active", "past_due"] } });
  if (!sub) throw new AppError(httpStatus.NOT_FOUND, "Active subscription not found");

  if (sub.stripeSubscriptionId) {
    await stripe.subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: true });
    sub.cancelAtPeriodEnd = true;
    sub.autoRenew = false;
    await sub.save();
  } else {
    // Trial or manually-created subscription with no Stripe counterpart — cancel immediately.
    sub.status = "cancelled";
    sub.autoRenew = false;
    await sub.save();
    await User.findByIdAndUpdate(userId, { accessStatus: AccessStatus.locked });
  }

  return sub;
};

const reactivateSubscription = async (userId: string) => {
  const sub = await Subscription.findOne({ userId, status: { $in: ["active", "past_due"] }, cancelAtPeriodEnd: true });
  if (!sub?.stripeSubscriptionId) {
    throw new AppError(httpStatus.NOT_FOUND, "No scheduled cancellation found to reverse");
  }

  await stripe.subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: false });
  sub.cancelAtPeriodEnd = false;
  sub.autoRenew = true;
  await sub.save();

  return sub;
};

export const SubscriptionServices = {
  startTrial,
  createCheckoutSession,
  createBillingPortalSession,
  handleWebhook,
  subscribe,
  getMySubscription,
  getSubscriptionHistory,
  cancelSubscription,
  reactivateSubscription,
};

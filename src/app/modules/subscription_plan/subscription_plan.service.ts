import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { stripe } from "../../utils/stripe";
import { ISubscriptionPlan } from "./subscription_plan.interface";
import { SubscriptionPlan } from "./subscription_plan.model";

const createPlan = async (payload: Partial<ISubscriptionPlan>) => {
  const plan = await SubscriptionPlan.create(payload);

  const product = await stripe.products.create({
    name: plan.name,
    metadata: { planId: plan._id.toString(), slug: plan.slug },
  });

  const price = await stripe.prices.create({
    product: product.id,
    currency: plan.currency.toLowerCase(),
    unit_amount: Math.round(Number(plan.price.toString()) * 100),
    recurring: {
      interval: plan.billingInterval,
      interval_count: plan.intervalCount,
    },
    metadata: { planId: plan._id.toString() },
  });

  plan.stripeProductId = product.id;
  plan.stripePriceId = price.id;
  await plan.save();

  return plan;
};

const getActivePlans = async (audience?: string) => {
  const filter: Record<string, unknown> = { isActive: true };
  if (audience) filter.$or = [{ audience }, { audience: "all" }];
  return SubscriptionPlan.find(filter).sort({ sortOrder: 1, price: 1 });
};

const getAllPlans = async () => {
  return SubscriptionPlan.find().sort({ sortOrder: 1 });
};

const updatePlan = async (id: string, payload: Partial<ISubscriptionPlan>) => {
  const existing = await SubscriptionPlan.findById(id);
  if (!existing) throw new AppError(httpStatus.NOT_FOUND, "Plan not found");

  // Stripe Prices are immutable — a change to any price-affecting field requires a new Price object.
  const priceChanged =
    (payload.price !== undefined && payload.price.toString() !== existing.price.toString()) ||
    (payload.currency !== undefined && payload.currency !== existing.currency) ||
    (payload.billingInterval !== undefined && payload.billingInterval !== existing.billingInterval) ||
    (payload.intervalCount !== undefined && payload.intervalCount !== existing.intervalCount);

  if (payload.name && existing.stripeProductId) {
    await stripe.products.update(existing.stripeProductId, { name: payload.name });
  }

  const plan = await SubscriptionPlan.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!plan) throw new AppError(httpStatus.NOT_FOUND, "Plan not found");

  if (priceChanged && plan.stripeProductId) {
    const newPrice = await stripe.prices.create({
      product: plan.stripeProductId,
      currency: plan.currency.toLowerCase(),
      unit_amount: Math.round(Number(plan.price.toString()) * 100),
      recurring: {
        interval: plan.billingInterval,
        interval_count: plan.intervalCount,
      },
      metadata: { planId: plan._id.toString() },
    });

    if (existing.stripePriceId) {
      await stripe.prices.update(existing.stripePriceId, { active: false });
    }

    plan.stripePriceId = newPrice.id;
    await plan.save();
  }

  return plan;
};

const deletePlan = async (id: string) => {
  const plan = await SubscriptionPlan.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!plan) throw new AppError(httpStatus.NOT_FOUND, "Plan not found");

  if (plan.stripePriceId) {
    await stripe.prices.update(plan.stripePriceId, { active: false });
  }

  return plan;
};

export const SubscriptionPlanServices = {
  createPlan,
  getActivePlans,
  getAllPlans,
  updatePlan,
  deletePlan,
};

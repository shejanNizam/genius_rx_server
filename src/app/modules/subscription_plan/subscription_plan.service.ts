import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { ISubscriptionPlan } from "./subscription_plan.interface";
import { SubscriptionPlan } from "./subscription_plan.model";

const createPlan = async (payload: Partial<ISubscriptionPlan>) => {
  return SubscriptionPlan.create(payload);
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
  const plan = await SubscriptionPlan.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!plan) throw new AppError(httpStatus.NOT_FOUND, "Plan not found");
  return plan;
};

const deletePlan = async (id: string) => {
  const plan = await SubscriptionPlan.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!plan) throw new AppError(httpStatus.NOT_FOUND, "Plan not found");
  return plan;
};

export const SubscriptionPlanServices = {
  createPlan,
  getActivePlans,
  getAllPlans,
  updatePlan,
  deletePlan,
};

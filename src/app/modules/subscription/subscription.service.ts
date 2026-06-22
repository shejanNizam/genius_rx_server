import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { AccessStatus } from "../user/user.interface";
import { User } from "../user/user.model";
import { ISubscription } from "./subscription.interface";
import { Subscription } from "./subscription.model";

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
  subscribe,
  getMySubscription,
  getSubscriptionHistory,
  cancelSubscription,
};

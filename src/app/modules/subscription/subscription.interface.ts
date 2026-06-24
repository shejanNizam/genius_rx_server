import { Document, Types } from "mongoose";
import { BillingInterval } from "../subscription_plan/subscription_plan.interface";

export type SubscriptionStatus = "trialing" | "active" | "expired" | "cancelled";

export interface ISubscriptionInitial {
  userId: Types.ObjectId;
  planId?: Types.ObjectId;
  status: SubscriptionStatus;
  billingInterval?: BillingInterval;
  intervalCount?: number;
  priceAtPurchase?: Types.Decimal128;
  currency?: string;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  stripeSessionId?: string;
}

export type ISubscription = ISubscriptionInitial & Document;

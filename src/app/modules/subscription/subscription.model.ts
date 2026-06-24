import { model, Schema } from "mongoose";
import { ISubscription } from "./subscription.interface";

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    planId: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan" },
    status: {
      type: String,
      enum: ["trialing", "active", "expired", "cancelled"],
      default: "trialing",
    },
    billingInterval: { type: String, enum: ["month", "year"] },
    intervalCount: { type: Number },
    priceAtPurchase: { type: Schema.Types.Decimal128 },
    currency: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    autoRenew: { type: Boolean, default: false },
    stripeSessionId: { type: String },
  },
  { timestamps: true, versionKey: false },
);

subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });

export const Subscription = model<ISubscription>(
  "Subscription",
  subscriptionSchema,
);

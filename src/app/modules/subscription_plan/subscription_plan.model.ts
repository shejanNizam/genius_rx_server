import { model, Schema } from "mongoose";
import { ISubscriptionPlan } from "./subscription_plan.interface";

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    audience: {
      type: String,
      enum: ["job_seeker", "recruiter", "instructor", "all"],
      required: true,
    },
    price: { type: Schema.Types.Decimal128, required: true },
    currency: { type: String, default: "USD" },
    billingInterval: { type: String, enum: ["month", "year"], required: true },
    intervalCount: { type: Number, default: 1 },
    features: { type: [String], default: [] },
    jobPostLimit: { type: Number },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

export const SubscriptionPlan = model<ISubscriptionPlan>(
  "SubscriptionPlan",
  subscriptionPlanSchema,
);

import { Document, Types } from "mongoose";

export type BillingInterval = "month" | "year";
export type PlanAudience = "job_seeker" | "recruiter" | "instructor" | "all";

export interface ISubscriptionPlanInitial {
  name: string;
  slug: string;
  audience: PlanAudience;
  price: Types.Decimal128;
  currency: string;
  billingInterval: BillingInterval;
  intervalCount: number;
  features?: string[];
  jobPostLimit?: number;
  isActive: boolean;
  sortOrder?: number;
}

export type ISubscriptionPlan = ISubscriptionPlanInitial & Document;

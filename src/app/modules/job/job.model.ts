import { model, Schema } from "mongoose";
import { IJob } from "./job.interface";

const jobSchema = new Schema<IJob>(
  {
    recruiterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    responsibilities: { type: String },
    requirements: { type: String },
    benefits: { type: String },
    locationType: {
      type: String,
      enum: ["on_site", "remote", "hybrid"],
      required: true,
    },
    jobType: {
      type: String,
      enum: ["full_time", "part_time", "contract"],
      required: true,
    },
    jobLevel: {
      type: String,
      enum: ["entry", "mid", "senior"],
      required: true,
    },
    salary: {
      amount: { type: Number },
      currency: { type: String },
      period: { type: String },
    },
    neededExperience: { type: String },
    skills: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["active", "inactive", "closed"],
      default: "active",
    },
    applicantsCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true, versionKey: false },
);

jobSchema.index({ recruiterId: 1, status: 1 });
jobSchema.index({ title: "text", skills: "text" });

export const Job = model<IJob>("Job", jobSchema);

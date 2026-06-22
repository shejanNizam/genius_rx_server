import { model, Schema } from "mongoose";
import { IApplication } from "./application.interface";

const applicationSchema = new Schema<IApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    seekerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    resumeId: { type: Schema.Types.ObjectId, ref: "Resume", required: true },
    status: {
      type: String,
      enum: ["applied", "viewed", "shortlisted", "selected", "rejected"],
      default: "applied",
    },
    interview: {
      date: Date,
      location: String,
      note: String,
    },
  },
  { timestamps: true, versionKey: false },
);

applicationSchema.index({ jobId: 1, seekerId: 1 }, { unique: true });
applicationSchema.index({ seekerId: 1, status: 1 });
applicationSchema.index({ jobId: 1, status: 1 });

export const Application = model<IApplication>("Application", applicationSchema);

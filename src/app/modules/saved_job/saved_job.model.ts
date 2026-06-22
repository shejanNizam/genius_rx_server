import { model, Schema } from "mongoose";
import { ISavedJob } from "./saved_job.interface";

const savedJobSchema = new Schema<ISavedJob>(
  {
    seekerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
  },
  { timestamps: true, versionKey: false },
);

savedJobSchema.index({ seekerId: 1, jobId: 1 }, { unique: true });

export const SavedJob = model<ISavedJob>("SavedJob", savedJobSchema);

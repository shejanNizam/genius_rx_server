import { model, Schema } from "mongoose";
import { IAtsCheck } from "./ats_check.interface";

const atsCheckSchema = new Schema<IAtsCheck>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    resumeId: { type: Schema.Types.ObjectId, ref: "Resume", required: true },
    score: { type: Number, min: 0, max: 100, required: true },
    issues: [
      {
        section: { type: String, required: true },
        message: { type: String, required: true },
        _id: false,
      },
    ],
  },
  { timestamps: true, versionKey: false },
);

atsCheckSchema.index({ userId: 1 });
atsCheckSchema.index({ resumeId: 1 });

export const AtsCheck = model<IAtsCheck>("AtsCheck", atsCheckSchema);

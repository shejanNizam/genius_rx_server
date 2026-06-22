import { model, Schema } from "mongoose";
import { IResume } from "./resume.interface";

const resumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    file: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    label: { type: String },
    source: {
      type: String,
      enum: ["uploaded", "ai_generated"],
      default: "uploaded",
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

resumeSchema.index({ userId: 1 });

export const Resume = model<IResume>("Resume", resumeSchema);

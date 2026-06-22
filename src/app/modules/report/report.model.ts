import { model, Schema } from "mongoose";
import { IReport } from "./report.interface";

const reportSchema = new Schema<IReport>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reportedUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: {
      type: String,
      enum: ["hate_speech","threat","harassment","impersonation","fraud_scam","fake_identity","something_else","other"],
      required: true,
    },
    description: { type: String },
    status: {
      type: String,
      enum: ["pending", "reviewed", "actioned", "dismissed"],
      default: "pending",
    },
  },
  { timestamps: true, versionKey: false },
);

reportSchema.index({ status: 1 });
reportSchema.index({ reportedUserId: 1 });

export const Report = model<IReport>("Report", reportSchema);

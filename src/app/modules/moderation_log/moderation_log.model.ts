import { model, Schema } from "mongoose";
import { IModerationLog } from "./moderation_log.interface";

const moderationLogSchema = new Schema<IModerationLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: {
      type: String,
      enum: ["block_user", "unblock_user", "delete_job", "edit_cms", "review_report"],
      required: true,
    },
    targetType: {
      type: String,
      enum: ["user", "job", "content", "report"],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId },
    reason: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true, versionKey: false },
);

moderationLogSchema.index({ adminId: 1 });
moderationLogSchema.index({ targetType: 1, targetId: 1 });
moderationLogSchema.index({ createdAt: -1 });

export const ModerationLog = model<IModerationLog>(
  "ModerationLog",
  moderationLogSchema,
);

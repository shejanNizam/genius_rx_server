import { Document, Types } from "mongoose";

export type ModerationAction =
  | "block_user"
  | "unblock_user"
  | "delete_job"
  | "edit_cms"
  | "review_report";

export type ModerationTargetType = "user" | "job" | "content" | "report";

export interface IModerationLogInitial {
  adminId: Types.ObjectId;
  action: ModerationAction;
  targetType: ModerationTargetType;
  targetId?: Types.ObjectId;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export type IModerationLog = IModerationLogInitial & Document;

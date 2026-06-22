import { Document, Types } from "mongoose";

export type ReportCategory =
  | "hate_speech"
  | "threat"
  | "harassment"
  | "impersonation"
  | "fraud_scam"
  | "fake_identity"
  | "something_else"
  | "other";

export type ReportStatus = "pending" | "reviewed" | "actioned" | "dismissed";

export interface IReportInitial {
  reporterId: Types.ObjectId;
  reportedUserId: Types.ObjectId;
  category: ReportCategory;
  description?: string;
  status: ReportStatus;
}

export type IReport = IReportInitial & Document;

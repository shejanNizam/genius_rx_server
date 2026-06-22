import { Document, Types } from "mongoose";

export interface IAtsIssue {
  section: string;
  message: string;
}

export interface IAtsCheckInitial {
  userId: Types.ObjectId;
  resumeId: Types.ObjectId;
  score: number;
  issues: IAtsIssue[];
}

export type IAtsCheck = IAtsCheckInitial & Document;

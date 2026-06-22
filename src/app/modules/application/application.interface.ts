import { Document, Types } from "mongoose";

export type ApplicationStatus =
  | "applied"
  | "viewed"
  | "shortlisted"
  | "selected"
  | "rejected";

export interface IInterview {
  date?: Date;
  location?: string;
  note?: string;
}

export interface IApplicationInitial {
  jobId: Types.ObjectId;
  seekerId: Types.ObjectId;
  resumeId: Types.ObjectId;
  status: ApplicationStatus;
  interview?: IInterview;
}

export type IApplication = IApplicationInitial & Document;

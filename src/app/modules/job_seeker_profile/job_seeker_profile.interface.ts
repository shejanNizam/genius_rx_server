import { Document, Types } from "mongoose";

export type LookingStatus = "actively_looking" | "open_to_work" | "not_open";

export interface IJobSeekerProfileInitial {
  userId: Types.ObjectId;
  shortBio?: string;
  contactInfo?: Record<string, string>;
  lookingStatus?: LookingStatus;
  experience?: Record<string, unknown>[];
  education?: Record<string, unknown>[];
  skills?: string[];
  certificates?: Record<string, unknown>[];
  defaultResumeId?: Types.ObjectId;
}

export type IJobSeekerProfile = IJobSeekerProfileInitial & Document;

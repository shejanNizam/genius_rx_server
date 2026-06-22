import { Document, Types } from "mongoose";

export interface IInstructorProfileInitial {
  userId: Types.ObjectId;
  shortBio?: string;
  contactInfo?: Record<string, string>;
  experience?: Record<string, unknown>[];
  education?: Record<string, unknown>[];
  skills?: string[];
  licenses?: Record<string, unknown>[];
  certificates?: Record<string, unknown>[];
}

export type IInstructorProfile = IInstructorProfileInitial & Document;

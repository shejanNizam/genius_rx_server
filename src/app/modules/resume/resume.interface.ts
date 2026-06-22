import { Document, Types } from "mongoose";

export interface IResumeFile {
  url: string;
  publicId: string;
}

export type ResumeSource = "uploaded" | "ai_generated";

export interface IResumeInitial {
  userId: Types.ObjectId;
  file: IResumeFile;
  label?: string;
  source: ResumeSource;
  isDefault: boolean;
}

export type IResume = IResumeInitial & Document;

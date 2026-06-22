import { Document, Types } from "mongoose";

export type LocationType = "on_site" | "remote" | "hybrid";
export type JobType = "full_time" | "part_time" | "contract";
export type JobLevel = "entry" | "mid" | "senior";
export type JobStatus = "active" | "inactive" | "closed";

export interface IJobSalary {
  amount: number;
  currency: string;
  period: string;
}

export interface IJobInitial {
  recruiterId: Types.ObjectId;
  title: string;
  description?: string;
  responsibilities?: string;
  requirements?: string;
  benefits?: string;
  locationType: LocationType;
  jobType: JobType;
  jobLevel: JobLevel;
  salary?: IJobSalary;
  neededExperience?: string;
  skills?: string[];
  status: JobStatus;
  applicantsCount: number;
  isDeleted: boolean;
  deletedAt?: Date;
}

export type IJob = IJobInitial & Document;

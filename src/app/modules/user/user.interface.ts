import { Document, Types } from "mongoose";

export enum UserRole {
  job_seeker = "job_seeker",
  recruiter = "recruiter",
  instructor = "instructor",
  admin = "admin",
  super_admin = "super_admin",
}

export enum AccessStatus {
  trial = "trial",
  subscribed = "subscribed",
  locked = "locked",
}

export interface IAvatar {
  url: string;
  publicId: string;
}

export interface IUserInitial {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
  avatar?: IAvatar;
  isEmailVerified: boolean;
  status: "active" | "blocked";
  blockReason?: string;
  accessStatus: AccessStatus;
  currentSubscriptionId?: Types.ObjectId;
  stripeCustomerId?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  lastLoginAt?: Date;
}

export type IUser = IUserInitial & Document;

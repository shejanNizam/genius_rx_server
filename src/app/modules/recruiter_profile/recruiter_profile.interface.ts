import { Document, Types } from "mongoose";

export interface ISocialLinks {
  website?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

export interface IRecruiterProfileInitial {
  userId: Types.ObjectId;
  companyName?: string;
  location?: string;
  employeeCount?: number;
  serviceType?: string;
  socialLinks?: ISocialLinks;
  aboutCompany?: string;
  companyCulture?: string;
  businessLicenses?: Record<string, unknown>[];
}

export type IRecruiterProfile = IRecruiterProfileInitial & Document;

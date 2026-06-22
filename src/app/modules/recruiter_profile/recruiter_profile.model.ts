import { model, Schema } from "mongoose";
import { IRecruiterProfile } from "./recruiter_profile.interface";

const recruiterProfileSchema = new Schema<IRecruiterProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    companyName: { type: String },
    location: { type: String },
    employeeCount: { type: Number },
    serviceType: { type: String },
    socialLinks: {
      website: String,
      linkedin: String,
      facebook: String,
      instagram: String,
      twitter: String,
    },
    aboutCompany: { type: String },
    companyCulture: { type: String },
    businessLicenses: { type: [Schema.Types.Mixed], default: [] },
  },
  { timestamps: true, versionKey: false },
);

export const RecruiterProfile = model<IRecruiterProfile>(
  "RecruiterProfile",
  recruiterProfileSchema,
);

import { model, Schema } from "mongoose";
import { IJobSeekerProfile } from "./job_seeker_profile.interface";

const jobSeekerProfileSchema = new Schema<IJobSeekerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    shortBio: { type: String },
    contactInfo: { type: Schema.Types.Mixed },
    lookingStatus: {
      type: String,
      enum: ["actively_looking", "open_to_work", "not_open"],
      default: "not_open",
    },
    experience: { type: [Schema.Types.Mixed], default: [] },
    education: { type: [Schema.Types.Mixed], default: [] },
    skills: { type: [String], default: [] },
    certificates: { type: [Schema.Types.Mixed], default: [] },
    defaultResumeId: { type: Schema.Types.ObjectId, ref: "Resume" },
  },
  { timestamps: true, versionKey: false },
);

export const JobSeekerProfile = model<IJobSeekerProfile>(
  "JobSeekerProfile",
  jobSeekerProfileSchema,
);

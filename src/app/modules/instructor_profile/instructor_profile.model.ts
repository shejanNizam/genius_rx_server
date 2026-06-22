import { model, Schema } from "mongoose";
import { IInstructorProfile } from "./instructor_profile.interface";

const instructorProfileSchema = new Schema<IInstructorProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    shortBio: { type: String },
    contactInfo: { type: Schema.Types.Mixed },
    experience: { type: [Schema.Types.Mixed], default: [] },
    education: { type: [Schema.Types.Mixed], default: [] },
    skills: { type: [String], default: [] },
    licenses: { type: [Schema.Types.Mixed], default: [] },
    certificates: { type: [Schema.Types.Mixed], default: [] },
  },
  { timestamps: true, versionKey: false },
);

export const InstructorProfile = model<IInstructorProfile>(
  "InstructorProfile",
  instructorProfileSchema,
);

import { model, Schema } from "mongoose";
import { IStaticContent } from "./static_content.interface";

const staticContentSchema = new Schema<IStaticContent>(
  {
    type: {
      type: String,
      enum: ["about_us", "privacy_policy", "terms"],
      required: true,
      unique: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    version: { type: Number, default: 1 },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, versionKey: false },
);

export const StaticContent = model<IStaticContent>(
  "StaticContent",
  staticContentSchema,
);

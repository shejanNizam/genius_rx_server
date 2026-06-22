import { Types } from "mongoose";

export type StaticContentType = "about_us" | "privacy_policy" | "terms";

export interface IStaticContent {
  type: StaticContentType;
  title: string;
  body: string;
  version: number;
  updatedBy?: Types.ObjectId;
}

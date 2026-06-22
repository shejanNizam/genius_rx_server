import { Document, Types } from "mongoose";

export interface ISavedJobInitial {
  seekerId: Types.ObjectId;
  jobId: Types.ObjectId;
}

export type ISavedJob = ISavedJobInitial & Document;

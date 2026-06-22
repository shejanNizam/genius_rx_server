import { Document } from "mongoose";

export interface IDemo {
  name: string;
  description?: string;
  isDeleted?: boolean;
}

export type IDemoDocument = IDemo & Document;

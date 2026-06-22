import { Document, Types } from "mongoose";

export interface INotificationInitial {
  userId: Types.ObjectId;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
}

export type INotification = INotificationInitial & Document;

import { model, Schema } from "mongoose";
import { INotification } from "./notification.interface";

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

notificationSchema.index({ userId: 1, isRead: 1 });

export const Notification = model<INotification>(
  "Notification",
  notificationSchema,
);

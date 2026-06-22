import { model, Schema } from "mongoose";
import { IMessage } from "./message.interface";

const messageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String },
    attachments: [
      {
        url: String,
        publicId: String,
        type: String,
        _id: false,
      },
    ],
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true, versionKey: false },
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = model<IMessage>("Message", messageSchema);

import { model, Schema } from "mongoose";
import { IConversation } from "./conversation.interface";

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    initiatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["recruiter_seeker", "seeker_instructor"],
      required: true,
    },
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
  },
  { timestamps: true, versionKey: false },
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

export const Conversation = model<IConversation>(
  "Conversation",
  conversationSchema,
);

import { Document, Types } from "mongoose";

export type ConversationType = "recruiter_seeker" | "seeker_instructor";

export interface IConversationInitial {
  participants: Types.ObjectId[];
  initiatedBy: Types.ObjectId;
  type: ConversationType;
  lastMessage?: string;
  lastMessageAt?: Date;
}

export type IConversation = IConversationInitial & Document;

import { Document, Types } from "mongoose";

export interface IAttachment {
  url: string;
  publicId: string;
  type: string;
}

export interface IMessageInitial {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  text?: string;
  attachments?: IAttachment[];
  readBy?: Types.ObjectId[];
}

export type IMessage = IMessageInitial & Document;

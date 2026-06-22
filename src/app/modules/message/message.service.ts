import httpStatus from "http-status";
import { Types } from "mongoose";
import AppError from "../../errorHelpers/AppError";
import { Conversation } from "../conversation/conversation.model";
import { IMessage } from "./message.interface";
import { Message } from "./message.model";

const sendMessage = async (senderId: string, payload: Partial<IMessage>) => {
  const conv = await Conversation.findOne({
    _id: payload.conversationId,
    participants: new Types.ObjectId(senderId),
  });
  if (!conv) throw new AppError(httpStatus.NOT_FOUND, "Conversation not found");

  const message = await Message.create({ ...payload, senderId, readBy: [senderId] });

  await Conversation.findByIdAndUpdate(payload.conversationId, {
    lastMessage: payload.text,
    lastMessageAt: new Date(),
  });

  return message;
};

const getMessages = async (
  conversationId: string,
  userId: string,
  query: Record<string, unknown>,
) => {
  const conv = await Conversation.findOne({
    _id: conversationId,
    participants: new Types.ObjectId(userId),
  });
  if (!conv) throw new AppError(httpStatus.FORBIDDEN, "Access denied");

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 30;
  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    Message.find({ conversationId }).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Message.countDocuments({ conversationId }),
  ]);

  return { data: messages, meta: { page, limit, totalPage: Math.ceil(total / limit), total } };
};

const markRead = async (conversationId: string, userId: string) => {
  return Message.updateMany(
    { conversationId, readBy: { $ne: new Types.ObjectId(userId) } },
    { $push: { readBy: new Types.ObjectId(userId) } },
  );
};

export const MessageServices = { sendMessage, getMessages, markRead };

import httpStatus from "http-status";
import { Types } from "mongoose";
import { emitToConversation, emitToUser } from "../../../socket/socket";
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

  const message = await Message.create({
    ...payload,
    senderId,
    readBy: [senderId],
  });

  await Conversation.findByIdAndUpdate(payload.conversationId, {
    lastMessage: payload.text,
    lastMessageAt: new Date(),
  });

  // Populate sender info before broadcasting
  const populated = await Message.findById(message._id).populate(
    "senderId",
    "name avatar role",
  );

  const conversationId = payload.conversationId!.toString();

  // Push to the conversation room (users who have the chat open)
  emitToConversation(conversationId, "new_message", populated);

  // Push to each participant's personal room (for badge/sound when chat is not open)
  conv.participants.forEach((participantId) => {
    if (participantId.toString() !== senderId) {
      emitToUser(participantId.toString(), "new_message", populated);
    }
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
    Message.find({ conversationId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Message.countDocuments({ conversationId }),
  ]);

  return {
    data: messages,
    meta: { page, limit, totalPage: Math.ceil(total / limit), total },
  };
};

const markRead = async (conversationId: string, userId: string) => {
  const result = await Message.updateMany(
    { conversationId, readBy: { $ne: new Types.ObjectId(userId) } },
    { $push: { readBy: new Types.ObjectId(userId) } },
  );

  // Notify all participants in the conversation that messages were read
  emitToConversation(conversationId, "message_read", {
    conversationId,
    readBy: userId,
  });

  return result;
};

export const MessageServices = { sendMessage, getMessages, markRead };

import httpStatus from "http-status";
import { Types } from "mongoose";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { Block } from "../block/block.model";
import { IConversation } from "./conversation.interface";
import { Conversation } from "./conversation.model";

const startConversation = async (
  initiatorId: string,
  initiatorRole: string,
  recipientId: string,
) => {
  const recipient = await User.findOne({ _id: recipientId, isDeleted: false, status: "active" });
  if (!recipient) throw new AppError(httpStatus.NOT_FOUND, "Recipient not found");

  const blocked = await Block.findOne({
    $or: [
      { blockerId: initiatorId, blockedId: recipientId },
      { blockerId: recipientId, blockedId: initiatorId },
    ],
  });
  if (blocked) throw new AppError(httpStatus.FORBIDDEN, "Cannot message this user");

  let type: IConversation["type"];
  if (initiatorRole === "recruiter" && recipient.role === "job_seeker") {
    type = "recruiter_seeker";
  } else if (
    (initiatorRole === "job_seeker" && recipient.role === "instructor") ||
    (initiatorRole === "instructor" && recipient.role === "job_seeker")
  ) {
    type = "seeker_instructor";
  } else {
    throw new AppError(httpStatus.FORBIDDEN, "Messaging not allowed between these roles");
  }

  const existing = await Conversation.findOne({
    participants: { $all: [initiatorId, recipientId] },
  });
  if (existing) return existing;

  return Conversation.create({
    participants: [initiatorId, recipientId],
    initiatedBy: initiatorId,
    type,
  });
};

const getMyConversations = async (userId: string) => {
  return Conversation.find({ participants: new Types.ObjectId(userId) })
    .sort({ lastMessageAt: -1 })
    .populate("participants", "name avatar role");
};

const getConversationById = async (id: string, userId: string) => {
  const conv = await Conversation.findOne({
    _id: id,
    participants: new Types.ObjectId(userId),
  }).populate("participants", "name avatar role");
  if (!conv) throw new AppError(httpStatus.NOT_FOUND, "Conversation not found");
  return conv;
};

export const ConversationServices = {
  startConversation,
  getMyConversations,
  getConversationById,
};

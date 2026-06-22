import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { Block } from "./block.model";

const blockUser = async (blockerId: string, blockedId: string) => {
  if (blockerId === blockedId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cannot block yourself");
  }
  const existing = await Block.findOne({ blockerId, blockedId });
  if (existing) throw new AppError(httpStatus.CONFLICT, "User already blocked");
  return Block.create({ blockerId, blockedId });
};

const unblockUser = async (blockerId: string, blockedId: string) => {
  const block = await Block.findOneAndDelete({ blockerId, blockedId });
  if (!block) throw new AppError(httpStatus.NOT_FOUND, "Block not found");
  return block;
};

const getMyBlockList = async (blockerId: string) => {
  return Block.find({ blockerId }).populate("blockedId", "name email avatar");
};

export const BlockServices = { blockUser, unblockUser, getMyBlockList };

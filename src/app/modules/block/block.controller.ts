import { Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { BlockServices } from "./block.service";

const blockUser = catchAsync(async (req: Request, res: Response) => {
  const { _id: blockerId } = req.user as JwtPayload;
  const block = await BlockServices.blockUser(blockerId, req.body.blockedId);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "User blocked", data: block });
});

const unblockUser = catchAsync(async (req: Request, res: Response) => {
  const { _id: blockerId } = req.user as JwtPayload;
  await BlockServices.unblockUser(blockerId, req.params.userId as string);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "User unblocked", data: null });
});

const getMyBlockList = catchAsync(async (req: Request, res: Response) => {
  const { _id: blockerId } = req.user as JwtPayload;
  const blocks = await BlockServices.getMyBlockList(blockerId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Block list retrieved", data: blocks });
});

export const BlockControllers = { blockUser, unblockUser, getMyBlockList };

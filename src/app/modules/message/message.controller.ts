import { Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { MessageServices } from "./message.service";

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const { _id: senderId } = req.user as JwtPayload;
  const msg = await MessageServices.sendMessage(senderId, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Message sent", data: msg });
});

const getMessages = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  const result = await MessageServices.getMessages(req.params.conversationId as string, userId, req.query);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Messages retrieved", data: result.data, meta: result.meta });
});

const markRead = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  await MessageServices.markRead(req.params.conversationId as string, userId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Messages marked as read", data: null });
});

export const MessageControllers = { sendMessage, getMessages, markRead };

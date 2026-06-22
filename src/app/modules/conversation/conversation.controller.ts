import { Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ConversationServices } from "./conversation.service";

const startConversation = catchAsync(async (req: Request, res: Response) => {
  const { _id: initiatorId, role } = req.user as JwtPayload;
  const conv = await ConversationServices.startConversation(initiatorId, role, req.body.recipientId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Conversation started", data: conv });
});

const getMyConversations = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  const convs = await ConversationServices.getMyConversations(userId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Conversations retrieved", data: convs });
});

const getConversationById = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  const conv = await ConversationServices.getConversationById(req.params.id as string, userId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Conversation retrieved", data: conv });
});

export const ConversationControllers = { startConversation, getMyConversations, getConversationById };

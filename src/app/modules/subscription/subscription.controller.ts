import { Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { SubscriptionServices } from "./subscription.service";

const startTrial = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  const sub = await SubscriptionServices.startTrial(userId);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "7-day trial started", data: sub });
});

const subscribe = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  const sub = await SubscriptionServices.subscribe(userId, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Subscribed successfully", data: sub });
});

const getMySubscription = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  const sub = await SubscriptionServices.getMySubscription(userId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Subscription retrieved", data: sub });
});

const getSubscriptionHistory = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  const subs = await SubscriptionServices.getSubscriptionHistory(userId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Subscription history retrieved", data: subs });
});

const cancelSubscription = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  const sub = await SubscriptionServices.cancelSubscription(userId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Subscription cancelled", data: sub });
});

export const SubscriptionControllers = {
  startTrial,
  subscribe,
  getMySubscription,
  getSubscriptionHistory,
  cancelSubscription,
};

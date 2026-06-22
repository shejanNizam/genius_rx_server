import { Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { NotificationServices } from "./notification.service";

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  const result = await NotificationServices.getMyNotifications(userId, req.query);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Notifications retrieved", data: result.data, meta: result.meta });
});

const markAllRead = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  await NotificationServices.markAllRead(userId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "All notifications marked as read", data: null });
});

const markOneRead = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  const notif = await NotificationServices.markOneRead(req.params.id as string, userId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Notification marked as read", data: notif });
});

const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  await NotificationServices.deleteNotification(req.params.id as string, userId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Notification deleted", data: null });
});

export const NotificationControllers = { getMyNotifications, markAllRead, markOneRead, deleteNotification };

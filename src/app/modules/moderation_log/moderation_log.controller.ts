import { Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ModerationLogServices } from "./moderation_log.service";

const createLog = catchAsync(async (req: Request, res: Response) => {
  const { _id: adminId } = req.user as JwtPayload;
  const log = await ModerationLogServices.createLog(adminId, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Log created", data: log });
});

const getLogs = catchAsync(async (req: Request, res: Response) => {
  const result = await ModerationLogServices.getLogs(req.query);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Logs retrieved", data: result.data, meta: result.meta });
});

export const ModerationLogControllers = { createLog, getLogs };

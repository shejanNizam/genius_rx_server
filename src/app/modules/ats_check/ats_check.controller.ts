import { Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AtsCheckServices } from "./ats_check.service";

const createCheck = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  const check = await AtsCheckServices.createCheck(userId, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "ATS check created", data: check });
});

const getMyChecks = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  const checks = await AtsCheckServices.getMyChecks(userId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "ATS checks retrieved", data: checks });
});

const getCheckById = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  const check = await AtsCheckServices.getCheckById(req.params.id as string, userId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "ATS check retrieved", data: check });
});

export const AtsCheckControllers = { createCheck, getMyChecks, getCheckById };

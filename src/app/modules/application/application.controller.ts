import { Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ApplicationServices } from "./application.service";

const apply = catchAsync(async (req: Request, res: Response) => {
  const { _id: seekerId } = req.user as JwtPayload;
  const app = await ApplicationServices.apply(seekerId, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Application submitted successfully", data: app });
});

const getMyApplications = catchAsync(async (req: Request, res: Response) => {
  const { _id: seekerId } = req.user as JwtPayload;
  const result = await ApplicationServices.getMyApplications(seekerId, req.query);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Applications retrieved", data: result.data, meta: result.meta });
});

const getJobApplications = catchAsync(async (req: Request, res: Response) => {
  const { _id: recruiterId } = req.user as JwtPayload;
  const result = await ApplicationServices.getJobApplications(req.params.jobId as string, recruiterId, req.query);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Applications retrieved", data: result.data, meta: result.meta });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const { _id: recruiterId } = req.user as JwtPayload;
  const app = await ApplicationServices.updateStatus(req.params.id as string, recruiterId, req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Status updated", data: app });
});

export const ApplicationControllers = { apply, getMyApplications, getJobApplications, updateStatus };

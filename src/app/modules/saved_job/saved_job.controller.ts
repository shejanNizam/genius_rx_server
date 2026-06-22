import { Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { SavedJobServices } from "./saved_job.service";

const saveJob = catchAsync(async (req: Request, res: Response) => {
  const { _id: seekerId } = req.user as JwtPayload;
  const saved = await SavedJobServices.saveJob(seekerId, req.body.jobId);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Job saved", data: saved });
});

const unsaveJob = catchAsync(async (req: Request, res: Response) => {
  const { _id: seekerId } = req.user as JwtPayload;
  await SavedJobServices.unsaveJob(seekerId, req.params.jobId as string);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Job unsaved", data: null });
});

const getMySavedJobs = catchAsync(async (req: Request, res: Response) => {
  const { _id: seekerId } = req.user as JwtPayload;
  const result = await SavedJobServices.getMySavedJobs(seekerId, req.query);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Saved jobs retrieved", data: result.data, meta: result.meta });
});

export const SavedJobControllers = { saveJob, unsaveJob, getMySavedJobs };

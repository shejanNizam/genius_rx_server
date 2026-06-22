import { Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { JobServices } from "./job.service";

const createJob = catchAsync(async (req: Request, res: Response) => {
  const { _id: recruiterId } = req.user as JwtPayload;
  const job = await JobServices.createJob(recruiterId, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Job posted successfully", data: job });
});

const getAllJobs = catchAsync(async (req: Request, res: Response) => {
  const result = await JobServices.getAllJobs(req.query);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Jobs retrieved successfully", data: result.data, meta: result.meta });
});

const getMyJobs = catchAsync(async (req: Request, res: Response) => {
  const { _id: recruiterId } = req.user as JwtPayload;
  const result = await JobServices.getMyJobs(recruiterId, req.query);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Your jobs retrieved successfully", data: result.data, meta: result.meta });
});

const getJobById = catchAsync(async (req: Request, res: Response) => {
  const job = await JobServices.getJobById(req.params.id as string);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Job retrieved successfully", data: job });
});

const updateJob = catchAsync(async (req: Request, res: Response) => {
  const { _id: recruiterId } = req.user as JwtPayload;
  const job = await JobServices.updateJob(req.params.id as string, recruiterId, req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Job updated successfully", data: job });
});

const deleteJob = catchAsync(async (req: Request, res: Response) => {
  const { _id: recruiterId } = req.user as JwtPayload;
  await JobServices.deleteJob(req.params.id as string, recruiterId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Job deleted successfully", data: null });
});

const adminDeleteJob = catchAsync(async (req: Request, res: Response) => {
  await JobServices.adminDeleteJob(req.params.id as string);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Job deleted successfully", data: null });
});

export const JobControllers = { createJob, getAllJobs, getMyJobs, getJobById, updateJob, deleteJob, adminDeleteJob };

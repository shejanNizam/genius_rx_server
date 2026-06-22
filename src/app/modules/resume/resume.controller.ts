import { Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ResumeServices } from "./resume.service";

const createResume = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  const resume = await ResumeServices.createResume(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Resume uploaded successfully",
    data: resume,
  });
});

const getMyResumes = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  const resumes = await ResumeServices.getMyResumes(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Resumes retrieved successfully",
    data: resumes,
  });
});

const getSingleResume = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  const resume = await ResumeServices.getSingleResume(req.params.id as string, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Resume retrieved successfully",
    data: resume,
  });
});

const setDefault = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  const resume = await ResumeServices.setDefault(req.params.id as string, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Default resume updated",
    data: resume,
  });
});

const deleteResume = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  await ResumeServices.deleteResume(req.params.id as string, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Resume deleted successfully",
    data: null,
  });
});

export const ResumeControllers = {
  createResume,
  getMyResumes,
  getSingleResume,
  setDefault,
  deleteResume,
};

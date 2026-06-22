import { Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { JobSeekerProfileServices } from "./job_seeker_profile.service";

const upsertProfile = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  const profile = await JobSeekerProfileServices.createOrUpdateProfile(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile saved successfully",
    data: profile,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  const profile = await JobSeekerProfileServices.getMyProfile(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile retrieved successfully",
    data: profile,
  });
});

const getProfileById = catchAsync(async (req: Request, res: Response) => {
  const profile = await JobSeekerProfileServices.getProfileById(req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile retrieved successfully",
    data: profile,
  });
});

const getAllProfiles = catchAsync(async (req: Request, res: Response) => {
  const result = await JobSeekerProfileServices.getAllProfiles(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profiles retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const JobSeekerProfileControllers = {
  upsertProfile,
  getMyProfile,
  getProfileById,
  getAllProfiles,
};

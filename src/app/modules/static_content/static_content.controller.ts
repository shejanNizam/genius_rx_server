import { Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { StaticContentServices } from "./static_content.service";

const getByType = catchAsync(async (req: Request, res: Response) => {
  const content = await StaticContentServices.getByType(req.params.type as string);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Content retrieved", data: content });
});

const getAllContent = catchAsync(async (req: Request, res: Response) => {
  const content = await StaticContentServices.getAllContent();
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Content retrieved", data: content });
});

const upsertContent = catchAsync(async (req: Request, res: Response) => {
  const { _id: adminId } = req.user as JwtPayload;
  const content = await StaticContentServices.upsertContent(adminId, req.params.type as string, req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Content saved", data: content });
});

export const StaticContentControllers = { getByType, getAllContent, upsertContent };

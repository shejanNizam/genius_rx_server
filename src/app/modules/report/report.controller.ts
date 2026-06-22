import { Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ReportServices } from "./report.service";

const createReport = catchAsync(async (req: Request, res: Response) => {
  const { _id: reporterId } = req.user as JwtPayload;
  const report = await ReportServices.createReport(reporterId, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Report submitted", data: report });
});

const getAllReports = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportServices.getAllReports(req.query);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Reports retrieved", data: result.data, meta: result.meta });
});

const updateReportStatus = catchAsync(async (req: Request, res: Response) => {
  const report = await ReportServices.updateReportStatus(req.params.id as string, req.body.status);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Report status updated", data: report });
});

export const ReportControllers = { createReport, getAllReports, updateReportStatus };

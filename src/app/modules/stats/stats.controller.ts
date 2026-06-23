import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { StatsServices } from "./stats.service";

const getOverviewStats = catchAsync(async (_req, res) => {
  const data = await StatsServices.getOverviewStats();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard overview stats retrieved",
    data,
  });
});

const getEarningsStats = catchAsync(async (_req, res) => {
  const data = await StatsServices.getEarningsStats();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Earnings stats retrieved",
    data,
  });
});

const getRecruiterDashboard = catchAsync(async (req, res) => {
  const { _id: recruiterId } = req.user as JwtPayload;
  const now = new Date();
  const month = parseInt(req.query.month as string) || now.getMonth() + 1;
  const year = parseInt(req.query.year as string) || now.getFullYear();
  const data = await StatsServices.getRecruiterDashboard(recruiterId, month, year);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Recruiter dashboard stats retrieved",
    data,
  });
});

export const StatsControllers = { getOverviewStats, getEarningsStats, getRecruiterDashboard };

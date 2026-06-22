import httpStatus from "http-status";
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

export const StatsControllers = { getOverviewStats, getEarningsStats };

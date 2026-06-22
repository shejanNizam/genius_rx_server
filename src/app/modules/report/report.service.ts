import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IReport } from "./report.interface";
import { Report } from "./report.model";

const createReport = async (reporterId: string, payload: Partial<IReport>) => {
  return Report.create({ ...payload, reporterId, status: "pending" });
};

const getAllReports = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;

  const [reports, total] = await Promise.all([
    Report.find(filter).skip(skip).limit(limit)
      .populate("reporterId", "name email")
      .populate("reportedUserId", "name email")
      .sort({ createdAt: -1 }),
    Report.countDocuments(filter),
  ]);

  return { data: reports, meta: { page, limit, totalPage: Math.ceil(total / limit), total } };
};

const updateReportStatus = async (id: string, status: IReport["status"]) => {
  const report = await Report.findByIdAndUpdate(id, { status }, { new: true });
  if (!report) throw new AppError(httpStatus.NOT_FOUND, "Report not found");
  return report;
};

export const ReportServices = { createReport, getAllReports, updateReportStatus };

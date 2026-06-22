import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { Job } from "../job/job.model";
import { IApplication } from "./application.interface";
import { Application } from "./application.model";

const apply = async (seekerId: string, payload: Partial<IApplication>) => {
  const job = await Job.findOne({ _id: payload.jobId, isDeleted: false, status: "active" });
  if (!job) throw new AppError(httpStatus.NOT_FOUND, "Job not found or not active");

  const existing = await Application.findOne({ jobId: payload.jobId, seekerId });
  if (existing) throw new AppError(httpStatus.CONFLICT, "Already applied to this job");

  const application = await Application.create({ ...payload, seekerId, status: "applied" });

  await Job.findByIdAndUpdate(payload.jobId, { $inc: { applicantsCount: 1 } });

  return application;
};

const getMyApplications = async (seekerId: string, query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { seekerId };
  if (query.status) filter.status = query.status;

  const [apps, total] = await Promise.all([
    Application.find(filter).skip(skip).limit(limit).populate("jobId resumeId").sort({ createdAt: -1 }),
    Application.countDocuments(filter),
  ]);

  return { data: apps, meta: { page, limit, totalPage: Math.ceil(total / limit), total } };
};

const getJobApplications = async (
  jobId: string,
  recruiterId: string,
  query: Record<string, unknown>,
) => {
  const job = await Job.findOne({ _id: jobId, recruiterId });
  if (!job) throw new AppError(httpStatus.NOT_FOUND, "Job not found");

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { jobId };
  if (query.status) filter.status = query.status;

  const [apps, total] = await Promise.all([
    Application.find(filter).skip(skip).limit(limit).populate("seekerId", "name email avatar").populate("resumeId"),
    Application.countDocuments(filter),
  ]);

  return { data: apps, meta: { page, limit, totalPage: Math.ceil(total / limit), total } };
};

const updateStatus = async (
  id: string,
  recruiterId: string,
  payload: Partial<IApplication>,
) => {
  const application = await Application.findById(id).populate("jobId");
  if (!application) throw new AppError(httpStatus.NOT_FOUND, "Application not found");

  const job = await Job.findOne({ _id: application.jobId, recruiterId });
  if (!job) throw new AppError(httpStatus.FORBIDDEN, "Not authorized");

  return Application.findByIdAndUpdate(id, payload, { new: true });
};

export const ApplicationServices = {
  apply,
  getMyApplications,
  getJobApplications,
  updateStatus,
};

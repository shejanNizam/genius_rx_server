import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IJob } from "./job.interface";
import { Job } from "./job.model";

const createJob = async (recruiterId: string, payload: Partial<IJob>) => {
  return Job.create({ ...payload, recruiterId });
};

const getAllJobs = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { isDeleted: false, status: "active" };
  if (query.jobType) filter.jobType = query.jobType;
  if (query.jobLevel) filter.jobLevel = query.jobLevel;
  if (query.locationType) filter.locationType = query.locationType;
  if (query.search) {
    filter.$text = { $search: query.search as string };
  }

  const [jobs, total] = await Promise.all([
    Job.find(filter).skip(skip).limit(limit).populate("recruiterId", "name avatar").sort({ createdAt: -1 }),
    Job.countDocuments(filter),
  ]);

  return {
    data: jobs,
    meta: { page, limit, totalPage: Math.ceil(total / limit), total },
  };
};

const getMyJobs = async (recruiterId: string, query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { recruiterId, isDeleted: false };
  if (query.status) filter.status = query.status;

  const [jobs, total] = await Promise.all([
    Job.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Job.countDocuments(filter),
  ]);

  return {
    data: jobs,
    meta: { page, limit, totalPage: Math.ceil(total / limit), total },
  };
};

const getJobById = async (id: string) => {
  const job = await Job.findOne({ _id: id, isDeleted: false }).populate(
    "recruiterId",
    "name email avatar",
  );
  if (!job) throw new AppError(httpStatus.NOT_FOUND, "Job not found");
  return job;
};

const updateJob = async (
  id: string,
  recruiterId: string,
  payload: Partial<IJob>,
) => {
  const job = await Job.findOneAndUpdate(
    { _id: id, recruiterId, isDeleted: false },
    payload,
    { new: true, runValidators: true },
  );
  if (!job) throw new AppError(httpStatus.NOT_FOUND, "Job not found");
  return job;
};

const deleteJob = async (id: string, recruiterId: string) => {
  const job = await Job.findOneAndUpdate(
    { _id: id, recruiterId },
    { isDeleted: true, deletedAt: new Date() },
    { new: true },
  );
  if (!job) throw new AppError(httpStatus.NOT_FOUND, "Job not found");
  return job;
};

const adminDeleteJob = async (id: string) => {
  const job = await Job.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true },
  );
  if (!job) throw new AppError(httpStatus.NOT_FOUND, "Job not found");
  return job;
};

export const JobServices = {
  createJob,
  getAllJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
  adminDeleteJob,
};

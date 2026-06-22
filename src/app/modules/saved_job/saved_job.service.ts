import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { SavedJob } from "./saved_job.model";

const saveJob = async (seekerId: string, jobId: string) => {
  const existing = await SavedJob.findOne({ seekerId, jobId });
  if (existing) throw new AppError(httpStatus.CONFLICT, "Job already saved");
  return SavedJob.create({ seekerId, jobId });
};

const unsaveJob = async (seekerId: string, jobId: string) => {
  const saved = await SavedJob.findOneAndDelete({ seekerId, jobId });
  if (!saved) throw new AppError(httpStatus.NOT_FOUND, "Saved job not found");
  return saved;
};

const getMySavedJobs = async (seekerId: string, query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    SavedJob.find({ seekerId }).skip(skip).limit(limit).populate("jobId").sort({ createdAt: -1 }),
    SavedJob.countDocuments({ seekerId }),
  ]);

  return { data: jobs, meta: { page, limit, totalPage: Math.ceil(total / limit), total } };
};

export const SavedJobServices = { saveJob, unsaveJob, getMySavedJobs };

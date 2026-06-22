import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IResume } from "./resume.interface";
import { Resume } from "./resume.model";

const createResume = async (userId: string, payload: Partial<IResume>) => {
  if (payload.isDefault) {
    await Resume.updateMany({ userId }, { isDefault: false });
  }
  return Resume.create({ ...payload, userId });
};

const getMyResumes = async (userId: string) => {
  return Resume.find({ userId }).sort({ createdAt: -1 });
};

const getSingleResume = async (id: string, userId: string) => {
  const resume = await Resume.findOne({ _id: id, userId });
  if (!resume) throw new AppError(httpStatus.NOT_FOUND, "Resume not found");
  return resume;
};

const setDefault = async (id: string, userId: string) => {
  await Resume.updateMany({ userId }, { isDefault: false });
  const resume = await Resume.findOneAndUpdate(
    { _id: id, userId },
    { isDefault: true },
    { new: true },
  );
  if (!resume) throw new AppError(httpStatus.NOT_FOUND, "Resume not found");
  return resume;
};

const deleteResume = async (id: string, userId: string) => {
  const resume = await Resume.findOneAndDelete({ _id: id, userId });
  if (!resume) throw new AppError(httpStatus.NOT_FOUND, "Resume not found");
  return resume;
};

export const ResumeServices = {
  createResume,
  getMyResumes,
  getSingleResume,
  setDefault,
  deleteResume,
};

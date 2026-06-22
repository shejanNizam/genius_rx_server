import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IAtsCheck } from "./ats_check.interface";
import { AtsCheck } from "./ats_check.model";

const createCheck = async (userId: string, payload: Partial<IAtsCheck>) => {
  return AtsCheck.create({ ...payload, userId });
};

const getMyChecks = async (userId: string) => {
  return AtsCheck.find({ userId }).populate("resumeId", "label file").sort({ createdAt: -1 });
};

const getCheckById = async (id: string, userId: string) => {
  const check = await AtsCheck.findOne({ _id: id, userId }).populate("resumeId");
  if (!check) throw new AppError(httpStatus.NOT_FOUND, "ATS check not found");
  return check;
};

export const AtsCheckServices = { createCheck, getMyChecks, getCheckById };

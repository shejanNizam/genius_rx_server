import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IInstructorProfile } from "./instructor_profile.interface";
import { InstructorProfile } from "./instructor_profile.model";

const createOrUpdateProfile = async (
  userId: string,
  payload: Partial<IInstructorProfile>,
) => {
  return InstructorProfile.findOneAndUpdate(
    { userId },
    { ...payload, userId },
    { new: true, upsert: true, runValidators: true },
  );
};

const getMyProfile = async (userId: string) => {
  const profile = await InstructorProfile.findOne({ userId });
  if (!profile) throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
  return profile;
};

const getProfileById = async (id: string) => {
  const profile = await InstructorProfile.findById(id).populate("userId", "name email avatar");
  if (!profile) throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
  return profile;
};

const getAllProfiles = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (query.skills) filter.skills = { $in: (query.skills as string).split(",") };

  const [profiles, total] = await Promise.all([
    InstructorProfile.find(filter).skip(skip).limit(limit).populate("userId", "name email avatar"),
    InstructorProfile.countDocuments(filter),
  ]);

  return {
    data: profiles,
    meta: { page, limit, totalPage: Math.ceil(total / limit), total },
  };
};

export const InstructorProfileServices = {
  createOrUpdateProfile,
  getMyProfile,
  getProfileById,
  getAllProfiles,
};

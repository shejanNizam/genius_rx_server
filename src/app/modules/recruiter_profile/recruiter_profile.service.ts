import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRecruiterProfile } from "./recruiter_profile.interface";
import { RecruiterProfile } from "./recruiter_profile.model";

const createOrUpdateProfile = async (
  userId: string,
  payload: Partial<IRecruiterProfile>,
) => {
  return RecruiterProfile.findOneAndUpdate(
    { userId },
    { ...payload, userId },
    { new: true, upsert: true, runValidators: true },
  );
};

const getMyProfile = async (userId: string) => {
  const profile = await RecruiterProfile.findOne({ userId });
  if (!profile) throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
  return profile;
};

const getProfileById = async (id: string) => {
  const profile = await RecruiterProfile.findById(id).populate("userId", "name email avatar");
  if (!profile) throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
  return profile;
};

const getAllProfiles = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (query.location) filter.location = { $regex: query.location, $options: "i" };
  if (query.search) filter.companyName = { $regex: query.search, $options: "i" };

  const [profiles, total] = await Promise.all([
    RecruiterProfile.find(filter).skip(skip).limit(limit).populate("userId", "name email avatar"),
    RecruiterProfile.countDocuments(filter),
  ]);

  return {
    data: profiles,
    meta: { page, limit, totalPage: Math.ceil(total / limit), total },
  };
};

export const RecruiterProfileServices = {
  createOrUpdateProfile,
  getMyProfile,
  getProfileById,
  getAllProfiles,
};

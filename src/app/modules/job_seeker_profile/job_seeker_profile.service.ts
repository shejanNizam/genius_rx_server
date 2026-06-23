import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { IJobSeekerProfile } from "./job_seeker_profile.interface";
import { JobSeekerProfile } from "./job_seeker_profile.model";

const createOrUpdateProfile = async (
  userId: string,
  payload: Partial<IJobSeekerProfile>,
) => {
  return JobSeekerProfile.findOneAndUpdate(
    { userId },
    { ...payload, userId },
    { new: true, upsert: true, runValidators: true },
  );
};

const getMyProfile = async (userId: string) => {
  const profile = await JobSeekerProfile.findOne({ userId }).populate(
    "defaultResumeId",
  );
  if (!profile) throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
  return profile;
};

const getProfileById = async (id: string) => {
  const profile = await JobSeekerProfile.findById(id).populate("defaultResumeId");
  if (!profile) throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
  return profile;
};

const getAllProfiles = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (query.lookingStatus) filter.lookingStatus = query.lookingStatus;
  if (query.skills) filter.skills = { $in: (query.skills as string).split(",") };

  // Search by user name — find matching user IDs then filter profiles
  if (query.search) {
    const matchedUsers = await User.find({
      name: { $regex: query.search as string, $options: "i" },
      isDeleted: false,
    }).select("_id");
    filter.userId = { $in: matchedUsers.map((u) => u._id) };
  }

  const [profiles, total] = await Promise.all([
    JobSeekerProfile.find(filter).skip(skip).limit(limit).populate("userId", "name email avatar"),
    JobSeekerProfile.countDocuments(filter),
  ]);

  return {
    data: profiles,
    meta: { page, limit, totalPage: Math.ceil(total / limit), total },
  };
};

export const JobSeekerProfileServices = {
  createOrUpdateProfile,
  getMyProfile,
  getProfileById,
  getAllProfiles,
};

import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IStaticContent, StaticContentType } from "./static_content.interface";
import { StaticContent } from "./static_content.model";

const getByType = async (type: string) => {
  const content = await StaticContent.findOne({ type: type as StaticContentType }).lean();
  if (!content) throw new AppError(httpStatus.NOT_FOUND, "Content not found");
  return content;
};

const getAllContent = async () => {
  return StaticContent.find().lean();
};

const upsertContent = async (
  adminId: string,
  type: string,
  payload: Partial<IStaticContent>,
) => {
  const contentType = type as StaticContentType;
  const existing = await StaticContent.findOne({ type: contentType }).lean();
  const version = existing ? existing.version + 1 : 1;

  return StaticContent.findOneAndUpdate(
    { type: contentType },
    { ...payload, type: contentType, updatedBy: adminId, version },
    { new: true, upsert: true, runValidators: true },
  );
};

export const StaticContentServices = { getByType, getAllContent, upsertContent };

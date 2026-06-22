import { IModerationLog } from "./moderation_log.interface";
import { ModerationLog } from "./moderation_log.model";

const createLog = async (adminId: string, payload: Partial<IModerationLog>) => {
  return ModerationLog.create({ ...payload, adminId });
};

const getLogs = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (query.adminId) filter.adminId = query.adminId;
  if (query.targetType) filter.targetType = query.targetType;

  const [logs, total] = await Promise.all([
    ModerationLog.find(filter).skip(skip).limit(limit)
      .populate("adminId", "name email")
      .sort({ createdAt: -1 }),
    ModerationLog.countDocuments(filter),
  ]);

  return { data: logs, meta: { page, limit, totalPage: Math.ceil(total / limit), total } };
};

export const ModerationLogServices = { createLog, getLogs };

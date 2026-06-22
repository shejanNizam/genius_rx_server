import { INotification } from "./notification.interface";
import { Notification } from "./notification.model";

const createNotification = async (payload: Partial<INotification>) => {
  return Notification.create(payload);
};

const getMyNotifications = async (userId: string, query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { userId };
  if (query.isRead !== undefined) filter.isRead = query.isRead === "true";

  const [notifications, total] = await Promise.all([
    Notification.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Notification.countDocuments(filter),
  ]);

  const unreadCount = await Notification.countDocuments({ userId, isRead: false });

  return {
    data: notifications,
    meta: { page, limit, totalPage: Math.ceil(total / limit), total, unreadCount },
  };
};

const markAllRead = async (userId: string) => {
  return Notification.updateMany({ userId, isRead: false }, { isRead: true });
};

const markOneRead = async (id: string, userId: string) => {
  return Notification.findOneAndUpdate({ _id: id, userId }, { isRead: true }, { new: true });
};

const deleteNotification = async (id: string, userId: string) => {
  return Notification.findOneAndDelete({ _id: id, userId });
};

export const NotificationServices = {
  createNotification,
  getMyNotifications,
  markAllRead,
  markOneRead,
  deleteNotification,
};

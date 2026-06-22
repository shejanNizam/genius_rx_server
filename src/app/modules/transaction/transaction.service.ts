import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { ITransaction } from "./transaction.interface";
import { Transaction } from "./transaction.model";

const createTransaction = async (userId: string, payload: Partial<ITransaction>) => {
  return Transaction.create({ ...payload, userId });
};

const getMyTransactions = async (userId: string, query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const [txns, total] = await Promise.all([
    Transaction.find({ userId }).skip(skip).limit(limit).populate("subscriptionId").sort({ createdAt: -1 }),
    Transaction.countDocuments({ userId }),
  ]);

  return { data: txns, meta: { page, limit, totalPage: Math.ceil(total / limit), total } };
};

const getAllTransactions = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;

  const [txns, total] = await Promise.all([
    Transaction.find(filter).skip(skip).limit(limit)
      .populate("userId", "name email")
      .populate("subscriptionId")
      .sort({ createdAt: -1 }),
    Transaction.countDocuments(filter),
  ]);

  return { data: txns, meta: { page, limit, totalPage: Math.ceil(total / limit), total } };
};

const updateTransactionStatus = async (id: string, status: ITransaction["status"]) => {
  const txn = await Transaction.findByIdAndUpdate(id, { status }, { new: true });
  if (!txn) throw new AppError(httpStatus.NOT_FOUND, "Transaction not found");
  return txn;
};

export const TransactionServices = {
  createTransaction,
  getMyTransactions,
  getAllTransactions,
  updateTransactionStatus,
};

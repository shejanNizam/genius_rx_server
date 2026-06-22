import { Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TransactionServices } from "./transaction.service";

const createTransaction = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  const txn = await TransactionServices.createTransaction(userId, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Transaction created", data: txn });
});

const getMyTransactions = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as JwtPayload;
  const result = await TransactionServices.getMyTransactions(userId, req.query);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Transactions retrieved", data: result.data, meta: result.meta });
});

const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
  const result = await TransactionServices.getAllTransactions(req.query);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Transactions retrieved", data: result.data, meta: result.meta });
});

const updateTransactionStatus = catchAsync(async (req: Request, res: Response) => {
  const txn = await TransactionServices.updateTransactionStatus(req.params.id as string, req.body.status);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Transaction updated", data: txn });
});

export const TransactionControllers = { createTransaction, getMyTransactions, getAllTransactions, updateTransactionStatus };

import { Document, Types } from "mongoose";

export type TransactionType = "subscription" | "renewal";
export type TransactionStatus = "pending" | "success" | "failed";

export interface ITransactionInitial {
  userId: Types.ObjectId;
  subscriptionId: Types.ObjectId;
  amount: Types.Decimal128;
  currency: string;
  gateway?: string;
  gatewayRef?: string;
  type: TransactionType;
  status: TransactionStatus;
}

export type ITransaction = ITransactionInitial & Document;

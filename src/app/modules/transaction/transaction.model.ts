import { model, Schema } from "mongoose";
import { ITransaction } from "./transaction.interface";

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: "Subscription", required: true },
    amount: { type: Schema.Types.Decimal128, required: true },
    currency: { type: String, required: true },
    gateway: { type: String },
    gatewayRef: { type: String },
    type: { type: String, enum: ["subscription", "renewal"], required: true },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
  },
  { timestamps: true, versionKey: false },
);

transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ userId: 1 });

export const Transaction = model<ITransaction>("Transaction", transactionSchema);

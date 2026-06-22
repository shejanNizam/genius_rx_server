import { randomBytes } from "crypto";

export const getTransactionId = () => {
  return `tran_${Date.now()}_${randomBytes(8).toString("hex")}`;
};

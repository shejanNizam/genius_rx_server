import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { Payment } from "./payment.model";

const getInvoiceDownloadUrl = async (paymentId: string) => {
  const payment = await Payment.findById(paymentId).select("invoiceUrl");

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  if (!payment.invoiceUrl) {
    throw new AppError(httpStatus.NOT_FOUND, "No invoice found");
  }

  return payment.invoiceUrl;
};

export const PaymentService = {
  getInvoiceDownloadUrl,
};

import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";

const getInvoiceDownloadUrl = catchAsync(
  async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    const result = await PaymentService.getInvoiceDownloadUrl(paymentId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Invoice download URL retrieved successfully",
      data: result,
    });
  },
);

export const PaymentController = {
  getInvoiceDownloadUrl,
};

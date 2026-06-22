import { Request, Response } from "express";
import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

type CloudinaryFile = Express.Multer.File & { path: string };

const uploadFiles = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as CloudinaryFile[] | undefined;

  if (!files || files.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "No file provided");
  }

  const data =
    files.length === 1
      ? { url: files[0].path, publicId: files[0].filename }
      : files.map((file) => file.path);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${files.length} file(s) uploaded successfully`,
    data,
  });
});

export const UploadControllers = { uploadFiles };

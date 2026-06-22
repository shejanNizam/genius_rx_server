/* eslint-disable no-console */
// previous ===========================>>
// import { NextFunction, Request, Response } from "express";

// export default function globalErrorHandler(
//   err: any,
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) {
//   return res.status(500).json({
//     success: false,
//     message: err.message || "Something went wrong!",
//     error: err,
//   });
// }

// present ===========================>>
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import express from "express";
import { configs } from "../config/index";
import { deleteImageFromCLoudinary } from "../config/cloudinary.config";
import AppError from "../errorHelpers/AppError";
import { handleCastError } from "../helpers/handleCastError";
import { handlerDuplicateError } from "../helpers/handlerDuplicateError";
import { handlerValidationError } from "../helpers/handlerValidationError";
import { handlerZodError } from "../helpers/handlerZodError";
import { TErrorSources } from "../interfaces/error.types";

export const globalErrorHandler = async (
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (configs.node_env === "development") {
    console.log(err);
  }

  // for default image delete from cloudinary when api get error
  console.log({ file: req.files });
  if (req.file) {
    await deleteImageFromCLoudinary(req.file.path);
  }

  if (req.files && Array.isArray(req.files) && req.files.length) {
    const imageUrls = (req.files as Express.Multer.File[]).map(
      (file) => file.path,
    );

    await Promise.all(imageUrls.map((url) => deleteImageFromCLoudinary(url)));
  }

  // delete any uploaded files from cloudinary when the request fails
  // if (req.file) {
  //   await deleteImageFromCLoudinary(req.file.path).catch(() => {});
  // }

  // if (req.files && Array.isArray(req.files) && req.files.length) {
  //   const urls = (req.files as Express.Multer.File[]).map((f) => f.path);
  //   await Promise.all(
  //     urls.map((url) => deleteImageFromCLoudinary(url).catch(() => {})),
  //   );
  // } else if (req.files && !Array.isArray(req.files)) {
  //   const urls = Object.values(
  //     req.files as Record<string, Express.Multer.File[]>,
  //   )
  //     .flat()
  //     .map((f) => f.path);
  //   await Promise.all(
  //     urls.map((url) => deleteImageFromCLoudinary(url).catch(() => {})),
  //   );
  // }

  let errorSources: TErrorSources[] = [];
  let statusCode = 500;
  let message = "Something Went Wrong!!";

  //Duplicate error
  if (err.code === 11000) {
    const simplifiedError = handlerDuplicateError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  }
  // Object ID error / Cast Error
  else if (err.name === "CastError") {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  } else if (err.name === "ZodError") {
    const simplifiedError = handlerZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources as TErrorSources[];
  }
  //Mongoose Validation Error
  else if (err.name === "ValidationError") {
    const simplifiedError = handlerValidationError(err);
    statusCode = simplifiedError.statusCode;
    errorSources = simplifiedError.errorSources as TErrorSources[];
    message = simplifiedError.message;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    statusCode = 500;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err: configs.node_env === "development" ? err : null,
    stack: configs.node_env === "development" ? err.stack : null,
  });
};

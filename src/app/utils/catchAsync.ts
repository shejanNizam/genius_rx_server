/* eslint-disable no-console */
import { NextFunction, Request, RequestHandler, Response } from "express";
import { configs } from "../config/index";

// type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>

// const catchAsync = (fn: AsyncHandler) => {
const catchAsync = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      if (configs.node_env === "development") {
        console.log(err);
      }
      next(err);
    });
  };
};

export default catchAsync;

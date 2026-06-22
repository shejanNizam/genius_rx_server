/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserServices } from "./user.service";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const user = await UserServices.createUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User created successfully!",
    data: user,
  });
});

const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;

    const verifiedToken = req.user;

    const payload = req.body;
    const user = await UserServices.updateUser(
      userId as string,
      payload,
      verifiedToken as JwtPayload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Updated Successfully",
      data: user,
    });
  },
);

const getAllUsers = async (req: Request, res: Response) => {
  const result = await UserServices.getAllUsers();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All users Retrieved successfully!",
    data: result.data,
    meta: result.meta,
  });
};
const getSingleUser = async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await UserServices.getSingleUser(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Retrieved successfully!",
    data: result.data,
  });
};

const getMe = async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const result = await UserServices.getMe(decodedToken._id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your profile Retrieved successfully!",
    data: result.data,
  });
};

export const UserControllers = {
  createUser,
  updateUser,
  getAllUsers,
  getSingleUser,
  getMe,
};

import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { configs } from "../config/index";
import AppError from "../errorHelpers/AppError";
import { IsActive } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { verifyToken } from "../utils/jwt";

export const checkAuth =
  (...authRole: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // const accessToken = req.headers.authorization; // this is in header option manually set this token in every secure route request

      const accessToken = req.headers.authorization?.split(" ")[1]; // in Authorization for (Inherit auth from parent) option which autometically come after login

      // console.log(accessToken);

      if (!accessToken) {
        throw new AppError(403, "Please provide a valid access token.");
      }

      const verifiedToken = verifyToken(
        accessToken,
        configs.jwt_access_secret,
      ) as JwtPayload;

      const isUserExist = await User.findOne({
        email: verifiedToken.email,
      });

      if (!isUserExist) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "User does not exist from checkAuth",
        );
      }

      if (!isUserExist.isVerified) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is not verified!");
      }

      if (
        isUserExist.isActive === IsActive.BLOCKED ||
        isUserExist.isActive === IsActive.INACTIVE
      ) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `User is ${isUserExist.isActive}`,
        );
      }

      if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
      }

      if (!authRole.includes(verifiedToken.role)) {
        throw new AppError(403, "You are not permitted to access this route.");
      }

      req.user = verifiedToken;
      next();
    } catch (error) {
      next(error);
    }
  };

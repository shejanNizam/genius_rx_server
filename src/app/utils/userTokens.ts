import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { configs } from "../config/index";
import AppError from "../errorHelpers/AppError";
import { IsActive, IUser } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { genarateToken, verifyToken } from "./jwt";

export const createUserTokens = (user: Partial<IUser>) => {
  const jwtPayload = {
    _id: user._id?.toString(),
    email: user.email,
    role: user.role,
  };

  // genarate access token
  const accessToken = genarateToken(
    jwtPayload,
    configs.jwt_access_secret,
    configs.jwt_access_expires,
  );

  const refreshToken = genarateToken(
    jwtPayload,
    configs.jwt_refresh_secret,
    configs.jwt_refresh_expires,
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const createNewAccessTokenWithRefreshToken = async (
  refreshToken: string,
) => {
  const verifiedRefreshToken = verifyToken(
    refreshToken,
    configs.jwt_refresh_secret,
  ) as JwtPayload;

  const isUserExist = await User.findOne({ email: verifiedRefreshToken.email });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
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

  const jwtPayload = {
    _id: isUserExist._id?.toString(),
    email: isUserExist.email,
    role: isUserExist.role,
  };
  const accessToken = genarateToken(
    jwtPayload,
    configs.jwt_access_secret,
    configs.jwt_access_expires,
  );

  return accessToken;
};

/* eslint-disable @typescript-eslint/no-explicit-any */

import bcrypt from "bcrypt";
import httpStatus from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import { configs } from "../../config/index";
import AppError from "../../errorHelpers/AppError";
import { sendEmail } from "../../utils/sendEmail";
import {
  createNewAccessTokenWithRefreshToken,
  createUserTokens,
} from "../../utils/userTokens";
import { IAuthProvider, IsActive, IUser } from "../user/user.interface";
import { User } from "../user/user.model";

const credentialLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email is required");
  }

  const isUserExist = await User.findOne({ email }).select("+password");

  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User with this email not found");
  }

  const isPasswordMatch = await bcrypt.compare(
    password as string,
    isUserExist.password as string,
  );

  if (!isPasswordMatch) {
    throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password");
  }

  const userTokens = createUserTokens(isUserExist);

  const userObj = isUserExist.toObject();
  delete userObj.password;

  return {
    accessToken: userTokens.accessToken,
    refreshToken: userTokens.refreshToken,
    user: userObj,
  };
};

const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken =
    await createNewAccessTokenWithRefreshToken(refreshToken);

  return {
    accessToken: newAccessToken,
  };
};

const changePassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload,
) => {
  const user = await User.findById(decodedToken._id).select("+password");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!oldPassword || !newPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Old password and new password are required",
    );
  }
  if (oldPassword === newPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "New password cannot be the same as the old password",
    );
  }

  const isOldPasswordMatch = await bcrypt.compare(
    oldPassword,
    user.password as string,
  );
  if (!isOldPasswordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old Password does not match");
  }

  user.password = await bcrypt.hash(
    newPassword,
    Number(configs.bcrypt_salt_round),
  );

  await user.save();
};

const setPassword = async (userId: string, plainPassword: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(404, "User not found!");
  }

  if (
    user.password &&
    user.auths.some((providerObject) => providerObject.provider === "google")
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You have already set you password. Now you can change the password from your profile password update",
    );
  }

  const hasedPassword = await bcrypt.hash(
    plainPassword,
    Number(configs.bcrypt_salt_round),
  );

  const credentialProvider: IAuthProvider = {
    provider: "credentials",
    providerId: user.email,
  };

  const auths: IAuthProvider[] = [...user.auths, credentialProvider];

  user.password = hasedPassword;

  user.auths = auths;

  await user.save();
};

const forgotPassword = async (email: string) => {
  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
  }
  if (!isUserExist.isVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is not verified");
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

  const resetToken = jwt.sign(jwtPayload, configs.jwt_access_secret, {
    expiresIn: "10m",
  });

  // console.log(isUserExist._id);
  // console.log(resetToken);

  const resetUILink = `${configs.frontend_url}/reset-password?id=${isUserExist._id}&token=${resetToken}`;

  await sendEmail({
    to: isUserExist.email,
    subject: "Password Reset",
    templateName: "forgetPassword",
    templateData: {
      name: isUserExist.name,
      resetUILink,
    },
  });
};

const resetPassword = async (
  payload: Record<string, any>,
  decodedToken: JwtPayload,
) => {
  const { id, newPassword } = payload;
  // console.log("form service ==>", id, newPassword, decodedToken);

  if (!id || !newPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Id and new password are required",
    );
  }

  if (id !== decodedToken._id) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You can not reset password");
  }

  const isUserExist = await User.findById(decodedToken._id);

  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
  }

  isUserExist.password = await bcrypt.hash(
    newPassword,
    Number(configs.bcrypt_salt_round),
  );

  await isUserExist.save();
};

export const AuthServices = {
  credentialLogin,
  getNewAccessToken,
  changePassword,
  setPassword,
  forgotPassword,
  resetPassword,
};

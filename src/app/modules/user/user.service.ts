import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { configs } from "../../config/index";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email is required!");
  }

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exists!");
  }

  const hashPassword = await bcrypt.hash(
    password as string,
    Number(configs.bcrypt_salt_round),
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const user = await User.create({
    email,
    password: hashPassword,
    auths: [authProvider],
    ...rest,
  });

  const result = user.toObject();
  delete result.password;

  return result;
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload,
) => {
  if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
    if (userId !== decodedToken._id) {
      throw new AppError(401, "You are not authorized");
    }
  }

  const ifUserExist = await User.findById(userId);

  if (!ifUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  if (
    decodedToken.role === Role.ADMIN &&
    ifUserExist.role === Role.SUPER_ADMIN
  ) {
    throw new AppError(401, "You are not authorized");
  }

  /**
   * email - can not update
   * name, phone, password address
   * password - re hashing
   *  only admin superadmin - role, isDeleted...
   *
   * promoting to superadmin - superadmin
   */

  if (payload.role) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }

    // if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
    //   throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    // }
  }

  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    returnDocument: "after",
    runValidators: true,
  });

  return newUpdatedUser;
};

const getAllUsers = async () => {
  const users = await User.find({});
  const total = await User.countDocuments();

  return {
    data: users,
    meta: {
      page: 1,
      limit: users.length,
      totalPage: 1,
      total,
    },
  };
};

const getSingleUser = async (id: string) => {
  const user = await User.findById(id).select("-password");

  return {
    data: user,
  };
};

const getMe = async (id: string) => {
  const user = await User.findById(id).select("-password");

  return {
    data: user,
  };
};

export const UserServices = {
  createUser,
  updateUser,
  getAllUsers,
  getSingleUser,
  getMe,
};

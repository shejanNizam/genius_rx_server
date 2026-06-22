import crypto from "crypto";
import { redisClient } from "../../config/redis.config";
import AppError from "../../errorHelpers/AppError";
import { sendEmail } from "../../utils/sendEmail";
import { User } from "../user/user.model";

const OTP_EXPIRATION = 2 * 60;

const generateOtp = (length = 6) => {
  const otp = crypto.randomInt(10 ** (length - 1), 10 ** length);
  return otp;
};

const sendOTP = async (email: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.isEmailVerified) {
    throw new AppError(401, "You are already verified");
  }
  const otp = generateOtp();

  const redisKey = `otp:${email}`;

  await redisClient.set(redisKey, String(otp), {
    expiration: {
      type: "EX",
      value: OTP_EXPIRATION,
    },
  });

  await sendEmail({
    to: email,
    subject: "Your OTP Code",
    templateName: "otp",
    templateData: {
      name: user.name,
      otp: otp,
    },
  });
};

const verifyOTP = async (email: string, otp: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.isEmailVerified) {
    throw new AppError(401, "You are already verified");
  }

  const redisKey = `otp:${email}`;

  const savedOtp = await redisClient.get(redisKey);

  if (!savedOtp) {
    throw new AppError(401, "Invalid OTP");
  }

  if (savedOtp !== otp) {
    throw new AppError(401, "Invalid OTP");
  }

  await Promise.all([
    User.updateOne({ email }, { isEmailVerified: true }, { runValidators: true }),
    redisClient.del([redisKey]),
  ]);
};

export const OTPService = {
  sendOTP,
  verifyOTP,
};

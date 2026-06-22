/* eslint-disable no-console */
import bcrypt from "bcrypt";
import { configs } from "../config/index";
import { AuthIdentity } from "../modules/auth_identity/auth_identity.model";
import { AccessStatus, IUserInitial, UserRole } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";

export const seedAdmin = async () => {
  try {
    const exists = await User.findOne({ email: configs.admin_email });
    if (exists) {
      console.log("Admin already exists");
      return;
    }

    console.log("Creating Admin...");

    const hashedPassword = await bcrypt.hash(
      configs.admin_password,
      Number(configs.bcrypt_salt_round),
    );

    const payload: IUserInitial = {
      name: "Admin",
      role: UserRole.admin,
      email: configs.admin_email,
      password: hashedPassword,
      isEmailVerified: true,
      status: "active",
      accessStatus: AccessStatus.subscribed,
      isDeleted: false,
    };

    const admin = await User.create(payload);

    await AuthIdentity.create({
      userId: admin._id,
      provider: "local",
      providerId: configs.admin_email,
    });

    console.log("Admin created successfully.");
  } catch (error) {
    console.log(error);
  }
};

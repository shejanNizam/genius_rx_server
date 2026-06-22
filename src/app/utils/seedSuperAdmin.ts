/* eslint-disable no-console */
import bcrypt from "bcrypt";
import { configs } from "../config/index";
import { AuthIdentity } from "../modules/auth_identity/auth_identity.model";
import { AccessStatus, IUserInitial, UserRole } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";

export const seedSuperAdmin = async () => {
  try {
    const exists = await User.findOne({ email: configs.super_admin_email });
    if (exists) {
      console.log("Super Admin already exists");
      return;
    }

    console.log("Creating Super Admin...");

    const hashedPassword = await bcrypt.hash(
      configs.super_admin_password,
      Number(configs.bcrypt_salt_round),
    );

    const payload: IUserInitial = {
      name: "Super Admin",
      role: UserRole.super_admin,
      email: configs.super_admin_email,
      password: hashedPassword,
      isEmailVerified: true,
      status: "active",
      accessStatus: AccessStatus.subscribed,
      isDeleted: false,
    };

    const superAdmin = await User.create(payload);

    await AuthIdentity.create({
      userId: superAdmin._id,
      provider: "local",
      providerId: configs.super_admin_email,
    });

    console.log("Super Admin created successfully.");
  } catch (error) {
    console.log(error);
  }
};

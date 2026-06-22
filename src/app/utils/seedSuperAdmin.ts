/* eslint-disable no-console */
import bcrypt from "bcrypt";
import { configs } from "../config/index";
import { IAuthProvider, IUserInitial, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExists = await User.findOne({
      email: configs.super_admin_email,
    });

    if (isSuperAdminExists) {
      console.log("Super Admin already exists");
      return;
    }

    console.log("Trying to creating Super Admin...");

    const hashedSuperAdminPass = await bcrypt.hash(
      configs.super_admin_password,
      Number(configs.bcrypt_salt_round),
    );

    const authProvider: IAuthProvider = {
      provider: "credentials",
      providerId: configs.super_admin_email,
    };

    const payload: IUserInitial = {
      name: "Super Admin",
      role: Role.SUPER_ADMIN,
      email: configs.super_admin_email,
      password: hashedSuperAdminPass,
      isVerified: true,
      auths: [authProvider],
    };

    const superAdmin = await User.create(payload);
    console.log("Super Admin created successfully.");
    console.log(superAdmin);
  } catch (error) {
    console.log(error);
  }
};

/* eslint-disable no-console */
import bcrypt from "bcrypt";
import { configs } from "../config/index";
import { IAuthProvider, IUserInitial, Role } from "../modules/user/user.interface";

import { User } from "../modules/user/user.model";

export const seedAdmin = async () => {
  try {
    const isAdminExists = await User.findOne({
      email: configs.admin_email,
    });

    if (isAdminExists) {
      console.log("Admin already exists");
      return;
    }

    console.log("Trying to creating Admin...");

    const hashedAdminPass = await bcrypt.hash(
      configs.admin_password,
      Number(configs.bcrypt_salt_round),
    );

    const authProvider: IAuthProvider = {
      provider: "credentials",
      providerId: configs.admin_email,
    };

    const payload: IUserInitial = {
      name: "Admin",
      role: Role.ADMIN,
      email: configs.admin_email,
      password: hashedAdminPass,
      isVerified: true,
      auths: [authProvider],
    };

    const admin = await User.create(payload);
    console.log("Admin created successfully.");
    console.log(admin);
  } catch (error) {
    console.log(error);
  }
};

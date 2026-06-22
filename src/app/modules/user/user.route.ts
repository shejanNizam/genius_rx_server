import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import validateRequest from "../../middlewares/validateRequest";
import { UserControllers } from "./user.controller";
import { UserRole } from "./user.interface";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserControllers.createUser,
);

router.get(
  "/all-users",
  checkAuth(UserRole.admin, UserRole.super_admin),
  UserControllers.getAllUsers,
);

router.get(
  "/me",
  checkAuth(...Object.values(UserRole)),
  UserControllers.getMe,
);

router.get(
  "/:id",
  checkAuth(UserRole.admin, UserRole.super_admin),
  UserControllers.getSingleUser,
);

router.patch(
  "/:id",
  validateRequest(updateUserZodSchema),
  checkAuth(...Object.values(UserRole)),
  UserControllers.updateUser,
);

router.delete(
  "/:id",
  checkAuth(UserRole.admin, UserRole.super_admin),
  UserControllers.deleteUser,
);

export const UserRoutes = router;

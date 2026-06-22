import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import validateRequest from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { DemoControllers } from "./demo.controller";
import { createDemoZodSchema, updateDemoZodSchema } from "./demo.validation";

const router = Router();

router.post(
  "/create",
  checkAuth(...Object.values(Role)),
  validateRequest(createDemoZodSchema),
  DemoControllers.createDemo,
);

router.get("/all", DemoControllers.getAllDemos);

router.get("/:id", DemoControllers.getSingleDemo);

router.patch(
  "/:id",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  validateRequest(updateDemoZodSchema),
  DemoControllers.updateDemo,
);

router.delete(
  "/:id",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  DemoControllers.deleteDemo,
);

export const DemoRoutes = router;

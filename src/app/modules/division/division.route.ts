import { Router } from "express";
import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../middlewares/checkAuth";
import validateRequest from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { DivisionControllers } from "./division.controller";
import {
  createDivisionSchema,
  updateDivisionSchema,
} from "./division.validation";

const router = Router();

router.post(
  "/create",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.single("file"),
  validateRequest(createDivisionSchema),
  DivisionControllers.createDivision,
);
router.get("/all", DivisionControllers.getAllDivisions);
router.get("/:slug", DivisionControllers.getSingleDivision);
router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.single("file"),
  validateRequest(updateDivisionSchema),
  DivisionControllers.updateDivision,
);
router.delete("/:id", DivisionControllers.deleteDivision);

export const DivisionRoutes = router;

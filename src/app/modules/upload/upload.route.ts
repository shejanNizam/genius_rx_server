import { Router } from "express";
import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { UploadControllers } from "./upload.controller";

const router = Router();
const allRoles = Object.values(UserRole) as string[];

// POST /api/v1/upload
// field: "files" — send 1 file → returns { url, publicId }
//                — send 2-10 files → returns [{ url, publicId }, ...]
router.post(
  "/",
  checkAuth(...allRoles),
  multerUpload.array("files", 10),
  UploadControllers.uploadFiles,
);

export const UploadRoutes = router;

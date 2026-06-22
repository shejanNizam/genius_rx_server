import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { StaticContentControllers } from "./static_content.controller";

const router = Router();
const { admin, super_admin } = UserRole;

router.get("/", StaticContentControllers.getAllContent);
router.get("/:type", StaticContentControllers.getByType);
router.put("/:type", checkAuth(admin, super_admin), StaticContentControllers.upsertContent);

export const StaticContentRoutes = router;

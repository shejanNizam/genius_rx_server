import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { BlockControllers } from "./block.controller";

const router = Router();
const allRoles = Object.values(UserRole) as string[];

router.post("/", checkAuth(...allRoles), BlockControllers.blockUser);
router.get("/my", checkAuth(...allRoles), BlockControllers.getMyBlockList);
router.delete("/:userId", checkAuth(...allRoles), BlockControllers.unblockUser);

export const BlockRoutes = router;

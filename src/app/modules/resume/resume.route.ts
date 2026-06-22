import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { ResumeControllers } from "./resume.controller";

const router = Router();
const seeker = UserRole.job_seeker;
const allRoles = Object.values(UserRole) as string[];

router.post("/", checkAuth(seeker), ResumeControllers.createResume);
router.get("/my", checkAuth(seeker), ResumeControllers.getMyResumes);
router.get("/:id", checkAuth(...allRoles), ResumeControllers.getSingleResume);
router.patch("/:id/set-default", checkAuth(seeker), ResumeControllers.setDefault);
router.delete("/:id", checkAuth(seeker), ResumeControllers.deleteResume);

export const ResumeRoutes = router;

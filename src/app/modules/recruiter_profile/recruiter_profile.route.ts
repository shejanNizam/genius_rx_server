import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { RecruiterProfileControllers } from "./recruiter_profile.controller";

const router = Router();
const { recruiter, job_seeker, admin, super_admin } = UserRole;

router.put("/", checkAuth(recruiter), RecruiterProfileControllers.upsertProfile);
router.get("/my", checkAuth(recruiter), RecruiterProfileControllers.getMyProfile);
router.get("/", checkAuth(job_seeker, admin, super_admin), RecruiterProfileControllers.getAllProfiles);
router.get("/:id", checkAuth(job_seeker, recruiter, admin, super_admin), RecruiterProfileControllers.getProfileById);

export const RecruiterProfileRoutes = router;

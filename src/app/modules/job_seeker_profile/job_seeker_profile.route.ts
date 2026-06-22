import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { JobSeekerProfileControllers } from "./job_seeker_profile.controller";

const router = Router();
const { job_seeker, recruiter, admin, super_admin } = UserRole;

router.put("/", checkAuth(job_seeker), JobSeekerProfileControllers.upsertProfile);
router.get("/my", checkAuth(job_seeker), JobSeekerProfileControllers.getMyProfile);
router.get("/", checkAuth(recruiter, admin, super_admin), JobSeekerProfileControllers.getAllProfiles);
router.get("/:id", checkAuth(recruiter, admin, super_admin, job_seeker), JobSeekerProfileControllers.getProfileById);

export const JobSeekerProfileRoutes = router;

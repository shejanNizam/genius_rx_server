import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { InstructorProfileControllers } from "./instructor_profile.controller";

const router = Router();
const { instructor, job_seeker, admin, super_admin } = UserRole;

router.put("/", checkAuth(instructor), InstructorProfileControllers.upsertProfile);
router.get("/my", checkAuth(instructor), InstructorProfileControllers.getMyProfile);
router.get("/", checkAuth(job_seeker, admin, super_admin), InstructorProfileControllers.getAllProfiles);
router.get("/:id", checkAuth(job_seeker, instructor, admin, super_admin), InstructorProfileControllers.getProfileById);

export const InstructorProfileRoutes = router;

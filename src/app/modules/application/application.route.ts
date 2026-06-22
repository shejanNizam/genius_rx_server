import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { ApplicationControllers } from "./application.controller";

const router = Router();
const { job_seeker, recruiter } = UserRole;

router.post("/", checkAuth(job_seeker), ApplicationControllers.apply);
router.get("/my", checkAuth(job_seeker), ApplicationControllers.getMyApplications);
router.get("/job/:jobId", checkAuth(recruiter), ApplicationControllers.getJobApplications);
router.patch("/:id/status", checkAuth(recruiter), ApplicationControllers.updateStatus);

export const ApplicationRoutes = router;

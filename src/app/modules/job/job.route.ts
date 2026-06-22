import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { JobControllers } from "./job.controller";

const router = Router();
// const { recruiter, job_seeker, instructor, admin, super_admin } = UserRole;
const { recruiter, admin, super_admin } = UserRole;

router.post("/", checkAuth(recruiter), JobControllers.createJob);
router.get("/", JobControllers.getAllJobs);
router.get("/my", checkAuth(recruiter), JobControllers.getMyJobs);
router.get("/:id", JobControllers.getJobById);
router.patch("/:id", checkAuth(recruiter), JobControllers.updateJob);
router.delete(
  "/admin/:id",
  checkAuth(admin, super_admin),
  JobControllers.adminDeleteJob,
);
router.delete("/:id", checkAuth(recruiter), JobControllers.deleteJob);

export const JobRoutes = router;

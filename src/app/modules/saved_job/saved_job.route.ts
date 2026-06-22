import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { SavedJobControllers } from "./saved_job.controller";

const router = Router();

router.post("/", checkAuth(UserRole.job_seeker), SavedJobControllers.saveJob);
router.get("/my", checkAuth(UserRole.job_seeker), SavedJobControllers.getMySavedJobs);
router.delete("/:jobId", checkAuth(UserRole.job_seeker), SavedJobControllers.unsaveJob);

export const SavedJobRoutes = router;

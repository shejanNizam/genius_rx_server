import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { MessageControllers } from "./message.controller";

const router = Router();
const { recruiter, job_seeker, instructor } = UserRole;

router.post("/", checkAuth(recruiter, job_seeker, instructor), MessageControllers.sendMessage);
router.get("/:conversationId", checkAuth(recruiter, job_seeker, instructor), MessageControllers.getMessages);
router.patch("/:conversationId/read", checkAuth(recruiter, job_seeker, instructor), MessageControllers.markRead);

export const MessageRoutes = router;

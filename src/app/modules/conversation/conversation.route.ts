import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { ConversationControllers } from "./conversation.controller";

const router = Router();
const { recruiter, job_seeker, instructor } = UserRole;

router.post("/", checkAuth(recruiter, job_seeker, instructor), ConversationControllers.startConversation);
router.get("/", checkAuth(recruiter, job_seeker, instructor), ConversationControllers.getMyConversations);
router.get("/:id", checkAuth(recruiter, job_seeker, instructor), ConversationControllers.getConversationById);

export const ConversationRoutes = router;

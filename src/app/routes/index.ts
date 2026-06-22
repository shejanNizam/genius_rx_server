import { Router } from "express";
import { ApplicationRoutes } from "../modules/application/application.route";
import { AtsCheckRoutes } from "../modules/ats_check/ats_check.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { BlockRoutes } from "../modules/block/block.route";
import { ConversationRoutes } from "../modules/conversation/conversation.route";
import { DeviceTokenRoutes } from "../modules/device_token/device_token.route";
import { InstructorProfileRoutes } from "../modules/instructor_profile/instructor_profile.route";
import { JobRoutes } from "../modules/job/job.route";
import { JobSeekerProfileRoutes } from "../modules/job_seeker_profile/job_seeker_profile.route";
import { MessageRoutes } from "../modules/message/message.route";
import { ModerationLogRoutes } from "../modules/moderation_log/moderation_log.route";
import { NotificationRoutes } from "../modules/notification/notification.route";
import { OtpRoutes } from "../modules/otp/otp.route";
import { RecruiterProfileRoutes } from "../modules/recruiter_profile/recruiter_profile.route";
import { ReportRoutes } from "../modules/report/report.route";
import { ResumeRoutes } from "../modules/resume/resume.route";
import { SavedJobRoutes } from "../modules/saved_job/saved_job.route";
import { StaticContentRoutes } from "../modules/static_content/static_content.route";
import { SubscriptionRoutes } from "../modules/subscription/subscription.route";
import { SubscriptionPlanRoutes } from "../modules/subscription_plan/subscription_plan.route";
import { TransactionRoutes } from "../modules/transaction/transaction.route";
import { StatsRoutes } from "../modules/stats/stats.route";
import { UploadRoutes } from "../modules/upload/upload.route";
import { UserRoutes } from "../modules/user/user.route";

const router = Router();

const moduleRoutes = [
  { path: "/upload", route: UploadRoutes },
  { path: "/auth", route: AuthRoutes },
  { path: "/user", route: UserRoutes },
  { path: "/otp", route: OtpRoutes },
  { path: "/device-token", route: DeviceTokenRoutes },
  { path: "/resume", route: ResumeRoutes },
  { path: "/job-seeker-profile", route: JobSeekerProfileRoutes },
  { path: "/recruiter-profile", route: RecruiterProfileRoutes },
  { path: "/instructor-profile", route: InstructorProfileRoutes },
  { path: "/ats-check", route: AtsCheckRoutes },
  { path: "/job", route: JobRoutes },
  { path: "/application", route: ApplicationRoutes },
  { path: "/saved-job", route: SavedJobRoutes },
  { path: "/conversation", route: ConversationRoutes },
  { path: "/message", route: MessageRoutes },
  { path: "/block", route: BlockRoutes },
  { path: "/report", route: ReportRoutes },
  { path: "/moderation-log", route: ModerationLogRoutes },
  { path: "/subscription-plan", route: SubscriptionPlanRoutes },
  { path: "/subscription", route: SubscriptionRoutes },
  { path: "/transaction", route: TransactionRoutes },
  { path: "/content", route: StaticContentRoutes },
  { path: "/notification", route: NotificationRoutes },
  { path: "/stats", route: StatsRoutes },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;

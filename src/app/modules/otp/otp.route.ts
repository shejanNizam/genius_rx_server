import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { OTPController } from "./otp.controller";
import { sendOtpZodSchema, verifyOtpZodSchema } from "./otp.validation";

const router = Router();

router.post("/send", validateRequest(sendOtpZodSchema), OTPController.sendOTP);
router.post("/verify", validateRequest(verifyOtpZodSchema), OTPController.verifyOTP);

export const OtpRoutes = router;

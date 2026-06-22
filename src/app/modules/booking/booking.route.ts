import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import validateRequest from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { BookingController } from "./booking.controller";
import { BookingValidation } from "./booking.validation";

const router = Router();

router.post(
  "/create",
  checkAuth(...Object.values(Role)),
  validateRequest(BookingValidation.createBookingSchema),
  BookingController.createBooking,
);

export const BookingRoutes = router;

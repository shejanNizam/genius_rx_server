import { z } from "zod";

export const BookingValidation = {
  createBookingSchema: z.object({
    tour: z.string().min(1, "Tour ID is required"),
    guestCount: z.coerce.number().int().min(1, "Guest count must be at least 1"),
  }),
};

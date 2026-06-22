/* eslint-disable @typescript-eslint/no-explicit-any */

import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { getTransactionId } from "../../utils/getTransactionId";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Payment } from "../payment/payment.model";
import { Tour } from "../tour/tour.model";
import { User } from "../user/user.model";
import { BOOKING_STATUS, IBooking } from "./booking.interface";
import { Booking } from "./booking.model";

const createBooking = async (payload: Partial<IBooking>, userId: string) => {
  const transactionId = getTransactionId();
  const session = await Booking.startSession();

  try {
    session.startTransaction();

    const user = await User.findById(userId).session(session);
    if (!user?.phone || !user?.address) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Please update your profile with phone and address before making a booking.",
      );
    }

    const tour = await Tour.findById(payload.tour)
      .select("costFrom")
      .session(session);
    if (!tour?.costFrom) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Tour not found or has no cost.",
      );
    }

    const amount = Number(tour.costFrom) * Number(payload.guestCount);

    const [booking] = await Booking.create(
      [
        {
          user: userId,
          status: BOOKING_STATUS.PENDING,
          ...payload,
        },
      ],
      { session },
    );

    if (!booking) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Booking could not be created.",
      );
    }

    const [payment] = await Payment.create(
      [
        {
          booking: booking._id,
          status: PAYMENT_STATUS.UNPAID,
          transactionId: transactionId,
          amount: amount.toString(),
        },
      ],
      { session },
    );

    if (!payment) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Payment could not be created.",
      );
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      booking._id,
      { payment: payment._id },
      { returnDocument: "after", runValidators: true, session },
    )
      .populate("user", "name email phone address")
      .populate("tour", "title costFrom")
      .populate("payment");

    if (!updatedBooking) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Booking could not be updated with payment.",
      );
    }

    await session.commitTransaction();

    return { booking: updatedBooking };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const BookingService = {
  createBooking,
};

import { Booking } from "../booking/booking.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Payment } from "../payment/payment.model";
import { Tour } from "../tour/tour.model";
import { IsActive } from "../user/user.interface";
import { User } from "../user/user.model";

const getDateRanges = () => {
  const now = new Date();
  return {
    sevenDaysAgo: new Date(new Date().setDate(now.getDate() - 7)),
    thirtyDaysAgo: new Date(new Date().setDate(now.getDate() - 30)),
  };
};

const getUserStats = async () => {
  const { sevenDaysAgo, thirtyDaysAgo } = getDateRanges();

  const totalUsersPromise = User.countDocuments();
  const totalActiveUsersPromise = User.countDocuments({
    isActive: IsActive.ACTIVE,
  });
  const totalInActiveUsersPromise = User.countDocuments({
    isActive: IsActive.INACTIVE,
  });
  const totalBlockedUsersPromise = User.countDocuments({
    isActive: IsActive.BLOCKED,
  });
  const newUsersInLast7DaysPromise = User.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });
  const newUsersInLast30DaysPromise = User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });
  const usersByRolePromise = User.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ]);

  const [
    totalUsers,
    totalActiveUsers,
    totalInActiveUsers,
    totalBlockedUsers,
    newUsersInLast7Days,
    newUsersInLast30Days,
    usersByRole,
  ] = await Promise.all([
    totalUsersPromise,
    totalActiveUsersPromise,
    totalInActiveUsersPromise,
    totalBlockedUsersPromise,
    newUsersInLast7DaysPromise,
    newUsersInLast30DaysPromise,
    usersByRolePromise,
  ]);

  return {
    totalUsers,
    totalActiveUsers,
    totalInActiveUsers,
    totalBlockedUsers,
    newUsersInLast7Days,
    newUsersInLast30Days,
    usersByRole,
  };
};

const getTourStats = async () => {
  const totalTourPromise = Tour.countDocuments();

  const totalTourByTourTypePromise = Tour.aggregate([
    {
      $lookup: {
        from: "tourtypes",
        localField: "tourType",
        foreignField: "_id",
        as: "type",
      },
    },
    { $unwind: "$type" },
    {
      $group: {
        _id: "$type.name",
        count: { $sum: 1 },
      },
    },
  ]);

  const avgTourCostPromise = Tour.aggregate([
    {
      $group: {
        _id: null,
        avgCostFrom: { $avg: "$costFrom" },
      },
    },
  ]);

  const totalTourByDivisionPromise = Tour.aggregate([
    {
      $lookup: {
        from: "divisions",
        localField: "division",
        foreignField: "_id",
        as: "division",
      },
    },
    { $unwind: "$division" },
    {
      $group: {
        _id: "$division.name",
        count: { $sum: 1 },
      },
    },
  ]);

  const totalHighestBookedTourPromise = Booking.aggregate([
    {
      $group: {
        _id: "$tour",
        bookingCount: { $sum: 1 },
      },
    },
    { $sort: { bookingCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "tours",
        let: { tourId: "$_id" },
        pipeline: [
          {
            $match: { $expr: { $eq: ["$_id", "$$tourId"] } },
          },
        ],
        as: "tour",
      },
    },
    { $unwind: "$tour" },
    {
      $project: {
        bookingCount: 1,
        "tour.title": 1,
        "tour.slug": 1,
      },
    },
  ]);

  const [
    totalTour,
    totalTourByTourType,
    avgTourCostResult,
    totalTourByDivision,
    totalHighestBookedTour,
  ] = await Promise.all([
    totalTourPromise,
    totalTourByTourTypePromise,
    avgTourCostPromise,
    totalTourByDivisionPromise,
    totalHighestBookedTourPromise,
  ]);

  return {
    totalTour,
    totalTourByTourType,
    avgTourCost: avgTourCostResult[0]?.avgCostFrom ?? 0,
    totalTourByDivision,
    totalHighestBookedTour,
  };
};

const getBookingStats = async () => {
  const { sevenDaysAgo, thirtyDaysAgo } = getDateRanges();

  const totalBookingPromise = Booking.countDocuments();

  const totalBookingByStatusPromise = Booking.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const bookingsPerTourPromise = Booking.aggregate([
    {
      $group: {
        _id: "$tour",
        bookingCount: { $sum: 1 },
      },
    },
    { $sort: { bookingCount: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "tours",
        localField: "_id",
        foreignField: "_id",
        as: "tour",
      },
    },
    { $unwind: "$tour" },
    {
      $project: {
        _id: 1,
        bookingCount: 1,
        "tour.title": 1,
        "tour.slug": 1,
      },
    },
  ]);

  const avgGuestCountPromise = Booking.aggregate([
    {
      $group: {
        _id: null,
        avgGuestCount: { $avg: "$guestCount" },
      },
    },
  ]);

  const bookingsLast7DaysPromise = Booking.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });
  const bookingsLast30DaysPromise = Booking.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });
  const totalBookingByUniqueUsersPromise = Booking.distinct("user").then(
    (users) => users.length,
  );

  const [
    totalBooking,
    totalBookingByStatus,
    bookingsPerTour,
    avgGuestCountResult,
    bookingsLast7Days,
    bookingsLast30Days,
    totalBookingByUniqueUsers,
  ] = await Promise.all([
    totalBookingPromise,
    totalBookingByStatusPromise,
    bookingsPerTourPromise,
    avgGuestCountPromise,
    bookingsLast7DaysPromise,
    bookingsLast30DaysPromise,
    totalBookingByUniqueUsersPromise,
  ]);

  return {
    totalBooking,
    totalBookingByStatus,
    bookingsPerTour,
    avgGuestCountPerBooking: avgGuestCountResult[0]?.avgGuestCount ?? 0,
    bookingsLast7Days,
    bookingsLast30Days,
    totalBookingByUniqueUsers,
  };
};

const getPaymentStats = async () => {
  const totalPaymentPromise = Payment.countDocuments();

  const totalPaymentByStatusPromise = Payment.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const totalRevenuePromise = Payment.aggregate([
    { $match: { status: PAYMENT_STATUS.PAID } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
      },
    },
  ]);

  const avgPaymentAmountPromise = Payment.aggregate([
    {
      $group: {
        _id: null,
        avgPaymentAmount: { $avg: "$amount" },
      },
    },
  ]);

  const paymentGatewayDataPromise = Payment.aggregate([
    {
      $group: {
        _id: { $ifNull: ["$paymentGatewayData.status", "UNKNOWN"] },
        count: { $sum: 1 },
      },
    },
  ]);

  const [
    totalPayment,
    totalPaymentByStatus,
    totalRevenueResult,
    avgPaymentAmountResult,
    paymentGatewayData,
  ] = await Promise.all([
    totalPaymentPromise,
    totalPaymentByStatusPromise,
    totalRevenuePromise,
    avgPaymentAmountPromise,
    paymentGatewayDataPromise,
  ]);

  return {
    totalPayment,
    totalPaymentByStatus,
    totalRevenue: totalRevenueResult[0]?.totalRevenue ?? 0,
    avgPaymentAmount: avgPaymentAmountResult[0]?.avgPaymentAmount ?? 0,
    paymentGatewayData,
  };
};

export const StatsService = {
  getUserStats,
  getTourStats,
  getBookingStats,
  getPaymentStats,
};

// advanced

// import { Booking } from "../booking/booking.model";
// import { PAYMENT_STATUS } from "../payment/payment.interface";
// import { Payment } from "../payment/payment.model";
// import { Tour } from "../tour/tour.model";
// import { IsActive } from "../user/user.interface";
// import { User } from "../user/user.model";

// const getDateRanges = () => {
//   const now = new Date();
//   return {
//     sevenDaysAgo: new Date(new Date().setDate(now.getDate() - 7)),
//     thirtyDaysAgo: new Date(new Date().setDate(now.getDate() - 30)),
//   };
// };

// const getUserStats = async () => {
//   const { sevenDaysAgo, thirtyDaysAgo } = getDateRanges();

//   const [
//     totalUsers,
//     totalActiveUsers,
//     totalInActiveUsers,
//     totalBlockedUsers,
//     newUsersInLast7Days,
//     newUsersInLast30Days,
//     usersByRole,
//   ] = await Promise.all([
//     User.countDocuments(),
//     User.countDocuments({ isActive: IsActive.ACTIVE }),
//     User.countDocuments({ isActive: IsActive.INACTIVE }),
//     User.countDocuments({ isActive: IsActive.BLOCKED }),
//     User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
//     User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
//     User.aggregate([
//       {
//         $group: {
//           _id: "$role",
//           count: { $sum: 1 },
//         },
//       },
//     ]),
//   ]);

//   return {
//     totalUsers,
//     totalActiveUsers,
//     totalInActiveUsers,
//     totalBlockedUsers,
//     newUsersInLast7Days,
//     newUsersInLast30Days,
//     usersByRole,
//   };
// };

// const getTourStats = async () => {
//   const [
//     totalTour,
//     totalTourByTourType,
//     avgTourCostResult,
//     totalTourByDivision,
//     totalHighestBookedTour,
//   ] = await Promise.all([
//     Tour.countDocuments(),

//     Tour.aggregate([
//       {
//         $lookup: {
//           from: "tourtypes",
//           localField: "tourType",
//           foreignField: "_id",
//           as: "type",
//         },
//       },
//       { $unwind: "$type" },
//       {
//         $group: {
//           _id: "$type.name",
//           count: { $sum: 1 },
//         },
//       },
//     ]),

//     Tour.aggregate([
//       {
//         $group: {
//           _id: null,
//           avgCostFrom: { $avg: "$costFrom" },
//         },
//       },
//     ]),

//     Tour.aggregate([
//       {
//         $lookup: {
//           from: "divisions",
//           localField: "division",
//           foreignField: "_id",
//           as: "division",
//         },
//       },
//       { $unwind: "$division" },
//       {
//         $group: {
//           _id: "$division.name",
//           count: { $sum: 1 },
//         },
//       },
//     ]),

//     Booking.aggregate([
//       {
//         $group: {
//           _id: "$tour",
//           bookingCount: { $sum: 1 },
//         },
//       },
//       { $sort: { bookingCount: -1 } },
//       { $limit: 5 },
//       {
//         $lookup: {
//           from: "tours",
//           let: { tourId: "$_id" },
//           pipeline: [
//             {
//               $match: { $expr: { $eq: ["$_id", "$$tourId"] } },
//             },
//           ],
//           as: "tour",
//         },
//       },
//       { $unwind: "$tour" },
//       {
//         $project: {
//           bookingCount: 1,
//           "tour.title": 1,
//           "tour.slug": 1,
//         },
//       },
//     ]),
//   ]);

//   return {
//     totalTour,
//     totalTourByTourType,
//     avgTourCost: avgTourCostResult[0]?.avgCostFrom ?? 0,
//     totalTourByDivision,
//     totalHighestBookedTour,
//   };
// };

// const getBookingStats = async () => {
//   const { sevenDaysAgo, thirtyDaysAgo } = getDateRanges();

//   const [
//     totalBooking,
//     totalBookingByStatus,
//     bookingsPerTour,
//     avgGuestCountResult,
//     bookingsLast7Days,
//     bookingsLast30Days,
//     totalBookingByUniqueUsers,
//   ] = await Promise.all([
//     Booking.countDocuments(),

//     Booking.aggregate([
//       {
//         $group: {
//           _id: "$status",
//           count: { $sum: 1 },
//         },
//       },
//     ]),

//     Booking.aggregate([
//       {
//         $group: {
//           _id: "$tour",
//           bookingCount: { $sum: 1 },
//         },
//       },
//       { $sort: { bookingCount: -1 } },
//       { $limit: 10 },
//       {
//         $lookup: {
//           from: "tours",
//           localField: "_id",
//           foreignField: "_id",
//           as: "tour",
//         },
//       },
//       { $unwind: "$tour" },
//       {
//         $project: {
//           _id: 1,
//           bookingCount: 1,
//           "tour.title": 1,
//           "tour.slug": 1,
//         },
//       },
//     ]),

//     Booking.aggregate([
//       {
//         $group: {
//           _id: null,
//           avgGuestCount: { $avg: "$guestCount" },
//         },
//       },
//     ]),

//     Booking.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
//     Booking.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),

//     Booking.distinct("user").then((users) => users.length),
//   ]);

//   return {
//     totalBooking,
//     totalBookingByStatus,
//     bookingsPerTour,
//     avgGuestCountPerBooking: avgGuestCountResult[0]?.avgGuestCount ?? 0,
//     bookingsLast7Days,
//     bookingsLast30Days,
//     totalBookingByUniqueUsers,
//   };
// };

// const getPaymentStats = async () => {
//   const [
//     totalPayment,
//     totalPaymentByStatus,
//     totalRevenueResult,
//     avgPaymentAmountResult,
//     paymentGatewayData,
//   ] = await Promise.all([
//     Payment.countDocuments(),

//     Payment.aggregate([
//       {
//         $group: {
//           _id: "$status",
//           count: { $sum: 1 },
//         },
//       },
//     ]),

//     Payment.aggregate([
//       { $match: { status: PAYMENT_STATUS.PAID } },
//       {
//         $group: {
//           _id: null,
//           totalRevenue: { $sum: "$amount" },
//         },
//       },
//     ]),

//     Payment.aggregate([
//       {
//         $group: {
//           _id: null,
//           avgPaymentAmount: { $avg: "$amount" },
//         },
//       },
//     ]),

//     Payment.aggregate([
//       {
//         $group: {
//           _id: { $ifNull: ["$paymentGatewayData.status", "UNKNOWN"] },
//           count: { $sum: 1 },
//         },
//       },
//     ]),
//   ]);

//   return {
//     totalPayment,
//     totalPaymentByStatus,
//     totalRevenue: totalRevenueResult[0]?.totalRevenue ?? 0,
//     avgPaymentAmount: avgPaymentAmountResult[0]?.avgPaymentAmount ?? 0,
//     paymentGatewayData,
//   };
// };

// export const StatsService = {
//   getUserStats,
//   getTourStats,
//   getBookingStats,
//   getPaymentStats,
// };

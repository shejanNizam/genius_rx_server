import { UserRole } from "../user/user.interface";
import { User } from "../user/user.model";
import { Job } from "../job/job.model";
import { Transaction } from "../transaction/transaction.model";
import { Application } from "../application/application.model";

const getChangePercent = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(1));
};

const getMonthBounds = () => {
  const now = new Date();
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return { startThisMonth, startLastMonth };
};

const getOverviewStats = async () => {
  const { startThisMonth, startLastMonth } = getMonthBounds();

  const [
    totalUsersByRole,
    newUsersThisMonthByRole,
    newUsersLastMonthByRole,
    allTimeEarnings,
    thisMonthEarnings,
    lastMonthEarnings,
    totalJobs,
    newJobsThisMonth,
    newJobsLastMonth,
    recentUsers,
  ] = await Promise.all([
    // Total users grouped by role
    User.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]),
    // New users this month grouped by role
    User.aggregate([
      { $match: { isDeleted: false, createdAt: { $gte: startThisMonth } } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]),
    // New users last month grouped by role
    User.aggregate([
      {
        $match: {
          isDeleted: false,
          createdAt: { $gte: startLastMonth, $lt: startThisMonth },
        },
      },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]),
    // All-time successful transaction total
    Transaction.aggregate([
      { $match: { status: "success" } },
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: "$amount" } },
        },
      },
    ]),
    // This month successful transaction total
    Transaction.aggregate([
      { $match: { status: "success", createdAt: { $gte: startThisMonth } } },
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: "$amount" } },
        },
      },
    ]),
    // Last month successful transaction total
    Transaction.aggregate([
      {
        $match: {
          status: "success",
          createdAt: { $gte: startLastMonth, $lt: startThisMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: "$amount" } },
        },
      },
    ]),
    // Total active jobs
    Job.countDocuments({ isDeleted: false }),
    // New jobs posted this month
    Job.countDocuments({ isDeleted: false, createdAt: { $gte: startThisMonth } }),
    // New jobs posted last month
    Job.countDocuments({
      isDeleted: false,
      createdAt: { $gte: startLastMonth, $lt: startThisMonth },
    }),
    // 10 most recent users
    User.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name email role status accessStatus avatar createdAt"),
  ]);

  // Build lookup maps by role
  const toRoleMap = (arr: { _id: string; count: number }[]) =>
    Object.fromEntries(arr.map(({ _id, count }) => [_id, count]));

  const totalMap = toRoleMap(totalUsersByRole);
  const thisMonthMap = toRoleMap(newUsersThisMonthByRole);
  const lastMonthMap = toRoleMap(newUsersLastMonthByRole);

  const totalUsersCount = Object.values(totalMap).reduce((a, b) => a + b, 0);
  const newTotalThisMonth = Object.values(thisMonthMap).reduce((a, b) => a + b, 0);
  const newTotalLastMonth = Object.values(lastMonthMap).reduce((a, b) => a + b, 0);

  const totalEarningsAmount = allTimeEarnings[0]?.total ?? 0;
  const thisMonthEarningsAmount = thisMonthEarnings[0]?.total ?? 0;
  const lastMonthEarningsAmount = lastMonthEarnings[0]?.total ?? 0;

  return {
    totalUsers: {
      count: totalUsersCount,
      changePercent: getChangePercent(newTotalThisMonth, newTotalLastMonth),
    },
    totalJobSeekers: {
      count: totalMap[UserRole.job_seeker] ?? 0,
      changePercent: getChangePercent(
        thisMonthMap[UserRole.job_seeker] ?? 0,
        lastMonthMap[UserRole.job_seeker] ?? 0,
      ),
    },
    totalRecruiters: {
      count: totalMap[UserRole.recruiter] ?? 0,
      changePercent: getChangePercent(
        thisMonthMap[UserRole.recruiter] ?? 0,
        lastMonthMap[UserRole.recruiter] ?? 0,
      ),
    },
    totalInstructors: {
      count: totalMap[UserRole.instructor] ?? 0,
      changePercent: getChangePercent(
        thisMonthMap[UserRole.instructor] ?? 0,
        lastMonthMap[UserRole.instructor] ?? 0,
      ),
    },
    totalEarnings: {
      amount: parseFloat(totalEarningsAmount.toFixed(2)),
      changePercent: getChangePercent(thisMonthEarningsAmount, lastMonthEarningsAmount),
    },
    totalJobs: {
      count: totalJobs,
      changePercent: getChangePercent(newJobsThisMonth, newJobsLastMonth),
    },
    recentUsers,
  };
};

const getEarningsStats = async () => {
  const { startThisMonth, startLastMonth } = getMonthBounds();

  const [
    allTimeSuccessful,
    thisMonthSuccessful,
    lastMonthSuccessful,
    allPending,
    thisMonthPending,
    lastMonthPending,
  ] = await Promise.all([
    // All-time successful total
    Transaction.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } },
    ]),
    // This month successful
    Transaction.aggregate([
      { $match: { status: "success", createdAt: { $gte: startThisMonth } } },
      { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } },
    ]),
    // Last month successful
    Transaction.aggregate([
      {
        $match: {
          status: "success",
          createdAt: { $gte: startLastMonth, $lt: startThisMonth },
        },
      },
      { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } },
    ]),
    // All-time pending total
    Transaction.aggregate([
      { $match: { status: "pending" } },
      { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } },
    ]),
    // This month pending
    Transaction.aggregate([
      { $match: { status: "pending", createdAt: { $gte: startThisMonth } } },
      { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } },
    ]),
    // Last month pending
    Transaction.aggregate([
      {
        $match: {
          status: "pending",
          createdAt: { $gte: startLastMonth, $lt: startThisMonth },
        },
      },
      { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } },
    ]),
  ]);

  const totalEarnings = allTimeSuccessful[0]?.total ?? 0;
  const thisMonthAmount = thisMonthSuccessful[0]?.total ?? 0;
  const lastMonthAmount = lastMonthSuccessful[0]?.total ?? 0;
  const pendingTotal = allPending[0]?.total ?? 0;
  const pendingThisMonth = thisMonthPending[0]?.total ?? 0;
  const pendingLastMonth = lastMonthPending[0]?.total ?? 0;

  return {
    // All-time collected revenue; % change = this month vs last month addition
    totalEarnings: {
      amount: parseFloat(totalEarnings.toFixed(2)),
      changePercent: getChangePercent(thisMonthAmount, lastMonthAmount),
    },
    // This month's collected revenue (shown as "Withdrawal amount" in the design)
    thisMonthEarnings: {
      amount: parseFloat(thisMonthAmount.toFixed(2)),
      changePercent: getChangePercent(thisMonthAmount, lastMonthAmount),
    },
    // Outstanding pending transactions
    pendingAmount: {
      amount: parseFloat(pendingTotal.toFixed(2)),
      changePercent: getChangePercent(pendingThisMonth, pendingLastMonth),
    },
  };
};

const getRecruiterDashboard = async (
  recruiterId: string,
  month: number,
  year: number,
) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const jobIds = await Job.find({ recruiterId, isDeleted: false }).distinct("_id");

  const [totalJobs, totalApplications, analyticsRaw] = await Promise.all([
    Job.countDocuments({ recruiterId, isDeleted: false }),
    Application.countDocuments({ jobId: { $in: jobIds } }),
    Application.aggregate([
      {
        $match: {
          jobId: { $in: jobIds },
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", count: 1 } },
    ]),
  ]);

  return { totalJobs, totalApplications, applicationAnalytics: analyticsRaw };
};

export const StatsServices = {
  getOverviewStats,
  getEarningsStats,
  getRecruiterDashboard,
};

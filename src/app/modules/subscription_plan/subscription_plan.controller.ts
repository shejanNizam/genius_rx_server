import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { SubscriptionPlanServices } from "./subscription_plan.service";

const createPlan = catchAsync(async (req: Request, res: Response) => {
  const plan = await SubscriptionPlanServices.createPlan(req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Plan created", data: plan });
});

const getActivePlans = catchAsync(async (req: Request, res: Response) => {
  const plans = await SubscriptionPlanServices.getActivePlans(req.query.audience as string);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Plans retrieved", data: plans });
});

const getAllPlans = catchAsync(async (req: Request, res: Response) => {
  const plans = await SubscriptionPlanServices.getAllPlans();
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Plans retrieved", data: plans });
});

const updatePlan = catchAsync(async (req: Request, res: Response) => {
  const plan = await SubscriptionPlanServices.updatePlan(req.params.id as string, req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Plan updated", data: plan });
});

const deletePlan = catchAsync(async (req: Request, res: Response) => {
  await SubscriptionPlanServices.deletePlan(req.params.id as string);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Plan deactivated", data: null });
});

export const SubscriptionPlanControllers = { createPlan, getActivePlans, getAllPlans, updatePlan, deletePlan };

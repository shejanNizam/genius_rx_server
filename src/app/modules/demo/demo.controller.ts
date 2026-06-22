import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { DemoServices } from "./demo.service";

const createDemo = catchAsync(async (req: Request, res: Response) => {
  const result = await DemoServices.createDemo(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Demo created successfully",
    data: result,
  });
});

const getAllDemos = catchAsync(async (req: Request, res: Response) => {
  const result = await DemoServices.getAllDemos(
    req.query as Record<string, string>,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Demos retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleDemo = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await DemoServices.getSingleDemo(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Demo retrieved successfully",
    data: result,
  });
});

const updateDemo = catchAsync(async (req: Request, res: Response) => {
  const result = await DemoServices.updateDemo(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Demo updated successfully",
    data: result,
  });
});

const deleteDemo = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await DemoServices.deleteDemo(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Demo deleted successfully",
    data: null,
  });
});

export const DemoControllers = {
  createDemo,
  getAllDemos,
  getSingleDemo,
  updateDemo,
  deleteDemo,
};

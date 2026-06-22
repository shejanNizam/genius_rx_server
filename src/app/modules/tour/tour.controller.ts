import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TourServices } from "./tour.service";

// TOURS
const createTour = catchAsync(async (req: Request, res: Response) => {
  // console.log(req.body, req.files);

  const payload = {
    ...req.body,
    images: (req.files as Express.Multer.File[]).map((file) => file.path),
  };
  // console.log(payload);
  const result = await TourServices.createTour(payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tour created successfully",
    data: result,
  });
});

const getAllTours = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  const result = await TourServices.getAllTours(query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All Tour retrive successfully",
    data: result,
  });
});

const getSingleTour = catchAsync(async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const result = await TourServices.getSingleTour(slug);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Single tour retrive successfully",
    data: result,
  });
});

const updateTour = catchAsync(async (req: Request, res: Response) => {
  // console.log(req.body, req.files);

  const payload = {
    ...req.body,
    images: (req.files as Express.Multer.File[]).map((file) => file.path),
  };
  // console.log(payload);

  const result = await TourServices.updateTour(
    req.params.id as string,
    payload,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tour updated successfully",
    data: result,
  });
});

const deleteTour = catchAsync(async (req: Request, res: Response) => {
  await TourServices.deleteTour(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tour deleted successfully",
    data: null,
  });
});

// TOURS TYPES
const createTourType = catchAsync(async (req: Request, res: Response) => {
  const { name } = req.body;
  const result = await TourServices.createTourType({ name });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tour Type created successfully",
    data: result,
  });
});

const getAllTourTypes = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  const result = await TourServices.getAllTourTypes(query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tour Types retrieved successfully",
    data: result,
  });
});

const getSingleTourType = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await TourServices.getSingleTourType(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Single Tour Type retrieved successfully",
    data: result,
  });
});

const updateTourType = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TourServices.updateTourType(id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tour Type updated successfully",
    data: result,
  });
});
const deleteTourType = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await TourServices.deleteTourType(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tour Type deleted successfully",
    data: null,
  });
});

export const TourControllers = {
  // TOURS
  createTour,
  getAllTours,
  getSingleTour,
  updateTour,
  deleteTour,

  // TOUR TYPES
  createTourType,
  getAllTourTypes,
  getSingleTourType,
  updateTourType,
  deleteTourType,
};

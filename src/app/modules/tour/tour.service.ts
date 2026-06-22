import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import {
  tourSearchableFields,
  tourTypeSearchableFields,
} from "./tour.constant";
import { ITour, ITourType } from "./tour.interface";
import { Tour, TourType } from "./tour.model";

// TOURS
const createTour = async (payload: ITour) => {
  const existingTour = await Tour.findOne({ title: payload.title });
  if (existingTour) {
    throw new Error("Tour with this title already exists");
  }
  const tour = await Tour.create(payload);
  return tour;
};

const getAllTours = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Tour.find(), query);

  const tour = queryBuilder
    .search(tourSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    tour.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    meta,
    data,
  };
};

const getSingleTour = async (slug: string) => {
  const singleTour = await Tour.findOne({ slug });

  return {
    data: singleTour,
  };
};

const updateTour = async (id: string, payload: Partial<ITour>) => {
  const existingTour = await Tour.findById(id);
  if (!existingTour) {
    throw new Error("Tour not found");
  }

  if (
    payload.images &&
    payload.images.length > 0 &&
    existingTour.images &&
    existingTour.images.length > 0
  ) {
    payload.images = [...payload.images, ...existingTour.images];
  }

  if (
    payload.deleteImages &&
    payload.deleteImages.length > 0 &&
    existingTour.images &&
    existingTour.images.length > 0
  ) {
    const restDBImages = existingTour.images.filter(
      (imageUrl) => !payload.deleteImages?.includes(imageUrl),
    );

    const updatedPayloadImages = (payload.images || [])
      .filter((imageUrl) => !payload.deleteImages?.includes(imageUrl))
      .filter((imageUrl) => !restDBImages.includes(imageUrl));

    payload.images = [...restDBImages, ...updatedPayloadImages];
  }

  const updatedTour = await Tour.findByIdAndUpdate(id, payload, {
    returnDocument: "after",
  });

  if (
    payload.deleteImages &&
    payload.deleteImages.length > 0 &&
    existingTour.images &&
    existingTour.images.length > 0
  ) {
    await Promise.all(
      payload.deleteImages.map((url) => deleteImageFromCLoudinary(url)),
    );
  }

  return updatedTour;
};

const deleteTour = async (id: string) => {
  return await Tour.findByIdAndDelete(id);
};

// TOUR TYPES
const createTourType = async (payload: ITourType) => {
  const existingTourType = await TourType.findOne({ name: payload.name });
  if (existingTourType) {
    throw new Error("Tour Type with this name already exists");
  }
  const tourType = await TourType.create(payload);
  return tourType;
};

const getAllTourTypes = async (query: Record<string, string>) => {
  // const tourTypes = await TourType.find();
  // return tourTypes;
  const queryBuilder = new QueryBuilder(TourType.find(), query);

  const tourType = queryBuilder
    .search(tourTypeSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    tourType.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    meta,
    data,
  };
};

const getSingleTourType = async (id: string) => {
  const tourType = await TourType.findById(id);
  if (!tourType) {
    throw new AppError(400, "Tour type not found");
  }

  return tourType;
};

const updateTourType = async (id: string, payload: ITourType) => {
  const existingTourType = await TourType.findById(id);
  if (!existingTourType) {
    throw new AppError(400, "Tour type not found");
  }

  const updatedTourType = await TourType.findByIdAndUpdate(id, payload, {
    returnDocument: "after",
  });

  return updatedTourType;
};

const deleteTourType = async (id: string) => {
  await TourType.findByIdAndDelete(id);

  return null;
};

export const TourServices = {
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

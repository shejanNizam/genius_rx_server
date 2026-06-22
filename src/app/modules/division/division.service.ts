import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { divisionSearchableFields } from "./division.constant";
import { IDivision } from "./division.interface";
import { Division } from "./division.model";

const createDivision = async (payload: IDivision) => {
  const existingDivision = await Division.findOne({ name: payload.name });
  if (existingDivision) {
    throw new Error("Division with this name already exists");
  }

  const devision = await Division.create(payload);
  return devision;
};

const getAllDivisions = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Division.find(), query);

  const division = queryBuilder
    .search(divisionSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    division.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    meta,
    data,
  };
};

const getSingleDivision = async (slug: string) => {
  const division = await Division.findOne({ slug });

  return {
    data: division,
  };
};

const updateDivision = async (id: string, payload: Partial<IDivision>) => {
  const existingDivision = await Division.findById(id);
  if (!existingDivision) {
    throw new AppError(404, "Division not found.");
  }

  if (payload.name) {
    const duplicateDivision = await Division.findOne({
      name: payload.name,
      _id: { $ne: id },
    });
    if (duplicateDivision) {
      throw new AppError(400, "A division with this name already exists.");
    }
  }

  const updatedDivision = await Division.findByIdAndUpdate(id, payload, {
    returnDocument: "after",
    runValidators: true,
  });

  if (payload.thumbnail && existingDivision.thumbnail) {
    await deleteImageFromCLoudinary(existingDivision.thumbnail);
  }

  return updatedDivision;
};

const deleteDivision = async (id: string) => {
  await Division.findByIdAndDelete(id);
  return null;
};

export const DivisionService = {
  createDivision,
  getAllDivisions,
  getSingleDivision,
  updateDivision,
  deleteDivision,
};

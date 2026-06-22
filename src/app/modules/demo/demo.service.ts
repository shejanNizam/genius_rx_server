import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { demoSearchableFields } from "./demo.constant";
import { IDemo } from "./demo.interface";
import { Demo } from "./demo.model";

const createDemo = async (payload: IDemo) => {
  const existing = await Demo.findOne({ name: payload.name });
  if (existing) {
    throw new AppError(400, "Demo with this name already exists");
  }
  return await Demo.create(payload);
};

const getAllDemos = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Demo.find(), query);

  const demos = queryBuilder
    .search(demoSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    demos.build(),
    queryBuilder.getMeta(),
  ]);

  return { meta, data };
};

const getSingleDemo = async (id: string) => {
  const demo = await Demo.findById(id);
  if (!demo) {
    throw new AppError(404, "Demo not found");
  }
  return demo;
};

const updateDemo = async (id: string, payload: Partial<IDemo>) => {
  const existing = await Demo.findById(id);
  if (!existing) {
    throw new AppError(404, "Demo not found");
  }
  return await Demo.findByIdAndUpdate(id, payload, { returnDocument: "after" });
};

const deleteDemo = async (id: string) => {
  const existing = await Demo.findById(id);
  if (!existing) {
    throw new AppError(404, "Demo not found");
  }
  return await Demo.findByIdAndUpdate(id, { isDeleted: true }, { returnDocument: "after" });
};

export const DemoServices = {
  createDemo,
  getAllDemos,
  getSingleDemo,
  updateDemo,
  deleteDemo,
};

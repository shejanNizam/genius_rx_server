import { model, Schema } from "mongoose";
import { IDivision } from "./division.interface";

const divisionSchema = new Schema<IDivision>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    thumbnail: { type: String },
    description: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

divisionSchema.pre("save", async function () {
  if (!this.isModified("name")) return;

  const baseSlug = this.name.toLowerCase().split(" ").join("-");
  let slug = `${baseSlug}-division`;

  let counter = 0;
  while (await Division.exists({ slug })) {
    slug = `${baseSlug}-division-${counter++}`;
  }

  this.slug = slug;
});

divisionSchema.pre("findOneAndUpdate", async function () {
  const division = this.getUpdate() as Partial<IDivision>;
  if (!division.name) return;

  const baseSlug = division.name.toLowerCase().split(" ").join("-");
  let slug = `${baseSlug}-division`;

  let counter = 0;
  while (await Division.exists({ slug })) {
    slug = `${baseSlug}-division-${counter++}`;
  }

  division.slug = slug;
  this.setUpdate(division);
});

export const Division = model<IDivision>("Division", divisionSchema);

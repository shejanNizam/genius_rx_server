import { model, Schema } from "mongoose";
import { IDemo } from "./demo.interface";

const demoSchema = new Schema<IDemo>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// soft-delete filter
// demoSchema.pre(/^find/, function (this: ReturnType<typeof Demo.find>, next) {
//   this.where({ isDeleted: { $ne: true } });
//   next();
// });

export const Demo = model<IDemo>("Demo", demoSchema);

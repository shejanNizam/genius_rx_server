import { model, Schema } from "mongoose";

export interface IStripeEvent {
  eventId: string;
  type: string;
}

const stripeEventSchema = new Schema<IStripeEvent>(
  {
    eventId: { type: String, required: true, unique: true },
    type: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

export const StripeEvent = model<IStripeEvent>("StripeEvent", stripeEventSchema);

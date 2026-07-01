import Stripe from "stripe";
import { configs } from "../config";

export const stripe = new Stripe(configs.STRIPE.stripe_secret_key, {
  apiVersion: "2026-05-27.dahlia",
});

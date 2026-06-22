import { z } from "zod";

export const createDemoZodSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export const updateDemoZodSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

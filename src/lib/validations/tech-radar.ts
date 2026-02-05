import { z } from "zod";

export const techRadarCategoryEnum = z.enum([
  "explore",
  "adopt",
  "consolidate",
  "avoid",
]);

export const createTechRadarSchema = z.object({
  technologyName: z.string().min(1).max(255),
  category: techRadarCategoryEnum,
  description: z.string().optional(),
  rationale: z.string().optional(),
  createdBy: z.string().min(1).max(255),
  updatedBy: z.string().min(1).max(255),
});

export const updateTechRadarSchema = createTechRadarSchema.partial().extend({
  updatedBy: z.string().min(1).max(255),
});

export type CreateTechRadarInput = z.infer<typeof createTechRadarSchema>;
export type UpdateTechRadarInput = z.infer<typeof updateTechRadarSchema>;

import { z } from "zod";

export const createLessonSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  author: z.string().min(1).max(255),
  updatedBy: z.string().min(1).max(255),
});

export const updateLessonSchema = createLessonSchema.partial().extend({
  updatedBy: z.string().min(1).max(255),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;

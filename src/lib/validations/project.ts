import { z } from "zod";

export const projectStatusEnum = z.enum(["idea", "development", "pilot"]);
export const projectDecisionEnum = z.enum(["advance", "consolidate", "pause"]);

export const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  department: z.string().min(1).max(100),
  leaderName: z.string().min(1).max(255),
  leaderEmail: z.string().email().max(255),
  status: projectStatusEnum,
  decision: projectDecisionEnum.optional(),
  decisionDate: z.string().date().optional(),
  decisionNotes: z.string().optional(),
  startDate: z.string().date().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdBy: z.string().min(1).max(255),
  updatedBy: z.string().min(1).max(255),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  updatedBy: z.string().min(1).max(255),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

import { z } from "zod";

export const createCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  subject: z.string().min(1).max(500),
  body: z.string().min(1),
  recipientIds: z.array(z.string().uuid()).optional().default([]),
});

export const updateCampaignSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  subject: z.string().min(1).max(500).optional(),
  body: z.string().min(1).optional(),
});

export const scheduleSchema = z.object({
  scheduled_at: z
    .string()
    .datetime()
    .refine((val) => new Date(val) > new Date(), {
      message: "scheduled_at must be a future timestamp",
    }),
});

export const createRecipientSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type ScheduleInput = z.infer<typeof scheduleSchema>;
export type CreateRecipientInput = z.infer<typeof createRecipientSchema>;

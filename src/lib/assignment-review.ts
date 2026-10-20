import { z } from "zod";

export const reviewSchema = z.object({
  summary: z.string().min(1).max(500),
  missing: z.array(z.object({
    label: z.string().min(1).max(100),
    reason: z.string().min(1).max(300),
    question: z.string().min(1).max(300),
  }).strict()).max(6),
}).strict();
export type AssignmentReview = z.infer<typeof reviewSchema>;

export const confirmReviewSchema = z.object({
  id: z.string().uuid(),
  original: z.string().max(10000),
  need: z.string().trim().min(30, "Beskrivningen måste innehålla minst 30 tecken.").max(600, "Beskrivningen får vara högst 600 tecken."),
  confirmed: z.literal(true),
}).strict();
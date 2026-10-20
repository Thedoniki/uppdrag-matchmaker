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

// Marking an assignment as reviewed is an explicit admin action, never an automatic result of running the AI.
export const markReviewedSchema = z.object({
  id: z.string().uuid(),
  confirmed: z.literal(true),
}).strict();

export type ReviewState = { id: string; reviewed_at: string | null };

// reviewed_at is a full timestamp; only its UTC date part is shown so server and browser always agree.
export function formatReviewedAt(iso: string) {
  const [y = 0, m = 1, d = 1] = iso.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

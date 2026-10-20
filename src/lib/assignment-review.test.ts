import { describe, expect, it } from "vitest";
import { confirmReviewSchema, formatReviewedAt, markReviewedSchema, reviewSchema } from "./assignment-review";

const input = { id: "b4fead92-26ee-4f04-9c5c-7075d3c8bdbd", original: "Ursprunglig uppdragsbeskrivning med tillräcklig längd.", need: "Kompletterad uppdragsbeskrivning med konkreta leveranser.", confirmed: true };
describe("Bekräftade AI-kompletteringar", () => {
  it("kräver uttrycklig bekräftelse före ändring", () => {
    expect(confirmReviewSchema.safeParse({ ...input, confirmed: false }).success).toBe(false);
    const { confirmed, ...unconfirmed } = input;
    expect(confirmReviewSchema.safeParse(unconfirmed).success).toBe(false);
    expect(confirmReviewSchema.safeParse(input).success).toBe(true);
  });
  it("tillåter inte AI-ändringar av andra uppgifter", () => {
    expect(confirmReviewSchema.safeParse({ ...input, status: "Tilldelad" }).success).toBe(false);
    expect(confirmReviewSchema.safeParse({ ...input, archived_at: null }).success).toBe(false);
  });
  it("accepterar frågor om saknade uppgifter men inte fabricerade ersättningstexter", () => {
    expect(reviewSchema.safeParse({ summary: "Målgrupp saknas", missing: [{ label: "Målgrupp", reason: "Inte angiven", question: "Vem ska använda hemsidan?" }] }).success).toBe(true);
    expect(reviewSchema.safeParse({ summary: "Målgrupp saknas", missing: [], need: "Påhittade uppgifter" }).success).toBe(false);
  });
});

describe("Markering av granskat uppdrag", () => {
  it("kräver administratörens uttryckliga bekräftelse och tillåter inga andra fält", () => {
    expect(markReviewedSchema.safeParse({ id: input.id, confirmed: true }).success).toBe(true);
    expect(markReviewedSchema.safeParse({ id: input.id, confirmed: false }).success).toBe(false);
    expect(markReviewedSchema.safeParse({ id: input.id }).success).toBe(false);
    expect(markReviewedSchema.safeParse({ id: input.id, confirmed: true, need: "Påhittad beskrivning" }).success).toBe(false);
  });
  it("visar samma datum oavsett vilken tid på dygnet granskningen sparades", () => {
    expect(formatReviewedAt("2026-10-20T23:30:00+00:00")).toBe("20 oktober 2026");
  });
});
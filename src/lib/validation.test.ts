import { describe, expect, it } from "vitest";
import { dateBounds, isValidPhone, submitSchema, interestSchema } from "./validation";

const today = new Date(2026, 9, 20);

describe("datumregel: 7 dagar till 12 månader", () => {
  it("räknar ut gränserna", () => {
    expect(dateBounds(today)).toEqual({ min: "2026-10-27", max: "2027-10-20" });
  });
  const base = {
    organisation_name: "Exempel AB",
    organisation_type: "Företag",
    title: "En titel",
    need: "x".repeat(30),
    category: "Hemsida",
    contact_person: "Anna",
    email: "anna@exempel.se",
    phone: "",
    consent: true,
  };
  it("avvisar datum 6 dagar fram", () => {
    expect(submitSchema(today).safeParse({ ...base, preferred_date: "2026-10-26" }).success).toBe(false);
  });
  it("avvisar dagens datum som slutdatum", () => {
    expect(submitSchema(today).safeParse({ ...base, preferred_date: "2026-10-20" }).success).toBe(false);
  });
  it("avvisar e-post utan @", () => {
    expect(submitSchema(today).safeParse({ ...base, preferred_date: "2026-10-27", email: "anna.exempel.se" }).success).toBe(false);
  });
  it("kräver organisationstext när Annat väljs", () => {
    expect(submitSchema(today).safeParse({ ...base, preferred_date: "2026-10-27", organisation_type: "Annat", organisation_type_other: "   " }).success).toBe(false);
  });
  it("godtar Annat med organisationstext", () => {
    expect(submitSchema(today).safeParse({ ...base, preferred_date: "2026-10-27", organisation_type: "Annat", organisation_type_other: "Kommunal verksamhet" }).success).toBe(true);
  });
  it("godtar datum 7 dagar fram", () => {
    expect(submitSchema(today).safeParse({ ...base, preferred_date: "2026-10-27" }).success).toBe(true);
  });
  it("avvisar datum mer än 12 månader fram", () => {
    expect(submitSchema(today).safeParse({ ...base, preferred_date: "2027-10-21" }).success).toBe(false);
  });
  it("kräver samtycke", () => {
    expect(submitSchema(today).safeParse({ ...base, preferred_date: "2026-11-30", consent: false }).success).toBe(false);
  });
  it("kräver minst 30 tecken i behovet", () => {
    expect(submitSchema(today).safeParse({ ...base, preferred_date: "2026-11-30", need: "x".repeat(29) }).success).toBe(false);
  });
});

describe("telefon: 7–15 siffror eller tomt", () => {
  it("godtar tomt", () => expect(isValidPhone("")).toBe(true));
  it("godtar 042-00 00 01", () => expect(isValidPhone("042-00 00 01")).toBe(true));
  it("avvisar 6 siffror", () => expect(isValidPhone("123456")).toBe(false));
  it("avvisar 16 siffror", () => expect(isValidPhone("1234567890123456")).toBe(false));
  it("avvisar bokstäver", () => expect(isValidPhone("0420abc000")).toBe(false));
});

describe("intresseanmälan", () => {
  it("kräver minst 20 tecken motivering", () => {
    expect(
      interestSchema.safeParse({ team_name: "Team A", email: "a@b.se", motivation: "x".repeat(19), consent: true }).success,
    ).toBe(false);
  });
});

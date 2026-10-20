import { z } from "zod";
import { CATEGORIES, ORGANISATION_TYPES } from "./assignments";

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function dateBounds(today = new Date()) {
  const min = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 7));
  const max = new Date(Date.UTC(today.getFullYear() + 1, today.getMonth(), today.getDate()));
  return { min: toISO(min), max: toISO(max) };
}

export function isValidPhone(v: string) {
  if (!v.trim()) return true;
  if (!/^[0-9+\-\s]+$/.test(v)) return false;
  const digits = v.replace(/\D/g, "").length;
  return digits >= 7 && digits <= 15;
}

export function submitSchema(today = new Date()) {
  const { min, max } = dateBounds(today);
  return z.object({
    organisation_name: z.string().trim().min(2, "Ange organisationens namn, 2 till 80 tecken.").max(80, "Ange organisationens namn, 2 till 80 tecken."),
    title: z.string().trim().min(5, "Ange en titel på 5 till 80 tecken.").max(80, "Ange en titel på 5 till 80 tecken."),
    need: z.string().trim().min(30, "Beskriv ert behov med minst 30 tecken.").max(600, "Beskrivningen får vara högst 600 tecken."),
    category: z.enum(CATEGORIES, { errorMap: () => ({ message: "Välj en kategori." }) }),
    preferred_date: z
      .string()
      .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && v >= min && v <= max, "Välj ett datum mellan 7 dagar och 12 månader från idag."),
    contact_person: z.string().trim().min(2, "Ange kontaktpersonens namn.").max(60, "Ange kontaktpersonens namn."),
    email: z.string().trim().max(120, "Ange en giltig e-postadress som innehåller @.").email("Ange en giltig e-postadress som innehåller @, till exempel namn@exempel.se."),
    phone: z.string().refine(isValidPhone, "Ange ett telefonnummer med 7 till 15 siffror eller lämna fältet tomt."),
    consent: z.literal(true, { errorMap: () => ({ message: "Du behöver kryssa i rutan för att fortsätta." }) }),
    website: z.string().optional(),
  }).and(z.object({
    organisation_type: z.enum(ORGANISATION_TYPES, { errorMap: () => ({ message: "Välj vilken typ av organisation ni är." }) }),
    organisation_type_other: z.string().trim().max(120, "Ange högst 120 tecken.").optional(),
  }).superRefine((values, ctx) => {
    if (values.organisation_type === "Annat" && !values.organisation_type_other?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["organisation_type_other"], message: "Beskriv vilken typ av organisation ni är." });
    }
  }));
}

export const interestSchema = z.object({
  team_name: z.string().trim().min(2, "Ange ert teamnamn, 2 till 60 tecken.").max(60, "Ange ert teamnamn, 2 till 60 tecken."),
  email: z.string().trim().max(120, "Ange en giltig e-postadress.").email("Ange en giltig e-postadress."),
  motivation: z.string().trim().min(20, "Berätta varför ni vill göra uppdraget, minst 20 tecken.").max(400, "Motiveringen får vara högst 400 tecken."),
  consent: z.literal(true, { errorMap: () => ({ message: "Du behöver kryssa i rutan för att fortsätta." }) }),
  website: z.string().optional(),
});

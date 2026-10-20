import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const ORGANISATION_TYPES = ["Företag", "Förening", "Annat"] as const;
export const CATEGORIES = [
  "Hemsida",
  "Affisch eller grafiskt material",
  "Formulär",
  "Meny eller lista",
  "Bokning",
  "Annat",
] as const;

// Only public columns — contact details live in a separate table that the site can never read.
const PUBLIC_COLUMNS =
  "id, organisation_name, organisation_type, title, need, category, preferred_date, status, interest_count, created_at";

export type Assignment = {
  id: string;
  organisation_name: string;
  organisation_type: string;
  title: string;
  need: string;
  category: string;
  preferred_date: string | null;
  status: string;
  interest_count: number;
  created_at: string;
};

export const assignmentsQuery = (limit?: number) =>
  queryOptions({
    queryKey: ["assignments", limit ?? "all"],
    queryFn: async (): Promise<Assignment[]> => {
      let q = supabase.from("assignments").select(PUBLIC_COLUMNS).is("archived_at", null).order("created_at", { ascending: false });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

export const assignmentQuery = (id: string) =>
  queryOptions({
    queryKey: ["assignment", id],
    queryFn: async (): Promise<Assignment | null> => {
      const { data, error } = await supabase.from("assignments").select(PUBLIC_COLUMNS).eq("id", id).is("archived_at", null).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export function formatDate(iso: string | null) {
  if (!iso) return "–";
  const [y = 0, m = 1, d = 1] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function excerpt(text: string, max = 140) {
  return text.length > max ? text.slice(0, max).trimEnd() + "..." : text;
}

export function interestText(n: number) {
  return n === 1 ? "1 team har anmält intresse" : `${n} team har anmält intresse`;
}

export const SORT_OPTIONS = [
  { value: "nyast", label: "Nyast först" },
  { value: "datum", label: "Datum (önskat slutdatum)" },
  { value: "bokstav", label: "Bokstavsordning" },
  { value: "kategori", label: "Kategori" },
] as const;

export type SortBy = (typeof SORT_OPTIONS)[number]["value"];

const collator = new Intl.Collator("sv");
const NO_DATE = "9999-12-31";

// Sorting happens in the browser: the list is already fetched in full, so no extra request per option.
export function sortAssignments(list: Assignment[], sortBy: SortBy): Assignment[] {
  const items = [...list];
  switch (sortBy) {
    case "datum":
      return items.sort(
        (a, b) =>
          (a.preferred_date ?? NO_DATE).localeCompare(b.preferred_date ?? NO_DATE) ||
          collator.compare(a.title, b.title),
      );
    case "bokstav":
      return items.sort((a, b) => collator.compare(a.title, b.title));
    case "kategori":
      return items.sort(
        (a, b) => collator.compare(a.category, b.category) || collator.compare(a.title, b.title),
      );
    case "nyast":
    default:
      return items.sort(
        (a, b) => b.created_at.localeCompare(a.created_at) || collator.compare(a.title, b.title),
      );
  }
}

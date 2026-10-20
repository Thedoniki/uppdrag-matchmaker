import { describe, expect, it } from "vitest";

import { sortAssignments, type Assignment } from "@/lib/assignments";

const rows: Assignment[] = [
  { id: "1", organisation_name: "o", organisation_type: "Annat", title: "Digital guide för nyanställda", need: "n", category: "Annat", preferred_date: "2027-01-31", status: "s", interest_count: 0, created_at: "2026-10-20T10:49:14.298505+00:00" },
  { id: "2", organisation_name: "o", organisation_type: "Bokning", title: "System för tidsbokning", need: "n", category: "Bokning", preferred_date: "2027-02-15", status: "s", interest_count: 0, created_at: "2026-10-20T10:48:14.298505+00:00" },
  { id: "3", organisation_name: "o", organisation_type: "Formulär", title: "Anmälningsformulär på nätet", need: "n", category: "Formulär", preferred_date: "2026-12-20", status: "s", interest_count: 0, created_at: "2026-10-20T10:47:14.298505+00:00" },
  { id: "4", organisation_name: "o", organisation_type: "Affisch", title: "Affisch till ett evenemang", need: "n", category: "Affisch eller grafiskt material", preferred_date: "2027-01-10", status: "s", interest_count: 0, created_at: "2026-10-20T10:46:14.298505+00:00" },
  { id: "5", organisation_name: "o", organisation_type: "Hemsida", title: "Hemsida för en förening", need: "n", category: "Hemsida", preferred_date: "2026-12-15", status: "s", interest_count: 0, created_at: "2026-10-20T10:45:14.298505+00:00" },
  { id: "6", organisation_name: "o", organisation_type: "Meny", title: "Digital meny för ett kafé", need: "n", category: "Meny eller lista", preferred_date: "2026-11-30", status: "s", interest_count: 0, created_at: "2026-10-20T10:44:14.298505+00:00" },
];

const t = (s: Assignment[]) => s.map((a) => a.title);

describe("real rows", () => {
  it("logs orders", () => {
    for (const s of ["nyast", "datum", "bokstav", "kategori"] as const) {
      console.log(s, "->", t(sortAssignments(rows, s)));
    }
    expect(t(sortAssignments(rows, "datum"))[0]).toBe("Digital meny för ett kafé");
    expect(t(sortAssignments(rows, "bokstav"))[0]).toBe("Affisch till ett evenemang");
  });
});

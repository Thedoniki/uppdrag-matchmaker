import { describe, expect, it } from "vitest";

import { sortAssignments, type Assignment } from "@/lib/assignments";

function make(overrides: Partial<Assignment> & { id: string }): Assignment {
  return {
    organisation_name: "Org",
    organisation_type: "Förening",
    title: overrides.id,
    need: "Behov",
    category: "Hemsida",
    preferred_date: null,
    status: "publicerad",
    interest_count: 0,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

const list: Assignment[] = [
  make({ id: "b", title: "Bokning", category: "Bokning", preferred_date: "2026-11-01", created_at: "2026-03-01T00:00:00Z" }),
  make({ id: "a", title: "Årets affisch", category: "Affisch eller grafiskt material", preferred_date: null, created_at: "2026-01-15T00:00:00Z" }),
  make({ id: "c", title: "Ny hemsida", category: "Hemsida", preferred_date: "2026-09-01", created_at: "2026-05-20T00:00:00Z" }),
];

const titles = (sorted: Assignment[]) => sorted.map((a) => a.title);

describe("sortAssignments", () => {
  it("puts the newest assignment first when sorting by nyast", () => {
    expect(titles(sortAssignments(list, "nyast"))).toEqual(["Ny hemsida", "Bokning", "Årets affisch"]);
  });

  it("sorts by preferred end date with assignments without a date last", () => {
    expect(titles(sortAssignments(list, "datum"))).toEqual(["Ny hemsida", "Bokning", "Årets affisch"]);
  });

  it("sorts titles alphabetically with Swedish collation", () => {
    expect(titles(sortAssignments(list, "bokstav"))).toEqual(["Bokning", "Ny hemsida", "Årets affisch"]);
  });

  it("groups by category alphabetically", () => {
    expect(titles(sortAssignments(list, "kategori"))).toEqual([
      "Årets affisch",
      "Bokning",
      "Ny hemsida",
    ]);
  });

  it("does not reorder the source list", () => {
    sortAssignments(list, "bokstav");
    expect(titles(list)).toEqual(["Bokning", "Årets affisch", "Ny hemsida"]);
  });
});

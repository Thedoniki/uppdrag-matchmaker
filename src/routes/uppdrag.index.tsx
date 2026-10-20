import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { assignmentsQuery, SORT_OPTIONS, sortAssignments, type SortBy } from "@/lib/assignments";
import { AssignmentCard } from "@/components/AssignmentCard";
import { Reveal } from "@/components/Reveal";
import { arrow, btnPrimary } from "@/components/buttons";

export const Route = createFileRoute("/uppdrag/")({
  head: () => ({
    meta: [
      { title: "Se uppdrag – Uppdragsbanken Helsingborg" },
      { name: "description", content: "Bläddra bland digitala uppdrag från företag och föreningar i Helsingborg." },
      { property: "og:title", content: "Se uppdrag – Uppdragsbanken Helsingborg" },
      { property: "og:description", content: "Bläddra bland digitala uppdrag från företag och föreningar i Helsingborg." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(assignmentsQuery()),
  component: ListPage,
});

function ListPage() {
  const { data } = useSuspenseQuery(assignmentsQuery());
  const [sortBy, setSortBy] = useState<SortBy>("nyast");
  const items = useMemo(() => sortAssignments(data, sortBy), [data, sortBy]);
  console.log("DBG render sortBy=", sortBy, "first=", items[0]?.title);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-4xl md:text-5xl">Aktuella uppdrag</h1>
          {data.length > 0 && (
            <label className="flex items-center gap-3 text-base font-bold text-muted-foreground">
              Sortera:
              <select
                value={sortBy}
                onChange={(e) => { console.log("DBG change target=", e.target.value); setSortBy(e.target.value as SortBy); }}
                className="rounded-lg border-2 border-input bg-card px-4 py-2.5 text-base font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </Reveal>
      {data.length === 0 ? (
        <div className="mt-10 rounded-xl border border-border bg-card p-10 text-center shadow-soft">
          <p className="text-xl">Det finns inga uppdrag ännu. Lämna det första!</p>
          <Link to="/lamna-uppdrag" className={`${btnPrimary} mt-6`}>
            Lämna ett uppdrag <span className={arrow}>→</span>
          </Link>
        </div>
      ) : (
        <div data-sort={sortBy} className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((a, i) => (
            <Reveal key={a.id} delay={Math.min(i, 6) * 0.06} className="h-full">
              <AssignmentCard a={a} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

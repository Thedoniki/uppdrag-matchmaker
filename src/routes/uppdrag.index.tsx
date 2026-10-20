import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { assignmentsQuery } from "@/lib/assignments";
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
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <Reveal>
        <h1 className="text-4xl md:text-5xl">Aktuella uppdrag</h1>
      </Reveal>
      {data.length === 0 ? (
        <div className="mt-10 rounded-xl border border-border bg-card p-10 text-center shadow-soft">
          <p className="text-xl">Det finns inga uppdrag ännu. Lämna det första!</p>
          <Link to="/lamna-uppdrag" className={`${btnPrimary} mt-6`}>
            Lämna ett uppdrag <span className={arrow}>→</span>
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((a, i) => (
            <Reveal key={a.id} delay={Math.min(i, 6) * 0.06} className="h-full">
              <AssignmentCard a={a} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

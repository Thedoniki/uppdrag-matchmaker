import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Building2, Calendar, ShieldCheck } from "lucide-react";
import { assignmentQuery, formatDate, interestText } from "@/lib/assignments";
import { CategoryTag } from "@/components/AssignmentCard";
import { Reveal } from "@/components/Reveal";
import { AssignmentActions } from "@/components/AssignmentActions";

export const Route = createFileRoute("/uppdrag/$id")({
  loader: async ({ context, params }) => {
    const a = await context.queryClient.ensureQueryData(assignmentQuery(params.id));
    if (!a) throw notFound();
    return { title: a.title, need: a.need };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} – Uppdragsbanken Helsingborg` },
          { name: "description", content: loaderData.need.slice(0, 155) },
          { property: "og:title", content: `${loaderData.title} – Uppdragsbanken Helsingborg` },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary_large_image" },
          { property: "og:description", content: loaderData.need.slice(0, 155) },
        ]
      : [{ title: "Uppdrag – Uppdragsbanken Helsingborg" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-4xl">Uppdraget hittades inte</h1>
      <Link to="/uppdrag" className="mt-6 inline-block font-bold text-primary">← Tillbaka till alla uppdrag</Link>
    </section>
  ),
  component: DetailPage,
});

function DetailPage() {
  const { id } = Route.useParams();
  const { data: a } = useSuspenseQuery(assignmentQuery(id));
  const navigate = useNavigate();
  if (!a) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <Link to="/uppdrag" className="font-bold text-primary hover:text-primary-hover">
        ← Tillbaka till alla uppdrag
      </Link>
      <Reveal>
        <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-soft md:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <CategoryTag>Uppdrag</CategoryTag>
            <span className="rounded-full border border-primary px-3 py-1 text-sm font-semibold text-primary">{a.status}</span>
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl">{a.title}</h1>
          <p className="mt-3 text-xl text-muted-foreground">
            {a.organisation_name} · {a.organisation_type}
          </p>
          <p className="mt-2 text-lg">
            Önskat slutdatum: <span className="font-semibold">{formatDate(a.preferred_date)}</span>
          </p>

          <h2 className="mt-10 text-2xl">Om uppdraget</h2>
          <p className="mt-3 whitespace-pre-line text-lg">{a.need}</p>

          <p className="mt-8 rounded-lg bg-secondary p-4 text-secondary-foreground">
            Kontaktuppgifter delas först när handledaren har granskat uppdraget.
          </p>
          {a.interest_count > 0 && <p className="mt-4 text-lg font-semibold text-primary">{interestText(a.interest_count)}</p>}
        </div>
      </Reveal>

      <AssignmentActions id={a.id} title={a.title} onComplete={() => navigate({ to: "/uppdrag" })} />
    </section>
  );
}

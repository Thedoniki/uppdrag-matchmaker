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
      <Link
        to="/uppdrag"
        className="group inline-flex items-center gap-2 font-bold text-primary hover:text-primary-hover"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-[3px] motion-reduce:transition-none" aria-hidden="true" />
        Tillbaka till alla uppdrag
      </Link>
      <Reveal>
        <article className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/60 px-6 py-4 md:px-10">
            <div className="flex flex-wrap items-center gap-3">
              <CategoryTag>Uppdrag</CategoryTag>
              <span className="rounded-full border border-primary px-3 py-1 text-sm font-semibold text-primary">{a.status}</span>
            </div>
            {a.interest_count > 0 && (
              <span className="text-sm font-semibold text-primary">{interestText(a.interest_count)}</span>
            )}
          </div>

          <div className="px-6 py-8 md:px-10 md:py-10">
            <h1 className="text-4xl md:text-5xl">{a.title}</h1>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Building2 className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <dt className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Organisation</dt>
                  <dd className="mt-0.5 text-lg">
                    {a.organisation_name} <span className="text-muted-foreground">· {a.organisation_type}</span>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <dt className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Önskat slutdatum</dt>
                  <dd className="mt-0.5 text-lg">{formatDate(a.preferred_date)}</dd>
                </div>
              </div>
            </dl>

            <hr className="my-8 border-border" />

            <h2 className="text-2xl">Om uppdraget</h2>
            <p className="mt-3 whitespace-pre-line text-lg leading-relaxed">{a.need}</p>

            <p className="mt-8 flex items-start gap-3 rounded-lg border-l-4 border-accent bg-secondary p-4 text-lg text-secondary-foreground">
              <ShieldCheck className="mt-1 size-5 shrink-0" aria-hidden="true" />
              <span>Kontaktuppgifter delas först när handledaren har granskat uppdraget.</span>
            </p>
          </div>
        </article>
      </Reveal>

      <AssignmentActions id={a.id} title={a.title} onComplete={() => navigate({ to: "/uppdrag" })} />
    </section>
  );
}

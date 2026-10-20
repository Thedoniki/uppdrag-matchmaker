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
    <section className="mx-auto w-full max-w-full px-3 py-6 sm:max-w-2xl sm:px-6 sm:py-10 lg:max-w-4xl">
      <Link
        to="/uppdrag"
        className="group inline-flex items-center gap-2 font-bold text-primary hover:text-primary-hover"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-[3px] motion-reduce:transition-none" aria-hidden="true" />
        Tillbaka till alla uppdrag
      </Link>
      <Reveal>
        <article className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/60 px-4 py-3 sm:px-6 md:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryTag>Uppdrag</CategoryTag>
              <span className="rounded-full border border-primary px-3 py-0.5 text-sm font-semibold text-primary">{a.status}</span>
            </div>
            {a.interest_count > 0 && (
              <span className="text-sm font-semibold text-primary">{interestText(a.interest_count)}</span>
            )}
          </div>

          <div className="space-y-4 px-4 py-5 sm:px-6 md:px-8 md:py-6">
            <h1 className="break-words text-3xl leading-tight md:text-4xl">{a.title}</h1>

            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3">
                <Building2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Organisation</dt>
                  <dd className="break-words text-base sm:text-lg">
                    {a.organisation_name} <span className="text-muted-foreground">· {a.organisation_type}</span>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3">
                <Calendar className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Önskat slutdatum</dt>
                  <dd className="text-base sm:text-lg">{formatDate(a.preferred_date)}</dd>
                </div>
              </div>
            </dl>

            <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-4">
              <h2 className="text-xl sm:text-2xl">Om uppdraget</h2>
              <p className="mt-2 whitespace-pre-line break-words text-base leading-relaxed sm:text-lg">{a.need}</p>
            </div>

            <p className="flex items-start gap-3 rounded-lg border-l-4 border-accent bg-secondary p-3 text-base text-secondary-foreground sm:text-lg">
              <ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <span>Kontaktuppgifter delas först när handledaren har granskat uppdraget.</span>
            </p>
          </div>
        </article>
      </Reveal>

      <AssignmentActions id={a.id} title={a.title} onComplete={() => navigate({ to: "/uppdrag" })} />
    </section>
  );
}

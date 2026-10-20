import { Link } from "@tanstack/react-router";
import { excerpt, formatDate, type Assignment } from "@/lib/assignments";
import { AssignmentReviewPanel } from "./AssignmentReviewPanel";
import { AssignmentReviewStatus } from "./AssignmentReviewStatus";

export function CategoryTag({ children }: { children: string }) {
  return (
    <span className="inline-block rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
      {children}
    </span>
  );
}

export function AssignmentCard({ a }: { a: Assignment }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border-2 border-border bg-card shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div aria-hidden="true" className="h-1.5 w-full bg-primary" />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CategoryTag>{a.category}</CategoryTag>
          <AssignmentReviewStatus id={a.id} />
        </div>
        <h3 className="mt-4 text-2xl">{a.title}</h3>
        <p className="mt-1 text-muted-foreground">{a.organisation_name}</p>
        <p className="mt-3 flex-1">{excerpt(a.need)}</p>
        <hr className="my-4 border-border" />
        <p className="text-base text-muted-foreground">
          Önskat slutdatum: <span className="font-semibold text-foreground">{formatDate(a.preferred_date)}</span>
        </p>
        <Link
          to="/uppdrag/$id"
          params={{ id: a.id }}
          className="group mt-4 inline-flex items-center gap-1 font-bold text-primary hover:text-primary-hover"
        >
          Läs mer <span className="transition-transform group-hover:translate-x-[3px] motion-reduce:transition-none">→</span>
        </Link>
        <AssignmentReviewPanel assignment={a} />
      </div>
    </article>
  );
}

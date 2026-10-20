import { Link } from "@tanstack/react-router";
import { excerpt, formatDate, type Assignment } from "@/lib/assignments";

export function CategoryTag({ children }: { children: string }) {
  return (
    <span className="inline-block rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
      {children}
    </span>
  );
}

export function AssignmentCard({ a }: { a: Assignment }) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div>
        <CategoryTag>{a.category}</CategoryTag>
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
    </article>
  );
}

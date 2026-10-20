import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { archivedAssignments } from "@/lib/admin.functions";
import { AssignmentActions } from "./AssignmentActions";
import { useAppAuth } from "./AuthProvider";

export function AssignmentArchive() {
  const { isAdmin, user } = useAppAuth();
  const readArchive = useServerFn(archivedAssignments);
  const { data, isPending, error, refetch, isRefetching } = useQuery({ queryKey: ["archive", user?.id], queryFn: () => readArchive({ data: {} }), enabled: isAdmin });
  if (!isAdmin) return null;
  return <section className="mt-16 border-t border-border pt-8">
    <h2 className="text-3xl">Arkiverade uppdrag</h2>
    {isPending ? <p className="mt-4">Laddar…</p>
      : error ? (
        <div role="alert" className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-destructive/40 bg-destructive/10 p-5">
          <p className="flex-1 text-destructive">Arkiverade uppdrag kunde inte hämtas. Kontrollera din anslutning och försök igen — resten av sidan fungerar som vanligt.</p>
          <button type="button" onClick={() => refetch()} disabled={isRefetching} className="rounded-xl bg-primary px-5 py-2.5 font-bold text-primary-foreground shadow-soft hover:bg-primary-hover disabled:opacity-60">
            {isRefetching ? "Försöker…" : "Försök igen"}
          </button>
        </div>
      )
      : !data?.length ? <p className="mt-4 text-muted-foreground">Inga arkiverade uppdrag.</p>
      : <div className="mt-4 divide-y divide-border">{data.map(a => <article key={a.id} className="py-6"><h3 className="text-xl">{a.title}</h3><p className="text-muted-foreground">{a.organisation_name}</p><AssignmentActions id={a.id} title={a.title} archived /></article>)}</div>}
  </section>;
}
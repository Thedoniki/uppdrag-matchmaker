import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { archivedAssignments } from "@/lib/admin.functions";
import { AssignmentActions } from "./AssignmentActions";
import { useAppAuth } from "./AuthProvider";

export function AssignmentArchive() {
  const { isAdmin, user } = useAppAuth();
  const readArchive = useServerFn(archivedAssignments);
  const { data, isPending, error } = useQuery({ queryKey: ["archive", user?.id], queryFn: () => readArchive({ data: {} }), enabled: isAdmin });
  if (!isAdmin) return null;
  return <section className="mt-16 border-t border-border pt-8">
    <h2 className="text-3xl">Arkiverade uppdrag</h2>
    {isPending ? <p className="mt-4">Laddar…</p> : error ? <p role="alert" className="mt-4 text-destructive">Arkivet kunde inte laddas.</p> : !data?.length ? <p className="mt-4 text-muted-foreground">Inga arkiverade uppdrag.</p> : <div className="mt-4 divide-y divide-border">{data.map(a => <article key={a.id} className="py-6"><h3 className="text-xl">{a.title}</h3><p className="text-muted-foreground">{a.organisation_name}</p><AssignmentActions id={a.id} title={a.title} archived /></article>)}</div>}
  </section>;
}
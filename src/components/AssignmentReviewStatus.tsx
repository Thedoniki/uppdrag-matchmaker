import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Clock } from "lucide-react";
import { useAppAuth } from "./AuthProvider";
import { assignmentReviewStates } from "@/lib/assignment-review.functions";
import { formatReviewedAt } from "@/lib/assignment-review";

// One query per admin session; every card reads its own row from the same cached result.
export function useReviewStates() {
  const { isAdmin, user } = useAppAuth();
  const readStates = useServerFn(assignmentReviewStates);
  return useQuery({
    queryKey: ["review-states", user?.id],
    queryFn: () => readStates({ data: {} }),
    enabled: isAdmin && Boolean(user),
    staleTime: 30_000,
  });
}

export function useReviewState(id: string) {
  const states = useReviewStates();
  return {
    reviewedAt: states.data?.find(state => state.id === id)?.reviewed_at ?? null,
    // While an admin's states are still loading the review actions stay hidden, so a card never
    // offers "mark as reviewed" for an assignment that turns out to be reviewed already.
    loading: states.isPending && !states.isDisabled,
  };
}


export function AssignmentReviewStatus({ id }: { id: string }) {
  const { isAdmin } = useAppAuth();
  const { data, isPending, error, refetch, isRefetching } = useReviewStates();
  if (!isAdmin) return null;
  if (isPending) return <span aria-label="Laddar granskningsstatus" className="inline-block h-8 w-48 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />;
  if (error) return <p className="text-sm font-semibold text-destructive">Granskningsstatus kunde inte hämtas.{" "}
    <button type="button" onClick={() => refetch()} disabled={isRefetching} className="underline underline-offset-4 disabled:opacity-60">{isRefetching ? "Försöker…" : "Försök igen"}</button>
  </p>;
  const reviewedAt = data?.find(state => state.id === id)?.reviewed_at ?? null;
  return reviewedAt ? (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-secondary px-3 py-1 text-sm font-bold text-secondary-foreground">
      <Check className="size-4" aria-hidden="true" />Granskad {formatReviewedAt(reviewedAt)}
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 rounded-full border border-warning/35 bg-warning-soft px-3 py-1 text-sm font-bold text-warning-foreground">
      <Clock className="size-4" aria-hidden="true" />Väntar på granskning
    </span>
  );
}

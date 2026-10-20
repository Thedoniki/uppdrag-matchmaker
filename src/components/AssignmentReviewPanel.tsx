import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck, LoaderCircle, Sparkles } from "lucide-react";
import { useAppAuth } from "./AuthProvider";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "./ui/dialog";
import { reviewAssignment, confirmAssignmentReview } from "@/lib/assignment-review.functions";
import { confirmReviewSchema, type AssignmentReview } from "@/lib/assignment-review";
import type { Assignment } from "@/lib/assignments";

function ReviewItem({ assignment }: { assignment: Assignment }) {
  const review = useServerFn(reviewAssignment);
  const save = useServerFn(confirmAssignmentReview);
  const queryClient = useQueryClient();
  const [result, setResult] = useState<AssignmentReview | null>(null);
  const [original, setOriginal] = useState(assignment.need);
  const [draft, setDraft] = useState(assignment.need);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function generate() {
    setBusy(true); setError(""); setSaved(false);
    try {
      const response = await review({ data: { id: assignment.id } });
      if (!response.ok) { setError(response.error); return; }
      setResult(response.review); setOriginal(response.original); setDraft(response.original);
    } catch { setError("Granskningen kunde inte hämtas. Uppdraget är oförändrat."); }
    finally { setBusy(false); }
  }

  function preview() {
    const parsed = confirmReviewSchema.safeParse({ id: assignment.id, original, need: draft, confirmed: true });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Kontrollera beskrivningen."); return; }
    setError(""); setConfirming(true);
  }

  async function confirm() {
    setSaving(true); setError("");
    try {
      await save({ data: { id: assignment.id, original, need: draft, confirmed: true } });
      setOriginal(draft.trim()); setDraft(draft.trim()); setSaved(true); setConfirming(false); setResult(null);
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["assignments"] }), queryClient.invalidateQueries({ queryKey: ["assignment", assignment.id] })]);
    } catch (error) { setError(error instanceof Error ? error.message : "Ändringen kunde inte sparas."); setConfirming(false); }
    finally { setSaving(false); }
  }

  return <article className="rounded-lg border-2 border-border bg-card p-5 shadow-soft sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0"><h3 className="break-words text-xl">{assignment.title}</h3><p className="text-muted-foreground">{assignment.organisation_name}</p></div>
      <Button onClick={generate} disabled={busy || saving || result !== null} variant="secondary" className="min-h-11">
        {busy ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : <Sparkles />} {busy ? "Granskar…" : "Granska med AI"}
      </Button>
    </div>
    {error && <p role="alert" className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-destructive">{error}</p>}
    {saved && <p role="status" className="mt-4 font-semibold text-primary">Den bekräftade beskrivningen är sparad.</p>}
    {result && <div className="mt-5 border-t border-border pt-5">
      <p className="font-semibold">{result.summary}</p>
      {result.missing.length ? <ul className="mt-4 divide-y divide-border">{result.missing.map((item, index) => <li key={index} className="py-3 first:pt-0">
        <h4 className="font-bold">{item.label}</h4><p className="text-sm text-muted-foreground">{item.reason}</p><p className="mt-1">{item.question}</p>
      </li>)}</ul> : <p className="mt-3 text-muted-foreground">Inga tydligt saknade uppgifter hittades.</p>}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div><h4 className="mb-2 font-bold">Nuvarande beskrivning</h4><p className="whitespace-pre-wrap break-words text-muted-foreground">{original}</p></div>
        <div><label htmlFor={`review-${assignment.id}`} className="mb-2 block font-bold">Kompletterad beskrivning</label>
          <textarea id={`review-${assignment.id}`} value={draft} onChange={event => { setDraft(event.target.value); setSaved(false); }} maxLength={600} rows={7} className="w-full rounded-lg border-2 border-input bg-background p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          <p className="mt-1 text-right text-sm text-muted-foreground">{draft.length}/600</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-3">
        <Button variant="outline" className="min-h-11" onClick={() => { setResult(null); setDraft(original); setError(""); }}>Avvisa förslag</Button>
        <Button className="min-h-11" onClick={preview} disabled={draft.trim() === original.trim()}><ClipboardCheck />Förhandsgranska ändring</Button>
      </div>
    </div>}
    <Dialog open={confirming} onOpenChange={open => { if (!saving) setConfirming(open); }}>
      <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-lg">
        <DialogTitle>Bekräfta ändring av uppdrag</DialogTitle>
        <DialogDescription>{assignment.title}</DialogDescription>
        <div className="grid gap-5 sm:grid-cols-2"><div><h4 className="mb-2 font-bold">Före</h4><p className="whitespace-pre-wrap break-words text-muted-foreground">{original}</p></div><div><h4 className="mb-2 font-bold">Efter</h4><p className="whitespace-pre-wrap break-words">{draft.trim()}</p></div></div>
        <DialogFooter className="gap-3"><Button variant="outline" className="min-h-11" disabled={saving} onClick={() => setConfirming(false)}>Avbryt</Button><Button className="min-h-11" disabled={saving} onClick={confirm}>{saving && <LoaderCircle className="animate-spin" />}{saving ? "Sparar…" : "Bekräfta och spara"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </article>;
}

export function AssignmentReviewPanel({ assignments }: { assignments: Assignment[] }) {
  const { isAdmin, user } = useAppAuth();
  if (!isAdmin || !user) return null;
  const fresh = assignments.filter(assignment => assignment.status === "Ny").sort((a, b) => b.created_at.localeCompare(a.created_at));
  return <section className="mt-12 border-t border-border pt-8" aria-label="AI-granskning">
    <h2 className="flex items-center gap-3 text-3xl"><ClipboardCheck className="size-7 shrink-0 text-primary" />Granska nya uppdrag</h2>
    {fresh.length ? <div className="mt-5 grid gap-5">{fresh.map(assignment => <ReviewItem key={`${user.id}-${assignment.id}`} assignment={assignment} />)}</div> : <p className="mt-4 text-muted-foreground">Inga nya uppdrag att granska.</p>}
  </section>;
}
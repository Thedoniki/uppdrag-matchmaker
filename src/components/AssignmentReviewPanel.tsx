import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ClipboardCheck, LoaderCircle, Sparkles } from "lucide-react";
import { useAppAuth } from "./AuthProvider";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { reviewAssignment, confirmAssignmentReview, markAssignmentReviewed } from "@/lib/assignment-review.functions";
import { confirmReviewSchema, type AssignmentReview } from "@/lib/assignment-review";
import { useReviewState } from "./AssignmentReviewStatus";
import type { Assignment } from "@/lib/assignments";

// One label style for every block in the dialog, so the sections read as a list of steps.
const SECTION_LABEL = "mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground";

function ReviewItem({ assignment }: { assignment: Assignment }) {
  const review = useServerFn(reviewAssignment);
  const save = useServerFn(confirmAssignmentReview);
  const mark = useServerFn(markAssignmentReviewed);
  const queryClient = useQueryClient();
  const { reviewedAt, loading: statesLoading } = useReviewState(assignment.id);
  const [result, setResult] = useState<AssignmentReview | null>(null);
  const [original, setOriginal] = useState(assignment.need);
  const [draft, setDraft] = useState(assignment.need);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [marking, setMarking] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [opened, setOpened] = useState(false);

  async function generate() {
    setOpened(true); setBusy(true); setError(""); setSaved(false);
    try {
      const response = await review({ data: { id: assignment.id } });
      if (!response.ok) { setError(response.error); return; }
      setResult(response.review); setOriginal(response.original); setDraft(response.original);
    } catch { setError("Granskningen kunde inte hämtas. Uppdraget är oförändrat."); }
    finally { setBusy(false); }
  }

  // The admin can also finish the review without changing the text; the AI never marks anything on its own.
  async function finish() {
    setMarking(true); setError("");
    try {
      await mark({ data: { id: assignment.id, confirmed: true } });
      await queryClient.invalidateQueries({ queryKey: ["review-states"] });
    } catch (error) { setError(error instanceof Error ? error.message : "Granskningsstatus kunde inte sparas."); }
    finally { setMarking(false); }
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
      setOriginal(draft.trim()); setDraft(draft.trim()); setSaved(true); setConfirming(false); setResult(null); setOpened(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["assignments"] }),
        queryClient.invalidateQueries({ queryKey: ["assignment", assignment.id] }),
        queryClient.invalidateQueries({ queryKey: ["review-states"] }),
      ]);
    } catch (error) { setError(error instanceof Error ? error.message : "Ändringen kunde inte sparas."); setConfirming(false); }
    finally { setSaving(false); }
  }

  const disabled = busy || saving || marking;

  return <div className="mt-4 border-t border-border pt-4">
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => { if (result) setOpened(true); else void generate(); }} disabled={disabled} variant="secondary" className="min-h-11 flex-1 basis-44">
        {busy ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : <Sparkles />} {busy ? "Granskar…" : result ? "Visa AI-förslag" : "Granska med AI"}
      </Button>
      {!statesLoading && !reviewedAt && <Button onClick={finish} disabled={disabled} variant="outline" className="min-h-11 flex-1 basis-44">
        {marking ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : <Check />} {marking ? "Markerar…" : "Markera som granskad"}
      </Button>}
    </div>
    {saved && <p role="status" className="mt-4 rounded-lg bg-secondary px-4 py-3 font-semibold text-secondary-foreground">Den bekräftade beskrivningen är sparad.</p>}
    <Dialog open={opened} onOpenChange={open => { if (!saving) { setOpened(open); if (!open) setConfirming(false); } }}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-1rem)] max-w-6xl gap-3 overflow-y-auto rounded-xl p-4 sm:gap-5 sm:p-7">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl leading-snug">{confirming ? "Bekräfta ändring av uppdrag" : "Granska uppdrag med AI"}</DialogTitle>
          <DialogDescription className="text-base">{assignment.title}</DialogDescription>
        </DialogHeader>

        {busy && <p role="status" className="flex items-center gap-3 rounded-xl bg-muted p-4 font-semibold">
          <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" />AI:n läser beskrivningen…
        </p>}
        {error && <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">{error}</p>}

        {!confirming && result && <div className="space-y-3 sm:space-y-4">
          <section className="rounded-xl border border-primary/20 bg-secondary p-4 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-secondary-foreground">
              <Sparkles className="size-4" aria-hidden="true" />Sammanfattning
            </h3>
            <p className="mt-2 text-base font-semibold text-secondary-foreground">{result.summary}</p>
          </section>

          {result.missing.length ? <section>
            <h3 className={SECTION_LABEL}>Saknade uppgifter</h3>
            <ul className="grid gap-3 md:grid-cols-2">
              {result.missing.map((item, index) => <li key={index} className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-soft">
                <h4 className="text-lg font-bold">{item.label}</h4>
                <p className="mt-1.5 text-base leading-relaxed text-foreground/85">{item.reason}</p>
                <p className="mt-3 rounded-lg bg-muted/70 px-3 py-2 text-base font-semibold text-foreground">{item.question}</p>
              </li>)}
            </ul>
          </section> : <p className="rounded-xl border border-border bg-card p-4 text-base text-foreground/85">Inga tydligt saknade uppgifter hittades.</p>}

          <section className="grid items-stretch gap-3 lg:grid-cols-2 lg:gap-5">
            <div className="flex flex-col">
              <h3 className={SECTION_LABEL}>Nuvarande beskrivning</h3>
              <p className="min-h-28 flex-1 whitespace-pre-wrap break-words rounded-xl border border-border bg-card p-4 text-base leading-relaxed text-foreground/85">{original}</p>
            </div>
            <div className="flex flex-col">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <label htmlFor={`review-${assignment.id}`} className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Kompletterad beskrivning</label>
                <span className="text-sm text-muted-foreground">{draft.length}/600 tecken</span>
              </div>
              <textarea
                id={`review-${assignment.id}`}
                value={draft}
                onChange={event => { setDraft(event.target.value); setSaved(false); }}
                maxLength={600}
                rows={8}
                className="min-h-28 w-full flex-1 resize-none rounded-xl border-2 border-input bg-card p-4 text-base leading-relaxed text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </section>

          <DialogFooter className={FOOTER}>
            <Button variant="outline" className="min-h-11" onClick={() => { setResult(null); setDraft(original); setError(""); setOpened(false); }}>Avvisa förslag</Button>
            {!statesLoading && !reviewedAt && <Button variant="outline" className="min-h-11" onClick={finish} disabled={disabled}><Check />Markera som granskad</Button>}
            <Button className="min-h-11" onClick={preview} disabled={draft.trim() === original.trim()}><ClipboardCheck />Förhandsgranska ändring</Button>
          </DialogFooter>
        </div>}

        {confirming && <>
          <p className="rounded-xl border border-border bg-muted/70 p-4 text-base text-foreground/85">Endast beskrivningen ändras. Uppdraget markeras som granskat när du bekräftar.</p>
          <div className="grid items-stretch gap-3 lg:grid-cols-2 lg:gap-5">
            <div className="flex flex-col">
              <h3 className={SECTION_LABEL}>Före</h3>
              <p className="min-h-28 flex-1 whitespace-pre-wrap break-words rounded-xl border border-border bg-card p-4 text-base leading-relaxed text-foreground/85">{original}</p>
            </div>
            <div className="flex flex-col">
              <h3 className={SECTION_LABEL}>Efter</h3>
              <p className="min-h-28 flex-1 whitespace-pre-wrap break-words rounded-xl border border-primary/30 bg-secondary p-4 text-base leading-relaxed">{draft.trim()}</p>
            </div>
          </div>
          <DialogFooter className={FOOTER}>
            <Button variant="outline" className="min-h-11" disabled={saving} onClick={() => setConfirming(false)}>Avbryt</Button>
            <Button className="min-h-11" disabled={saving} onClick={confirm}>{saving && <LoaderCircle className="animate-spin motion-reduce:animate-none" />}{saving ? "Sparar…" : "Bekräfta och spara"}</Button>
          </DialogFooter>
        </>}
      </DialogContent>
    </Dialog>
  </div>;
}

export function AssignmentReviewPanel({ assignment }: { assignment: Assignment }) {
  const { isAdmin, user } = useAppAuth();
  if (!isAdmin || !user || assignment.status !== "Ny") return null;
  return <ReviewItem key={`${user.id}-${assignment.id}`} assignment={assignment} />;
}

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAppAuth } from "./AuthProvider";
import { Button } from "./ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "./ui/alert-dialog";

export function AssignmentActions({ id, title, archived = false, onComplete }: { id: string; title: string; archived?: boolean; onComplete?: () => void | Promise<void> }) {
  const { isAdmin } = useAppAuth();
  const qc = useQueryClient();
  const [action, setAction] = useState<"delete" | "archive" | "restore" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!isAdmin) return null;
  async function confirm() {
    if (!action || !isAdmin) return;
    setBusy(true); setError("");
    try {
      const query = action === "delete"
        ? supabase.from("assignments").delete().eq("id", id).select("id")
        : supabase.from("assignments").update({ archived_at: action === "archive" ? new Date().toISOString() : null }).eq("id", id).select("id");
      const { data, error: failure } = await query;
      if (failure || !data?.length) throw new Error("Åtgärden kunde inte utföras. Kontrollera din behörighet och försök igen.");
      qc.removeQueries({ queryKey: ["assignment", id] });
      await Promise.all([qc.invalidateQueries({ queryKey: ["assignments"] }), qc.invalidateQueries({ queryKey: ["archive"] })]);
      setAction(null);
      await onComplete?.();
    } catch (e) { setError(e instanceof Error ? e.message : "Något gick fel."); }
    finally { setBusy(false); }
  }
  return <>
    <div className="mt-6 flex flex-wrap gap-3">
      <Button variant="destructive" size="lg" onClick={() => { setError(""); setAction("delete"); }}><Trash2 />Ta bort</Button>
      <Button variant="outline" size="lg" onClick={() => { setError(""); setAction(archived ? "restore" : "archive"); }}>{archived ? <ArchiveRestore /> : <Archive />}{archived ? "Återställ" : "Arkivera"}</Button>
    </div>
    <AlertDialog open={action !== null} onOpenChange={open => { if (!open && !busy) setAction(null); }}>
      <AlertDialogContent>
        <AlertDialogTitle>{action === "delete" ? "Ta bort uppdraget?" : action === "restore" ? "Återställ uppdraget?" : "Arkivera uppdraget?"}</AlertDialogTitle>
        <AlertDialogDescription>{title}. {action === "delete" ? "Uppdraget och tillhörande uppgifter raderas permanent." : action === "restore" ? "Uppdraget visas åter i listan." : "Uppdraget döljs för besökare och sparas i administratörernas arkiv."}</AlertDialogDescription>
        {error && <p role="alert" className="text-destructive">{error}</p>}
        <AlertDialogFooter><AlertDialogCancel disabled={busy}>Avbryt</AlertDialogCancel><Button variant={action === "delete" ? "destructive" : "default"} disabled={busy} onClick={confirm}>{busy ? "Sparar…" : "Bekräfta"}</Button></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>;
}
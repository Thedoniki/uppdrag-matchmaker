import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { useAppAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Field, Spinner, inputCls } from "@/components/FormField";
import { btnPrimary } from "@/components/buttons";
import "@lovable.dev/cloud-auth-js/styles.css";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Administratörsinloggning – Uppdragsbanken Helsingborg" },
    { name: "description", content: "Logga in för att hantera uppdrag i Uppdragsbanken Helsingborg." },
    { property: "og:title", content: "Administratörsinloggning – Uppdragsbanken Helsingborg" },
    { property: "og:description", content: "Logga in för att hantera uppdrag i Uppdragsbanken Helsingborg." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: AuthPage,
});
function AuthPage() {
  const { user, isAdmin } = useAppAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  useEffect(() => { if (isAdmin) void navigate({ to: "/uppdrag" }); }, [isAdmin, navigate]);
  async function login(provider: "google" | "lovable") {
    setBusy(true); setError("");
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth` });
      if (result.error) setError("Inloggningen kunde inte slutföras. Försök igen.");
    } catch { setError("Inloggningen kunde inte slutföras. Försök igen."); }
    finally { setBusy(false); }
  }
  async function loginWithPassword(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) setError("Fel e-postadress eller lösenord. Försök igen.");
  }
  return <section className="mx-auto max-w-lg px-4 py-16"><h1 className="text-4xl">Administratörsinloggning</h1>
    {user ? <><p className="mt-6">Du är inloggad men saknar administratörsbehörighet.</p><Link to="/uppdrag" className="mt-6 inline-block text-primary underline">Till uppdragen</Link></> : <>
      <form onSubmit={loginWithPassword} className="mt-8 rounded-xl border border-border bg-card p-6 shadow-soft">
        <Field id="login-email" label="E-postadress" required>
          <input id="login-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="namn@foretag.se" />
        </Field>
        <div className="mt-5">
          <Field id="login-password" label="Lösenord" required>
            <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="Ditt lösenord" />
          </Field>
        </div>
        <button type="submit" disabled={busy} className={`${btnPrimary} mt-6 w-full`}>
          {busy ? <Spinner /> : null} Logga in
        </button>
      </form>
      <p className="mt-8 text-center text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">eller</p>
      <div className="mt-6 flex flex-col gap-4"><Button variant="outline" size="lg" disabled={busy} onClick={() => login("google")}>Logga in med Google</Button><Button className="lovable-auth-button" disabled={busy} onClick={() => login("lovable")}>Logga in med Lovable</Button></div>
    </>}
    {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
  </section>;
}

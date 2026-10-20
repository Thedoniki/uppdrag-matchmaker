import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { lovable } from "@/integrations/lovable";
import { useAppAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
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
  useEffect(() => { if (isAdmin) void navigate({ to: "/uppdrag" }); }, [isAdmin, navigate]);
  async function login(provider: "google" | "lovable") {
    setBusy(true); setError("");
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth` });
      if (result.error) setError("Inloggningen kunde inte slutföras. Försök igen.");
    } catch { setError("Inloggningen kunde inte slutföras. Försök igen."); }
    finally { setBusy(false); }
  }
  return <section className="mx-auto max-w-lg px-4 py-16"><h1 className="text-4xl">Administratörsinloggning</h1>
    {user ? <><p className="mt-6">Du är inloggad men saknar administratörsbehörighet.</p><Link to="/uppdrag" className="mt-6 inline-block text-primary underline">Till uppdragen</Link></> : <div className="mt-8 flex flex-col gap-4"><Button variant="outline" size="lg" disabled={busy} onClick={() => login("google")}>Logga in med Google</Button><Button className="lovable-auth-button" disabled={busy} onClick={() => login("lovable")}>Logga in med Lovable</Button></div>}
    {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
  </section>;
}
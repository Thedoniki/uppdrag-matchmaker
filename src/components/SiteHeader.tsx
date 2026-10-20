import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppAuth } from "./AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import tttSymbol from "@/assets/tech-talent-official-symbol.svg.asset.json";
import tttWordmark from "@/assets/tech-talent-official-wordmark.svg.asset.json";

const linkBase = "whitespace-nowrap rounded-lg px-3 py-2 font-semibold text-foreground transition-colors hover:text-primary";

const siteLinks = [
  { label: "Hem", href: "https://techtraineetalent.se/" },
  { label: "Om projektet", href: "https://techtraineetalent.se/om-projektet" },
  { label: "Samarbetspartners", href: "https://techtraineetalent.se/samarbetspartners" },
];

export function SiteHeader() {
  const { user } = useAppAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    close();
    await navigate({ to: "/auth", replace: true });
  }
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const links = (
    <>
      {siteLinks.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={linkBase} onClick={close}>
          {l.label}
        </a>
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={`${linkBase} h-auto text-base`}>
            Uppdragsbanken <ChevronDown aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuItem asChild className="px-3 py-3 text-base">
            <Link to="/lamna-uppdrag" onClick={close}>Lämna ett uppdrag</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="px-3 py-3 text-base">
            <Link to="/uppdrag" onClick={close}>Se uppdrag</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="px-3 py-3 text-base">
            <a href="mailto:info@techtraineetalent.se" onClick={close}>Kontakta oss</a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {user ? <DropdownMenuItem className="px-3 py-3 text-base" onSelect={() => { void signOut(); }}>Logga ut</DropdownMenuItem> : <DropdownMenuItem asChild className="px-3 py-3 text-base"><Link to="/auth" onClick={close}>Administratörsinloggning</Link></DropdownMenuItem>}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" aria-label="Tech Trainee Talent – till startsidan" className="flex min-w-0 items-center gap-3">
          <img src={tttSymbol.url} alt="Tech Talent symbol" className="h-12 w-12 shrink-0 object-contain" />
          <img src={tttWordmark.url} alt="Tech Trainee Talent" className="h-auto w-48 max-w-full min-w-0 object-contain sm:w-72 lg:w-80" />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Huvudmeny">{links}</nav>
        <Button variant="ghost" size="icon"
          className="rounded-lg p-2 lg:hidden"
          aria-label={open ? "Stäng meny" : "Öppna meny"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-border px-4 py-3 lg:hidden" aria-label="Mobilmeny">
          {links}
        </nav>
      )}
    </header>
  );
}

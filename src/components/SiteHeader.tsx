import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import tttWordmark from "@/assets/ttt-wordmark.jpeg.asset.json";

const linkBase = "whitespace-nowrap rounded-lg px-3 py-2 font-semibold text-foreground transition-colors hover:text-primary";
const activeCls = "bg-secondary text-primary";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const links = (
    <>
      <Link to="/" className={linkBase} activeProps={{ className: activeCls }} activeOptions={{ exact: true }} onClick={close}>
        Start
      </Link>
      <Link to="/uppdrag" className={linkBase} activeProps={{ className: activeCls }} onClick={close}>
        Se uppdrag
      </Link>
      <Link to="/lamna-uppdrag" className={linkBase} activeProps={{ className: activeCls }} onClick={close}>
        Lämna ett uppdrag
      </Link>
      <a href="https://techtraineetalent.se" target="_blank" rel="noreferrer" className={linkBase}>
        Om Tech Talent
      </a>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-4">
          <Link to="/" aria-label="Uppdragsbanken – till startsidan">
            <Logo />
          </Link>
          <span className="hidden h-9 w-px bg-border xl:block" aria-hidden="true" />
          <a href="https://techtraineetalent.se" target="_blank" rel="noreferrer" className="hidden items-center gap-2 xl:flex">
            <span className="text-sm text-muted-foreground">av</span>
            <img src={tttWordmark.url} alt="Tech Trainee Talent" className="h-6 w-auto" />
          </a>
        </div>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Huvudmeny">{links}</nav>
        <button
          className="rounded-lg p-2 lg:hidden"
          aria-label={open ? "Stäng meny" : "Öppna meny"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-border px-4 py-3 lg:hidden" aria-label="Mobilmeny">
          {links}
        </nav>
      )}
    </header>
  );
}

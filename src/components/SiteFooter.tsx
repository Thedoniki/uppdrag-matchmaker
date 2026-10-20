import { Link } from "@tanstack/react-router";
import tttSymbol from "@/assets/ttt-symbol.jpeg.asset.json";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <a
            href="https://techtraineetalent.se"
            target="_blank"
            rel="noreferrer"
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-card p-2"
          >
            <img src={tttSymbol.url} alt="Tech Trainee Talent" className="h-full w-full object-contain" />
          </a>
          <div>
            <p className="text-xl font-bold">En del av Tech Talent</p>
            <p className="mt-1 opacity-90">Uppdragsbanken är ett initiativ av Tech Talent.</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <a href="https://techtraineetalent.se" target="_blank" rel="noreferrer" className="group font-semibold underline-offset-4 hover:underline">
            Läs mer om Tech Talent <span className="inline-block transition-transform group-hover:translate-x-[3px]">→</span>
          </a>
          <p className="font-semibold">Kontakt</p>
          <a href="mailto:info@techtraineetalent.se" className="hover:underline">info@techtraineetalent.se</a>
          <p>Helsingborg, Sverige</p>
          <Link to="/integritet" className="text-sm underline-offset-4 hover:underline">
            Integritet
          </Link>
        </div>
      </div>
    </footer>
  );
}

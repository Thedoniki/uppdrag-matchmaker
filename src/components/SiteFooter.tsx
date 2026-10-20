import { Link } from "@tanstack/react-router";
import tttSymbol from "@/assets/ttt-symbol.jpeg.asset.json";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:grid-cols-2 sm:gap-8 md:grid-cols-[2fr_1fr_1fr] md:gap-10 md:py-10">
        <div className="flex items-start gap-4 sm:col-span-2 md:col-span-1">
          <a
            href="https://techtraineetalent.se"
            target="_blank"
            rel="noreferrer"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-card p-2"
          >
            <img src={tttSymbol.url} alt="Tech Trainee Talent" className="h-full w-full object-contain" />
          </a>
          <div className="min-w-0">
            <p className="text-lg font-bold">En del av Tech Talent</p>
            <p className="mt-1 opacity-90">Uppdragsbanken är ett initiativ av Tech Talent.</p>
          </div>
        </div>
        <div className="flex flex-col">
          <p className="text-sm font-bold uppercase tracking-wide opacity-80">Kontakt</p>
          <a href="mailto:info@techtraineetalent.se" className="break-all py-2 underline-offset-4 hover:underline">info@techtraineetalent.se</a>
          <p className="py-2">Helsingborg, Sverige</p>
        </div>
        <div className="flex flex-col">
          <p className="text-sm font-bold uppercase tracking-wide opacity-80">Mer</p>
          <a href="https://techtraineetalent.se" target="_blank" rel="noreferrer" className="group py-2 underline-offset-4 hover:underline">
            Läs mer om Tech Talent <span className="inline-block transition-transform group-hover:translate-x-[3px]">→</span>
          </a>
          <Link to="/integritet" className="py-2 underline-offset-4 hover:underline">
            Integritet
          </Link>
        </div>
      </div>
    </footer>
  );
}

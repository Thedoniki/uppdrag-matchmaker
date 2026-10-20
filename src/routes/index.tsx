import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { arrow, btnPrimary, btnSecondary, eyebrow } from "@/components/buttons";
import { useAppAuth } from "@/components/AuthProvider";
import samarbetePhoto from "@/assets/samarbete-photo.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Uppdragsbanken Helsingborg" },
      { name: "description", content: "Lämna små digitala uppdrag till deltagare i Tech Talent i Helsingborg." },
      { property: "og:title", content: "Uppdragsbanken Helsingborg" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:description", content: "Lämna små digitala uppdrag till deltagare i Tech Talent i Helsingborg." },
    ],
  }),
  component: Index,
});

const steps = [
  { n: "01", t: "Skicka en förfrågan", d: "Beskriv vad ni behöver hjälp med, till exempel en enkel hemsida, en digital meny eller en affisch." },
  { n: "02", t: "Vi granskar er förfrågan", d: "Vi granskar förfrågan för att se om uppdraget passar våra deltagare. Om det gör det publicerar vi det här." },
  { n: "03", t: "Anmäl intresse", d: "Deltagarna kan bläddra bland uppdragen och anmäla intresse. En handledare går igenom detaljerna innan arbetet börjar." },
];

function Index() {
  const { user, loading } = useAppAuth();

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <Reveal>
          <p className={eyebrow}>Ett initiativ av Tech Talent</p>
          <h1 className="mt-3 text-4xl sm:text-5xl md:text-7xl">Uppdragsbanken</h1>
          <p className="mt-6 max-w-2xl text-xl text-muted-foreground md:text-2xl">
            Här kan företag och föreningar lämna små digitala uppdrag till Tech Talent. Våra deltagare får möjlighet att
            arbeta med uppdragen med stöd och handledning.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/lamna-uppdrag" className={btnPrimary}>
              Lämna ett uppdrag <span className={arrow}>→</span>
            </Link>
            <Link to="/uppdrag" className={btnSecondary}>
              Se tillgängliga uppdrag
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <Reveal>
            <h2 className="text-4xl md:text-5xl">Så fungerar det</h2>
          </Reveal>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <p className="text-6xl font-extrabold text-secondary/60">{s.n}</p>
                <h3 className="mt-3 text-2xl">{s.t}</h3>
                <p className="mt-2 text-lg opacity-90">{s.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary-hover text-primary-foreground">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-[5fr_6fr] md:gap-10 md:py-20 lg:gap-16">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.18em] opacity-80">Samarbete</p>
            <h2 className="mt-3 text-3xl leading-tight sm:text-4xl lg:text-5xl">Ett partnerskap för framtiden</h2>
            <p className="mt-4 max-w-prose text-base leading-relaxed opacity-90 sm:text-lg">
              Tech Talent är ett resultat av samarbete mellan näringslivet, kommuner och
              arbetsmarknadsförvaltningen på Helsingborgs stad. Tillsammans bygger vi en mer
              inkluderande tech-bransch med fokus på långsiktig hållbarhet.
            </p>
            <a
              href="https://techtraineetalent.se/samarbetspartners"
              target="_blank"
              rel="noreferrer"
              className="group mt-6 inline-flex min-h-11 items-center gap-2 font-semibold underline-offset-4 hover:underline"
            >
              Läs mer om våra samarbetspartners
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-2xl ring-1 ring-primary-foreground/15 md:rounded-3xl">
              <img
                src={samarbetePhoto.url}
                alt="Studenter i Tech Talent samlade kring en dator i ett klassrum."
                className="aspect-[4/3] w-full object-cover md:aspect-[711/428]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {!loading && !user && (
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <Reveal>
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl">Vill du veta mer?</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Läs mer om projektet bakom Uppdragsbanken eller kontakta oss direkt.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <a
                  href="https://techtraineetalent.se/om-projektet"
                  target="_blank"
                  rel="noreferrer"
                  className={btnPrimary}
                >
                  Mer om projektet <span className={arrow}>→</span>
                </a>
                <a href="mailto:info@techtraineetalent.se" className={btnSecondary}>
                  Kontakta oss
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      )}
    </>
  );
}

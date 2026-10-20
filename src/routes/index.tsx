import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { assignmentsQuery } from "@/lib/assignments";
import { AssignmentCard } from "@/components/AssignmentCard";
import { Reveal } from "@/components/Reveal";
import { arrow, btnPrimary, btnSecondary, eyebrow } from "@/components/buttons";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Uppdragsbanken Helsingborg" },
      { name: "description", content: "Lämna små digitala uppdrag till deltagare i Tech Talent i Helsingborg." },
      { property: "og:title", content: "Uppdragsbanken Helsingborg" },
      { property: "og:description", content: "Lämna små digitala uppdrag till deltagare i Tech Talent i Helsingborg." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(assignmentsQuery(6)),
  component: Index,
});

const steps = [
  { n: "01", t: "Skicka en förfrågan", d: "Beskriv vad ni behöver hjälp med, till exempel en enkel hemsida, en digital meny eller en affisch." },
  { n: "02", t: "Vi granskar er förfrågan", d: "Vi granskar förfrågan för att se om uppdraget passar våra deltagare. Om det gör det publicerar vi det här." },
  { n: "03", t: "Anmäl intresse", d: "Deltagarna kan bläddra bland uppdragen och anmäla intresse. En handledare går igenom detaljerna innan arbetet börjar." },
];

function Index() {
  const { data } = useSuspenseQuery(assignmentsQuery(6));
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <Reveal>
          <p className={eyebrow}>Ett initiativ av Tech Talent</p>
          <h1 className="mt-3 text-5xl md:text-7xl">Uppdragsbanken</h1>
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

      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <h2 className="text-4xl md:text-5xl">Aktuella uppdrag</h2>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((a, i) => (
            <Reveal key={a.id} delay={i * 0.06} className="h-full">
              <AssignmentCard a={a} />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

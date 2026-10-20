import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/integritet")({
  head: () => ({
    meta: [
      { title: "Integritet – Uppdragsbanken Helsingborg" },
      { name: "description", content: "Så hanterar Uppdragsbanken Helsingborg personuppgifter." },
      { property: "og:title", content: "Integritet – Uppdragsbanken Helsingborg" },
      { property: "og:description", content: "Så hanterar Uppdragsbanken Helsingborg personuppgifter." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl md:text-5xl">Integritet</h1>
      <div className="mt-8 rounded-xl border border-border bg-card p-8 text-lg shadow-soft">
        <p>
          Uppdragsbanken är en prototyp byggd av deltagare i Tech Talent. Vi samlar bara in de uppgifter som behövs för att
          hantera uppdrag och intresseanmälningar: organisationens namn, kontaktperson, e-postadress, telefonnummer (valfritt),
          teamnamn och motivering. Kontaktuppgifter visas aldrig offentligt och används bara av Tech Talent för uppföljning.
        </p>
        <p className="mt-4">
          Använd påhittade uppgifter i den här versionen. All data raderas efter testperioden. Kontakta Tech Talent om du vill
          att dina uppgifter tas bort.
        </p>
      </div>
    </section>
  );
}

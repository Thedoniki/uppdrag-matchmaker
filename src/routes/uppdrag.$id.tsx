import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { assignmentQuery, formatDate, interestText } from "@/lib/assignments";
import { interestSchema } from "@/lib/validation";
import { CategoryTag } from "@/components/AssignmentCard";
import { Field, Spinner, inputCls } from "@/components/FormField";
import { Reveal, SuccessCheck } from "@/components/Reveal";
import { btnPrimary } from "@/components/buttons";

export const Route = createFileRoute("/uppdrag/$id")({
  loader: async ({ context, params }) => {
    const a = await context.queryClient.ensureQueryData(assignmentQuery(params.id));
    if (!a) throw notFound();
    return { title: a.title, need: a.need };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} – Uppdragsbanken Helsingborg` },
          { name: "description", content: loaderData.need.slice(0, 155) },
          { property: "og:title", content: `${loaderData.title} – Uppdragsbanken Helsingborg` },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary_large_image" },
          { property: "og:description", content: loaderData.need.slice(0, 155) },
        ]
      : [{ title: "Uppdrag – Uppdragsbanken Helsingborg" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-4xl">Uppdraget hittades inte</h1>
      <Link to="/uppdrag" className="mt-6 inline-block font-bold text-primary">← Tillbaka till alla uppdrag</Link>
    </section>
  ),
  component: DetailPage,
});

function DetailPage() {
  const { id } = Route.useParams();
  const { data: a } = useSuspenseQuery(assignmentQuery(id));
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  if (!a) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <Link to="/uppdrag" className="font-bold text-primary hover:text-primary-hover">
        ← Tillbaka till alla uppdrag
      </Link>
      <Reveal>
        <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-soft md:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <CategoryTag>{a.category}</CategoryTag>
            <span className="rounded-full border border-primary px-3 py-1 text-sm font-semibold text-primary">{a.status}</span>
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl">{a.title}</h1>
          <p className="mt-3 text-xl text-muted-foreground">
            {a.organisation_name} · {a.organisation_type}
          </p>
          <p className="mt-2 text-lg">
            Önskat slutdatum: <span className="font-semibold">{formatDate(a.preferred_date)}</span>
          </p>

          <h2 className="mt-10 text-2xl">Om uppdraget</h2>
          <p className="mt-3 whitespace-pre-line text-lg">{a.need}</p>

          <p className="mt-8 rounded-lg bg-secondary p-4 text-secondary-foreground">
            Kontaktuppgifter delas först när handledaren har granskat uppdraget.
          </p>
          {a.interest_count > 0 && <p className="mt-4 text-lg font-semibold text-primary">{interestText(a.interest_count)}</p>}
        </div>
      </Reveal>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-5 text-xl font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        Anmäl intresse
        <ChevronDown className={`transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <InterestPanel assignmentId={a.id} title={a.title} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

type InterestValues = z.infer<typeof interestSchema>;

function InterestPanel({ assignmentId, title }: { assignmentId: string; title: string }) {
  const qc = useQueryClient();
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<InterestValues>({
    resolver: zodResolver(interestSchema),
    mode: "onTouched",
    defaultValues: { team_name: "", email: "", motivation: "", website: "" },
  });
  const motivation = watch("motivation") ?? "";

  const onSubmit = async (v: InterestValues) => {
    setFailed(false);
    if (v.website) {
      setDone(true);
      return;
    }
    const { error } = await supabase.from("interest_registrations").insert({
      assignment_id: assignmentId,
      team_name: v.team_name.trim(),
      email: v.email.trim(),
      motivation: v.motivation.trim(),
    });
    if (error) {
      setFailed(true);
      return;
    }
    reset();
    setDone(true);
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["assignment", assignmentId] }),
      qc.invalidateQueries({ queryKey: ["assignments"] }),
    ]);
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 rounded-xl border border-primary/30 bg-secondary p-8 text-secondary-foreground"
      >
        <SuccessCheck />
        <h2 className="mt-4 text-2xl">Tack! Vi har tagit emot er intresseanmälan.</h2>
        <p className="mt-2 text-lg">
          En handledare går igenom anmälan och återkommer om nästa steg. Handledaren kontrollerar omfattning, kunskapsnivå
          och handledning innan ert team börjar med uppdraget.
        </p>
        <Link to="/uppdrag" className={`${btnPrimary} mt-6`}>
          Tillbaka till alla uppdrag
        </Link>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 rounded-xl border border-border bg-card p-6 shadow-soft md:p-8">
      <p className="text-base font-semibold text-muted-foreground">{title}</p>
      <h2 className="mt-1 text-3xl">Anmäl intresse</h2>
      <p className="mt-2 text-lg text-muted-foreground">
        Vill ert team arbeta med det här uppdraget? Fyll i formuläret och förklara kort varför ni är intresserade.
      </p>
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" {...register("website")} />
      <div className="mt-6 space-y-6">
        <Field id="team_name" label="Teamnamn" required error={errors.team_name?.message}>
          <input id="team_name" className={inputCls} placeholder="Ange ert teamnamn" aria-invalid={!!errors.team_name} {...register("team_name")} />
        </Field>
        <Field id="i_email" label="E-postadress" required error={errors.email?.message}>
          <input id="i_email" type="email" className={inputCls} placeholder="namn@exempel.se" aria-invalid={!!errors.email} {...register("email")} />
        </Field>
        <Field
          id="motivation"
          label="Varför är ni intresserade av det här uppdraget?"
          required
          error={errors.motivation?.message}
          extra={<p className="mt-1 text-right text-base text-muted-foreground">{motivation.length} / 400 tecken</p>}
        >
          <textarea
            id="motivation"
            rows={4}
            maxLength={400}
            className={inputCls}
            placeholder="Förklara kort varför uppdraget passar ert team."
            aria-invalid={!!errors.motivation}
            {...register("motivation")}
          />
        </Field>
        <div>
          <label className="flex items-start gap-3 text-lg">
            <input type="checkbox" className="mt-1.5 h-5 w-5 accent-primary" {...register("consent")} />
            <span>
              Jag godkänner att uppgifterna bara sparas för att hantera intresseanmälan (se{" "}
              <Link to="/integritet" className="font-semibold text-primary underline">Integritet</Link>).
              <span className="ml-1 text-accent" aria-hidden="true">*</span>
            </span>
          </label>
          {errors.consent && <p role="alert" className="mt-1.5 font-semibold text-destructive">{errors.consent.message}</p>}
        </div>
      </div>
      <hr className="my-6 border-border" />
      {failed && <p role="alert" className="mb-4 font-semibold text-destructive">Något gick fel. Försök igen.</p>}
      <button type="submit" disabled={!isValid || isSubmitting} className={btnPrimary}>
        {isSubmitting ? (<><Spinner /> Skickar...</>) : "Skicka intresseanmälan"}
      </button>
      <p className="mt-3 text-base text-muted-foreground">Fält markerade med <span className="text-accent">*</span> är obligatoriska.</p>
    </form>
  );
}

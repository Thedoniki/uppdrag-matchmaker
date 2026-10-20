import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { sv } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, ORGANISATION_TYPES } from "@/lib/assignments";
import { dateBounds, submitSchema } from "@/lib/validation";
import { Field, Spinner, inputCls } from "@/components/FormField";
import { useAppAuth } from "@/components/AuthProvider";
import { Reveal, SuccessCheck } from "@/components/Reveal";
import { btnPrimary, btnSecondary, eyebrow } from "@/components/buttons";

export const Route = createFileRoute("/lamna-uppdrag")({
  head: () => ({
    meta: [
      { title: "Lämna ett uppdrag – Uppdragsbanken Helsingborg" },
      { name: "description", content: "Beskriv ett litet digitalt uppdrag för deltagare i Tech Talent." },
      { property: "og:title", content: "Lämna ett uppdrag – Uppdragsbanken Helsingborg" },
      { property: "og:description", content: "Beskriv ett litet digitalt uppdrag för deltagare i Tech Talent." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SubmitPage,
});

type Values = z.infer<ReturnType<typeof submitSchema>>;

function SubmitPage() {
  const { isAdmin } = useAppAuth();
  const qc = useQueryClient();
  const schema = useMemo(() => submitSchema(), []);
  const bounds = useMemo(() => dateBounds(), []);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      organisation_name: "",
      organisation_type_other: "",
      title: "",
      need: "",
      preferred_date: "",
      contact_person: "",
      email: "",
      phone: "",
      website: "",
    },
  });
  const need = watch("need") ?? "";
  const organisationType = watch("organisation_type");

  const onSubmit = async (v: Values) => {
    setFailed(false);
    if (v.website) {
      setDoneId("");
      return;
    }
    const id = crypto.randomUUID();
    const { error } = await supabase.from("assignments").insert({
      id,
      organisation_name: v.organisation_name.trim(),
      organisation_type: v.organisation_type,
      organisation_type_other: v.organisation_type === "Annat" ? (v.organisation_type_other?.trim() ?? null) : null,
      title: v.title.trim(),
      need: v.need.trim(),
      category: v.category,
      preferred_date: v.preferred_date,
    });
    if (error) {
      setFailed(true);
      return;
    }
    const { error: cErr } = await supabase.from("assignment_contacts").insert({
      assignment_id: id,
      contact_person: v.contact_person.trim(),
      email: v.email.trim(),
      phone: v.phone.trim() || null,
      consent: true,
    });
    if (cErr) {
      setFailed(true);
      return;
    }
    reset();
    await qc.invalidateQueries({ queryKey: ["assignments"] });
    setDoneId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <Reveal>
        <p className={eyebrow}>För företag och föreningar</p>
        <h1 className="mt-3 text-4xl md:text-5xl">Lämna ett uppdrag</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Har ert företag eller er förening ett litet digitalt uppdrag? Berätta vad ni behöver hjälp med så granskar vi er
          förfrågan.
        </p>
      </Reveal>

      {doneId !== null ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 rounded-xl border border-primary/30 bg-secondary p-8 text-secondary-foreground"
        >
          <SuccessCheck />
          <h2 className="mt-4 text-3xl">Tack! Vi har tagit emot er förfrågan.</h2>
          <p className="mt-2 text-lg">Vi granskar ert uppdrag och hör av oss om det passar våra deltagare.</p>
          <div className="mt-6 flex flex-wrap gap-4">
            {isAdmin ? (
              <Link to="/uppdrag" className={btnPrimary}>Se uppdraget i listan</Link>
            ) : (
              <button type="button" className={btnPrimary} onClick={() => setDoneId(null)}>Lämna ett nytt uppdrag</button>
            )}
            <Link to="/" className={btnSecondary}>Tillbaka till startsidan</Link>
          </div>
        </motion.div>
      ) : (
        <>
          <p className="mt-8 rounded-lg border-l-4 border-accent bg-secondary p-4 text-lg text-secondary-foreground">
            Använd påhittade uppgifter. Skriv inte personnummer eller känslig information.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 rounded-xl border border-border bg-card p-6 shadow-soft md:p-10">
            <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" {...register("website")} />
            <div className="space-y-7">
              <Field id="organisation_name" label="Organisationens namn" required error={errors.organisation_name?.message}>
                <input id="organisation_name" className={inputCls} placeholder="Ange ett namn" aria-invalid={!!errors.organisation_name} {...register("organisation_name")} />
              </Field>
              <Field id="organisation_type" label="Typ av organisation" required error={errors.organisation_type?.message}>
                <select id="organisation_type" className={inputCls} defaultValue="" aria-invalid={!!errors.organisation_type} {...register("organisation_type")}>
                  <option value="" disabled>Välj typ</option>
                  {ORGANISATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              {organisationType === "Annat" && (
                <Field id="organisation_type_other" label="Ange typ av organisation" required error={errors.organisation_type_other?.message}>
                  <input id="organisation_type_other" className={inputCls} maxLength={120} placeholder="Beskriv er organisationstyp" required aria-invalid={!!errors.organisation_type_other} aria-describedby={errors.organisation_type_other ? "organisation_type_other-error" : undefined} {...register("organisation_type_other")} />
                </Field>
              )}
              <Field id="title" label="Uppdragets titel" required error={errors.title?.message}>
                <input id="title" className={inputCls} placeholder="Ge ert uppdrag en kort titel" aria-invalid={!!errors.title} {...register("title")} />
              </Field>
              <Field
                id="need"
                label="Vad behöver ni hjälp med?"
                required
                hint="Till exempel en enkel hemsida, en digital meny eller en affisch."
                error={errors.need?.message}
                extra={<p className="mt-1 text-right text-base text-muted-foreground">{need.length} / 600 tecken</p>}
              >
                <textarea id="need" rows={6} maxLength={600} className={inputCls} placeholder="Beskriv ert uppdrag här..." aria-invalid={!!errors.need} {...register("need")} />
              </Field>
              <Field id="category" label="Kategori" required error={errors.category?.message}>
                <select id="category" className={inputCls} defaultValue="" aria-invalid={!!errors.category} {...register("category")}>
                  <option value="" disabled>Välj en kategori</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field id="preferred_date" label="Önskat slutdatum" required hint="Välj ett datum mellan 7 dagar och 12 månader från idag." error={errors.preferred_date?.message}>
                <Controller name="preferred_date" control={control} render={({ field }) => (
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button id="preferred_date" type="button" variant="outline" ref={field.ref} onBlur={field.onBlur} className={`${inputCls} h-auto justify-start font-normal`} aria-invalid={!!errors.preferred_date} aria-describedby={errors.preferred_date ? "preferred_date-error" : undefined}>
                        <CalendarIcon />
                        {field.value ? format(parseISO(field.value), "PPP", { locale: sv }) : "Välj ett datum"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="pointer-events-auto w-auto p-0" align="start">
                      <Calendar mode="single" locale={sv} selected={field.value ? parseISO(field.value) : undefined} defaultMonth={field.value ? parseISO(field.value) : new Date()} disabled={{ before: parseISO(bounds.min), after: parseISO(bounds.max) }} onSelect={(date) => { field.onChange(date ? format(date, "yyyy-MM-dd") : ""); setCalendarOpen(false); }} autoFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                )} />
              </Field>
              <Field id="contact_person" label="Kontaktperson" required error={errors.contact_person?.message}>
                <input id="contact_person" className={inputCls} placeholder="Ditt namn" aria-invalid={!!errors.contact_person} {...register("contact_person")} />
              </Field>
              <Field id="email" label="E-postadress" required error={errors.email?.message}>
                <input id="email" type="email" className={inputCls} placeholder="namn@exempel.se" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} {...register("email")} />
              </Field>
              <Field id="phone" label="Telefon" error={errors.phone?.message}>
                <input id="phone" type="tel" className={inputCls} placeholder="042-00 00 00" aria-invalid={!!errors.phone} {...register("phone")} />
              </Field>
              <div>
                <label className="flex items-start gap-3 text-lg">
                  <input type="checkbox" className="mt-1.5 h-5 w-5 shrink-0 accent-primary" {...register("consent")} />
                  <span>
                    Jag förstår att uppdraget är ett utbildningsprojekt och att en handledare granskar det innan arbetet börjar.
                    Jag godkänner att mina kontaktuppgifter bara sparas för att hantera förfrågan (se{" "}
                    <Link to="/integritet" className="font-semibold text-primary underline">Integritet</Link>).
                    <span className="ml-1 text-accent" aria-hidden="true">*</span>
                  </span>
                </label>
                {errors.consent && <p role="alert" className="mt-1.5 font-semibold text-destructive">{errors.consent.message}</p>}
              </div>
            </div>
            <hr className="my-8 border-border" />
            {failed && <p role="alert" className="mb-4 font-semibold text-destructive">Något gick fel. Försök igen.</p>}
            <Button type="submit" disabled={isSubmitting} className={`${btnPrimary} h-auto whitespace-normal`}>
              {isSubmitting ? (<><Spinner /> Skickar...</>) : "Skicka förfrågan"}
            </Button>
            <p className="mt-3 text-base text-muted-foreground">Fält markerade med <span className="text-accent">*</span> är obligatoriska.</p>
          </form>
        </>
      )}
    </section>
  );
}

CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_name text NOT NULL,
  organisation_type text NOT NULL CHECK (organisation_type IN ('Företag','Förening','Annat')),
  title text NOT NULL,
  need text NOT NULL,
  category text NOT NULL CHECK (category IN ('Hemsida','Affisch eller grafiskt material','Formulär','Meny eller lista','Bokning','Annat')),
  preferred_date date,
  status text NOT NULL DEFAULT 'Ny' CHECK (status IN ('Ny','Under granskning','Tilldelad')),
  interest_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.assignments TO anon, authenticated;
GRANT ALL ON public.assignments TO service_role;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Alla kan läsa uppdrag" ON public.assignments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Alla kan lämna uppdrag" ON public.assignments FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'Ny' AND interest_count = 0);

CREATE TABLE public.assignment_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  contact_person text NOT NULL,
  email text NOT NULL,
  phone text,
  consent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.assignment_contacts TO anon, authenticated;
GRANT ALL ON public.assignment_contacts TO service_role;
ALTER TABLE public.assignment_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Alla kan lämna kontaktuppgifter" ON public.assignment_contacts FOR INSERT TO anon, authenticated WITH CHECK (consent = true);

CREATE TABLE public.interest_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  team_name text NOT NULL,
  email text NOT NULL,
  motivation text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.interest_registrations TO anon, authenticated;
GRANT ALL ON public.interest_registrations TO service_role;
ALTER TABLE public.interest_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Alla kan anmäla intresse" ON public.interest_registrations FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.increment_interest_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.assignments SET interest_count = interest_count + 1 WHERE id = NEW.assignment_id;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.increment_interest_count() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER interest_registrations_increment
AFTER INSERT ON public.interest_registrations
FOR EACH ROW EXECUTE FUNCTION public.increment_interest_count();

WITH a AS (
  INSERT INTO public.assignments (organisation_name, organisation_type, title, need, category, preferred_date, created_at) VALUES
  ('Exempelkaféet','Företag','Digital meny för ett kafé','Vi behöver hjälp att skapa en digital meny för vårt kafé. Menyn ska visa våra drycker, bakverk och lunchalternativ. Den ska vara lätt att läsa både i mobilen och på datorn. Vi vill också kunna uppdatera menyn när utbud eller priser ändras.','Meny eller lista','2026-11-30', now() - interval '6 minutes'),
  ('Exempelföreningen','Förening','Hemsida för en förening','Vi vill ha en enkel hemsida där vi kan presentera vår förening och kommande aktiviteter.','Hemsida','2026-12-15', now() - interval '5 minutes'),
  ('Exempel Kulturförening','Förening','Affisch till ett evenemang','Vi behöver hjälp att formge en affisch till ett kommande kulturevenemang.','Affisch eller grafiskt material','2027-01-10', now() - interval '4 minutes'),
  ('Exempel Aktivitetsgrupp','Förening','Anmälningsformulär på nätet','Vi behöver ett enkelt formulär på nätet där man kan anmäla sig till våra aktiviteter.','Formulär','2026-12-20', now() - interval '3 minutes'),
  ('Exempelverkstaden','Företag','System för tidsbokning','Vi vill ha ett enkelt bokningssystem på nätet för korta besökstider.','Bokning','2027-02-15', now() - interval '2 minutes'),
  ('Exempelkontoret','Företag','Digital guide för nyanställda','Vi behöver hjälp att samla information för nyanställda i en digital guide.','Annat','2027-01-31', now() - interval '1 minute')
  RETURNING id, title
)
INSERT INTO public.assignment_contacts (assignment_id, contact_person, email, phone, consent)
SELECT a.id, c.person, c.email, c.phone, true FROM a JOIN (VALUES
  ('Digital meny för ett kafé','Anna Exempel','anna@exempel-kafe.se','042-00 00 01'),
  ('Hemsida för en förening','Bertil Påhittad','bertil@exempel-forening.se',NULL),
  ('Affisch till ett evenemang','Cecilia Exempel','cecilia@exempel-kultur.se',NULL),
  ('Anmälningsformulär på nätet','David Påhittad','david@exempel-aktivitet.se',NULL),
  ('System för tidsbokning','Eva Exempel','eva@exempel-verkstad.se','042-00 00 05'),
  ('Digital guide för nyanställda','Frank Påhittad','frank@exempel-kontor.se',NULL)
) AS c(title, person, email, phone) ON c.title = a.title;
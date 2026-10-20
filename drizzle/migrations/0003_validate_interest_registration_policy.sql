ALTER POLICY "Alla kan anmäla intresse"
ON public.interest_registrations
TO anon, authenticated
WITH CHECK (
  char_length(btrim(team_name)) BETWEEN 2 AND 60
  AND char_length(btrim(email)) BETWEEN 3 AND 120
  AND btrim(email) ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  AND char_length(btrim(motivation)) BETWEEN 20 AND 400
);
COMMENT ON POLICY "Alla kan anmäla intresse" ON public.interest_registrations IS 'Public insert-only submissions; validate team name, email and motivation against the existing interest form bounds. Personal data remains unreadable to site users.';
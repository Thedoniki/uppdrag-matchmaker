ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
GRANT UPDATE (reviewed_at) ON public.assignments TO authenticated;
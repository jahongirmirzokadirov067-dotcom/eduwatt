-- Add alert threshold to school_profiles
ALTER TABLE public.school_profiles
  ADD COLUMN IF NOT EXISTS alert_threshold_kwh numeric DEFAULT 100;

-- Zones table
CREATE TABLE IF NOT EXISTS public.zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  zone_type text NOT NULL DEFAULT 'normal',
  current_kw numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own zones" ON public.zones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own zones" ON public.zones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own zones" ON public.zones FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own zones" ON public.zones FOR DELETE USING (auth.uid() = user_id);

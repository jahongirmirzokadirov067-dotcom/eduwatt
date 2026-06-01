
-- AI Recommendations table
CREATE TABLE public.ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  rec_key TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  category TEXT,
  effort TEXT,
  projected_saving_kwh_per_day NUMERIC DEFAULT 0,
  projected_co2_kg_per_month NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','implemented','dismissed')),
  month TEXT,
  implemented_at TIMESTAMPTZ,
  impact_notes TEXT
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_recommendations TO authenticated;
GRANT ALL ON public.ai_recommendations TO service_role;

ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own ai recs" ON public.ai_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own ai recs" ON public.ai_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own ai recs" ON public.ai_recommendations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own ai recs" ON public.ai_recommendations FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_ai_recs_user_status ON public.ai_recommendations(user_id, status);

-- Alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('critical','warning','info')),
  zone TEXT NOT NULL,
  node TEXT,
  message TEXT NOT NULL,
  recommendation TEXT,
  waste_kwh_per_day NUMERIC DEFAULT 0,
  waste_uzs_per_day NUMERIC DEFAULT 0,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.alerts TO authenticated;
GRANT ALL ON public.alerts TO service_role;

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own alerts" ON public.alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own alerts" ON public.alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own alerts" ON public.alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own alerts" ON public.alerts FOR DELETE USING (auth.uid() = user_id);

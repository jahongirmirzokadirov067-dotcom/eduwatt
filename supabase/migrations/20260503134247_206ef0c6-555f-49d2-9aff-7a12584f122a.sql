-- Add unique constraint on user_id in school_profiles if not present
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'school_profiles_user_id_key') THEN
    ALTER TABLE public.school_profiles ADD CONSTRAINT school_profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Make user_id non-null going forward
ALTER TABLE public.school_profiles ALTER COLUMN user_id SET NOT NULL;

-- Enable RLS on school_profiles
ALTER TABLE public.school_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own school profile"
  ON public.school_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own school profile"
  ON public.school_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own school profile"
  ON public.school_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own school profile"
  ON public.school_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Create monthly_records table
CREATE TABLE public.monthly_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month date NOT NULL,
  solar_generated_kwh numeric DEFAULT 0,
  grid_consumed_kwh numeric DEFAULT 0,
  bill_uzs numeric DEFAULT 0,
  school_days integer DEFAULT 21,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_monthly_records_user ON public.monthly_records(user_id, created_at DESC);

ALTER TABLE public.monthly_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own monthly records"
  ON public.monthly_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own monthly records"
  ON public.monthly_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monthly records"
  ON public.monthly_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own monthly records"
  ON public.monthly_records FOR DELETE
  USING (auth.uid() = user_id);
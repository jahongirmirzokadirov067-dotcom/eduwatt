import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface SchoolProfile {
  id: string;
  school_name: string | null;
  tariff_uzs_per_kwh: number | null;
  city: string | null;
  solar_capacity_kw: number | null;
}

export interface MonthlyRecordRow {
  id: string;
  month: string;
  solar_generated_kwh: number | null;
  grid_consumed_kwh: number | null;
  bill_uzs: number | null;
  school_days: number | null;
}

const REFRESH_EVENT = "eduwatt:records-updated";

export function notifyRecordsUpdated() {
  window.dispatchEvent(new Event(REFRESH_EVENT));
}

export function useSchoolData() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [latest, setLatest] = useState<MonthlyRecordRow | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLatest(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [{ data: prof }, { data: rec }] = await Promise.all([
      supabase.from("school_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("monthly_records")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    setProfile((prof as SchoolProfile) ?? null);
    setLatest((rec as MonthlyRecordRow) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener(REFRESH_EVENT, handler);
    return () => window.removeEventListener(REFRESH_EVENT, handler);
  }, [refetch]);

  const tariff = profile?.tariff_uzs_per_kwh ?? 280;
  const solar = latest?.solar_generated_kwh ?? null;
  const grid = latest?.grid_consumed_kwh ?? null;

  const kpis = latest
    ? {
        solarGeneratedKwh: solar ?? 0,
        gridConsumedKwh: grid ?? 0,
        estimatedDailySavingUzs: (solar ?? 0) * Number(tariff),
        co2AvoidedKg: (solar ?? 0) * 0.5,
      }
    : null;

  return { profile, latest, kpis, loading, refetch };
}

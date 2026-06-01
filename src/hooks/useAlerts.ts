import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface AlertRow {
  id: string;
  user_id: string;
  severity: "critical" | "warning" | "info";
  zone: string;
  node: string | null;
  message: string;
  recommendation: string | null;
  waste_kwh_per_day: number | null;
  waste_uzs_per_day: number | null;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

export function useAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user) {
      setAlerts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("alerts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setAlerts((data as AlertRow[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const resolve = async (id: string) => {
    await supabase.from("alerts").update({ resolved: true, resolved_at: new Date().toISOString() }).eq("id", id);
    setAlerts((arr) => arr.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
  };

  return { alerts, loading, refetch, resolve };
}

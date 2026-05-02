import { supabase } from "@/integrations/supabase/client";

export interface Recommendation {
  id: string;
  priority: "high" | "medium" | "low";
  category: "scheduling" | "hardware" | "storage" | "behavioral" | "maintenance";
  title: string;
  detail: string;
  projectedSavingKwhPerDay: number;
  projectedCo2KgPerMonth: number;
  effort: "Low" | "Medium" | "High";
}

export interface DashboardSnapshot {
  solarGeneratedKwh: number;
  gridConsumedKwh: number;
  co2AvoidedKg: number;
  activeAlerts: any[];
  zoneConsumption: any[];
  hourlySolar: any[];
  schoolName: string;
  date: string;
}

export async function fetchAIRecommendations(snapshot: DashboardSnapshot): Promise<Recommendation[]> {
  const { data, error } = await supabase.functions.invoke("ai-recommendations", { body: snapshot });
  if (error) throw error;
  if (!data?.recommendations) throw new Error("No recommendations returned");
  return data.recommendations as Recommendation[];
}

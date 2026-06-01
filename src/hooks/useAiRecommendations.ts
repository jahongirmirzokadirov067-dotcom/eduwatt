import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { fetchAIRecommendations, type Recommendation } from "@/services/aiRecommendations";

export type RecStatus = "active" | "implemented" | "dismissed";

export interface AiRecRow {
  id: string;
  user_id: string;
  created_at: string;
  rec_key: string | null;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: string | null;
  effort: string | null;
  projected_saving_kwh_per_day: number | null;
  projected_co2_kg_per_month: number | null;
  status: RecStatus;
  month: string | null;
  implemented_at: string | null;
  impact_notes: string | null;
}

const currentMonth = () => new Date().toISOString().slice(0, 7);

export function useAiRecommendations() {
  const { user } = useAuth();
  const [items, setItems] = useState<AiRecRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("ai_recommendations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setItems((data as AiRecRow[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const setStatus = async (id: string, status: RecStatus) => {
    const patch: Partial<AiRecRow> = { status };
    if (status === "implemented") patch.implemented_at = new Date().toISOString();
    await supabase.from("ai_recommendations").update(patch).eq("id", id);
    setItems((arr) => arr.map((r) => (r.id === id ? { ...r, ...patch } as AiRecRow : r)));
  };

  const refresh = async (snapshotFactory: () => Parameters<typeof fetchAIRecommendations>[0]) => {
    if (!user) return;
    setRefreshing(true);
    setError(null);
    try {
      const month = currentMonth();
      const { data: existing } = await supabase
        .from("ai_recommendations")
        .select("rec_key")
        .eq("user_id", user.id)
        .eq("month", month);
      const existingKeys = new Set((existing ?? []).map((r: any) => r.rec_key));

      const recs = await fetchAIRecommendations(snapshotFactory());
      const toInsert = recs
        .filter((r) => !existingKeys.has(r.id))
        .map((r) => ({
          user_id: user.id,
          rec_key: r.id,
          title: r.title,
          description: r.detail,
          priority: r.priority,
          category: r.category,
          effort: r.effort,
          projected_saving_kwh_per_day: r.projectedSavingKwhPerDay,
          projected_co2_kg_per_month: r.projectedCo2KgPerMonth,
          status: "active" as const,
          month,
        }));
      if (toInsert.length) {
        await supabase.from("ai_recommendations").insert(toInsert);
      }
      await refetch();
    } catch (e: any) {
      setError(e?.message ?? "Failed to refresh recommendations");
    } finally {
      setRefreshing(false);
    }
  };

  const active = items.filter((r) => r.status === "active");
  const implemented = items.filter((r) => r.status === "implemented");
  const dismissed = items.filter((r) => r.status === "dismissed");

  const implementedThisQuarter = (() => {
    const now = new Date();
    const q = Math.floor(now.getMonth() / 3);
    const qStart = new Date(now.getFullYear(), q * 3, 1);
    return implemented.filter((r) => r.implemented_at && new Date(r.implemented_at) >= qStart).length;
  })();

  return { items, active, implemented, dismissed, loading, refreshing, error, refetch, refresh, setStatus, implementedThisQuarter };
}

export const recommendationToSnapshotItem = (r: Recommendation) => r;

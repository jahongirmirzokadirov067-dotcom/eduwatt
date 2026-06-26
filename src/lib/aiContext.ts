import { SchoolProfile, MonthlyRecordRow } from "@/hooks/useSchoolData";
import { SolarPoint } from "@/hooks/useSolarData";
import { AlertRow } from "@/hooks/useAlerts";
import { AiRecRow } from "@/hooks/useAiRecommendations";

export interface DashboardContext {
  schoolName: string;
  city: string;
  tariff_uzs_per_kwh: number;
  solar_capacity_kw: number;
  today: {
    solar_generated_kwh: number;
    peak_hour: string | null;
    peak_kwh: number;
  };
  latestMonth: MonthlyRecordRow | null;
  last7Months: MonthlyRecordRow[];
  unresolvedAlerts: { severity: string; zone: string; message: string; waste_kwh_per_day: number | null }[];
  activeRecommendations: { title: string; priority: string; description: string }[];
  totals: {
    solar_kwh: number;
    grid_kwh: number;
    co2_kg: number;
    bill_uzs: number;
  };
  generatedAt: string;
}

export function buildDashboardContext(args: {
  profile: SchoolProfile | null;
  records: MonthlyRecordRow[];
  latest: MonthlyRecordRow | null;
  solar: SolarPoint[];
  alerts: AlertRow[];
  recs: AiRecRow[];
}): DashboardContext {
  const { profile, records, latest, solar, alerts, recs } = args;
  const todaySolar = solar.reduce((s, p) => s + p.kwh, 0);
  const peak = solar.reduce<SolarPoint | null>((p, c) => (!p || c.kwh > p.kwh ? c : p), null);
  const totals = records.reduce(
    (acc, r) => ({
      solar_kwh: acc.solar_kwh + Number(r.solar_generated_kwh ?? 0),
      grid_kwh: acc.grid_kwh + Number(r.grid_consumed_kwh ?? 0),
      co2_kg: acc.co2_kg + Number(r.solar_generated_kwh ?? 0) * 0.28,
      bill_uzs: acc.bill_uzs + Number(r.bill_uzs ?? 0),
    }),
    { solar_kwh: 0, grid_kwh: 0, co2_kg: 0, bill_uzs: 0 },
  );
  return {
    schoolName: profile?.school_name ?? "Demo School",
    city: profile?.city ?? "Tashkent",
    tariff_uzs_per_kwh: Number(profile?.tariff_uzs_per_kwh ?? 450),
    solar_capacity_kw: Number(profile?.solar_capacity_kw ?? 10),
    today: {
      solar_generated_kwh: +todaySolar.toFixed(2),
      peak_hour: peak ? `${peak.hour}:00` : null,
      peak_kwh: peak ? peak.kwh : 0,
    },
    latestMonth: latest,
    last7Months: records.slice(-7),
    unresolvedAlerts: alerts
      .filter((a) => !a.resolved)
      .slice(0, 6)
      .map((a) => ({ severity: a.severity, zone: a.zone, message: a.message, waste_kwh_per_day: a.waste_kwh_per_day })),
    activeRecommendations: recs
      .filter((r) => r.status === "active")
      .slice(0, 5)
      .map((r) => ({ title: r.title, priority: r.priority, description: r.description })),
    totals,
    generatedAt: new Date().toISOString(),
  };
}

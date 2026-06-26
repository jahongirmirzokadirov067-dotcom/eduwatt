import { useEffect, useState } from "react";
import { useSolarData } from "@/hooks/useSolarData";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const cardStyle: React.CSSProperties = {
  background: "var(--bg-surface)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: 20,
};

const headingStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "var(--text-secondary)",
  marginBottom: 4,
};

const subStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 400,
  color: "var(--text-faint)",
  marginBottom: 22,
};

function SolarChart() {
  const { data, loading, error, isLive } = useSolarData();
  const { t } = useLanguage();
  const max = Math.max(...data.map((d) => d.kwh), 0.001);

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div>
          <div style={headingStyle}>{t("chart.hourlySolar")}</div>
          <div style={subStyle}>{t("chart.hourlySolarSub")}</div>
        </div>
        <span
          style={{
            fontSize: 10, fontWeight: 600, letterSpacing: "0.3px",
            padding: "3px 8px", borderRadius: 999, border: "1px solid var(--border)",
            color: isLive ? "var(--accent)" : "var(--text-meta)",
            background: "var(--bg-elevated)", whiteSpace: "nowrap",
          }}
        >
          {isLive ? t("chart.live") : t("chart.estimated")}
        </span>
      </div>

      {error && !data.length && (
        <div style={{ fontSize: 11, color: "var(--text-meta)", padding: "30px 0", textAlign: "center" }}>
          {t("chart.solarUnavailable")}
        </div>
      )}

      {loading && !data.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, height: 200, justifyContent: "center" }}>
          <div className="eduwatt-skeleton" style={{ height: 14, width: "40%" }} />
          <div className="eduwatt-skeleton" style={{ height: 14, width: "70%" }} />
          <div className="eduwatt-skeleton" style={{ height: 14, width: "55%" }} />
        </div>
      ) : data.length ? (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${data.length}, 1fr)`, gap: 8, alignItems: "end", height: 200 }}>
          {data.map((d) => {
            const t = d.kwh / max;
            return (
              <div key={d.hour} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{d.kwh.toFixed(1)}</div>
                <div style={{ width: "100%", height: `${Math.max(t * 100, 2)}%`, background: "var(--accent)", borderRadius: 2, minHeight: 4 }} />
                <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{d.hour}</div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

interface Zone { id: string; name: string; zone_type: string; current_kw: number }

function ZonesChart() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = () => {
      supabase.from("zones").select("*").eq("user_id", user.id).order("created_at")
        .then(({ data }) => setZones((data as Zone[]) ?? []));
    };
    load();
    const handler = () => load();
    window.addEventListener("eduwatt:zones-updated", handler);
    return () => window.removeEventListener("eduwatt:zones-updated", handler);
  }, [user]);

  const values = zones.map((z) => Number(z.current_kw) || 0);
  const max = Math.max(...values, 0.001);
  const avg = values.reduce((a, b) => a + b, 0) / (values.length || 1);

  return (
    <div style={cardStyle}>
      <div style={headingStyle}>{t("chart.zone")}</div>
      <div style={subStyle}>{t("chart.zoneSub")}</div>
      {zones.length === 0 ? (
        <div style={{ fontSize: 12, color: "var(--text-meta)", padding: "20px 0" }}>
          No zones yet — add zones in the Zones page.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {zones.map((z) => {
            const val = Number(z.current_kw) || 0;
            const above = val > avg;
            return (
              <div key={z.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{z.name}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {above && (
                      <span style={{ fontSize: 10, fontWeight: 600, color: "var(--warn-color)", letterSpacing: "0.2px" }}>
                        above avg
                      </span>
                    )}
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
                      {val.toFixed(1)} kW
                    </span>
                  </span>
                </div>
                <div style={{ height: 8, background: "var(--bg-elevated)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${(val / max) * 100}%`, height: "100%", background: above ? "var(--warn-color)" : "var(--accent)", borderRadius: 2 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ChartsRow() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
      <SolarChart />
      <ZonesChart />
    </div>
  );
}

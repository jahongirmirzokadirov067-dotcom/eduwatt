import { useSolarData } from "@/hooks/useSolarData";
import { mockData } from "@/data/mockData.js";
import { useLanguage } from "@/context/LanguageContext";

function lerpColorCSS(t: number, base: string, peak: string) {
  // Use CSS color-mix for theme-aware interpolation
  const pct = Math.round(t * 100);
  return `color-mix(in srgb, ${peak} ${pct}%, ${base})`;
}

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
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.3px",
            padding: "3px 8px",
            borderRadius: 999,
            border: "1px solid var(--border)",
            color: isLive ? "var(--accent)" : "var(--text-meta)",
            background: "var(--bg-elevated)",
            whiteSpace: "nowrap",
          }}
        >
          {isLive ? t("chart.live") : t("chart.estimated")}
        </span>
      </div>

      {error && (
        <div
          style={{
            fontSize: 11,
            color: "var(--crit-color)",
            border: "1px solid var(--crit-color)",
            borderRadius: 8,
            padding: "6px 10px",
            marginBottom: 12,
            background: "color-mix(in srgb, var(--crit-color) 8%, transparent)",
          }}
        >
          {t("chart.solarUnavailable")}
        </div>
      )}

      {loading && data === mockData.hourlySolar ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, height: 200, justifyContent: "center" }}>
          <div className="eduwatt-skeleton" style={{ height: 14, width: "40%" }} />
          <div className="eduwatt-skeleton" style={{ height: 14, width: "70%" }} />
          <div className="eduwatt-skeleton" style={{ height: 14, width: "55%" }} />
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${data.length}, 1fr)`,
            gap: 8,
            alignItems: "end",
            height: 200,
          }}
        >
          {data.map((d) => {
            const t = d.kwh / max;
            return (
              <div key={d.hour} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{d.kwh.toFixed(1)}</div>
                <div
                  style={{
                    width: "100%",
                    height: `${Math.max(t * 100, 2)}%`,
                    background: lerpColorCSS(t, "var(--accent-soft-bg)", "var(--accent)"),
                    borderRadius: 2,
                    minHeight: 4,
                  }}
                />
                <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{d.hour}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ZonesChart() {
  const zones = mockData.zones;
  const { t } = useLanguage();
  const zoneKey: Record<string, string> = {
    "Classrooms": "zone.classrooms",
    "Science lab": "zone.scienceLab",
    "Canteen": "zone.canteen",
    "Hallways": "zone.hallways",
    "Admin": "zone.admin",
  };
  const max = Math.max(...zones.map((z) => z.kw));
  const colorFor = (type: string) =>
    type === "thermal" ? "var(--warn-color)" : type === "waste" ? "var(--crit-color)" : "var(--grid-color)";

  return (
    <div style={cardStyle}>
      <div style={headingStyle}>{t("chart.zone")}</div>
      <div style={subStyle}>{t("chart.zoneSub")}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {zones.map((z) => (
          <div key={z.name}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{t(zoneKey[z.name] || z.name)}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>{z.kw} kW</span>
            </div>
            <div style={{ height: 8, background: "var(--bg-elevated)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: `${(z.kw / max) * 100}%`, height: "100%", background: colorFor(z.type), borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
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

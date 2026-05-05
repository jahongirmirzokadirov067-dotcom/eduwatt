import Shell from "@/components/eduwatt/Shell";
import { mockData } from "@/data/mockData.js";
import { useSolarData } from "@/hooks/useSolarData";
import { useLanguage } from "@/context/LanguageContext";
import { useSchoolData } from "@/hooks/useSchoolData";

const cardStyle: React.CSSProperties = {
  background: "var(--bg-surface)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: 20,
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-label)",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  marginBottom: 14,
};

function Kpi({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div style={cardStyle}>
      <div style={labelStyle}>{label}</div>
      <div>
        <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-1px", color: "var(--text-primary)" }}>{value}</span>
        {unit && <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 6 }}>{unit}</span>}
      </div>
    </div>
  );
}

export default function GridPage() {
  const { data: solar } = useSolarData();
  const { records } = useSchoolData();
  const { t } = useLanguage();
  const grid = mockData.kpis.gridConsumed.value;
  const solarTotal = solar.reduce((s, d) => s + d.kwh, 0);
  const cost = Math.round(grid * mockData.gridTariffUzsPerKwh);
  const offset = ((solarTotal / (solarTotal + grid)) * 100).toFixed(1);
  const co2Grid = (grid * 0.28).toFixed(1);

  const hourly = solar.map((d) => ({
    hour: d.hour,
    solar: d.kwh,
    grid: Math.max(2, 12 - d.kwh * 0.4 + Math.random() * 1.5),
  }));
  const max = Math.max(...hourly.map((h) => Math.max(h.solar, h.grid)));

  return (
    <Shell title={t("topbar.title.grid") as string}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <Kpi label={t("grid.kpi.consumed") as string} value={grid} unit="kWh" />
        <Kpi label={t("grid.kpi.cost") as string} value={cost.toLocaleString()} unit="UZS" />
        <Kpi label={t("grid.kpi.offset") as string} value={offset} unit="%" />
        <Kpi label={t("grid.kpi.co2") as string} value={co2Grid} unit="kg" />
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>{t("grid.chart.title")}</div>
        <div style={{ fontSize: 10, color: "var(--text-faint)", marginBottom: 18 }}>{t("grid.chart.sub")}</div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${hourly.length}, 1fr)`, gap: 10, alignItems: "end", height: 220 }}>
          {hourly.map((h) => (
            <div key={h.hour} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
              <div style={{ display: "flex", gap: 3, alignItems: "end", height: "100%", width: "100%", justifyContent: "center" }}>
                <div style={{ width: "45%", height: `${(h.solar / max) * 100}%`, background: "var(--accent)", borderRadius: 2, minHeight: 3 }} />
                <div style={{ width: "45%", height: `${(h.grid / max) * 100}%`, background: "var(--grid-color)", borderRadius: 2, minHeight: 3 }} />
              </div>
              <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{h.hour}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 14, fontSize: 11, color: "var(--text-meta)" }}>
          <span><span style={{ display: "inline-block", width: 10, height: 10, background: "var(--accent)", marginRight: 6, borderRadius: 2 }} />{t("grid.legend.solar")}</span>
          <span><span style={{ display: "inline-block", width: 10, height: 10, background: "var(--grid-color)", marginRight: 6, borderRadius: 2 }} />{t("grid.legend.grid")}</span>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 14 }}>{t("grid.trend.title")}</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ color: "var(--text-meta)", textAlign: "left" }}>
              <th style={{ padding: "8px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>{t("grid.col.day")}</th>
              <th style={{ padding: "8px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>{t("grid.col.solar")}</th>
              <th style={{ padding: "8px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>{t("grid.col.grid")}</th>
              <th style={{ padding: "8px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>{t("grid.col.co2")}</th>
            </tr>
          </thead>
          <tbody>
            {mockData.weeklyTrend.map((d: any) => (
              <tr key={d.day} style={{ color: "var(--text-secondary)", background: d.isToday ? "var(--bg-elevated)" : "transparent" }}>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--border-soft)", fontWeight: d.isToday ? 600 : 400 }}>{d.day}{d.isToday && ` · ${t("grid.today")}`}</td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--border-soft)" }}>{d.solar}</td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--border-soft)" }}>{d.grid}</td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--border-soft)" }}>{d.co2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}

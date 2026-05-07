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

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const byMonth: Record<number, { solar: number; grid: number }> = {};
  records.forEach((r) => {
    const d = new Date(r.month);
    const m = d.getMonth();
    byMonth[m] = byMonth[m] || { solar: 0, grid: 0 };
    byMonth[m].solar += Number(r.solar_generated_kwh ?? 0);
    byMonth[m].grid += Number(r.grid_consumed_kwh ?? 0);
  });
  const monthly = MONTHS.map((label, i) => ({
    label,
    solar: byMonth[i]?.solar ?? 0,
    grid: byMonth[i]?.grid ?? 0,
  }));
  const max = Math.max(...monthly.map((h) => Math.max(h.solar, h.grid)), 1);

  // Insights
  const withData = monthly.filter((m) => m.solar > 0 || m.grid > 0);
  const first = withData[0];
  const last = withData[withData.length - 1];
  const offsetOf = (m: { solar: number; grid: number }) => {
    const tot = m.solar + m.grid;
    return tot ? (m.solar / tot) * 100 : 0;
  };
  const offsetChange = first && last ? offsetOf(last) - offsetOf(first) : 0;
  const peakGridMonth = withData.reduce((a, b) => (b.grid > a.grid ? b : a), withData[0] || { label: "—", grid: 0, solar: 0 });
  const avgOffset = withData.length ? withData.reduce((s, m) => s + offsetOf(m), 0) / withData.length : 0;
  const insights = [
    `Solar offset ${offsetChange >= 0 ? "improved" : "declined"} by ${Math.abs(offsetChange).toFixed(1)}% since ${first?.label ?? "start"}.`,
    `Grid dependency peaked in ${peakGridMonth?.label ?? "—"} (${Math.round(peakGridMonth?.grid ?? 0)} kWh).`,
    `Average solar contribution: ${avgOffset.toFixed(1)}%.`,
  ];

  // SVG chart geometry
  const W = 720, H = 240, PAD_L = 40, PAD_R = 16, PAD_T = 16, PAD_B = 28;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const xAt = (i: number) => PAD_L + (innerW * i) / (MONTHS.length - 1);
  const yAt = (v: number) => PAD_T + innerH - (v / max) * innerH;
  const path = (key: "solar" | "grid") =>
    monthly.map((m, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)},${yAt(m[key]).toFixed(1)}`).join(" ");
  const SOLAR_COLOR = "#C8FF00";
  const GRID_COLOR = "#3B82F6";


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
        {monthly.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--text-meta)", padding: "40px 0", textAlign: "center" }}>
            No monthly records yet. Add data on the Data Input page.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${monthly.length}, 1fr)`, gap: 10, alignItems: "end", height: 220 }}>
            {monthly.map((h) => (
              <div key={h.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
                <div style={{ display: "flex", gap: 3, alignItems: "end", height: "100%", width: "100%", justifyContent: "center" }}>
                  <div style={{ width: "45%", height: `${(h.solar / max) * 100}%`, background: "var(--accent)", borderRadius: 2, minHeight: 3 }} title={`Solar ${h.solar} kWh`} />
                  <div style={{ width: "45%", height: `${(h.grid / max) * 100}%`, background: "var(--grid-color)", borderRadius: 2, minHeight: 3 }} title={`Grid ${h.grid} kWh`} />
                </div>
                <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{h.label}</div>
              </div>
            ))}
          </div>
        )}
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
            {(records.length
              ? records.slice(-7).map((r) => {
                  const s = Number(r.solar_generated_kwh ?? 0);
                  const g = Number(r.grid_consumed_kwh ?? 0);
                  return { day: String(r.month).slice(0, 7), solar: s, grid: g, co2: Number((s * 0.5).toFixed(1)), isToday: false };
                })
              : mockData.weeklyTrend
            ).map((d: any) => (
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

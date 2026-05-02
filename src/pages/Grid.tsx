import Shell from "@/components/eduwatt/Shell";
import { mockData } from "@/data/mockData.js";
import { useSolarData } from "@/hooks/useSolarData";

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
  const grid = mockData.kpis.gridConsumed.value;
  const solarTotal = solar.reduce((s, d) => s + d.kwh, 0);
  const cost = Math.round(grid * mockData.gridTariffUzsPerKwh);
  const offset = ((solarTotal / (solarTotal + grid)) * 100).toFixed(1);
  const co2Grid = (grid * 0.45).toFixed(1);

  // Build hourly grid as inverse-ish of solar
  const hourly = solar.map((d) => ({
    hour: d.hour,
    solar: d.kwh,
    grid: Math.max(2, 12 - d.kwh * 0.4 + Math.random() * 1.5),
  }));
  const max = Math.max(...hourly.map((h) => Math.max(h.solar, h.grid)));

  return (
    <Shell title="Grid Dependency">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <Kpi label="Grid Consumed Today" value={grid} unit="kWh" />
        <Kpi label="Grid Cost Today" value={cost.toLocaleString()} unit="UZS" />
        <Kpi label="Solar Offset" value={offset} unit="%" />
        <Kpi label="CO₂ from Grid" value={co2Grid} unit="kg" />
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>SOLAR vs GRID — HOURLY</div>
        <div style={{ fontSize: 10, color: "var(--text-faint)", marginBottom: 18 }}>kWh</div>
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
          <span><span style={{ display: "inline-block", width: 10, height: 10, background: "var(--accent)", marginRight: 6, borderRadius: 2 }} />Solar</span>
          <span><span style={{ display: "inline-block", width: 10, height: 10, background: "var(--grid-color)", marginRight: 6, borderRadius: 2 }} />Grid</span>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 14 }}>7-DAY TREND</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ color: "var(--text-meta)", textAlign: "left" }}>
              <th style={{ padding: "8px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>Day</th>
              <th style={{ padding: "8px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>Solar (kWh)</th>
              <th style={{ padding: "8px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>Grid (kWh)</th>
              <th style={{ padding: "8px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>CO₂ (kg)</th>
            </tr>
          </thead>
          <tbody>
            {mockData.weeklyTrend.map((d: any) => (
              <tr key={d.day} style={{ color: "var(--text-secondary)", background: d.isToday ? "var(--bg-elevated)" : "transparent" }}>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--border-soft)", fontWeight: d.isToday ? 600 : 400 }}>{d.day}{d.isToday && " · today"}</td>
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

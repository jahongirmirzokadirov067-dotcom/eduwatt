import Shell from "@/components/eduwatt/Shell";
import { useSolarData } from "@/hooks/useSolarData";
import { mockData } from "@/data/mockData.js";
import { useLanguage } from "@/context/LanguageContext";

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

const valueStyle: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 600,
  letterSpacing: "-1px",
  color: "var(--text-primary)",
  lineHeight: 1,
};

function Kpi({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div style={cardStyle}>
      <div style={labelStyle}>{label}</div>
      <div>
        <span style={valueStyle}>{value}</span>
        {unit && <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 6 }}>{unit}</span>}
      </div>
    </div>
  );
}

function AreaChart({ data }: { data: { hour: string; kwh: number }[] }) {
  const w = 800;
  const h = 220;
  const pad = 30;
  const max = Math.max(...data.map((d) => d.kwh), 0.001);
  const stepX = (w - pad * 2) / Math.max(data.length - 1, 1);
  const points = data.map((d, i) => {
    const x = pad + i * stepX;
    const y = h - pad - (d.kwh / max) * (h - pad * 2);
    return [x, y] as const;
  });
  const pathLine = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const pathArea = `${pathLine} L${points[points.length - 1][0]},${h - pad} L${points[0][0]},${h - pad} Z`;
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>HOURLY IRRADIANCE</div>
      <div style={{ fontSize: 10, color: "var(--text-faint)", marginBottom: 12 }}>kWh · today 07:00–17:00</div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
        <path d={pathArea} fill="var(--accent-soft-bg)" />
        <path d={pathLine} fill="none" stroke="var(--accent)" strokeWidth={2} />
        {points.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={3} fill="var(--accent)" />
            <text x={x} y={h - pad + 14} textAnchor="middle" fontSize="10" fill="var(--text-faint)">{data[i].hour}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function Solar() {
  const { data, isLive } = useSolarData();
  const { t } = useLanguage();
  const total = data.reduce((s, d) => s + d.kwh, 0);
  const peak = data.reduce((m, d) => (d.kwh > m.kwh ? d : m), data[0]);
  const installed = mockData.installedCapacityKw;
  const peakKw = Math.max(...data.map((d) => d.kwh));
  const utilization = ((peakKw / installed) * 100).toFixed(1);
  const monthly = (total * 30).toFixed(0);

  return (
    <Shell title={t("topbar.title.solar") as string}>
      <div style={{ fontSize: 11, color: "var(--text-meta)" }}>{isLive ? t("solar.live") : t("solar.estimated")}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <Kpi label={t("solar.kpi.totalGenerated") as string} value={total.toFixed(1)} unit="kWh" />
        <Kpi label={t("solar.kpi.peakHour") as string} value={`${peak.hour}:00`} unit={`${peak.kwh.toFixed(1)} kWh`} />
        <Kpi label={t("solar.kpi.utilization") as string} value={`${utilization}`} unit={t("solar.kpi.utilizationUnit", { kw: installed }) as string} />
        <Kpi label={t("solar.kpi.monthly") as string} value={monthly} unit="kWh" />
      </div>
      <AreaChart data={data} />
      <div style={cardStyle}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 14 }}>{t("solar.panelGroups")}</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ color: "var(--text-meta)", textAlign: "left" }}>
              <th style={{ padding: "8px 8px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>{t("solar.col.panelGroup")}</th>
              <th style={{ padding: "8px 8px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>{t("solar.col.orientation")}</th>
              <th style={{ padding: "8px 8px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>{t("solar.col.capacity")}</th>
              <th style={{ padding: "8px 8px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>{t("solar.col.todayOutput")}</th>
              <th style={{ padding: "8px 8px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>{t("solar.col.efficiency")}</th>
            </tr>
          </thead>

          <tbody>
            {mockData.panelGroups.map((p: any) => (
              <tr key={p.name} style={{ color: "var(--text-secondary)" }}>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--border-soft)" }}>{p.name}</td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--border-soft)" }}>{p.orientation}</td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--border-soft)" }}>{p.capacityKw} kW</td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--border-soft)" }}>{p.todayKwh} kWh</td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid var(--border-soft)", color: "var(--accent)" }}>{p.efficiency}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}

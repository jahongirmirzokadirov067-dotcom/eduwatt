import Shell from "@/components/eduwatt/Shell";
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
  marginBottom: 10,
};

const valueStyle: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 600,
  letterSpacing: "-1px",
  color: "var(--text-primary)",
  lineHeight: 1,
};

const subStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--text-muted)",
  marginTop: 8,
};

function Kpi({
  label,
  value,
  unit,
  subtitle,
}: {
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
}) {
  return (
    <div style={cardStyle}>
      <div style={labelStyle}>{label}</div>
      <div>
        <span style={valueStyle}>{value}</span>
        {unit && <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 6 }}>{unit}</span>}
      </div>
      {subtitle && <div style={subStyle}>{subtitle}</div>}
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

const groups = [
  { name: "Group A", capacity: 7.5, today: 16.4, status: "Normal" },
  { name: "Group B", capacity: 7.5, today: 15.9, status: "Normal" },
  { name: "Group C", capacity: 7.5, today: 16.9, status: "Normal" },
];

function PanelGroupsTable() {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 14 }}>PANEL GROUPS</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th style={{ textAlign: "left", padding: "8px 12px 8px 0", color: "var(--text-label)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>Group</th>
              <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--text-label)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>Capacity</th>
              <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--text-label)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>Today</th>
              <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--text-label)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.name} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "10px 12px 10px 0", color: "var(--text-primary)", fontWeight: 500 }}>{g.name}</td>
                <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>{g.capacity} kW</td>
                <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>{g.today} kWh</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: "var(--accent)", background: "var(--accent-soft-bg)", padding: "3px 10px", borderRadius: 999 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
                    {g.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Solar() {
  const { data, isLive } = useSolarData();
  const { profile } = useSchoolData();
  const { t } = useLanguage();
  const total = data.reduce((s, d) => s + d.kwh, 0);
  const peak = data.length ? data.reduce((m, d) => (d.kwh > m.kwh ? d : m), data[0]) : { hour: "—", kwh: 0 };
  const installed = Number(profile?.solar_capacity_kw ?? 0) || 22.5;
  const peakKw = data.length ? Math.max(...data.map((d) => d.kwh)) : 0;
  const utilization = installed ? ((peakKw / installed) * 100).toFixed(1) : "0";

  const currentPoint = data.length ? data[data.length - 1] : null;
  const currentOutput = currentPoint ? currentPoint.kwh.toFixed(1) : "—";
  const specificYield = installed && total > 0 ? (total / installed).toFixed(2) : "0.00";

  return (
    <Shell title={t("topbar.title.solar") as string}>
      <div style={{ fontSize: 11, color: "var(--text-meta)", marginBottom: 12 }}>{isLive ? t("solar.live") : t("solar.estimated")}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 12 }}>
        <Kpi label={t("solar.kpi.currentOutput") as string} value={currentOutput} unit="kW" subtitle={t("solar.kpi.currentOutputSub") as string} />
        <Kpi label={t("solar.kpi.totalGenerated") as string} value={total.toFixed(1)} unit="kWh" />
        <Kpi label={t("solar.kpi.peakHour") as string} value={`${peak.hour}:00`} unit={`${peak.kwh.toFixed(1)} kWh`} />
        <Kpi label={t("solar.kpi.utilization") as string} value={`${utilization}`} unit="%" subtitle={t("solar.kpi.utilizationSub") as string} />
        <Kpi label={t("solar.kpi.specificYield") as string} value={specificYield} unit="kWh/kWp" subtitle={t("solar.kpi.specificYieldSub") as string} />
      </div>
      {data.length > 0 ? (
        <AreaChart data={data} />
      ) : (
        <div style={cardStyle}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>HOURLY IRRADIANCE</div>
          <div style={{ fontSize: 12, color: "var(--text-meta)", padding: "30px 0", textAlign: "center" }}>
            Live solar data unavailable.
          </div>
        </div>
      )}
      <PanelGroupsTable />
    </Shell>
  );
}

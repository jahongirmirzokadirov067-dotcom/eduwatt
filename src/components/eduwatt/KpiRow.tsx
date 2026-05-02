import { mockData } from "@/data/mockData.js";

const cardStyle: React.CSSProperties = {
  background: "#141414",
  border: "1px solid #1e1e1e",
  borderRadius: 12,
  padding: "18px 18px 16px",
  position: "relative",
  overflow: "hidden",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#555",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  marginBottom: 14,
};

const valueStyle: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 600,
  letterSpacing: "-1px",
  color: "#f0ede6",
  lineHeight: 1,
};

const unitStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 400,
  color: "#888",
  marginLeft: 6,
};

const deltaStyle = (positive: boolean): React.CSSProperties => ({
  fontSize: 11,
  fontWeight: 400,
  color: positive ? "#C8FF00" : "#FF8C42",
  marginTop: 10,
});

function Card({
  accent,
  label,
  value,
  unit,
  delta,
  deltaPositive,
}: {
  accent: string;
  label: string;
  value: number;
  unit: string;
  delta: string;
  deltaPositive: boolean;
}) {
  return (
    <div style={cardStyle}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: accent,
        }}
      />
      <div style={labelStyle}>{label}</div>
      <div>
        <span style={valueStyle}>{value}</span>
        <span style={unitStyle}>{unit}</span>
      </div>
      <div style={deltaStyle(deltaPositive)}>{delta}</div>
    </div>
  );
}

export default function KpiRow() {
  const k = mockData.kpis;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
      }}
    >
      <Card accent="#C8FF00" label="Solar Generated" value={k.solarGenerated.value} unit={k.solarGenerated.unit} delta={k.solarGenerated.delta} deltaPositive={k.solarGenerated.deltaPositive} />
      <Card accent="#378ADD" label="Grid Consumed" value={k.gridConsumed.value} unit={k.gridConsumed.unit} delta={k.gridConsumed.delta} deltaPositive={k.gridConsumed.deltaPositive} />
      <Card accent="#4ade80" label="CO₂ Avoided" value={k.co2Avoided.value} unit={k.co2Avoided.unit} delta={k.co2Avoided.delta} deltaPositive={k.co2Avoided.deltaPositive} />
      <Card accent="#FF8C42" label="Waste Alerts" value={k.wasteAlerts.value} unit={k.wasteAlerts.unit} delta={k.wasteAlerts.delta} deltaPositive={k.wasteAlerts.deltaPositive} />
    </div>
  );
}

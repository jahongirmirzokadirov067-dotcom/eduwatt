import { mockData } from "@/data/mockData.js";
import { useLanguage } from "@/context/LanguageContext";
import { useSchoolData } from "@/hooks/useSchoolData";

const cardStyle: React.CSSProperties = {
  background: "var(--bg-surface)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "18px 18px 16px",
  position: "relative",
  overflow: "hidden",
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

const unitStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 400,
  color: "var(--text-muted)",
  marginLeft: 6,
};

const deltaStyle = (positive: boolean): React.CSSProperties => ({
  fontSize: 11,
  fontWeight: 400,
  color: positive ? "var(--accent)" : "var(--warn-color)",
  marginTop: 10,
});

function Card({
  accent, label, value, unit, delta, deltaPositive,
}: {
  accent: string; label: string; value: number; unit: string; delta: string; deltaPositive: boolean;
}) {
  return (
    <div style={cardStyle}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accent }} />
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
  const { t } = useLanguage();
  const { kpis } = useSchoolData();

  const solarVal = kpis ? Number(kpis.solarGeneratedKwh.toFixed(1)) : k.solarGenerated.value;
  const gridVal = kpis ? Number(kpis.gridConsumedKwh.toFixed(1)) : k.gridConsumed.value;
  const co2Val = kpis ? Number(kpis.co2AvoidedKg.toFixed(1)) : k.co2Avoided.value;
  const savingDelta = kpis
    ? `≈ ${Math.round(kpis.estimatedDailySavingUzs).toLocaleString()} UZS saved`
    : (t("kpi.delta.vsYesterdayPos", { p: "8.2" }) as string);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
      <Card accent="var(--accent)" label={t("kpi.solarGenerated") as string} value={solarVal} unit={k.solarGenerated.unit} delta={savingDelta} deltaPositive={true} />
      <Card accent="var(--grid-color)" label={t("kpi.gridConsumed") as string} value={gridVal} unit={k.gridConsumed.unit} delta={t("kpi.delta.vsYesterdayNeg", { p: "4.1" }) as string} deltaPositive={k.gridConsumed.deltaPositive} />
      <Card accent="var(--co2-color)" label={t("kpi.co2Avoided") as string} value={co2Val} unit={k.co2Avoided.unit} delta={t("kpi.delta.vsYesterdayPos", { p: "8.2" }) as string} deltaPositive={k.co2Avoided.deltaPositive} />
      <Card accent="var(--warn-color)" label={t("kpi.wasteAlerts") as string} value={k.wasteAlerts.value} unit={t("kpi.unit.active") as string} delta={t("kpi.delta.unresolved", { n: 2 }) as string} deltaPositive={k.wasteAlerts.deltaPositive} />
    </div>
  );
}

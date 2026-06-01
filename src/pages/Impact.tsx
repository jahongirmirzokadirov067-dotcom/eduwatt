import Shell from "@/components/eduwatt/Shell";
import { useLanguage } from "@/context/LanguageContext";
import { useAiRecommendations } from "@/hooks/useAiRecommendations";
import { useSchoolData } from "@/hooks/useSchoolData";

const bannerStyle: React.CSSProperties = {
  background: "#0d1a0d",
  border: "1px solid #1a2e1a",
  borderRadius: 12,
  padding: "24px 32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 24,
};

const cardStyle: React.CSSProperties = {
  background: "#141414",
  border: "1px solid #1e1e1e",
  borderRadius: 12,
  padding: "18px 20px",
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

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: "#c8c4bc",
  marginTop: 8,
  marginBottom: 4,
};

function KpiCard({ accent, label, value, sub }: { accent: string; label: string; value: string; sub: string }) {
  return (
    <div style={cardStyle}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accent }} />
      <div style={labelStyle}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, color: "#f0ede6", letterSpacing: "-0.5px", lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#888", marginTop: 8, lineHeight: 1.5 }}>{sub}</div>
    </div>
  );
}

function Milestone({ year, label, detail, dot }: { year: string; label: string; detail: string; dot: string }) {
  return (
    <div style={{ ...cardStyle, padding: 16, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot, display: "inline-block" }} />
        <span style={{ fontSize: 18, fontWeight: 600, color: "#f0ede6", letterSpacing: "-0.5px" }}>{year}</span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#c8c4bc", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>{label}</div>
      <div style={{ fontSize: 11, color: "#888", lineHeight: 1.55 }}>{detail}</div>
    </div>
  );
}

function FactCard({ stat, unit, body, source, sourceLabel }: { stat: string; unit: string; body: string; source: string; sourceLabel: string }) {
  return (
    <div style={{ ...cardStyle, padding: "16px 20px" }}>
      <div style={{ fontSize: 32, fontWeight: 600, color: "#C8FF00", letterSpacing: "-1px", lineHeight: 1 }}>{stat}</div>
      <div style={{ fontSize: 11, color: "#555", marginTop: 4, marginBottom: 10 }}>{unit}</div>
      <div style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>{body}</div>
      <div style={{ fontSize: 10, color: "#444", marginTop: 8 }}>{sourceLabel}: {source}</div>
    </div>
  );
}

export default function Impact() {
  const { t } = useLanguage();
  const sourceLabel = t("impact.source") as string;
  const { implementedThisQuarter, implemented, active } = useAiRecommendations();
  const { records } = useSchoolData();

  // Month-over-month trend on grid consumption (lower is better)
  const last = records[records.length - 1];
  const prev = records[records.length - 2];
  const gridDelta = last && prev
    ? ((Number(last.grid_consumed_kwh ?? 0) - Number(prev.grid_consumed_kwh ?? 0)) / Math.max(Number(prev.grid_consumed_kwh ?? 0), 1)) * 100
    : 0;
  const solarDelta = last && prev
    ? ((Number(last.solar_generated_kwh ?? 0) - Number(prev.solar_generated_kwh ?? 0)) / Math.max(Number(prev.solar_generated_kwh ?? 0), 1)) * 100
    : 0;

  return (
    <Shell title={t("topbar.title.impact") as string}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 600, color: "#f0ede6", letterSpacing: "-0.5px" }}>{t("impact.title")}</div>
        <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{t("impact.subtitle")}</div>
      </div>

      <div style={{ background: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: 12, padding: "20px 24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#4a8a4a", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Recommendations implemented this quarter</div>
          <div style={{ fontSize: 32, fontWeight: 600, color: "#C8FF00", letterSpacing: "-1px", lineHeight: 1 }}>{implementedThisQuarter}</div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 6 }}>{implemented.length} total implemented · {active.length} active</div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#4a8a4a", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Grid use MoM</div>
          <div style={{ fontSize: 32, fontWeight: 600, color: gridDelta <= 0 ? "#C8FF00" : "#FF8C42", letterSpacing: "-1px", lineHeight: 1 }}>
            {gridDelta >= 0 ? "+" : ""}{gridDelta.toFixed(1)}%
          </div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 6 }}>vs previous month</div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#4a8a4a", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Solar gen MoM</div>
          <div style={{ fontSize: 32, fontWeight: 600, color: solarDelta >= 0 ? "#C8FF00" : "#FF8C42", letterSpacing: "-1px", lineHeight: 1 }}>
            {solarDelta >= 0 ? "+" : ""}{solarDelta.toFixed(1)}%
          </div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 6 }}>vs previous month</div>
        </div>
      </div>


      <div style={bannerStyle}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 28, fontWeight: 600, color: "#f0ede6", letterSpacing: "-0.8px", lineHeight: 1.15 }}>
            {t("impact.banner.headline")}
          </div>
          <div style={{ fontSize: 14, color: "#4a8a4a", marginTop: 8 }}>{t("impact.banner.sub")}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 48, fontWeight: 600, color: "#C8FF00", letterSpacing: "-2px", lineHeight: 1 }}>68.8M kWh</div>
          <div style={{ fontSize: 12, color: "#3d6b3d", marginTop: 6 }}>{t("impact.banner.label")}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <KpiCard accent="#C8FF00" label={t("impact.kpi.co2") as string} value="34,427 tonnes" sub={t("impact.kpi.co2.sub") as string} />
        <KpiCard accent="#378ADD" label={t("impact.kpi.grid") as string} value="68.8M kWh" sub={t("impact.kpi.grid.sub") as string} />
        <KpiCard accent="#4ade80" label={t("impact.kpi.cost") as string} value="19.3B UZS" sub={t("impact.kpi.cost.sub") as string} />
        <KpiCard accent="#FF8C42" label={t("impact.kpi.waste") as string} value="~6,100" sub={t("impact.kpi.waste.sub") as string} />
      </div>

      <div style={sectionTitleStyle}>{t("impact.timeline")}</div>
      <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
        <Milestone year="2026" label={t("impact.m1.label") as string} detail={t("impact.m1.detail") as string} dot="#C8FF00" />
        <div style={{ flex: "0 0 24px", alignSelf: "center", borderTop: "1px solid #1e1e1e" }} />
        <Milestone year="2027" label={t("impact.m2.label") as string} detail={t("impact.m2.detail") as string} dot="#C8FF00" />
        <div style={{ flex: "0 0 24px", alignSelf: "center", borderTop: "1px solid #1e1e1e" }} />
        <Milestone year="2028" label={t("impact.m3.label") as string} detail={t("impact.m3.detail") as string} dot="#378ADD" />
        <div style={{ flex: "0 0 24px", alignSelf: "center", borderTop: "1px solid #1e1e1e" }} />
        <Milestone year="2030" label={t("impact.m4.label") as string} detail={t("impact.m4.detail") as string} dot="#888" />
      </div>

      <div style={sectionTitleStyle}>{t("impact.facts")}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <FactCard stat="320" unit={t("impact.f1.unit") as string} body={t("impact.f1.body") as string} source={t("impact.f1.source") as string} sourceLabel={sourceLabel} />
        <FactCard stat="$20M" unit={t("impact.f2.unit") as string} body={t("impact.f2.body") as string} source={t("impact.f2.source") as string} sourceLabel={sourceLabel} />
        <FactCard stat="50%" unit={t("impact.f3.unit") as string} body={t("impact.f3.body") as string} source={t("impact.f3.source") as string} sourceLabel={sourceLabel} />
      </div>

      <div style={{ background: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: 12, padding: "24px 32px", textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: "#f0ede6", lineHeight: 1.4 }}>{t("impact.cta.headline")}</div>
        <div style={{ fontSize: 13, color: "#4a8a4a", marginTop: 10 }}>{t("impact.cta.sub")}</div>
      </div>
    </Shell>
  );
}

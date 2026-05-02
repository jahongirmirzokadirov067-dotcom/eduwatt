import { useEffect, useState } from "react";
import { mockData } from "@/data/mockData.js";
import { fetchAIRecommendations, type Recommendation } from "@/services/aiRecommendations";
import { useLanguage } from "@/context/LanguageContext";

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
  marginBottom: 18,
};

function AlertsPanel() {
  const { t } = useLanguage();
  const colorFor = (s: string) =>
    s === "critical" ? "var(--crit-color)" : s === "warning" ? "var(--warn-color)" : "var(--co2-color)";
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 20,
      }}
    >
      <div style={headingStyle}>{t("alerts.activeTitle")}</div>
      <div style={subStyle}>{t("alerts.unresolvedCount", { n: 3 })}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {mockData.alerts.map((a, i) => {
          const idx = i + 1;
          const message = t(`alert.${idx}.message`) as string;
          const timestamp = t(`alert.${idx}.timestamp`) as string;
          const action = t(`alert.${idx}.action`) as string;
          return (
            <div key={i} style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: colorFor(a.severity), marginTop: 6, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.45 }}>{message}</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontSize: 10, color: "var(--text-faint)" }}>
                    {timestamp} · {t("alerts.estWaste")}: {a.wasteKwhPerDay} kWh
                  </span>
                  <a href="#" style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
                    {action} →
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function priorityColor(p: string) {
  if (p === "high") return "var(--crit-color)";
  if (p === "medium") return "var(--warn-color)";
  return "var(--text-meta)";
}

function RecCardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div className="eduwatt-skeleton" style={{ height: 16, width: "60%" }} />
      <div className="eduwatt-skeleton" style={{ height: 12, width: "92%" }} />
      <div className="eduwatt-skeleton" style={{ height: 12, width: "78%" }} />
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function RecommendationsPanel() {
  const { t, lang } = useLanguage();
  const [recs, setRecs] = useState<Recommendation[]>(mockData.recommendations as Recommendation[]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const snapshot = {
        schoolName: mockData.schoolName,
        date: new Date().toISOString().slice(0, 10),
        solarGeneratedKwh: mockData.kpis.solarGenerated.value,
        gridConsumedKwh: mockData.kpis.gridConsumed.value,
        co2AvoidedKg: mockData.kpis.co2Avoided.value,
        activeAlerts: mockData.alerts,
        zoneConsumption: mockData.zones,
        hourlySolar: mockData.hourlySolar,
      };
      const result = await fetchAIRecommendations(snapshot);
      setRecs(result);
      setUsedFallback(false);
    } catch (e: any) {
      setError(e?.message || "AI recommendations unavailable");
      setRecs(mockData.recommendations as Recommendation[]);
      setUsedFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const localizedTitle = (r: Recommendation, i: number) =>
    usedFallback ? (t(`rec.${i + 1}.title`) as string) : r.title;
  const localizedDetail = (r: Recommendation, i: number) =>
    usedFallback ? (t(`rec.${i + 1}.detail`) as string) : r.detail;

  return (
    <div
      style={{
        background: "var(--bg-rec)",
        border: "1px solid var(--border-rec)",
        borderRadius: 12,
        padding: 20,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={headingStyle}>{t("rec.title")}</div>
          <div style={subStyle}>{loading ? t("rec.statusGenerating") : error ? t("rec.statusCached") : t("rec.statusLive")}</div>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          aria-label="Refresh recommendations"
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            border: "1px solid var(--border)",
            background: "var(--bg-surface)",
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.5 : 1,
          }}
        >
          <RefreshIcon />
        </button>
      </div>

      {error && (
        <div style={{ fontSize: 11, color: "var(--text-meta)", marginBottom: 12 }}>
          {t("rec.unavailable")}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {loading
          ? [0, 1, 2].map((i) => <RecCardSkeleton key={i} />)
          : recs.map((r, i) => (
              <div key={r.id || i} style={{ display: "flex", gap: 12 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    background: "var(--rec-icon-bg)",
                    border: "1px solid var(--rec-icon-border)",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 11,
                    color: "var(--rec-icon-text)",
                    fontWeight: 600,
                  }}
                >
                  ◆
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        color: priorityColor(r.priority),
                        textTransform: "uppercase",
                        letterSpacing: "0.4px",
                      }}
                    >
                      {t(`rec.priority.${r.priority}`)}
                    </span>
                    <span style={{ fontSize: 9, color: "var(--text-meta)", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                      {r.category}
                    </span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 9,
                        fontWeight: 600,
                        padding: "1px 6px",
                        borderRadius: 4,
                        border: "1px solid var(--border)",
                        color: "var(--text-meta)",
                      }}
                    >
                      {r.effort}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600, lineHeight: 1.35 }} key={`${lang}-t-${i}`}>
                    {localizedTitle(r, i)}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--rec-text)", lineHeight: 1.45, marginTop: 2 }}>
                    {localizedDetail(r, i)}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--accent)", marginTop: 4 }}>
                    {t("rec.savesLine", { kwh: r.projectedSavingKwhPerDay, co2: r.projectedCo2KgPerMonth })}
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}

export default function BottomRow() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <AlertsPanel />
      <RecommendationsPanel />
    </div>
  );
}

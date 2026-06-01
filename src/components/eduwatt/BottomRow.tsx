import { useLanguage } from "@/context/LanguageContext";
import { useAlerts } from "@/hooks/useAlerts";
import { useAiRecommendations } from "@/hooks/useAiRecommendations";
import { useSchoolData } from "@/hooks/useSchoolData";

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
  const { alerts, resolve } = useAlerts();
  const unresolved = alerts.filter((a) => !a.resolved);

  const colorFor = (s: string) =>
    s === "critical" ? "var(--crit-color)" : s === "warning" ? "var(--warn-color)" : "var(--co2-color)";

  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
      <div style={headingStyle}>{t("alerts.activeTitle")}</div>
      <div style={subStyle}>{t("alerts.unresolvedCount", { n: unresolved.length })}</div>
      {unresolved.length === 0 ? (
        <div style={{ fontSize: 12, color: "var(--text-meta)", padding: "10px 0" }}>No active alerts.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {unresolved.slice(0, 5).map((a) => (
            <div key={a.id} style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: colorFor(a.severity), marginTop: 6, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.45 }}>{a.message}</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontSize: 10, color: "var(--text-faint)" }}>
                    {a.zone} · {t("alerts.estWaste")}: {Number(a.waste_kwh_per_day ?? 0)} kWh
                  </span>
                  <button
                    type="button"
                    onClick={() => resolve(a.id)}
                    style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Resolve →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function priorityColor(p: string) {
  if (p === "high") return "var(--crit-color)";
  if (p === "medium") return "var(--warn-color)";
  return "var(--text-meta)";
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
  const { t } = useLanguage();
  const { profile, latest } = useSchoolData();
  const { alerts } = useAlerts();
  const { active, implemented, dismissed, loading, refreshing, error, refresh, setStatus } = useAiRecommendations();

  const handleRefresh = () => {
    refresh(() => ({
      schoolName: profile?.school_name ?? "School",
      date: new Date().toISOString().slice(0, 10),
      solarGeneratedKwh: Number(latest?.solar_generated_kwh ?? 0),
      gridConsumedKwh: Number(latest?.grid_consumed_kwh ?? 0),
      co2AvoidedKg: Number(latest?.solar_generated_kwh ?? 0) * 0.28,
      activeAlerts: alerts.filter((a) => !a.resolved).map((a) => ({ severity: a.severity, zone: a.zone, message: a.message })),
      zoneConsumption: [],
      hourlySolar: [],
    }));
  };

  const statusText = refreshing
    ? t("rec.statusGenerating")
    : error
      ? t("rec.statusCached")
      : active.length
        ? t("rec.statusLive")
        : "Click refresh to generate recommendations";

  return (
    <div style={{ background: "var(--bg-rec)", border: "1px solid var(--border-rec)", borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={headingStyle}>{t("rec.title")}</div>
          <div style={subStyle}>{statusText}</div>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          aria-label="Refresh recommendations"
          style={{
            width: 28, height: 28, borderRadius: 999,
            border: "1px solid var(--border)", background: "var(--bg-surface)",
            color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: refreshing ? "wait" : "pointer", opacity: refreshing ? 0.5 : 1,
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

      {loading && !active.length && !implemented.length ? (
        <div style={{ fontSize: 12, color: "var(--text-meta)" }}>Loading…</div>
      ) : active.length === 0 && implemented.length === 0 ? (
        <div style={{ fontSize: 12, color: "var(--text-meta)", padding: "10px 0" }}>No recommendations yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {active.map((r) => (
            <div key={r.id} style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 20, height: 20, background: "var(--rec-icon-bg)", border: "1px solid var(--rec-icon-border)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, color: "var(--rec-icon-text)", fontWeight: 600 }}>◆</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: priorityColor(r.priority), textTransform: "uppercase", letterSpacing: "0.4px" }}>
                    {t(`rec.priority.${r.priority}`)}
                  </span>
                  {r.category && <span style={{ fontSize: 9, color: "var(--text-meta)", textTransform: "uppercase", letterSpacing: "0.4px" }}>{r.category}</span>}
                  {r.effort && (
                    <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 4, border: "1px solid var(--border)", color: "var(--text-meta)" }}>
                      {r.effort}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600, lineHeight: 1.35 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: "var(--rec-text)", lineHeight: 1.45, marginTop: 2 }}>{r.description}</div>
                <div style={{ fontSize: 11, color: "var(--accent)", marginTop: 4 }}>
                  {t("rec.savesLine", { kwh: Number(r.projected_saving_kwh_per_day ?? 0), co2: Number(r.projected_co2_kg_per_month ?? 0) })}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => setStatus(r.id, "implemented")}
                    style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--accent)", background: "transparent", color: "var(--accent)", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Mark as Implemented
                  </button>
                  <button
                    onClick={() => setStatus(r.id, "dismissed")}
                    style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-meta)", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}

          {implemented.length > 0 && (
            <div style={{ marginTop: 8, paddingTop: 16, borderTop: "1px solid var(--border-soft)" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 10 }}>
                Implemented ({implemented.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {implemented.slice(0, 5).map((r) => (
                  <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        ✓ {r.title}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-faint)" }}>
                        {r.implemented_at ? new Date(r.implemented_at).toLocaleDateString() : ""}
                      </div>
                    </div>
                    <button
                      onClick={() => setStatus(r.id, "active")}
                      style={{ fontSize: 10, color: "var(--text-meta)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      Undo
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dismissed.length > 0 && (
            <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{dismissed.length} dismissed</div>
          )}
        </div>
      )}
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

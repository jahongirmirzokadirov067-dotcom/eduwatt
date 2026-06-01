import Shell from "@/components/eduwatt/Shell";
import { useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAlerts } from "@/hooks/useAlerts";

const cardStyle: React.CSSProperties = {
  background: "var(--bg-surface)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: 20,
};

type Filter = "all" | "active" | "resolved";

export default function Alerts() {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const { alerts, resolve, loading } = useAlerts();
  const { t } = useLanguage();

  const colorFor = (s: string) =>
    s === "critical" ? "var(--crit-color)" : s === "warning" ? "var(--warn-color)" : "var(--co2-color)";

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      if (filter === "active" && a.resolved) return false;
      if (filter === "resolved" && !a.resolved) return false;
      if (q) {
        const term = q.toLowerCase();
        if (!a.zone.toLowerCase().includes(term) && !a.message.toLowerCase().includes(term)) return false;
      }
      return true;
    });
  }, [filter, q, alerts]);

  const pill = (key: Filter, label: string) => (
    <button
      key={key}
      onClick={() => setFilter(key)}
      style={{
        fontSize: 11, fontWeight: 600, padding: "6px 14px", borderRadius: 999,
        border: "1px solid var(--border)",
        background: filter === key ? "var(--accent)" : "var(--bg-surface)",
        color: filter === key ? "var(--accent-text)" : "var(--text-secondary)",
        cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.3px",
      }}
    >
      {label}
    </button>
  );

  return (
    <Shell title={t("topbar.title.alerts") as string}>
      <div style={{ ...cardStyle, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {pill("all", t("alertsPage.filter.all") as string)}
          {pill("active", t("alertsPage.filter.active") as string)}
          {pill("resolved", t("alertsPage.filter.resolved") as string)}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("alertsPage.searchPlaceholder") as string}
          style={{
            flex: 1, minWidth: 200, background: "var(--bg-elevated)",
            border: "1px solid var(--border)", color: "var(--text-primary)",
            borderRadius: 8, padding: "8px 12px", fontSize: 12, fontFamily: "inherit", outline: "none",
          }}
        />
      </div>

      {!loading && filtered.length === 0 && (
        <div style={{ ...cardStyle, color: "var(--text-meta)", fontSize: 12 }}>{t("alertsPage.empty")}</div>
      )}

      {filtered.map((a) => (
        <div key={a.id} style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: 9, fontWeight: 600, padding: "3px 8px", borderRadius: 4,
                background: colorFor(a.severity), color: "#0f0f0f",
                textTransform: "uppercase", letterSpacing: "0.4px",
              }}
            >
              {a.severity}
            </span>
            <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>{a.zone}</span>
            {a.node && <span style={{ fontSize: 10, color: "var(--text-meta)" }}>· {t("alertsPage.node")} {a.node}</span>}
            <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-faint)" }}>
              {new Date(a.created_at).toLocaleString()}
            </span>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.45 }}>{a.message}</div>
          {a.recommendation && (
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10, lineHeight: 1.45 }}>
              <span style={{ color: "var(--text-meta)" }}>{t("alertsPage.recommendation")}</span>{a.recommendation}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-soft)", paddingTop: 10 }}>
            <div style={{ fontSize: 11, color: "var(--text-meta)" }}>
              {t("alertsPage.estWasteLine", { kwh: Number(a.waste_kwh_per_day ?? 0), uzs: Number(a.waste_uzs_per_day ?? 0).toLocaleString() })}
            </div>
            <button
              onClick={() => !a.resolved && resolve(a.id)}
              disabled={a.resolved}
              style={{
                fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 8,
                border: "1px solid var(--border)", background: "var(--bg-elevated)",
                color: a.resolved ? "var(--text-meta)" : "var(--accent)",
                cursor: a.resolved ? "default" : "pointer", fontFamily: "inherit", opacity: a.resolved ? 0.7 : 1,
              }}
            >
              {a.resolved ? (t("alertsPage.filter.resolved") as string) : "Resolve →"}
            </button>
          </div>
        </div>
      ))}
    </Shell>
  );
}

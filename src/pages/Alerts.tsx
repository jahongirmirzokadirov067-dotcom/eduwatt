import Shell from "@/components/eduwatt/Shell";
import { mockData } from "@/data/mockData.js";
import { useMemo, useState } from "react";

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

  const colorFor = (s: string) =>
    s === "critical" ? "var(--crit-color)" : s === "warning" ? "var(--warn-color)" : "var(--co2-color)";

  const filtered = useMemo(() => {
    return mockData.alerts.filter((a: any) => {
      if (filter === "active" && a.resolved) return false;
      if (filter === "resolved" && !a.resolved) return false;
      if (q) {
        const t = q.toLowerCase();
        if (!a.zone.toLowerCase().includes(t) && !a.message.toLowerCase().includes(t)) return false;
      }
      return true;
    });
  }, [filter, q]);

  const pill = (key: Filter, label: string) => (
    <button
      key={key}
      onClick={() => setFilter(key)}
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "6px 14px",
        borderRadius: 999,
        border: "1px solid var(--border)",
        background: filter === key ? "var(--accent)" : "var(--bg-surface)",
        color: filter === key ? "var(--accent-text)" : "var(--text-secondary)",
        cursor: "pointer",
        fontFamily: "inherit",
        letterSpacing: "0.3px",
      }}
    >
      {label}
    </button>
  );

  return (
    <Shell title="Alerts Log">
      <div style={{ ...cardStyle, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {pill("all", "All")}
          {pill("active", "Active")}
          {pill("resolved", "Resolved")}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by zone or message…"
          style={{
            flex: 1,
            minWidth: 200,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12,
            fontFamily: "inherit",
            outline: "none",
          }}
        />
      </div>

      {filtered.length === 0 && (
        <div style={{ ...cardStyle, color: "var(--text-meta)", fontSize: 12 }}>No alerts match the current filter.</div>
      )}

      {filtered.map((a: any, i: number) => (
        <div key={i} style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span
              style={{
                fontSize: 9,
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: 4,
                background: colorFor(a.severity),
                color: "#0f0f0f",
                textTransform: "uppercase",
                letterSpacing: "0.4px",
              }}
            >
              {a.severity}
            </span>
            <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>{a.zone}</span>
            <span style={{ fontSize: 10, color: "var(--text-meta)" }}>· node {a.node}</span>
            <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-faint)" }}>{a.timestamp}</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.45 }}>{a.message}</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10, lineHeight: 1.45 }}>
            <span style={{ color: "var(--text-meta)" }}>Recommendation: </span>{a.recommendation}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-soft)", paddingTop: 10 }}>
            <div style={{ fontSize: 11, color: "var(--text-meta)" }}>
              Est. waste: {a.wasteKwhPerDay} kWh/day · {a.wasteUzsPerDay.toLocaleString()} UZS/day
            </div>
            <button
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg-elevated)",
                color: "var(--accent)",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {a.action} →
            </button>
          </div>
        </div>
      ))}
    </Shell>
  );
}

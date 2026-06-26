import { useNavigate } from "react-router-dom";
import { useAlerts } from "@/hooks/useAlerts";

export default function AlertsCard() {
  const { alerts } = useAlerts();
  const navigate = useNavigate();
  const unresolved = alerts.filter((a) => !a.resolved);
  const visible = unresolved.slice(0, 3);

  const colorFor = (s: string) =>
    s === "critical" ? "var(--crit-color)" : s === "warning" ? "var(--warn-color)" : "var(--co2-color)";

  return (
    <div style={{
      background: "var(--bg-surface)", border: "1px solid var(--border)",
      borderRadius: 14, padding: 18, display: "flex", flexDirection: "column",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.3px" }}>
          ACTIVE ALERTS
        </div>
        <div style={{ fontSize: 11, color: "var(--text-meta)" }}>
          {unresolved.length} unresolved
        </div>
      </div>
      <div style={{ maxHeight: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, marginTop: 10 }}>
        {visible.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--text-meta)", padding: "6px 0" }}>No active alerts.</div>
        ) : (
          visible.map((a) => (
            <div key={a.id} style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: colorFor(a.severity), marginTop: 7, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.4, fontWeight: 500 }}>
                  {a.message}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 4 }}>
                  {a.zone} · Estimated waste: <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{Number(a.waste_kwh_per_day ?? 0)} kWh</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {unresolved.length > 0 && (
        <button
          type="button"
          onClick={() => navigate("/alerts")}
          style={{
            marginTop: 14, padding: "8px 0", borderTop: "1px solid var(--border-soft)",
            fontSize: 12, fontWeight: 600, color: "var(--accent)",
            background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
            textAlign: "left",
          }}
        >
          View all alerts ({unresolved.length}) →
        </button>
      )}
    </div>
  );
}

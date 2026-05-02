import { mockData } from "@/data/mockData.js";

const headingStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "#c8c4bc",
  marginBottom: 4,
};

const subStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 400,
  color: "#444",
  marginBottom: 18,
};

function AlertsPanel() {
  const colorFor = (s: string) =>
    s === "critical" ? "#E24B4A" : s === "warning" ? "#FF8C42" : "#4ade80";
  return (
    <div
      style={{
        background: "#141414",
        border: "1px solid #1e1e1e",
        borderRadius: 12,
        padding: 20,
      }}
    >
      <div style={headingStyle}>ACTIVE ALERTS</div>
      <div style={subStyle}>3 unresolved</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {mockData.alerts.map((a, i) => (
          <div key={i} style={{ display: "flex", gap: 12 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: colorFor(a.severity),
                marginTop: 6,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "#c8c4bc", lineHeight: 1.45 }}>{a.message}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 10, color: "#444" }}>
                  {a.timestamp} · {a.waste}
                </span>
                <a href="#" style={{ fontSize: 12, color: "#C8FF00", textDecoration: "none", fontWeight: 600 }}>
                  {a.action} →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecommendationsPanel() {
  return (
    <div
      style={{
        background: "#0d1a0d",
        border: "1px solid #1a2e1a",
        borderRadius: 12,
        padding: 20,
      }}
    >
      <div style={headingStyle}>AI RECOMMENDATIONS</div>
      <div style={subStyle}>generated 4 min ago</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {mockData.recommendations.map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 12 }}>
            <div
              style={{
                width: 20,
                height: 20,
                background: "#142014",
                border: "1px solid #1e3a1e",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 11,
                color: "#4a8a4a",
                fontWeight: 600,
              }}
            >
              ◆
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#9cb89c", lineHeight: 1.45 }}>{r.text}</div>
              <div style={{ fontSize: 10, color: "#4a8a4a", marginTop: 4 }}>{r.saving}</div>
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

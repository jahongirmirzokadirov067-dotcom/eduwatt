import { useAiRecommendations } from "@/hooks/useAiRecommendations";

interface Props {
  onAsk: (prompt: string) => void;
  onShowAll: () => void;
}

const priorityRank = { high: 0, medium: 1, low: 2 } as const;

export default function TopRecommendationsCard({ onAsk, onShowAll }: Props) {
  const { active, setStatus } = useAiRecommendations();
  const top = [...active]
    .sort((a, b) => (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9))
    .slice(0, 3);

  const badgeColor = (p: string) =>
    p === "high" ? "var(--crit-color)" : p === "medium" ? "var(--warn-color)" : "var(--text-meta)";

  return (
    <div style={{
      background: "var(--bg-surface)", border: "1px solid var(--border)",
      borderRadius: 14, padding: 18,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.3px", marginBottom: 12 }}>
        TOP RECOMMENDATIONS
      </div>
      {top.length === 0 ? (
        <div style={{ fontSize: 12, color: "var(--text-meta)", padding: "6px 0" }}>
          No recommendations yet. Ask the AI to generate some.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {top.map((r) => (
            <div key={r.id} style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{
                  fontSize: 9, fontWeight: 700, color: badgeColor(r.priority),
                  textTransform: "uppercase", letterSpacing: "0.6px",
                }}>
                  {r.priority}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.35 }}>
                {r.title}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-meta)", marginTop: 4 }}>
                {Number(r.projected_saving_kwh_per_day ?? 0)} kWh/day ·{" "}
                {Number(r.projected_co2_kg_per_month ?? 0)} kg CO₂/month
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <button
                  onClick={() => setStatus(r.id, "implemented")}
                  style={{
                    fontSize: 10, fontWeight: 600, padding: "4px 8px", borderRadius: 6,
                    border: "1px solid var(--accent)", background: "var(--accent)",
                    color: "var(--accent-text)", cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  Implement
                </button>
                <button
                  onClick={() => onAsk(`Explain recommendation: "${r.title}" — why does this help and what's the implementation plan?`)}
                  style={{
                    fontSize: 10, fontWeight: 600, padding: "4px 8px", borderRadius: 6,
                    border: "1px solid var(--border)", background: "transparent",
                    color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  Ask AI
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={onShowAll}
        style={{
          marginTop: 14, padding: "8px 0", borderTop: "1px solid var(--border-soft)",
          fontSize: 12, fontWeight: 600, color: "var(--accent)",
          background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
          textAlign: "left", width: "100%",
        }}
      >
        View all recommendations →
      </button>
    </div>
  );
}

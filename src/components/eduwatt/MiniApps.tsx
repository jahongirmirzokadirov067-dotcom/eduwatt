import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

type AppKey = "calculator";


const TIERS = [
  { from: 0, to: 200, rate: 650, color: "#22c55e" },
  { from: 200, to: 500, rate: 900, color: "#84cc16" },
  { from: 500, to: 1000, rate: 1100, color: "#eab308" },
  { from: 1000, to: 5000, rate: 1500, color: "#f59e0b" },
  { from: 5000, to: 10000, rate: 1750, color: "#ef4444" },
  { from: 10000, to: 90000, rate: 2000, color: "#991b1b" },
];

function computeBill(kwh: number) {
  let remaining = Math.max(0, kwh);
  let total = 0;
  const breakdown: { tier: typeof TIERS[number]; units: number; cost: number }[] = [];
  for (const tier of TIERS) {
    const span = tier.to - tier.from;
    const units = Math.min(remaining, span);
    if (units <= 0) {
      breakdown.push({ tier, units: 0, cost: 0 });
      continue;
    }
    const cost = units * tier.rate;
    total += cost;
    breakdown.push({ tier, units, cost });
    remaining -= units;
    if (remaining <= 0) break;
  }
  while (breakdown.length < TIERS.length) {
    breakdown.push({ tier: TIERS[breakdown.length], units: 0, cost: 0 });
  }
  return { total, breakdown };
}

function fmt(n: number) {
  return n.toLocaleString("en-US").replace(/,/g, " ");
}

function Calculator({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const [input, setInput] = useState("");
  const kwh = parseFloat(input) || 0;
  const { total, breakdown } = computeBill(kwh);
  const activeTier = breakdown.findIndex((b) => b.units > 0 && (b.units < (b.tier.to - b.tier.from) || kwh <= b.tier.to));
  const currentTier = activeTier >= 0 ? activeTier : (kwh > 0 ? breakdown.length - 1 : 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-app)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          width: "100%", maxWidth: 460,
          maxHeight: "90vh", overflow: "auto",
          padding: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
              {t("calc.title")}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-meta)", marginTop: 2 }}>
              {t("calc.subtitle")}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "transparent", border: "none", color: "var(--text-secondary)",
              cursor: "pointer", padding: 6, display: "flex",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, letterSpacing: "0.2px" }}>
          {t("calc.input.label")}
        </label>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <input
            type="number"
            min="0"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="0"
            autoFocus
            style={{
              width: "100%", background: "var(--bg-surface)",
              border: "1px solid var(--border)", borderRadius: 10,
              padding: "12px 60px 12px 14px", fontSize: 18, fontWeight: 600,
              color: "var(--text-primary)", outline: "none", fontFamily: "inherit",
            }}
          />
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "var(--text-meta)" }}>
            kWh
          </span>
        </div>

        <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
          {TIERS.map((tier, i) => {
            const reached = breakdown[i]?.units > 0;
            const isCurrent = i === currentTier && kwh > 0;
            const span = tier.to - tier.from;
            const fill = reached ? Math.min(1, breakdown[i].units / span) : 0;
            return (
              <div key={i} style={{ flex: i === 0 ? 3 : 1, height: 8, borderRadius: 4, background: "var(--bg-surface)", overflow: "hidden", border: isCurrent ? `1px solid ${tier.color}` : "none" }}>
                <div style={{ width: `${fill * 100}%`, height: "100%", background: tier.color, transition: "width 0.25s" }} />
              </div>
            );
          })}
        </div>

        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 8 }}>
          {TIERS.map((tier, i) => {
            const isCurrent = i === currentTier && kwh > 0;
            return (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 8px",
                  borderBottom: i < TIERS.length - 1 ? "1px solid var(--border-soft)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--text-primary)" }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: tier.color, display: "inline-block" }} />
                  <span style={{ fontWeight: 600 }}>
                    {fmt(tier.from)} – {fmt(tier.to)} kWh
                  </span>
                  <span style={{ color: "var(--text-meta)" }}>= {fmt(tier.rate)} UZS</span>
                </div>
                {isCurrent && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: "var(--accent)",
                    background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                    padding: "3px 8px", borderRadius: 6, letterSpacing: "0.3px",
                  }}>
                    {t("calc.yours")}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: 16, padding: 14,
          background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 18%, transparent), color-mix(in srgb, var(--accent) 5%, transparent))",
          border: "1px solid color-mix(in srgb, var(--accent) 35%, transparent)",
          borderRadius: 12,
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.3px" }}>
            {t("calc.total")}
          </span>
          <span style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>
            {fmt(Math.round(total))} <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>UZS</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MiniApps() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeApp, setActiveApp] = useState<AppKey | null>(null);
  const ref = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <>
      <div ref={ref} style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Mini apps"
          style={{
            background: "linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 70%, transparent))",
            border: "1px solid color-mix(in srgb, var(--accent) 60%, transparent)",
            borderRadius: 999,
            width: 56, height: 56,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--accent-text)", cursor: "pointer", padding: 0,
            boxShadow: "0 10px 30px rgba(0,0,0,0.35), 0 0 0 4px color-mix(in srgb, var(--accent) 12%, transparent)",
            transition: "transform 0.18s ease, box-shadow 0.18s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px) scale(1.05)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(0,0,0,0.45), 0 0 0 6px color-mix(in srgb, var(--accent) 20%, transparent)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.35), 0 0 0 4px color-mix(in srgb, var(--accent) 12%, transparent)"; }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="3" width="7" height="7" rx="1.8"/>
            <rect x="14" y="3" width="7" height="7" rx="1.8"/>
            <rect x="3" y="14" width="7" height="7" rx="1.8"/>
            <rect x="14" y="14" width="7" height="7" rx="1.8"/>
          </svg>
        </button>
        {open && (
          <div
            style={{
              position: "absolute", bottom: "calc(100% + 8px)", right: 0, zIndex: 100,
              background: "var(--bg-app)", border: "1px solid var(--border)",
              borderRadius: 14, padding: 12, minWidth: 240,
              boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-meta)", textTransform: "uppercase", letterSpacing: "0.8px", padding: "2px 4px 8px" }}>
              {t("apps.title")}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              <button
                type="button"
                onClick={() => { setActiveApp("calculator"); setOpen(false); }}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  padding: "12px 6px", borderRadius: 10,
                  background: "var(--bg-surface)", border: "1px solid var(--border)",
                  cursor: "pointer", color: "var(--text-primary)", fontFamily: "inherit",
                  transition: "transform 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 60%, transparent))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--accent-text)",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2"/>
                    <line x1="8" y1="6" x2="16" y2="6"/>
                    <line x1="8" y1="11" x2="8.01" y2="11"/>
                    <line x1="12" y1="11" x2="12.01" y2="11"/>
                    <line x1="16" y1="11" x2="16.01" y2="11"/>
                    <line x1="8" y1="15" x2="8.01" y2="15"/>
                    <line x1="12" y1="15" x2="12.01" y2="15"/>
                    <line x1="16" y1="15" x2="16.01" y2="15"/>
                    <line x1="8" y1="19" x2="16" y2="19"/>
                  </svg>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>
                  {t("apps.calculator")}
                </span>
              </button>
              <button
                type="button"
                onClick={() => { navigate("/ai-analysis"); setOpen(false); }}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  padding: "12px 6px", borderRadius: 10,
                  background: "var(--bg-surface)", border: "1px solid var(--border)",
                  cursor: "pointer", color: "var(--text-primary)", fontFamily: "inherit",
                  transition: "transform 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 60%, transparent))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--accent-text)", fontSize: 18, fontWeight: 800,
                }}>
                  ✦
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>
                  {t("nav.aiAnalysis")}
                </span>
              </button>
              <div
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  padding: "12px 6px", borderRadius: 10,
                  background: "var(--bg-surface)", border: "1px dashed var(--border)",
                  opacity: 0.5,
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "var(--bg-elevated)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--text-meta)",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-meta)" }}>
                  {t("apps.soon")}
                </span>
              </div>

            </div>
          </div>
        )}
      </div>
      {activeApp === "calculator" && <Calculator onClose={() => setActiveApp(null)} />}
    </>
  );
}

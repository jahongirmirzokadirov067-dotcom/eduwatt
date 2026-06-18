// LIGHT-MODE OVERVIEW REDESIGN (temporary test)
// Original Overview composition backed up at: src/pages/OverviewOriginal.tsx.bak
// To restore: copy OverviewOriginal.tsx.bak contents back into this file.

import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSchoolData } from "@/hooks/useSchoolData";
import { useAlerts } from "@/hooks/useAlerts";
import { useAiRecommendations } from "@/hooks/useAiRecommendations";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/eduwatt-logo.jpg";
import {
  Calendar as LCalendar, Sun as LSun, Home as LHome, Activity as LActivity,
} from "lucide-react";

/* ============================== TOKENS ============================== */
const C = {
  page: "#f4f6fa",
  card: "#ffffff",
  border: "#e6e9ef",
  borderSoft: "#eef0f5",
  text: "#0f172a",
  textMuted: "#64748b",
  textFaint: "#94a3b8",
  navy: "#0b1736",
  navyDeep: "#070f24",
  green: "#16a34a",
  greenSoft: "#e8f6ee",
  greenTint: "#ecfaf1",
  blue: "#2563eb",
  blueSoft: "#e6efff",
  purple: "#7c3aed",
  purpleSoft: "#f1ebff",
  orange: "#ea7a17",
  orangeSoft: "#fdf0e1",
};

/* ============================== SIDEBAR ============================== */
const NAV = [
  { to: "/", label: "Overview", icon: HomeIcon, end: true },
  { to: "/solar", label: "Solar panels", icon: SunIcon },
  { to: "/grid", label: "Grid", icon: GridTowerIcon },
  { to: "/zones", label: "Zones", icon: LayersIcon },
  { to: "/alerts", label: "Alerts", icon: BellIcon },
  { to: "/reports", label: "Reports", icon: DocIcon },
  { to: "/data-input", label: "Data input", icon: TableIcon },
  { to: "/impact", label: "National impact", icon: GlobeIcon },
  { to: "/settings", label: "Settings", icon: CogIcon },
];

function LightSidebar() {
  return (
    <aside
      style={{
        width: 232,
        flexShrink: 0,
        background: C.navy,
        color: "#dbe2f0",
        minHeight: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        padding: "20px 14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px 22px" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#0f1f44", display: "grid", placeItems: "center", overflow: "hidden" }}>
          <img src={logo} alt="EduWatt" style={{ width: 26, height: 26, objectFit: "contain" }} />
        </div>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontWeight: 700, color: "#fff", fontSize: 16 }}>EduWatt</div>
          <div style={{ fontSize: 11, color: "#8893ad" }}>Smart Energy Platform</div>
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 10,
              textDecoration: "none",
              fontSize: 13.5,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? C.green : "#cfd6e6",
              background: isActive ? "rgba(22,163,74,0.10)" : "transparent",
            })}
          >
            <it.icon size={17} />
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

/* ============================== TOPBAR ============================== */
function Topbar({ schoolName }: { schoolName: string }) {
  const { user, signOut } = useAuth() as any;
  const initials = (user?.email ?? "D U").slice(0, 2).toUpperCase();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 28px 4px" }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.5px" }}>Overview Dashboard</h1>
        <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Real-time overview of your school's energy performance</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={pill}>
          <span>{schoolName}</span>
          <ChevronDown size={14} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: C.text }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: C.green, boxShadow: `0 0 0 4px ${C.greenSoft}` }} />
          LIVE
        </div>
        <div style={{ fontSize: 13, color: C.textMuted, fontVariantNumeric: "tabular-nums" }}>{time}</div>
        <button aria-label="Notifications" style={iconBtn}>
          <BellIcon size={16} />
          <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: 999, background: C.orange, border: "2px solid #fff" }} />
        </button>
        <button
          onClick={() => signOut?.()}
          title="Sign out"
          style={{
            width: 38, height: 38, borderRadius: 999, background: "#1f2a44", color: "#fff",
            border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}
        >
          {initials}
        </button>
      </div>
    </div>
  );
}

const pill: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 8,
  padding: "8px 14px", background: "#fff", border: `1px solid ${C.border}`,
  borderRadius: 10, fontSize: 13, color: C.text, fontWeight: 500,
};
const iconBtn: React.CSSProperties = {
  position: "relative", width: 38, height: 38, borderRadius: 10,
  background: "#fff", border: `1px solid ${C.border}`, color: C.text,
  display: "grid", placeItems: "center", cursor: "pointer",
};

/* ============================== KPI CARDS ============================== */
function KpiCards() {
  const { profile, latest } = useSchoolData();
  const { alerts } = useAlerts();

  const tariff = Number(profile?.tariff_uzs_per_kwh ?? 280);
  const days = latest && Number(latest.school_days) > 0 ? Number(latest.school_days) : 21;
  const solar = latest ? Number(latest.solar_generated_kwh ?? 0) / days : 0;
  const grid = latest ? Number(latest.grid_consumed_kwh ?? 0) / days : 0;
  const co2 = (solar * 0.5);
  const saved = Math.round(solar * tariff);
  const active = alerts.filter((a) => !a.resolved).length;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
      <Kpi
        label="Solar Generated" labelColor={C.textMuted}
        value={solar.toFixed(1)} unit="kWh"
        delta={`↑ ${saved.toLocaleString()} UZS saved`} deltaColor={C.green}
        iconBg={C.greenSoft} icon={<SunMedium size={26} color={C.green} strokeWidth={2.2} />}
      />
      <Kpi
        label="Grid Consumed" labelColor={C.textMuted}
        value={grid.toFixed(1)} unit="kWh"
        delta="↓ 4.1% vs yesterday" deltaColor={C.blue}
        iconBg={C.blueSoft} icon={<Zap size={26} color={C.blue} strokeWidth={2.2} />}
      />
      <Kpi
        label="CO₂ Avoided" labelColor={C.purple}
        value={co2.toFixed(1)} unit="kg"
        delta="↑ 8.2% vs yesterday" deltaColor={C.green}
        iconBg={C.purpleSoft} icon={<Leaf size={24} color={C.purple} strokeWidth={2.2} />}
      />
      <Kpi
        label="Active Alerts" labelColor={C.orange}
        value={String(active)} unit=""
        delta={`${active} unresolved > 1h`} deltaColor={C.orange}
        iconBg={C.orangeSoft} icon={<LBell size={24} color={C.orange} strokeWidth={2.2} />}
      />
    </div>
  );
}

function Kpi({
  label, labelColor, value, unit, delta, deltaColor, iconBg, icon,
}: {
  label: string; labelColor: string; value: string; unit: string;
  delta: string; deltaColor: string; iconBg: string; icon: React.ReactNode;
}) {
  return (
    <div style={cardBox}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: labelColor, marginBottom: 14 }}>{label}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: C.text, letterSpacing: "-1px", lineHeight: 1 }}>{value}</span>
            {unit && <span style={{ fontSize: 13, color: C.textMuted }}>{unit}</span>}
          </div>
          <div style={{ fontSize: 12, color: deltaColor, marginTop: 14, fontWeight: 500 }}>{delta}</div>
        </div>
        <div style={{ width: 52, height: 52, borderRadius: 999, background: iconBg, display: "grid", placeItems: "center" }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

const cardBox: React.CSSProperties = {
  background: C.card, border: `1px solid ${C.border}`,
  borderRadius: 14, padding: 20, boxShadow: "0 1px 2px rgba(15,23,42,0.03)",
};

/* ============================== ENERGY FLOW ============================== */
function EnergyFlow() {
  const { latest } = useSchoolData();
  const days = latest && Number(latest.school_days) > 0 ? Number(latest.school_days) : 21;
  const solar = latest ? Number(latest.solar_generated_kwh ?? 0) / days : 0;
  const grid = latest ? Number(latest.grid_consumed_kwh ?? 0) / days : 0;
  const battery = solar * 0.94;
  const gridExport = grid * 0.58;

  return (
    <div style={{ ...cardBox, padding: "22px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.text }}>Energy Flow</h3>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.green, background: C.greenSoft, padding: "3px 10px", borderRadius: 999 }}>Live</span>
      </div>

      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr", alignItems: "center", gap: 8, paddingBlock: 14 }}>
        <FlowNode label="SOLAR PANELS" value={`${solar.toFixed(1)} kWh`} icon={
          <div style={{ position: "relative", width: 56, height: 56 }}>
            <Zap size={56} color={C.green} strokeWidth={1.8} style={{ position: "absolute", inset: 0, opacity: 0.18 }} fill={C.green} />
            <SunMedium size={56} color={C.green} strokeWidth={2} style={{ position: "relative" }} />
          </div>
        } />
        <FlowArrow color={C.green} />
        <FlowNode label="BATTERY" value={`${battery.toFixed(1)} kWh`} sub="81%" icon={<BatteryCharging size={52} color={C.green} strokeWidth={2} />} />
        <FlowArrow color={C.green} />
        <FlowNode label="SCHOOL" value={`${grid.toFixed(1)} kWh`} icon={<LSchool size={56} color={C.navy} strokeWidth={1.8} />} />
        <FlowArrow color={C.blue} />
        <FlowNode label="GRID" value={`${gridExport.toFixed(1)} kWh`} icon={<GridTowerIcon size={54} color={C.navy} />} />

        {/* Battery loop connector */}
        <svg
          aria-hidden
          width="100%" height="40" viewBox="0 0 600 40" preserveAspectRatio="none"
          style={{ gridColumn: "1 / -1", marginTop: -6 }}
        >
          <path d="M 220 4 C 220 30, 320 30, 320 4" stroke={C.green} strokeWidth="1.6" fill="none" strokeDasharray="4 4" opacity="0.6" />
          <path d="M 318 4 L 322 4 L 320 8 Z" fill={C.green} opacity="0.6" />
        </svg>
      </div>
    </div>
  );
}

function FlowNode({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: "1px" }}>{label}</div>
      <div style={{ height: 70, display: "grid", placeItems: "center" }}>{icon}</div>
      {sub && <div style={{ fontSize: 20, fontWeight: 700, color: C.text, letterSpacing: "-0.5px" }}>{sub}</div>}
      <div style={{ fontSize: 13, fontWeight: sub ? 500 : 600, color: sub ? C.textMuted : C.text }}>{value}</div>
    </div>
  );
}

function FlowArrow({ color }: { color: string }) {
  return (
    <svg width="64" height="14" viewBox="0 0 64 14" fill="none">
      <path d="M2 7 H54" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M54 2 L62 7 L54 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* ============================== SUMMARY ============================== */
function TodaySummary() {
  const { profile, latest } = useSchoolData();
  const days = latest && Number(latest.school_days) > 0 ? Number(latest.school_days) : 21;
  const solar = latest ? Number(latest.solar_generated_kwh ?? 0) / days : 0;
  const grid = latest ? Number(latest.grid_consumed_kwh ?? 0) / days : 0;
  const tariff = Number(profile?.tariff_uzs_per_kwh ?? 280);
  const solarPct = solar + grid > 0 ? Math.round((solar / (solar + grid)) * 100) : 0;
  const saved = Math.round(solar * tariff);
  const peak = Math.max(grid * 0.29, 1).toFixed(1);

  return (
    <div style={{ ...cardBox, padding: 22 }}>
      <h3 style={{ margin: 0, marginBottom: 18, fontSize: 17, fontWeight: 700, color: C.text }}>Today's Summary</h3>
      <SummaryRow icon={<LCalendar size={18} color={C.textMuted} strokeWidth={2} />} label="Total Consumption" value={`${grid.toFixed(1)} kWh`} />
      <SummaryRow
        icon={<LSun size={18} color={C.textMuted} strokeWidth={2} />}
        label="Solar Contribution"
        value={`${solarPct}%`}
        extra={
          <div style={{ height: 6, background: C.borderSoft, borderRadius: 999, marginTop: 8, overflow: "hidden" }}>
            <div style={{ width: `${solarPct}%`, height: "100%", background: C.green, borderRadius: 999 }} />
          </div>
        }
      />
      <SummaryRow icon={<LHome size={18} color={C.textMuted} strokeWidth={2} />} label="Energy Cost Saved" value={`${saved.toLocaleString()} UZS`} />
      <SummaryRow
        icon={<LActivity size={18} color={C.textMuted} strokeWidth={2} />}
        label="Peak Demand"
        value={`${peak} kW`}
        extra={<div style={{ fontSize: 11, color: C.textFaint, marginTop: 2 }}>13:00 - 14:00</div>}
        last
      />
    </div>
  );
}

function SummaryRow({ icon, label, value, extra, last }: { icon: React.ReactNode; label: string; value: string; extra?: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ paddingBlock: 14, borderBottom: last ? "none" : `1px solid ${C.borderSoft}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {icon}
        <span style={{ fontSize: 13, color: C.textMuted }}>{label}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginTop: 6, marginLeft: 28 }}>{value}</div>
      <div style={{ marginLeft: 28 }}>{extra}</div>
    </div>
  );
}

/* ============================== ZONES ============================== */
interface Zone { id: string; name: string; current_kw: number; zone_type: string }

function ZoneCards() {
  const { user } = useAuth() as any;
  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("zones").select("*").eq("user_id", user.id).order("created_at")
      .then(({ data }) => setZones((data as Zone[]) ?? []));
  }, [user]);

  // Fallback if no zones seeded
  const display = zones.length ? zones.slice(0, 5) : [
    { id: "1", name: "Science Lab", current_kw: 19.7, zone_type: "normal" },
    { id: "2", name: "Canteen", current_kw: 24.1, zone_type: "thermal" },
    { id: "3", name: "Hallways", current_kw: 11.6, zone_type: "normal" },
    { id: "4", name: "Admin", current_kw: 8.2, zone_type: "normal" },
    { id: "5", name: "Classroom 1", current_kw: 7.8, zone_type: "normal" },
  ];

  return (
    <div style={{ ...cardBox, padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>
          Consumption by Zone <span style={{ color: C.textFaint, fontWeight: 500, fontSize: 14 }}>(Today)</span>
        </h3>
        <div style={{ display: "flex", gap: 6 }}>
          <button style={navBtn}><ChevronLeft size={14} /></button>
          <button style={navBtn}><ChevronRight size={14} /></button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        {display.map((z, i) => {
          const isHigh = z.current_kw > 22 || z.zone_type === "thermal" || z.zone_type === "waste";
          return (
            <div key={z.id} style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,0.03)" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>{z.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: "-0.5px" }}>{Number(z.current_kw).toFixed(1)}</span>
                <span style={{ fontSize: 11, color: C.textMuted }}>kW</span>
              </div>
              <span style={{
                display: "inline-block", marginTop: 8,
                fontSize: 10.5, fontWeight: 700, letterSpacing: "0.3px",
                color: isHigh ? C.orange : C.green,
                background: isHigh ? C.orangeSoft : C.greenSoft,
                padding: "3px 8px", borderRadius: 999,
              }}>
                {isHigh ? "High" : "Normal"}
              </span>
              <Sparkline color={isHigh ? C.orange : C.green} seed={i} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const navBtn: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 8, background: "#fff",
  border: `1px solid ${C.border}`, color: C.textMuted, cursor: "pointer",
  display: "grid", placeItems: "center",
};

function Sparkline({ color, seed }: { color: string; seed: number }) {
  const pts = Array.from({ length: 14 }, (_, i) => {
    const x = (i / 13) * 100;
    const wobble = Math.sin(i * 0.9 + seed) * 6 + Math.sin(i * 0.4 + seed * 2) * 4;
    const y = 22 - (i * 1.1 + wobble + 8);
    return `${x},${Math.max(2, Math.min(28, y))}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 30" style={{ width: "100%", height: 38, marginTop: 8 }} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ============================== AI REC ============================== */
function AiRecCard() {
  const { active } = useAiRecommendations();
  const navigate = useNavigate();
  const top = active[0];
  const text = top?.description ?? "You can save more by shifting 12.4 kWh usage to off-peak hours.";

  return (
    <div style={{ background: C.greenTint, border: `1px solid #cdebd6`, borderRadius: 14, padding: 20, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <SparkleIcon size={16} color={C.green} />
        <span style={{ fontSize: 14, fontWeight: 700, color: C.green }}>AI Recommendation</span>
      </div>
      <div style={{ fontSize: 13.5, color: C.text, lineHeight: 1.5, flex: 1 }}>{text}</div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 10, gap: 10 }}>
        <MiniBars />
        <MoonIcon size={20} color={C.green} />
      </div>

      <button
        onClick={() => navigate("/alerts")}
        style={{ alignSelf: "flex-start", marginTop: 10, fontSize: 13, fontWeight: 600, color: C.green, background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        View Details →
      </button>
    </div>
  );
}

function MiniBars() {
  const bars = [14, 22, 18, 26, 30, 36, 44, 56, 40, 30, 22, 18];
  const max = Math.max(...bars);
  return (
    <svg viewBox="0 0 140 56" style={{ width: 160, height: 56 }} preserveAspectRatio="none">
      <path d="M2 50 Q 30 30, 50 35 T 110 18 T 138 30" stroke={C.green} strokeWidth="1.2" fill="none" strokeDasharray="3 3" opacity="0.6" />
      {bars.map((b, i) => {
        const h = (b / max) * 44;
        const x = i * 11 + 4;
        const peak = i === 7;
        return <rect key={i} x={x} y={52 - h} width={7} height={h} rx={1.5} fill={peak ? C.green : "#a7d9b6"} />;
      })}
    </svg>
  );
}

/* ============================== PAGE ============================== */
export default function Index() {
  const { profile } = useSchoolData();
  const schoolName = profile?.school_name ?? "School No 46";

  return (
    <div
      // Force light surface regardless of global theme; scoped to this page.
      data-eduwatt-light-override
      style={{ display: "flex", minHeight: "100vh", background: C.page, color: C.text, fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <LightSidebar />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Topbar schoolName={schoolName} />
        <main style={{ padding: "16px 28px 32px", display: "flex", flexDirection: "column", gap: 18 }}>
          <KpiCards />
          <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 18 }}>
            <EnergyFlow />
            <TodaySummary />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 18 }}>
            <ZoneCards />
            <AiRecCard />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textMuted, marginTop: 4 }}>
            <span>● Last updated: {new Date().toLocaleTimeString([], { hour12: false })}</span>
            <span>Data source: EduWatt IoT Gateway</span>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ============================== ICONS ============================== */
type IP = { size?: number; color?: string };
function s(p: IP) { return { width: p.size ?? 18, height: p.size ?? 18, stroke: p.color ?? "currentColor", fill: "none", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }; }

function HomeIcon(p: IP) { return <svg viewBox="0 0 24 24" {...s(p)}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>; }
function SunIcon(p: IP) { return <svg viewBox="0 0 24 24" {...s(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>; }
function SunSmallIcon(p: IP) { return SunIcon(p); }
function LayersIcon(p: IP) { return <svg viewBox="0 0 24 24" {...s(p)}><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /><path d="M3 18l9 5 9-5" /></svg>; }
function BellIcon(p: IP) { return <svg viewBox="0 0 24 24" {...s(p)} fill="none"><path d="M6 8a6 6 0 1112 0c0 7 3 7 3 9H3c0-2 3-2 3-9z" /><path d="M10 21a2 2 0 004 0" /></svg>; }
function DocIcon(p: IP) { return <svg viewBox="0 0 24 24" {...s(p)}><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h4" /></svg>; }
function TableIcon(p: IP) { return <svg viewBox="0 0 24 24" {...s(p)}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M3 15h18M9 4v16" /></svg>; }
function GlobeIcon(p: IP) { return <svg viewBox="0 0 24 24" {...s(p)}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" /></svg>; }
function CogIcon(p: IP) { return <svg viewBox="0 0 24 24" {...s(p)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1A2 2 0 117 4.6l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></svg>; }
function ChevronDown(p: IP) { return <svg viewBox="0 0 24 24" {...s(p)}><path d="M6 9l6 6 6-6" /></svg>; }
function ChevronLeft(p: IP) { return <svg viewBox="0 0 24 24" {...s(p)}><path d="M15 18l-6-6 6-6" /></svg>; }
function ChevronRight(p: IP) { return <svg viewBox="0 0 24 24" {...s(p)}><path d="M9 6l6 6-6 6" /></svg>; }
function ClipboardIcon(p: IP) { return <svg viewBox="0 0 24 24" {...s(p)}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4h6v3H9z" /><path d="M9 12h6M9 16h4" /></svg>; }
function HomeSmallIcon(p: IP) { return HomeIcon(p); }
function PulseIcon(p: IP) { return <svg viewBox="0 0 24 24" {...s(p)}><path d="M3 12h4l3-8 4 16 3-8h4" /></svg>; }
function SparkleIcon(p: IP) { return <svg viewBox="0 0 24 24" {...s(p)} fill={p.color}><path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" stroke="none" /></svg>; }
function MoonIcon(p: IP) { return <svg viewBox="0 0 24 24" {...s(p)} fill={p.color} stroke="none"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" /></svg>; }
function LeafIcon(p: IP) { return <svg viewBox="0 0 24 24" {...s(p)}><path d="M20 4c-9 0-16 5-16 13a5 5 0 005 5c8 0 13-7 13-16z" /><path d="M4 22c4-8 9-12 16-14" /></svg>; }

function SolarPanelIcon({ size = 26, color = C.green }: IP) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round">
      <circle cx="20" cy="18" r="6" fill={color} opacity="0.18" />
      <circle cx="20" cy="18" r="4" fill={color} />
      <path d="M14 36h36l6 18H8z" fill={color} opacity="0.15" />
      <path d="M14 36h36l6 18H8z" />
      <path d="M20 36l-3 18M32 36v18M44 36l3 18M11 45h42" />
    </svg>
  );
}
function BatteryIcon({ size = 26, color = C.green }: IP) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke={color} strokeWidth="2.6" strokeLinejoin="round">
      <rect x="16" y="10" width="32" height="46" rx="4" />
      <path d="M26 10V6h12v4" />
      <path d="M32 22l-6 14h8l-4 12 10-16h-8z" fill={color} />
    </svg>
  );
}
function SchoolIcon({ size = 26, color = C.navy }: IP) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round">
      <path d="M32 8l22 12H10z" />
      <path d="M14 22v30h36V22" />
      <rect x="26" y="34" width="12" height="18" />
      <path d="M32 8v6" />
    </svg>
  );
}
function GridTowerIcon({ size = 26, color = C.blue }: IP) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round">
      <path d="M20 8l-6 48M44 8l6 48M20 8h24M14 56h36" />
      <path d="M22 20h20M20 32h24M18 44h28" />
      <path d="M22 20l10 36M42 20L32 56" />
    </svg>
  );
}

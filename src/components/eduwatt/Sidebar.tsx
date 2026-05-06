import { NavLink, useLocation } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import logo from "@/assets/eduwatt-logo.jpg";

const items = [
  { key: "nav.overview", to: "/" },
  { key: "nav.solar", to: "/solar" },
  { key: "nav.grid", to: "/grid" },
  { key: "nav.zones", to: "/zones" },
  { key: "nav.alerts", to: "/alerts" },
  { key: "nav.reports", to: "/reports" },
  { key: "nav.dataInput", to: "/data-input", icon: "▤" },
  { key: "nav.impact", to: "/impact", icon: "◯" },
  { key: "nav.settings", to: "/settings" },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  return (
    <aside
      style={{
        width: 200,
        flexShrink: 0,
        borderRight: "1px solid var(--border-soft)",
        background: "var(--bg-app)",
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: 57,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          borderBottom: "1px solid var(--border)",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-secondary)",
          letterSpacing: "-0.3px",
        }}
      >
        <img src={logo} alt="EduWatt" style={{ width: 22, height: 22, marginRight: 8, objectFit: "contain" }} />
        EduWatt
      </div>
      <nav style={{ paddingTop: 12, display: "flex", flexDirection: "column" }}>
        {items.map((item, i) => {
          const isActive =
            (item.to === "/" && pathname === "/" && item.key === "nav.overview") ||
            (item.to !== "/" && pathname === item.to);
          return (
            <NavLink
              key={`${item.key}-${i}`}
              to={item.to}
              onClick={() => onNavigate?.()}
              style={{
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "var(--text-primary)" : "var(--text-meta)",
                padding: "10px 20px",
                textDecoration: "none",
                background: isActive ? "var(--bg-elevated)" : "transparent",
                borderRight: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {item.icon && <span style={{ fontSize: 11, opacity: 0.7 }}>{item.icon}</span>}
              {t(item.key)}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

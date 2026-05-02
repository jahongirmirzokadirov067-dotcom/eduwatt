import { NavLink, useLocation } from "react-router-dom";

const items = [
  { label: "Overview", to: "/" },
  { label: "Solar", to: "/" },
  { label: "Grid", to: "/" },
  { label: "Zones", to: "/" },
  { label: "Alerts", to: "/" },
  { label: "Reports", to: "/" },
  { label: "Data input", to: "/data-input", icon: "▤" },
  { label: "Settings", to: "/" },
];

export default function Sidebar() {
  const { pathname } = useLocation();
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
        <span style={{ color: "var(--accent)", marginRight: 8 }}>◆</span>
        EduWatt
      </div>
      <nav style={{ paddingTop: 12, display: "flex", flexDirection: "column" }}>
        {items.map((item, i) => {
          const isActive =
            (item.to === "/" && pathname === "/" && item.label === "Overview") ||
            (item.to !== "/" && pathname === item.to);
          return (
            <NavLink
              key={`${item.label}-${i}`}
              to={item.to}
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
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

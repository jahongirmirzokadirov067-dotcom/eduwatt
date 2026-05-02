const items = [
  "Overview",
  "Solar",
  "Grid",
  "Zones",
  "Alerts",
  "Reports",
  "Settings",
];

export default function Sidebar() {
  const active = "Overview";
  return (
    <aside
      style={{
        width: 200,
        flexShrink: 0,
        borderRight: "1px solid #1a1a1a",
        background: "#0f0f0f",
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
          borderBottom: "1px solid #1e1e1e",
          fontSize: 13,
          fontWeight: 600,
          color: "#c8c4bc",
          letterSpacing: "-0.3px",
        }}
      >
        <span style={{ color: "#C8FF00", marginRight: 8 }}>◆</span>
        EduWatt
      </div>
      <nav style={{ paddingTop: 12, display: "flex", flexDirection: "column" }}>
        {items.map((item) => {
          const isActive = item === active;
          return (
            <a
              key={item}
              href="#"
              style={{
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#f0ede6" : "#666",
                padding: "10px 20px",
                textDecoration: "none",
                background: isActive ? "#161616" : "transparent",
                borderRight: isActive ? "2px solid #C8FF00" : "2px solid transparent",
              }}
            >
              {item}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}

import { useTheme } from "@/hooks/useTheme";

export default function Topbar({ title = "Energy Overview" }: { title?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <header
      style={{
        height: 57,
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "var(--bg-app)",
      }}
    >
      <h1
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-secondary)",
          letterSpacing: "-0.3px",
          margin: 0,
        }}
      >
        {title}
      </h1>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 400,
            color: "var(--text-secondary)",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "5px 12px",
          }}
        >
          Greenfield Secondary School
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            className="live-dot"
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--accent)",
              display: "inline-block",
            }}
          />
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>LIVE</span>
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-label="Toggle theme"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "5px 10px",
            fontSize: 11,
            fontWeight: 600,
            color: "var(--text-secondary)",
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.3px",
          }}
        >
          {theme === "dark" ? "☾ DARK" : "☼ LIGHT"}
        </button>
      </div>
    </header>
  );
}

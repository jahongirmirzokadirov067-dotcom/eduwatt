export default function Topbar() {
  return (
    <header
      style={{
        height: 57,
        borderBottom: "1px solid #1e1e1e",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "#0f0f0f",
      }}
    >
      <h1
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#c8c4bc",
          letterSpacing: "-0.3px",
          margin: 0,
        }}
      >
        Energy Overview
      </h1>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 400,
            color: "#c8c4bc",
            background: "#141414",
            border: "1px solid #1e1e1e",
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
              background: "#C8FF00",
              display: "inline-block",
            }}
          />
          <span style={{ fontSize: 11, color: "#888" }}>LIVE</span>
        </div>
      </div>
    </header>
  );
}

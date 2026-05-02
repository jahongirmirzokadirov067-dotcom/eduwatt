import { mockData } from "@/data/mockData.js";

// Hex color interpolation between #1e2e10 (low) and #C8FF00 (peak)
function lerpColor(t: number) {
  const a = { r: 0x1e, g: 0x2e, b: 0x10 };
  const b = { r: 0xc8, g: 0xff, b: 0x00 };
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r},${g},${bl})`;
}

const cardStyle: React.CSSProperties = {
  background: "#141414",
  border: "1px solid #1e1e1e",
  borderRadius: 12,
  padding: 20,
};

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
  marginBottom: 22,
};

function SolarChart() {
  const data = mockData.hourlySolar;
  const max = Math.max(...data.map((d) => d.kwh));
  return (
    <div style={cardStyle}>
      <div style={headingStyle}>HOURLY SOLAR OUTPUT</div>
      <div style={subStyle}>kWh · today 07:00–17:00</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${data.length}, 1fr)`,
          gap: 8,
          alignItems: "end",
          height: 200,
        }}
      >
        {data.map((d) => {
          const t = d.kwh / max;
          return (
            <div key={d.hour} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
              <div style={{ fontSize: 10, color: "#444" }}>{d.kwh.toFixed(1)}</div>
              <div
                style={{
                  width: "100%",
                  height: `${t * 100}%`,
                  background: lerpColor(t),
                  borderRadius: 2,
                  minHeight: 4,
                }}
              />
              <div style={{ fontSize: 10, color: "#444" }}>{d.hour}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ZonesChart() {
  const zones = mockData.zones;
  const max = Math.max(...zones.map((z) => z.kw));
  const colorFor = (type: string) =>
    type === "thermal" ? "#FF8C42" : type === "waste" ? "#E24B4A" : "#378ADD";

  return (
    <div style={cardStyle}>
      <div style={headingStyle}>CONSUMPTION BY ZONE</div>
      <div style={subStyle}>kW · live</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {zones.map((z) => (
          <div key={z.name}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "#c8c4bc" }}>{z.name}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#f0ede6", letterSpacing: "-0.5px" }}>{z.kw} kW</span>
            </div>
            <div style={{ height: 8, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
              <div
                style={{
                  width: `${(z.kw / max) * 100}%`,
                  height: "100%",
                  background: colorFor(z.type),
                  borderRadius: 2,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChartsRow() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
      <SolarChart />
      <ZonesChart />
    </div>
  );
}

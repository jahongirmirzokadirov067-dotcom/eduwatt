import Shell from "@/components/eduwatt/Shell";

const bannerStyle: React.CSSProperties = {
  background: "#0d1a0d",
  border: "1px solid #1a2e1a",
  borderRadius: 12,
  padding: "24px 32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 24,
};

const cardStyle: React.CSSProperties = {
  background: "#141414",
  border: "1px solid #1e1e1e",
  borderRadius: 12,
  padding: "18px 20px",
  position: "relative",
  overflow: "hidden",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#555",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  marginBottom: 14,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: "#c8c4bc",
  marginTop: 8,
  marginBottom: 4,
};

function KpiCard({ accent, label, value, sub }: { accent: string; label: string; value: string; sub: string }) {
  return (
    <div style={cardStyle}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accent }} />
      <div style={labelStyle}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, color: "#f0ede6", letterSpacing: "-0.5px", lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#888", marginTop: 8, lineHeight: 1.5 }}>{sub}</div>
    </div>
  );
}

function Milestone({ year, label, detail, dot }: { year: string; label: string; detail: string; dot: string }) {
  return (
    <div style={{ ...cardStyle, padding: 16, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot, display: "inline-block" }} />
        <span style={{ fontSize: 18, fontWeight: 600, color: "#f0ede6", letterSpacing: "-0.5px" }}>{year}</span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#c8c4bc", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>{label}</div>
      <div style={{ fontSize: 11, color: "#888", lineHeight: 1.55 }}>{detail}</div>
    </div>
  );
}

function FactCard({ stat, unit, body, source }: { stat: string; unit: string; body: string; source: string }) {
  return (
    <div style={{ ...cardStyle, padding: "16px 20px" }}>
      <div style={{ fontSize: 32, fontWeight: 600, color: "#C8FF00", letterSpacing: "-1px", lineHeight: 1 }}>{stat}</div>
      <div style={{ fontSize: 11, color: "#555", marginTop: 4, marginBottom: 10 }}>{unit}</div>
      <div style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>{body}</div>
      <div style={{ fontSize: 10, color: "#444", marginTop: 8 }}>Source: {source}</div>
    </div>
  );
}

export default function Impact() {
  return (
    <Shell title="National impact projection">
      <div>
        <div style={{ fontSize: 22, fontWeight: 600, color: "#f0ede6", letterSpacing: "-0.5px" }}>National impact projection</div>
        <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
          What happens when EduWatt scales across Uzbekistan's 10,000+ public schools.
        </div>
      </div>

      <div style={bannerStyle}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 28, fontWeight: 600, color: "#f0ede6", letterSpacing: "-0.8px", lineHeight: 1.15 }}>
            If every school in Uzbekistan used EduWatt
          </div>
          <div style={{ fontSize: 14, color: "#4a8a4a", marginTop: 8 }}>
            Based on 10,247 registered public schools · Uzbekistan Ministry of Education 2024 data
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 48, fontWeight: 600, color: "#C8FF00", letterSpacing: "-2px", lineHeight: 1 }}>68.8M kWh</div>
          <div style={{ fontSize: 12, color: "#3d6b3d", marginTop: 6 }}>annual solar generation potential</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <KpiCard accent="#C8FF00" label="CO₂ avoided per year" value="34,427 tonnes" sub="= 1.37 million trees planted annually" />
        <KpiCard accent="#378ADD" label="Grid electricity replaced" value="68.8M kWh" sub="Powers 34,400 Uzbek households for 1 year" />
        <KpiCard accent="#4ade80" label="Annual cost saved" value="19.3B UZS" sub="At 280 UZS/kWh institutional tariff rate" />
        <KpiCard accent="#FF8C42" label="Schools with active waste" value="~6,100" sub="Estimated 60% have unmonitored lighting waste" />
      </div>

      <div style={sectionTitleStyle}>Projected adoption timeline</div>
      <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
        <Milestone year="2026" label="Pilot phase" detail="10 schools in Tashkent · Proof of concept · Partner: Ministry of Public Education" dot="#C8FF00" />
        <div style={{ flex: "0 0 24px", alignSelf: "center", borderTop: "1px solid #1e1e1e" }} />
        <Milestone year="2027" label="Regional rollout" detail="500 schools across 3 regions · Integration with e-School platform" dot="#C8FF00" />
        <div style={{ flex: "0 0 24px", alignSelf: "center", borderTop: "1px solid #1e1e1e" }} />
        <Milestone year="2028" label="National deployment" detail="3,000 schools · API connection to UzbekEnergo grid data" dot="#378ADD" />
        <div style={{ flex: "0 0 24px", alignSelf: "center", borderTop: "1px solid #1e1e1e" }} />
        <Milestone year="2030" label="Full coverage" detail="10,247 schools · Aligned with Uzbekistan 54% renewables target" dot="#888" />
      </div>

      <div style={sectionTitleStyle}>Why this matters for Uzbekistan</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <FactCard
          stat="320"
          unit="sunshine days/year in Tashkent"
          body="Uzbekistan has 7,411 PJ of untapped solar potential — schools represent the most accessible entry point for distributed generation."
          source="IEA Solar Roadmap, Uzbekistan 2022"
        />
        <FactCard
          stat="$20M"
          unit="World Bank school energy project"
          body="The Ishonch Fund and World Bank committed $20M to retrofit 45 schools for energy efficiency. EduWatt is the software accountability layer that makes that hardware investment measurable."
          source="Times of Central Asia, Sept 2025"
        />
        <FactCard
          stat="50%"
          unit="above global energy intensity"
          body="Uzbekistan uses 3× more energy per unit of GDP than Germany. Public buildings including schools are the largest addressable inefficiency target in the non-industrial sector."
          source="IEA Country Report, Uzbekistan 2025"
        />
      </div>

      <div style={{ background: "#0d1a0d", border: "1px solid #1a2e1a", borderRadius: 12, padding: "24px 32px", textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: "#f0ede6", lineHeight: 1.4 }}>
          EduWatt is the missing intelligence layer between Uzbekistan's solar investment and its classrooms.
        </div>
        <div style={{ fontSize: 13, color: "#4a8a4a", marginTop: 10 }}>
          Built by students. Designed for 10 million. Aligned with New Uzbekistan 2030.
        </div>
      </div>
    </Shell>
  );
}

import Shell from "@/components/eduwatt/Shell";
import { mockData } from "@/data/mockData.js";
import { useLanguage } from "@/context/LanguageContext";
import { useSchoolData } from "@/hooks/useSchoolData";
import logo from "@/assets/eduwatt-logo.jpg";

const cardStyle: React.CSSProperties = {
  background: "var(--bg-surface)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: 20,
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-label)",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  marginBottom: 14,
};

function Kpi({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div style={cardStyle}>
      <div style={labelStyle}>{label}</div>
      <div>
        <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-1px", color: "var(--text-primary)" }}>{value}</span>
        {unit && <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 6 }}>{unit}</span>}
      </div>
    </div>
  );
}

export default function Reports() {
  const { t, lang } = useLanguage();
  const { records, profile } = useSchoolData();
  const week = mockData.weeklyTrend;
  const tariff = Number(profile?.tariff_uzs_per_kwh ?? mockData.gridTariffUzsPerKwh);
  const schoolName = profile?.school_name || t("reports.unnamedSchool") as string || "Your School";
  const city = profile?.city || "";

  let monthSolar: string, monthGrid: string, monthCo2: string, monthSavedUzs: string;
  if (records.length) {
    const totSolar = records.reduce((s, r) => s + Number(r.solar_generated_kwh ?? 0), 0);
    const totGrid = records.reduce((s, r) => s + Number(r.grid_consumed_kwh ?? 0), 0);
    const totCo2 = totSolar * 0.28;
    monthSolar = totSolar.toFixed(0);
    monthGrid = totGrid.toFixed(0);
    monthCo2 = totCo2.toFixed(0);
    monthSavedUzs = Math.round(totSolar * tariff).toLocaleString();
  } else {
    const weekSolar = week.reduce((s: number, d: any) => s + d.solar, 0);
    const weekGrid = week.reduce((s: number, d: any) => s + d.grid, 0);
    const weekCo2 = week.reduce((s: number, d: any) => s + d.co2, 0);
    monthSolar = (weekSolar / 7 * 30).toFixed(0);
    monthGrid = (weekGrid / 7 * 30).toFixed(0);
    monthCo2 = (weekCo2 / 7 * 30).toFixed(0);
    monthSavedUzs = Math.round(parseFloat(monthSolar) * tariff).toLocaleString();
  }
  const dateLocale = lang === "uz" ? "uz-UZ" : "en-US";
  const periodLabel = new Date().toLocaleDateString(dateLocale, { month: "long", year: "numeric" });

  return (
    <Shell title={t("topbar.title.reports") as string}>
      {/* Screen-only KPI grid */}
      <div className="eduwatt-print-hide eduwatt-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <Kpi label={t("reports.kpi.solarMonth") as string} value={monthSolar} unit="kWh" />
        <Kpi label={t("reports.kpi.gridMonth") as string} value={monthGrid} unit="kWh" />
        <Kpi label={t("reports.kpi.co2") as string} value={monthCo2} unit="kg" />
        <Kpi label={t("reports.kpi.cost") as string} value={monthSavedUzs} unit="UZS" />
      </div>

      {/* Screen header above the report card */}
      <div className="eduwatt-print-hide" style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => window.print()}
          style={{
            fontSize: 12, fontWeight: 600, padding: "10px 18px", borderRadius: 8,
            border: "none", background: "var(--accent)", color: "var(--accent-text)",
            cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.3px",
          }}
        >
          {t("reports.download")}
        </button>
      </div>

      <div className="eduwatt-report-doc" style={cardStyle}>
        {/* Branded header */}
        <div className="eduwatt-report-header" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingBottom: 18, borderBottom: "2px solid var(--accent)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={logo} alt="EduWatt" style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 6 }} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text-primary)" }}>EduWatt</div>
              <div style={{ fontSize: 11, color: "var(--text-meta)", letterSpacing: "0.4px", textTransform: "uppercase" }}>
                {t("reports.title")}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{schoolName}</div>
            <div style={{ fontSize: 11, color: "var(--text-meta)", marginTop: 2 }}>
              {city && <>{city} · </>}{periodLabel}
            </div>
          </div>
        </div>

        {/* KPI grid */}
        <div className="eduwatt-report-kpis" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 22 }}>
          {[
            { label: t("reports.totalSolar"), value: monthSolar, unit: "kWh", color: "var(--accent)" },
            { label: t("reports.totalGrid"), value: monthGrid, unit: "kWh", color: "var(--grid-color)" },
            { label: t("reports.co2"), value: monthCo2, unit: "kg", color: "var(--co2-color)" },
            { label: t("reports.cost"), value: monthSavedUzs, unit: "UZS", color: "var(--accent)" },
          ].map((k, i) => (
            <div key={i} className="eduwatt-report-kpi" style={{
              padding: "14px 16px",
              borderRadius: 10,
              background: "var(--bg-elevated)",
              borderLeft: `3px solid ${k.color}`,
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-meta)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                {k.label as string}
              </div>
              <div>
                <span style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>{k.value}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>{k.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Trend table */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
            {t("reports.sevenDay")}
          </div>
          <div className="eduwatt-table-wrap" style={{ overflowX: "auto" }}>
            <table className="eduwatt-report-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={thStyle}>{t("grid.col.day")}</th>
                  <th style={thStyle}>{t("grid.col.solar")}</th>
                  <th style={thStyle}>{t("grid.col.grid")}</th>
                  <th style={thStyle}>{t("grid.col.co2")}</th>
                </tr>
              </thead>
              <tbody>
                {week.map((d: any, i: number) => (
                  <tr key={d.day} style={{ background: i % 2 === 0 ? "transparent" : "var(--bg-elevated)" }}>
                    <td style={tdStyle}>{d.day}</td>
                    <td style={tdStyle}>{d.solar} kWh</td>
                    <td style={tdStyle}>{d.grid} kWh</td>
                    <td style={tdStyle}>{d.co2} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="eduwatt-report-footer" style={{
          marginTop: 22, paddingTop: 14, borderTop: "1px solid var(--border-soft)",
          display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-meta)",
        }}>
          <span>EduWatt · {t("reports.title")}</span>
          <span>{new Date().toLocaleDateString(dateLocale)}</span>
        </div>
      </div>
    </Shell>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: "var(--text-meta)",
  borderBottom: "1.5px solid var(--accent)",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  color: "var(--text-secondary)",
  borderBottom: "1px solid var(--border-soft)",
};

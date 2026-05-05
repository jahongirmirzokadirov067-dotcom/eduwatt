import Shell from "@/components/eduwatt/Shell";
import { mockData } from "@/data/mockData.js";
import { useLanguage } from "@/context/LanguageContext";
import { useSchoolData } from "@/hooks/useSchoolData";

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
  const week = mockData.weeklyTrend;
  const weekSolar = week.reduce((s: number, d: any) => s + d.solar, 0);
  const weekGrid = week.reduce((s: number, d: any) => s + d.grid, 0);
  const weekCo2 = week.reduce((s: number, d: any) => s + d.co2, 0);
  const monthSolar = (weekSolar / 7 * 30).toFixed(0);
  const monthGrid = (weekGrid / 7 * 30).toFixed(0);
  const monthCo2 = (weekCo2 / 7 * 30).toFixed(0);
  const monthSavedUzs = Math.round(parseFloat(monthSolar) * mockData.gridTariffUzsPerKwh).toLocaleString();
  const dateLocale = lang === "uz" ? "uz-UZ" : "en-US";

  return (
    <Shell title={t("topbar.title.reports") as string}>
      <div className="eduwatt-print-hide" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <Kpi label={t("reports.kpi.solarMonth") as string} value={monthSolar} unit="kWh" />
        <Kpi label={t("reports.kpi.gridMonth") as string} value={monthGrid} unit="kWh" />
        <Kpi label={t("reports.kpi.co2") as string} value={monthCo2} unit="kg" />
        <Kpi label={t("reports.kpi.cost") as string} value={monthSavedUzs} unit="UZS" />
      </div>

      <div className="eduwatt-print-card" style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
              {t("reports.title")}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-meta)", marginTop: 4 }}>
              {mockData.schoolName} · {new Date().toLocaleDateString(dateLocale, { month: "long", year: "numeric" })}
            </div>
          </div>
          <button
            className="eduwatt-print-hide"
            onClick={() => window.print()}
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--accent)",
              color: "var(--accent-text)",
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.3px",
            }}
          >
            {t("reports.download")}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 18 }}>
          <div>
            <div style={labelStyle}>{t("reports.totalSolar")}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)" }}>{monthSolar} kWh</div>
          </div>
          <div>
            <div style={labelStyle}>{t("reports.totalGrid")}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)" }}>{monthGrid} kWh</div>
          </div>
          <div>
            <div style={labelStyle}>{t("reports.co2")}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: "var(--co2-color)" }}>{monthCo2} kg</div>
          </div>
          <div>
            <div style={labelStyle}>{t("reports.cost")}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: "var(--accent)" }}>{monthSavedUzs} UZS</div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14 }}>
          <div style={labelStyle}>{t("reports.sevenDay")}</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ color: "var(--text-meta)", textAlign: "left" }}>
                <th style={{ padding: "6px 8px" }}>{t("grid.col.day")}</th>
                <th style={{ padding: "6px 8px" }}>{t("grid.col.solar")}</th>
                <th style={{ padding: "6px 8px" }}>{t("grid.col.grid")}</th>
                <th style={{ padding: "6px 8px" }}>{t("grid.col.co2")}</th>
              </tr>
            </thead>
            <tbody>
              {week.map((d: any) => (
                <tr key={d.day} style={{ color: "var(--text-secondary)" }}>
                  <td style={{ padding: "6px 8px", borderTop: "1px solid var(--border-soft)" }}>{d.day}</td>
                  <td style={{ padding: "6px 8px", borderTop: "1px solid var(--border-soft)" }}>{d.solar}</td>
                  <td style={{ padding: "6px 8px", borderTop: "1px solid var(--border-soft)" }}>{d.grid}</td>
                  <td style={{ padding: "6px 8px", borderTop: "1px solid var(--border-soft)" }}>{d.co2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}

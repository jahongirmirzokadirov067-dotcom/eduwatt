import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import Sidebar from "@/components/eduwatt/Sidebar";
import Topbar from "@/components/eduwatt/Topbar";
import { useLanguage } from "@/context/LanguageContext";

interface MonthlyRecord {
  month: string;
  gridConsumedKwh: number;
  peakDemandKw: number;
  billUzs: number;
  solarGeneratedKwh: number | null;
  schoolDays: number;
  notes: string;
}

const inputStyle: React.CSSProperties = {
  background: "var(--bg-surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 13,
  color: "var(--text-primary)",
  fontFamily: "inherit",
  width: "100%",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-secondary)",
  marginBottom: 6,
  display: "block",
  letterSpacing: "0.2px",
};

const errorStyle: React.CSSProperties = {
  color: "var(--crit-color)",
  fontSize: 11,
  marginTop: 4,
};

const fieldWrapper: React.CSSProperties = { display: "flex", flexDirection: "column", marginBottom: 14 };

const cardStyle: React.CSSProperties = {
  background: "var(--bg-surface)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: 20,
};

const TEMPLATE_CSV = `month,gridConsumedKwh,peakDemandKw,billUzs,solarGeneratedKwh,schoolDays,notes
2026-01,4820,18.4,1349600,312,21,January baseline
2026-02,4210,17.1,1178800,380,19,Warmer month
`;

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "eduwatt-monthly-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function parseCsv(text: string): MonthlyRecord[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const out: MonthlyRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((s) => s.trim());
    if (cols.length < 6) continue;
    out.push({
      month: cols[0],
      gridConsumedKwh: parseFloat(cols[1]) || 0,
      peakDemandKw: parseFloat(cols[2]) || 0,
      billUzs: parseFloat(cols[3]) || 0,
      solarGeneratedKwh: cols[4] ? parseFloat(cols[4]) : null,
      schoolDays: parseInt(cols[5], 10) || 0,
      notes: cols.slice(6).join(",") || "",
    });
  }
  return out;
}

function ManualForm({ onAdd }: { onAdd: (r: MonthlyRecord) => void }) {
  const { t, lang } = useLanguage();
  const [form, setForm] = useState({
    month: "",
    gridConsumedKwh: "",
    peakDemandKw: "",
    billUzs: "",
    solarGeneratedKwh: "",
    schoolDays: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    if (!form.month) e.month = t("data.err.required") as string;
    else if (form.month > currentMonth) e.month = t("data.err.future") as string;
    const grid = parseFloat(form.gridConsumedKwh);
    if (!form.gridConsumedKwh) e.gridConsumedKwh = t("data.err.required") as string;
    else if (isNaN(grid) || grid < 0 || grid > 99999) e.gridConsumedKwh = t("data.err.range", { min: 0, max: 99999 }) as string;
    const peak = parseFloat(form.peakDemandKw);
    if (!form.peakDemandKw) e.peakDemandKw = t("data.err.required") as string;
    else if (isNaN(peak) || peak < 0 || peak > 999) e.peakDemandKw = t("data.err.range", { min: 0, max: 999 }) as string;
    const bill = parseFloat(form.billUzs);
    if (!form.billUzs) e.billUzs = t("data.err.required") as string;
    else if (isNaN(bill) || bill < 0) e.billUzs = t("data.err.geZero") as string;
    if (form.solarGeneratedKwh) {
      const s = parseFloat(form.solarGeneratedKwh);
      if (isNaN(s) || s < 0 || s > 99999) e.solarGeneratedKwh = t("data.err.range", { min: 0, max: 99999 }) as string;
    }
    const days = parseInt(form.schoolDays, 10);
    if (!form.schoolDays) e.schoolDays = t("data.err.required") as string;
    else if (isNaN(days) || days < 1 || days > 31) e.schoolDays = t("data.err.range", { min: 1, max: 31 }) as string;
    if (form.notes.length > 300) e.notes = t("data.err.maxChars") as string;
    return e;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const rec: MonthlyRecord = {
      month: form.month,
      gridConsumedKwh: parseFloat(form.gridConsumedKwh),
      peakDemandKw: parseFloat(form.peakDemandKw),
      billUzs: parseFloat(form.billUzs),
      solarGeneratedKwh: form.solarGeneratedKwh ? parseFloat(form.solarGeneratedKwh) : null,
      schoolDays: parseInt(form.schoolDays, 10),
      notes: form.notes,
    };
    onAdd(rec);
    const [yr, mo] = rec.month.split("-");
    const monthName = new Date(parseInt(yr), parseInt(mo) - 1, 1).toLocaleString(lang === "uz" ? "uz-UZ" : "en", { month: "long" });
    toast.success(t("data.toast.saved", { month: monthName, year: yr }) as string, {
      style: { borderLeft: "3px solid #4ade80" },
    });
    setForm({ month: "", gridConsumedKwh: "", peakDemandKw: "", billUzs: "", solarGeneratedKwh: "", schoolDays: "", notes: "" });
  };

  return (
    <form onSubmit={submit} style={cardStyle}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 16 }}>
        {t("data.manualEntry")}
      </div>

      <div style={fieldWrapper}>
        <label style={labelStyle}>{t("data.field.month")}</label>
        <input type="month" value={form.month} onChange={set("month")} style={inputStyle} />
        {errors.month && <div style={errorStyle}>{errors.month}</div>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={fieldWrapper}>
          <label style={labelStyle}>{t("data.field.gridConsumed")}</label>
          <input type="number" step="0.1" min="0" max="99999" value={form.gridConsumedKwh} onChange={set("gridConsumedKwh")} style={inputStyle} />
          {errors.gridConsumedKwh && <div style={errorStyle}>{errors.gridConsumedKwh}</div>}
        </div>
        <div style={fieldWrapper}>
          <label style={labelStyle}>{t("data.field.peak")}</label>
          <input type="number" step="0.1" min="0" max="999" value={form.peakDemandKw} onChange={set("peakDemandKw")} style={inputStyle} />
          {errors.peakDemandKw && <div style={errorStyle}>{errors.peakDemandKw}</div>}
        </div>
        <div style={fieldWrapper}>
          <label style={labelStyle}>{t("data.field.bill")}</label>
          <input type="number" min="0" value={form.billUzs} onChange={set("billUzs")} style={inputStyle} />
          {errors.billUzs && <div style={errorStyle}>{errors.billUzs}</div>}
        </div>
        <div style={fieldWrapper}>
          <label style={labelStyle}>{t("data.field.solar")}</label>
          <input type="number" step="0.1" min="0" max="99999" value={form.solarGeneratedKwh} onChange={set("solarGeneratedKwh")} style={inputStyle} />
          {errors.solarGeneratedKwh && <div style={errorStyle}>{errors.solarGeneratedKwh}</div>}
        </div>
        <div style={fieldWrapper}>
          <label style={labelStyle}>{t("data.field.schoolDays")}</label>
          <input type="number" min="1" max="31" value={form.schoolDays} onChange={set("schoolDays")} style={inputStyle} />
          {errors.schoolDays && <div style={errorStyle}>{errors.schoolDays}</div>}
        </div>
      </div>

      <div style={fieldWrapper}>
        <label style={labelStyle}>{t("data.field.notes")}</label>
        <textarea rows={3} maxLength={300} value={form.notes} onChange={set("notes")} style={{ ...inputStyle, resize: "vertical" }} />
        {errors.notes && <div style={errorStyle}>{errors.notes}</div>}
      </div>

      <button
        type="submit"
        style={{
          width: "100%",
          background: "var(--accent)",
          color: "var(--accent-text)",
          border: "none",
          borderRadius: 8,
          padding: 10,
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
          marginTop: 4,
        }}
      >
        {t("data.btn.save")}
      </button>
    </form>
  );
}

function CsvUpload({ onImport }: { onImport: (records: MonthlyRecord[]) => void }) {
  const { t } = useLanguage();
  const [parsed, setParsed] = useState<MonthlyRecord[] | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const records = parseCsv(text);
      if (!records.length) {
        toast.error(t("data.toast.csvEmpty") as string);
        return;
      }
      setParsed(records);
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{t("data.bulkUpload")}</div>
        <button
          type="button"
          onClick={downloadTemplate}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--accent)",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            padding: 0,
            fontFamily: "inherit",
          }}
        >
          {t("data.btn.downloadTemplate")}
        </button>
      </div>

      {!parsed ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          style={{
            border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`,
            borderRadius: 12,
            padding: 40,
            textAlign: "center",
            background: "var(--bg-surface)",
            transition: "border-color 0.15s",
          }}
        >
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
            {t("data.dropzone")}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {t("data.btn.browse")}
          </button>
        </div>
      ) : (
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 16, background: "var(--bg-surface)" }}>
          <div style={{ overflow: "auto", maxHeight: 200, marginBottom: 12 }}>
            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ color: "var(--text-meta)", textAlign: "left" }}>
                  <th style={{ padding: "6px 8px" }}>{t("data.col.month")}</th>
                  <th style={{ padding: "6px 8px" }}>{t("data.col.grid")}</th>
                  <th style={{ padding: "6px 8px" }}>{t("data.col.peak")}</th>
                  <th style={{ padding: "6px 8px" }}>{t("data.col.bill")}</th>
                  <th style={{ padding: "6px 8px" }}>{t("data.col.solar")}</th>
                  <th style={{ padding: "6px 8px" }}>{t("data.col.days")}</th>
                </tr>
              </thead>
              <tbody>
                {parsed.map((r, i) => (
                  <tr key={i} style={{ background: i % 2 ? "var(--bg-elevated)" : "var(--bg-surface)", color: "var(--text-secondary)" }}>
                    <td style={{ padding: "6px 8px" }}>{r.month}</td>
                    <td style={{ padding: "6px 8px" }}>{r.gridConsumedKwh}</td>
                    <td style={{ padding: "6px 8px" }}>{r.peakDemandKw}</td>
                    <td style={{ padding: "6px 8px" }}>{r.billUzs}</td>
                    <td style={{ padding: "6px 8px" }}>{r.solarGeneratedKwh ?? "—"}</td>
                    <td style={{ padding: "6px 8px" }}>{r.schoolDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => { onImport(parsed); setParsed(null); toast.success(t("data.toast.imported", { n: parsed.length }) as string); }}
              style={{
                background: "var(--accent)", color: "var(--accent-text)", border: "none",
                borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {t("data.btn.confirmImport", { n: parsed.length })}
            </button>
            <button
              type="button"
              onClick={() => setParsed(null)}
              style={{
                background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)",
                borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {t("data.btn.cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RecordsTable({ records, onDelete }: { records: MonthlyRecord[]; onDelete: (idx: number) => void }) {
  const { t } = useLanguage();
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 16 }}>
        {t("data.records", { n: records.length })}
      </div>
      {records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          {t("data.empty.line1")}<br />
          {t("data.empty.line2")}
        </div>
      ) : (
        <div style={{ maxHeight: 600, overflow: "auto" }}>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ color: "var(--text-meta)", textAlign: "left", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "8px 6px", fontWeight: 600 }}>{t("data.col.month")}</th>
                <th style={{ padding: "8px 6px", fontWeight: 600 }}>{t("data.col.grid")}</th>
                <th style={{ padding: "8px 6px", fontWeight: 600 }}>{t("data.col.solar")}</th>
                <th style={{ padding: "8px 6px", fontWeight: 600 }}>{t("data.col.bill")}</th>
                <th style={{ padding: "8px 6px", fontWeight: 600 }}>{t("data.col.days")}</th>
                <th style={{ padding: "8px 6px", fontWeight: 600, width: 32 }}></th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-soft)", color: "var(--text-secondary)" }}>
                  <td style={{ padding: "8px 6px" }}>{r.month}</td>
                  <td style={{ padding: "8px 6px" }}>{r.gridConsumedKwh}</td>
                  <td style={{ padding: "8px 6px" }}>{r.solarGeneratedKwh ?? "—"}</td>
                  <td style={{ padding: "8px 6px" }}>{r.billUzs.toLocaleString()}</td>
                  <td style={{ padding: "8px 6px" }}>{r.schoolDays}</td>
                  <td style={{ padding: "8px 6px" }}>
                    <button
                      type="button"
                      onClick={() => onDelete(i)}
                      aria-label="Delete record"
                      className="record-trash"
                      style={{
                        background: "transparent", border: "none", color: "var(--text-meta)",
                        cursor: "pointer", padding: 2, display: "flex", alignItems: "center",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function DataInput() {
  const { t } = useLanguage();
  const [records, setRecords] = useState<MonthlyRecord[]>([]);

  const sorted = useMemo(() => [...records].sort((a, b) => b.month.localeCompare(a.month)), [records]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-app)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar title={t("topbar.title.dataInput") as string} />
        <main style={{ padding: 24, display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }}>
          <div>
            <ManualForm onAdd={(r) => setRecords((rs) => [...rs, r])} />
            <CsvUpload onImport={(recs) => setRecords((rs) => [...rs, ...recs])} />
          </div>
          <RecordsTable records={sorted} onDelete={(idx) => {
            const target = sorted[idx];
            setRecords((rs) => rs.filter((r) => r !== target));
          }} />
        </main>
      </div>
    </div>
  );
}

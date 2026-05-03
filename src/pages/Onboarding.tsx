import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const cardStyle: React.CSSProperties = {
  background: "#141414",
  border: "1px solid #1e1e1e",
  borderRadius: 16,
  padding: 40,
  width: 520,
  maxWidth: "calc(100vw - 32px)",
};

const inputStyle: React.CSSProperties = {
  background: "#0f0f0f",
  border: "1px solid #1e1e1e",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 13,
  color: "#f0ede6",
  fontFamily: "inherit",
  width: "100%",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#9a9a9a",
  marginBottom: 6,
  display: "block",
  letterSpacing: "0.3px",
  textTransform: "uppercase",
};

const fieldWrap: React.CSSProperties = { marginBottom: 14 };

const btnPrimary: React.CSSProperties = {
  background: "#C8FF00",
  color: "#0a0a0a",
  border: "none",
  borderRadius: 8,
  padding: "10px 18px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

const btnGhost: React.CSSProperties = {
  background: "transparent",
  color: "#9a9a9a",
  border: "1px solid #1e1e1e",
  borderRadius: 8,
  padding: "10px 18px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const [s1, setS1] = useState({
    schoolName: sessionStorage.getItem("eduwatt_signup_school_name") || "",
    city: "",
    floors: "1",
    totalRooms: "10",
    schoolType: "Public",
  });
  const [s2, setS2] = useState({
    solarCapacityKw: "0",
    panelAreaM2: "0",
    tariff: "280",
    operatingHours: "08:00–17:00",
  });
  const [s3, setS3] = useState({
    monthlyKwh: "",
    monthlyBillUzs: "",
    schoolDays: "21",
  });

  const next = () => {
    if (step === 0) {
      if (!s1.schoolName.trim() || !s1.city.trim()) {
        toast.error("School name and city are required");
        return;
      }
    }
    setStep((s) => s + 1);
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const dailyKwh = (parseFloat(s3.monthlyKwh) || 0) / Math.max(1, parseInt(s3.schoolDays) || 1);
  const dailyCost = (parseFloat(s3.monthlyBillUzs) || 0) / Math.max(1, parseInt(s3.schoolDays) || 1);
  const potentialSaving = (parseFloat(s2.solarCapacityKw) || 0) * 5 * (parseFloat(s2.tariff) || 0); // 5 kWh/kW/day estimate

  const finish = async () => {
    if (!user) return;
    if (!s3.monthlyKwh || !s3.monthlyBillUzs) {
      toast.error("Monthly consumption and bill are required");
      return;
    }
    setBusy(true);
    const { error: profErr } = await supabase.from("school_profiles").upsert(
      {
        user_id: user.id,
        school_name: s1.schoolName,
        city: s1.city,
        floors: parseInt(s1.floors) || 1,
        total_rooms: parseInt(s1.totalRooms) || 1,
        school_type: s1.schoolType,
        solar_capacity_kw: parseFloat(s2.solarCapacityKw) || 0,
        panel_area_m2: parseFloat(s2.panelAreaM2) || 0,
        tariff_uzs_per_kwh: parseFloat(s2.tariff) || 280,
        operating_hours: s2.operatingHours,
      },
      { onConflict: "user_id" },
    );
    if (profErr) {
      setBusy(false);
      toast.error(profErr.message);
      return;
    }
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const grid = parseFloat(s3.monthlyKwh) || 0;
    const solarEst = (parseFloat(s2.solarCapacityKw) || 0) * 5 * (parseInt(s3.schoolDays) || 21); // est monthly solar
    const { error: recErr } = await supabase.from("monthly_records").insert({
      user_id: user.id,
      month: monthStr,
      grid_consumed_kwh: grid,
      solar_generated_kwh: solarEst,
      bill_uzs: parseFloat(s3.monthlyBillUzs) || 0,
      school_days: parseInt(s3.schoolDays) || 21,
    });
    setBusy(false);
    if (recErr) {
      toast.error(recErr.message);
      return;
    }
    sessionStorage.removeItem("eduwatt_signup_school_name");
    navigate("/", { replace: true });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 28 }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: i <= step ? "#C8FF00" : "transparent",
                border: `1px solid ${i <= step ? "#C8FF00" : "#333"}`,
              }}
            />
          ))}
        </div>

        {step === 0 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#f0ede6", margin: "0 0 20px" }}>Tell us about your school</h2>
            <div style={fieldWrap}>
              <label style={labelStyle}>School name</label>
              <input style={inputStyle} value={s1.schoolName} onChange={(e) => setS1({ ...s1, schoolName: e.target.value })} />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>City</label>
              <input style={inputStyle} value={s1.city} onChange={(e) => setS1({ ...s1, city: e.target.value })} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>Floors</label>
                <input type="number" min={1} max={10} style={inputStyle} value={s1.floors} onChange={(e) => setS1({ ...s1, floors: e.target.value })} />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Total rooms</label>
                <input type="number" min={1} max={200} style={inputStyle} value={s1.totalRooms} onChange={(e) => setS1({ ...s1, totalRooms: e.target.value })} />
              </div>
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>School type</label>
              <select style={inputStyle} value={s1.schoolType} onChange={(e) => setS1({ ...s1, schoolType: e.target.value })}>
                <option>Public</option>
                <option>Private</option>
                <option>Vocational</option>
              </select>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#f0ede6", margin: "0 0 20px" }}>Your energy setup</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>Solar capacity (kW)</label>
                <input type="number" min={0} step="0.1" style={inputStyle} value={s2.solarCapacityKw} onChange={(e) => setS2({ ...s2, solarCapacityKw: e.target.value })} />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Panel area (m²)</label>
                <input type="number" min={0} step="0.1" style={inputStyle} value={s2.panelAreaM2} onChange={(e) => setS2({ ...s2, panelAreaM2: e.target.value })} />
              </div>
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Grid tariff (UZS / kWh)</label>
              <input type="number" min={0} style={inputStyle} value={s2.tariff} onChange={(e) => setS2({ ...s2, tariff: e.target.value })} />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Operating hours</label>
              <select style={inputStyle} value={s2.operatingHours} onChange={(e) => setS2({ ...s2, operatingHours: e.target.value })}>
                <option>08:00–17:00</option>
                <option>07:00–18:00</option>
                <option>08:00–15:00</option>
              </select>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#f0ede6", margin: "0 0 20px" }}>Set your baseline</h2>
            <div style={fieldWrap}>
              <label style={labelStyle}>Avg monthly grid consumption (kWh)</label>
              <input type="number" min={0} style={inputStyle} value={s3.monthlyKwh} onChange={(e) => setS3({ ...s3, monthlyKwh: e.target.value })} />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Avg monthly bill (UZS)</label>
              <input type="number" min={0} style={inputStyle} value={s3.monthlyBillUzs} onChange={(e) => setS3({ ...s3, monthlyBillUzs: e.target.value })} />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>School days per month</label>
              <input type="number" min={1} max={31} style={inputStyle} value={s3.schoolDays} onChange={(e) => setS3({ ...s3, schoolDays: e.target.value })} />
            </div>
            <div
              style={{
                background: "#0f0f0f",
                border: "1px solid #1e1e1e",
                borderRadius: 12,
                padding: 16,
                marginTop: 8,
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9a9a9a" }}>
                <span>Estimated daily consumption</span>
                <span style={{ color: "#f0ede6", fontWeight: 600 }}>{dailyKwh.toFixed(1)} kWh</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9a9a9a" }}>
                <span>Estimated daily cost</span>
                <span style={{ color: "#f0ede6", fontWeight: 600 }}>{Math.round(dailyCost).toLocaleString()} UZS</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9a9a9a" }}>
                <span>Potential daily solar saving</span>
                <span style={{ color: "#C8FF00", fontWeight: 600 }}>{Math.round(potentialSaving).toLocaleString()} UZS</span>
              </div>
            </div>
          </>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, gap: 12 }}>
          {step > 0 ? (
            <button type="button" style={btnGhost} onClick={back} disabled={busy}>Back</button>
          ) : <span />}
          {step < 2 ? (
            <button type="button" style={btnPrimary} onClick={next}>Next</button>
          ) : (
            <button type="button" style={{ ...btnPrimary, opacity: busy ? 0.6 : 1 }} onClick={finish} disabled={busy}>
              {busy ? "Saving…" : "Start using EduWatt"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

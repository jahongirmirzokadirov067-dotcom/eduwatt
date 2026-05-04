import { useEffect, useState } from "react";
import Shell from "@/components/eduwatt/Shell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "sonner";

const cardStyle: React.CSSProperties = {
  background: "var(--bg-surface)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: 24,
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-label)",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  marginBottom: 14,
};

const fieldLabel: React.CSSProperties = {
  fontSize: 12,
  color: "var(--text-meta)",
  marginBottom: 6,
  display: "block",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  padding: "8px 10px",
  borderRadius: 6,
  fontSize: 13,
  fontFamily: "inherit",
};

export default function Settings() {
  const { user } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { theme, toggle } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    school_name: "",
    city: "",
    tariff_uzs_per_kwh: 280,
    solar_capacity_kw: 0,
    alert_threshold_kwh: 100,
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("school_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setForm({
          school_name: data.school_name ?? "",
          city: data.city ?? "",
          tariff_uzs_per_kwh: Number(data.tariff_uzs_per_kwh ?? 280),
          solar_capacity_kw: Number(data.solar_capacity_kw ?? 0),
          alert_threshold_kwh: Number((data as any).alert_threshold_kwh ?? 100),
        });
      }
      setLoading(false);
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("school_profiles")
      .update(form)
      .eq("user_id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Settings saved");
  };

  if (loading) {
    return <Shell title={t("nav.settings") as string}><div /></Shell>;
  }

  return (
    <Shell title={t("nav.settings") as string}>
      <div style={cardStyle}>
        <div style={labelStyle}>School Profile</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={fieldLabel}>School name</label>
            <input style={inputStyle} value={form.school_name} onChange={(e) => setForm({ ...form, school_name: e.target.value })} />
          </div>
          <div>
            <label style={fieldLabel}>City</label>
            <input style={inputStyle} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <label style={fieldLabel}>Electricity tariff (UZS / kWh)</label>
            <input type="number" style={inputStyle} value={form.tariff_uzs_per_kwh} onChange={(e) => setForm({ ...form, tariff_uzs_per_kwh: Number(e.target.value) })} />
          </div>
          <div>
            <label style={fieldLabel}>Solar capacity (kW)</label>
            <input type="number" style={inputStyle} value={form.solar_capacity_kw} onChange={(e) => setForm({ ...form, solar_capacity_kw: Number(e.target.value) })} />
          </div>
        </div>
        <button
          onClick={save}
          disabled={saving}
          style={{ marginTop: 18, background: "var(--accent)", color: "var(--accent-text)", border: "none", padding: "9px 18px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>Alert thresholds</div>
        <label style={fieldLabel}>Grid draw limit (kWh)</label>
        <input
          type="number"
          style={{ ...inputStyle, maxWidth: 240 }}
          value={form.alert_threshold_kwh}
          onChange={(e) => setForm({ ...form, alert_threshold_kwh: Number(e.target.value) })}
        />
        <div style={{ fontSize: 11, color: "var(--text-meta)", marginTop: 8 }}>
          Trigger an alert when grid consumption exceeds this value in a single reading.
        </div>
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>Preferences</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border-soft)" }}>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-primary)" }}>Language</div>
            <div style={{ fontSize: 11, color: "var(--text-meta)" }}>Interface language</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {(["en", "uz"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  background: lang === l ? "var(--accent)" : "var(--bg-elevated)",
                  color: lang === l ? "var(--accent-text)" : "var(--text-secondary)",
                  border: "1px solid var(--border)",
                  padding: "6px 14px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {l === "en" ? "English" : "O'zbekcha"}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-primary)" }}>Theme</div>
            <div style={{ fontSize: 11, color: "var(--text-meta)" }}>Dark or light appearance</div>
          </div>
          <button
            onClick={toggle}
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)", padding: "6px 14px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
          >
            {theme === "dark" ? "☾ Dark" : "☼ Light"}
          </button>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={labelStyle}>Smart Meter API</div>
        <label style={fieldLabel}>API Key</label>
        <input
          readOnly
          value="sk_live_••••••••••••••••••••3a7f"
          style={{ ...inputStyle, fontFamily: "monospace", color: "var(--text-meta)" }}
        />
        <div style={{ fontSize: 11, color: "var(--text-meta)", marginTop: 8 }}>
          Used to authenticate live meter readings. Contact support to rotate.
        </div>
      </div>
    </Shell>
  );
}

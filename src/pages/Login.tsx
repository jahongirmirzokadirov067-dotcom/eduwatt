import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const cardStyle: React.CSSProperties = {
  background: "#141414",
  border: "1px solid #1e1e1e",
  borderRadius: 16,
  padding: 40,
  width: 400,
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
  marginBottom: 12,
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

const btnStyle: React.CSSProperties = {
  width: "100%",
  background: "#C8FF00",
  color: "#0a0a0a",
  border: "none",
  borderRadius: 8,
  padding: "11px 12px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  marginTop: 6,
};

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase
      .from("school_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    navigate(profile ? "/" : "/onboarding", { replace: true });
  };

  const handleDemoLogin = async () => {
    setBusy(true);
    const demoEmail = "demo@eduwatt.uz";
    const demoPassword = "Demo1234!";
    let { error } = await signIn(demoEmail, demoPassword);
    if (error) {
      const { error: suErr } = await signUp(demoEmail, demoPassword);
      if (suErr && !/registered/i.test(suErr.message)) {
        setBusy(false);
        toast.error(suErr.message);
        return;
      }
      const { error: si2 } = await signIn(demoEmail, demoPassword);
      if (si2) {
        setBusy(false);
        toast.error(si2.message);
        return;
      }
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("school_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!profile) {
        await supabase.from("school_profiles").insert({
          user_id: user.id,
          school_name: "School No 45",
          city: "Tashkent",
          floors: 3,
          total_rooms: 24,
          school_type: "Public",
          solar_capacity_kw: 22.5,
          panel_area_m2: 44,
          tariff_uzs_per_kwh: 280,
          operating_hours: "08:00–17:00",
        });
      }
      const { data: recs } = await supabase
        .from("monthly_records")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);
      if (!recs || recs.length === 0) {
        await supabase.from("monthly_records").insert({
          user_id: user.id,
          month: "2026-05-01",
          grid_consumed_kwh: 183,
          bill_uzs: 51240,
          solar_generated_kwh: 18.4,
          school_days: 21,
        });
      }
    }
    setBusy(false);
    navigate("/", { replace: true });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setBusy(true);
    const { error } = await signUp(email, password);
    if (error) {
      setBusy(false);
      toast.error(error.message);
      return;
    }
    // Auto-confirm is on; sign in immediately
    const { error: signInErr } = await signIn(email, password);
    setBusy(false);
    if (signInErr) {
      toast.error(signInErr.message);
      return;
    }
    // Carry the school name through to onboarding via sessionStorage
    if (schoolName) sessionStorage.setItem("eduwatt_signup_school_name", schoolName);
    navigate("/onboarding", { replace: true });
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 28 }}>
          <span style={{ color: "#C8FF00", fontSize: 22 }}>◆</span>
          <span style={{ color: "#f0ede6", fontSize: 18, fontWeight: 600, letterSpacing: "-0.3px" }}>EduWatt</span>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid #1e1e1e" }}>
          {(["signin", "signup"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                padding: "10px 0",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                color: tab === k ? "#f0ede6" : "#666",
                borderBottom: tab === k ? "2px solid #C8FF00" : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {k === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        {tab === "signin" ? (
          <form onSubmit={handleSignIn}>
            <label style={labelStyle}>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            <label style={labelStyle}>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
            <button type="submit" disabled={busy} style={{ ...btnStyle, opacity: busy ? 0.6 : 1 }}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
            <div style={{ marginTop: 18, fontSize: 11, color: "#555", textAlign: "center" }}>
              ⚡️ For judges & reviewers
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={handleDemoLogin}
              style={{
                width: "100%",
                background: "transparent",
                color: "#C8FF00",
                border: "1px solid #C8FF00",
                borderRadius: 8,
                padding: 12,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                marginTop: 8,
                opacity: busy ? 0.6 : 1,
              }}
            >
              Sign in with Demo Account
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp}>
            <label style={labelStyle}>School name</label>
            <input type="text" required value={schoolName} onChange={(e) => setSchoolName(e.target.value)} style={inputStyle} />
            <label style={labelStyle}>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            <label style={labelStyle}>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
            <label style={labelStyle}>Confirm password</label>
            <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inputStyle} />
            <button type="submit" disabled={busy} style={{ ...btnStyle, opacity: busy ? 0.6 : 1 }}>
              {busy ? "Creating…" : "Create account"}
            </button>
          </form>
        )}

        <div style={{ marginTop: 24, fontSize: 12, color: "#444", textAlign: "center" }}>
          EduWatt — School Energy Intelligence · Uzbekistan
        </div>
      </div>
    </div>
  );
}

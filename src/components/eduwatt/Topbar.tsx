import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/context/LanguageContext";
import { useSchoolData } from "@/hooks/useSchoolData";
import { useAuth } from "@/context/AuthContext";
import MiniApps from "./MiniApps";

export default function Topbar({ title, onMenuClick }: { title?: string; onMenuClick?: () => void }) {
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { profile } = useSchoolData();
  const { signOut } = useAuth();
  const displayTitle = title || (t("topbar.title.overview") as string);
  const schoolName = profile?.school_name || "EduWatt School";
  return (
    <header
      className="eduwatt-topbar"
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
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <button
          type="button"
          className="eduwatt-mobile-menu-btn"
          onClick={onMenuClick}
          aria-label="Open menu"
          style={{
            display: "none",
            alignItems: "center", justifyContent: "center",
            width: 36, height: 36, borderRadius: 8,
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            color: "var(--text-secondary)", cursor: "pointer", padding: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <h1
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-secondary)",
            letterSpacing: "-0.3px",
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {displayTitle}
        </h1>
      </div>
      <div className="eduwatt-topbar-actions" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <div
          className="eduwatt-school-pill"
          style={{
            fontSize: 11,
            fontWeight: 400,
            color: "var(--text-secondary)",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "5px 12px",
            maxWidth: 180,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {schoolName}
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
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{t("topbar.live")}</span>
        </div>
        <MiniApps />
        <button
          type="button"
          onClick={() => setLang(lang === "en" ? "uz" : "en")}
          aria-label="Toggle language"
          style={{
            background: "#1a1a1a",
            border: `1px solid ${lang === "uz" ? "#C8FF00" : "#1e1e1e"}`,
            borderRadius: 20,
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 600,
            color: lang === "uz" ? "#C8FF00" : "#f0ede6",
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.3px",
          }}
        >
          {lang === "uz" ? "UZ" : "EN"}
        </button>
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
          {theme === "dark" ? (t("topbar.theme.dark") as string) : (t("topbar.theme.light") as string)}
        </button>
        <button
          type="button"
          onClick={() => signOut()}
          aria-label="Sign out"
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
          Sign out
        </button>
      </div>
    </header>
  );
}

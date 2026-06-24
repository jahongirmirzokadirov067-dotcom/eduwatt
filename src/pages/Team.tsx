import Shell from "@/components/eduwatt/Shell";
import { useLanguage } from "@/context/LanguageContext";
import jahongirAsset from "@/assets/jahongirmirzo.jpg.asset.json";
import azizbekIAsset from "@/assets/azizbek-ibrohimov.jpg.asset.json";
import azizbekTAsset from "@/assets/azizbek-toshpolatov.jpg.asset.json";

type Member = {
  name: string;
  role: string;
  roleColor: string;
  photo?: string;
  photoPosition?: string;
  initials: string;
  bio: string;
};

const members: Member[] = [
  {
    name: "Jahongirmirzo Qodirov",
    role: "Team Lead",
    roleColor: "#C8FF00",
    photo: jahongirAsset.url,
    photoPosition: "center 20%",
    initials: "JQ",
    bio: "Leads vision, product strategy, and engineering direction for EduWatt.",
  },
  {
    name: "Azizbek Ibrohimov",
    role: "Business",
    roleColor: "#60a5fa",
    photo: azizbekIAsset.url,
    photoPosition: "center 18%",
    initials: "AI",
    bio: "Drives partnerships, go-to-market, and stakeholder relations.",
  },
  {
    name: "Azizbek Toshpo'latov",
    role: "UI / UX",
    roleColor: "#c084fc",
    photo: azizbekTAsset.url,
    photoPosition: "center 22%",
    initials: "AT",
    bio: "Crafts the visual language and seamless user experience.",
  },
];

function PlaceholderAvatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 42,
        fontWeight: 700,
        letterSpacing: "-1px",
        color: "#fff",
        background: `radial-gradient(circle at 30% 30%, ${color}, color-mix(in srgb, ${color} 40%, #1a1a1a))`,
      }}
    >
      {initials}
    </div>
  );
}

function MemberCard({ m, i }: { m: Member; i: number }) {
  return (
    <div
      className="ew-team-card"
      style={{
        animation: `ew-team-in 0.6s ${i * 0.12}s both ease-out`,
      }}
    >
      <div className="ew-team-glow" aria-hidden />
      <div className="ew-team-corner" aria-hidden />

      <div className="ew-team-avatar-wrap">
        <div className="ew-team-avatar-ring" aria-hidden />
        <div className="ew-team-avatar">
          {m.photo ? (
            <img
              src={m.photo}
              alt={m.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: m.photoPosition ?? "center", borderRadius: "50%" }}
            />
          ) : (
            <PlaceholderAvatar initials={m.initials} color={m.roleColor} />
          )}
        </div>
      </div>

      <h3
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: "var(--text-primary)",
          margin: "20px 0 8px",
          textAlign: "center",
          letterSpacing: "-0.3px",
        }}
      >
        {m.name}
      </h3>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <span
          style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.4px",
            textTransform: "uppercase",
            color: m.roleColor,
            background: `color-mix(in srgb, ${m.roleColor} 14%, transparent)`,
            border: `1px solid color-mix(in srgb, ${m.roleColor} 35%, transparent)`,
          }}
        >
          {m.role}
        </span>
      </div>

      <p
        style={{
          fontSize: 13,
          lineHeight: 1.55,
          color: "var(--text-muted)",
          textAlign: "center",
          margin: 0,
          padding: "0 8px",
        }}
      >
        {m.bio}
      </p>
    </div>
  );
}

export default function Team() {
  useLanguage();
  return (
    <Shell title="Team">
      <style>{`
        @keyframes ew-team-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ew-team-underline {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes ew-team-ring {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .ew-team-header h1 {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.8px;
          color: var(--text-primary);
          margin: 0;
        }
        .ew-team-underline {
          height: 3px;
          width: 64px;
          margin-top: 10px;
          background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 30%, transparent));
          border-radius: 2px;
          transform-origin: left center;
          animation: ew-team-underline 0.8s 0.2s both cubic-bezier(.4,0,.2,1);
        }
        .ew-team-subtitle {
          color: var(--text-muted);
          font-size: 14px;
          margin-top: 12px;
          max-width: 560px;
          line-height: 1.55;
        }

        .ew-team-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 8px;
        }
        @media (max-width: 900px) {
          .ew-team-grid { grid-template-columns: 1fr; }
        }

        .ew-team-card {
          position: relative;
          padding: 32px 24px 28px;
          border-radius: 20px;
          background: linear-gradient(160deg,
            var(--bg-surface) 0%,
            color-mix(in srgb, var(--bg-surface) 88%, var(--accent) 4%) 100%);
          border: 1px solid var(--border);
          overflow: hidden;
          transition: transform .35s cubic-bezier(.4,0,.2,1),
                      box-shadow .35s cubic-bezier(.4,0,.2,1),
                      border-color .35s ease;
          isolation: isolate;
        }
        .ew-team-card:hover {
          transform: translateY(-8px);
          border-color: color-mix(in srgb, var(--accent) 55%, var(--border));
          box-shadow:
            0 30px 60px -20px color-mix(in srgb, var(--accent) 28%, transparent),
            0 18px 40px -18px rgba(0,0,0,0.45);
        }
        .ew-team-card:hover .ew-team-glow { opacity: 1; }
        .ew-team-card:hover .ew-team-avatar-ring {
          opacity: 1;
          animation: ew-team-ring 6s linear infinite;
        }

        .ew-team-glow {
          position: absolute;
          inset: -1px;
          border-radius: 20px;
          padding: 1px;
          background: conic-gradient(from 180deg at 50% 50%,
            transparent 0deg,
            color-mix(in srgb, var(--accent) 80%, transparent) 90deg,
            transparent 180deg,
            color-mix(in srgb, var(--accent) 55%, transparent) 270deg,
            transparent 360deg);
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
                  mask-composite: exclude;
          opacity: 0;
          transition: opacity .4s ease;
          pointer-events: none;
          z-index: 1;
        }
        .ew-team-corner {
          position: absolute;
          top: -80px; right: -80px;
          width: 220px; height: 220px;
          background: radial-gradient(circle, color-mix(in srgb, var(--accent) 18%, transparent), transparent 70%);
          z-index: 0;
          pointer-events: none;
        }

        .ew-team-avatar-wrap {
          position: relative;
          width: 128px; height: 128px;
          margin: 0 auto;
          z-index: 2;
        }
        .ew-team-avatar-ring {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          background: conic-gradient(
            var(--accent),
            color-mix(in srgb, var(--accent) 10%, transparent),
            var(--accent));
          opacity: 0.35;
          filter: blur(2px);
          transition: opacity .35s ease;
        }
        .ew-team-avatar {
          position: relative;
          width: 100%; height: 100%;
          border-radius: 50%;
          overflow: hidden;
          background: var(--bg-elevated);
          border: 2px solid color-mix(in srgb, var(--accent) 40%, var(--border));
          box-shadow:
            0 12px 30px -10px rgba(0,0,0,0.5),
            inset 0 0 0 2px var(--bg-surface);
        }
      `}</style>

      <div className="ew-team-header" style={{ marginBottom: 8 }}>
        <h1>Meet the Team</h1>
        <div className="ew-team-underline" />
        <p className="ew-team-subtitle">
          The people building EduWatt — turning sunlight, data, and design into measurable impact for schools.
        </p>
      </div>

      <div className="ew-team-grid">
        {members.map((m, i) => (
          <MemberCard key={m.name} m={m} i={i} />
        ))}
      </div>
    </Shell>
  );
}

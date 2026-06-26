import Sidebar from "@/components/eduwatt/Sidebar";
import Topbar from "@/components/eduwatt/Topbar";
import MiniApps from "@/components/eduwatt/MiniApps";
import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function Shell({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-app)" }}>
      <div className={`eduwatt-print-hide eduwatt-sidebar-wrap ${open ? "is-open" : ""}`}>
        <Sidebar onNavigate={() => setOpen(false)} />
      </div>
      <div
        className={`eduwatt-sidebar-overlay ${open ? "is-open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div className="eduwatt-print-hide">
          <Topbar title={title} onMenuClick={() => setOpen(true)} />
        </div>
        <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, flex: 1, position: "relative" }}>
          {children}
          <div
            style={{
              position: "sticky",
              bottom: 20,
              marginTop: "auto",
              marginLeft: "auto",
              marginRight: 0,
              alignSelf: "flex-end",
              width: "fit-content",
              zIndex: 40,
              pointerEvents: "auto",
            }}
          >
            <MiniApps />
          </div>
        </main>
      </div>
    </div>
  );
}

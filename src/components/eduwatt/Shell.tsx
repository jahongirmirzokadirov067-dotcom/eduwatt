import Sidebar from "@/components/eduwatt/Sidebar";
import Topbar from "@/components/eduwatt/Topbar";
import { ReactNode } from "react";

export default function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-app)" }}>
      <div className="eduwatt-print-hide">
        <Sidebar />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div className="eduwatt-print-hide">
          <Topbar title={title} />
        </div>
        <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

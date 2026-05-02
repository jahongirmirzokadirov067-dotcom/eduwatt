import Sidebar from "@/components/eduwatt/Sidebar";
import Topbar from "@/components/eduwatt/Topbar";
import KpiRow from "@/components/eduwatt/KpiRow";
import ChartsRow from "@/components/eduwatt/ChartsRow";
import BottomRow from "@/components/eduwatt/BottomRow";

const Index = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-app)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar />
        <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <KpiRow />
          <ChartsRow />
          <BottomRow />
        </main>
      </div>
    </div>
  );
};

export default Index;

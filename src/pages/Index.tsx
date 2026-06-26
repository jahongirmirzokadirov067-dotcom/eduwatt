import { useNavigate } from "react-router-dom";
import Shell from "@/components/eduwatt/Shell";
import KpiRow from "@/components/eduwatt/KpiRow";
import ChartsRow from "@/components/eduwatt/ChartsRow";
import AlertsCard from "@/components/eduwatt/AlertsCard";
import TopRecommendationsCard from "@/components/eduwatt/TopRecommendationsCard";
import { useLanguage } from "@/context/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const askAi = (prompt: string) => {
    navigate(`/ai-analysis?prompt=${encodeURIComponent(prompt)}`);
  };
  const showAll = () =>
    navigate(
      `/ai-analysis?prompt=${encodeURIComponent(
        "Show all current recommendations grouped by priority, with projected savings and CO₂ for each.",
      )}`,
    );

  return (
    <Shell title={t("topbar.title.overview") as string}>
      <KpiRow />
      <ChartsRow />
      <div className="ew-overview-grid" style={{
        display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)",
        gap: 16, alignItems: "start",
      }}>
        <AlertsCard />
        <TopRecommendationsCard onAsk={askAi} onShowAll={showAll} />
      </div>
    </Shell>
  );
};

export default Index;

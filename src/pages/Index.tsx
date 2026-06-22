import Shell from "@/components/eduwatt/Shell";
import KpiRow from "@/components/eduwatt/KpiRow";
import ChartsRow from "@/components/eduwatt/ChartsRow";
import BottomRow from "@/components/eduwatt/BottomRow";
import { useLanguage } from "@/context/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  return (
    <Shell title={t("topbar.title.overview") as string}>
      <KpiRow />
      <ChartsRow />
      <BottomRow />
    </Shell>
  );
};

export default Index;
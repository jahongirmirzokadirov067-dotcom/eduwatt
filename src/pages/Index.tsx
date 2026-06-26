import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Shell from "@/components/eduwatt/Shell";
import KpiRow from "@/components/eduwatt/KpiRow";
import ChartsRow from "@/components/eduwatt/ChartsRow";
import AiAnalysisPanel, { type AiAnalysisHandle } from "@/components/eduwatt/AiAnalysisPanel";
import AlertsCard from "@/components/eduwatt/AlertsCard";
import TopRecommendationsCard from "@/components/eduwatt/TopRecommendationsCard";
import RecentChatsCard from "@/components/eduwatt/RecentChatsCard";
import { useLanguage } from "@/context/LanguageContext";
import { useChatThreads } from "@/hooks/useChatThreads";

const Index = () => {
  const { t } = useLanguage();
  const [params, setParams] = useSearchParams();
  const { threads, createThread, deleteThread, touchThread } = useChatThreads();
  const aiRef = useRef<AiAnalysisHandle>(null);

  const activeId = params.get("thread");

  // Auto-select most recent if none chosen
  useEffect(() => {
    if (!activeId && threads.length) {
      setParams({ thread: threads[0].id }, { replace: true });
    }
  }, [activeId, threads, setParams]);

  const handleNew = async () => {
    const t = await createThread();
    if (t) setParams({ thread: t.id });
  };

  const handleCreateForSend = async (): Promise<string | null> => {
    if (activeId) return activeId;
    const t = await createThread();
    if (t) { setParams({ thread: t.id }); return t.id; }
    return null;
  };

  const handleSelect = (id: string) => setParams({ thread: id });
  const handleDelete = async (id: string) => {
    await deleteThread(id);
    if (id === activeId) setParams({}, { replace: true });
  };

  const askAi = (prompt: string) => aiRef.current?.send(prompt);

  return (
    <Shell title={t("topbar.title.overview") as string}>
      <KpiRow />
      <ChartsRow />
      <div className="ew-overview-grid" style={{
        display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)",
        gap: 16, alignItems: "start",
      }}>
        <AiAnalysisPanel
          ref={aiRef}
          threadId={activeId}
          onCreateThread={handleCreateForSend}
          onTouchThread={touchThread}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <AlertsCard />
          <TopRecommendationsCard
            onAsk={askAi}
            onShowAll={() => askAi("Show all current recommendations grouped by priority, with projected savings and CO₂ for each.")}
          />
          <RecentChatsCard
            threads={threads}
            activeId={activeId}
            onSelect={handleSelect}
            onNew={handleNew}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </Shell>
  );
};

export default Index;

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Shell from "@/components/eduwatt/Shell";
import AiAnalysisPanel, { type AiAnalysisHandle } from "@/components/eduwatt/AiAnalysisPanel";
import { useChatThreads, type ChatThread } from "@/hooks/useChatThreads";
import { useLanguage } from "@/context/LanguageContext";

function groupThreads(threads: ChatThread[]) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const groups: Record<string, ChatThread[]> = {
    Today: [], Yesterday: [], "Last 7 days": [], "Last 30 days": [], Older: [],
  };
  for (const t of threads) {
    const ts = new Date(t.updated_at).getTime();
    if (ts >= startOfDay) groups.Today.push(t);
    else if (ts >= startOfDay - dayMs) groups.Yesterday.push(t);
    else if (ts >= startOfDay - 7 * dayMs) groups["Last 7 days"].push(t);
    else if (ts >= startOfDay - 30 * dayMs) groups["Last 30 days"].push(t);
    else groups.Older.push(t);
  }
  return groups;
}

export default function AiAnalysis() {
  const { t } = useLanguage();
  const [params, setParams] = useSearchParams();
  const { threads, createThread, deleteThread, renameThread, touchThread } = useChatThreads();
  const aiRef = useRef<AiAnalysisHandle>(null);
  const [query, setQuery] = useState("");
  const [pinned, setPinned] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("ew.pinnedThreads") ?? "[]")); }
    catch { return new Set(); }
  });
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const activeId = params.get("thread");
  const promptParam = params.get("prompt");

  // Auto-select latest thread
  useEffect(() => {
    if (!activeId && threads.length && !promptParam) {
      const next = new URLSearchParams(params);
      next.set("thread", threads[0].id);
      setParams(next, { replace: true });
    }
  }, [activeId, threads, promptParam, params, setParams]);

  // Handle preloaded prompt from anywhere in the app
  const sentPromptRef = useRef<string | null>(null);
  useEffect(() => {
    if (!promptParam || sentPromptRef.current === promptParam) return;
    sentPromptRef.current = promptParam;
    const timer = setTimeout(() => {
      aiRef.current?.send(promptParam);
      const next = new URLSearchParams(params);
      next.delete("prompt");
      setParams(next, { replace: true });
    }, 250);
    return () => clearTimeout(timer);
  }, [promptParam, params, setParams]);

  const handleNew = async () => {
    const th = await createThread();
    if (th) {
      const next = new URLSearchParams();
      next.set("thread", th.id);
      setParams(next);
    }
  };
  const handleCreateForSend = async (): Promise<string | null> => {
    if (activeId) return activeId;
    const th = await createThread();
    if (th) {
      const next = new URLSearchParams(params);
      next.set("thread", th.id);
      setParams(next, { replace: true });
      return th.id;
    }
    return null;
  };
  const handleSelect = (id: string) => {
    const next = new URLSearchParams();
    next.set("thread", id);
    setParams(next);
  };
  const handleDelete = async (id: string) => {
    await deleteThread(id);
    if (id === activeId) setParams({}, { replace: true });
  };
  const togglePin = (id: string) => {
    setPinned((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("ew.pinnedThreads", JSON.stringify([...next]));
      return next;
    });
  };
  const submitRename = async (id: string) => {
    if (renameValue.trim()) await renameThread(id, renameValue.trim());
    setRenamingId(null);
    setRenameValue("");
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((th) =>
      th.title.toLowerCase().includes(q) || (th.last_message ?? "").toLowerCase().includes(q),
    );
  }, [threads, query]);

  const pinnedThreads = filtered.filter((th) => pinned.has(th.id));
  const unpinnedThreads = filtered.filter((th) => !pinned.has(th.id));
  const grouped = groupThreads(unpinnedThreads);

  return (
    <Shell title="AI Analysis">
      <div className="ew-ai-layout" style={{
        display: "grid", gridTemplateColumns: "minmax(220px, 22%) 1fr",
        gap: 16, alignItems: "stretch", minHeight: "calc(100vh - 140px)",
      }}>
        {/* Conversation history */}
        <aside style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: 14, padding: 14, display: "flex", flexDirection: "column",
          gap: 10, minHeight: 0,
        }}>
          <button
            onClick={handleNew}
            style={{
              padding: "10px 12px", borderRadius: 10, border: "1px solid var(--accent)",
              background: "var(--accent)", color: "var(--accent-text)",
              fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            + New chat
          </button>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations…"
            style={{
              padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)",
              background: "var(--bg-app)", color: "var(--text-primary)",
              fontSize: 12, fontFamily: "inherit", outline: "none",
            }}
          />
          <div style={{ overflowY: "auto", flex: 1, marginRight: -6, paddingRight: 6 }}>
            {pinnedThreads.length > 0 && (
              <ThreadGroup
                label="Pinned"
                threads={pinnedThreads}
                activeId={activeId}
                pinned={pinned}
                onSelect={handleSelect}
                onDelete={handleDelete}
                onPin={togglePin}
                onStartRename={(id, title) => { setRenamingId(id); setRenameValue(title); }}
                renamingId={renamingId}
                renameValue={renameValue}
                setRenameValue={setRenameValue}
                onSubmitRename={submitRename}
              />
            )}
            {Object.entries(grouped).map(([label, list]) =>
              list.length === 0 ? null : (
                <ThreadGroup
                  key={label}
                  label={label}
                  threads={list}
                  activeId={activeId}
                  pinned={pinned}
                  onSelect={handleSelect}
                  onDelete={handleDelete}
                  onPin={togglePin}
                  onStartRename={(id, title) => { setRenamingId(id); setRenameValue(title); }}
                  renamingId={renamingId}
                  renameValue={renameValue}
                  setRenameValue={setRenameValue}
                  onSubmitRename={submitRename}
                />
              ),
            )}
            {threads.length === 0 && (
              <div style={{ fontSize: 12, color: "var(--text-meta)", padding: "8px 4px" }}>
                No conversations yet. Click <strong>+ New chat</strong> to start.
              </div>
            )}
          </div>
        </aside>

        {/* Chat workspace */}
        <div style={{ minHeight: 0 }}>
          <AiAnalysisPanel
            ref={aiRef}
            threadId={activeId}
            onCreateThread={handleCreateForSend}
            onTouchThread={touchThread}
          />
        </div>
      </div>
    </Shell>
  );
}

function ThreadGroup(props: {
  label: string;
  threads: ChatThread[];
  activeId: string | null;
  pinned: Set<string>;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  onStartRename: (id: string, title: string) => void;
  renamingId: string | null;
  renameValue: string;
  setRenameValue: (v: string) => void;
  onSubmitRename: (id: string) => void;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: "var(--text-faint)",
        textTransform: "uppercase", letterSpacing: "0.6px",
        padding: "6px 6px 4px",
      }}>
        {props.label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {props.threads.map((th) => {
          const isActive = th.id === props.activeId;
          const isRenaming = props.renamingId === th.id;
          return (
            <div
              key={th.id}
              onClick={() => !isRenaming && props.onSelect(th.id)}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "8px 8px", borderRadius: 8,
                background: isActive ? "var(--bg-elevated)" : "transparent",
                border: `1px solid ${isActive ? "var(--border)" : "transparent"}`,
                cursor: "pointer",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                {isRenaming ? (
                  <input
                    autoFocus
                    value={props.renameValue}
                    onChange={(e) => props.setRenameValue(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") props.onSubmitRename(th.id);
                      if (e.key === "Escape") props.onStartRename("", "");
                    }}
                    onBlur={() => props.onSubmitRename(th.id)}
                    style={{
                      width: "100%", padding: "4px 6px", borderRadius: 6,
                      border: "1px solid var(--accent)", background: "var(--bg-app)",
                      color: "var(--text-primary)", fontSize: 12, fontFamily: "inherit", outline: "none",
                    }}
                  />
                ) : (
                  <>
                    <div style={{
                      fontSize: 12, fontWeight: 600, color: "var(--text-primary)",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {props.pinned.has(th.id) ? "📌 " : ""}{th.title}
                    </div>
                    {th.last_message && (
                      <div style={{
                        fontSize: 10, color: "var(--text-faint)", marginTop: 2,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {th.last_message}
                      </div>
                    )}
                  </>
                )}
              </div>
              {!isRenaming && (
                <div style={{ display: "flex", gap: 2 }}>
                  <IconBtn label="Pin" onClick={(e) => { e.stopPropagation(); props.onPin(th.id); }}>
                    {props.pinned.has(th.id) ? "★" : "☆"}
                  </IconBtn>
                  <IconBtn label="Rename" onClick={(e) => { e.stopPropagation(); props.onStartRename(th.id, th.title); }}>
                    ✎
                  </IconBtn>
                  <IconBtn label="Delete" onClick={(e) => { e.stopPropagation(); props.onDelete(th.id); }}>
                    ×
                  </IconBtn>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, label }: {
  children: React.ReactNode; onClick: (e: React.MouseEvent) => void; label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        background: "none", border: "none", color: "var(--text-faint)",
        cursor: "pointer", padding: 2, fontSize: 13, lineHeight: 1, fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

import { ChatThread } from "@/hooks/useChatThreads";

interface Props {
  threads: ChatThread[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export default function RecentChatsCard({ threads, activeId, onSelect, onNew, onDelete }: Props) {
  return (
    <div style={{
      background: "var(--bg-surface)", border: "1px solid var(--border)",
      borderRadius: 14, padding: 18,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.3px" }}>
          RECENT CHATS
        </div>
        <button
          onClick={onNew}
          style={{
            fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
            border: "1px solid var(--border)", background: "transparent",
            color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          + New
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 280, overflowY: "auto" }}>
        {threads.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--text-meta)", padding: "6px 0" }}>
            No conversations yet.
          </div>
        ) : (
          threads.map((t) => {
            const isActive = t.id === activeId;
            return (
              <div
                key={t.id}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 10px", borderRadius: 8,
                  background: isActive ? "var(--bg-elevated)" : "transparent",
                  border: `1px solid ${isActive ? "var(--border)" : "transparent"}`,
                  cursor: "pointer",
                }}
                onClick={() => onSelect(t.id)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12, fontWeight: 600, color: "var(--text-primary)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {t.title}
                  </div>
                  {t.last_message && (
                    <div style={{
                      fontSize: 10, color: "var(--text-faint)", marginTop: 2,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {t.last_message}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}
                  aria-label="Delete chat"
                  style={{
                    background: "none", border: "none", color: "var(--text-faint)",
                    cursor: "pointer", padding: 4, fontSize: 14,
                  }}
                >
                  ×
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

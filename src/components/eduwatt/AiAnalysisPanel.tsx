import { useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from "react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useSchoolData } from "@/hooks/useSchoolData";
import { useSolarData } from "@/hooks/useSolarData";
import { useAlerts } from "@/hooks/useAlerts";
import { useAiRecommendations } from "@/hooks/useAiRecommendations";
import { buildDashboardContext } from "@/lib/aiContext";
import { useThreadMessages, type ChatMessage } from "@/hooks/useChatThreads";

export interface AiAnalysisHandle {
  send: (text: string) => void;
}

interface Props {
  threadId: string | null;
  onCreateThread: () => Promise<string | null>;
  onTouchThread: (id: string, lastMessage: string) => void;
}

const QUICK_ACTIONS = [
  { label: "Explain", prompt: "Explain the main causes of today's energy usage in plain language." },
  { label: "Generate Report", prompt: "Generate a concise daily energy report with usage, solar, savings, and CO₂." },
  { label: "Show Recommendations", prompt: "Show all current recommendations grouped by priority." },
  { label: "Predict Tomorrow", prompt: "Predict tomorrow's solar generation and grid consumption based on recent trends." },
];

function MessageBubble({ msg, onCopy, onRegenerate, onFeedback, isLast }: {
  msg: ChatMessage; onCopy: () => void; onRegenerate?: () => void;
  onFeedback?: (v: 1 | -1) => void; isLast: boolean;
}) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: isUser ? "flex-end" : "flex-start",
      gap: 4, animation: "fade-in 0.3s ease-out",
    }}>
      <div style={{
        fontSize: 10, fontWeight: 600, color: "var(--text-faint)",
        textTransform: "uppercase", letterSpacing: "0.6px",
      }}>
        {isUser ? "You" : "Energy AI"}
      </div>
      <div style={{
        maxWidth: "92%",
        padding: isUser ? "10px 14px" : "0",
        background: isUser ? "var(--accent)" : "transparent",
        color: isUser ? "var(--accent-text)" : "var(--text-primary)",
        borderRadius: 12,
        fontSize: 13, lineHeight: 1.55,
      }}>
        {isUser ? (
          <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
        ) : (
          <div className="ew-markdown">
            <ReactMarkdown>{msg.content || "…"}</ReactMarkdown>
          </div>
        )}
      </div>
      {!isUser && isLast && msg.content && (
        <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
          <button onClick={onCopy} style={iconBtn} aria-label="Copy">Copy</button>
          {onRegenerate && <button onClick={onRegenerate} style={iconBtn}>Regenerate</button>}
          {onFeedback && <button onClick={() => onFeedback(1)} style={iconBtn}>👍</button>}
          {onFeedback && <button onClick={() => onFeedback(-1)} style={iconBtn}>👎</button>}
        </div>
      )}
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 6,
  border: "1px solid var(--border)", background: "transparent",
  color: "var(--text-meta)", cursor: "pointer", fontFamily: "inherit",
};

function extractFollowups(text: string): string[] {
  const m = text.match(/\*\*Follow-?ups?:?\*\*\s*([\s\S]*)$/i);
  if (!m) return [];
  return m[1]
    .split("\n")
    .map((l) => l.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter((l) => l.length > 4 && l.length < 120)
    .slice(0, 3);
}

const AiAnalysisPanel = forwardRef<AiAnalysisHandle, Props>(function AiAnalysisPanel(
  { threadId, onCreateThread, onTouchThread }, ref,
) {
  const { session } = useAuth();
  const { profile, latest, records } = useSchoolData();
  const { data: solar } = useSolarData();
  const { alerts } = useAlerts();
  const { items: recs } = useAiRecommendations();

  const { messages, append, setMessages } = useThreadMessages(threadId);
  const [streaming, setStreaming] = useState(false);
  const [streamBuf, setStreamBuf] = useState("");
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const ctx = useMemo(
    () => buildDashboardContext({ profile, records, latest, solar, alerts, recs }),
    [profile, records, latest, solar, alerts, recs],
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamBuf]);

  const runStream = async (history: { role: "user" | "assistant" | "system"; content: string }[], targetThreadId: string) => {
    setStreaming(true);
    setStreamBuf("");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ messages: history, context: ctx }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const t = await res.text().catch(() => "");
        throw new Error(`AI error ${res.status}: ${t.slice(0, 120)}`);
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setStreamBuf(acc);
      }
      // Persist assistant message
      await append("assistant", acc);
      onTouchThread(targetThreadId, acc.slice(0, 140));
      setStreamBuf("");
    } catch (e: any) {
      const errText = `_Sorry — the AI request failed: ${e?.message ?? "unknown error"}._`;
      await append("assistant", errText);
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const sendPrompt = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    let tid = threadId;
    if (!tid) {
      tid = await onCreateThread();
      if (!tid) return;
    }
    setInput("");
    // Optimistic user message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(), thread_id: tid, role: "user",
      content: trimmed, created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    await append("user", trimmed);
    const history = [...messages, userMsg].map((m) => ({ role: m.role as any, content: m.content }));
    await runStream(history, tid);
  };

  useImperativeHandle(ref, () => ({ send: sendPrompt }), [threadId, messages, streaming, ctx]);

  const isEmpty = !messages.length && !streaming && !streamBuf;
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const followups = lastAssistant ? extractFollowups(lastAssistant.content) : [];

  const handleRegenerate = async () => {
    if (!threadId || streaming) return;
    // Remove last assistant, re-run
    const lastIdx = [...messages].map((m) => m.role).lastIndexOf("assistant");
    if (lastIdx < 0) return;
    const trimmed = messages.slice(0, lastIdx);
    setMessages(trimmed);
    const history = trimmed.map((m) => ({ role: m.role as any, content: m.content }));
    await runStream(history, threadId);
  };

  return (
    <div style={{
      background: "var(--bg-surface)", border: "1px solid var(--border)",
      borderRadius: 16, display: "flex", flexDirection: "column",
      minHeight: 560, maxHeight: 720, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px", borderBottom: "1px solid var(--border-soft)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 8,
              background: "linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 60%, transparent))",
              display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-text)",
              fontSize: 13, fontWeight: 800,
            }}>✦</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>AI Analysis</div>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-meta)", marginTop: 2 }}>
            Energy AI Assistant
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 999,
            background: "color-mix(in srgb, var(--co2-color) 15%, transparent)",
            color: "var(--co2-color)", display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--co2-color)" }} />
            Connected
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 999,
            background: "var(--bg-elevated)", color: "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}>
            {ctx.schoolName}
          </span>
        </div>
      </div>

      {/* Conversation */}
      <div ref={scrollRef} style={{
        flex: 1, padding: "20px", overflowY: "auto",
        display: "flex", flexDirection: "column", gap: 18,
      }}>
        {isEmpty && (
          <div style={{
            display: "flex", flexDirection: "column", gap: 14,
            padding: "8px 4px",
          }}>
            <div style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6 }}>
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}. I'm your Energy AI Assistant for <strong>{ctx.schoolName}</strong>.
              <div style={{ marginTop: 8 }}>
                I have live context on today's solar ({ctx.today.solar_generated_kwh} kWh), grid usage, alerts, and recommendations. Ask anything — or start with:
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.label}
                  onClick={() => sendPrompt(a.prompt)}
                  style={{
                    fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 999,
                    border: "1px solid var(--border)", background: "var(--bg-elevated)",
                    color: "var(--text-primary)", cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <MessageBubble
            key={m.id}
            msg={m}
            isLast={i === messages.length - 1 && !streaming}
            onCopy={() => navigator.clipboard.writeText(m.content)}
            onRegenerate={m.role === "assistant" ? handleRegenerate : undefined}
            onFeedback={m.role === "assistant" ? () => {} : undefined}
          />
        ))}

        {streaming && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
              Energy AI
            </div>
            <div className="ew-markdown" style={{ fontSize: 13, lineHeight: 1.55, color: "var(--text-primary)" }}>
              {streamBuf ? <ReactMarkdown>{streamBuf}</ReactMarkdown> : (
                <span style={{ color: "var(--text-meta)", fontStyle: "italic" }}>Thinking…</span>
              )}
            </div>
          </div>
        )}

        {followups.length > 0 && !streaming && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: -8 }}>
            {followups.map((q, i) => (
              <button key={i} onClick={() => sendPrompt(q)} style={{
                fontSize: 11, fontWeight: 500, padding: "6px 10px", borderRadius: 999,
                border: "1px dashed var(--border)", background: "transparent",
                color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit",
              }}>
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <div style={{
        padding: "12px 16px", borderTop: "1px solid var(--border-soft)",
        display: "flex", gap: 8, alignItems: "flex-end",
      }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendPrompt(input);
            }
          }}
          placeholder="Ask anything about your building…"
          rows={1}
          style={{
            flex: 1, resize: "none", minHeight: 40, maxHeight: 140,
            padding: "10px 14px", borderRadius: 10,
            background: "var(--bg-app)", border: "1px solid var(--border)",
            color: "var(--text-primary)", fontSize: 13, fontFamily: "inherit", outline: "none",
            lineHeight: 1.4,
          }}
        />
        <button
          onClick={() => sendPrompt(input)}
          disabled={streaming || !input.trim()}
          style={{
            padding: "10px 18px", borderRadius: 10, border: "none",
            background: streaming || !input.trim() ? "var(--bg-elevated)" : "var(--accent)",
            color: streaming || !input.trim() ? "var(--text-meta)" : "var(--accent-text)",
            fontSize: 13, fontWeight: 700, cursor: streaming ? "wait" : "pointer", fontFamily: "inherit",
          }}
        >
          {streaming ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
});

export default AiAnalysisPanel;

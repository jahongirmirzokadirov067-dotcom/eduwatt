
# Overview Redesign — AI-Centric Energy Platform

Transform `/` (Overview) so the AI Assistant becomes the centerpiece. Dashboard widgets become supporting context. Alerts stop stretching. Mini Apps launcher gets bigger and stays sticky inside content.

## New Overview Layout

```text
┌─────────────────────────────────────────────────────────────┐
│ KpiRow (unchanged)                                          │
├─────────────────────────────────────────────────────────────┤
│ ChartsRow (unchanged)                                       │
├──────────────────────────────┬──────────────────────────────┤
│ AI ANALYSIS (2/3 width)      │ RIGHT COLUMN (1/3 width)     │
│  - Header: status, project   │  ┌────────────────────────┐  │
│  - Conversation thread       │  │ Active Alerts          │  │
│  - Suggested action chips    │  │ (max-height 300px,     │  │
│  - Composer (Ask anything…)  │  │  no stretch, "View all │  │
│                              │  │  alerts (X)" link)     │  │
│                              │  └────────────────────────┘  │
│                              │  ┌────────────────────────┐  │
│                              │  │ Top Recommendations    │  │
│                              │  │ (2–3 max, Implement /  │  │
│                              │  │  Ask AI, "View all →") │  │
│                              │  └────────────────────────┘  │
│                              │  ┌────────────────────────┐  │
│                              │  │ Recent Chats           │  │
│                              │  │ (list, click reopens)  │  │
│                              │  └────────────────────────┘  │
└──────────────────────────────┴──────────────────────────────┘
```

Stacks vertically on mobile. Existing `KpiRow` / `ChartsRow` untouched.

## 1. Active Alerts fix
- Rebuild the alerts card as a standalone component with `max-height: 300px`, no flex-stretch, internal scroll only if needed.
- Show first 3 unresolved compactly; footer link `View all alerts (X) →` routes to `/alerts`.

## 2 + 3. AI Analysis chat (replaces RecommendationsPanel)
- New component `AiAnalysisPanel.tsx` using AI Elements (`Conversation`, `Message`, `MessageResponse`, `PromptInput`, `PromptInputTextarea`, `PromptInputFooter`, `PromptInputSubmit`, `Shimmer`, `Tool`).
- Header row: title "AI Analysis", subtitle "Energy AI Assistant", status pill "Connected", project chip with school name from `useSchoolData`.
- Conversation streams from a new edge function `ai-chat` (Lovable AI Gateway, `google/gemini-3-flash-preview`, `streamText` + `toUIMessageStreamResponse`).
- Greeting on empty thread: AI auto-posts a 24h summary built from `useSchoolData` + `useSolarData` + `useAlerts` with the four quick-action chips: **Explain · Generate Report · Show Recommendations · Predict Tomorrow**.
- Suggested follow-up chips render after each assistant message (from a `suggestions` tool output or parsed tail).
- Per-message actions: copy, regenerate, thumbs up/down (feedback stored in `ai_message_feedback`).
- Markdown rendering via `MessageResponse`. Tool parts render via `Tool` (collapsed by default) for future tools (predict, report, benchmark, etc.).

## 4. Recent Chats + threads
- Sidebar card "Recent Chats" lists last ~8 threads (title, updated_at). Click → loads that thread into the panel.
- New button "New chat". Active thread id lives in URL search param `?thread=<id>` so reload restores it; keying `useChat` by thread id prevents bleed.
- DB tables (new migration, RLS + GRANTs per project rules):
  - `chat_threads (id uuid pk, user_id uuid, title text, project_ref text, created_at, updated_at)`
  - `chat_messages (id uuid pk, thread_id uuid fk, user_id uuid, role text, parts jsonb, created_at)`
  - `ai_message_feedback (id, message_id, user_id, rating, created_at)`
- Server persists user + assistant messages in `onFinish`. Titles auto-generated from first user message (truncated) and editable later.

## 5. Top Recommendations card
- New compact card showing top 2–3 active items from `useAiRecommendations` sorted by priority.
- Buttons: **Implement** (calls `setStatus(id,'implemented')`) and **Ask AI** (opens AI Analysis with prefilled `Explain recommendation: "<title>"`).
- Footer `View all recommendations →` opens AI Analysis and auto-sends `Show all current recommendations.` The existing recs hook stays the data source; the heavy `RecommendationsPanel` is removed from Overview (kept available elsewhere if needed, otherwise deleted).

## 6. Dashboard context for the AI
- Build a `buildDashboardContext()` helper that snapshots: profile (school, city, tariff, capacity), latest + last 7 monthly records, today's solar hourly totals, unresolved alerts, active zones, active recommendations, CO2/cost rollups.
- Sent as a `system` message prefix on every `ai-chat` request so the model always has live context — user never re-states the building.

## 7. Mini Apps launcher
- In `Shell.tsx`: keep `position: sticky; bottom: 20px` inside main scroll container (already done) and increase visual weight.
- In `MiniApps.tsx`: button ~56px (was ~44), larger icon, stronger shadow, brighter accent fill, subtle hover scale + glow animation.

## 8. AI experience polish
- Streaming via AI SDK (`useChat` + `DefaultChatTransport`), typing shimmer while `status==='submitted'|'streaming'`, smooth fade-in on new messages.
- Markdown, lists, tables via `MessageResponse`. Code blocks styled for technical reports.
- Copy / Regenerate / 👍 👎 actions on each assistant message. Suggested follow-ups as chips under the latest assistant turn.

## 9. Future-ready tools
- `ai-chat` edge function registers extensible tool slots (no-op stubs now, real implementations later): `generateReport`, `predictUsage`, `analyzeTrend`, `explainAlert`, `compareMonths`, `simulateRoi`. Tool calls render via AI Elements `Tool` so new capabilities appear inside the conversation without page redesigns.

## 10. Visual polish
- Surface: existing tokens; add subtle 1px border + soft inner highlight on the AI panel, rounded-2xl, restrained glass tint (`backdrop-filter: blur(8px)` over `var(--bg-surface)` at 92% opacity) — respects existing dark theme; light mode tested via `useTheme`.
- Consistent 16px gaps, 20–24px card padding.

## Technical details

**New / changed files**
- `src/components/eduwatt/AiAnalysisPanel.tsx` (new, AI Elements composer)
- `src/components/eduwatt/AlertsCard.tsx` (new, compact, capped 300px)
- `src/components/eduwatt/TopRecommendationsCard.tsx` (new)
- `src/components/eduwatt/RecentChatsCard.tsx` (new)
- `src/components/eduwatt/MiniApps.tsx` (resize + style)
- `src/components/eduwatt/Shell.tsx` (launcher size tweak only)
- `src/pages/Index.tsx` (new 2-column layout below existing KPI/Charts rows)
- `src/hooks/useChatThreads.ts` (new, Supabase CRUD + active thread)
- `src/lib/aiContext.ts` (new, snapshot builder)
- `supabase/functions/ai-chat/index.ts` (new, streamText + tools + persistence in `onFinish`)
- Supabase migration: `chat_threads`, `chat_messages`, `ai_message_feedback` with RLS + GRANTs
- Install AI Elements: `conversation`, `message`, `prompt-input`, `shimmer`, `tool`
- Remove `BottomRow.tsx` usage from `Index.tsx` (file kept for now in case referenced elsewhere; will delete if unused)

**Kept untouched:** `KpiRow`, `ChartsRow`, all other routes, design tokens, `Sidebar`, `Topbar`, translations structure (new keys added).

**Routing:** active chat thread reflected as `?thread=<id>` on `/`. No new top-level route.

**Out of scope (this pass):** real implementations of the future tools (stubs only), redesign of `/alerts` or `/reports` pages, changing existing KPI/Charts components.

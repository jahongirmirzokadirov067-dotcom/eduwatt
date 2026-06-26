import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-request-id",
};

const SYSTEM = `You are EduWatt's Energy AI Assistant, embedded inside a school energy management dashboard for a school in Tashkent, Uzbekistan.

Capabilities: answer questions about the building, explain data, generate reports, predict usage, analyze trends, explain alerts, recommend actions, compare historical performance.

Style:
- Concise, professional, enterprise-grade.
- Use markdown: short paragraphs, bullet lists, occasional tables.
- Always ground answers in the DASHBOARD CONTEXT provided. Cite numbers from it.
- Never ask the user which building — you always have current context.
- When relevant, end with 2-3 short suggested follow-up questions as a bullet list under a final "**Follow-ups:**" heading.

If the user greets you on an empty thread, give a 24h summary of usage, solar, grid, alerts, and 1 quick recommendation, then offer follow-ups.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { messages, context } = await req.json();
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) throw new Error("LOVABLE_API_KEY missing");

    const ctxBlock = context
      ? `\n\nDASHBOARD CONTEXT (live):\n\`\`\`json\n${JSON.stringify(context, null, 2)}\n\`\`\``
      : "";

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        stream: true,
        messages: [
          { role: "system", content: SYSTEM + ctxBlock },
          ...(messages ?? []),
        ],
      }),
    });

    if (res.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (res.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!res.ok || !res.body) {
      const t = await res.text();
      console.error("gateway error", res.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Re-stream as plain text deltas (newline-delimited)
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = "";

    const stream = new ReadableStream({
      async pull(controller) {
        const { value, done } = await reader.read();
        if (done) { controller.close(); return; }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") { controller.close(); return; }
          try {
            const json = JSON.parse(payload);
            const delta = json?.choices?.[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          } catch { /* skip */ }
        }
      },
      cancel() { reader.cancel(); },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
    });
  } catch (e) {
    console.error("ai-chat error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

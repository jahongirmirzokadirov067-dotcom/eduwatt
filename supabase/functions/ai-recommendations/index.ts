import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an energy efficiency analyst embedded in a school energy management dashboard called EduWatt. You receive real-time energy consumption and solar generation data from a school in Tashkent, Uzbekistan. Your task is to output exactly 3 actionable recommendations via the provided tool. Each recommendation must be specific to the data provided — never give generic advice.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const snapshot = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const userMsg = `Current energy data for ${snapshot.schoolName} on ${snapshot.date}:
- Solar generated today: ${snapshot.solarGeneratedKwh} kWh
- Grid consumed today: ${snapshot.gridConsumedKwh} kWh
- CO₂ avoided: ${snapshot.co2AvoidedKg} kg
- Active alerts: ${JSON.stringify((snapshot.activeAlerts || []).filter((a: any) => a.severity !== 'resolved'))}
- Zone consumption: ${JSON.stringify(snapshot.zoneConsumption)}
- Hourly solar curve: ${JSON.stringify(snapshot.hourlySolar)}

Generate 3 specific, data-driven recommendations to reduce grid dependency and eliminate the waste patterns visible in this data.`;

    const tool = {
      type: "function",
      function: {
        name: "emit_recommendations",
        description: "Return 3 actionable recommendations.",
        parameters: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              minItems: 3,
              maxItems: 3,
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                  category: { type: "string", enum: ["scheduling", "hardware", "storage", "behavioral", "maintenance"] },
                  title: { type: "string" },
                  detail: { type: "string" },
                  projectedSavingKwhPerDay: { type: "number" },
                  projectedCo2KgPerMonth: { type: "number" },
                  effort: { type: "string", enum: ["Low", "Medium", "High"] },
                },
                required: ["id", "priority", "category", "title", "detail", "projectedSavingKwhPerDay", "projectedCo2KgPerMonth", "effort"],
                additionalProperties: false,
              },
            },
          },
          required: ["recommendations"],
          additionalProperties: false,
        },
      },
    };

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMsg },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "emit_recommendations" } },
      }),
    });

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (aiRes.status === 402) {
      return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!aiRes.ok) {
      const text = await aiRes.text();
      console.error("AI gateway error", aiRes.status, text);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await aiRes.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    let recommendations: unknown = null;
    if (call?.function?.arguments) {
      try {
        const parsed = JSON.parse(call.function.arguments);
        recommendations = parsed.recommendations;
      } catch (e) {
        console.error("Failed to parse tool args", e);
      }
    }
    if (!recommendations) {
      // Fallback: try parsing assistant text content
      const txt = data?.choices?.[0]?.message?.content;
      if (typeof txt === "string") {
        try {
          const cleaned = txt.replace(/```json|```/g, "").trim();
          recommendations = JSON.parse(cleaned);
        } catch { /* ignore */ }
      }
    }

    if (!Array.isArray(recommendations)) {
      return new Response(JSON.stringify({ error: "Invalid AI response" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recommendations error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

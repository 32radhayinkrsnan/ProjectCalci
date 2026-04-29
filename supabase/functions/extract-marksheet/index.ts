import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You extract subjects from a student marksheet image or PDF page.
Return ONLY a JSON array (no prose, no markdown) of objects with this exact shape:
[{ "name": string, "credits": number, "grade": "O"|"A+"|"A"|"B+"|"B"|"C"|"U" }]
Rules:
- Map any letter grades to one of: O, A+, A, B+, B, C, U.
- If only marks/percentage are present, infer the closest grade (O>=91, A+>=81, A>=71, B+>=61, B>=56, C>=50, U<50).
- Credits must be a positive integer (default 3 if missing).
- Skip totals, GPA rows, and non-subject lines.
- Output strictly valid JSON. No backticks.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType } = await req.json();
    if (!imageBase64 || !mimeType) {
      return new Response(
        JSON.stringify({ error: "imageBase64 and mimeType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dataUrl = `data:${mimeType};base64,${imageBase64}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract subjects, credits and grades from this marksheet." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, errText);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Lovable Cloud settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI request failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "[]";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const match = cleaned.match(/\[[\s\S]*\]/);
    let subjects: any[] = [];
    try {
      subjects = JSON.parse(match ? match[0] : cleaned);
    } catch (e) {
      console.error("Parse error", e, raw);
      return new Response(JSON.stringify({ error: "Couldn't parse AI response", raw }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ subjects }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("extract-marksheet error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
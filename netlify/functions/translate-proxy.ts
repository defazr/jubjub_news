const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export default async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { texts, targetLang } = await req.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return new Response(JSON.stringify({ error: "texts array required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const langName = targetLang === "ko" ? "Korean" : "English";
    const numbered = texts.map((t: string, i: number) => `[${i}] ${t}`).join("\n");

    const prompt = `Translate the following news headlines and excerpts to ${langName}. Keep the same numbered format. Only output translations, no explanations.\n\n${numbered}`;

    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ error: `Gemini API error ${res.status}`, detail: errText }), {
        status: 502,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const data = await res.json();
    const raw =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse numbered responses
    const translations: string[] = [];
    const lines = raw.split("\n").filter((l: string) => l.trim());
    for (const line of lines) {
      const match = line.match(/^\[(\d+)\]\s*(.+)/);
      if (match) {
        translations[parseInt(match[1])] = match[2].trim();
      }
    }

    // Fill any missing with original
    const result = texts.map((t: string, i: number) => translations[i] || t);

    return new Response(JSON.stringify({ translations: result }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=600",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Translation failed" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
};

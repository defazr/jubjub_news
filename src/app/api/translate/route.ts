import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Read env var at request time, not module load time
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set. Available env keys:", Object.keys(process.env).filter(k => k.includes("GEMINI") || k.includes("gemini")));
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const { texts, targetLang } = await req.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: "texts array required" }, { status: 400 });
    }

    const langName = targetLang === "ko" ? "Korean" : "English";
    const numbered = texts
      .map((t: string, i: number) => `[${i}] ${t}`)
      .join("\n");

    const prompt = `Translate the following news headlines and excerpts to ${langName}. Keep the same numbered format. Only output translations, no explanations.\n\n${numbered}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
      return NextResponse.json(
        { error: `Gemini API error ${res.status}`, detail: errText },
        { status: 502 }
      );
    }

    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse numbered responses
    const translations: string[] = [];
    const lines = raw.split("\n").filter((l: string) => l.trim());
    for (const line of lines) {
      const match = line.match(/^\[?(\d+)\]?[.):\s]\s*(.+)/);
      if (match) {
        translations[parseInt(match[1])] = match[2].trim();
      }
    }

    // Fill missing with original
    const result = texts.map((t: string, i: number) => translations[i] || t);

    return NextResponse.json(
      { translations: result },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    );
  }
}

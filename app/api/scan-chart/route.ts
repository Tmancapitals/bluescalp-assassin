import { NextRequest, NextResponse } from "next/server";

const FALLBACK_MODELS = ["gemini-3.8-flash", "gemini-3.6-flash"];

export async function POST(req: NextRequest) {
  try {
    const { image, pair, timeframe, engines } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No chart image provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured on Vercel" }, { status: 500 });
    }

    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const mimeType = matches ? matches[1] : "image/jpeg";
    const base64Data = matches ? matches[2] : image;

    const prompt = `You are the BlueScalp Assassin institutional SMC (Smart Money Concepts) & ICT chart analyzer.
Analyze this trading chart screenshot for ${pair || "the visible asset"} (${timeframe || "visible timeframe"}).

CRITICAL INSTRUCTIONS:
1. Examine the candlestick price action and visible price scale on the right axis.
2. If price levels are clearly legible, calculate Entry, Stop Loss, and TP1-TP5 matching that exact scale.
3. If the chart is blurry, unreadable, or missing clear structure, set "direction" to "WAIT" and "grade" to "NO_SETUP".
4. Identify Break of Structure (BOS), Change of Character (CHoCH), or Fair Value Gaps (FVG).
5. Provide realistic confluence points describing only what is actually visible.

Return ONLY a valid JSON object matching this schema:
{
  "pair": "${pair || "ASSET"}",
  "timeframe": "${timeframe || "M5"}",
  "direction": "BUY",
  "grade": "SNIPER A+",
  "confidence": 88,
  "consensusScore": 90,
  "enginesAgreed": ["smc", "ict", "machine_gunner"],
  "entryPrice": "4195.50",
  "entryZone": "4193.00 - 4196.00",
  "stopLoss": "4188.00",
  "slPips": "25 pts",
  "tp1": "4205.00",
  "tp2": "4215.00",
  "tp3": "4228.00",
  "tp4": "4240.00",
  "tp5": "4255.00",
  "riskReward": "1:3.2",
  "invalidation": "4185.00",
  "confluences": [
    "Fair Value Gap (FVG) retest visible",
    "Liquidity swept below recent session low"
  ],
  "orderType": "BUY LIMIT"
}`;

    let lastError = "";

    for (const model of FALLBACK_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Data
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              response_mime_type: "application/json"
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanJson);
            parsed.timestamp = new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " SAST";
            if (engines && Array.isArray(engines) && engines.length > 0) {
              parsed.enginesAgreed = engines;
            }
            return NextResponse.json(parsed, { status: 200 });
          }
        } else {
          const errText = await response.text();
          lastError = `Model ${model} returned ${response.status}: ${errText}`;
        }
      } catch (e: any) {
        lastError = `Model ${model} fetch failed: ${e.message}`;
      }
    }

    return NextResponse.json({ error: "Scanner busy: " + lastError }, { status: 503 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to analyze chart" }, { status: 500 });
  }
}

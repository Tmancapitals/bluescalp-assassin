import { NextRequest, NextResponse } from "next/server";

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
1. READ THE EXACT NUMERICAL VALUES from the right-hand price axis, current bid/ask quote line, and candlestick highs/lows shown in this screenshot. Do not invent numbers.
2. Identify the current visible market price.
3. Determine if the structure is Bullish (BUY) or Bearish (SELL) based on Break of Structure (BOS), Change of Character (CHoCH), or Fair Value Gap (FVG) retest.
4. Calculate precise Entry price, Stop Loss, and Take Profit targets (TP1 to TP5) matching the EXACT price scale on the chart.
5. Provide a realistic confidence score (80-97%), trade grade ("SNIPER A+" or "GRADE A"), and 3-4 institutional confluence bullet points describing exactly what is visible in this image.

Return ONLY a valid JSON object matching this schema:
{
  "pair": "${pair || "ASSET"}",
  "timeframe": "${timeframe || "M5"}",
  "direction": "BUY",
  "grade": "SNIPER A+",
  "confidence": 92,
  "consensusScore": 95,
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
    "Fair Value Gap (FVG) filled on visible candle",
    "Liquidity swept above previous session high"
  ],
  "orderType": "BUY LIMIT"
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

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

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Gemini API error: ${errText}` }, { status: response.status });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json({ error: "No analysis response generated" }, { status: 500 });
    }

    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    parsed.timestamp = new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " SAST";
    if (engines && Array.isArray(engines) && engines.length > 0) {
      parsed.enginesAgreed = engines;
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to analyze chart" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image, pair, methodology = "ALL" } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No chart image provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured on Vercel" }, { status: 500 });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `You are a professional institutional chart analyst and Smart Money Concepts expert.
Analyze this trading chart screenshot thoroughly using the selected methodology: "${methodology}".

Supported methodology focus:
- ALL: Full confluence combining SMC, ICT, and key market structure breakouts.
- ICT: Liquidity sweeps (BSL/SSL), Fair Value Gaps (FVG), killzones, and optimal trade entries (OTE).
- SMC: Order Blocks (OB), Break of Structure (BOS), Change of Character (CHoCH), and displacement.
- CRT: Candle Range Theory (previous candle high/low sweeps and range expansions).
- ULTRABREAKOUT: Momentum expansion breaks with clean retests.

Execution policy:
Single high-conviction order only. Do not advise multi-position bursts or machine-gun entries.

Return ONLY a valid, raw JSON object (no markdown, no backticks, no explanations) with this exact schema:
{
  "pair": "${pair || 'DETECTED_SYMBOL'}",
  "timeframe": "M1 or M5 or H1 etc.",
  "bias": "bullish" | "bearish" | "neutral",
  "confidenceScore": 85,
  "confidenceGrade": "A+" | "A" | "B" | "C",
  "methodologyUsed": "${methodology}",
  "entry": 0.0000,
  "stopLoss": 0.0000,
  "takeProfit1": 0.0000,
  "takeProfit2": 0.0000,
  "takeProfit3": 0.0000,
  "riskReward": "1:2.5",
  "rationale": "Clear 2-sentence summary of why this setup formed.",
  "patterns": {
    "orderBlock": "Price zone and whether it was tapped or mitigated",
    "fairValueGap": "Upper and lower boundary of the active FVG",
    "liquiditySweep": "Specific high or low swept prior to entry"
  }
}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          response_mime_type: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Gemini API error: ${response.status}`, details: errText }, { status: 502 });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const parsed = JSON.parse(rawText.replace(/```json/g, "").replace(/```/g, "").trim());

    return NextResponse.json({ success: true, analysis: parsed });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to analyze chart" }, { status: 500 });
  }
}

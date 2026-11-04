import { NextRequest, NextResponse } from "next/server";


const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType = "image/jpeg", methodology = "ALL" } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: "Missing imageBase64 payload" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured on server" }, { status: 500 });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");

    const prompt = `You are a world-class institutional algorithmic price action analyst (ICT, SMC, CRT, UltraBreakout).
Analyze this financial candlestick chart screenshot using the '${methodology}' methodology.

Requirements:
1. Directional Bias: exactly 'BUY', 'SELL', or 'WAIT'.
2. Quality Grade: 'A+', 'A', 'B', or 'C'.
3. Confidence Score: integer between 50 and 99.
4. Exact numeric levels:
   - entry: immediate price level or limit pull-back
   - stopLoss: structural invalidation level
   - takeProfit1: conservative level (1:1.5 RR)
   - takeProfit2: runner level (1:3 RR)
   - takeProfit3: major liquidity pool
   - riskReward: string like '1:2.4'
5. Methodology Findings:
   - orderBlocks: specific price zone detected or 'None'
   - fvgZones: specific imbalance zone detected or 'None'
   - liquiditySweeps: swept level description or 'None'
   - keyLevel: nearest key support or resistance
6. Concise Reasoning: 2-3 sentences explaining market structure.

Respond ONLY with valid JSON matching this exact structure:
{
  "bias": "BUY" | "SELL" | "WAIT",
  "confidenceGrade": "A+" | "A" | "B" | "C",
  "confidenceScore": 88,
  "entry": 2735.40,
  "stopLoss": 2728.10,
  "takeProfit1": 2746.30,
  "takeProfit2": 2758.00,
  "takeProfit3": 2772.50,
  "riskReward": "1:2.4",
  "orderBlocks": "H1 Bullish OB at 2732.00",
  "fvgZones": "M15 Fair Value Gap at 2734.50",
  "liquiditySweeps": "Asian session low swept at 2729.00",
  "keyLevel": "Previous Day Low (PDL) rejection",
  "summary": "Clear liquidity sweep followed by MSS with displacement into discount OB."
}`;

        const attempts: { model: string; status: number; message: string }[] = [];

    for (const model of CANDIDATE_MODELS) {
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
                    inlineData: {
                      mimeType: mimeType,
                      data: cleanBase64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: "application/json",
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          let parsedMsg = errText;
          try {
            const ej = JSON.parse(errText);
            parsedMsg = ej?.error?.message || errText;
          } catch {}
          attempts.push({ model, status: response.status, message: parsedMsg });
          continue;
        }

        const data = await response.json();
        const parts = data?.candidates?.[0]?.content?.parts || [];
        const textParts = parts.filter((p: any) => p?.text && !p?.thought).map((p: any) => p.text);
        const rawText = textParts.join("\n") || parts.map((p: any) => p?.text || "").join("\n").trim();
        if (!rawText) {
          attempts.push({ model, status: 200, message: "Empty response text" });
          continue;
        }

        const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        return NextResponse.json({
          ...parsed,
          modelUsed: model,
          methodology,
          timestamp: new Date().toISOString(),
        });
      } catch (err: any) {
        attempts.push({ model, status: 500, message: err?.message || String(err) });
      }
    }

    // If all failed, check what models this API key actually supports
    let availableModels: string[] = [];
    try {
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (listRes.ok) {
        const listData = await listRes.json();
        availableModels = (listData?.models || [])
          .filter((m: any) => m?.supportedGenerationMethods?.includes("generateContent"))
          .map((m: any) => m?.name?.replace("models/", ""));
      }
    } catch {}

    return NextResponse.json(
      {
        error: "All Gemini vision models failed",
        attempts,
        supportedModelsForKey: availableModels.slice(0, 8),
      },
      { status: 502 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

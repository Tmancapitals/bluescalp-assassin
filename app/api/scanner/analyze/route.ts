import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30; // Allow enough timeout for image processing

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on Vercel environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { image, style = 'scalp', symbol, timeframe } = body;

    if (!image) {
      return NextResponse.json({ error: 'No chart image provided for analysis.' }, { status: 400 });
    }

    // Extract base64 and mime type
    let mimeType = 'image/jpeg';
    let base64Data = image;

    if (image.startsWith('data:')) {
      const match = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      } else {
        base64Data = image.split(',')[1] || image;
      }
    }

    const systemPrompt = `You are the AI Vision Engine for BLUESCALP ASSASSIN V1.0 - "MACHINE GUNNER", an institutional trading scanner created by Tman Capitals.
Your task is to analyze financial chart screenshots (MT5, TradingView, mobile or desktop) using institutional Smart Money Concepts (SMC), Volume & Liquidity analysis, and Session Momentum.

Trading Style Requested: ${style.toUpperCase()} (scalp: high speed M1-M5, intraday: M15-H1, swing: H4-D1).
${symbol ? `Expected Symbol: ${symbol}` : ''}
${timeframe ? `Expected Timeframe: ${timeframe}` : ''}

CRITICAL RULES:
1. Examine the actual candlestick structure, swing points, and price labels visible on the chart.
2. Identify Liquidity: Check for Buy-Side Liquidity (BSL) sweeps above equal highs, or Sell-Side Liquidity (SSL) sweeps below equal lows.
3. Identify Institutional Footprints: Bullish/Bearish Order Blocks (OB), Fair Value Gaps (FVG), Inefficiencies, Break of Structure (BOS), and Change of Character (CHoCH).
4. Do NOT fake or hallucinate arbitrary prices. Read the actual price numbers from the vertical price axis on the right/left of the chart.
5. If there is no clear high-probability setup, set signal to "WAIT" and confidence below 60%.
6. Return ONLY a valid JSON object matching the requested schema.

Output Schema:
{
  "symbol": string (e.g. "XAUUSD" or "EURUSD" as identified on chart),
  "timeframe": string (e.g. "M5", "M15", "H1"),
  "current_price": string (latest price visible on chart),
  "trend": "BULLISH" | "BEARISH" | "RANGING",
  "signal": "BUY" | "SELL" | "WAIT",
  "confidence": number (0 to 100 integer),
  "setup_name": string (e.g. "Machine Gunner Liquidity Sweep + Order Block Retest"),
  "key_levels": {
    "entry": string (exact recommended entry price),
    "stop_loss": string (invalidation price beyond structural swing),
    "take_profit_1": string (conservative 1:1.5 target),
    "take_profit_2": string (liquidity pool target),
    "take_profit_3": string (extended runner target),
    "risk_reward": string (e.g. "1:2.8")
  },
  "confluences": [
    string,
    string,
    string
  ],
  "invalidation_condition": string (clear rule, e.g. "M5 candle body close below 2642.50 voids the order block"),
  "execution_notes": string (concise tactical advice for the trader)
}
`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            { text: systemPrompt },
            {
              inlineData: {
                mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.15,
        responseMimeType: 'application/json'
      }
    };

    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Gemini API Error:', errorText);
      return NextResponse.json(
        { error: `AI Vision Provider Error: ${res.statusText}`, details: errorText },
        { status: res.status }
      );
    }

    const geminiResponse = await res.json();
    const candidateText = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return NextResponse.json({ error: 'AI Vision failed to produce an analysis.' }, { status: 500 });
    }

    const parsedAnalysis = JSON.parse(candidateText);

    return NextResponse.json({
      success: true,
      analysis: parsedAnalysis,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Chart analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze chart screenshot.' },
      { status: 500 }
    );
  }
}

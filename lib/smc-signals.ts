export interface VipSignal {
  id: string;
  symbol: string;
  displayName: string;
  category: "GOLD" | "FOREX" | "INDEX" | "CRYPTO";
  action: "BUY" | "SELL";
  tradeType: "SNIPER_ENTRY" | "A_PLUS" | "SCALP" | "SWING";
  entry: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  riskReward: number;
  confluenceScore: number;
  confidence: "EXTREME" | "HIGH" | "MEDIUM";
  reasons: string[];
  tags: string[];
  session: string;
  time: string;
  bid: number;
  ask: number;
  spread: number;
  flag: string;
}

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

const ASSET_CONFIG: Record<string, { yTicker: string; displayName: string; category: VipSignal["category"]; flag: string; decimals: number; spread: number }> = {
  XAUUSD: { yTicker: "GC=F", displayName: "XAU / USD (Gold)", category: "GOLD", flag: "🥇", decimals: 2, spread: 0.4 },
  EURUSD: { yTicker: "EURUSD=X", displayName: "EUR / USD", category: "FOREX", flag: "🇪🇺/🇺🇸", decimals: 5, spread: 0.0001 },
  GBPJPY: { yTicker: "GBPJPY=X", displayName: "GBP / JPY", category: "FOREX", flag: "🇬🇧/🇯🇵", decimals: 3, spread: 0.02 },
  US30: { yTicker: "^DJI", displayName: "US30 (Dow Jones)", category: "INDEX", flag: "🇺🇸", decimals: 1, spread: 4.0 },
  NAS100: { yTicker: "^IXIC", displayName: "NAS100 (Nasdaq)", category: "INDEX", flag: "💻", decimals: 1, spread: 3.0 },
  BTCUSD: { yTicker: "BTC-USD", displayName: "BTC / USD (Bitcoin)", category: "CRYPTO", flag: "₿", decimals: 1, spread: 10.0 }
};

let cachedSignals: VipSignal[] = [];
let lastCacheTime = 0;
const CACHE_TTL_MS = 30000; // 30 seconds cache

function getSessionName(): string {
  const hour = new Date().getUTCHours();
  if (hour >= 7 && hour < 12) return "London Session";
  if (hour >= 12 && hour < 16) return "London / NY Overlap";
  if (hour >= 16 && hour < 21) return "New York Session";
  return "Asian Consolidation";
}

async function fetchLiveCandles(ticker: string): Promise<{ candles: Candle[]; price: number }> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=5m&range=1d`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 25 } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const res0 = data?.chart?.result?.[0];
  if (!res0) throw new Error("No chart result");

  const timestamps = res0.timestamp || [];
  const q = res0.indicators?.quote?.[0] || {};
  const opens = q.open || [];
  const highs = q.high || [];
  const lows = q.low || [];
  const closes = q.close || [];

  const candles: Candle[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    if (opens[i] != null && highs[i] != null && lows[i] != null && closes[i] != null) {
      candles.push({
        time: timestamps[i],
        open: Number(opens[i]),
        high: Number(highs[i]),
        low: Number(lows[i]),
        close: Number(closes[i])
      });
    }
  }

  const livePrice = res0.meta?.regularMarketPrice || (candles.length > 0 ? candles[candles.length - 1].close : 0);
  return { candles, price: Number(livePrice) };
}

function analyzeSMC(symbol: string, candles: Candle[], livePrice: number): VipSignal {
  const cfg = ASSET_CONFIG[symbol];
  const n = candles.length;
  const last = candles[n - 1] || { open: livePrice, high: livePrice, low: livePrice, close: livePrice };

  // Calculate Average True Range (ATR) over last 14 candles
  const lookbackAtr = Math.min(14, n);
  let atrSum = 0;
  for (let i = n - lookbackAtr; i < n; i++) {
    atrSum += candles[i].high - candles[i].low;
  }
  const atr = Math.max(atrSum / lookbackAtr, livePrice * 0.001);

  // 1. Structure Analysis (BOS / Swing High & Low)
  const lookback = Math.min(20, n - 2);
  let swingHigh = -Infinity;
  let swingLow = Infinity;
  for (let i = n - lookback; i < n - 1; i++) {
    if (candles[i].high > swingHigh) swingHigh = candles[i].high;
    if (candles[i].low < swingLow) swingLow = candles[i].low;
  }

  // Direction from recent momentum
  const baseline = candles[Math.max(0, n - 8)].close;
  const isBullish = last.close >= baseline;
  const action: "BUY" | "SELL" = isBullish ? "BUY" : "SELL";

  // 2. Fair Value Gap (FVG) Check
  let hasBullFvg = false;
  let hasBearFvg = false;
  for (let i = Math.max(2, n - 6); i < n; i++) {
    if (candles[i].low > candles[i - 2].high) hasBullFvg = true;
    if (candles[i].high < candles[i - 2].low) hasBearFvg = true;
  }

  // 3. Liquidity Sweep Detection
  const sweptLow = last.low < swingLow && last.close > swingLow;
  const sweptHigh = last.high > swingHigh && last.close < swingHigh;

  // 4. Confluence Scoring
  let confluenceScore = 5.5;
  const reasons: string[] = [];
  const tags: string[] = [];

  if (action === "BUY") {
    if (hasBullFvg) {
      confluenceScore += 1.2;
      reasons.push("M5 Bullish Fair Value Gap (FVG) Detected");
      tags.push("FVG IMBALANCE");
    }
    if (sweptLow) {
      confluenceScore += 1.5;
      reasons.push("Sell-side Liquidity Swept below Swing Low");
      tags.push("LIQ SWEPT");
    } else {
      reasons.push("Bullish Displacement from Discount Zone");
      tags.push("DISCOUNT ZONE");
    }
    if (last.close > swingHigh) {
      confluenceScore += 1.0;
      reasons.push("Bullish Break of Structure (BOS)");
      tags.push("BOS CONFIRMED");
    } else {
      tags.push("CHoCH FORMING");
    }
  } else {
    if (hasBearFvg) {
      confluenceScore += 1.2;
      reasons.push("M5 Bearish Fair Value Gap (FVG) Mitigation");
      tags.push("FVG SUPPLY");
    }
    if (sweptHigh) {
      confluenceScore += 1.5;
      reasons.push("Buy-side Liquidity Swept above Swing High");
      tags.push("LIQ SWEPT");
    } else {
      reasons.push("Institutional Rejection at Premium Supply");
      tags.push("PREMIUM ZONE");
    }
    if (last.close < swingLow) {
      confluenceScore += 1.0;
      reasons.push("Bearish Break of Structure (BOS)");
      tags.push("BOS CONFIRMED");
    } else {
      tags.push("CHoCH FORMING");
    }
  }

  confluenceScore = Math.min(9.4, Math.round(confluenceScore * 10) / 10);
  const confidence: VipSignal["confidence"] = confluenceScore >= 7.8 ? "EXTREME" : confluenceScore >= 6.5 ? "HIGH" : "MEDIUM";
  const tradeType: VipSignal["tradeType"] = confluenceScore >= 8.0 ? "SNIPER_ENTRY" : confluenceScore >= 7.0 ? "A_PLUS" : "SCALP";

  // Dynamic Levels based on ATR
  const entry = Number(livePrice.toFixed(cfg.decimals));
  let stopLoss: number;
  let takeProfit1: number;
  let takeProfit2: number;
  let takeProfit3: number;

  if (action === "BUY") {
    stopLoss = Number((entry - atr * 1.5).toFixed(cfg.decimals));
    const risk = Math.max(entry - stopLoss, livePrice * 0.0005);
    takeProfit1 = Number((entry + risk * 1.8).toFixed(cfg.decimals));
    takeProfit2 = Number((entry + risk * 2.8).toFixed(cfg.decimals));
    takeProfit3 = Number((entry + risk * 4.0).toFixed(cfg.decimals));
  } else {
    stopLoss = Number((entry + atr * 1.5).toFixed(cfg.decimals));
    const risk = Math.max(stopLoss - entry, livePrice * 0.0005);
    takeProfit1 = Number((entry - risk * 1.8).toFixed(cfg.decimals));
    takeProfit2 = Number((entry - risk * 2.8).toFixed(cfg.decimals));
    takeProfit3 = Number((entry - risk * 4.0).toFixed(cfg.decimals));
  }

  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(takeProfit2 - entry);
  const riskReward = Number((reward / (risk || 1)).toFixed(1));

  const now = new Date();
  const timeStr = now.toTimeString().split(" ")[0];

  return {
    id: `${symbol.toLowerCase()}-${action.toLowerCase()}-${Date.now().toString().slice(-4)}`,
    symbol,
    displayName: cfg.displayName,
    category: cfg.category,
    action,
    tradeType,
    entry,
    stopLoss,
    takeProfit1,
    takeProfit2,
    takeProfit3,
    riskReward,
    confluenceScore,
    confidence,
    reasons,
    tags,
    session: getSessionName(),
    time: timeStr,
    bid: Number((livePrice - cfg.spread / 2).toFixed(cfg.decimals)),
    ask: Number((livePrice + cfg.spread / 2).toFixed(cfg.decimals)),
    spread: cfg.spread,
    flag: cfg.flag
  };
}

export async function getLiveSMCSignals(): Promise<VipSignal[]> {
  const now = Date.now();
  if (cachedSignals.length > 0 && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedSignals;
  }

  const symbols = ["XAUUSD", "EURUSD", "US30", "GBPJPY", "NAS100", "BTCUSD"];
  const promises = symbols.map(async (sym) => {
    try {
      const cfg = ASSET_CONFIG[sym];
      const { candles, price } = await fetchLiveCandles(cfg.yTicker);
      if (candles.length === 0) return null;
      return analyzeSMC(sym, candles, price);
    } catch {
      return null;
    }
  });

  const results = await Promise.all(promises);
  const validSignals = results.filter((s): s is VipSignal => s !== null);

  if (validSignals.length > 0) {
    cachedSignals = validSignals;
    lastCacheTime = now;
    return cachedSignals;
  }

  return cachedSignals;
}

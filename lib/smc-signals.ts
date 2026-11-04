export interface VipSignal {
  id: string;
  symbol: string;
  displayName: string;
  category: "GOLD" | "FOREX" | "INDEX" | "CRYPTO";
  action: "BUY" | "SELL" | "WAIT";
  tradeType: "SNIPER_ENTRY" | "A_PLUS" | "SCALP" | "SWING" | "NEUTRAL";
  status: "VALID" | "WAITING_CONFIRMATION" | "CHOP_FILTERED";
  isValid: boolean;
  entry: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  riskReward: number;
  confluenceScore: number;
  confidence: "EXTREME" | "HIGH" | "MEDIUM" | "LOW";
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
const CACHE_TTL_MS = 25000;

function calculateEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const emaArray: number[] = [];
  let prevEma = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  emaArray[period - 1] = prevEma;
  for (let i = period; i < prices.length; i++) {
    const curEma = prices[i] * k + prevEma * (1 - k);
    emaArray[i] = curEma;
    prevEma = curEma;
  }
  return emaArray;
}

function getSessionName(): string {
  const hour = new Date().getUTCHours();
  if (hour >= 7 && hour < 12) return "London Session";
  if (hour >= 12 && hour < 16) return "London / NY Overlap";
  if (hour >= 16 && hour < 21) return "New York Session";
  return "Asian Consolidation";
}

async function fetchLiveCandles(ticker: string): Promise<{ candles: Candle[]; price: number }> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=5m&range=1d`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 20 } });
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
  const last = candles[n - 1];

  // 1. Trend Filter using EMAs (20 & 50)
  const closePrices = candles.map((c) => c.close);
  const ema20 = calculateEMA(closePrices, Math.min(20, Math.floor(n / 2)));
  const ema50 = calculateEMA(closePrices, Math.min(50, Math.floor(n * 0.8)));

  const currentEma20 = ema20[ema20.length - 1] || last.close;
  const currentEma50 = ema50[ema50.length - 1] || last.close;

  const isEmaBullish = last.close > currentEma20 && currentEma20 > currentEma50;
  const isEmaBearish = last.close < currentEma20 && currentEma20 < currentEma50;

  // 2. Structural Highs and Lows (Past 20 candles)
  const lookback = Math.min(24, n - 2);
  let swingHigh = -Infinity;
  let swingLow = Infinity;
  for (let i = n - lookback; i < n - 1; i++) {
    if (candles[i].high > swingHigh) swingHigh = candles[i].high;
    if (candles[i].low < swingLow) swingLow = candles[i].low;
  }

  // 3. Displacement & Break of Structure (BOS)
  const isBullishBOS = last.close > swingHigh;
  const isBearishBOS = last.close < swingLow;

  // 4. Fair Value Gaps (FVG)
  let bullFvgFound = false;
  let bearFvgFound = false;
  for (let i = Math.max(2, n - 8); i < n; i++) {
    if (candles[i].low > candles[i - 2].high) bullFvgFound = true;
    if (candles[i].high < candles[i - 2].low) bearFvgFound = true;
  }

  // 5. Liquidity Sweep (Swept low or high and rejected)
  const sweptSellside = last.low < swingLow && last.close > swingLow;
  const sweptBuyside = last.high > swingHigh && last.close < swingHigh;

  // 6. Scanner-Aligned Structural Evaluation
  let bullConfluence = 0;
  let bearConfluence = 0;
  const bullReasons: string[] = [];
  const bearReasons: string[] = [];
  const bullTags: string[] = [];
  const bearTags: string[] = [];

  // Trend factor
  if (isEmaBullish) {
    bullConfluence += 2.0;
    bullReasons.push("Bullish trend: Price above EMA 20 & 50");
  } else if (isEmaBearish) {
    bearConfluence += 2.0;
    bearReasons.push("Bearish trend: Price below EMA 20 & 50");
  }

  // Break of Structure factor
  if (isBullishBOS) {
    bullConfluence += 3.0;
    bullReasons.push(`Bullish BOS broken above ${swingHigh.toFixed(cfg.decimals)}`);
    bullTags.push("BOS CONFIRMED");
  }
  if (isBearishBOS) {
    bearConfluence += 3.0;
    bearReasons.push(`Bearish BOS broken below ${swingLow.toFixed(cfg.decimals)}`);
    bearTags.push("BOS CONFIRMED");
  }

  // Institutional Liquidity Sweep factor
  if (sweptSellside) {
    bullConfluence += 3.5;
    bullReasons.push("Liquidity Sweep: Purged sell-side stops and closed back inside range");
    bullTags.push("LIQ SWEEP");
  }
  if (sweptBuyside) {
    bearConfluence += 3.5;
    bearReasons.push("Liquidity Sweep: Purged buy-side stops and closed back inside range");
    bearTags.push("LIQ SWEEP");
  }

  // Fair Value Gap factor
  if (bullFvgFound) {
    bullConfluence += 1.5;
    bullReasons.push("Bullish Fair Value Gap (FVG) discount retest");
    bullTags.push("FVG DISCOUNT");
  }
  if (bearFvgFound) {
    bearConfluence += 1.5;
    bearReasons.push("Bearish Fair Value Gap (FVG) premium retest");
    bearTags.push("FVG PREMIUM");
  }

  // 7. Decision & Confluence Threshold (minimum 6.5 required to trigger BUY/SELL)
  let action: "BUY" | "SELL" | "WAIT" = "WAIT";
  let confluence = 3.0;
  let reasons: string[] = [];
  let tags: string[] = [];

  if (bullConfluence >= 6.5 && bullConfluence > bearConfluence) {
    action = "BUY";
    confluence = Math.min(9.8, bullConfluence);
    reasons = bullReasons;
    tags = bullTags;
  } else if (bearConfluence >= 6.5 && bearConfluence > bullConfluence) {
    action = "SELL";
    confluence = Math.min(9.8, bearConfluence);
    reasons = bearReasons;
    tags = bearTags;
  } else {
    action = "WAIT";
    confluence = Math.max(bullConfluence, bearConfluence, 3.5);
    reasons = ["Market in consolidation/chop. No high-probability structural confluence detected."];
    tags = ["WAIT FOR SETUP"];
  }

  const confluenceScore = Math.min(9.8, Math.round(confluence * 10) / 10);
  const isValid = action !== "WAIT" && confluenceScore >= 6.8;
  const status: VipSignal["status"] = isValid
    ? "VALID"
    : confluenceScore >= 5.5
    ? "WAITING_CONFIRMATION"
    : "CHOP_FILTERED";

  // Trade Type Classification
  let tradeType: VipSignal["tradeType"] = "NEUTRAL";
  if (action !== "WAIT") {
    if (sweptSellside || sweptBuyside) {
      tradeType = "SNIPER_ENTRY";
    } else if (confluenceScore >= 7.8) {
      tradeType = "A_PLUS";
    } else if (isBullishBOS || isBearishBOS) {
      tradeType = "SWING";
    } else {
      tradeType = "SCALP";
    }
  }

  const confidence: VipSignal["confidence"] =
    confluenceScore >= 8.2 ? "EXTREME" : confluenceScore >= 7.0 ? "HIGH" : confluenceScore >= 6.0 ? "MEDIUM" : "LOW";

  // 8. Precise ATR-based SL & TP Calculations
  const lookbackAtr = Math.min(14, n);
  let atrSum = 0;
  for (let i = n - lookbackAtr; i < n; i++) {
    atrSum += candles[i].high - candles[i].low;
  }
  const atr = Math.max(atrSum / lookbackAtr, livePrice * 0.0008);

  const entry = Number(livePrice.toFixed(cfg.decimals));
  let stopLoss = 0;
  let takeProfit1 = 0;
  let takeProfit2 = 0;
  let takeProfit3 = 0;

  if (action === "BUY") {
    const multiplier = tradeType === "SNIPER_ENTRY" ? 1.1 : tradeType === "SWING" ? 2.2 : 1.5;
    stopLoss = Number((entry - atr * multiplier).toFixed(cfg.decimals));
    const risk = Math.max(entry - stopLoss, livePrice * 0.0005);
    takeProfit1 = Number((entry + risk * 1.8).toFixed(cfg.decimals));
    takeProfit2 = Number((entry + risk * 2.8).toFixed(cfg.decimals));
    takeProfit3 = Number((entry + risk * 4.2).toFixed(cfg.decimals));
  } else if (action === "SELL") {
    const multiplier = tradeType === "SNIPER_ENTRY" ? 1.1 : tradeType === "SWING" ? 2.2 : 1.5;
    stopLoss = Number((entry + atr * multiplier).toFixed(cfg.decimals));
    const risk = Math.max(stopLoss - entry, livePrice * 0.0005);
    takeProfit1 = Number((entry - risk * 1.8).toFixed(cfg.decimals));
    takeProfit2 = Number((entry - risk * 2.8).toFixed(cfg.decimals));
    takeProfit3 = Number((entry - risk * 4.2).toFixed(cfg.decimals));
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
    status,
    isValid,
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

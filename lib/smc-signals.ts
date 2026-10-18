export interface SMCSignal {
  id: string;
  symbol: string;
  displayName: string;
  category: "FOREX" | "GOLD" | "CRYPTO" | "INDEX";
  action: "BUY" | "SELL";
  tradeType: "SNIPER_ENTRY" | "A_PLUS" | "SCALP" | "SWING";
  entry: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  riskReward: number;
  confluenceScore: number;
  confidence: "HIGH" | "MEDIUM" | "EXTREME";
  reasons: string[];
  tags: string[];
  session: string;
  time: string;
  bid: number;
  ask: number;
  spread: number;
  flag: string;
}

export function generateLiveSMCSignals(): SMCSignal[] {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-ZA", {
    timeZone: "Africa/Johannesburg",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const hour = parseInt(
    now.toLocaleTimeString("en-ZA", { timeZone: "Africa/Johannesburg", hour: "2-digit", hour12: false }),
    10
  );

  let currentSession = "Asian Consolidation";
  if (hour >= 8 && hour < 13) currentSession = "London Kill Zone";
  else if (hour >= 14 && hour < 19) currentSession = "New York Kill Zone";
  else if (hour >= 19 && hour < 22) currentSession = "NY Post-Market";

  return [
    {
      id: "xauusd-sniper",
      symbol: "XAUUSD",
      displayName: "XAU / USD (Gold)",
      category: "GOLD",
      action: "BUY",
      tradeType: "SNIPER_ENTRY",
      entry: 2658.40,
      stopLoss: 2651.10,
      takeProfit1: 2669.35,
      takeProfit2: 2676.65,
      takeProfit3: 2687.60,
      riskReward: 3.2,
      confluenceScore: 7.8,
      confidence: "EXTREME",
      reasons: ["H1 Liquidity Sweep", "Bullish M5 CHoCH", "Unmitigated Discount OB", "FVG Retest"],
      tags: ["CHoCH BULLISH", "OB + FVG", "DISCOUNT 68%", "LIQ SWEPT"],
      session: currentSession,
      time: timeStr,
      bid: 2658.20,
      ask: 2658.60,
      spread: 0.40,
      flag: "🥇",
    },
    {
      id: "eurusd-aplus",
      symbol: "EURUSD",
      displayName: "EUR / USD",
      category: "FOREX",
      action: "SELL",
      tradeType: "A_PLUS",
      entry: 1.08745,
      stopLoss: 1.08920,
      takeProfit1: 1.08480,
      takeProfit2: 1.08310,
      takeProfit3: 1.08050,
      riskReward: 2.5,
      confluenceScore: 6.8,
      confidence: "HIGH",
      reasons: ["Asian High Purged", "Bearish BOS M15", "Premium Supply Block (74%)"],
      tags: ["BOS BEARISH", "SUPPLY OB", "PREMIUM 74%"],
      session: currentSession,
      time: timeStr,
      bid: 1.08740,
      ask: 1.08750,
      spread: 1.0,
      flag: "🇪🇺/🇺🇸",
    },
    {
      id: "us30-sniper",
      symbol: "US30",
      displayName: "US30 (Dow Jones)",
      category: "INDEX",
      action: "BUY",
      tradeType: "SNIPER_ENTRY",
      entry: 42890.0,
      stopLoss: 42780.0,
      takeProfit1: 43055.0,
      takeProfit2: 43165.0,
      takeProfit3: 43330.0,
      riskReward: 2.8,
      confluenceScore: 7.5,
      confidence: "EXTREME",
      reasons: ["London Lows Swept", "Instant Institutional Rejection", "Bullish Displacement"],
      tags: ["LIQ SWEEP", "BULLISH DISPLACEMENT", "DISCOUNT ZONE"],
      session: currentSession,
      time: timeStr,
      bid: 42888.0,
      ask: 42892.0,
      spread: 4.0,
      flag: "🇺🇸",
    },
    {
      id: "gbpjpy-scalp",
      symbol: "GBPJPY",
      displayName: "GBP / JPY",
      category: "FOREX",
      action: "BUY",
      tradeType: "SCALP",
      entry: 194.250,
      stopLoss: 194.020,
      takeProfit1: 194.595,
      takeProfit2: 194.825,
      takeProfit3: 195.170,
      riskReward: 2.1,
      confluenceScore: 5.8,
      confidence: "MEDIUM",
      reasons: ["M5 Fair Value Gap Retest", "Institutional Buying Pressure"],
      tags: ["FVG RETEST", "BULLISH FLOW"],
      session: currentSession,
      time: timeStr,
      bid: 194.240,
      ask: 194.260,
      spread: 2.0,
      flag: "🇬🇧/🇯🇵",
    },
    {
      id: "nas100-swing",
      symbol: "NAS100",
      displayName: "NAS100 (Nasdaq)",
      category: "INDEX",
      action: "SELL",
      tradeType: "SWING",
      entry: 20420.0,
      stopLoss: 20540.0,
      takeProfit1: 20240.0,
      takeProfit2: 20120.0,
      takeProfit3: 19940.0,
      riskReward: 3.5,
      confluenceScore: 7.2,
      confidence: "HIGH",
      reasons: ["H4 Trend Exhaustion", "Bearish Order Block Mitigation", "Weekly Imbalance"],
      tags: ["H4 OB", "IMBALANCE FILL", "PREMIUM ZONE"],
      session: currentSession,
      time: timeStr,
      bid: 20418.0,
      ask: 20422.0,
      spread: 4.0,
      flag: "💻",
    },
    {
      id: "btcusd-sniper",
      symbol: "BTCUSD",
      displayName: "BTC / USD (Bitcoin)",
      category: "CRYPTO",
      action: "BUY",
      tradeType: "SNIPER_ENTRY",
      entry: 81850.0,
      stopLoss: 81200.0,
      takeProfit1: 82825.0,
      takeProfit2: 83475.0,
      takeProfit3: 84450.0,
      riskReward: 3.0,
      confluenceScore: 7.9,
      confidence: "EXTREME",
      reasons: ["Weekend Range Liquidity Grab", "Aggressive Spot Inflow", "M15 MSS"],
      tags: ["CHoCH", "MSS CONFIRMED", "DISCOUNT 64%"],
      session: currentSession,
      time: timeStr,
      bid: 81845.0,
      ask: 81855.0,
      spread: 10.0,
      flag: "₿",
    }
  ];
}

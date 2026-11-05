"use client";

import React, { useState, useMemo } from "react";

export interface AssetInfo {
  symbol: string;
  name: string;
  category: "Forex" | "Metals" | "Commodities" | "Indices" | "Crypto" | "Synthetics";
}

export const ALL_MARKET_ASSETS: AssetInfo[] = [
  // --- METALS & COMMODITIES ---
  { symbol: "XAUUSD", name: "Gold / US Dollar", category: "Metals" },
  { symbol: "XAGUSD", name: "Silver / US Dollar", category: "Metals" },
  { symbol: "XPTUSD", name: "Platinum / US Dollar", category: "Metals" },
  { symbol: "XPDUSD", name: "Palladium / US Dollar", category: "Metals" },
  { symbol: "USOIL", name: "WTI Crude Oil", category: "Commodities" },
  { symbol: "UKOIL", name: "Brent Crude Oil", category: "Commodities" },
  { symbol: "NATGAS", name: "Natural Gas", category: "Commodities" },
  { symbol: "COPPER", name: "High Grade Copper", category: "Commodities" },
  { symbol: "ALUMINUM", name: "Aluminum", category: "Commodities" },

  // --- INDICES ---
  { symbol: "US30", name: "Dow Jones Industrial 30", category: "Indices" },
  { symbol: "NAS100", name: "Nasdaq 100", category: "Indices" },
  { symbol: "SPX500", name: "S&P 500 Index", category: "Indices" },
  { symbol: "GER40", name: "DAX 40 (Germany)", category: "Indices" },
  { symbol: "UK100", name: "FTSE 100 (London)", category: "Indices" },
  { symbol: "JP225", name: "Nikkei 225 (Japan)", category: "Indices" },
  { symbol: "FRA40", name: "CAC 40 (France)", category: "Indices" },
  { symbol: "AUS200", name: "ASX 200 (Australia)", category: "Indices" },
  { symbol: "HK50", name: "Hang Seng (Hong Kong)", category: "Indices" },
  { symbol: "CHINA50", name: "FTSE China A50", category: "Indices" },
  { symbol: "EU50", name: "Euro Stoxx 50", category: "Indices" },
  { symbol: "VIX", name: "Volatility S&P Index", category: "Indices" },

  // --- FOREX MAJORS ---
  { symbol: "EURUSD", name: "Euro / US Dollar", category: "Forex" },
  { symbol: "GBPUSD", name: "British Pound / US Dollar", category: "Forex" },
  { symbol: "USDJPY", name: "US Dollar / Japanese Yen", category: "Forex" },
  { symbol: "AUDUSD", name: "Aussie / US Dollar", category: "Forex" },
  { symbol: "USDCAD", name: "US Dollar / Canadian Dollar", category: "Forex" },
  { symbol: "USDCHF", name: "US Dollar / Swiss Franc", category: "Forex" },
  { symbol: "NZDUSD", name: "Kiwi / US Dollar", category: "Forex" },

  // --- FOREX MINORS & CROSSES ---
  { symbol: "EURGBP", name: "Euro / British Pound", category: "Forex" },
  { symbol: "EURJPY", name: "Euro / Japanese Yen", category: "Forex" },
  { symbol: "EURAUD", name: "Euro / Australian Dollar", category: "Forex" },
  { symbol: "EURCAD", name: "Euro / Canadian Dollar", category: "Forex" },
  { symbol: "EURCHF", name: "Euro / Swiss Franc", category: "Forex" },
  { symbol: "EURNZD", name: "Euro / New Zealand Dollar", category: "Forex" },
  { symbol: "GBPJPY", name: "Pound / Japanese Yen", category: "Forex" },
  { symbol: "GBPAUD", name: "Pound / Australian Dollar", category: "Forex" },
  { symbol: "GBPCAD", name: "Pound / Canadian Dollar", category: "Forex" },
  { symbol: "GBPCHF", name: "Pound / Swiss Franc", category: "Forex" },
  { symbol: "GBPNZD", name: "Pound / New Zealand Dollar", category: "Forex" },
  { symbol: "AUDJPY", name: "Aussie / Japanese Yen", category: "Forex" },
  { symbol: "AUDCAD", name: "Aussie / Canadian Dollar", category: "Forex" },
  { symbol: "AUDCHF", name: "Aussie / Swiss Franc", category: "Forex" },
  { symbol: "AUDNZD", name: "Aussie / Kiwi", category: "Forex" },
  { symbol: "CADJPY", name: "Canadian Dollar / Yen", category: "Forex" },
  { symbol: "CADCHF", name: "Canadian Dollar / Swiss Franc", category: "Forex" },
  { symbol: "CHFJPY", name: "Swiss Franc / Japanese Yen", category: "Forex" },
  { symbol: "NZDJPY", name: "Kiwi / Japanese Yen", category: "Forex" },
  { symbol: "NZDCAD", name: "Kiwi / Canadian Dollar", category: "Forex" },
  { symbol: "NZDCHF", name: "Kiwi / Swiss Franc", category: "Forex" },

  // --- FOREX EXOTICS ---
  { symbol: "USDZAR", name: "US Dollar / South African Rand", category: "Forex" },
  { symbol: "EURZAR", name: "Euro / South African Rand", category: "Forex" },
  { symbol: "GBPZAR", name: "Pound / South African Rand", category: "Forex" },
  { symbol: "USDMXN", name: "US Dollar / Mexican Peso", category: "Forex" },
  { symbol: "USDSGD", name: "US Dollar / Singapore Dollar", category: "Forex" },
  { symbol: "USDTRY", name: "US Dollar / Turkish Lira", category: "Forex" },
  { symbol: "USDNOK", name: "US Dollar / Norwegian Krone", category: "Forex" },
  { symbol: "USDSEK", name: "US Dollar / Swedish Krona", category: "Forex" },
  { symbol: "USDCNH", name: "US Dollar / Chinese Yuan", category: "Forex" },
  { symbol: "USDPLN", name: "US Dollar / Polish Zloty", category: "Forex" },

  // --- CRYPTO ---
  { symbol: "BTCUSD", name: "Bitcoin / US Dollar", category: "Crypto" },
  { symbol: "ETHUSD", name: "Ethereum / US Dollar", category: "Crypto" },
  { symbol: "SOLUSD", name: "Solana / US Dollar", category: "Crypto" },
  { symbol: "XRPUSD", name: "Ripple / US Dollar", category: "Crypto" },
  { symbol: "BNBUSD", name: "Binance Coin / US Dollar", category: "Crypto" },
  { symbol: "DOGEUSD", name: "Dogecoin / US Dollar", category: "Crypto" },
  { symbol: "ADAUSD", name: "Cardano / US Dollar", category: "Crypto" },
  { symbol: "LTCUSD", name: "Litecoin / US Dollar", category: "Crypto" },
  { symbol: "AVAXUSD", name: "Avalanche / US Dollar", category: "Crypto" },
  { symbol: "LINKUSD", name: "Chainlink / US Dollar", category: "Crypto" },
  { symbol: "DOTUSD", name: "Polkadot / US Dollar", category: "Crypto" },
  { symbol: "NEARUSD", name: "NEAR Protocol / US Dollar", category: "Crypto" },

  // --- DERIV SYNTHETICS / VOLATILITY ---
  { symbol: "VOL_10", name: "Volatility 10 Index", category: "Synthetics" },
  { symbol: "VOL_10_1S", name: "Volatility 10 (1s) Index", category: "Synthetics" },
  { symbol: "VOL_20", name: "Volatility 20 Index", category: "Synthetics" },
  { symbol: "VOL_25", name: "Volatility 25 Index", category: "Synthetics" },
  { symbol: "VOL_25_1S", name: "Volatility 25 (1s) Index", category: "Synthetics" },
  { symbol: "VOL_50", name: "Volatility 50 Index", category: "Synthetics" },
  { symbol: "VOL_50_1S", name: "Volatility 50 (1s) Index", category: "Synthetics" },
  { symbol: "VOL_75", name: "Volatility 75 Index", category: "Synthetics" },
  { symbol: "VOL_75_1S", name: "Volatility 75 (1s) Index", category: "Synthetics" },
  { symbol: "VOL_80", name: "Volatility 80 Index", category: "Synthetics" },
  { symbol: "VOL_100", name: "Volatility 100 Index", category: "Synthetics" },
  { symbol: "VOL_100_1S", name: "Volatility 100 (1s) Index", category: "Synthetics" },
  { symbol: "CRASH_300", name: "Crash 300 Index", category: "Synthetics" },
  { symbol: "CRASH_500", name: "Crash 500 Index", category: "Synthetics" },
  { symbol: "CRASH_1000", name: "Crash 1000 Index", category: "Synthetics" },
  { symbol: "BOOM_300", name: "Boom 300 Index", category: "Synthetics" },
  { symbol: "BOOM_500", name: "Boom 500 Index", category: "Synthetics" },
  { symbol: "BOOM_1000", name: "Boom 1000 Index", category: "Synthetics" },
  { symbol: "STEP_INDEX", name: "Step Index", category: "Synthetics" },
  { symbol: "JUMP_10", name: "Jump 10 Index", category: "Synthetics" },
  { symbol: "JUMP_25", name: "Jump 25 Index", category: "Synthetics" },
  { symbol: "JUMP_50", name: "Jump 50 Index", category: "Synthetics" },
  { symbol: "JUMP_75", name: "Jump 75 Index", category: "Synthetics" },
  { symbol: "JUMP_100", name: "Jump 100 Index", category: "Synthetics" },
];

const POPULAR_SYMBOLS = ["XAUUSD", "NAS100", "US30", "EURUSD", "USDJPY", "BTCUSD", "VOL_75"];
const TIMEFRAMES = ["AUTO", "M1", "M5", "M15", "H1", "H4", "D1"];
const CATEGORIES = ["All", "Forex", "Metals", "Indices", "Crypto", "Synthetics", "Commodities"] as const;

interface MarketPairSelectorProps {
  selectedPair: string;
  onSelectPair: (symbol: string) => void;
  selectedTimeframe: string;
  onSelectTimeframe: (tf: string) => void;
  theme?: any;
}

export default function MarketPairSelector({
  selectedPair,
  onSelectPair,
  selectedTimeframe,
  onSelectTimeframe,
  theme,
}: MarketPairSelectorProps) {
  const primaryText = theme?.primaryText || "text-cyan-300";
  const accentText = theme?.accentText || "text-cyan-400";
  const border = theme?.border || "border-cyan-500/40";
  const cardBorder = theme?.cardBorder || "border-cyan-400/60";
  const badgeBg = theme?.badgeBg || "bg-cyan-950/80 border-cyan-500/40 text-cyan-300";
  const buttonBg = theme?.buttonBg || "bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950";
  const pulseColor = theme?.pulseColor || "bg-cyan-400";
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredAssets = useMemo(() => {
    const q = searchQuery.trim().toUpperCase();
    return ALL_MARKET_ASSETS.filter((item) => {
      const matchCat = activeCategory === "All" || item.category === activeCategory;
      const matchQuery =
        !q ||
        item.symbol.toUpperCase().includes(q) ||
        item.name.toUpperCase().includes(q) ||
        item.category.toUpperCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [searchQuery, activeCategory]);

  const handleSelect = (symbol: string) => {
    onSelectPair(symbol);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSelect(searchQuery.trim().toUpperCase());
    }
  };

  return (
    <div className="flex flex-col gap-3 p-3.5 rounded-2xl bg-[#081525] border border-slate-800 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${pulseColor} animate-pulse`} />
          <span className="text-xs font-bold tracking-wider uppercase text-slate-300">
            Instrument & Asset
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded-lg ${badgeBg} font-mono text-xs font-extrabold`}>
            {selectedPair}
          </span>
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1 transition"
          >
            <span>🔍 All Pairs</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {POPULAR_SYMBOLS.map((sym) => {
          const isActive = selectedPair === sym;
          return (
            <button
              key={sym}
              type="button"
              onClick={() => onSelectPair(sym)}
              className={`py-1.5 px-2.5 rounded-xl border text-xs font-bold transition font-mono ${
                isActive
                  ? `${badgeBg} border ${cardBorder} font-black shadow-md`
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
            >
              {sym}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className={`py-1.5 px-2.5 rounded-xl border border-dashed ${border} bg-slate-900/40 ${accentText} text-xs font-bold transition`}
        >
          + Search All...
        </button>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TF:</span>
        <div className="flex gap-1 overflow-x-auto">
          {TIMEFRAMES.map((tf) => {
            const isActive = selectedTimeframe === tf;
            return (
              <button
                key={tf}
                type="button"
                onClick={() => onSelectTimeframe(tf)}
                className={`py-1 px-2.5 rounded-lg text-xs font-bold transition font-mono ${
                  isActive
                    ? `${buttonBg} shadow-md`
                    : "bg-slate-900/50 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>
      </div>

      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#081525] border border-cyan-500/30 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 text-base">🌐</span>
                <div>
                  <h3 className="text-sm font-bold text-white">Financial Markets Pair Search</h3>
                  <p className="text-[11px] text-slate-400">Forex, Metals, Indices, Crypto & Volatility</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 border-b border-slate-800 bg-slate-900/40">
              <form onSubmit={handleCustomSubmit} className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type any pair (e.g. XAUUSD, US30, JPY, VOL_80)..."
                    autoFocus
                    className="w-full py-2.5 pl-9 pr-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400"
                  />
                  <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
                </div>
                {searchQuery.trim() && (
                  <button
                    type="submit"
                    className="px-3 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono whitespace-nowrap transition"
                  >
                    Select &quot;{searchQuery.trim().toUpperCase()}&quot;
                  </button>
                )}
              </form>

              <div className="flex gap-1 mt-2.5 overflow-x-auto pb-0.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`py-1 px-2.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition ${
                      activeCategory === cat
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50"
                        : "bg-slate-800/60 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[50vh]">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => {
                  const isCurrent = selectedPair === asset.symbol;
                  return (
                    <button
                      key={asset.symbol}
                      type="button"
                      onClick={() => handleSelect(asset.symbol)}
                      className={`p-2 rounded-xl text-left border transition flex flex-col justify-between ${
                        isCurrent
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.2)]"
                          : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700 text-slate-300 hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-mono font-extrabold text-xs text-white">
                          {asset.symbol}
                        </span>
                        <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400 font-semibold">
                          {asset.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate mt-1">
                        {asset.name}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="col-span-full py-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <p>No exact preset match for &quot;{searchQuery}&quot;</p>
                  <button
                    type="button"
                    onClick={() => handleSelect(searchQuery.trim().toUpperCase())}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-500/30"
                  >
                    Use Custom Symbol: {searchQuery.trim().toUpperCase()}
                  </button>
                </div>
              )}
            </div>

            <div className="p-2.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Showing {filteredAssets.length} pairs</span>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="text-slate-400 hover:text-white underline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

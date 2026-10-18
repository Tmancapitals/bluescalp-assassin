"use client";

import React, { useState } from "react";
import { Radio, RefreshCw, Volume2, VolumeX, Copy, Check } from "lucide-react";

export default function VipSignalsView({
  signals,
  onRefresh,
  theme,
}: {
  signals: any[];
  onRefresh: () => void;
  theme?: any;
}) {
  const [filter, setFilter] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const primaryText = theme?.primaryText || "text-cyan-300";
  const accentText = theme?.accentText || "text-cyan-400";
  const border = theme?.border || "border-cyan-500/30";

  const allSignals = signals && signals.length > 0 ? signals : [];
  const filtered = filter === "ALL" ? allSignals : allSignals.filter((s: any) => s.tradeType === filter);

  const sniperCount = allSignals.filter((s: any) => s.tradeType === "SNIPER_ENTRY").length;

  const copyLevels = (sig: any) => {
    const text = `BLUESCALP VIP SIGNAL\nSymbol: ${sig.symbol}\nAction: ${sig.action}\nEntry: ${sig.entry || sig.entry_price}\nSL: ${sig.stopLoss || sig.sl_price}\nTP1: ${sig.takeProfit1 || sig.tp_price}\nTP2: ${sig.takeProfit2 || "-"}\nTP3: ${sig.takeProfit3 || "-"}\nRR: 1:${sig.riskReward || "2.5"}\nSession: ${sig.session || "London/NY"}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedId(sig.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const speakSniper = (sig: any) => {
    if (!soundEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(
      `VIP Signal Alert. ${sig.displayName || sig.symbol} ${sig.action}. Entry ${sig.entry || sig.entry_price}. Target one ${sig.takeProfit1 || sig.tp_price}. Confluence score ${sig.confluenceScore || "7.5"} out of eight.`
    );
    u.rate = 1.0;
    u.pitch = 1.05;
    window.speechSynthesis.speak(u);
  };

  const getCardStyle = (type: string) => {
    switch (type) {
      case "SNIPER_ENTRY":
        return {
          banner: "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black",
          border: "border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]",
          bg: "bg-gradient-to-b from-[#1a1408] via-[#0b1320] to-[#081525]",
          label: "🎯 VIP SNIPER SETUP",
        };
      case "A_PLUS":
        return {
          banner: "bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 text-white font-black",
          border: "border-blue-400/60 shadow-[0_0_20px_rgba(59,130,246,0.2)]",
          bg: "bg-gradient-to-b from-[#081528] via-[#09172e] to-[#081525]",
          label: "⭐ A+ INSTITUTIONAL",
        };
      case "SCALP":
        return {
          banner: "bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 text-slate-950 font-black",
          border: "border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]",
          bg: "bg-gradient-to-b from-[#08201b] via-[#081a1d] to-[#081525]",
          label: "⚡ HIGH-SPEED SCALP",
        };
      case "SWING":
        return {
          banner: "bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-700 text-white font-black",
          border: "border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]",
          bg: "bg-gradient-to-b from-[#180a29] via-[#0d1226] to-[#081525]",
          label: "📈 SWING RUNNER",
        };
      default:
        return {
          banner: "bg-slate-800 text-slate-200 font-bold",
          border: "border-slate-700",
          bg: "bg-[#081525]",
          label: "INSTITUTIONAL SIGNAL",
        };
    }
  };

  return (
    <div className="w-full flex flex-col gap-3.5">
      {/* HEADER WITH SNIPER BADGE & REFRESH */}
      <div className={`flex items-center justify-between pb-2 border-b ${border}`}>
        <div>
          <h2 className={`text-lg font-black ${primaryText} flex items-center gap-2`}>
            <Radio className={`w-5 h-5 ${accentText} animate-pulse`} />
            Live VIP Signals Feed
          </h2>
          <p className="text-xs text-slate-400">Institutional SMC & Machine Gunner Engine • SAST</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl bg-slate-900 border ${border} text-slate-300 hover:text-white transition`}
            title={soundEnabled ? "Voice Alert Active" : "Voice Alert Muted"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
          <button
            onClick={onRefresh}
            className={`p-2 rounded-xl bg-slate-900 border ${border} ${accentText} hover:text-white active:scale-95 transition`}
            title="Refresh Signals"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* VIP LIVE TICKER - BID / ASK / SPREAD */}
      <div className="w-full overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {[
            { symbol: "XAU/USD", bid: "2,658.20", ask: "2,658.60", spread: "0.4", flag: "🥇" },
            { symbol: "EUR/USD", bid: "1.08740", ask: "1.08750", spread: "1.0", flag: "🇪🇺/🇺🇸" },
            { symbol: "US30", bid: "42,888.0", ask: "42,892.0", spread: "4.0", flag: "🇺🇸" },
            { symbol: "BTC/USD", bid: "81,845.0", ask: "81,855.0", spread: "10.0", flag: "₿" },
            { symbol: "GBP/JPY", bid: "194.240", ask: "194.260", spread: "2.0", flag: "🇬🇧/🇯🇵" },
            { symbol: "NAS100", bid: "20,418.0", ask: "20,422.0", spread: "4.0", flag: "💻" },
          ].map((tick) => (
            <div key={tick.symbol} className={`px-3 py-1.5 rounded-xl bg-[#081525] border ${border} flex items-center gap-2.5 text-[11px]`}>
              <span className="text-xs">{tick.flag}</span>
              <span className="font-bold text-white">{tick.symbol}</span>
              <span className="text-slate-400 font-mono">B: {tick.bid}</span>
              <span className="text-emerald-400 font-mono">A: {tick.ask}</span>
              <span className="text-amber-400 font-mono text-[10px]">({tick.spread}p)</span>
            </div>
          ))}
        </div>
      </div>

      {/* FILTER TABS: ALL | SNIPER | A+ | SCALP | SWING */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { key: "ALL", label: "ALL", badge: `${allSignals.length}` },
          { key: "SNIPER_ENTRY", label: "🎯 Sniper", badge: `${sniperCount}` },
          { key: "A_PLUS", label: "⭐ A+" },
          { key: "SCALP", label: "⚡ Scalp" },
          { key: "SWING", label: "📈 Swing" },
        ].map((tab) => {
          const isSel = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                isSel
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                  : "bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700"
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSel ? "bg-slate-950 text-cyan-300" : "bg-slate-800 text-slate-400"}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SIGNALS LIST */}
      <div className="flex flex-col gap-3.5">
        {filtered.length === 0 ? (
          <div className={`p-8 rounded-2xl bg-[#081525] border ${border} text-center flex flex-col items-center gap-3`}>
            <div className={`w-12 h-12 rounded-full bg-slate-900 border ${border} flex items-center justify-center ${accentText}`}>
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-200">No {filter.replace("_", " ")} Setups Active</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                Monitoring live market flow for matching SMC confluences and liquidity sweeps.
              </p>
            </div>
          </div>
        ) : (
          filtered.map((sig: any) => {
            const style = getCardStyle(sig.tradeType);
            const isBuy = sig.action === "BUY";
            const isCopied = copiedId === sig.id;

            return (
              <div
                key={sig.id}
                className={`rounded-2xl border ${style.border} ${style.bg} overflow-hidden transition-all duration-200`}
              >
                {/* TIER BANNER */}
                <div className={`px-3.5 py-1.5 text-xs flex items-center justify-between ${style.banner}`}>
                  <span className="tracking-wide">{style.label}</span>
                  <span className="text-[10px] font-mono opacity-90">{sig.session || "Live Session"}</span>
                </div>

                <div className="p-4 flex flex-col gap-3">
                  {/* TOP ROW: SYMBOL + ACTION + CONFLUENCE */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{sig.flag || "📈"}</span>
                      <div>
                        <h3 className="text-base font-black text-white flex items-center gap-2">
                          {sig.displayName || sig.symbol}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {sig.time || "Live"} • Spread: {sig.spread || 1.0}p
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-xl font-black text-xs flex items-center gap-1.5 border ${
                          isBuy
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                            : "bg-red-500/20 text-red-300 border-red-400/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isBuy ? "bg-emerald-400 animate-ping" : "bg-red-400 animate-ping"}`} />
                        {sig.action}
                      </span>

                      {sig.confluenceScore && (
                        <span className="px-2 py-1 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-mono text-xs font-bold">
                          ★ {sig.confluenceScore}/8
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4-COLUMN LEVELS BOX: ENTRY | SL | TP1 | TP2 */}
                  <div className="grid grid-cols-4 gap-2 text-center bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 font-mono">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase font-sans">Entry</span>
                      <span className="text-xs font-bold text-white mt-0.5">{sig.entry || sig.entry_price || "Market"}</span>
                    </div>
                    <div className="flex flex-col border-l border-slate-800">
                      <span className="text-[10px] text-red-400 uppercase font-sans">Stop Loss</span>
                      <span className="text-xs font-bold text-red-300 mt-0.5">{sig.stopLoss || sig.sl_price || "ATR"}</span>
                    </div>
                    <div className="flex flex-col border-l border-slate-800">
                      <span className="text-[10px] text-emerald-400 uppercase font-sans">TP1 (1.5R)</span>
                      <span className="text-xs font-bold text-emerald-300 mt-0.5">{sig.takeProfit1 || sig.tp_price || "+40p"}</span>
                    </div>
                    <div className="flex flex-col border-l border-slate-800">
                      <span className="text-[10px] text-emerald-400 uppercase font-sans">TP2 (2.5R)</span>
                      <span className="text-xs font-bold text-emerald-300 mt-0.5">{sig.takeProfit2 || "+75p"}</span>
                    </div>
                  </div>

                  {/* SMC TAGS */}
                  {sig.tags && sig.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {sig.tags.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono font-bold text-cyan-300"
                        >
                          {tag}
                        </span>
                      ))}
                      {sig.riskReward && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/30 text-[10px] font-mono font-bold text-amber-300">
                          RR 1:{sig.riskReward}
                        </span>
                      )}
                    </div>
                  )}

                  {/* REASONS LIST */}
                  {sig.reasons && sig.reasons.length > 0 && (
                    <div className="text-[11px] text-slate-300 bg-slate-900/50 rounded-lg p-2 border border-slate-800/60 leading-relaxed">
                      <span className="text-slate-400 font-semibold">Confluence: </span>
                      {sig.reasons.join(" • ")}
                    </div>
                  )}

                  {/* ACTION BAR: COPY & VOICE */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                    <button
                      onClick={() => speakSniper(sig)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 transition"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Audio Alert</span>
                    </button>

                    <button
                      onClick={() => copyLevels(sig)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${
                        isCopied
                          ? "bg-emerald-400 text-slate-950"
                          : "bg-slate-900 border border-slate-700 text-slate-200 hover:text-white"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>COPIED!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Copy Levels</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

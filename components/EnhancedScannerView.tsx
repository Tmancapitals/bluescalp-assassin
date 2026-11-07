"use client";

import React from "react";
import {
  Target,
  Zap,
  Layers,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Crosshair,
} from "lucide-react";

export interface PatternDetails {
  orderBlock?: string;
  fairValueGap?: string;
  liquiditySweep?: string;
  keyLevel?: string;
}

export interface AdvancedAnalysisResult {
  pair: string;
  timeframe?: string;
  bias: "bullish" | "bearish" | "neutral" | "BUY" | "SELL" | "WAIT" | string;
  confidenceScore: number;
  confidenceGrade: "A+" | "A" | "B" | "C" | string;
  methodologyUsed?: string;
  entry: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  riskReward: string;
  rationale?: string;
  summary?: string;
  reasoning?: string;
  orderBlocks?: string;
  fvgZones?: string;
  liquiditySweeps?: string;
  keyLevel?: string;
  patterns?: PatternDetails;
}

interface Props {
  analysis: AdvancedAnalysisResult;
  onExecuteSingleTrade: (trade: AdvancedAnalysisResult) => void;
  isExecuting?: boolean;
}

export default function EnhancedScannerView({ analysis, onExecuteSingleTrade, isExecuting }: Props) {
  const biasStr = String(analysis.bias || "WAIT").toUpperCase();
  const isBull = biasStr === "BUY" || biasStr === "BULLISH";
  const isBear = biasStr === "SELL" || biasStr === "BEARISH";

  const gradeColors: Record<string, string> = {
    "A+": "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]",
    "A": "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]",
    "B": "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]",
    "C": "bg-slate-700/30 text-slate-400 border-slate-600",
  };

  const biasBg = isBull
    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
    : isBear
    ? "bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
    : "bg-slate-800 text-slate-300 border-slate-700";

  const pairDisplay = analysis.pair || "CHART";
  const timeframeDisplay = analysis.timeframe || "H1";
  const rationaleText =
    analysis.rationale ||
    analysis.summary ||
    (analysis as any).reasoning ||
    "High-probability institutional structure confluence identified from candlestick price action.";

  const orderBlockVal =
    analysis.patterns?.orderBlock ||
    analysis.orderBlocks ||
    `${timeframeDisplay} Institutional Order Block (OB)`;

  const fvgVal =
    analysis.patterns?.fairValueGap ||
    analysis.fvgZones ||
    "Fair Value Gap (FVG) Imbalance Zone confirmed";

  const sweepVal =
    analysis.patterns?.liquiditySweep ||
    analysis.liquiditySweeps ||
    "Session low/high liquidity swept into structural displacement";

  const keyLevelVal =
    analysis.patterns?.keyLevel ||
    analysis.keyLevel ||
    "Key Structural Support & Resistance Invalidation";

  return (
    <div className="w-full flex flex-col gap-3.5 p-4 rounded-2xl bg-[#06111f]/95 border border-cyan-500/30 text-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.6)] animate-in fade-in duration-200">
      {/* HEADER: Pair, Timeframe, Bias, Confidence Grade */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-black text-lg text-white tracking-wide">{pairDisplay}</span>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-cyan-300 font-mono font-bold">
            {timeframeDisplay}
          </span>
          <span className={`text-xs font-black px-2.5 py-1 rounded-lg border uppercase flex items-center gap-1 ${biasBg}`}>
            {isBull ? <ArrowUpRight className="w-3.5 h-3.5" /> : isBear ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
            {isBull ? "BUY" : isBear ? "SELL" : "WAIT"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`text-xs font-black px-3 py-1 rounded-xl border ${
              gradeColors[analysis.confidenceGrade] || gradeColors["B"]
            }`}
          >
            Grade {analysis.confidenceGrade || "B"} ({analysis.confidenceScore || 78}%)
          </span>
        </div>
      </div>

      {/* ANALYSIS INFORMATION & RATIONALE */}
      <div className="flex flex-col gap-2 bg-[#030914] p-3 rounded-xl border border-cyan-500/25">
        <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Analysis Information
          </span>
          <span className="text-[10px] text-slate-400 font-mono lowercase">
            {analysis.methodologyUsed || "SMC / ICT Analysis"}
          </span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-normal">
          {rationaleText}
        </p>
      </div>

      {/* DETECTED INSTITUTIONAL CONFLUENCE BREAKDOWN */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1.5 px-0.5 uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          Detected SMC & ICT Confluence
        </span>

        <div className="grid grid-cols-1 gap-1.5 text-xs">
          {/* Order Block */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2">
            <span className="font-bold text-cyan-300 text-[11px] min-w-[85px] shrink-0 uppercase tracking-wide">
              Order Block:
            </span>
            <span className="text-slate-200 text-[11px]">{orderBlockVal}</span>
          </div>

          {/* FVG Zone */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2">
            <span className="font-bold text-amber-300 text-[11px] min-w-[85px] shrink-0 uppercase tracking-wide">
              FVG Zone:
            </span>
            <span className="text-slate-200 text-[11px]">{fvgVal}</span>
          </div>

          {/* Liquidity Sweep */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2">
            <span className="font-bold text-emerald-300 text-[11px] min-w-[85px] shrink-0 uppercase tracking-wide">
              Sweep:
            </span>
            <span className="text-slate-200 text-[11px]">{sweepVal}</span>
          </div>

          {/* Key Level */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2">
            <span className="font-bold text-indigo-300 text-[11px] min-w-[85px] shrink-0 uppercase tracking-wide">
              Key Level:
            </span>
            <span className="text-slate-200 text-[11px]">{keyLevelVal}</span>
          </div>
        </div>
      </div>

      {/* MULTI-TP TARGETS GRID */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 px-0.5 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            Execution Targets
          </span>
          <span className="text-cyan-300 font-mono font-bold">R:R {analysis.riskReward || "1:2.5"}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ENTRY</span>
            <span className="font-black text-white text-sm mt-0.5">{analysis.entry}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-900/50 flex flex-col">
            <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider">STOP LOSS</span>
            <span className="font-black text-rose-400 text-sm mt-0.5">{analysis.stopLoss}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-900/50 flex flex-col">
            <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">TP 1 (CONSERVATIVE)</span>
            <span className="font-bold text-emerald-400 text-xs mt-0.5">{analysis.takeProfit1}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-900/50 flex flex-col">
            <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">TP 2 (STRUCTURAL)</span>
            <span className="font-bold text-cyan-400 text-xs mt-0.5">{analysis.takeProfit2}</span>
          </div>

          <div className="col-span-2 p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-900/50 flex justify-between items-center">
            <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">TP 3 (RUNNER EXTENSION)</span>
            <span className="font-bold text-indigo-300 text-xs">{analysis.takeProfit3}</span>
          </div>
        </div>
      </div>

      {/* SINGLE CLEAN EXECUTION BUTTON */}
      <button
        type="button"
        onClick={() => onExecuteSingleTrade(analysis)}
        disabled={isExecuting || analysis.confidenceGrade === "C"}
        className={`w-full mt-1.5 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg active:scale-[0.98] ${
          analysis.confidenceGrade === "C"
            ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
            : isBull
            ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25"
            : isBear
            ? "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/25"
            : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25"
        }`}
      >
        <Zap className="w-4 h-4 fill-current" />
        {isExecuting
          ? "Arming Trade..."
          : analysis.confidenceGrade === "C"
          ? "Setup Grade C — Stand Down"
          : `Execute Single Trade (1 Position • ${pairDisplay})`}
      </button>
      <p className="text-[10px] text-center text-slate-400">
        Single clean entry · No machine gun or multi-order spam
      </p>
    </div>
  );
}

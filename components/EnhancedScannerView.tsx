"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Shield, Target, Crosshair, Zap, Layers } from "lucide-react";

export interface PatternDetails {
  orderBlock?: string;
  fairValueGap?: string;
  liquiditySweep?: string;
}

export interface AdvancedAnalysisResult {
  pair: string;
  timeframe?: string;
  bias: "bullish" | "bearish" | "neutral";
  confidenceScore: number;
  confidenceGrade: "A+" | "A" | "B" | "C";
  methodologyUsed?: string;
  entry: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  riskReward: string;
  rationale: string;
  patterns?: PatternDetails;
}

interface Props {
  analysis: AdvancedAnalysisResult;
  onExecuteSingleTrade: (trade: AdvancedAnalysisResult) => void;
  isExecuting?: boolean;
}

export default function EnhancedScannerView({ analysis, onExecuteSingleTrade, isExecuting }: Props) {
  const isBull = analysis.bias === "bullish";
  const isBear = analysis.bias === "bearish";

  const gradeColors: Record<string, string> = {
    "A+": "bg-emerald-500/20 text-emerald-300 border-emerald-500/50",
    "A": "bg-cyan-500/20 text-cyan-300 border-cyan-500/50",
    "B": "bg-amber-500/20 text-amber-300 border-amber-500/50",
    "C": "bg-slate-700/30 text-slate-400 border-slate-600",
  };

  const biasBg = isBull
    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
    : isBear
    ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
    : "bg-slate-800 text-slate-300 border-slate-700";

  return (
    <div className="w-full flex flex-col gap-3 p-3.5 rounded-2xl bg-[#081525]/90 border border-slate-800 text-slate-100 shadow-xl animate-in fade-in">
      {/* HEADER: Pair, Bias, Confidence Grade */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="font-black text-base text-white">{analysis.pair}</span>
          {analysis.timeframe && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              {analysis.timeframe}
            </span>
          )}
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border uppercase ${biasBg}`}>
            {analysis.bias}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
              gradeColors[analysis.confidenceGrade] || gradeColors["B"]
            }`}
          >
            Grade {analysis.confidenceGrade} ({analysis.confidenceScore}%)
          </span>
        </div>
      </div>

      {/* RATIONALE */}
      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
        {analysis.rationale}
      </p>

      {/* MULTI-TP TARGETS GRID */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 px-1">
          <span className="flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            Execution Targets
          </span>
          <span className="text-cyan-300 font-mono">R:R {analysis.riskReward || "1:2"}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400">ENTRY</span>
            <span className="font-bold text-white text-sm">{analysis.entry}</span>
          </div>

          <div className="p-2 rounded-xl bg-rose-950/20 border border-rose-900/40 flex flex-col">
            <span className="text-[10px] text-rose-300">STOP LOSS</span>
            <span className="font-bold text-rose-400 text-sm">{analysis.stopLoss}</span>
          </div>

          <div className="p-2 rounded-xl bg-emerald-950/20 border border-emerald-900/40 flex flex-col">
            <span className="text-[10px] text-emerald-300">TP 1 (CONSERVATIVE)</span>
            <span className="font-bold text-emerald-400">{analysis.takeProfit1}</span>
          </div>

          <div className="p-2 rounded-xl bg-cyan-950/20 border border-cyan-900/40 flex flex-col">
            <span className="text-[10px] text-cyan-300">TP 2 (STRUCTURAL)</span>
            <span className="font-bold text-cyan-400">{analysis.takeProfit2}</span>
          </div>

          <div className="col-span-2 p-2 rounded-xl bg-indigo-950/20 border border-indigo-900/40 flex justify-between items-center">
            <span className="text-[10px] text-indigo-300">TP 3 (RUNNER EXTENSION)</span>
            <span className="font-bold text-indigo-400 text-xs">{analysis.takeProfit3}</span>
          </div>
        </div>
      </div>

      {/* INSTITUTIONAL PATTERN CARDS */}
      {analysis.patterns && (
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 px-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Detected SMC & ICT Confluence
          </span>

          <div className="flex flex-col gap-1.5 text-[11px]">
            {analysis.patterns.orderBlock && (
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2">
                <span className="font-bold text-cyan-300 min-w-[70px]">Order Block:</span>
                <span className="text-slate-300">{analysis.patterns.orderBlock}</span>
              </div>
            )}

            {analysis.patterns.fairValueGap && (
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2">
                <span className="font-bold text-amber-300 min-w-[70px]">FVG Zone:</span>
                <span className="text-slate-300">{analysis.patterns.fairValueGap}</span>
              </div>
            )}

            {analysis.patterns.liquiditySweep && (
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2">
                <span className="font-bold text-emerald-300 min-w-[70px]">Sweep:</span>
                <span className="text-slate-300">{analysis.patterns.liquiditySweep}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SINGLE CLEAN EXECUTION BUTTON */}
      <button
        onClick={() => onExecuteSingleTrade(analysis)}
        disabled={isExecuting || analysis.confidenceGrade === "C"}
        className={`w-full mt-1.5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg ${
          analysis.confidenceGrade === "C"
            ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
            : isBull
            ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
            : isBear
            ? "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20"
            : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20"
        }`}
      >
        <Zap className="w-4 h-4" />
        {isExecuting
          ? "Arming Trade..."
          : analysis.confidenceGrade === "C"
          ? "Setup Grade C — Stand Down"
          : `Execute Single Trade (1 Position • ${analysis.pair})`}
      </button>
      <p className="text-[10px] text-center text-slate-400">
        Single clean entry · No machine gun or multi-order spam
      </p>
    </div>
  );
}

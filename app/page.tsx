"use client";

import React, { useState, useEffect, useRef } from "react";

export default function HomePage() {
  const [licenseKey, setLicenseKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Bot running state
  const [botRunning, setBotRunning] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState("RCG");
  const [signals, setSignals] = useState<any[]>([]);
  const [showSignalHud, setShowSignalHud] = useState(false);

  // Floating draggable bot position
  const [botPos, setBotPos] = useState({ x: 20, y: 120 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  // Check saved license on launch
  useEffect(() => {
    const saved = localStorage.getItem("bsa_license");
    if (saved) {
      setLicenseKey(saved);
      verifyKey(saved);
    }
  }, []);

  const verifyKey = async (keyToTest: string) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: keyToTest.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setUnlocked(true);
        localStorage.setItem("bsa_license", keyToTest.trim());
      } else {
        setErrorMsg(data.message || "Invalid or inactive license key.");
      }
    } catch {
      setErrorMsg("Connection error. Check network.");
    } finally {
      setLoading(false);
    }
  };

  // Draggable touch / mouse handlers
  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    isDragging.current = true;
    hasMoved.current = false;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragStart.current = {
      x: clientX - botPos.x,
      y: clientY - botPos.y,
    };
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging.current) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const dx = Math.abs(clientX - (dragStart.current.x + botPos.x));
    const dy = Math.abs(clientY - (dragStart.current.y + botPos.y));
    if (dx > 5 || dy > 5) {
      hasMoved.current = true;
    }

    const nextX = Math.max(10, Math.min(window.innerWidth - 75, clientX - dragStart.current.x));
    const nextY = Math.max(10, Math.min(window.innerHeight - 75, clientY - dragStart.current.y));
    setBotPos({ x: nextX, y: nextY });
  };

  const handleEnd = () => {
    isDragging.current = false;
  };

  const handleIconClick = () => {
    if (hasMoved.current) return;
    setShowSignalHud((prev) => !prev);
  };

  // 1. Lock Screen View
  if (!unlocked) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full border-2 border-cyan-400 overflow-hidden shadow-cyan-500/20 shadow-lg mb-6">
            <img
              src="/images/bluescalp-bot.jpg"
              alt="BlueScalp Bot"
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="text-2xl font-black tracking-wider text-cyan-400 uppercase mb-1">
            BlueScalp Assassin
          </h1>
          <p className="text-xs text-slate-400 mb-6 uppercase tracking-widest">
            V1.0 • Powered by ProEdge EA
          </p>

          <div className="w-full space-y-4">
            <input
              type="text"
              placeholder="e.g. THA-BNG-AKE-749"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
              className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-3.5 text-center font-mono tracking-widest text-sm text-cyan-300 outline-none transition"
            />

            {errorMsg && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 py-2 rounded-lg">
                {errorMsg}
              </p>
            )}

            <button
              onClick={() => verifyKey(licenseKey)}
              disabled={loading || !licenseKey}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 transition active:scale-95"
            >
              {loading ? "Verifying License..." : "Unlock Terminal"}
            </button>
          </div>

          <p className="text-[10px] text-slate-500 mt-6">
            By Tman Capitals • WhatsApp +27 64 929 1083
          </p>
        </div>
      </main>
    );
  }

  // 2. Unlocked Dashboard View
  return (
    <main
      className="min-h-screen bg-slate-950 text-white p-4 pb-24 select-none"
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
    >
      {/* Floating Draggable Bot Icon */}
      <div
        style={{
          position: "fixed",
          left: `${botPos.x}px`,
          top: `${botPos.y}px`,
          zIndex: 9999,
          touchAction: "none",
        }}
        onTouchStart={handleStart}
        onMouseDown={handleStart}
        onClick={handleIconClick}
        className="w-16 h-16 rounded-full cursor-grab active:cursor-grabbing shadow-2xl border-2 border-cyan-400 overflow-hidden bg-slate-900 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      >
        <img
          src="/images/bluescalp-bot.jpg"
          alt="Floating Bot"
          className="w-full h-full object-cover pointer-events-none"
        />
        {botRunning && (
          <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
        )}
      </div>

      {/* Main Container */}
      <div className="max-w-md mx-auto space-y-4 pt-2">
        <header className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h1 className="text-lg font-black tracking-wide text-cyan-400">
              BLUESCALP ASSASSIN
            </h1>
            <p className="text-[10px] text-slate-400">V1.0 • Tman Capitals</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 text-cyan-300 border border-slate-700">
            PROEDGE EA
          </span>
        </header>

        {/* Engine Status Card */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-wider text-slate-400">
              Machine Gunner Engine
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                botRunning
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {botRunning ? "ACTIVE" : "STANDBY"}
            </span>
          </div>

          <button
            onClick={() => setBotRunning(!botRunning)}
            className={`w-full py-4 rounded-xl font-black text-sm tracking-wider uppercase transition shadow-lg active:scale-95 ${
              botRunning
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20"
                : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20"
            }`}
          >
            {botRunning ? "Stop Execution Engine" : "Start Live Execution Engine"}
          </button>
        </section>

        {/* Allowed Broker Selection */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <label className="text-xs font-medium text-slate-400 block mb-2">
            Target Allowed Broker
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["RCG", "HFM", "FxPro", "JustMarkets"].map((broker) => (
              <button
                key={broker}
                onClick={() => setSelectedBroker(broker)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                  selectedBroker === broker
                    ? "bg-cyan-500/10 border-cyan-400 text-cyan-300"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                {broker}
              </button>
            ))}
          </div>
        </section>

        <p className="text-[11px] text-slate-500 text-center">
          Tap the floating robot icon to view real-time signal telemetry. Drag it anywhere across your screen.
        </p>
      </div>

      {/* Signal HUD Modal (Opened on tapping the robot icon) */}
      {showSignalHud && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <h3 className="text-sm font-bold text-white">Live Signal Radar</h3>
              </div>
              <button
                onClick={() => setShowSignalHud(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Strategy</span>
                <span className="font-mono text-cyan-300 font-semibold">MACHINE GUNNER V1.0</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Timeframes</span>
                <span className="font-mono text-slate-200">H4 + H1 + M15 + M5 + M1</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Target Sessions</span>
                <span className="font-mono text-slate-200">London & New York</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Broker Route</span>
                <span className="font-mono text-cyan-300 font-bold">{selectedBroker}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

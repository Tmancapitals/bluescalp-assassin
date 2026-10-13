'use client';

import React, { useState } from 'react';
import { Play, Pause, DollarSign, Sliders, Scan, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function MobileRobotConsole() {
  const [isRunning, setIsRunning] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  const [mt5Login, setMt5Login] = useState('');
  const [mt5Password, setMt5Password] = useState('');
  const [mt5Server, setMt5Server] = useState('Exness-MT5Real');
  const [licenseKey, setLicenseKey] = useState('');
  const [selectedPairs, setSelectedPairs] = useState(['XAUUSD', 'NAS100', 'US30']);

  const togglePair = (pair: string) => {
    setSelectedPairs((prev) =>
      prev.includes(pair) ? prev.filter((p) => p !== pair) : [...prev, pair]
    );
  };

  return (
    <main className="relative flex flex-col items-center justify-between min-h-screen w-full max-w-md mx-auto bg-black text-white overflow-hidden shadow-2xl border-x border-cyan-900/40 select-none">
      {/* Background Image: BlueScalp Assassin Cyborg */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-65 z-0"
        style={{ backgroundImage: `url('/images/bluescalp-bot.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-transparent to-black/95 z-0" />

      {/* Top Header / Status */}
      <div className="relative z-10 w-full pt-10 pb-4 px-6 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full border-2 border-cyan-400 p-1 mb-2 shadow-[0_0_20px_rgba(6,182,212,0.8)]">
          <img
            src="/images/bluescalp-bot.jpg"
            alt="BlueScalp Avatar"
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <h1 className="text-xl font-black tracking-widest text-cyan-400 drop-shadow-[0_2px_10px_rgba(6,182,212,0.8)] font-mono">
          BLUESCALP ASSASSIN 1.0
        </h1>

        <div className="flex items-center gap-2 mt-1">
          <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-red-500'}`} />
          <span className="text-xs font-semibold tracking-wider text-gray-300">
            {isRunning ? 'LIVE • MACHINE GUNNER ACTIVE' : 'PAUSED • STANDBY'}
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-1.5 mt-3">
          {selectedPairs.map((pair) => (
            <span key={pair} className="px-2 py-0.5 text-[10px] bg-cyan-950/80 border border-cyan-500/40 rounded text-cyan-300 font-mono">
              {pair}
            </span>
          ))}
        </div>
      </div>

      {/* Center Dynamic Area */}
      <div className="relative z-10 w-full px-6 flex flex-col items-center">
        {showScanner ? (
          <div className="w-full bg-black/90 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-4 text-center">
            <h3 className="text-sm font-bold text-cyan-300 mb-2">AI CHART SCANNER</h3>
            <p className="text-xs text-gray-400 mb-4">Upload an MT5 chart screenshot to detect sweeps, MSS & FVGs</p>
            <input type="file" accept="image/*" className="text-xs text-gray-300 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-cyan-600 file:text-white" />
            <button onClick={() => setShowScanner(false)} className="mt-4 block w-full py-2 bg-gray-800 text-xs rounded text-gray-300">
              Close Scanner
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-widest text-cyan-400/80 font-mono">
              London & NY Liquidity Engine
            </p>
          </div>
        )}
      </div>

      {/* Futuristic Floating Glass Controller Bar */}
      <div className="relative z-10 w-full px-6 pb-10 flex flex-col items-center gap-4">
        <div className="flex items-center justify-around w-full py-3 px-4 bg-cyan-950/40 backdrop-blur-xl border border-cyan-500/30 rounded-full shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          {/* Start / Pause */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isRunning ? 'bg-emerald-500 text-black shadow-[0_0_15px_#10b981]' : 'bg-cyan-600/30 text-cyan-300 border border-cyan-400'
            }`}
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>

          {/* Pricing / Subscriptions */}
          <button
            onClick={() => setShowPayModal(true)}
            className="w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-300 active:scale-95"
          >
            <DollarSign size={20} />
          </button>

          {/* Configuration & MT5 Credentials */}
          <button
            onClick={() => setShowConfig(true)}
            className="w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-300 active:scale-95"
          >
            <Sliders size={20} />
          </button>

          {/* Chart AI Scanner */}
          <button
            onClick={() => setShowScanner(true)}
            className="w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-300 active:scale-95"
          >
            <Scan size={20} />
          </button>
        </div>

        {/* Floating Pulse Bot Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full border border-cyan-400 overflow-hidden shadow-[0_0_10px_rgba(6,182,212,0.8)]">
            <img src="/images/bluescalp-bot.jpg" className="w-full h-full object-cover" />
          </div>
          <span className="text-[11px] text-gray-400 font-mono">SAST 09:00-12:00 | 15:00-18:00</span>
        </div>
      </div>

      {/* MT5 Login & Config Modal */}
      {showConfig && (
        <div className="absolute inset-0 z-20 bg-black/95 backdrop-blur-lg p-6 flex flex-col justify-center">
          <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <ShieldCheck size={20} /> MT5 Cloud Connection
          </h2>

          <label className="text-xs text-gray-400 mb-1">License Key</label>
          <input
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            placeholder="BSA-MT5-XXXX-XXXX-2026"
            className="w-full p-2.5 mb-3 bg-gray-900 border border-cyan-500/40 rounded text-sm text-cyan-300 font-mono"
          />

          <label className="text-xs text-gray-400 mb-1">MT5 Login</label>
          <input
            value={mt5Login}
            onChange={(e) => setMt5Login(e.target.value)}
            placeholder="e.g. 1048291"
            className="w-full p-2.5 mb-3 bg-gray-900 border border-cyan-500/40 rounded text-sm text-white"
          />

          <label className="text-xs text-gray-400 mb-1">MT5 Password</label>
          <input
            type="password"
            value={mt5Password}
            onChange={(e) => setMt5Password(e.target.value)}
            placeholder="••••••••"
            className="w-full p-2.5 mb-3 bg-gray-900 border border-cyan-500/40 rounded text-sm text-white"
          />

          <label className="text-xs text-gray-400 mb-1">Broker Server</label>
          <input
            value={mt5Server}
            onChange={(e) => setMt5Server(e.target.value)}
            placeholder="e.g. Exness-MT5Real"
            className="w-full p-2.5 mb-4 bg-gray-900 border border-cyan-500/40 rounded text-sm text-white"
          />

          <label className="text-xs text-gray-400 mb-2">Pairs to Trade</label>
          <div className="flex flex-wrap gap-2 mb-6">
            {['XAUUSD', 'NAS100', 'US30', 'EURUSD', 'BTCUSD', 'GER40'].map((p) => (
              <button
                key={p}
                onClick={() => togglePair(p)}
                className={`px-3 py-1 rounded text-xs font-mono border ${
                  selectedPairs.includes(p) ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-gray-900 border-gray-700 text-gray-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowConfig(false)}
            className="w-full py-3 bg-cyan-500 text-black font-bold text-sm rounded shadow-[0_0_15px_rgba(6,182,212,0.6)]"
          >
            Save & Connect Cloud MT5
          </button>
        </div>
      )}

      {/* Capitec Bank Payment & WhatsApp Modal */}
      {showPayModal && (
        <div className="absolute inset-0 z-20 bg-black/95 backdrop-blur-lg p-6 flex flex-col justify-center">
          <h2 className="text-lg font-bold text-cyan-400 mb-2">Subscribe to BlueScalp</h2>
          <p className="text-xs text-gray-400 mb-4">Choose your pass and transfer to Capitec via EFT.</p>

          <div className="p-4 bg-cyan-950/40 border border-cyan-500/40 rounded-xl mb-3">
            <p className="text-xs text-cyan-400 font-semibold">Quarterly Pass: 3 Months</p>
            <p className="text-xl font-bold text-white">R200 <span className="text-xs font-normal text-gray-400">/ 90 Days</span></p>
          </div>

          <div className="p-4 bg-cyan-950/40 border border-cyan-500/40 rounded-xl mb-4">
            <p className="text-xs text-cyan-400 font-semibold">Lifetime License</p>
            <p className="text-xl font-bold text-white">R600 <span className="text-xs font-normal text-gray-400">one-time</span></p>
          </div>

          <div className="bg-gray-900 p-3 rounded text-xs space-y-1 mb-4 text-gray-300 font-mono">
            <p><span className="text-gray-500">Bank:</span> Capitec</p>
            <p><span className="text-gray-500">Account Holder:</span> T SEAKE</p>
            <p><span className="text-gray-500">Account No:</span> 2201301286</p>
          </div>

          <a
            href="https://wa.me/27649291083?text=Hi%20T%20SEAKE,%20I%20have%20made%20a%20payment%20for%20BlueScalp%20Assassin%20V1.0.%20Attached%20is%20my%20proof%20of%20payment."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-emerald-500 text-black font-bold text-xs rounded text-center flex items-center justify-center gap-2 mb-2"
          >
            <CheckCircle2 size={16} /> Send Proof on WhatsApp (+27 64 929 1083)
          </a>

          <button onClick={() => setShowPayModal(false)} className="w-full py-2 bg-gray-800 text-xs rounded text-gray-300">
            Close
          </button>
        </div>
      )}
    </main>
  );
}

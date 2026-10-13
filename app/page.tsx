'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Play, 
  Pause, 
  DollarSign, 
  TrendingUp, 
  Radio, 
  Activity, 
  Plus, 
  Home, 
  Sliders, 
  ShieldCheck, 
  Zap, 
  Upload, 
  X,
  Pencil,
  ChevronDown,
  Download,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const ALLOWED_BROKERS = [
  { id: 'rcg', name: 'RCG Markets', servers: ['RCGMarkets-Live', 'RCGMarkets-Demo'] },
  { id: 'hfm', name: 'HFM (HF Markets)', servers: ['HFMarketsSA-Live', 'HFMarkets-Live2'] },
  { id: 'fxpro', name: 'FxPro', servers: ['FxPro-MT5-Live', 'FxPro-MT5-Real02'] },
  { id: 'justmarkets', name: 'JustMarkets', servers: ['JustMarkets-Live', 'JustMarkets-Live2'] },
];

const SUPPORTED_PAIRS = ['XAUUSD', 'USDJPY', 'NAS100', 'US30', 'GER40', 'EURUSD', 'BTCUSD', 'XAGUSD'];

export default function MobileConsole() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [licenseInput, setLicenseInput] = useState('');
  const [clientInfo, setClientInfo] = useState<{ clientName: string; expiresAt: string } | null>(null);
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [isActive, setIsActive] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'signals' | 'scanner' | 'settings'>('home');
  const [modalOpen, setModalOpen] = useState<'connect' | 'scanner' | 'signals' | 'status' | 'add_robot' | null>(null);
  
  const [widgetExpanded, setWidgetExpanded] = useState(false);

  const [selectedBroker, setSelectedBroker] = useState(ALLOWED_BROKERS[0].name);
  const [mt5Login, setMt5Login] = useState('');
  const [mt5Server, setMt5Server] = useState(ALLOWED_BROKERS[0].servers[0]);
  const [brokerConnected, setBrokerConnected] = useState(false);

  const [scannerStatus, setScannerStatus] = useState<'idle' | 'scanning' | 'detected'>('idle');

  // Verify stored key with database on startup
  useEffect(() => {
    const savedKey = localStorage.getItem('bluescalp_license_key');
    if (savedKey) {
      verifyKeyWithDatabase(savedKey, true);
    }
  }, []);

  const verifyKeyWithDatabase = async (keyToTest: string, isSilent = false) => {
    if (!isSilent) {
      setAuthError('');
      setIsVerifying(true);
    }

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: keyToTest.trim().toUpperCase() })
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        localStorage.setItem('bluescalp_license_key', keyToTest.trim().toUpperCase());
        setClientInfo({ clientName: data.clientName, expiresAt: data.expiresAt });
        setIsUnlocked(true);
      } else {
        localStorage.removeItem('bluescalp_license_key');
        setIsUnlocked(false);
        if (!isSilent) {
          setAuthError(data.message || 'Invalid or expired license key.');
        }
      }
    } catch {
      if (!isSilent) setAuthError('Connection error verifying license.');
    } finally {
      if (!isSilent) setIsVerifying(false);
    }
  };

  const handleUnlock = () => {
    if (!licenseInput.trim()) return;
    verifyKeyWithDatabase(licenseInput, false);
  };

  const handleLockOut = () => {
    localStorage.removeItem('bluescalp_license_key');
    setIsUnlocked(false);
    setLicenseInput('');
    setClientInfo(null);
  };

  // --- LOCKED TERMINAL VIEW ---
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#030811] text-slate-100 flex items-center justify-center p-4 font-sans select-none">
        <div className="w-full max-w-sm rounded-3xl border-2 border-cyan-500/40 bg-[#06121f] p-6 shadow-[0_0_40px_rgba(6,182,212,0.3)] flex flex-col items-center gap-5 relative overflow-hidden">
          
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <Image 
              src="/images/bluescalp-bot.jpg" 
              alt="BlueScalp Robot" 
              fill 
              className="object-cover object-top"
            />
          </div>

          <div className="relative z-10 w-16 h-16 rounded-full bg-cyan-950/80 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            <Lock className="w-7 h-7 text-cyan-300" />
          </div>

          <div className="relative z-10 text-center">
            <h1 className="text-2xl font-black text-cyan-300 tracking-tight">
              BLUESCALP ASSASSIN
            </h1>
            <p className="text-xs font-semibold text-cyan-400/80 mt-0.5">
              by Tman Capitals • Protected Terminal
            </p>
          </div>

          <div className="relative z-10 w-full flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                Enter Access License Key
              </label>
              <input 
                type="text" 
                placeholder="e.g. BSA-MASTER-TMAN-2026"
                value={licenseInput}
                onChange={(e) => setLicenseInput(e.target.value.toUpperCase())}
                className="w-full bg-slate-900/90 border border-cyan-500/40 rounded-xl p-3.5 text-sm font-mono text-cyan-200 placeholder-slate-500 focus:outline-none focus:border-cyan-300 shadow-inner tracking-wider"
              />
            </div>

            {authError && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-[11px] text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              onClick={handleUnlock}
              disabled={isVerifying || !licenseInput.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 disabled:opacity-50 transition"
            >
              {isVerifying ? 'Verifying with Database...' : 'Activate Terminal'}
            </button>
          </div>

          <div className="relative z-10 w-full pt-4 border-t border-slate-800 flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-300">Need a License?</span>
              <span className="text-cyan-400 font-bold">R200 (3 Mos) / R600 Life</span>
            </div>
            
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-slate-300 space-y-1 text-[11px]">
              <p><strong>Bank:</strong> Capitec Bank</p>
              <p><strong>Account Holder:</strong> T SEAKE</p>
              <p><strong>Account Number:</strong> 2201301286</p>
            </div>

            <a 
              href="https://wa.me/27649291083?text=Hi%20Thabang,%20I%20want%20to%20buy%20a%20license%20key%20for%20BlueScalp%20Assassin" 
              target="_blank" 
              rel="noreferrer"
              className="w-full py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-500/30 transition text-center"
            >
              Request Key on WhatsApp (+27 64 929 1083)
            </a>
          </div>

        </div>
      </div>
    );
  }

  // --- UNLOCKED FULL APP ---
  return (
    <div className="min-h-screen bg-[#030811] text-slate-100 flex justify-center pb-28 font-sans select-none relative overflow-x-hidden">
      <main className="w-full max-w-md px-4 pt-3 flex flex-col gap-3.5">
        
        {/* HERO ROBOT CARD */}
        <div className="relative w-full rounded-[28px] border-2 border-cyan-500/50 bg-[#06121f] p-4 shadow-[0_0_35px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col justify-between min-h-[460px]">
          <div className="absolute inset-0 z-0">
            <Image 
              src="/images/bluescalp-bot.jpg" 
              alt="BlueScalp Robot" 
              fill 
              className="object-cover object-top"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#06121f] via-60%" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider backdrop-blur-md border uppercase transition ${
              isActive 
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.35)]' 
                : 'bg-amber-500/20 border-amber-400/50 text-amber-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {isActive ? 'BOT ACTIVE' : 'BOT PAUSED'}
            </div>

            <button 
              onClick={() => setModalOpen('connect')}
              className="w-8 h-8 rounded-full bg-slate-900/70 border border-white/20 backdrop-blur-md flex items-center justify-center text-slate-200 active:scale-95 transition"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>

          <div className="relative z-10 flex flex-col gap-2.5 mt-auto pt-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-cyan-300 drop-shadow-[0_2px_14px_rgba(6,182,212,0.8)]">
                BLUESCALP ASSASSIN V1.0
              </h1>
              <p className="text-xs font-semibold text-cyan-400/90 tracking-wide mt-0.5">
                by Tman Capitals {clientInfo ? `• Verified: ${clientInfo.clientName}` : ''}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-bold text-cyan-300">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                LIVE
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-semibold text-cyan-200">
                <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                POWERED BY PROEDGE EA
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-cyan-950/40 border border-cyan-500/30 px-3.5 py-2 text-xs backdrop-blur-md mt-1">
              <span className="text-slate-200 font-semibold">The Assassin</span>
              <span className="text-slate-300 font-medium">8 pairs</span>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 font-bold text-[11px]">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                {brokerConnected ? 'Connected' : '2 live'}
              </span>
            </div>
          </div>
        </div>

        {/* MAIN ENGINE BUTTON */}
        <button
          onClick={() => setIsActive(!isActive)}
          className={`w-full py-4 rounded-2xl border-2 font-black tracking-widest text-sm uppercase flex items-center justify-center gap-2.5 transition active:scale-[0.98] ${
            isActive 
              ? 'bg-[#061424] border-cyan-400 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.3)]' 
              : 'bg-[#061d15] border-emerald-400 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
          }`}
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4 fill-cyan-300" />
              PAUSE ENGINE
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-emerald-300" />
              START ENGINE
            </>
          )}
        </button>

        {/* 4 CIRCULAR ACTIONS */}
        <div className="w-full bg-[#081525] border border-cyan-500/20 rounded-2xl py-3.5 px-4 flex items-center justify-between shadow-lg">
          <button onClick={() => setModalOpen('connect')} className="flex flex-col items-center gap-1.5 group">
            <div className="w-13 h-13 rounded-full bg-cyan-950/60 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)] group-active:scale-95 transition">
              <DollarSign className="w-5 h-5 text-cyan-300" />
            </div>
            <span className="text-[11px] font-medium text-slate-300">Connect</span>
          </button>

          <button onClick={() => setModalOpen('scanner')} className="flex flex-col items-center gap-1.5 group">
            <div className="w-13 h-13 rounded-full bg-cyan-950/60 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)] group-active:scale-95 transition">
              <TrendingUp className="w-5 h-5 text-cyan-300" />
            </div>
            <span className="text-[11px] font-medium text-slate-300">Chart Scan</span>
          </button>

          <button onClick={() => setModalOpen('signals')} className="flex flex-col items-center gap-1.5 group">
            <div className="w-13 h-13 rounded-full bg-cyan-950/60 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)] group-active:scale-95 transition">
              <Radio className="w-5 h-5 text-cyan-300" />
            </div>
            <span className="text-[11px] font-medium text-slate-300">Signals</span>
          </button>

          <button onClick={() => setModalOpen('status')} className="flex flex-col items-center gap-1.5 group">
            <div className="w-13 h-13 rounded-full bg-cyan-950/60 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)] group-active:scale-95 transition">
              <Activity className="w-5 h-5 text-cyan-300" />
            </div>
            <span className="text-[11px] font-medium text-slate-300">Status</span>
          </button>
        </div>

        {/* MY ROBOTS SECTION */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-base font-bold text-white tracking-wide">My Robots</h2>
          <button 
            onClick={() => setModalOpen('add_robot')}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            Add New Robot
          </button>
        </div>

        <div className="w-full bg-[#081525] border border-cyan-500/20 rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl border border-cyan-500/40 overflow-hidden bg-slate-900">
              <Image 
                src="/images/bluescalp-bot.jpg" 
                alt="BlueScalp Robot" 
                fill 
                className="object-cover" 
              />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100">Machine Gunner V1.0</p>
              <p className="text-[11px] text-cyan-400 font-medium">8 Pairs • RCG / HFM / FxPro / JustMarkets</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
            ONLINE
          </span>
        </div>

      </main>

      {/* CIRCULAR FLOATING ICON */}
      {isActive && (
        <aside aria-label="Live bot floating status" className="fixed bottom-20 right-4 z-40 flex flex-col items-end">
          {widgetExpanded && (
            <div className="w-76 mb-2 rounded-2xl border-2 border-cyan-400/80 bg-[#071322]/95 backdrop-blur-xl p-3.5 shadow-[0_0_35px_rgba(6,182,212,0.45)] text-xs flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-cyan-500/30">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-black text-cyan-300 tracking-wider text-[11px]">PROEDGE SIGNAL RADAR</span>
                </div>
                <button onClick={() => setWidgetExpanded(false)} className="text-slate-400 hover:text-white">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-[#040a12] border border-cyan-500/30 rounded-xl p-2.5 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-400">XAUUSD • BUY BURST</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">ACTIVE</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-300 pt-1">
                  <p><strong>SL:</strong> 30 pts (ATR)</p>
                  <p><strong>TP:</strong> +45 pts</p>
                  <p><strong>Bullets:</strong> 3 Fired</p>
                  <p><strong>R:R:</strong> 1:2.4</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setWidgetExpanded(!widgetExpanded)}
            className="relative w-14 h-14 rounded-full border-2 border-cyan-400 bg-slate-900 shadow-[0_0_22px_rgba(6,182,212,0.6)] flex items-center justify-center p-0.5 active:scale-90 transition transform"
          >
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image 
                src="/images/bluescalp-bot.jpg" 
                alt="Bot Icon" 
                fill 
                className="object-cover" 
              />
            </div>
            <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#030811] animate-pulse" />
          </button>
        </aside>
      )}

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#050e1a]/95 backdrop-blur-xl border-t border-cyan-500/20 py-2.5 px-6 flex justify-between items-center z-40">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition ${activeTab === 'home' ? 'text-cyan-300' : 'text-slate-400'}`}>
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <button onClick={() => { setActiveTab('signals'); setModalOpen('signals'); }} className={`flex flex-col items-center gap-1 transition ${activeTab === 'signals' ? 'text-cyan-300' : 'text-slate-400'}`}>
          <Radio className="w-5 h-5" />
          <span className="text-[10px] font-bold">Signals</span>
        </button>

        <button onClick={() => { setActiveTab('scanner'); setModalOpen('scanner'); }} className={`flex flex-col items-center gap-1 transition ${activeTab === 'scanner' ? 'text-cyan-300' : 'text-slate-400'}`}>
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] font-bold">Scanner</span>
        </button>

        <button onClick={() => { setActiveTab('settings'); setModalOpen('connect'); }} className={`flex flex-col items-center gap-1 transition ${activeTab === 'settings' ? 'text-cyan-300' : 'text-slate-400'}`}>
          <Sliders className="w-5 h-5" />
          <span className="text-[10px] font-bold">Settings</span>
        </button>
      </nav>

      {/* BROKER & LICENSE MODAL */}
      {modalOpen === 'connect' && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#081525] border border-cyan-500/40 rounded-3xl p-6 flex flex-col gap-4 shadow-[0_0_40px_rgba(6,182,212,0.3)] max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-cyan-300">Broker & License Hub</h3>
                <p className="text-xs text-slate-400">Exclusive 4-Broker Execution Bridge</p>
              </div>
              <button onClick={() => setModalOpen(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Active: {clientInfo?.clientName || 'Master Access'}
              </span>
              <button onClick={handleLockOut} className="text-[10px] text-red-400 underline hover:text-red-300">
                Log Out
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Select Allowed Broker</label>
              <select 
                value={selectedBroker} 
                onChange={(e) => {
                  setSelectedBroker(e.target.value);
                  const b = ALLOWED_BROKERS.find(item => item.name === e.target.value);
                  if (b) setMt5Server(b.servers[0]);
                }}
                className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-400"
              >
                {ALLOWED_BROKERS.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Broker Server</label>
              <input 
                type="text" 
                value={mt5Server}
                onChange={(e) => setMt5Server(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">MT5 Account Number</label>
              <input 
                type="number" 
                placeholder="e.g. 52049102"
                value={mt5Login}
                onChange={(e) => setMt5Login(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button 
              onClick={() => {
                setBrokerConnected(true);
                setModalOpen(null);
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 font-bold text-sm tracking-wide shadow-md active:scale-95 transition"
            >
              Save & Link Broker
            </button>

          </div>
        </div>
      )}

      {/* SCANNER MODAL */}
      {modalOpen === 'scanner' && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#081525] border border-cyan-500/40 rounded-3xl p-6 flex flex-col gap-4 shadow-[0_0_40px_rgba(6,182,212,0.3)]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-cyan-300">AI Chart Scanner</h3>
              <button onClick={() => setModalOpen(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div 
              onClick={() => {
                setScannerStatus('scanning');
                setTimeout(() => setScannerStatus('detected'), 2000);
              }}
              className="border-2 border-dashed border-cyan-500/40 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 bg-slate-900/60 cursor-pointer hover:border-cyan-400 transition"
            >
              <Upload className="w-8 h-8 text-cyan-400" />
              <p className="text-xs font-semibold text-slate-200">Tap to upload chart screenshot</p>
            </div>
            {scannerStatus === 'detected' && (
              <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-xl p-3 text-xs space-y-1">
                <p className="font-bold text-emerald-400">✓ Valid Setup Detected (XAUUSD)</p>
                <p className="text-slate-300">H1 Sweep Confirmed • Bullish MSS on M1 • FVG Retest</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SIGNALS MODAL */}
      {modalOpen === 'signals' && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#081525] border border-cyan-500/40 rounded-3xl p-6 flex flex-col gap-4 shadow-[0_0_40px_rgba(6,182,212,0.3)] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-cyan-300">Live Signals Feed</h3>
              <button onClick={() => setModalOpen(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-emerald-400">BUY XAUUSD (Gold)</span>
                  <p className="text-[10px] text-slate-400">TP: +45 pts | SL: 30 pts | 3 Bullets</p>
                </div>
                <span className="text-xs font-mono text-cyan-300">EXECUTED</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATUS MODAL */}
      {modalOpen === 'status' && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#081525] border border-cyan-500/40 rounded-3xl p-6 flex flex-col gap-4 shadow-[0_0_40px_rgba(6,182,212,0.3)]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-cyan-300">System Performance</h3>
              <button onClick={() => setModalOpen(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <p className="text-slate-400">Latency</p>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">14ms</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <p className="text-slate-400">Allowed Brokers</p>
                <p className="text-sm font-bold text-cyan-300 mt-0.5">RCG, HFM, FxPro, JM</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD ROBOT MODAL */}
      {modalOpen === 'add_robot' && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#081525] border border-cyan-500/40 rounded-3xl p-6 flex flex-col gap-4 shadow-[0_0_40px_rgba(6,182,212,0.3)]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-cyan-300">Add New Robot</h3>
              <button onClick={() => setModalOpen(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Only mentor <strong>Thabang Seake (Tman Capitals)</strong> is authorized to register custom robots.
            </p>
            <button onClick={() => setModalOpen(null)} className="w-full py-3 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs">
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

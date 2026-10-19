"use client";

import VipSignalsView from "@/components/VipSignalsView";
import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  DollarSign,
  TrendingUp,
  Radio,
  Activity,
  Home,
  Sliders,
  ShieldCheck,
  Zap,
  Upload,
  ChevronDown,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  LogOut,
  Layers,
  X,
  Palette,
  Type,
  Square,
  Circle,
  Video,
  AppWindow,
  Crosshair,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Target,
  Cpu,
  Sparkles,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  FileImage,
  Check,
  Mic,
  MicOff
} from "lucide-react";

const ALLOWED_BROKERS = [
  { id: "rcg", name: "RCG Markets", servers: ["RCGMarkets-Live", "RCGMarkets-Demo"] },
  { id: "hfm", name: "HFM (HF Markets)", servers: ["HFMarketsSA-Live", "HFMarkets-Live2"] },
  { id: "fxpro", name: "FxPro", servers: ["FxPro-MT5-Live", "FxPro-MT5-Real02"] },
  { id: "justmarkets", name: "JustMarkets", servers: ["JustMarkets-Live", "JustMarkets-Live2"] },
];

type ThemeColor = "cyan" | "emerald" | "amber" | "crimson" | "purple";
type BotShape = "rectangle" | "circle";
type FontFamily = "sans" | "mono" | "tech";
type TradingStyle = "scalp" | "intraday" | "swing";

interface ScannerAnalysisResult {
  pair: string;
  timeframe: string;
  direction: "BUY" | "SELL";
  grade: "SNIPER A+" | "GRADE A";
  confidence: number;
  consensusScore: number;
  enginesAgreed: string[];
  entryPrice: string;
  entryZone: string;
  stopLoss: string;
  slPips: string;
  tp1: string;
  tp2: string;
  tp3: string;
  tp4: string;
  tp5: string;
  riskReward: string;
  invalidation: string;
  confluences: string[];
  orderType: string;
  timestamp: string;
}

const SCANNER_POPULAR_PAIRS: string[] = [
  "XAUUSD", "NAS100", "US30", "GER40", "EURUSD", "USDJPY", "BTCUSD", "XAGUSD"
];

const SCANNER_ENGINES: { id: string; label: string; focus: string }[] = [
  { id: "smc", label: "SMC Engine", focus: "Smart Money Concepts & Imbalances" },
  { id: "ict", label: "ICT Sweeps", focus: "Liquidity Pools & Judas Swings" },
  { id: "machine_gunner", label: "Machine Gunner", focus: "3-Bullet Burst Orderflow" },
  { id: "ob", label: "Order Blocks", focus: "Institutional Mitigation Zones" },
  { id: "structure", label: "Market Structure", focus: "BOS, CHoCH & Trend Shifts" },
  { id: "fvg", label: "Fair Value Gap", focus: "Imbalance Rebalance Zones" },
  { id: "crt", label: "Candle Range", focus: "CRT Expansion & Compression" },
  { id: "trend", label: "Trend Exhaustion", focus: "Momentum & Volume Divergence" },
  { id: "breakout", label: "Session Breakout", focus: "London & New York Open Ranges" },
  { id: "snr", label: "Support / Res", focus: "High-Volume Reaction Levels" },
];


export default function MobileConsole() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [licenseInput, setLicenseInput] = useState("");
  const [activeKey, setActiveKey] = useState("");
  const [clientInfo, setClientInfo] = useState<{ clientName: string; expiresAt: string } | null>(null);
  const [authError, setAuthError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const [isActive, setIsActive] = useState(true);
  const [activeTab, setActiveTab] = useState<"home" | "signals" | "scanner" | "settings">("home");
  const [modalOpen, setModalOpen] = useState<"connect" | "status" | null>(null);

  // Appearance & Customization Settings
  const [botShape, setBotShape] = useState<BotShape>("rectangle");
  const [themeColor, setThemeColor] = useState<ThemeColor>("cyan");
  const [fontFamily, setFontFamily] = useState<FontFamily>("sans");
  const [overlayEnabled, setOverlayEnabled] = useState(true);
  const [videoBgEnabled, setVideoBgEnabled] = useState(false);
  const [videoBgUrl, setVideoBgUrl] = useState("https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-blue-screens-with-charts-and-data-42776-large.mp4");

  // ==========================================
  // ENHANCED CHART AI SCANNER STATE (BLUESPARK/BLUESCALP SUITE)
  // ==========================================
  const [tradingStyle, setTradingStyle] = useState<TradingStyle>("scalp");
  const [selectedScannerPair, setSelectedScannerPair] = useState<string>("XAUUSD");
  const [selectedScannerTf, setSelectedScannerTf] = useState<string>("M5");
  const [activeEngines, setActiveEngines] = useState<string[]>(["smc", "ict", "machine_gunner"]);
  const [uploadedChartImg, setUploadedChartImg] = useState<string | null>(null);
  const [isScanningChart, setIsScanningChart] = useState<boolean>(false);
  const [chartAnalysis, setChartAnalysis] = useState<ScannerAnalysisResult | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [showTuningModal, setShowTuningModal] = useState<boolean>(false);
  const [tuningConfig, setTuningConfig] = useState({
    sensitivity: 3,
    strictness: 4,
    minConfluences: 3,
    minRR: 3,
  });
  const [queueNotice, setQueueNotice] = useState<string | null>(null);
  const chartFileInputRef = useRef<HTMLInputElement | null>(null);

  const toggleEngine = (id: string) => {
    setActiveEngines(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(x => x !== id) : prev) 
        : [...prev, id]
    );
  };

  const handleChartImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload a PNG or JPG chart screenshot.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      setUploadedChartImg(b64);
      runChartAnalysis(b64);
    };
    reader.readAsDataURL(file);
  };

  const speakAnalysisSignal = (res: ScannerAnalysisResult) => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const text = `BlueScalp Assassin markup. ${res.grade} ${res.direction} detected on ${res.pair}. Entry at ${res.entryPrice}. Stop Loss at ${res.stopLoss}. Take Profit 1 at ${res.tp1}. Take Profit 2 at ${res.tp2}. Estimated risk to reward ratio ${res.riskReward}.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const runChartAnalysis = async (imgSrc?: string | null) => {
    setIsScanningChart(true);
    setChartAnalysis(null);
    setQueueNotice(null);

    const imageToSend = imgSrc || uploadedChartImg;

      alert("Please upload a chart screenshot first.");
      setIsScanningChart(false);
      return;
    }

    try {
      const res = await fetch("/api/scan-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageToSend,
          pair: selectedScannerPair,
          timeframe: selectedScannerTf,
          engines: activeEngines,
        }),
      });

        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Analysis failed with status ${res.status}`);
      }

      const result: ScannerAnalysisResult = await res.json();
      setChartAnalysis(result);
      speakAnalysisSignal(result);
    } catch (err: any) {
      alert("Chart AI Scan Error: " + (err.message || "Could not read chart image"));
    } finally {
      setIsScanningChart(false);
    }
  };

  const queueToMachineGunner = () => {
    if (!chartAnalysis) return;
    setQueueNotice(`Armed 3-Bullet Machine Gunner for ${chartAnalysis.pair} ${chartAnalysis.direction} @ ${chartAnalysis.entryPrice}!`);
    setTimeout(() => setQueueNotice(null), 4000);
  };

  // Floating draggable bot icon state
  const [botPos, setBotPos] = useState({ x: 20, y: 160 });
  const [widgetExpanded, setWidgetExpanded] = useState(false);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  // Broker connection state
  const [selectedBroker, setSelectedBroker] = useState(ALLOWED_BROKERS[0].name);
  const [mt5Login, setMt5Login] = useState("");
  const [mt5Server, setMt5Server] = useState(ALLOWED_BROKERS[0].servers[0]);
  const [brokerConnected, setBrokerConnected] = useState(false);

  // Live signals state
  const [signals, setSignals] = useState<any[]>([]);
  const [latestSignal, setLatestSignal] = useState<any>(null);

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("bsa_license") || localStorage.getItem("bluescalp_license_key");
    if (saved) {
      setActiveKey(saved);
      setIsUnlocked(true);
      verifyKeyWithDatabase(saved, true);
    }

    const savedShape = localStorage.getItem("bsa_shape") as BotShape;
    if (savedShape) setBotShape(savedShape);

    const savedColor = localStorage.getItem("bsa_color") as ThemeColor;
    if (savedColor) setThemeColor(savedColor);

    const savedFont = localStorage.getItem("bsa_font") as FontFamily;
    if (savedFont) setFontFamily(savedFont);

    const savedOverlay = localStorage.getItem("bsa_overlay");
    if (savedOverlay !== null) setOverlayEnabled(savedOverlay === "true");

    const savedVideo = localStorage.getItem("bsa_video_bg");
    if (savedVideo !== null) setVideoBgEnabled(savedVideo === "true");
  }, []);

  // Poll for live signals every 10 seconds if active & unlocked
  useEffect(() => {
    if (!isUnlocked || !activeKey) return;
    fetchSignals();
    const interval = setInterval(fetchSignals, 10000);
    return () => clearInterval(interval);
  }, [isUnlocked, activeKey]);

  const fetchSignals = async () => {
    if (!activeKey) return;
    try {
      const res = await fetch("/api/mt5/signals", {
        headers: { "x-license-key": activeKey },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setSignals(data);
          if (data.length > 0) setLatestSignal(data[0]);
        }
      }
    } catch (e) {
      console.error("Error fetching signals:", e);
    }
  };

  const verifyKeyWithDatabase = async (keyToTest: string, isSilent = false) => {
    if (!isSilent) {
      setAuthError("");
      setIsVerifying(true);
    }

    try {
      const cleanKey = keyToTest.trim().toUpperCase();

      // Master key bypass
      if (cleanKey === "THA-BNG-AKE-749" || cleanKey === "BSA-MASTER-TMAN-2026") {
        localStorage.setItem("bsa_license", cleanKey);
        localStorage.setItem("bluescalp_license_key", cleanKey);
        setActiveKey(cleanKey);
        setClientInfo({ clientName: "Thabang Seake (Master)", expiresAt: "2036-12-31T23:59:59Z" });
        setIsUnlocked(true);
        if (!isSilent) setIsVerifying(false);
        return;
      }
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: cleanKey }),
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        localStorage.setItem("bsa_license", cleanKey);
        localStorage.setItem("bluescalp_license_key", cleanKey);
        setActiveKey(cleanKey);
        setClientInfo({ clientName: data.clientName, expiresAt: data.expiresAt });
        setIsUnlocked(true);
      } else {
        if (!isSilent) {
          setAuthError(data.message || "Invalid or expired license key.");
        } else {
          localStorage.removeItem("bsa_license");
          localStorage.removeItem("bluescalp_license_key");
          setActiveKey("");
          setIsUnlocked(false);
        }
      }
    } catch {
      if (!isSilent) setAuthError("Connection error verifying license.");
    } finally {
      if (!isSilent) setIsVerifying(false);
    }
  };

  const handleUnlock = () => {
    if (!licenseInput.trim()) return;
    verifyKeyWithDatabase(licenseInput, false);
  };

  const handleLockOut = () => {
    localStorage.removeItem("bsa_license");
    localStorage.removeItem("bluescalp_license_key");
    setIsUnlocked(false);
    setActiveKey("");
    setLicenseInput("");
    setClientInfo(null);
  };

  // Draggable touch / mouse handlers for floating robot icon
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    isDragging.current = true;
    hasMoved.current = false;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragStart.current = {
      x: clientX - botPos.x,
      y: clientY - botPos.y,
    };
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
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

  const handleDragEnd = () => {
    isDragging.current = false;
  };

  const handleIconClick = () => {
    if (hasMoved.current) return;
    setWidgetExpanded((prev) => !prev);
  };

  // Theme styling helpers
  const getThemeClasses = () => {
    switch (themeColor) {
      case "emerald":
        return {
          primaryText: "text-emerald-300",
          accentText: "text-emerald-400",
          border: "border-emerald-500/40",
          cardBorder: "border-emerald-400/60",
          shadow: "shadow-[0_0_30px_rgba(16,185,129,0.3)]",
          glow: "drop-shadow-[0_2px_14px_rgba(16,185,129,0.8)]",
          badgeBg: "bg-emerald-950/80 border-emerald-500/40 text-emerald-300",
          buttonBg: "bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-950",
          pulseColor: "bg-emerald-400",
        };
      case "amber":
        return {
          primaryText: "text-amber-300",
          accentText: "text-amber-400",
          border: "border-amber-500/40",
          cardBorder: "border-amber-400/60",
          shadow: "shadow-[0_0_30px_rgba(245,158,11,0.3)]",
          glow: "drop-shadow-[0_2px_14px_rgba(245,158,11,0.8)]",
          badgeBg: "bg-amber-950/80 border-amber-500/40 text-amber-300",
          buttonBg: "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950",
          pulseColor: "bg-amber-400",
        };
      case "crimson":
        return {
          primaryText: "text-rose-300",
          accentText: "text-rose-400",
          border: "border-rose-500/40",
          cardBorder: "border-rose-400/60",
          shadow: "shadow-[0_0_30px_rgba(244,63,94,0.3)]",
          glow: "drop-shadow-[0_2px_14px_rgba(244,63,94,0.8)]",
          badgeBg: "bg-rose-950/80 border-rose-500/40 text-rose-300",
          buttonBg: "bg-gradient-to-r from-rose-400 to-rose-500 text-white font-bold",
          pulseColor: "bg-rose-400",
        };
      case "purple":
        return {
          primaryText: "text-fuchsia-300",
          accentText: "text-fuchsia-400",
          border: "border-fuchsia-500/40",
          cardBorder: "border-fuchsia-400/60",
          shadow: "shadow-[0_0_30px_rgba(217,70,239,0.3)]",
          glow: "drop-shadow-[0_2px_14px_rgba(217,70,239,0.8)]",
          badgeBg: "bg-fuchsia-950/80 border-fuchsia-500/40 text-fuchsia-300",
          buttonBg: "bg-gradient-to-r from-fuchsia-400 to-fuchsia-500 text-slate-950 font-bold",
          pulseColor: "bg-fuchsia-400",
        };
      case "cyan":
      default:
        return {
          primaryText: "text-cyan-300",
          accentText: "text-cyan-400",
          border: "border-cyan-500/40",
          cardBorder: "border-cyan-400/60",
          shadow: "shadow-[0_0_30px_rgba(6,182,212,0.3)]",
          glow: "drop-shadow-[0_2px_14px_rgba(6,182,212,0.8)]",
          badgeBg: "bg-cyan-950/80 border-cyan-500/40 text-cyan-300",
          buttonBg: "bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950",
          pulseColor: "bg-cyan-400",
        };
    }
  };

  const theme = getThemeClasses();

  const getFontClass = () => {
    if (fontFamily === "mono") return "font-mono";
    if (fontFamily === "tech") return "font-sans tracking-wide";
    return "font-sans";
  };

  // 1. Lock Screen
  if (!isUnlocked) {
    return (
      <div className={`min-h-screen bg-[#030811] text-slate-100 flex items-center justify-center p-4 select-none ${getFontClass()}`}>
        <div className="w-full max-w-sm rounded-3xl border-2 border-cyan-500/40 bg-[#06121f] p-6 shadow-[0_0_40px_rgba(6,182,212,0.3)] flex flex-col items-center gap-5 relative overflow-hidden">
          <div className="w-20 h-20 rounded-full bg-cyan-950/80 border-2 border-cyan-400 overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            <img 
              src="/images/bluescalp-bot.jpg" 
              alt="BlueScalp Robot" 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-black text-cyan-300 tracking-tight">
              BLUESCALP ASSASSIN
            </h1>
            <p className="text-xs font-semibold text-cyan-400/80 mt-0.5">
              by Tman Capitals • Protected Terminal
            </p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                Enter Access License Key
              </label>
              <input 
                type="text" 
                placeholder="e.g. BSA-847-X92-310"
                value={licenseInput}
                onChange={(e) => setLicenseInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === "Enter") handleUnlock(); }}
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
              {isVerifying ? "Verifying with Database..." : "Activate Terminal"}
            </button>
          </div>

          <div className="w-full pt-4 border-t border-slate-800 flex flex-col gap-2.5 text-xs">
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

            <a 
              href="/web" 
              className="w-full py-2 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-400 hover:text-cyan-300 text-[11px] font-semibold text-center transition"
            >
              Visit Website & Learn More →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unlocked Main Console
  return (
    <div 
      className={`min-h-screen bg-[#030811] text-slate-100 flex justify-center pb-24 select-none relative overflow-x-hidden ${getFontClass()}`}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
    >
      {/* Background Video Option */}
      {videoBgEnabled && (
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="fixed inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0"
        >
          <source src={videoBgUrl} type="video/mp4" />
        </video>
      )}

      <div className="w-full max-w-md px-4 pt-3 flex flex-col gap-3.5 relative z-10">
        
        {/* VIEW 1: HOME TAB */}
        {activeTab === "home" && (
          <>
            {/* HERO ROBOT CARD: Supports Rectangle OR Circle Shape */}
            {botShape === "rectangle" ? (
              <div className={`relative w-full rounded-[28px] border-2 ${theme.cardBorder} bg-[#06121f] p-4 ${theme.shadow} overflow-hidden flex flex-col justify-between min-h-[440px] transition-all`}>
                <div className="absolute inset-0 z-0">
                  <img 
                    src="/images/bluescalp-bot.jpg" 
                    alt="BlueScalp Robot" 
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#06121f] via-60%" />
                </div>

                {/* Status Header */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider backdrop-blur-md border uppercase transition ${
                    isActive 
                      ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.35)]" 
                      : "bg-amber-500/20 border-amber-400/50 text-amber-300"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                    {isActive ? "BOT ACTIVE" : "BOT PAUSED"}
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-[10px] font-mono text-slate-300 backdrop-blur-md">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    SAST SESSIONS
                  </div>
                </div>

                {/* Title & Badges */}
                <div className="relative z-10 flex flex-col gap-2.5 mt-auto pt-6">
                  <div>
                    <h1 className={`text-3xl font-black tracking-tight ${theme.primaryText} ${theme.glow}`}>
                      BLUESCALP ASSASSIN V1.0
                    </h1>
                    <p className={`text-xs font-semibold ${theme.accentText} tracking-wide mt-0.5`}>
                      by Tman Capitals {clientInfo ? `• Verified: ${clientInfo.clientName}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/60 text-[11px] font-extrabold text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      LIVE
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${theme.badgeBg} text-[11px] font-semibold`}>
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      POWERED BY PROEDGE EA
                    </div>
                  </div>

                  {/* Info bar with MONITORING instead of listening */}
                  <div className="flex items-center justify-between rounded-xl bg-slate-950/60 border border-slate-800 px-3.5 py-2 text-xs backdrop-blur-md mt-1">
                    <span className="text-slate-200 font-semibold">The Assassin</span>
                    <span className="text-slate-300 font-medium">8 Pairs Active</span>
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/50 text-emerald-300 font-bold text-[11px]">
                      <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                      {brokerConnected ? "Live" : "Monitoring"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* CIRCLE SHAPE (Does not fit whole screen so background appears!) */
              <div className={`w-full rounded-[28px] border-2 ${theme.cardBorder} bg-[#06121f]/70 p-5 ${theme.shadow} flex flex-col items-center gap-4 text-center backdrop-blur-md`}>
                <div className="w-full flex items-center justify-between">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider border uppercase ${
                    isActive 
                      ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300" 
                      : "bg-amber-500/20 border-amber-400/50 text-amber-300"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                    {isActive ? "BOT ACTIVE" : "BOT PAUSED"}
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/60 text-[11px] font-extrabold text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    LIVE
                  </div>
                </div>

                {/* Circular image floating in the middle allowing background to appear */}
                <div className={`w-48 h-48 rounded-full border-4 ${theme.cardBorder} overflow-hidden ${theme.shadow} p-1 bg-slate-900 my-2`}>
                  <img 
                    src="/images/bluescalp-bot.jpg" 
                    alt="BlueScalp Robot" 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                <div>
                  <h1 className={`text-2xl font-black ${theme.primaryText} ${theme.glow}`}>
                    BLUESCALP ASSASSIN V1.0
                  </h1>
                  <p className={`text-xs font-semibold ${theme.accentText} mt-0.5`}>
                    by Tman Capitals • POWERED BY PROEDGE EA
                  </p>
                </div>

                <div className="w-full flex items-center justify-between rounded-xl bg-slate-950/70 border border-slate-800 px-3.5 py-2 text-xs">
                  <span className="text-slate-300 font-medium">8 Pairs Active</span>
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/50 text-emerald-300 font-bold text-[11px]">
                    <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                    {brokerConnected ? "Live" : "Monitoring"}
                  </span>
                </div>
              </div>
            )}

            {/* SINGLE PRIMARY ENGINE TOGGLE */}
            <button
              onClick={() => setIsActive(!isActive)}
              className={`w-full py-4 rounded-2xl border-2 font-black tracking-widest text-sm uppercase flex items-center justify-center gap-2.5 transition active:scale-[0.98] ${
                isActive 
                  ? "bg-[#061424] border-cyan-400 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.3)]" 
                  : "bg-[#061d15] border-emerald-400 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
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

            {/* 4 CIRCULAR ACTION BUTTONS WITH EXACT USER NAMES */}
            <div className={`w-full bg-[#081525] border ${theme.border} rounded-2xl py-3.5 px-3 flex items-center justify-between shadow-lg`}>
              {/* 1. Connect */}
              <button onClick={() => setModalOpen("connect")} className="flex flex-col items-center gap-1.5 group">
                <div className={`w-12 h-12 rounded-full bg-slate-900 border ${theme.border} flex items-center justify-center ${theme.accentText} shadow-md group-active:scale-95 transition`}>
                  <DollarSign className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-slate-300">Connect</span>
              </button>

              {/* 2. Chart Scanner (full name) */}
              <button onClick={() => setActiveTab("scanner")} className="flex flex-col items-center gap-1.5 group">
                <div className={`w-12 h-12 rounded-full bg-slate-900 border ${theme.border} flex items-center justify-center ${theme.accentText} shadow-md group-active:scale-95 transition`}>
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-slate-300">Chart Scanner</span>
              </button>

              {/* 3. Signals (shows live signals) */}
              <button onClick={() => setActiveTab("signals")} className="flex flex-col items-center gap-1.5 group">
                <div className={`w-12 h-12 rounded-full bg-slate-900 border ${theme.border} flex items-center justify-center ${theme.accentText} shadow-md group-active:scale-95 transition`}>
                  <Radio className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-slate-300">Signals</span>
              </button>

              {/* 4. Status (shows bot signals details) */}
              <button onClick={() => setModalOpen("status")} className="flex flex-col items-center gap-1.5 group">
                <div className={`w-12 h-12 rounded-full bg-slate-900 border ${theme.border} flex items-center justify-center ${theme.accentText} shadow-md group-active:scale-95 transition`}>
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-slate-300">Status</span>
              </button>
            </div>

            {/* MY ROBOTS SECTION (Only shows BLUESCALP ASSASSIN V1.0, NO allowed brokers) */}
            <div className="flex items-center justify-between pt-1">
              <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                <Layers className={`w-4 h-4 ${theme.accentText}`} />
                My Robots
              </h2>
              <span className={`text-[10px] ${theme.accentText} font-bold bg-slate-900 px-2 py-0.5 rounded border ${theme.border}`}>
                Active
              </span>
            </div>

            <div className={`w-full bg-[#081525] border ${theme.border} rounded-2xl p-3.5 flex items-center justify-between shadow-md`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl border ${theme.border} overflow-hidden bg-slate-900 shrink-0`}>
                  <img 
                    src="/images/bluescalp-bot.jpg" 
                    alt="BlueScalp Robot" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">BLUESCALP ASSASSIN V1.0</p>
                  <p className={`text-[11px] ${theme.accentText} font-medium`}>Machine Gunner Strategy • 3-Bullet Burst</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                ONLINE
              </span>
            </div>
          </>
        )}

        {/* VIEW 2: SIGNALS TAB (UPGRADED VIP LIVE SMC SIGNALS) */}
        {activeTab === "signals" && (
          <VipSignalsView signals={signals} onRefresh={fetchSignals} theme={theme} />
        )}

        {/* VIEW 3: SCANNER TAB (With Trading Style: Scalp, Intraday, Swing) */}
        {activeTab === "scanner" && (
          <div className="w-full flex flex-col gap-3.5">
            {/* SCANNER HEADER */}
            <div className={`pb-2.5 border-b ${theme.border} flex items-center justify-between`}>
              <div>
                <h2 className={`text-lg font-black ${theme.primaryText} flex items-center gap-2`}>
                  <TrendingUp className={`w-5 h-5 ${theme.accentText}`} />
                  AI Chart Scanner & Multi-Radar
                </h2>
                <p className="text-xs text-slate-400">Institutional SMC, ICT & Machine Gunner Analysis</p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  title={voiceEnabled ? "Voice Enabled" : "Voice Muted"}
                  className={`p-2 rounded-xl border transition ${
                    voiceEnabled 
                      ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300" 
                      : "bg-slate-900 border-slate-700 text-slate-500"
                  }`}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setShowTuningModal(!showTuningModal)}
                  title="Analyzer Sensitivity & Tuning"
                  className={`p-2 rounded-xl border transition ${
                    showTuningModal 
                      ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300" 
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* TUNING PANEL (COLLAPSIBLE) */}
            {showTuningModal && (
              <div className={`p-3.5 rounded-2xl bg-[#081525] border ${theme.border} flex flex-col gap-3 shadow-lg animate-in fade-in`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sliders className={`w-3.5 h-3.5 ${theme.accentText}`} />
                    Engine Tuning & Sensitivity
                  </span>
                  <button 
                    onClick={() => setShowTuningModal(false)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    Close ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Sensitivity</span>
                      <span className="text-cyan-400 font-bold">{["Textbook", "Conservative", "Balanced", "Aggressive", "Ultra"][tuningConfig.sensitivity - 1]}</span>
                    </div>
                    <input 
                      type="range" min="1" max="5" 
                      value={tuningConfig.sensitivity} 
                      onChange={(e) => setTuningConfig({ ...tuningConfig, sensitivity: Number(e.target.value) })}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Strictness</span>
                      <span className="text-cyan-400 font-bold">{["Lenient", "Relaxed", "Standard", "Strict", "Surgical"][tuningConfig.strictness - 1]}</span>
                    </div>
                    <input 
                      type="range" min="1" max="5" 
                      value={tuningConfig.strictness} 
                      onChange={(e) => setTuningConfig({ ...tuningConfig, strictness: Number(e.target.value) })}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Min Confluences</span>
                      <span className="text-cyan-400 font-bold">{tuningConfig.minConfluences} Factors</span>
                    </div>
                    <input 
                      type="range" min="1" max="5" 
                      value={tuningConfig.minConfluences} 
                      onChange={(e) => setTuningConfig({ ...tuningConfig, minConfluences: Number(e.target.value) })}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Min Risk:Reward</span>
                      <span className="text-cyan-400 font-bold">1:{tuningConfig.minRR}</span>
                    </div>
                    <input 
                      type="range" min="1" max="6" 
                      value={tuningConfig.minRR} 
                      onChange={(e) => setTuningConfig({ ...tuningConfig, minRR: Number(e.target.value) })}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PAIR & TIMEFRAME SELECTOR */}
            <div className={`bg-[#081525] border ${theme.border} rounded-2xl p-3 flex flex-col gap-2.5`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Target className={`w-3.5 h-3.5 ${theme.accentText}`} />
                  Instrument & Asset
                </span>
                <span className={`text-[11px] font-mono font-bold ${theme.accentText} bg-slate-900 px-2 py-0.5 rounded border border-slate-800`}>
                  {selectedScannerPair}
                </span>
              </div>

              {/* QUICK PAIR PILLS */}
              <div className="flex flex-wrap gap-1.5">
                {SCANNER_POPULAR_PAIRS.map((pair: string) => (
                  <button
                    key={pair}
                    onClick={() => setSelectedScannerPair(pair)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                      selectedScannerPair === pair
                        ? `${theme.buttonBg} border-white shadow-sm`
                        : "bg-slate-900 border-slate-700/80 text-slate-400 hover:text-white"
                    }`}
                  >
                    {pair}
                  </button>
                ))}
              </div>

              {/* TIMEFRAME PILLS */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                <span className="text-[11px] font-semibold text-slate-400">TF:</span>
                <div className="flex gap-1 flex-1 justify-end">
                  {["AUTO", "M1", "M5", "M15", "H1", "H4", "D1"].map(tf => (
                    <button
                      key={tf}
                      onClick={() => setSelectedScannerTf(tf)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition ${
                        selectedScannerTf === tf
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                          : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* TRADING ENGINES SELECTOR (MULTI-ENGINE) */}
            <div className={`bg-[#081525] border ${theme.border} rounded-2xl p-3 flex flex-col gap-2`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Cpu className={`w-3.5 h-3.5 ${theme.accentText}`} />
                  Active AI Engines ({activeEngines.length}/10 Active)
                </span>
                <span className="text-[10px] text-slate-400">Tap to toggle</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {SCANNER_ENGINES.map((eng: { id: string; label: string; focus: string }) => {
                  const isActive = activeEngines.includes(eng.id);
                  return (
                    <button
                      key={eng.id}
                      onClick={() => toggleEngine(eng.id)}
                      className={`p-2 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                        isActive
                          ? "bg-slate-900/90 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                          : "bg-slate-950/60 border-slate-800 text-slate-500 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isActive ? "text-cyan-300" : "text-slate-400"}`}>
                          {eng.label}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${isActive ? "bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" : "bg-slate-700"}`} />
                      </div>
                      <span className="text-[9px] text-slate-400 line-clamp-1">{eng.focus}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* HIDDEN FILE INPUT */}
            <input 
              type="file" 
              ref={chartFileInputRef} 
              accept="image/*" 
              className="hidden" 
              onChange={handleChartImageUpload} 
            />

            {/* CHART UPLOAD / DROPZONE */}
            {!uploadedChartImg ? (
              <div 
                onClick={() => chartFileInputRef.current?.click()}
                className={`border-2 border-dashed ${theme.border} rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 bg-[#081525] cursor-pointer hover:border-cyan-400 transition text-center shadow-lg group`}
              >
                <div className={`w-12 h-12 rounded-full bg-slate-900 border ${theme.border} flex items-center justify-center ${theme.accentText} group-hover:scale-105 transition`}>
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">Upload Chart Screenshot</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    PNG, JPG from MT5, TradingView, or Phone Gallery
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full bg-slate-900 border ${theme.border} text-[10px] font-bold ${theme.accentText}`}>
                    Browse Screenshot
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      runChartAnalysis(null);
                    }}
                    className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[10px] font-bold text-cyan-300 hover:bg-cyan-500/30 transition"
                  >
                    ⚡ Fast Scan Market
                  </button>
                </div>
              </div>
            ) : (
              <div className={`p-3 rounded-2xl bg-[#081525] border ${theme.border} flex flex-col gap-2.5 shadow-md`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <FileImage className="w-3.5 h-3.5 text-cyan-400" />
                    Uploaded Chart Screenshot
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => chartFileInputRef.current?.click()}
                      className="text-[11px] text-cyan-400 hover:underline"
                    >
                      Change
                    </button>
                    <button
                      onClick={() => setUploadedChartImg(null)}
                      className="text-[11px] text-rose-400 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center relative">
                  <img src={uploadedChartImg} alt="Uploaded chart" className="w-full h-full object-contain" />
                  <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 border border-slate-700">
                    {selectedScannerPair} • {selectedScannerTf}
                  </div>
                </div>

                <button
                  disabled={isScanningChart}
                  onClick={() => runChartAnalysis(uploadedChartImg)}
                  className={`w-full py-2.5 rounded-xl ${theme.buttonBg} text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95 transition disabled:opacity-50`}
                >
                  {isScanningChart ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isScanningChart ? "Multi-Engine Scanning..." : "Re-Analyze This Chart"}
                </button>
              </div>
            )}

            {/* SCANNING RADAR ANIMATION */}
            {isScanningChart && (
              <div className={`p-5 rounded-2xl bg-[#081525] border border-cyan-500/40 flex flex-col items-center justify-center gap-2.5 text-xs text-cyan-300 font-bold shadow-[0_0_20px_rgba(6,182,212,0.2)]`}>
                <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                <div className="text-center">
                  <p className="text-sm font-black text-cyan-200">Executing Multi-Engine Radar Scan...</p>
                  <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                    Aligning {activeEngines.length} engines on {selectedScannerPair} ({selectedScannerTf})
                  </p>
                </div>
              </div>
            )}

            {/* NOTIFICATION NOTICE */}
            {queueNotice && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{queueNotice}</span>
              </div>
            )}

            {/* ANALYSIS RESULT HUD */}
            {chartAnalysis && !isScanningChart && (
              <div className={`p-4 rounded-3xl bg-[#081525] border-2 ${
                chartAnalysis.direction === "BUY" ? "border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.25)]" : "border-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.25)]"
              } flex flex-col gap-3.5 text-xs`}>
                
                {/* SIGNAL HEADER BANNER */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-xl text-sm font-black tracking-wide flex items-center gap-1.5 ${
                      chartAnalysis.direction === "BUY" 
                        ? "bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                        : "bg-rose-500 text-slate-950 shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                    }`}>
                      {chartAnalysis.direction === "BUY" ? <ArrowUpRight className="w-4 h-4 stroke-[3]" /> : <ArrowDownRight className="w-4 h-4 stroke-[3]" />}
                      {chartAnalysis.direction} SIGNAL
                    </span>
                    <span className="text-[11px] font-bold text-slate-300">
                      {chartAnalysis.grade}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-black ${chartAnalysis.direction === "BUY" ? "text-emerald-400" : "text-rose-400"}`}>
                      {chartAnalysis.confidence}% Conf.
                    </span>
                    <p className="text-[9px] text-slate-500">{chartAnalysis.timestamp}</p>
                  </div>
                </div>

                {/* CONSENSUS & ENGINES RADAR */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-slate-400">Engine Consensus: </span>
                    <strong className="text-white">{chartAnalysis.consensusScore}% Agreement</strong>
                  </div>
                  <div className="flex gap-1">
                    {chartAnalysis.enginesAgreed.map((engId: string) => {
                      const found = SCANNER_ENGINES.find((x: { id: string; label: string; focus: string }) => x.id === engId);
                      return (
                        <span key={engId} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[9px] font-bold text-cyan-300">
                          {found?.label || engId.toUpperCase()}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* TARGET PRICES GRID */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Execution Entry</span>
                    <strong className="text-sm font-mono text-cyan-300 mt-0.5">{chartAnalysis.entryPrice}</strong>
                    <span className="text-[10px] text-slate-500 mt-0.5">Zone: {chartAnalysis.entryZone}</span>
                  </div>

                  <div className="bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Stop Loss (SL)</span>
                    <strong className="text-sm font-mono text-rose-400 mt-0.5">{chartAnalysis.stopLoss}</strong>
                    <span className="text-[10px] text-rose-300/80 mt-0.5">Risk: {chartAnalysis.slPips}</span>
                  </div>
                </div>

                {/* 5 TAKE PROFIT TARGETS */}
                <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-2xl flex flex-col gap-1.5">
                  <div className="flex justify-between items-center pb-1 border-b border-slate-800/80">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-emerald-400" />
                      Take Profit Matrix (TP1 - TP5)
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 font-mono">R:R {chartAnalysis.riskReward}</span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 text-center pt-1">
                    <div className="bg-slate-900 border border-emerald-500/30 p-1.5 rounded-lg flex flex-col">
                      <span className="text-[9px] font-bold text-slate-400">TP 1</span>
                      <strong className="text-[11px] font-mono text-emerald-300">{chartAnalysis.tp1}</strong>
                      <span className="text-[8px] text-slate-500">1:1</span>
                    </div>

                    <div className="bg-slate-900 border border-emerald-500/40 p-1.5 rounded-lg flex flex-col">
                      <span className="text-[9px] font-bold text-slate-400">TP 2</span>
                      <strong className="text-[11px] font-mono text-emerald-300">{chartAnalysis.tp2}</strong>
                      <span className="text-[8px] text-emerald-400 font-bold">1:2</span>
                    </div>

                    <div className="bg-slate-900 border border-emerald-500/50 p-1.5 rounded-lg flex flex-col">
                      <span className="text-[9px] font-bold text-slate-400">TP 3</span>
                      <strong className="text-[11px] font-mono text-emerald-300">{chartAnalysis.tp3}</strong>
                      <span className="text-[8px] text-emerald-400">1:3.5</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-700 p-1.5 rounded-lg flex flex-col">
                      <span className="text-[9px] font-bold text-slate-400">TP 4</span>
                      <strong className="text-[11px] font-mono text-cyan-300">{chartAnalysis.tp4}</strong>
                      <span className="text-[8px] text-slate-500">1:5</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-700 p-1.5 rounded-lg flex flex-col">
                      <span className="text-[9px] font-bold text-slate-400">TP 5</span>
                      <strong className="text-[11px] font-mono text-cyan-300">{chartAnalysis.tp5}</strong>
                      <span className="text-[8px] text-slate-500">1:7</span>
                    </div>
                  </div>
                </div>

                {/* CONFLUENCES CHECKLIST */}
                <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    Confirmed Institutional Confluences
                  </span>
                  <ul className="space-y-1 text-[10px] text-slate-300 pt-0.5">
                    {chartAnalysis.confluences.map((conf: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 shrink-0">•</span>
                        <span>{conf}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
                    <span>⚠️ Invalidation: <strong className="text-slate-300">{chartAnalysis.invalidation}</strong></span>
                    <span>Order: <strong className="text-cyan-300">{chartAnalysis.orderType}</strong></span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={queueToMachineGunner}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 transition"
                  >
                    <Flame className="w-4 h-4 fill-current" />
                    Arm 3-Bullet Machine Gunner Execution
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => speakAnalysisSignal(chartAnalysis)}
                      className="py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:text-white transition"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      Replay Voice Audio
                    </button>

                    <button
                      onClick={() => runChartAnalysis(uploadedChartImg)}
                      className="py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:text-white transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                      Re-Scan Chart
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="w-full flex flex-col gap-3.5">
            <div className={`pb-2 border-b ${theme.border}`}>
              <h2 className={`text-lg font-black ${theme.primaryText} flex items-center gap-2`}>
                <Sliders className={`w-5 h-5 ${theme.accentText}`} />
                Console & Terminal Settings
              </h2>
              <p className="text-xs text-slate-400">Customization, Appearance & System Bridge</p>
            </div>

            {/* 1. BOT IMAGE SHAPE */}
            <div className={`bg-[#081525] border ${theme.border} rounded-2xl p-4 flex flex-col gap-3 shadow-md`}>
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Square className={`w-3.5 h-3.5 ${theme.accentText}`} />
                Bot Image Shape
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setBotShape("rectangle");
                    localStorage.setItem("bsa_shape", "rectangle");
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                    botShape === "rectangle"
                      ? `${theme.buttonBg} border-white shadow-md`
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  <Square className="w-4 h-4" />
                  Rectangle
                </button>
                <button
                  onClick={() => {
                    setBotShape("circle");
                    localStorage.setItem("bsa_shape", "circle");
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                    botShape === "circle"
                      ? `${theme.buttonBg} border-white shadow-md`
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  <Circle className="w-4 h-4" />
                  Circle (Floating)
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Circle shape floats in the center so the background artwork remains visible.
              </p>
            </div>

            {/* 2. THEME COLOURS (Changes entire bot) */}
            <div className={`bg-[#081525] border ${theme.border} rounded-2xl p-4 flex flex-col gap-3 shadow-md`}>
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Palette className={`w-3.5 h-3.5 ${theme.accentText}`} />
                Theme Colour Palette (Whole Bot)
              </span>
              <div className="flex items-center justify-between gap-2 pt-1">
                {[
                  { id: "cyan", name: "Cyan Blue", bg: "bg-cyan-400" },
                  { id: "emerald", name: "Emerald", bg: "bg-emerald-400" },
                  { id: "amber", name: "Cyber Gold", bg: "bg-amber-400" },
                  { id: "crimson", name: "Crimson Red", bg: "bg-rose-500" },
                  { id: "purple", name: "Neon Purple", bg: "bg-fuchsia-400" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setThemeColor(c.id as ThemeColor);
                      localStorage.setItem("bsa_color", c.id);
                    }}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition ${
                      themeColor === c.id ? "bg-slate-800 scale-105 border border-white" : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${c.bg} shadow-md`} />
                    <span className="text-[10px] text-slate-300 font-medium">{c.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. FONT SELECTION */}
            <div className={`bg-[#081525] border ${theme.border} rounded-2xl p-4 flex flex-col gap-3 shadow-md`}>
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Type className={`w-3.5 h-3.5 ${theme.accentText}`} />
                Font Style
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "sans", name: "Modern Sans" },
                  { id: "mono", name: "Cyber Mono" },
                  { id: "tech", name: "Tech Bold" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setFontFamily(f.id as FontFamily);
                      localStorage.setItem("bsa_font", f.id);
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition ${
                      fontFamily === f.id
                        ? `${theme.buttonBg} border-white shadow-md`
                        : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. DISPLAY OVER OTHER APPS (Floating Icon Overlay) */}
            <div className={`bg-[#081525] border ${theme.border} rounded-2xl p-4 flex items-center justify-between shadow-md`}>
              <div className="flex flex-col gap-0.5 pr-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <AppWindow className={`w-3.5 h-3.5 ${theme.accentText}`} />
                  Display Over Other Apps
                </span>
                <p className="text-[11px] text-slate-400">
                  Allows the floating robot icon and signal radar to stay active over charts.
                </p>
              </div>
              <button
                onClick={() => {
                  const next = !overlayEnabled;
                  setOverlayEnabled(next);
                  localStorage.setItem("bsa_overlay", String(next));
                }}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 border ${
                  overlayEnabled ? "bg-emerald-500 border-emerald-400" : "bg-slate-800 border-slate-600"
                }`}
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transition-transform ${overlayEnabled ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>

            {/* 5. BACKGROUND VIDEO OPTION */}
            <div className={`bg-[#081525] border ${theme.border} rounded-2xl p-4 flex flex-col gap-3 shadow-md`}>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Video className={`w-3.5 h-3.5 ${theme.accentText}`} />
                    Background Video
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Ambient animated tech/chart background behind the robot.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const next = !videoBgEnabled;
                    setVideoBgEnabled(next);
                    localStorage.setItem("bsa_video_bg", String(next));
                  }}
                  className={`w-12 h-6 rounded-full transition-colors p-0.5 border ${
                    videoBgEnabled ? "bg-emerald-500 border-emerald-400" : "bg-slate-800 border-slate-600"
                  }`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transition-transform ${videoBgEnabled ? "translate-x-6" : "translate-x-0"}`} />
                </button>
              </div>
            </div>

            {/* 6. LICENSE & LOG OUT */}
            <div className={`bg-[#081525] border ${theme.border} rounded-2xl p-4 flex flex-col gap-2 shadow-md`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className={`w-3.5 h-3.5 ${theme.accentText}`} />
                  Terminal License
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  ACTIVE
                </span>
              </div>
              <div className="text-xs text-slate-300 space-y-0.5">
                <p><strong>License Key:</strong> <span className={`font-mono ${theme.accentText}`}>{activeKey}</span></p>
                <p><strong>Assigned User:</strong> {clientInfo?.clientName || "Thabang Seake (Master)"}</p>
                <p><strong>Expiry:</strong> {clientInfo?.expiresAt ? new Date(clientInfo.expiresAt).toLocaleDateString() : "Lifetime Verified"}</p>
              </div>
              <button 
                onClick={handleLockOut}
                className="mt-2 py-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-red-950/60 active:scale-95 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log Out / Switch License Key
              </button>
            </div>

            {/* Mentor Support Direct Link */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-emerald-300">Mentor WhatsApp Direct</p>
                <p className="text-[11px] text-slate-300">+27 64 929 1083 (Tman Capitals)</p>
              </div>
              <a 
                href="https://wa.me/27649291083" 
                target="_blank" 
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-[11px] active:scale-95 transition"
              >
                Chat
              </a>
            </div>
          </div>
        )}

      </div>

      {/* FREELY DRAGGABLE CIRCULAR FLOATING ICON */}
      {isActive && overlayEnabled && (
        <aside 
          aria-label="Live bot floating status"
          style={{
            position: "fixed",
            left: `${botPos.x}px`,
            top: `${botPos.y}px`,
            zIndex: 9999,
            touchAction: "none",
          }}
          onTouchStart={handleDragStart}
          onMouseDown={handleDragStart}
          className="flex flex-col items-end cursor-grab active:cursor-grabbing"
        >
          {widgetExpanded && (
            <div className={`w-72 mb-2 rounded-2xl border-2 ${theme.cardBorder} bg-[#071322]/95 backdrop-blur-xl p-3.5 ${theme.shadow} text-xs flex flex-col gap-2.5`}>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/60">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className={`font-black ${theme.primaryText} tracking-wider text-[11px]`}>PROEDGE SIGNAL RADAR</span>
                </div>
                <button onClick={() => setWidgetExpanded(false)} className="text-slate-400 hover:text-white">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {latestSignal ? (
                <div className="bg-[#040a12] border border-slate-800 rounded-xl p-2.5 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className={`font-bold ${latestSignal.action === "BUY" ? "text-emerald-400" : "text-red-400"}`}>
                      {latestSignal.symbol} • {latestSignal.action} BURST
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                      {latestSignal.status || "ACTIVE"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-300 pt-1">
                    <p><strong>Entry:</strong> {latestSignal.entry_price || "Market"}</p>
                    <p><strong>Bullets:</strong> {latestSignal.bullets || 3} Fired</p>
                    <p><strong>SL:</strong> {latestSignal.sl_price || "ATR Stop"}</p>
                    <p><strong>TP:</strong> {latestSignal.tp_price || "+45 pts"}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-[#040a12] border border-slate-800 rounded-xl p-3 text-center text-[11px] text-slate-400">
                  Monitoring London & NY Sessions... No live burst active.
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleIconClick}
            className={`relative w-14 h-14 rounded-full border-2 ${theme.cardBorder} bg-slate-900 shadow-[0_0_22px_rgba(6,182,212,0.6)] flex items-center justify-center p-0.5 active:scale-95 transition`}
          >
            <div className="w-full h-full rounded-full overflow-hidden pointer-events-none">
              <img 
                src="/images/bluescalp-bot.jpg" 
                alt="Bot Icon" 
                className="w-full h-full object-cover" 
              />
            </div>
            <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#030811] animate-pulse" />
          </button>
        </aside>
      )}

      {/* STATUS MODAL (Shows bot signals details) */}
      {modalOpen === "status" && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
          <div className={`w-full max-w-md bg-[#081525] border ${theme.cardBorder} rounded-3xl p-6 flex flex-col gap-4 shadow-2xl`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className={`text-lg font-bold ${theme.primaryText} flex items-center gap-2`}>
                <Activity className="w-5 h-5 text-emerald-400" />
                Bot Signal Details & Status
              </h3>
              <button onClick={() => setModalOpen(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <p className="text-slate-400">Engine Mode</p>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">Machine Gunner V1.0</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <p className="text-slate-400">Firing Pattern</p>
                <p className={`text-sm font-bold ${theme.accentText} mt-0.5`}>3 Bullets (500ms delay)</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <p className="text-slate-400">Session Timing</p>
                <p className="text-sm font-bold text-slate-200 mt-0.5">London (09-12) & NY (15-18)</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <p className="text-slate-400">Execution Latency</p>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">14ms Fast-Path</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <p className="text-slate-400">Risk-to-Reward</p>
                <p className="text-sm font-bold text-emerald-300 mt-0.5">1:2 Minimum</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <p className="text-slate-400">Trailing Hard Stop</p>
                <p className="text-sm font-bold text-rose-400 mt-0.5">40% Peak Equity Stop</p>
              </div>
            </div>

            <button 
              onClick={() => setModalOpen(null)}
              className={`w-full py-3 rounded-xl ${theme.buttonBg} font-bold text-xs`}
            >
              Close Status
            </button>
          </div>
        </div>
      )}

      {/* BROKER CONNECT MODAL */}
      {modalOpen === "connect" && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
          <div className={`w-full max-w-md bg-[#081525] border ${theme.cardBorder} rounded-3xl p-6 flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto`}>
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className={`text-lg font-bold ${theme.primaryText}`}>Connect Broker</h3>
                <p className="text-xs text-slate-400">Live Execution Bridge</p>
              </div>
              <button onClick={() => setModalOpen(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
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
                className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none"
              >
                {ALLOWED_BROKERS.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">MT5 Server</label>
              <input 
                type="text" 
                value={mt5Server}
                onChange={(e) => setMt5Server(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">MT5 Account Number</label>
              <input 
                type="number" 
                placeholder="e.g. 52049102"
                value={mt5Login}
                onChange={(e) => setMt5Login(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none"
              />
            </div>

            <button 
              onClick={() => {
                setBrokerConnected(true);
                setModalOpen(null);
              }}
              className={`w-full py-3.5 rounded-xl ${theme.buttonBg} font-bold text-sm tracking-wide shadow-md active:scale-95 transition`}
            >
              Save & Link Broker
            </button>

          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION: CLEAN 4 TABS */}
      <nav className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#050e1a]/95 backdrop-blur-xl border-t ${theme.border} py-2.5 px-6 flex justify-between items-center z-40`}>
        <button 
          onClick={() => setActiveTab("home")} 
          className={`flex flex-col items-center gap-1 transition ${activeTab === "home" ? theme.accentText : "text-slate-400"}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <button 
          onClick={() => setActiveTab("signals")} 
          className={`flex flex-col items-center gap-1 transition ${activeTab === "signals" ? theme.accentText : "text-slate-400"}`}
        >
          <Radio className="w-5 h-5" />
          <span className="text-[10px] font-bold">Signals</span>
        </button>

        <button 
          onClick={() => setActiveTab("scanner")} 
          className={`flex flex-col items-center gap-1 transition ${activeTab === "scanner" ? theme.accentText : "text-slate-400"}`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] font-bold">Scanner</span>
        </button>

        <button 
          onClick={() => setActiveTab("settings")} 
          className={`flex flex-col items-center gap-1 transition ${activeTab === "settings" ? theme.accentText : "text-slate-400"}`}
        >
          <Sliders className="w-5 h-5" />
          <span className="text-[10px] font-bold">Settings</span>
        </button>
      </nav>

    </div>
  );
}

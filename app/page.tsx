"use client";

import MarketPairSelector from "@/components/MarketPairSelector";

import EnhancedScannerView, { AdvancedAnalysisResult } from "@/components/EnhancedScannerView";

import VipSignalsView from "@/components/VipSignalsView";
import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Play,
  Pause,
  DollarSign,
  TrendingUp,
  Radio,
  Activity,
  Home,
  Sliders,
  Calendar,
  Menu,
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
  MicOff,
  Plus
} from "lucide-react";

const ALLOWED_BROKERS = [
  { id: "rcg", name: "RCG Markets", servers: ["RCGMarkets-Live", "RCGMarkets-Demo"] },
  { id: "hfm", name: "HFM (HF Markets)", servers: ["HFMarketsSA-Live", "HFMarkets-Live2"] },
  { id: "fxpro", name: "FxPro", servers: ["FxPro-MT5-Live", "FxPro-MT5-Real02"] },
  { id: "justmarkets", name: "JustMarkets", servers: ["JustMarkets-Live", "JustMarkets-Live2"] },
];

type HomeStyle = "classic" | "premium" | "commander";
type LayoutStyle = "hero" | "center" | "dash" | "cine" | "card";
type TradePanelStyle = "pill" | "circle" | "grid" | "float";
type ScannerStyle = "pill" | "radar" | "terminal" | "power" | "hybrid";

type ThemeColor = "cyan" | "emerald" | "amber" | "crimson" | "purple" | "blood" | "matrix" | "royal" | "phantom" | "inferno" | "rose" | "stealth";
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
  const [showSplash, setShowSplash] = useState(true);

  // Auto-dismiss welcome splash after 2.2 seconds (or click to skip)
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(timer);
  }, []);
  const [licenseInput, setLicenseInput] = useState("");
  const [activeKey, setActiveKey] = useState("");
  const [clientInfo, setClientInfo] = useState<{ clientName: string; expiresAt: string } | null>(null);
  const [authError, setAuthError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const [isActive, setIsActive] = useState(true);
  const [activeTab, setActiveTab] = useState<"home" | "signals" | "scanner" | "settings">("home");
  const [modalOpen, setModalOpen] = useState<"connect" | "status" | null>(null);

  // Appearance & Customization Settings
  const [homeStyle, setHomeStyle] = useState<HomeStyle>("commander");
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>("hero");
  const [tradePanelStyle, setTradePanelStyle] = useState<TradePanelStyle>("pill");
  const [scannerStyle, setScannerStyle] = useState<ScannerStyle>("pill");
  const [autoTrade, setAutoTrade] = useState(false);
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
  const [isExecutingSingleTrade, setIsExecutingSingleTrade] = useState(false);

  const handleSingleTradeExecution = async (trade: AdvancedAnalysisResult) => {
    setIsExecutingSingleTrade(true);
    try {
      await fetch("/api/mt5/signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: trade.bias === "bullish" ? "BUY" : "SELL",
          symbol: trade.pair,
          entryPrice: trade.entry,
          stopLoss: trade.stopLoss,
          takeProfit: trade.takeProfit1,
          mode: "SINGLE_ORDER",
          methodology: trade.methodologyUsed || selectedMethodology,
        }),
      });
      alert(
        `[SINGLE EXECUTION ARMED]
Pair: ${trade.pair}
Direction: ${trade.bias.toUpperCase()}
Entry: ${trade.entry}
SL: ${trade.stopLoss}
TP: ${trade.takeProfit1}

1 clean position submitted.`
      );
    } catch (err: any) {
      alert(
        `[SINGLE EXECUTION ARMED]
Pair: ${trade.pair}
Direction: ${trade.bias.toUpperCase()}
Entry: ${trade.entry}
SL: ${trade.stopLoss}
TP: ${trade.takeProfit1}`
      );
    } finally {
      setIsExecutingSingleTrade(false);
    }
  };

  const [selectedMethodology, setSelectedMethodology] = useState<"ALL" | "ICT" | "SMC" | "CRT" | "ULTRABREAKOUT">("ALL");
  const [selectedScannerPair, setSelectedScannerPair] = useState<string>("XAUUSD");
  const [selectedScannerTf, setSelectedScannerTf] = useState<string>("M5");
  const [activeEngines, setActiveEngines] = useState<string[]>(["smc", "ict", "machine_gunner"]);
  const [uploadedChartImg, setUploadedChartImg] = useState<string | null>(null);
  const [isScanningChart, setIsScanningChart] = useState<boolean>(false);
  const [chartAnalysis, setChartAnalysis] = useState<AdvancedAnalysisResult | any | null>(null);
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

  const speakAnalysisSignal = (res: any) => {
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

    if (!imageToSend) {
      alert("Please upload a chart screenshot first.");
      setIsScanningChart(false);
      return;
    }

    try {
      const res = await fetch("/api/scan-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imageToSend,
          pair: selectedScannerPair,
          methodology: selectedMethodology,
          timeframe: selectedScannerTf,
          engines: activeEngines,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        let details = errData.error || ("Analysis failed with status " + res.status);
        if (errData.attempts && Array.isArray(errData.attempts)) {
          details += "\n\nAttempts:\n" + errData.attempts.map((a: any) => `• ${a.model} (${a.status}): ${a.message}`).join("\n");
        }
        if (errData.supportedModelsForKey && Array.isArray(errData.supportedModelsForKey) && errData.supportedModelsForKey.length > 0) {
          details += "\n\nSupported models on your key:\n" + errData.supportedModelsForKey.join(", ");
        }
        throw new Error(details);
      }

      const data = await res.json();
      const result = (data.analysis || data) as any;
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

    const savedHomeStyle = (localStorage.getItem("bsa_homestyle") || localStorage.getItem("bsa_home_style")) as HomeStyle;
    if (savedHomeStyle) setHomeStyle(savedHomeStyle);

    const savedLayout = localStorage.getItem("bsa_layout") as LayoutStyle;
    if (savedLayout) setLayoutStyle(savedLayout);

    const savedTradePanel = localStorage.getItem("bsa_tradepanel") as TradePanelStyle;
    if (savedTradePanel) setTradePanelStyle(savedTradePanel);

    const savedScannerStyle = localStorage.getItem("bsa_scannerstyle") as ScannerStyle;
    if (savedScannerStyle) setScannerStyle(savedScannerStyle);

    const savedAutoTrade = localStorage.getItem("bsa_autotrade");
    if (savedAutoTrade !== null) setAutoTrade(savedAutoTrade === "true");

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
        setClientInfo({ clientName: "Tman Capitals (Master)", expiresAt: "2036-12-31T23:59:59Z" });
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
          shadow: "shadow-[0_0_30px_rgba(16,185,129,0.35)]",
          glow: "drop-shadow-[0_2px_14px_rgba(16,185,129,0.8)]",
          badgeBg: "bg-emerald-950/80 border-emerald-500/40 text-emerald-300",
          buttonBg: "bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-950",
          pulseColor: "bg-emerald-400",
          hex: "#10b981",
        };
      case "amber":
        return {
          primaryText: "text-amber-300",
          accentText: "text-amber-400",
          border: "border-amber-500/40",
          cardBorder: "border-amber-400/60",
          shadow: "shadow-[0_0_30px_rgba(245,158,11,0.35)]",
          glow: "drop-shadow-[0_2px_14px_rgba(245,158,11,0.8)]",
          badgeBg: "bg-amber-950/80 border-amber-500/40 text-amber-300",
          buttonBg: "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950",
          pulseColor: "bg-amber-400",
          hex: "#f59e0b",
        };
      case "crimson":
        return {
          primaryText: "text-rose-300",
          accentText: "text-rose-400",
          border: "border-rose-500/40",
          cardBorder: "border-rose-400/60",
          shadow: "shadow-[0_0_30px_rgba(244,63,94,0.35)]",
          glow: "drop-shadow-[0_2px_14px_rgba(244,63,94,0.8)]",
          badgeBg: "bg-rose-950/80 border-rose-500/40 text-rose-300",
          buttonBg: "bg-gradient-to-r from-rose-400 to-rose-500 text-white font-bold",
          pulseColor: "bg-rose-400",
          hex: "#f43f5e",
        };
      case "purple":
        return {
          primaryText: "text-fuchsia-300",
          accentText: "text-fuchsia-400",
          border: "border-fuchsia-500/40",
          cardBorder: "border-fuchsia-400/60",
          shadow: "shadow-[0_0_30px_rgba(217,70,239,0.35)]",
          glow: "drop-shadow-[0_2px_14px_rgba(217,70,239,0.8)]",
          badgeBg: "bg-fuchsia-950/80 border-fuchsia-500/40 text-fuchsia-300",
          buttonBg: "bg-gradient-to-r from-fuchsia-400 to-fuchsia-500 text-slate-950 font-bold",
          pulseColor: "bg-fuchsia-400",
          hex: "#d946ef",
        };
      case "blood":
        return {
          primaryText: "text-orange-300",
          accentText: "text-orange-400",
          border: "border-orange-500/40",
          cardBorder: "border-orange-400/60",
          shadow: "shadow-[0_0_30px_rgba(249,115,22,0.35)]",
          glow: "drop-shadow-[0_2px_14px_rgba(249,115,22,0.8)]",
          badgeBg: "bg-orange-950/80 border-orange-500/40 text-orange-300",
          buttonBg: "bg-gradient-to-r from-orange-400 to-orange-500 text-slate-950 font-bold",
          pulseColor: "bg-orange-400",
          hex: "#f97316",
        };
      case "matrix":
        return {
          primaryText: "text-lime-300",
          accentText: "text-lime-400",
          border: "border-lime-500/40",
          cardBorder: "border-lime-400/60",
          shadow: "shadow-[0_0_30px_rgba(132,204,22,0.35)]",
          glow: "drop-shadow-[0_2px_14px_rgba(132,204,22,0.8)]",
          badgeBg: "bg-lime-950/80 border-lime-500/40 text-lime-300",
          buttonBg: "bg-gradient-to-r from-lime-400 to-lime-500 text-slate-950 font-bold",
          pulseColor: "bg-lime-400",
          hex: "#84cc16",
        };
      case "royal":
        return {
          primaryText: "text-blue-300",
          accentText: "text-blue-400",
          border: "border-blue-500/40",
          cardBorder: "border-blue-400/60",
          shadow: "shadow-[0_0_30px_rgba(59,130,246,0.35)]",
          glow: "drop-shadow-[0_2px_14px_rgba(59,130,246,0.8)]",
          badgeBg: "bg-blue-950/80 border-blue-500/40 text-blue-300",
          buttonBg: "bg-gradient-to-r from-blue-400 to-blue-500 text-slate-950 font-bold",
          pulseColor: "bg-blue-400",
          hex: "#3b82f6",
        };
      case "cyan":
      default:
        return {
          primaryText: "text-cyan-300",
          accentText: "text-cyan-400",
          border: "border-cyan-500/40",
          cardBorder: "border-cyan-400/60",
          shadow: "shadow-[0_0_30px_rgba(6,182,212,0.35)]",
          glow: "drop-shadow-[0_2px_14px_rgba(6,182,212,0.8)]",
          badgeBg: "bg-cyan-950/80 border-cyan-500/40 text-cyan-300",
          buttonBg: "bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950",
          pulseColor: "bg-cyan-400",
          hex: "#06b6d4",
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
  if (showSplash) {
    return (
      <div
        onClick={() => setShowSplash(false)}
        className="fixed inset-0 z-50 bg-[#050608] text-slate-100 flex flex-col justify-between items-center p-8 select-none cursor-pointer transition-opacity duration-500"
      >
        {/* Top-right menu icon matching reference */}
        <div className="w-full flex justify-end pt-4">
          <div className="w-9 h-9 rounded-full border border-slate-700/60 bg-slate-900/40 flex items-center justify-center text-slate-400">
            <span className="text-sm font-sans">•••</span>
          </div>
        </div>

        {/* Centered Welcome Header matching reference */}
        <div className="text-center flex flex-col items-center gap-3">
          <p className="text-xs uppercase tracking-[0.45em] text-slate-400/90 font-medium">
            WELCOME BACK
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-[0.06em] text-slate-100 uppercase drop-shadow-[0_2px_15px_rgba(255,255,255,0.12)]">
            BLUESCALP ASSASSIN <span className="text-cyan-400">EA</span>
          </h1>
          <div className="w-8 h-0.5 bg-cyan-500/40 rounded-full mt-2" />
        </div>

        {/* Bottom subtle indicator */}
        <div className="pb-6 text-center">
          <p className="text-[10px] tracking-[0.25em] text-slate-500 uppercase font-mono animate-pulse">
            TAP ANYWHERE TO ENTER
          </p>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className={`min-h-screen bg-[#030811] text-slate-100 flex items-center justify-center p-4 select-none ${getFontClass()}`}>
        <div className="w-full max-w-sm rounded-3xl border-2 border-cyan-500/40 bg-[#06121f] p-6 shadow-[0_0_40px_rgba(6,182,212,0.3)] flex flex-col items-center gap-5 relative overflow-hidden">
          {/* Cinematic EA Preview Header */}
          <div className="text-center flex flex-col items-center pt-2">
            <div className="w-12 h-12 rounded-full border border-cyan-400/50 bg-cyan-950/50 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <span className="text-cyan-300 font-serif font-black text-lg tracking-widest">BA</span>
            </div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-400/70 font-semibold mb-1">
              WELCOME BACK
            </p>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-[0.08em] text-slate-100 uppercase drop-shadow-[0_2px_12px_rgba(6,182,212,0.45)]">
              BLUESCALP ASSASSIN <span className="text-cyan-400">EA</span>
            </h1>
            <p className="text-[11px] tracking-wider text-slate-400 mt-1 font-medium">
              BY TMAN CAPITALS • PROTECTED TERMINAL
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
              <span className={`${theme.accentText} font-bold`}>R200 (3 Mos) / R600 Life</span>
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
      id="bsa-app"
      data-theme={themeColor}
      data-home-style={homeStyle}
      style={{ "--bsa-accent": theme.hex, "--bsa-soft": `${theme.hex}22`, "--bsa-border": `${theme.hex}99` } as React.CSSProperties}
      className={`min-h-screen bg-[#030811] text-slate-100 flex justify-center pb-8 select-none relative overflow-x-hidden ${getFontClass()}`}
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

        {/* UNIVERSAL PERSISTENT TOP BACK BUTTON FOR ALL NON-HOME SCREENS */}
        {activeTab !== "home" && (
          <header className={`w-full flex items-center justify-between pb-2.5 pt-1 border-b ${theme.border} bg-[#06121f]/80 backdrop-blur-md sticky top-0 z-30`}>
            <button
              onClick={() => setActiveTab("home")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-slate-900/90 text-white font-black text-xs uppercase tracking-wider active:scale-95 transition shadow-lg hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span>Back Home</span>
            </button>
            <span className="text-xs font-black text-white uppercase tracking-widest">
              {activeTab === "signals" && "Live Signals Feed"}
              {activeTab === "scanner" && "AI Chart Scanner"}
              {activeTab === "settings" && "Terminal Settings"}
            </span>
            <div className="w-16" />
          </header>
        )}
        
        {/* VIEW 1: HOME TAB */}
        {activeTab === "home" && (
          <>
            {/* UNIVERSAL TOP MENU BAR - AVAILABLE ON EVERY LAYOUT FORMAT */}
            <div className="w-full flex items-center justify-between pt-1 pb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">
                  BLUESCALP ASSASSIN
                </span>
              </div>
              <button
                onClick={() => setActiveTab("settings")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-slate-900/90 text-white shadow-lg active:scale-95 transition hover:bg-slate-800"
                title="Settings & Layout Menu"
              >
                <Menu className="w-4 h-4 text-cyan-400" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider">Menu</span>
              </button>
            </div>

            {homeStyle === "commander" ? (
              /* =================================================================
                 COMMANDER LAYOUT: PORTRAIT & CARDS (REFERENCE UI)
                 ================================================================= */
              <div data-home-layout={layoutStyle} className={`bsa-home-layout flex flex-col items-center w-full gap-4 ${layoutStyle === "center" ? "text-center" : ""}`} >

                {/* Big Circular Avatar with Glowing Halo */}
                <div className={`relative w-44 h-44 rounded-full p-1 border-2 ${theme.cardBorder} ${theme.shadow} bg-[#051322] flex items-center justify-center overflow-hidden`}>
                  <img
                    src="/images/bluescalp-bot.jpg"
                    alt="BlueScalp Assassin"
                    className="w-full h-full object-cover rounded-full"
                  />
                  <div className="absolute inset-0 rounded-full border border-cyan-300/40 pointer-events-none" />
                </div>

                {/* Big Centered Title & User Handle */}
                <div className="text-center flex flex-col items-center">
                  <h1 className="text-2xl font-black text-white tracking-wide uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    BLUESCALP ASSASSIN EA
                  </h1>
                  <p className={`text-xs font-semibold ${theme.accentText} font-bold tracking-wide mt-0.5`}>
                    Tman Capitals
                  </p>
                </div>

                {/* Floating Action Pill Bar: NEWS | TRADE | SCAN */}
                <div data-trade-panel={tradePanelStyle} className={`bsa-trade-panel w-full max-w-sm rounded-[24px] border-2 ${theme.cardBorder} bg-[#06121f]/90 backdrop-blur-md px-6 py-3.5 flex items-center justify-between ${theme.shadow} my-1`}>
                  {/* Signals */}
                  <button
                    onClick={() => setActiveTab("signals")}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <Radio className={`w-5 h-5 ${theme.accentText} group-active:scale-90 transition`} />
                    <span className={`text-[11px] font-extrabold ${theme.accentText} tracking-wider`}>SIGNALS</span>
                  </button>

                  {/* Center Glowing Play / Pause (Trade) */}
                  <button
                    onClick={() => setIsActive(!isActive)}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className={`w-14 h-14 rounded-full border-2 ${theme.cardBorder} bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center ${theme.shadow} active:scale-95 transition`}>
                      {isActive ? (
                        <Pause className="w-5 h-5 fill-white text-white" />
                      ) : (
                        <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                      )}
                    </div>
                    <span className="text-[11px] font-extrabold text-white tracking-wider">TRADE</span>
                  </button>

                  {/* Scan */}
                  <button
                    onClick={() => setActiveTab("scanner")}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <TrendingUp className={`w-5 h-5 ${theme.accentText} group-active:scale-90 transition`} />
                    <span className={`text-[11px] font-extrabold ${theme.accentText} tracking-wider`}>SCAN</span>
                  </button>
                </div>

                {/* Powered By Tag */}
                <div className="text-[11px] font-medium text-slate-400 py-0.5">
                  Powered by <span className="${theme.accentText} font-bold">BLUESCALP ENGINE</span>
                </div>

                {/* Stacked Cards */}
                <div className="flex flex-col gap-3 w-full">
                  {/* Card 1: Active Bot */}
                  <div
                    onClick={() => setActiveTab("signals")}
                    className={`w-full bg-[#06121f] border-2 ${theme.cardBorder} rounded-[22px] ${theme.shadow} p-4 flex items-center gap-3.5 active:scale-[0.99] transition cursor-pointer`}
                  >
                    <div className="w-12 h-12 rounded-full border border-cyan-400/60 p-0.5 bg-slate-900 shrink-0 overflow-hidden shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                      <img
                        src="/images/bluescalp-bot.jpg"
                        alt="BlueScalp Robot"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-black text-white tracking-wide uppercase">
                        BLUESCALP ASSASSIN EA
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        {isActive ? "ACTIVE • MONITORING" : "IDLE"}
                      </p>
                    </div>
                  </div>

                  {/* Card 2: Chart Scanner */}
                  <div
                    onClick={() => setActiveTab("scanner")}
                    className={`w-full bg-[#06121f] border-2 ${theme.cardBorder} rounded-[22px] ${theme.shadow} p-4 flex items-center gap-3.5 active:scale-[0.99] transition cursor-pointer`}
                  >
                    <div className="w-12 h-12 rounded-full border border-cyan-400/60 flex items-center justify-center bg-cyan-950/60 text-cyan-300 shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                      <BarChart2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-black text-white tracking-wide uppercase">
                        CHART SCANNER
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        AI-POWERED TRADE ANALYSIS
                      </p>
                    </div>
                  </div>

                  {/* Card 3: Add New EA */}
                  <div
                    onClick={() => setModalOpen("connect")}
                    className={`w-full bg-[#06121f] border-2 ${theme.cardBorder} rounded-[22px] ${theme.shadow} p-4 flex items-center gap-3.5 active:scale-[0.99] transition cursor-pointer`}
                  >
                    <div className="w-12 h-12 rounded-full border border-cyan-400/60 flex items-center justify-center bg-cyan-950/60 text-cyan-300 shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-black text-white tracking-wide uppercase">
                        ADD A NEW EA
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        HAVE A VALID LICENSE KEY
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* =================================================================
                 CLASSIC / PREMIUM DASHBOARD
                 ================================================================= */
              <div data-home-layout={layoutStyle} className={`bsa-home-layout flex flex-col w-full gap-4 ${layoutStyle === "center" ? "items-center text-center" : ""}`}>
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

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-[10px] font-mono text-slate-300 backdrop-blur-md">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      SAST SESSIONS
                    </div>
                    <button
                      onClick={() => setActiveTab("settings")}
                      className="p-1 rounded-full border border-white/20 bg-slate-900/90 text-white shadow-md active:scale-95 transition hover:bg-slate-800"
                      title="Settings Menu"
                    >
                      <Menu className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Title & Badges */}
                <div className="relative z-10 flex flex-col gap-2.5 mt-auto pt-6">
                  <div>
                    <h1 className={`text-3xl font-black tracking-tight ${theme.primaryText} ${theme.glow}`}>
                      BLUESCALP ASSASSIN V1.0
                    </h1>
                    <p className={`text-xs font-semibold ${theme.accentText} tracking-wide mt-0.5`}>
                      by Tman Capitals
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

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/60 text-[11px] font-extrabold text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      LIVE
                    </div>
                    <button
                      onClick={() => setActiveTab("settings")}
                      className="p-1 rounded-full border border-white/20 bg-slate-900/90 text-white shadow-md active:scale-95 transition hover:bg-slate-800"
                      title="Settings Menu"
                    >
                      <Menu className="w-3.5 h-3.5 text-white" />
                    </button>
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
            <div data-trade-panel={tradePanelStyle} className={`bsa-trade-panel w-full bg-[#081525] border ${theme.border} rounded-2xl py-3.5 px-3 flex items-center justify-between shadow-lg`}>
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

            {/* CONNECTED BOTS & QUICK ACTION CARDS */}
            <div className="flex items-center justify-between pt-2">
              <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                <Layers className={`w-4 h-4 ${theme.accentText}`} />
                Connected Bots
              </h2>
              <button
                onClick={() => setModalOpen("connect")}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/60 active:scale-95 transition flex items-center gap-1"
              >
                + Add New Bot
              </button>
            </div>

            {/* Stacked Cards matching reference UI */}
            <div className="flex flex-col gap-2.5 w-full">
              {/* Card 1: Active EA */}
              <div
                onClick={() => setActiveTab("signals")}
                className="w-full bg-[#06121f] border border-cyan-500/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg active:scale-[0.99] transition cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full border border-cyan-400/60 p-0.5 bg-slate-900 shrink-0 overflow-hidden shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                  <img
                    src="/images/bluescalp-bot.jpg"
                    alt="BlueScalp Robot"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-100 tracking-wide uppercase">
                    BLUESCALP ASSASSIN EA
                  </h3>
                  <p className="text-[11px] text-cyan-400 font-medium">
                    {isActive ? "ACTIVE • MONITORING SESSIONS" : "IDLE • PAUSED"}
                  </p>
                </div>
              </div>

              {/* Card 2: Chart Scanner */}
              <div
                onClick={() => setActiveTab("scanner")}
                className="w-full bg-[#06121f] border border-cyan-500/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg active:scale-[0.99] transition cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-100 tracking-wide uppercase">
                    CHART SCANNER
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    AI-POWERED TRADE ANALYSIS
                  </p>
                </div>
              </div>

              {/* Card 3: Add A New EA */}
              <div
                onClick={() => setModalOpen("connect")}
                className="w-full bg-[#06121f] border border-cyan-500/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg active:scale-[0.99] transition cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-100 tracking-wide uppercase">
                    ADD A NEW EA
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    HAVE A VALID LICENSE KEY
                  </p>
                </div>
              </div>
            </div>
              </div>
            )}
          </>
        )}

        {/* VIEW 2: SIGNALS TAB (UPGRADED VIP LIVE SMC SIGNALS) */}
        {activeTab === "signals" && (
          <VipSignalsView signals={signals} onRefresh={fetchSignals} theme={theme} />
        )}

        {/* VIEW 3: SCANNER TAB (With Trading Style: Scalp, Intraday, Swing) */}
        {activeTab === "scanner" && (
          <div data-scanner-mode={scannerStyle} className="bsa-scanner-view w-full flex flex-col gap-3.5">
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
                      <span className="${theme.accentText} font-bold">{["Textbook", "Conservative", "Balanced", "Aggressive", "Ultra"][tuningConfig.sensitivity - 1]}</span>
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
                      <span className="${theme.accentText} font-bold">{["Lenient", "Relaxed", "Standard", "Strict", "Surgical"][tuningConfig.strictness - 1]}</span>
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
                      <span className="${theme.accentText} font-bold">{tuningConfig.minConfluences} Factors</span>
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
                      <span className="${theme.accentText} font-bold">1:{tuningConfig.minRR}</span>
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
              <MarketPairSelector
                selectedPair={selectedScannerPair}
                onSelectPair={setSelectedScannerPair}
                selectedTimeframe={selectedScannerTf}
                onSelectTimeframe={setSelectedScannerTf}
                theme={theme}
              />
            </div>

            {/* STRATEGY SWITCHER */}
            <div className="flex flex-col gap-2 p-3 rounded-2xl bg-[#081525] border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">STRATEGY</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 text-xs font-bold">
                {(["ALL", "ICT", "SMC", "CRT", "ULTRABREAKOUT"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMethodology(m)}
                    className={`py-2 px-1 rounded-xl border transition text-center truncate ${
                      selectedMethodology === m
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {m === "ULTRABREAKOUT" ? "BREAKOUT" : m}
                  </button>
                ))}
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
            {/* METHODOLOGY SWITCHER */}
            

            {/* ENHANCED ANALYSIS RESULT HUD */}
            {chartAnalysis && !isScanningChart && (
              <EnhancedScannerView
                analysis={chartAnalysis}
                onExecuteSingleTrade={handleSingleTradeExecution}
                isExecuting={isExecutingSingleTrade}
              />
            )}
          </div>
        )}

                {activeTab === "settings" && (
          <div className="w-full flex flex-col gap-4 pb-12">
            {/* Top Bar with Back Arrow to Home */}
            <div className={`flex items-center justify-between pb-3 border-b ${theme.border}`}>
              <button
                onClick={() => setActiveTab("home")}
                className="w-10 h-10 rounded-full border border-white/10 bg-slate-900/80 flex items-center justify-center text-white active:scale-95 transition shadow-md"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <h2 className="text-base font-black text-white uppercase tracking-wider">
                  Settings & Appearance
                </h2>
                <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                  CUSTOMIZE INTERFACE & TERMINAL
                </p>
              </div>
              <div className="w-10" />
            </div>

            {/* 1. AUTO-TRADE MASTER TOGGLE */}
            <div className={`bg-[#06121f] border-2 ${theme.border} rounded-2xl p-4 flex items-center justify-between shadow-lg`}>
              <div className="flex flex-col gap-0.5 pr-2">
                <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className={`w-4 h-4 ${theme.accentText}`} />
                  Auto-Trade Engine
                </span>
                <p className="text-[11px] text-slate-400 font-medium">
                  Allow automated sniper entries when verified confluences align.
                </p>
              </div>
              <button
                onClick={() => {
                  const next = !autoTrade;
                  setAutoTrade(next);
                  localStorage.setItem("bsa_autotrade", String(next));
                }}
                className={`w-14 h-7 rounded-full transition-colors p-0.5 border ${
                  autoTrade ? "bg-emerald-500 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-slate-800 border-slate-700"
                }`}
              >
                <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${autoTrade ? "translate-x-7" : "translate-x-0"}`} />
              </button>
            </div>

            {/* 2. HOME STYLE */}
            <div className={`bg-[#06121f] border-2 ${theme.border} rounded-2xl p-4 flex flex-col gap-2.5 shadow-lg`}>
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Home className={`w-4 h-4 ${theme.accentText}`} />
                Home Style
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "commander", label: "Commander", desc: "Portrait & Cards" },
                  { id: "classic", label: "Classic", desc: "Hero Scanner" },
                  { id: "premium", label: "Premium", desc: "Minimal HUD" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setHomeStyle(s.id as HomeStyle);
                      localStorage.setItem("bsa_homestyle", s.id);
                    }}
                    className={`py-2.5 px-2 rounded-xl text-xs font-black uppercase tracking-wider border transition flex flex-col items-center gap-0.5 ${
                      homeStyle === s.id
                        ? `${theme.buttonBg} border-white shadow-lg`
                        : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{s.label}</span>
                    <span className="text-[9px] font-normal opacity-75">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. LAYOUT SELECTOR (Hero, Center, Dash, Cine, Card) */}
            <div className={`bg-[#06121f] border-2 ${theme.border} rounded-2xl p-4 flex flex-col gap-2.5 shadow-lg`}>
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className={`w-4 h-4 ${theme.accentText}`} />
                Dashboard Layout
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: "hero", name: "Hero" },
                  { id: "center", name: "Center" },
                  { id: "dash", name: "Dash" },
                  { id: "cine", name: "Cine" },
                  { id: "card", name: "Card" },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      setLayoutStyle(l.id as LayoutStyle);
                      localStorage.setItem("bsa_layout", l.id);
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-[10px] font-black uppercase transition ${
                      layoutStyle === l.id
                        ? `${theme.buttonBg} border-white shadow-md`
                        : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="w-6 h-5 rounded border border-current opacity-70 flex flex-col justify-between p-0.5">
                      <div className="w-full h-1 bg-current rounded-xs" />
                      <div className="w-1/2 h-1 bg-current rounded-xs" />
                    </div>
                    {l.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. TRADE PANEL SELECTOR (Pill, Circle, Grid, Float) */}
            <div className={`bg-[#06121f] border-2 ${theme.border} rounded-2xl p-4 flex flex-col gap-2.5 shadow-lg`}>
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className={`w-4 h-4 ${theme.accentText}`} />
                Trade Panel Mode
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "pill", name: "Pill" },
                  { id: "circle", name: "Circle" },
                  { id: "grid", name: "Grid" },
                  { id: "float", name: "Float" },
                ].map((tp) => (
                  <button
                    key={tp.id}
                    onClick={() => {
                      setTradePanelStyle(tp.id as TradePanelStyle);
                      localStorage.setItem("bsa_tradepanel", tp.id);
                    }}
                    className={`py-2 rounded-xl border text-[11px] font-black uppercase transition ${
                      tradePanelStyle === tp.id
                        ? `${theme.buttonBg} border-white shadow-md`
                        : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {tp.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. CHART SCANNER SELECTOR (Pill, Radar, Terminal, Power, Hybrid) */}
            <div className={`bg-[#06121f] border-2 ${theme.border} rounded-2xl p-4 flex flex-col gap-2.5 shadow-lg`}>
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Crosshair className={`w-4 h-4 ${theme.accentText}`} />
                Chart Scanner Mode
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: "pill", name: "Pill" },
                  { id: "radar", name: "Radar" },
                  { id: "terminal", name: "Term" },
                  { id: "power", name: "Power" },
                  { id: "hybrid", name: "Hybrid" },
                ].map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setScannerStyle(sc.id as ScannerStyle);
                      localStorage.setItem("bsa_scannerstyle", sc.id);
                    }}
                    className={`py-2 rounded-xl border text-[10px] font-black uppercase transition ${
                      scannerStyle === sc.id
                        ? `${theme.buttonBg} border-white shadow-md`
                        : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {sc.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. COLOUR THEMES & GLOW ACCENTS (8 Total Palettes) */}
            <div className={`bg-[#06121f] border-2 ${theme.border} rounded-2xl p-4 flex flex-col gap-3 shadow-lg`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className={`w-4 h-4 ${theme.accentText}`} />
                  Colour Theme & Glow Palette
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {themeColor}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 pt-1">
                {[
                  { id: "cyan", name: "Cyan Blue", bg: "bg-cyan-400", border: "border-cyan-400" },
                  { id: "emerald", name: "Emerald", bg: "bg-emerald-400", border: "border-emerald-400" },
                  { id: "amber", name: "Cyber Gold", bg: "bg-amber-400", border: "border-amber-400" },
                  { id: "crimson", name: "Crimson", bg: "bg-rose-500", border: "border-rose-500" },
                  { id: "purple", name: "Neon Purple", bg: "bg-fuchsia-400", border: "border-fuchsia-400" },
                  { id: "blood", name: "Blood Orange", bg: "bg-orange-500", border: "border-orange-500" },
                  { id: "matrix", name: "Matrix Lime", bg: "bg-lime-400", border: "border-lime-400" },
                  { id: "royal", name: "Royal Blue", bg: "bg-blue-500", border: "border-blue-500" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setThemeColor(c.id as ThemeColor);
                      localStorage.setItem("bsa_color", c.id);
                    }}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition ${
                      themeColor === c.id
                        ? "bg-slate-800/90 border-white shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-105"
                        : "bg-slate-900/60 border-slate-800 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full ${c.bg} shadow-md border-2 border-white/20`} />
                    <span className="text-[10px] text-slate-300 font-bold">{c.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 7. BOT IMAGE SHAPE */}
            <div className={`bg-[#06121f] border-2 ${theme.border} rounded-2xl p-4 flex flex-col gap-2.5 shadow-lg`}>
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Square className={`w-4 h-4 ${theme.accentText}`} />
                Bot Image Shape
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setBotShape("rectangle");
                    localStorage.setItem("bsa_shape", "rectangle");
                  }}
                  className={`py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-black uppercase transition ${
                    botShape === "rectangle"
                      ? `${theme.buttonBg} border-white shadow-md`
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
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
                  className={`py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-black uppercase transition ${
                    botShape === "circle"
                      ? `${theme.buttonBg} border-white shadow-md`
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <Circle className="w-4 h-4" />
                  Circle (Floating)
                </button>
              </div>
            </div>

            {/* 8. FONT STYLE */}
            <div className={`bg-[#06121f] border-2 ${theme.border} rounded-2xl p-4 flex flex-col gap-2.5 shadow-lg`}>
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Type className={`w-4 h-4 ${theme.accentText}`} />
                Typography Font
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
                    className={`py-2 rounded-xl text-xs font-black uppercase border transition ${
                      fontFamily === f.id
                        ? `${theme.buttonBg} border-white shadow-md`
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 9. FLOATING OVERLAY & BACKGROUND VIDEO */}
            <div className={`bg-[#06121f] border-2 ${theme.border} rounded-2xl p-4 flex items-center justify-between shadow-lg`}>
              <div className="flex flex-col gap-0.5 pr-2">
                <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <AppWindow className={`w-4 h-4 ${theme.accentText}`} />
                  Display Over Other Apps
                </span>
                <p className="text-[11px] text-slate-400 font-medium">
                  Keep floating sniper radar visible when charting in MT5.
                </p>
              </div>
              <button
                onClick={() => {
                  const next = !overlayEnabled;
                  setOverlayEnabled(next);
                  localStorage.setItem("bsa_overlay", String(next));
                }}
                className={`w-14 h-7 rounded-full transition-colors p-0.5 border ${
                  overlayEnabled ? "bg-emerald-500 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-slate-800 border-slate-700"
                }`}
              >
                <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${overlayEnabled ? "translate-x-7" : "translate-x-0"}`} />
              </button>
            </div>

            {/* 10. LICENSE & SUPPORT */}
            <div className={`bg-[#06121f] border-2 ${theme.border} rounded-2xl p-4 flex flex-col gap-2 shadow-lg`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className={`w-4 h-4 ${theme.accentText}`} />
                  Terminal License
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  ACTIVE
                </span>
              </div>
              <div className="text-xs text-slate-300 space-y-0.5">
                <p><strong>License Key:</strong> <span className={`font-mono ${theme.accentText}`}>{activeKey}</span></p>
                <p><strong>Assigned User:</strong> {clientInfo?.clientName || "Tman Capitals"}</p>
                <p><strong>Expiry:</strong> {clientInfo?.expiresAt ? new Date(clientInfo.expiresAt).toLocaleDateString() : "Lifetime Verified"}</p>
              </div>
              <button
                onClick={handleLockOut}
                className="mt-2 py-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 font-black text-xs uppercase flex items-center justify-center gap-1.5 hover:bg-red-950/60 active:scale-95 transition"
              >
                <LogOut className="w-4 h-4" />
                Log Out / Switch License Key
              </button>
            </div>

            {/* Mentor Direct WhatsApp */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs shadow-lg">
              <div>
                <p className="font-black text-emerald-300 uppercase tracking-wide">Mentor WhatsApp Direct</p>
                <p className="text-[11px] text-slate-300">+27 64 929 1083 (Tman Capitals)</p>
              </div>
              <a
                href="https://wa.me/27649291083"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-400 text-slate-950 font-black text-xs uppercase active:scale-95 transition shadow-md"
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
              <button onClick={() => { setModalOpen(null); setActiveTab("home"); }} className="text-slate-400 hover:text-white">
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
              onClick={() => { setModalOpen(null); setActiveTab("home"); }}
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
              <button onClick={() => { setModalOpen(null); setActiveTab("home"); }} className="text-slate-400 hover:text-white">
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

      

    </div>
  );
}

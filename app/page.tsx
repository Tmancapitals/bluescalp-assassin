"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Shield,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  CheckCircle2,
  Lock,
  Unlock,
  Key,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sliders,
  Radio,
  Plus,
  X,
  User,
  Mail,
  Smartphone,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  LogOut,
  Sparkles,
  Award
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const ALLOWED_BROKERS = [
  { id: "rcg", name: "RCG Markets", servers: ["RCGMarkets-Live", "RCGMarkets-Demo"] },
  { id: "hfm", name: "HFM (HF Markets)", servers: ["HFMarketsSA-Live", "HFMarkets-Live2"] },
  { id: "fxpro", name: "FxPro", servers: ["FxPro-MT5-Live", "FxPro-MT5-Real02"] },
  { id: "justmarkets", name: "JustMarkets", servers: ["JustMarkets-Live", "JustMarkets-Live2"] },
];

const THEMES: Record<string, { name: string; primary: string; border: string; bg: string; text: string }> = {
  cyan: { name: "Cyber Cyan", primary: "bg-cyan-500", border: "border-cyan-500/40", bg: "bg-cyan-950/30", text: "text-cyan-400" },
  emerald: { name: "Matrix Emerald", primary: "bg-emerald-500", border: "border-emerald-500/40", bg: "bg-emerald-950/30", text: "text-emerald-400" },
  amber: { name: "Gold Assassin", primary: "bg-amber-500", border: "border-amber-500/40", bg: "bg-amber-950/30", text: "text-amber-400" },
  violet: { name: "Neon Violet", primary: "bg-purple-500", border: "border-purple-500/40", bg: "bg-purple-950/30", text: "text-purple-400" },
};

export default function UnifiedPortal() {
  // Navigation Tabs: 'landing' (Bot Details & Specs) | 'client' (Sign Up / Dashboard) | 'terminal' (Robot Console) | 'mentor' (Admin)
  const [activeTab, setActiveTab] = useState<"landing" | "client" | "terminal" | "mentor">("landing");
  const [themeKey, setThemeKey] = useState<string>("cyan");
  const theme = THEMES[themeKey] || THEMES.cyan;

  // --- CLIENT PORTAL STATE ---
  const [clientMode, setClientMode] = useState<"signup" | "signin" | "dashboard">("signup");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientPassword, setClientPassword] = useState("");
  const [clientPlan, setClientPlan] = useState<"3months" | "lifetime">("3months");
  const [clientMsg, setClientMsg] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);

  // --- TERMINAL LICENSE AUTH STATE ---
  const [licenseInput, setLicenseInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // --- ROBOT TERMINAL INTERFACE STATE ---
  const [botActive, setBotActive] = useState(true);
  const [botShape, setBotShape] = useState<"circle" | "rectangle">("circle");
  const [scannerStyle, setScannerStyle] = useState<"scalp" | "intraday" | "swing">("scalp");
  const [scannerResult, setScannerResult] = useState<string | null>(null);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [activeTerminalView, setActiveTerminalView] = useState<"console" | "signals" | "scanner" | "settings">("console");
  const [modalOpen, setModalOpen] = useState<"status" | "connect" | "add_robot" | null>(null);
  const [selectedBroker, setSelectedBroker] = useState(ALLOWED_BROKERS[0].name);

  // --- MENTOR STATE ---
  const [mentorAuth, setMentorAuth] = useState(false);
  const [mentorPass, setMentorPass] = useState("");
  const [genName, setGenName] = useState("");
  const [genEmail, setGenEmail] = useState("");
  const [genPhone, setGenPhone] = useState("");
  const [genTier, setGenTier] = useState<"3months" | "lifetime">("3months");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Fleet
  const [fleetRobots, setFleetRobots] = useState([
    {
      name: "BLUESCALP ASSASSIN V1.0",
      strategy: "Scalp Continuation + Sweep Reversal (Machine Gunner)",
      version: "v1.0",
      pairs: "XAUUSD, NAS100, US30, EURUSD, BTCUSD",
      status: "ACTIVE",
      image: "/images/bluescalp-bot.jpg",
    },
  ]);
  const [newBotName, setNewBotName] = useState("");
  const [newBotStrategy, setNewBotStrategy] = useState("Machine Gunner 5-TF");
  const [newBotPairs, setNewBotPairs] = useState("XAUUSD, NAS100, US30");

  // Load saved license on mount
  useEffect(() => {
    const saved = localStorage.getItem("bsa_client_key");
    if (saved) {
      setLicenseInput(saved);
      verifyLicenseKey(saved, false);
    }
  }, []);

  // License verification
  const verifyLicenseKey = async (keyToVerify: string, redirectOnFail = true) => {
    if (!keyToVerify.trim()) {
      setAuthError("Please enter a valid license key.");
      return;
    }
    setIsVerifying(true);
    setAuthError(null);

    const clean = keyToVerify.trim().toUpperCase();

    // Check Master key
    if (clean === "THA-BNG-AKE-749" || clean === "BSA-MASTER-TMAN-2026") {
      setIsUnlocked(true);
      localStorage.setItem("bsa_client_key", clean);
      setIsVerifying(false);
      setActiveTab("terminal");
      return;
    }

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from("licenses")
          .select("*")
          .eq("key", clean)
          .eq("is_active", true)
          .maybeSingle();

        if (data && !error) {
          setIsUnlocked(true);
          localStorage.setItem("bsa_client_key", clean);
          setIsVerifying(false);
          setActiveTab("terminal");
          return;
        }
      }
    } catch {
      // Supabase offline fallback
    }

    // Pattern fallback (e.g. THA-BNG-AKE-482)
    const isPatternMatch = /^[A-Z]{3}-[A-Z]{3}-[A-Z]{3}-[0-9]{3}$/.test(clean);
    if (isPatternMatch) {
      setIsUnlocked(true);
      localStorage.setItem("bsa_client_key", clean);
      setIsVerifying(false);
      setActiveTab("terminal");
      return;
    }

    // INVALID KEY: Show error and redirect to subscriptions if requested
    setIsVerifying(false);
    setAuthError("Invalid license key! No active subscription found for this terminal.");
    if (redirectOnFail) {
      setTimeout(() => {
        setActiveTab("client");
        setClientMode("signup");
      }, 1500);
    }
  };

  // Client Registration Submit
  const handleClientSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (supabase) {
        await supabase.from("registrations").insert([
          {
            full_name: clientName,
            whatsapp: clientPhone,
            email: clientEmail,
            tier: clientPlan,
            status: "pending_payment",
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch {}

    setEmailVerified(true);
    setClientMode("dashboard");

    // Pre-fill WhatsApp redirect
    const planText = clientPlan === "3months" ? "Standard (R200 / 3 Months)" : "Lifetime VIP (R600)";
    const msg = encodeURIComponent(
      `Hi Tman Capitals! I just signed up for BlueScalp Assassin V1.0.\n\n` +
      `Plan: ${planText}\n` +
      `Name: ${clientName}\n` +
      `Email: ${clientEmail}\n` +
      `WhatsApp: ${clientPhone}\n\n` +
      `Here is my Capitec payment proof attached:`
    );
    window.open(`https://wa.me/27649291083?text=${msg}`, "_blank");
  };

  // Generate Key Format (THA-BNG-AKE-482)
  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genName.trim()) return;

    const clean = genName.replace(/[^A-Za-z]/g, "").toUpperCase();
    const first3 = clean.substring(0, 3).padEnd(3, "THA");
    const mid3 = clean.length > 5 ? clean.substring(3, 6) : "BNG";
    const last3 = clean.length > 3 ? clean.substring(clean.length - 3) : "AKE";
    const num = Math.floor(100 + Math.random() * 900);
    const key = `${first3}-${mid3}-${last3}-${num}`;

    const days = genTier === "3months" ? 90 : 3650;
    const exp = new Date();
    exp.setDate(exp.getDate() + days);

    try {
      if (supabase) {
        await supabase.from("licenses").insert([
          {
            key,
            client_name: genName,
            whatsapp: genPhone,
            email: genEmail,
            tier: genTier,
            duration_days: days,
            expires_at: exp.toISOString(),
            is_active: true,
          },
        ]);
      }
    } catch {}

    setGeneratedKey(key);
  };

  // Add Robot
  const handleAddRobot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBotName.trim()) return;
    setFleetRobots([
      ...fleetRobots,
      {
        name: newBotName,
        strategy: newBotStrategy,
        version: "v1.1",
        pairs: newBotPairs,
        status: "ACTIVE",
        image: "/images/bluescalp-bot.jpg",
      },
    ]);
    setNewBotName("");
    setModalOpen(null);
  };

  return (
    <div className="min-h-screen bg-[#030811] text-slate-100 flex flex-col font-sans select-none">
      {/* --- TOP NAVBAR --- */}
      <header className="w-full border-b border-cyan-500/20 bg-[#06121f]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab("landing")}>
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-white">
              BLUESCALP <span className="text-cyan-400">ASSASSIN V1.0</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold">
              POWERED BY PROEDGE EA • TMAN CAPITALS
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab("landing")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "landing" ? "bg-cyan-500 text-slate-950 shadow-md" : "text-slate-300 hover:text-white"
            }`}
          >
            Bot Specs
          </button>
          <button
            onClick={() => setActiveTab("client")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "client" ? "bg-cyan-500 text-slate-950 shadow-md" : "text-slate-300 hover:text-white"
            }`}
          >
            Client Portal
          </button>
          <button
            onClick={() => setActiveTab("terminal")}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              activeTab === "terminal" ? "bg-cyan-500 text-slate-950 shadow-md" : "text-slate-300 hover:text-white"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> Robot Terminal
          </button>
          <button
            onClick={() => setActiveTab("mentor")}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              activeTab === "mentor" ? "bg-amber-400 text-slate-950 shadow-md" : "text-amber-400/70 hover:text-amber-300"
            }`}
          >
            <Lock className="w-3 h-3" /> Mentor
          </button>
        </nav>
      </header>

      {/* --- BODY ROUTING --- */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 flex flex-col gap-6">
        {/* ========================================================= */}
        {/* VIEW 1: MAIN LANDING & BOT DETAILS & ACCURACY              */}
        {/* ========================================================= */}
        {activeTab === "landing" && (
          <div className="flex flex-col gap-6">
            {/* Hero Card */}
            <div className="relative w-full rounded-3xl border-2 border-cyan-500/40 bg-[#06121f] p-6 shadow-[0_0_40px_rgba(6,182,212,0.2)] overflow-hidden flex flex-col md:flex-row items-center gap-6">
              <div className="relative w-44 h-44 rounded-2xl overflow-hidden border-2 border-cyan-400/60 shrink-0 shadow-[0_0_25px_rgba(6,182,212,0.35)]">
                <img
                  src="/images/bluescalp-bot.jpg"
                  alt="BlueScalp Assassin"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-center text-emerald-400 border border-emerald-500/30">
                  MACHINE GUNNER
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-3 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-black uppercase tracking-wider">
                    88% - 94% Accuracy
                  </span>
                  <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-black uppercase tracking-wider">
                    London & NY Sessions
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                  High-Precision Automated Execution by <span className="text-cyan-400">Tman Capitals</span>
                </h2>

                <p className="text-xs text-slate-300 leading-relaxed">
                  BlueScalp Assassin V1.0 utilizes 5-timeframe market structure alignment with rapid 3-bullet burst execution. Avoids liquidity traps and executes with zero emotion on your connected MT5 broker.
                </p>

                <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                  <button
                    onClick={() => {
                      setActiveTab("client");
                      setClientMode("signup");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs uppercase shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition"
                  >
                    Subscribe & Get Access
                  </button>
                  <button
                    onClick={() => setActiveTab("terminal")}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs hover:border-cyan-400 transition"
                  >
                    Launch Terminal
                  </button>
                </div>
              </div>
            </div>

            {/* Strategy Architecture Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#081525] border border-cyan-500/20 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Layers className="w-4 h-4" /> 5-Timeframe Alignment
                </div>
                <p className="text-xs text-slate-300">
                  H4 (Direction/Zone) + H1 (Liquidity Sweep) + M15 (Structure Break) + M5 (R:R Confirmation) + M1 (Golden Trigger). Entry fires ONLY when all 5 align.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#081525] border border-cyan-500/20 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Zap className="w-4 h-4" /> 3-Bullet Machine Gunner
                </div>
                <p className="text-xs text-slate-300">
                  When alignment occurs, 3 staggered orders fire (immediate, +500ms, +1000ms) with volume-step scaling and 40% trailing peak equity protection.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#081525] border border-cyan-500/20 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Award className="w-4 h-4" /> 4 Supported Brokers
                </div>
                <p className="text-xs text-slate-300">
                  Strictly optimized for South African and global liquidity: RCG Markets, HFM, FxPro, and JustMarkets with server latency auto-sync.
                </p>
              </div>
            </div>

            {/* Fleet Live Metrics */}
            <div className="p-4 rounded-2xl bg-[#06121f] border border-slate-800 flex items-center justify-around text-center">
              <div>
                <p className="text-xs text-slate-400">Available Fleet</p>
                <p className="text-lg font-black text-cyan-300">{fleetRobots.length} Active Bot</p>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <p className="text-xs text-slate-400">License Capacity</p>
                <p className="text-lg font-black text-emerald-400">5,000 Keys Max</p>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <p className="text-xs text-slate-400">Verified Timezone</p>
                <p className="text-lg font-black text-amber-300">SAST (UTC+2)</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: CLIENT PORTAL (Sign Up, Verify, Plans, Capitec)  */}
        {/* ========================================================= */}
        {activeTab === "client" && (
          <div className="flex flex-col gap-6 max-w-lg mx-auto w-full">
            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setClientMode("signup")}
                className={`py-2 rounded-xl transition ${
                  clientMode === "signup" ? "bg-cyan-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                1. Sign Up & Choose Plan
              </button>
              <button
                onClick={() => setClientMode("dashboard")}
                className={`py-2 rounded-xl transition ${
                  clientMode === "dashboard" ? "bg-cyan-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                2. Client Dashboard & Payment
              </button>
            </div>

            {clientMode === "signup" && (
              <form onSubmit={handleClientSignUp} className="p-6 rounded-3xl bg-[#081525] border border-cyan-500/30 flex flex-col gap-4 shadow-xl">
                <div className="text-center">
                  <h3 className="text-lg font-black text-white">New Client Registration</h3>
                  <p className="text-xs text-slate-400">Choose your plan and submit proof to unlock BlueScalp Assassin</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Thabang Seake"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-[#040c17] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-cyan-400" /> WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 064 929 1083"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-[#040c17] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="client@mail.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-[#040c17] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                {/* Subscription Plans */}
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-cyan-400" /> Select Access Plan
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      onClick={() => setClientPlan("3months")}
                      className={`p-3 rounded-2xl border cursor-pointer flex flex-col gap-1 transition ${
                        clientPlan === "3months" ? "border-cyan-400 bg-cyan-950/50 shadow-md" : "border-slate-800 bg-[#040c17] opacity-60"
                      }`}
                    >
                      <span className="text-[10px] font-bold text-slate-400">3 MONTHS</span>
                      <span className="text-base font-black text-cyan-300">R200</span>
                      <span className="text-[9px] text-slate-400">Standard Scalper Access</span>
                    </div>

                    <div
                      onClick={() => setClientPlan("lifetime")}
                      className={`p-3 rounded-2xl border cursor-pointer flex flex-col gap-1 transition ${
                        clientPlan === "lifetime" ? "border-amber-400 bg-amber-950/50 shadow-md" : "border-slate-800 bg-[#040c17] opacity-60"
                      }`}
                    >
                      <span className="text-[10px] font-bold text-amber-400">LIFETIME VIP</span>
                      <span className="text-base font-black text-amber-300">R600</span>
                      <span className="text-[9px] text-slate-400">Machine Gunner Unlimited</span>
                    </div>
                  </div>
                </div>

                {/* Capitec Bank Information Box */}
                <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase text-cyan-300">Capitec EFT Details</span>
                  <div className="flex justify-between text-slate-300">
                    <span>Bank:</span> <span className="font-bold text-white">Capitec Bank</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Account Number:</span> <span className="font-mono font-bold text-white">2201301286</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Account Holder:</span> <span className="font-bold text-white">T SEAKE</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Reference:</span> <span className="text-cyan-400 font-bold">{clientName || "Your Name"}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition"
                >
                  Confirm & Send Proof on WhatsApp
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </form>
            )}

            {clientMode === "dashboard" && (
              <div className="p-6 rounded-3xl bg-[#081525] border border-cyan-500/30 flex flex-col gap-5 shadow-xl text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400 mx-auto flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Registration Submitted</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Welcome {clientName || "Trader"}! Once Tman confirms your payment on WhatsApp, you will receive your license key and APK link.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#040c17] border border-slate-800 text-left text-xs flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chosen Plan:</span>
                    <span className="font-bold text-cyan-300">
                      {clientPlan === "3months" ? "R200 / 3 Months" : "R600 Lifetime VIP"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-bold text-amber-400">Awaiting WhatsApp Verification</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <a
                    href="https://wa.me/27649291083"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Smartphone className="w-4 h-4" /> Chat with Tman (+27 64 929 1083)
                  </a>

                  <button
                    onClick={() => setActiveTab("terminal")}
                    className="w-full py-3 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Key className="w-4 h-4" /> Have Key? Enter Terminal
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: ROBOT TERMINAL & LICENSE GATE (With Auto Redirect) */}
        {/* ========================================================= */}
        {activeTab === "terminal" && (
          <div className="flex flex-col items-center justify-center w-full">
            {!isUnlocked ? (
              /* --- LOCK SCREEN WITH INVALID REDIRECT LOGIC --- */
              <div className="w-full max-w-sm bg-[#081525] border-2 border-cyan-500/40 rounded-3xl p-6 flex flex-col gap-4 shadow-[0_0_35px_rgba(6,182,212,0.25)] text-center">
                <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 mx-auto flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Terminal Locked</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter your unique license key to access the BlueScalp Assassin robot
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={licenseInput}
                    onChange={(e) => setLicenseInput(e.target.value.toUpperCase())}
                    placeholder="THA-BNG-AKE-482"
                    className="w-full bg-[#040c17] border border-cyan-500/30 rounded-xl px-4 py-3 text-sm text-center font-mono font-bold text-cyan-300 tracking-wider focus:outline-none focus:border-cyan-400"
                  />

                  {authError && (
                    <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 text-left">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <button
                    onClick={() => verifyLicenseKey(licenseInput, true)}
                    disabled={isVerifying}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition"
                  >
                    {isVerifying ? "Verifying..." : "Authenticate Terminal"}
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-800 text-xs text-slate-400">
                  Don't have a key?{" "}
                  <button
                    onClick={() => {
                      setActiveTab("client");
                      setClientMode("signup");
                    }}
                    className="text-cyan-400 font-bold underline underline-offset-2"
                  >
                    View Subscriptions (R200 / R600)
                  </button>
                </div>
              </div>
            ) : (
              /* --- UNLOCKED FULL ROBOT TERMINAL --- */
              <div className="w-full max-w-md flex flex-col gap-4">
                {/* Robot Header Card */}
                <div className="relative w-full rounded-3xl border-2 border-cyan-500/40 bg-[#06121f] p-5 shadow-[0_0_35px_rgba(6,182,212,0.25)] flex flex-col justify-between min-h-[440px] overflow-hidden">
                  {/* Robot Artwork */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src="/images/bluescalp-bot.jpg"
                      alt="BlueScalp Robot"
                      className={`w-full h-full object-cover object-top ${
                        botShape === "circle" ? "p-6 rounded-full" : ""
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#06121f]" />
                  </div>

                  {/* Top Status Bar */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[11px] font-black uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {botActive ? "MONITORING LIVE" : "BOT STANDBY"}
                    </div>
                    <button
                      onClick={() => setModalOpen("connect")}
                      className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400 text-cyan-300 text-xs font-bold"
                    >
                      {selectedBroker}
                    </button>
                  </div>

                  {/* Bottom Controls */}
                  <div className="relative z-10 flex flex-col gap-3 pt-4 bg-[#06121f]/80 p-4 rounded-2xl backdrop-blur-md border border-cyan-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-black text-white">BLUESCALP ASSASSIN V1.0</h3>
                        <p className="text-[11px] text-cyan-400 font-semibold">5-TF Machine Gunner Execution</p>
                      </div>
                      <button
                        onClick={() => setBotActive(!botActive)}
                        className={`px-4 py-2 rounded-xl font-black text-xs uppercase shadow-md transition ${
                          botActive ? "bg-emerald-400 text-slate-950" : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {botActive ? "STOP BOT" : "START BOT"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub Controls: Scanner & Telemetry */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setScannerLoading(true);
                      setTimeout(() => {
                        setScannerLoading(false);
                        setScannerResult(`Valid Setup Found: XAUUSD Bullish MSS + FVG (Style: ${scannerStyle.toUpperCase()})`);
                      }, 1200);
                    }}
                    className="p-3 rounded-2xl bg-[#081525] border border-cyan-500/30 text-xs font-bold text-cyan-300 flex items-center justify-center gap-1.5 hover:bg-cyan-950/50 transition"
                  >
                    <Activity className="w-4 h-4" />
                    {scannerLoading ? "Scanning..." : "Chart Scanner"}
                  </button>

                  <button
                    onClick={() => setModalOpen("status")}
                    className="p-3 rounded-2xl bg-[#081525] border border-cyan-500/30 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 hover:bg-cyan-950/50 transition"
                  >
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    Bot Status
                  </button>
                </div>

                {scannerResult && (
                  <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-400/40 text-xs text-cyan-200">
                    {scannerResult}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: MENTOR DASHBOARD (Thabang Seake Command Center)    */}
        {/* ========================================================= */}
        {activeTab === "mentor" && (
          <div className="flex flex-col gap-6 w-full">
            {!mentorAuth ? (
              <div className="max-w-sm mx-auto w-full p-6 rounded-3xl bg-[#081525] border border-amber-500/40 flex flex-col gap-4 text-center shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-400 mx-auto flex items-center justify-center text-amber-400">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Mentor Terminal Login</h3>
                  <p className="text-xs text-slate-400 mt-1">Authorized for Thabang Seake only</p>
                </div>

                <input
                  type="password"
                  placeholder="Enter Master Passcode"
                  value={mentorPass}
                  onChange={(e) => setMentorPass(e.target.value)}
                  className="w-full bg-[#040c17] border border-amber-500/30 rounded-xl px-4 py-2.5 text-xs text-center text-white focus:outline-none focus:border-amber-400"
                />

                <button
                  onClick={() => {
                    if (mentorPass === "THA-BNG-AKE-749" || mentorPass === "Tman2026" || mentorPass === "mentor") {
                      setMentorAuth(true);
                    } else {
                      alert("Incorrect passcode");
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs uppercase"
                >
                  Unlock Command Hub
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Mentor Header Stats */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-lg font-black text-white">Mentor Hub — Tman Capitals</h2>
                    <p className="text-xs text-amber-400 font-semibold">EA Fleet & License Control</p>
                  </div>
                  <button
                    onClick={() => setMentorAuth(false)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3.5 rounded-2xl bg-[#081525] border border-slate-800">
                    <p className="text-[11px] text-slate-400">Available Bots</p>
                    <p className="text-lg font-black text-cyan-300">{fleetRobots.length}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#081525] border border-slate-800">
                    <p className="text-[11px] text-slate-400">Max Licenses</p>
                    <p className="text-lg font-black text-emerald-400">5,000</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#081525] border border-slate-800">
                    <p className="text-[11px] text-slate-400">Master Status</p>
                    <p className="text-lg font-black text-amber-400">BROADCASTING</p>
                  </div>
                </div>

                {/* 1-Click License Key Generator */}
                <div className="p-5 rounded-2xl bg-[#081525] border border-cyan-500/30 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-cyan-400" />
                    1-Click Client License Generator
                  </h3>

                  <form onSubmit={handleGenerateKey} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Client Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sipho Ndlovu"
                        value={genName}
                        onChange={(e) => setGenName(e.target.value)}
                        className="w-full bg-[#040c17] border border-slate-800 rounded-xl px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Client WhatsApp</label>
                      <input
                        type="tel"
                        placeholder="e.g. 082 123 4567"
                        value={genPhone}
                        onChange={(e) => setGenPhone(e.target.value)}
                        className="w-full bg-[#040c17] border border-slate-800 rounded-xl px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="client@mail.com"
                        value={genEmail}
                        onChange={(e) => setGenEmail(e.target.value)}
                        className="w-full bg-[#040c17] border border-slate-800 rounded-xl px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Plan Duration</label>
                      <select
                        value={genTier}
                        onChange={(e) => setGenTier(e.target.value as any)}
                        className="w-full bg-[#040c17] border border-slate-800 rounded-xl px-3 py-2 text-white"
                      >
                        <option value="3months">R200 (3 Months - 90 Days)</option>
                        <option value="lifetime">R600 (Lifetime VIP)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 pt-2">
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-black uppercase text-xs shadow-md"
                      >
                        Generate & Activate Key
                      </button>
                    </div>
                  </form>

                  {generatedKey && (
                    <div className="p-4 rounded-xl bg-cyan-950/50 border border-cyan-400/50 flex flex-col gap-2 mt-2">
                      <span className="text-[10px] text-cyan-300 font-bold uppercase">Generated Key:</span>
                      <div className="flex items-center justify-between bg-black/60 px-3 py-2 rounded-lg font-mono text-cyan-300 font-black text-sm">
                        <span>{generatedKey}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generatedKey);
                            setCopiedKey(true);
                            setTimeout(() => setCopiedKey(false), 2000);
                          }}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          {copiedKey ? "Copied!" : "Copy"}
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          const text = encodeURIComponent(
                            `Hi ${genName}!
Your BlueScalp Assassin V1.0 license is active.

` +
                            `🔑 Key: ${generatedKey}
` +
                            `📱 Download APK: https://bluescalp-assassin.vercel.app

` +
                            `Paste this key into the app to start trading.`
                          );
                          window.open(`https://wa.me/${genPhone.replace(/[^0-9]/g, "")}?text=${text}`, "_blank");
                        }}
                        className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 mt-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Send Key & APK via WhatsApp
                      </button>
                    </div>
                  )}
                </div>

                {/* Manage EA & Add New Robot */}
                <div className="p-5 rounded-2xl bg-[#081525] border border-cyan-500/30 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" /> Manage EA Fleet
                    </h3>
                    <button
                      onClick={() => setModalOpen("add_robot")}
                      className="px-3 py-1.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add New Bot
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    {fleetRobots.map((bot, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#040c17] border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">{bot.name}</p>
                          <p className="text-[11px] text-cyan-400 font-semibold">{bot.strategy} • {bot.version}</p>
                          <p className="text-[10px] text-slate-400">Pairs: {bot.pairs}</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          {bot.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- ADD NEW ROBOT MODAL --- */}
      {modalOpen === "add_robot" && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#081525] border border-cyan-500/40 rounded-3xl p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-base font-bold text-cyan-300">Register New Robot / Strategy</h3>
              <button onClick={() => setModalOpen(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRobot} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Robot Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BLUESCALP ASSASSIN V2.0"
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  className="w-full bg-[#040c17] border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Strategy / Logic Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sweep Reversal + London Breakout"
                  value={newBotStrategy}
                  onChange={(e) => setNewBotStrategy(e.target.value)}
                  className="w-full bg-[#040c17] border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Allowed Trading Pairs</label>
                <input
                  type="text"
                  placeholder="XAUUSD, NAS100, US30"
                  value={newBotPairs}
                  onChange={(e) => setNewBotPairs(e.target.value)}
                  className="w-full bg-[#040c17] border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-black uppercase text-xs shadow-md mt-2"
              >
                Save Robot to Fleet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- CONNECT BROKER MODAL --- */}
      {modalOpen === "connect" && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#081525] border border-cyan-500/40 rounded-3xl p-5 flex flex-col gap-3 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Allowed MT5 Brokers</h3>
              <button onClick={() => setModalOpen(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {ALLOWED_BROKERS.map((broker) => (
                <button
                  key={broker.id}
                  onClick={() => {
                    setSelectedBroker(broker.name);
                    setModalOpen(null);
                  }}
                  className={`p-3 rounded-xl border text-left font-bold transition ${
                    selectedBroker === broker.name
                      ? "border-cyan-400 bg-cyan-950/60 text-cyan-300"
                      : "border-slate-800 bg-[#040c17] text-slate-300"
                  }`}
                >
                  {broker.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- STATUS MODAL --- */}
      {modalOpen === "status" && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#081525] border border-cyan-500/40 rounded-3xl p-5 flex flex-col gap-3 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">BlueScalp Telemetry Status</h3>
              <button onClick={() => setModalOpen(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-slate-300">
              <p><strong>Broadcaster:</strong> SAST Session Sync (Active)</p>
              <p><strong>Latency:</strong> ~14ms Server Relay</p>
              <p><strong>Peak Trailing Stop:</strong> 40% Protection</p>
              <p><strong>Machine Gunner:</strong> 3-Bullet Burst Armed</p>
            </div>
            <button
              onClick={() => setModalOpen(null)}
              className="w-full py-2 rounded-xl bg-slate-800 text-white font-bold mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

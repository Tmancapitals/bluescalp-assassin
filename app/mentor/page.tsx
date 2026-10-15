"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Shield, Plus, Key, Check, Copy, ExternalLink, Bot, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function MentorPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  // License Generator State
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [tier, setTier] = useState<"3months" | "lifetime">("3months");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // New Robot State
  const [robotName, setRobotName] = useState("");
  const [robotStrategy, setRobotStrategy] = useState("Machine Gunner (5-TF)");
  const [robotVersion, setRobotVersion] = useState("v1.0");
  const [robotsList, setRobotsList] = useState([
    { name: "BLUESCALP ASSASSIN V1.0", strategy: "Machine Gunner 3-Burst", version: "v1.0", active: true },
  ]);

  // Generate Key Format: THA-BNG-AKE-482
  const generateFormattedKey = (name: string) => {
    const clean = name.replace(/[^A-Za-z]/g, "").toUpperCase();
    const first3 = clean.substring(0, 3).padEnd(3, "BSA");
    const mid3 = clean.length > 5 ? clean.substring(3, 6) : "BOT";
    const last3 = clean.length > 3 ? clean.substring(clean.length - 3) : "VIP";
    const randNum = Math.floor(100 + Math.random() * 900);
    return `${first3}-${mid3}-${last3}-${randNum}`;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName) return;

    const key = generateFormattedKey(clientName);
    const days = tier === "3months" ? 90 : 3650;
    const expires = new Date();
    expires.setDate(expires.getDate() + days);

    try {
      if (supabase) {
        await supabase.from("licenses").insert([
          {
            key: key,
            client_name: clientName,
            whatsapp: clientPhone,
            email: clientEmail,
            tier: tier,
            duration_days: days,
            expires_at: expires.toISOString(),
            is_active: true,
          },
        ]);
      }
    } catch {
      // Offline fallback
    }

    setGeneratedKey(key);
  };

  const handleAddRobot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!robotName) return;
    setRobotsList([...robotsList, { name: robotName, strategy: robotStrategy, version: robotVersion, active: true }]);
    setRobotName("");
  };

  const copyToClipboard = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#030811] text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#081525] border border-cyan-500/30 rounded-3xl p-6 flex flex-col gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-400 mx-auto flex items-center justify-center text-cyan-400">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-black text-white">Mentor Command Hub</h1>
          <p className="text-xs text-slate-400">Enter master passcode to manage clients and robots</p>
          <input
            type="password"
            placeholder="Master Passcode"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#040c17] border border-cyan-500/20 rounded-xl px-3 py-2 text-xs text-center text-white focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={() => {
              if (password === "THA-BNG-AKE-749" || password === "Tman2026" || password === "mentor") {
                setAuthenticated(true);
              } else {
                alert("Incorrect passcode");
              }
            }}
            className="w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs"
          >
            Access Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030811] text-slate-100 flex justify-center p-4 pb-20 font-sans">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Link href="/" className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:text-cyan-400">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-base font-black text-white">Mentor Hub — Tman Capitals</h1>
              <p className="text-xs text-cyan-400 font-medium">License Generator & Fleet Registry</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            Authorized
          </span>
        </div>

        {/* SECTION 1: LICENSE GENERATOR */}
        <div className="bg-[#081525] border border-cyan-500/30 rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            Generate Client License Key
          </h2>

          <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Client Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Thabang Seake"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-[#040c17] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">WhatsApp Number</label>
              <input
                type="tel"
                placeholder="e.g. 064 929 1083"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full bg-[#040c17] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Email (Optional)</label>
              <input
                type="email"
                placeholder="client@mail.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-[#040c17] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Subscription Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as any)}
                className="w-full bg-[#040c17] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="3months">R200 (3 Months - 90 Days)</option>
                <option value="lifetime">R600 (Lifetime VIP)</option>
              </select>
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-black uppercase text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95 transition"
              >
                Generate & Activate License
              </button>
            </div>
          </form>

          {/* Generated Result */}
          {generatedKey && (
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-400/50 flex flex-col gap-2 mt-2">
              <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                License Key Ready for Client:
              </span>
              <div className="flex items-center justify-between bg-black/60 px-3 py-2 rounded-lg font-mono text-cyan-300 font-black text-sm">
                <span>{generatedKey}</span>
                <button onClick={copyToClipboard} className="text-slate-400 hover:text-white flex items-center gap-1 text-xs">
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              {clientPhone && (
                <button
                  onClick={() => {
                    const text = encodeURIComponent(
                      `Hi ${clientName}!\nYour BlueScalp Assassin V1.0 access is approved.\n\n` +
                      `🔑 License Key: ${generatedKey}\n` +
                      `📱 Download APK: https://bluescalp-assassin.vercel.app\n\n` +
                      `Paste this key into the app and click Activate Terminal to start.`
                    );
                    window.open(`https://wa.me/${clientPhone.replace(/[^0-9]/g, "")}?text=${text}`, "_blank");
                  }}
                  className="w-full py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 mt-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Send Key & APK via WhatsApp
                </button>
              )}
            </div>
          )}
        </div>

        {/* SECTION 2: ROBOT FLEET & ADD NEW BOT */}
        <div className="bg-[#081525] border border-cyan-500/30 rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Bot className="w-4 h-4 text-cyan-400" />
            Robot Fleet Registry
          </h2>

          <form onSubmit={handleAddRobot} className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <input
              type="text"
              placeholder="Robot Name"
              value={robotName}
              onChange={(e) => setRobotName(e.target.value)}
              className="bg-[#040c17] border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
            <input
              type="text"
              placeholder="Strategy (e.g. Scalp Continuation)"
              value={robotStrategy}
              onChange={(e) => setRobotStrategy(e.target.value)}
              className="bg-[#040c17] border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
            <button
              type="submit"
              className="py-2 rounded-xl bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-300 text-white font-bold flex items-center justify-center gap-1 border border-slate-700"
            >
              <Plus className="w-3.5 h-3.5" /> Add Robot to Fleet
            </button>
          </form>

          <div className="flex flex-col gap-2 pt-2">
            {robotsList.map((bot, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#040c17] border border-slate-800">
                <div>
                  <p className="text-xs font-bold text-white">{bot.name}</p>
                  <p className="text-[10px] text-cyan-400">{bot.strategy} • {bot.version}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  ONLINE
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Shield, 
  Key, 
  Check, 
  Copy, 
  ArrowLeft, 
  Users, 
  Search, 
  RefreshCw, 
  Clock, 
  MessageCircle,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  AlertCircle,
  Database,
  Lock
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface LicenseRecord {
  id?: string | number;
  key: string;
  client_name: string;
  whatsapp?: string;
  email?: string;
  tier: string;
  duration_days: number;
  expires_at: string;
  is_active: boolean;
  created_at?: string;
  allowed_brokers?: string[];
}

export default function MentorPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Data states
  const [licenses, setLicenses] = useState<LicenseRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired">("all");

  // License Generator State
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [tier, setTier] = useState<"3months" | "lifetime">("3months");
  const [generating, setGenerating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Persistence of login in session
  useEffect(() => {
    const savedAuth = sessionStorage.getItem("bsa_mentor_auth");
    if (savedAuth === "true") {
      setAuthenticated(true);
    }
  }, []);

  // Fetch licenses whenever authenticated
  useEffect(() => {
    if (authenticated) {
      fetchLicenses();
    }
  }, [authenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = password.trim().toUpperCase();
    const validCodes = [
      "THA-BNG-AKE-749",
      "TMAN2026",
      "MENTOR",
      "BSA-MASTER-TMAN-2026",
      "TMAN_ASSASSIN_MASTER_KEY_2026"
    ];
    if (validCodes.includes(clean)) {
      setAuthenticated(true);
      sessionStorage.setItem("bsa_mentor_auth", "true");
      setAuthError("");
    } else {
      setAuthError("Invalid passcode. Enter your master license key.");
    }
  };

  const fetchLicenses = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (!supabase) {
        setErrorMessage("Supabase client not initialized.");
        return;
      }
      const { data, error } = await supabase
        .from("licenses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase select error:", error);
        setErrorMessage(error.message);
      } else if (data) {
        setLicenses(data as LicenseRecord[]);
      }
    } catch (err: any) {
      console.error("Failed to fetch licenses:", err);
      setErrorMessage(err?.message || "Connection error");
    } finally {
      setLoading(false);
    }
  };

  const generateFormattedKey = (name: string) => {
    const clean = name.replace(/[^A-Za-z]/g, "").toUpperCase();
    const first3 = clean.substring(0, 3).padEnd(3, "THA");
    const mid3 = clean.length > 5 ? clean.substring(3, 6) : "BNG";
    const last3 = clean.length > 3 ? clean.substring(clean.length - 3) : "AKE";
    const randNum = Math.floor(100 + Math.random() * 900);
    return `${first3}-${mid3}-${last3}-${randNum}`;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    setGenerating(true);
    setErrorMessage(null);
    const key = generateFormattedKey(clientName);
    const days = tier === "3months" ? 90 : 3650;
    const expires = new Date();
    expires.setDate(expires.getDate() + days);

    const payload: any = {
      key,
      client_name: clientName.trim(),
      whatsapp: clientPhone.trim() || "+27",
      tier,
      duration_days: days,
      expires_at: expires.toISOString(),
      is_active: true,
      allowed_brokers: ["RCG Markets", "HFM", "FxPro", "JustMarkets"],
    };

    // If client supplied email, try adding it
    if (clientEmail.trim()) {
      payload.email = clientEmail.trim();
    }

    try {
      if (supabase) {
        let { error } = await supabase.from("licenses").insert([payload]);
        
        // If email column does not exist in schema, retry without email
        if (error && error.message?.includes("email")) {
          delete payload.email;
          const retry = await supabase.from("licenses").insert([payload]);
          error = retry.error;
        }

        if (error) {
          console.error("Supabase insert error:", error);
          setErrorMessage(`Database insert error: ${error.message}. Please check Supabase RLS policy.`);
        }
      }

      setLicenses((prev) => [payload as LicenseRecord, ...prev]);
      setGeneratedKey(key);
      setClientName("");
      setClientPhone("");
      setClientEmail("");
    } catch (err: any) {
      console.error("Failed to generate license:", err);
      setErrorMessage(err?.message || "Failed to save to database");
    } finally {
      setGenerating(false);
    }
  };

  const toggleLicenseStatus = async (record: LicenseRecord) => {
    const updatedStatus = !record.is_active;
    try {
      if (supabase) {
        const { error } = await supabase
          .from("licenses")
          .update({ is_active: updatedStatus })
          .eq("key", record.key);

        if (error) {
          setErrorMessage(`Failed to update status: ${error.message}`);
          return;
        }
      }
      setLicenses((prev) =>
        prev.map((l) => (l.key === record.key ? { ...l, is_active: updatedStatus } : l))
      );
    } catch (err: any) {
      console.error("Failed to update status:", err);
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getRemainingDays = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  // Metrics
  const totalClients = licenses.length;
  const activeCount = licenses.filter((l) => l.is_active && getRemainingDays(l.expires_at) > 0).length;
  const estRevenue = licenses.reduce((sum, l) => {
    const t = l.tier?.toLowerCase();
    return sum + (t === "lifetime" || t === "elite" ? 600 : 200);
  }, 0);

  // Filtered clients
  const filteredLicenses = licenses.filter((l) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (l.client_name || "").toLowerCase().includes(q) ||
      (l.key || "").toLowerCase().includes(q) ||
      (l.whatsapp || "").includes(searchQuery);

    const isExpired = getRemainingDays(l.expires_at) <= 0 || !l.is_active;
    if (statusFilter === "active") return matchesSearch && !isExpired;
    if (statusFilter === "expired") return matchesSearch && isExpired;
    return matchesSearch;
  });

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#030811] text-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-sm bg-[#081525] border border-cyan-500/30 rounded-3xl p-6 flex flex-col gap-4 text-center shadow-[0_0_30px_rgba(6,182,212,0.15)]">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-400 mx-auto flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-wide">Mentor Command Hub</h1>
            <p className="text-xs text-slate-400 mt-1">Enter master passcode to unlock client roster</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="Master Passcode (e.g. THA-BNG-AKE-749)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setAuthError("");
              }}
              className="w-full bg-[#040c17] border border-cyan-500/30 rounded-xl px-3 py-2.5 text-xs text-center text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
            />
            {authError && <p className="text-[11px] text-rose-400 font-semibold">{authError}</p>}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-cyan-300 transition shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95"
            >
              Access Dashboard
            </button>
          </form>

          <Link href="/web" className="text-[11px] text-slate-500 hover:text-cyan-400 flex items-center justify-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Return to Website
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030811] text-slate-100 flex justify-center p-3 sm:p-6 pb-24 font-sans">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white tracking-wide">Mentor Command Hub</h1>
                <span className="text-[10px] font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full uppercase">
                  Tman Capitals
                </span>
              </div>
              <p className="text-xs text-slate-400">Live Database Client Roster & License Management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLicenses}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-cyan-300 flex items-center gap-1.5 transition active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
              Sync DB
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem("bsa_mentor_auth");
                setAuthenticated(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 hover:bg-rose-500/20 font-bold transition flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              Lock
            </button>
          </div>
        </div>

        {/* ERROR BANNER IF ANY */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 flex items-start gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Database Notification</p>
              <p className="text-[11px] text-rose-300/90 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-[#081525] border border-cyan-500/20 flex flex-col gap-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Total Clients</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-white">{totalClients}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#081525] border border-emerald-500/20 flex flex-col gap-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Active</span>
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-400">{activeCount}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#081525] border border-cyan-500/20 flex flex-col gap-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Est. Revenue</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-white">R{estRevenue.toLocaleString()}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#081525] border border-amber-500/20 flex flex-col gap-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Limit</span>
              <Shield className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-slate-200">5,000</p>
          </div>
        </div>

        {/* SECTION 1: LICENSE GENERATOR */}
        <div className="bg-[#081525] border border-cyan-500/30 rounded-2xl p-5 flex flex-col gap-4 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            Generate & Issue Client License
          </h2>

          <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Client Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sipho Ndlovu"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-[#040c17] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">WhatsApp Number</label>
              <input
                type="tel"
                placeholder="e.g. 071 234 5678"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full bg-[#040c17] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Email Address (Optional)</label>
              <input
                type="email"
                placeholder="e.g. client@gmail.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-[#040c17] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Subscription Plan</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as "3months" | "lifetime")}
                className="w-full bg-[#040c17] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="3months">R200 (3 Months / 90 Days)</option>
                <option value="lifetime">R600 (Lifetime VIP Access)</option>
              </select>
            </div>

            <div className="sm:col-span-2 pt-1">
              <button
                type="submit"
                disabled={generating}
                className="w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-black uppercase text-xs tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:bg-cyan-300 transition active:scale-95 disabled:opacity-50"
              >
                {generating ? "Saving to Supabase..." : "Generate & Store in Live Database"}
              </button>
            </div>
          </form>

          {/* Newly Generated Key Alert */}
          {generatedKey && (
            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-400/50 flex flex-col gap-3 mt-1">
              <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                New License Key Ready:
              </span>
              <div className="flex items-center justify-between bg-black/60 px-3.5 py-2.5 rounded-lg font-mono text-cyan-300 font-black text-sm border border-cyan-500/30">
                <span>{generatedKey}</span>
                <button
                  onClick={() => copyKey(generatedKey)}
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs ml-2"
                >
                  {copiedKey === generatedKey ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copiedKey === generatedKey ? "Copied" : "Copy"}
                </button>
              </div>

              {clientPhone && (
                <button
                  onClick={() => {
                    const cleanPhone = clientPhone.replace(/[^0-9]/g, "");
                    const message = encodeURIComponent(
                      `Hi! Your BlueScalp Assassin V1.0 access is approved.\n\n` +
                      `🔑 License Key: ${generatedKey}\n` +
                      `📱 Download APK: https://bluescalp-assassin.vercel.app\n\n` +
                      `Paste this key into the app and click Activate Terminal to start.`
                    );
                    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
                  }}
                  className="w-full py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-400 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send Key & APK via WhatsApp
                </button>
              )}
            </div>
          )}
        </div>

        {/* SECTION 2: CLIENT ROSTER / LIVE DATABASE */}
        <div className="bg-[#081525] border border-cyan-500/30 rounded-2xl p-5 flex flex-col gap-4 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Live Client Roster ({filteredLicenses.length})
              </h2>
              <p className="text-[11px] text-slate-400">All registered clients stored in Supabase</p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 bg-[#040c17] p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  statusFilter === "all" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-slate-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  statusFilter === "active" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "text-slate-400 hover:text-white"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter("expired")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  statusFilter === "expired" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "text-slate-400 hover:text-white"
                }`}
              >
                Expired
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by client name, license key, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#040c17] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Client Table / List */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
              Loading records from Supabase...
            </div>
          ) : filteredLicenses.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs bg-[#040c17] rounded-xl border border-slate-800/60 p-4">
              <AlertCircle className="w-5 h-5 mx-auto text-slate-500 mb-1" />
              {searchQuery ? "No clients match your search query." : "No client licenses found in Supabase yet. Generate one above to get started!"}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filteredLicenses.map((client, idx) => {
                const daysLeft = getRemainingDays(client.expires_at);
                const isExpired = daysLeft <= 0 || !client.is_active;

                return (
                  <div
                    key={client.key || idx}
                    className="p-3.5 rounded-xl bg-[#040c17] border border-slate-800/80 hover:border-cyan-500/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{client.client_name}</span>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase border ${
                            client.tier === "lifetime" || client.tier === "ELITE"
                              ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                              : "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                          }`}
                        >
                          {client.tier === "lifetime" || client.tier === "ELITE" ? "Lifetime VIP" : "3 Months"}
                        </span>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase border ${
                            isExpired
                              ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                              : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                          }`}
                        >
                          {isExpired ? "Suspended / Expired" : "Active"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span className="text-cyan-300 font-bold">{client.key}</span>
                        {client.whatsapp && <span className="font-sans text-slate-400">WA: {client.whatsapp}</span>}
                        {client.email && <span className="font-sans text-slate-500">{client.email}</span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{client.tier === "lifetime" || client.tier === "ELITE" ? "Perpetual" : `${daysLeft}d remaining`}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => copyKey(client.key)}
                          title="Copy License Key"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition"
                        >
                          {copiedKey === client.key ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {client.whatsapp && (
                          <button
                            onClick={() => {
                              const cleanPhone = client.whatsapp!.replace(/[^0-9]/g, "");
                              const message = encodeURIComponent(
                                `Hi ${client.client_name}! Here is your BlueScalp Assassin key: ${client.key}\n\n` +
                                `Download the APK: https://bluescalp-assassin.vercel.app\n` +
                                `Enter your key to activate the Machine Gunner terminal.`
                              );
                              window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
                            }}
                            title="Message on WhatsApp"
                            className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => toggleLicenseStatus(client)}
                          title={client.is_active ? "Suspend License" : "Activate License"}
                          className={`p-1.5 rounded-lg border transition ${
                            client.is_active
                              ? "bg-slate-800 border-slate-700 text-emerald-400 hover:text-rose-400"
                              : "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:text-emerald-400"
                          }`}
                        >
                          {client.is_active ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

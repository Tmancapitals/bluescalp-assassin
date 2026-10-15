"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight, CheckCircle2, Lock, Smartphone, User, Mail, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<"3months" | "lifetime">("3months");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const plans = {
    "3months": { label: "Standard Scalper (3 Months)", price: "R200", duration: "90 Days" },
    "lifetime": { label: "VIP Machine Gunner (Lifetime)", price: "R600", duration: "Lifetime Access" },
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (supabase) {
        await supabase.from("registrations").insert([
          {
            full_name: fullName,
            whatsapp: whatsapp,
            email: email,
            tier: plan,
            status: "pending_payment",
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      // Continue even if table is not yet set up
    }

    setSubmitted(true);
    setLoading(false);

    // Open WhatsApp with prefilled message
    const msg = encodeURIComponent(
      `Hi Tman Capitals! I just signed up for BlueScalp Assassin V1.0.\n\n` +
      `Plan: ${plans[plan].label} (${plans[plan].price})\n` +
      `Name: ${fullName}\n` +
      `WhatsApp: ${whatsapp}\n` +
      `Email: ${email}\n\n` +
      `Here is my Capitec proof of payment attached:`
    );
    window.open(`https://wa.me/27649291083?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#030811] text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#081525] border border-cyan-500/30 rounded-3xl p-6 shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col gap-5">
        
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-white tracking-wide">
            BLUESCALP <span className="text-cyan-400">ASSASSIN V1.0</span>
          </h1>
          <p className="text-xs text-slate-400">
            Powered by PROEDGE EA • Tman Capitals
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" /> Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="XXXXXXXX XXXXXXXX"
                className="w-full bg-[#040c17] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" /> WhatsApp Number
              </label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="XXX XXX XXXX"
                className="w-full bg-[#040c17] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="XXXXXX@XXXXX.com"
                className="w-full bg-[#040c17] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Plan Selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <DollarSign className="w-3.5 h-3.5 text-cyan-400" /> Choose Subscription Plan
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPlan("3months")}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition ${
                    plan === "3months"
                      ? "border-cyan-400 bg-cyan-950/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                      : "border-slate-800 bg-[#040c17] opacity-60"
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-400">3 MONTHS</span>
                  <span className="text-base font-black text-cyan-300">R200</span>
                  <span className="text-[9px] text-slate-400">Standard Access</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlan("lifetime")}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition ${
                    plan === "lifetime"
                      ? "border-cyan-400 bg-cyan-950/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                      : "border-slate-800 bg-[#040c17] opacity-60"
                  }`}
                >
                  <span className="text-[10px] font-bold text-amber-400">LIFETIME VIP</span>
                  <span className="text-base font-black text-amber-300">R600</span>
                  <span className="text-[9px] text-slate-400">Machine Gunner</span>
                </button>
              </div>
            </div>

            {/* Capitec Bank Details */}
            <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex flex-col gap-1.5 text-xs">
              <span className="font-extrabold text-cyan-300 tracking-wider text-[11px] uppercase">
                Payment Details (Capitec EFT)
              </span>
              <div className="flex justify-between text-slate-300">
                <span>Account Number:</span>
                <span className="font-mono font-bold text-white">2201301286</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Account Holder:</span>
                <span className="font-bold text-white">T SEAKE</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Reference:</span>
                <span className="text-cyan-400 font-bold">{fullName || "Your Name"}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition"
            >
              {loading ? "Processing..." : "Confirm & Send Proof on WhatsApp"}
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
            <h2 className="text-base font-bold text-white">Registration Received!</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Please attach your payment proof in the WhatsApp chat that just opened. Once verified, Tman will send your license key and APK link.
            </p>
            <Link
              href="/"
              className="mt-2 text-xs text-cyan-400 font-bold underline underline-offset-4"
            >
              Already have your key? Go to Terminal
            </Link>
          </div>
        )}

        <div className="pt-2 border-t border-slate-800 text-center">
          <Link href="/" className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> Have a license key? Open Terminal
          </Link>
        </div>

      </div>
    </div>
  );
}

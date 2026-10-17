"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface License {
  id: string | number;
  key: string;
  client_name: string;
  email?: string | null;
  whatsapp?: string | null;
  tier: string;
  duration_days: number;
  expires_at?: string | null;
  is_active: boolean;
  created_at: string;
}

interface Robot {
  id: string | number;
  name: string;
  version: string;
  description: string;
  image_url: string;
  allowed_pairs: string[];
  strategy_type: string;
  is_active: boolean;
  created_at: string;
}

export default function MentorPage() {
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [masterKeyInput, setMasterKeyInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'roster' | 'generate' | 'robots'>('roster');

  // Data
  const [licenses, setLicenses] = useState<License[]>([]);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');

  // New License Form
  const [newClientName, setNewClientName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [newTier, setNewTier] = useState<'3_months' | 'lifetime'>('3_months');
  const [newKey, setNewKey] = useState('');
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueSuccess, setIssueSuccess] = useState<License | null>(null);
  const [issueError, setIssueError] = useState('');

  // New Robot Form
  const [botName, setBotName] = useState('');
  const [botVersion, setBotVersion] = useState('v1.0');
  const [botDesc, setBotDesc] = useState('');
  const [botPairs, setBotPairs] = useState('XAUUSD, EURUSD, GBPUSD, NAS100');
  const [botStrategy, setBotStrategy] = useState('Machine Gunner Scalp');
  const [botImg, setBotImg] = useState('/images/bluescalp-bot.jpg');
  const [botLoading, setBotLoading] = useState(false);
  const [showAddBotModal, setShowAddBotModal] = useState(false);

  // Check auth status
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setAuthLoading(true);
    try {
      const res = await fetch('/api/mentor/auth');
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        fetchDashboardData();
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!masterKeyInput.trim()) return;

    try {
      const res = await fetch('/api/mentor/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: masterKeyInput.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        fetchDashboardData();
      } else {
        setAuthError(data.error || 'Invalid Mentor Master Key');
      }
    } catch {
      setAuthError('Failed to connect to authentication server');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/mentor/auth', { method: 'DELETE' });
    } finally {
      setIsAuthenticated(false);
      setMasterKeyInput('');
    }
  };

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      const [licRes, botRes] = await Promise.all([
        fetch('/api/mentor/licenses'),
        fetch('/api/mentor/robots')
      ]);

      if (licRes.ok) {
        const licData = await licRes.json();
        setLicenses(licData.licenses || []);
      }
      if (botRes.ok) {
        const botData = await botRes.json();
        setRobots(botData.robots || []);
      }
    } catch (err) {
      console.error('Failed to load mentor data', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Helper to generate key: format e.g. THA-BNG-AKE-749
  const generateFormattedKey = (name: string) => {
    const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase() || 'CLIENT';
    const first3 = (cleanName.slice(0, 3) + 'BSA').slice(0, 3);
    const mid3 = (cleanName.length > 3 ? cleanName.slice(3, 6) : 'SEC').padEnd(3, 'X');
    const last3 = (cleanName.slice(-3) + 'KEY').slice(0, 3);
    const randNum = Math.floor(100 + Math.random() * 900);
    return `${first3}-${mid3}-${last3}-${randNum}`;
  };

  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIssueError('');
    setIssueSuccess(null);
    if (!newClientName.trim()) {
      setIssueError('Client name is required');
      return;
    }

    const keyToUse = newKey.trim() || generateFormattedKey(newClientName);
    setIssueLoading(true);

    try {
      const res = await fetch('/api/mentor/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          client_name: newClientName,
          email: newEmail,
          whatsapp: newWhatsapp,
          tier: newTier,
          key: keyToUse,
          duration_days: newTier === '3_months' ? 90 : 3650
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIssueSuccess(data.license);
        setLicenses([data.license, ...licenses]);
        setNewClientName('');
        setNewEmail('');
        setNewWhatsapp('');
        setNewKey('');
      } else {
        setIssueError(data.error || 'Failed to issue license');
      }
    } catch (err: any) {
      setIssueError(err.message || 'Server error');
    } finally {
      setIssueLoading(false);
    }
  };

  const handleToggleLicenseStatus = async (id: string | number, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/mentor/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_status',
          id,
          is_active: !currentStatus
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLicenses(licenses.map(lic => lic.id === id ? { ...lic, is_active: !currentStatus } : lic));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLicense = async (id: string | number, clientName: string) => {
    if (!confirm(`Are you sure you want to permanently delete the license for ${clientName}?`)) return;
    try {
      const res = await fetch('/api/mentor/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      if (res.ok) {
        setLicenses(licenses.filter(lic => lic.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRobot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botName.trim()) return;
    setBotLoading(true);

    try {
      const res = await fetch('/api/mentor/robots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: botName,
          version: botVersion,
          description: botDesc,
          image_url: botImg,
          allowed_pairs: botPairs.split(',').map(s => s.trim()).filter(Boolean),
          strategy_type: botStrategy
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRobots([data.robot, ...robots]);
        setShowAddBotModal(false);
        setBotName('');
        setBotDesc('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBotLoading(false);
    }
  };

  const handleToggleRobot = async (id: string | number, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/mentor/robots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_status', id, is_active: !currentStatus })
      });
      if (res.ok) {
        setRobots(robots.map(b => b.id === id ? { ...b, is_active: !currentStatus } : b));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLicenses = licenses.filter(lic => {
    const matchesSearch = 
      lic.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lic.key?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lic.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lic.whatsapp?.includes(searchQuery);

    if (statusFilter === 'active') return matchesSearch && lic.is_active;
    if (statusFilter === 'blocked') return matchesSearch && !lic.is_active;
    return matchesSearch;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-cyan-400 flex items-center justify-center font-mono">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="tracking-widest text-sm">AUTHENTICATING SECURE PROTOCOL...</p>
        </div>
      </div>
    );
  }

  // 1. LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 font-mono">
        <div className="w-full max-w-md bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-8 shadow-2xl shadow-cyan-950/40 backdrop-blur-md">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-block px-3 py-1 bg-cyan-950 border border-cyan-500/40 rounded-full text-xs text-cyan-400 uppercase tracking-widest">
              Tman Capitals // Restricted
            </div>
            <h1 className="text-2xl font-black tracking-wider text-cyan-400">BLUESCALP ASSASSIN</h1>
            <p className="text-xs text-slate-400">Mentor & Master Admin Command Center</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-bold">
                Enter Master Key
              </label>
              <input
                type="password"
                value={masterKeyInput}
                onChange={(e) => setMasterKeyInput(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                required
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-red-400 text-xs text-center font-sans">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/40 transition active:scale-[0.98] uppercase tracking-wider text-sm"
            >
              Unlock Dashboard
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <Link href="/web" className="text-xs text-slate-500 hover:text-cyan-400 transition">
              ← Return to Client Web Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. MAIN MENTOR DASHBOARD
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            <h1 className="font-mono font-black text-cyan-400 tracking-wider text-lg">
              BLUESCALP ASSASSIN <span className="text-xs text-slate-400 font-normal">| MENTOR HUB</span>
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/web"
              target="_blank"
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition"
            >
              Client Web Portal ↗
            </Link>
            <Link
              href="/"
              target="_blank"
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition"
            >
              Robot App ↗
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs bg-red-950/60 hover:bg-red-900 border border-red-700/40 text-red-400 px-3 py-1.5 rounded-lg transition font-mono"
            >
              Lock Hub
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Issued</p>
            <p className="text-3xl font-black text-cyan-400 mt-2 font-mono">{licenses.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">Cap: 5,000 licenses</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Active Clients</p>
            <p className="text-3xl font-black text-emerald-400 mt-2 font-mono">
              {licenses.filter(l => l.is_active).length}
            </p>
            <p className="text-[11px] text-emerald-500 mt-1">Authorized access</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">3-Month Subs</p>
            <p className="text-3xl font-black text-blue-400 mt-2 font-mono">
              {licenses.filter(l => l.tier === '3_months').length}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">R200 Plan</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Robot Fleet</p>
            <p className="text-3xl font-black text-purple-400 mt-2 font-mono">{robots.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">Machine Gunner Engines</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 space-x-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('roster')}
            className={`pb-3 border-b-2 transition font-mono ${
              activeTab === 'roster'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Client Roster & Keys ({licenses.length})
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`pb-3 border-b-2 transition font-mono ${
              activeTab === 'generate'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            + Generate License Key
          </button>
          <button
            onClick={() => setActiveTab('robots')}
            className={`pb-3 border-b-2 transition font-mono ${
              activeTab === 'robots'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Robot Fleet ({robots.length})
          </button>
        </div>

        {/* TAB 1: CLIENT ROSTER */}
        {activeTab === 'roster' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by client name, email, WhatsApp, or key..."
                className="w-full sm:w-96 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                    statusFilter === 'all' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  All ({licenses.length})
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                    statusFilter === 'active' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  Active ({licenses.filter(l => l.is_active).length})
                </button>
                <button
                  onClick={() => setStatusFilter('blocked')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                    statusFilter === 'blocked' ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  Blocked ({licenses.filter(l => !l.is_active).length})
                </button>
              </div>
            </div>

            {loadingData ? (
              <div className="text-center py-12 text-slate-500 font-mono text-sm">
                Loading roster from Supabase...
              </div>
            ) : filteredLicenses.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-slate-500 text-sm">
                No licenses found. Use the "+ Generate License Key" tab to create your first client key.
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredLicenses.map((lic) => (
                  <div
                    key={lic.id}
                    className={`bg-slate-900/90 border rounded-xl p-4 transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      lic.is_active ? 'border-slate-800 hover:border-cyan-500/40' : 'border-red-950/60 bg-red-950/10'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-base">{lic.client_name}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                            lic.tier === 'lifetime'
                              ? 'bg-purple-950 text-purple-300 border border-purple-700/50'
                              : 'bg-blue-950 text-blue-300 border border-blue-700/50'
                          }`}
                        >
                          {lic.tier === 'lifetime' ? 'Lifetime (R600)' : '3 Months (R200)'}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            lic.is_active
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/40'
                              : 'bg-red-950 text-red-400 border border-red-700/40'
                          }`}
                        >
                          {lic.is_active ? 'ACTIVE' : 'BLOCKED'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                        <span className="text-cyan-400 font-bold bg-slate-950 px-2.5 py-1 rounded border border-slate-800 select-all">
                          {lic.key}
                        </span>
                        {lic.email && <span>✉ {lic.email}</span>}
                        {lic.whatsapp && <span>📱 {lic.whatsapp}</span>}
                        <span>
                          Expires:{' '}
                          {lic.expires_at ? new Date(lic.expires_at).toLocaleDateString() : 'Permanent'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end md:self-center">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(lic.key);
                          alert(`License key copied: ${lic.key}`);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-mono rounded-lg transition"
                        title="Copy Key"
                      >
                        Copy Key
                      </button>

                      {lic.whatsapp && (
                        <a
                          href={`https://wa.me/${lic.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hello ${lic.client_name}! Here is your BlueScalp Assassin V1.0 access key:

License Key: ${lic.key}
Plan: ${
                              lic.tier === 'lifetime' ? 'Lifetime' : '3 Months'
                            }

Download App / Access: https://bluescalp-assassin.vercel.app`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-emerald-700/70 hover:bg-emerald-600 text-xs text-white font-mono rounded-lg transition"
                        >
                          WhatsApp Key
                        </a>
                      )}

                      <button
                        onClick={() => handleToggleLicenseStatus(lic.id, lic.is_active)}
                        className={`px-3 py-1.5 text-xs font-mono rounded-lg transition ${
                          lic.is_active
                            ? 'bg-amber-950 hover:bg-amber-900 text-amber-400 border border-amber-800/40'
                            : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/40'
                        }`}
                      >
                        {lic.is_active ? 'Block' : 'Activate'}
                      </button>

                      <button
                        onClick={() => handleDeleteLicense(lic.id, lic.client_name)}
                        className="px-2.5 py-1.5 bg-red-950/60 hover:bg-red-900 text-red-400 text-xs font-mono rounded-lg border border-red-800/40 transition"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GENERATE LICENSE */}
        {activeTab === 'generate' && (
          <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white font-mono">Issue Client License</h2>
              <p className="text-xs text-slate-400 mt-1">
                Creates an authorized license in Supabase that unlocks the BlueScalp Assassin app.
              </p>
            </div>

            {issueSuccess && (
              <div className="p-4 bg-emerald-950/70 border border-emerald-500/50 rounded-xl space-y-2">
                <p className="text-emerald-300 font-bold text-sm">✓ License Successfully Issued!</p>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs space-y-1">
                  <p className="text-white">Client: <span className="text-cyan-400 font-bold">{issueSuccess.client_name}</span></p>
                  <p className="text-white">Key: <span className="text-emerald-400 font-bold text-sm select-all">{issueSuccess.key}</span></p>
                  <p className="text-slate-400">Plan: {issueSuccess.tier === 'lifetime' ? 'Lifetime (Permanent)' : '3 Months (90 Days)'}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(issueSuccess.key);
                    alert('Key copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold"
                >
                  Copy Generated Key
                </button>
              </div>
            )}

            {issueError && (
              <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-400 text-xs">
                {issueError}
              </div>
            )}

            <form onSubmit={handleCreateLicense} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Client Full Name *</label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => {
                    setNewClientName(e.target.value);
                    if (!newKey) setNewKey(generateFormattedKey(e.target.value));
                  }}
                  placeholder="e.g. Sipho Ndlovu"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="client@gmail.com"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">WhatsApp Phone (Optional)</label>
                  <input
                    type="text"
                    value={newWhatsapp}
                    onChange={(e) => setNewWhatsapp(e.target.value)}
                    placeholder="0649291083 or +27..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Subscription Plan</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewTier('3_months')}
                    className={`p-3 rounded-xl border text-left font-mono text-xs transition ${
                      newTier === '3_months'
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <p className="font-bold text-sm">3 Months</p>
                    <p className="text-[11px] text-slate-400 mt-1">R200 (90 Days Access)</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTier('lifetime')}
                    className={`p-3 rounded-xl border text-left font-mono text-xs transition ${
                      newTier === 'lifetime'
                        ? 'border-purple-500 bg-purple-950/40 text-purple-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <p className="font-bold text-sm">Lifetime Access</p>
                    <p className="text-[11px] text-slate-400 mt-1">R600 (Permanent)</p>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-mono uppercase text-slate-400">License Key Format</label>
                  <button
                    type="button"
                    onClick={() => setNewKey(generateFormattedKey(newClientName || 'CLIENT'))}
                    className="text-[11px] font-mono text-cyan-400 hover:underline"
                  >
                    ↺ Regenerate Key
                  </button>
                </div>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                  placeholder="THA-BNG-AKE-749"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-cyan-400 font-mono font-bold text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={issueLoading}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold font-mono rounded-xl shadow-lg transition active:scale-[0.98] uppercase tracking-wider text-sm disabled:opacity-50"
              >
                {issueLoading ? 'Registering in Supabase...' : 'Save & Issue License'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: ROBOT FLEET */}
        {activeTab === 'robots' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white font-mono">Managed Robot Fleet</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Manage your active trading bots and allowed symbols.
                </p>
              </div>
              <button
                onClick={() => setShowAddBotModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl text-xs font-mono font-bold transition"
              >
                + Add New Robot
              </button>
            </div>

            {robots.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-sm">
                No custom robots in fleet yet. Click "+ Add New Robot" to register BlueScalp Assassin V1.0 or other editions.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {robots.map((bot) => (
                  <div key={bot.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-base font-bold text-white">{bot.name}</h3>
                          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-cyan-400 font-mono">
                            {bot.version}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{bot.description}</p>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          bot.is_active
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {bot.is_active ? 'ACTIVE' : 'PAUSED'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="text-slate-400">
                        <span className="text-slate-500">Strategy:</span> {bot.strategy_type}
                      </div>
                      <div className="text-slate-400">
                        <span className="text-slate-500">Allowed Pairs:</span>{' '}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(Array.isArray(bot.allowed_pairs) ? bot.allowed_pairs : [bot.allowed_pairs]).map((pair, idx) => (
                            <span key={idx} className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-cyan-300">
                              {pair}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex justify-end space-x-2">
                      <button
                        onClick={() => handleToggleRobot(bot.id, bot.is_active)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                          bot.is_active
                            ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                        }`}
                      >
                        {bot.is_active ? 'Pause Engine' : 'Activate Engine'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ADD BOT MODAL */}
            {showAddBotModal && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 max-w-lg w-full space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-white font-mono text-base">Register New Robot</h3>
                    <button onClick={() => setShowAddBotModal(false)} className="text-slate-400 hover:text-white">✕</button>
                  </div>
                  <form onSubmit={handleCreateRobot} className="space-y-3 font-sans text-sm">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Robot Name *</label>
                      <input
                        type="text"
                        value={botName}
                        onChange={(e) => setBotName(e.target.value)}
                        placeholder="e.g. BLUESCALP ASSASSIN V1.0"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono text-slate-400 mb-1">Version</label>
                        <input
                          type="text"
                          value={botVersion}
                          onChange={(e) => setBotVersion(e.target.value)}
                          placeholder="v1.0"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-slate-400 mb-1">Strategy Type</label>
                        <input
                          type="text"
                          value={botStrategy}
                          onChange={(e) => setBotStrategy(e.target.value)}
                          placeholder="Machine Gunner Scalp"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Allowed Trading Pairs (comma-separated)</label>
                      <input
                        type="text"
                        value={botPairs}
                        onChange={(e) => setBotPairs(e.target.value)}
                        placeholder="XAUUSD, EURUSD, GBPUSD, NAS100"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Short Description</label>
                      <textarea
                        value={botDesc}
                        onChange={(e) => setBotDesc(e.target.value)}
                        placeholder="Refined Machine Gunner strategy targeting high liquidity points."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs h-20"
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddBotModal(false)}
                        className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-mono rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={botLoading}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-mono font-bold rounded-lg"
                      >
                        {botLoading ? 'Saving...' : 'Add to Fleet'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

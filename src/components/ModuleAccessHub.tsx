import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Shield,
  BookOpen, 
  Zap, 
  Layers, 
  ArrowRight, 
  CheckCircle, 
  Lock, 
  Sparkles, 
  Sliders, 
  LogOut, 
  ExternalLink,
  Cpu, 
  Database, 
  Workflow, 
  Building, 
  User, 
  Check, 
  Coins, 
  Activity,
  PackageCheck
} from 'lucide-react';
import { CorporateBrandLogo } from './CorporateBrandLogo';
import { UserAccount } from './AuthModal';

interface ModuleAccessHubProps {
  currentUser: UserAccount | null;
  onLaunchModule: (moduleKey: 'ledger' | 'ingress' | 'procurement' | 'suite') => void;
  onExitToMarketing: () => void;
  onSignOut: () => void;
  onOpenUpgradeModal: () => void;
  isDarkMode: boolean;
  setIsDarkMode?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ModuleAccessHub: React.FC<ModuleAccessHubProps> = ({
  currentUser,
  onLaunchModule,
  onExitToMarketing,
  onSignOut,
  onOpenUpgradeModal,
  isDarkMode,
  setIsDarkMode
}) => {
  // Fallback demo user if not logged in
  const user: UserAccount = currentUser || {
    name: 'Elena Vance, CPA',
    email: 'elena.vance@omniretail.global',
    company: 'OmniRetail Global Enterprise',
    planType: 'full_suite',
    selectedModules: ['ledger', 'ingress', 'procurement'],
    billingCycle: 'annual',
    monthlyPrice: 959,
    signedIn: true,
    avatarInitials: 'EV'
  };

  const isModuleUnlocked = (mod: 'ledger' | 'ingress' | 'procurement') => {
    if (user.planType === 'full_suite') return true;
    return user.selectedModules.includes(mod);
  };

  const unlockedCount = ['ledger', 'ingress', 'procurement'].filter(m => isModuleUnlocked(m as any)).length;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${
      isDarkMode ? 'bg-[#060a14] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* ────────────────────────────────────────────────────────── */}
      {/* TOP HEADER BAR                                             */}
      {/* ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b bg-gradient-to-r from-[#03045e] via-[#023e8a] to-[#0077b6] text-white border-[#0096c7]/30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              onClick={onExitToMarketing}
              className="flex items-center cursor-pointer select-none"
              title="Return to Public Marketing Website"
            >
              <CorporateBrandLogo className="h-10 w-auto max-w-[180px] object-contain drop-shadow-md" />
            </div>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 border border-white/20 text-cyan-200">
              CENTRAL ACCESS HUB
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 font-mono font-extrabold text-xs flex items-center justify-center">
                {user.avatarInitials}
              </div>
              <div className="hidden md:block text-left text-xs font-mono leading-tight">
                <div className="font-bold text-white truncate max-w-[140px]">{user.name}</div>
                <div className="text-[10px] text-cyan-200 truncate max-w-[140px]">{user.company}</div>
              </div>
            </div>

            {/* Public Website Button */}
            <button
              type="button"
              onClick={onExitToMarketing}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-cyan-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Public Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={onSignOut}
              className="p-2 rounded-lg bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-cyan-200 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ────────────────────────────────────────────────────────── */}
      {/* ZERO-COST RUNTIME GUARANTEE STRIP                           */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-center text-xs font-mono text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-bold">Active License: {user.planType === 'full_suite' ? 'The Complete Enterprise Suite' : `Modular Custom Tier (${unlockedCount} Engines Active)`}</span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden sm:inline text-emerald-600 dark:text-emerald-400">Zero Cloud Subscriptions ($0.00 / mo External Fees)</span>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* MAIN LAUNCHPAD DASHBOARD                                   */}
      {/* ────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        
        {/* Welcome Banner */}
        <div className={`p-8 sm:p-10 rounded-3xl border shadow-xl mb-12 relative overflow-hidden ${
          isDarkMode 
            ? 'bg-gradient-to-br from-[#0a1226] via-[#091022] to-[#040814] border-slate-800' 
            : 'bg-gradient-to-br from-white via-blue-50/40 to-slate-100 border-slate-200'
        }`}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#0077b6]/10 text-[#0077b6] dark:text-[#48cae4] border border-[#0077b6]/20 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Central Modular Launchpad & Engine Switcher</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Welcome back, {user.name}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
                Here are your active operational engines. Launch any individual module directly into its dedicated workspace, or access the unified multi-daemon suite.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onLaunchModule('suite')}
                className="px-6 py-3.5 bg-gradient-to-r from-[#0077b6] to-[#023e8a] hover:from-[#023e8a] hover:to-[#0096c7] text-white font-mono font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-[#48cae4]/30"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Launch Unified Suite</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenUpgradeModal}
                className="px-4 py-3.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-cyan-500" />
                <span>Configure / Upgrade Modules</span>
              </button>
            </div>
          </div>

          {/* Account Subscribed Summary Chips */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <div className="text-slate-400 text-[10px] uppercase">Registered Company</div>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5 truncate">{user.company}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase">Subscription Status</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Active & Verified</span>
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase">Unlocked Modules</div>
              <div className="font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">
                {unlockedCount} of 3 Available
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] uppercase">Monthly Rate</div>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                ${user.monthlyPrice || 959}/mo ({user.billingCycle})
              </div>
            </div>
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────── */}
        {/* THE 3 CORE MODULE CARDS (WHAT THEY ARE ABLE TO USE)        */}
        {/* ────────────────────────────────────────────────────────── */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Your Platform Engines & Module Access
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select any unlocked module to open its full interface, or unlock additional tools.
            </p>
          </div>

          <span className="text-xs font-mono text-slate-500">
            {unlockedCount === 3 ? '✓ Full Platform License' : `${unlockedCount}/3 Modules Enabled`}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ──────────────── MODULE 1 CARD ──────────────── */}
          <div className={`rounded-3xl border-2 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
            isModuleUnlocked('ledger')
              ? isDarkMode
                ? 'bg-[#0a1124] border-cyan-500/40 shadow-xl shadow-cyan-950/20 hover:border-cyan-400'
                : 'bg-white border-[#0077b6] shadow-lg hover:border-blue-700'
              : isDarkMode
                ? 'bg-slate-900/40 border-slate-800 opacity-70 hover:opacity-100'
                : 'bg-slate-100/70 border-slate-300 opacity-70 hover:opacity-100'
          }`}>
            <div className="p-7">
              {/* Header Status */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono font-extrabold uppercase px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  MODULE 01
                </span>

                {isModuleUnlocked('ledger') ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>UNLOCKED & ACTIVE</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20 flex items-center gap-1.5">
                    <Lock className="w-3 h-3" />
                    <span>NOT INCLUDED</span>
                  </span>
                )}
              </div>

              {/* Module Title */}
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-[#0077b6] dark:text-cyan-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold">Universal General Ledger & Balancing Engine</h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Double-entry core, continuous Σ Debits ≡ Σ Credits invariant assertion, in-memory relational SQL console, and QuickBooks IIF format generator.
              </p>

              {/* Features List */}
              <div className="space-y-2 text-xs font-mono mb-6">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Real-time Trial Balance parity check</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Multi-tier Chart of Accounts (COA)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>SQL Relational query console</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>QuickBooks IIF & PDF export</span>
                </div>
              </div>

              {/* Operational Stats Preview */}
              <div className={`p-4 rounded-xl border text-[11px] font-mono ${
                isDarkMode ? 'bg-[#060b17] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-slate-400">Ledger Invariant:</span>
                  <span className="font-bold text-emerald-500">BALANCED (0.00 err)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Account Nodes:</span>
                  <span className="font-bold">48 Active Hierarchies</span>
                </div>
              </div>
            </div>

            {/* Launch or Unlock Button */}
            <div className="p-7 pt-0">
              {isModuleUnlocked('ledger') ? (
                <button
                  type="button"
                  onClick={() => onLaunchModule('ledger')}
                  className="w-full py-3 bg-[#0077b6] hover:bg-[#023e8a] active:scale-98 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Launch General Ledger ➔</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenUpgradeModal}
                  className="w-full py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Unlock Module 01 ($399/mo)</span>
                </button>
              )}
            </div>
          </div>

          {/* ──────────────── MODULE 2 CARD ──────────────── */}
          <div className={`rounded-3xl border-2 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
            isModuleUnlocked('ingress')
              ? isDarkMode
                ? 'bg-[#0a1124] border-purple-500/40 shadow-xl shadow-purple-950/20 hover:border-purple-400'
                : 'bg-white border-purple-600 shadow-lg hover:border-purple-800'
              : isDarkMode
                ? 'bg-slate-900/40 border-slate-800 opacity-70 hover:opacity-100'
                : 'bg-slate-100/70 border-slate-300 opacity-70 hover:opacity-100'
          }`}>
            <div className="p-7">
              {/* Header Status */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono font-extrabold uppercase px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  MODULE 02
                </span>

                {isModuleUnlocked('ingress') ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>UNLOCKED & ACTIVE</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20 flex items-center gap-1.5">
                    <Lock className="w-3 h-3" />
                    <span>NOT INCLUDED</span>
                  </span>
                )}
              </div>

              {/* Module Title */}
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold">Commerce Ingress Gateway & Strategic AI Copilot</h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Shopify HMAC webhooks, ANSI X12 EDI 850 parser, batch SKU MAP price crawlers, automated Cease & Desist dispatch, and Sentinel AI brand sentiment bots.
              </p>

              {/* Features List */}
              <div className="space-y-2 text-xs font-mono mb-6">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Shopify & ANSI X12 EDI 850 parsers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Autonomous MAP & C&D Enforcement Suite</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Regional Violation Heatmap & Evidence Scraper</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Sentinel AI Reputation Bot & Trajectory Forecast</span>
                </div>
              </div>

              {/* Operational Stats Preview */}
              <div className={`p-4 rounded-xl border text-[11px] font-mono ${
                isDarkMode ? 'bg-[#060b17] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-slate-400">Ingress Status:</span>
                  <span className="font-bold text-purple-400">3 CHANNELS ONLINE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Throughput:</span>
                  <span className="font-bold">&lt; 4ms Ingest Latency</span>
                </div>
              </div>
            </div>

            {/* Launch or Unlock Button */}
            <div className="p-7 pt-0">
              {isModuleUnlocked('ingress') ? (
                <button
                  type="button"
                  onClick={() => onLaunchModule('ingress')}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-98 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Launch Ingress & AI Gateway ➔</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenUpgradeModal}
                  className="w-full py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Unlock Module 02 ($399/mo)</span>
                </button>
              )}
            </div>
          </div>

          {/* ──────────────── MODULE 3 CARD ──────────────── */}
          <div className={`rounded-3xl border-2 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
            isModuleUnlocked('procurement')
              ? isDarkMode
                ? 'bg-[#0a1124] border-emerald-500/40 shadow-xl shadow-emerald-950/20 hover:border-emerald-400'
                : 'bg-white border-emerald-600 shadow-lg hover:border-emerald-800'
              : isDarkMode
                ? 'bg-slate-900/40 border-slate-800 opacity-70 hover:opacity-100'
                : 'bg-slate-100/70 border-slate-300 opacity-70 hover:opacity-100'
          }`}>
            <div className="p-7">
              {/* Header Status */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono font-extrabold uppercase px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  MODULE 03
                </span>

                {isModuleUnlocked('procurement') ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>UNLOCKED & ACTIVE</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20 flex items-center gap-1.5">
                    <Lock className="w-3 h-3" />
                    <span>NOT INCLUDED</span>
                  </span>
                )}
              </div>

              {/* Module Title */}
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold">3-Way Procurement & Multi-Entity Operations</h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Automated 3-way matching (PO vs Receiving Receipt vs Vendor Invoice), multi-subsidiary GAAP rollups, and 5-daemon keepalive thread architecture.
              </p>

              {/* Features List */}
              <div className="space-y-2 text-xs font-mono mb-6">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>3-Way AP PO Match with penny precision</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Multi-Entity GAAP Consolidation (US/EU/APAC)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>5-Daemon IPC thread keepalive monitors</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Immutable SHA-256 SOX audit trail</span>
                </div>
              </div>

              {/* Operational Stats Preview */}
              <div className={`p-4 rounded-xl border text-[11px] font-mono ${
                isDarkMode ? 'bg-[#060b17] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-slate-400">Daemon Mesh:</span>
                  <span className="font-bold text-emerald-500">5 / 5 THREADS ONLINE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">AP Accuracy:</span>
                  <span className="font-bold">100% Zero Match Drift</span>
                </div>
              </div>
            </div>

            {/* Launch or Unlock Button */}
            <div className="p-7 pt-0">
              {isModuleUnlocked('procurement') ? (
                <button
                  type="button"
                  onClick={() => onLaunchModule('procurement')}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Launch Procurement & Ops ➔</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenUpgradeModal}
                  className="w-full py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Unlock Module 03 ($399/mo)</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* ──────────────── CYBERSHIELD SECURITY OPERATIONS CARD ──────────────── */}
        <div className={`mt-8 rounded-3xl border-2 p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden transition-all ${
          isDarkMode ? 'bg-[#060e22] border-indigo-500/40 text-white' : 'bg-white border-indigo-300 text-slate-900 shadow-md'
        }`}>
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold uppercase bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                SECURITY SUBSCRIPTION ADD-ON
              </span>
              <span className="text-xs font-mono text-emerald-500 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {user.securityTier === 'cybershield_sovereign' 
                  ? 'CyberShield Sovereign Armed ($599/mo)' 
                  : user.securityTier === 'cybershield_pro'
                  ? 'CyberShield Pro Armed ($249/mo)'
                  : 'Standard Shield (Included)'}
              </span>
            </div>

            <h3 className="text-xl font-extrabold tracking-tight">
              Enterprise CyberShield Security Operations Center
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-sans">
              Real-time deep-packet DDoS WAF, constant-time HMAC webhook signature verification, anti-replay nonce caching, and continuous SHA-256 Merkle tree ledger tamper proofs.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono pt-1">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>HMAC Signatures</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Replay Defense</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Merkle SOX Proof</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>AI Fraud Sentinel</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              type="button"
              onClick={() => onLaunchModule('ingress')}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-mono font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Shield className="w-4 h-4 text-cyan-200" />
              <span>Open CyberShield SOC Console ➔</span>
            </button>

            <button
              type="button"
              onClick={onOpenUpgradeModal}
              className="w-full sm:w-auto px-4 py-3 border border-indigo-400/30 hover:bg-indigo-500/10 text-xs font-mono font-bold rounded-xl transition-all text-center cursor-pointer"
            >
              Configure Security Tier
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default ModuleAccessHub;

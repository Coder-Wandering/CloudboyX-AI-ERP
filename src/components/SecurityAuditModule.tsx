import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Lock, 
  Unlock, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Sparkles, 
  Terminal, 
  Clock, 
  Key, 
  Globe, 
  Zap, 
  ArrowRight, 
  FileCheck, 
  Activity, 
  Server, 
  Cpu,
  Mail,
  Sliders,
  Check,
  ChevronRight
} from 'lucide-react';
import { UserAccount } from './AuthModal';

export interface SecurityAuditModuleProps {
  isAdminMode: boolean;
  lockedFields: string[];
  onOpenUpgradeModal: () => void;
  onPostMessage: (text: string, type: 'success' | 'err') => void;
  currentUser?: UserAccount | null;
  isDarkMode?: boolean;
}

interface LoginAttempt {
  id: string;
  timestamp: string;
  identity: string;
  ipAddress: string;
  location: string;
  status: 'allowed' | 'blocked' | 'flagged';
  mfaUsed: boolean;
  detail: string;
}

export default function SecurityAuditModule({
  isAdminMode,
  lockedFields,
  onOpenUpgradeModal,
  onPostMessage,
  currentUser,
  isDarkMode = false
}: SecurityAuditModuleProps) {
  // Subscription state (can be toggled or upgraded)
  const isSecuritySubscribedByDefault = currentUser?.planType === 'full_suite' || currentUser?.securityTier === 'cybershield_pro' || currentUser?.securityTier === 'cybershield_sovereign';
  const [hasSecuritySubscription, setHasSecuritySubscription] = useState<boolean>(Boolean(isSecuritySubscribedByDefault));
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'logins' | 'integrity' | 'subscription'>('overview');
  const [logFilter, setLogFilter] = useState<'all' | 'blocked' | 'flagged'>('all');

  // Interactive toggle configs
  const [twoFactorEnforced, setTwoFactorEnforced] = useState<boolean>(hasSecuritySubscription);
  const [ipGeofenceActive, setIpGeofenceActive] = useState<boolean>(hasSecuritySubscription);
  const [zeroTrustTokens, setZeroTrustTokens] = useState<boolean>(hasSecuritySubscription);
  const [realtimeNotificationArmed, setRealtimeNotificationArmed] = useState<boolean>(true);

  // Recent login attempts dataset
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([
    {
      id: 'log-1',
      timestamp: 'Today at 03:36 PM',
      identity: 'gocloudboy2@gmail.com (Master Admin)',
      ipAddress: '198.51.100.24',
      location: 'US-East (Virginia)',
      status: 'allowed',
      mfaUsed: true,
      detail: 'TLS 1.3 cryptographic session token verified. Zero-trust passkey confirmed.'
    },
    {
      id: 'log-2',
      timestamp: 'Today at 02:48 PM',
      identity: 'wholesale.tokyo@reseller.jp (Reseller Token)',
      ipAddress: '203.0.113.88',
      location: 'Tokyo, Japan (Authorized Hub)',
      status: 'allowed',
      mfaUsed: true,
      detail: 'Wholesale order ingestion API key validated with 500 req/min rate limit quota.'
    },
    {
      id: 'log-3',
      timestamp: 'Today at 01:14 PM',
      identity: 'unknown-root@185.220.101.4 (Automated Probe)',
      ipAddress: '185.220.101.4',
      location: 'Frankfurt, Germany (Tor Exit Node)',
      status: 'blocked',
      mfaUsed: false,
      detail: 'Credential stuffing attack intercepted on /api/ledger/post. Origin IP automatically banned.'
    },
    {
      id: 'log-4',
      timestamp: 'Today at 11:22 AM',
      identity: 'unauthorized-scraper@apex-deals.net',
      ipAddress: '45.143.221.19',
      location: 'US-Central (Chicago)',
      status: 'flagged',
      mfaUsed: false,
      detail: 'Aggressive pricing catalog crawl detected without authorized reseller certificate.'
    },
    {
      id: 'log-5',
      timestamp: 'Yesterday at 09:15 PM',
      identity: 'legal-counsel@cloudboyx.internal',
      ipAddress: '198.51.100.92',
      location: 'US-West (California)',
      status: 'allowed',
      mfaUsed: true,
      detail: 'Cease & Desist legal notice dispatch session authenticated.'
    }
  ]);

  // Compute live security score based on factors
  const calculateScore = () => {
    let score = 50; // baseline

    // Factor 1: Subscription Tier (+20 points)
    if (hasSecuritySubscription) score += 20;

    // Factor 2: MFA enforcement (+10 points)
    if (twoFactorEnforced) score += 10;

    // Factor 3: IP Geofencing (+5 points)
    if (ipGeofenceActive) score += 5;

    // Factor 4: Zero Trust (+5 points)
    if (zeroTrustTokens) score += 5;

    // Factor 5: System Configuration Integrity locks
    const hasCopyrightLock = lockedFields.includes('copyrightFooterText');
    const hasTopologyLock = lockedFields.includes('erpTopologyImg');
    const hasBackendLock = lockedFields.includes('systemBackendSettings');
    
    if (hasBackendLock) score += 4;
    if (hasCopyrightLock) score += 3;
    if (hasTopologyLock) score += 3;

    return Math.min(100, score);
  };

  const securityScore = calculateScore();

  const getScoreRating = (score: number) => {
    if (score >= 90) return { label: 'FORTIFIED (TIER 1)', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', grade: 'A+' };
    if (score >= 75) return { label: 'RESILIENT (TIER 2)', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/30', grade: 'B+' };
    if (score >= 60) return { label: 'MODERATE RISK (TIER 3)', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', grade: 'C' };
    return { label: 'VULNERABLE (ACTION REQUIRED)', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30', grade: 'D' };
  };

  const rating = getScoreRating(securityScore);

  const handleRunSecurityAudit = () => {
    setIsAuditing(true);
    onPostMessage('🔍 Running deep security audit: inspecting login logs, TLS cipher suites, and configuration locks...', 'success');

    setTimeout(() => {
      setIsAuditing(false);
      onPostMessage(`✓ Security Audit Complete! Current System Trust Score: ${securityScore}/100.`, 'success');
    }, 1200);
  };

  const handleSimulateAttack = () => {
    const attackId = `log-${Date.now()}`;
    const newAttack: LoginAttempt = {
      id: attackId,
      timestamp: 'Just now',
      identity: 'malicious-botnet@distributed-shunts.ru',
      ipAddress: '194.26.29.' + Math.floor(Math.random() * 250 + 1),
      location: 'Bucharest, Romania (Anomalous Datacenter)',
      status: 'blocked',
      mfaUsed: false,
      detail: 'Automated brute-force POST flooded against OAuth endpoint. Dropped within 4ms by rate shunts.'
    };

    setLoginAttempts(prev => [newAttack, ...prev]);
    onPostMessage('🚨 Attack simulated! Malicious login attempt intercepted and added to audit trail.', 'success');
  };

  const filteredLogs = loginAttempts.filter(l => {
    if (logFilter === 'all') return true;
    return l.status === logFilter;
  });

  return (
    <div id="security-audit-module" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white text-left space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ──────────────── MODULE HEADER BAR ──────────────── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-500 text-white shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold font-mono uppercase tracking-wider text-white">
                Enterprise Security Audit & Integrity Suite
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold border ${
                hasSecuritySubscription ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {hasSecuritySubscription ? 'PRO SUITE ACTIVE' : 'STANDARD TIER'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Continuous threat assessment derived from recent authentication events, reseller access permissions, and governance immutability locks.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRunSecurityAudit}
            disabled={isAuditing}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'Auditing Nodes...' : 'Recalibrate Audit Score'}</span>
          </button>

          {!hasSecuritySubscription ? (
            <button
              type="button"
              onClick={onOpenUpgradeModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-mono font-extrabold text-xs shadow-lg shadow-teal-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Unlock Security Suite ($149/mo)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setHasSecuritySubscription(false);
                onPostMessage('Demo toggle: Security Suite switched to Standard view.', 'success');
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs font-mono transition-all cursor-pointer"
              title="Test the paywall experience"
            >
              Simulate Non-Subscribed View
            </button>
          )}
        </div>
      </div>

      {/* ──────────────── TAB SWITCHER ──────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Audit Scorecard</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logins')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logins'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Login Audit Trail ({loginAttempts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('integrity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'integrity'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>System Integrity Controls</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('subscription')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'subscription'
                ? 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-sm font-bold'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Security Suite Plans</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 hidden md:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-time Telemetry: <strong className="text-white">Active</strong></span>
        </div>
      </div>

      {/* ──────────────── TAB 1: AUDIT SCORECARD & HEALTH ──────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Main Visual Scorecard Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Giant Gauge / Metric */}
            <div className="lg:col-span-5 rounded-2xl bg-slate-950/90 border border-slate-800 p-6 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-inner">
              <div className="w-full flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 border-b border-slate-850 pb-2">
                <span>Security Integrity Rating</span>
                <span className="text-indigo-400 font-bold">Standard 4.2-FASB</span>
              </div>

              {/* Radial Meter Visual */}
              <div className="relative my-4 flex items-center justify-center">
                <svg className="w-44 h-44 -rotate-90 transform" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#1e293b"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="url(#securityScoreGradient)"
                    strokeWidth="10"
                    strokeDasharray={314}
                    strokeDashoffset={314 - (314 * securityScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="securityScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-5xl font-extrabold font-mono tracking-tighter text-white">
                    {securityScore}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
                    OUT OF 100
                  </span>
                </div>
              </div>

              <div className="w-full space-y-2">
                <div className={`p-2 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider ${rating.bg} ${rating.color}`}>
                  Grade: {rating.grade} • {rating.label}
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  {securityScore >= 90 
                    ? 'All authentication checkpoints, governance locks, and MAP scraping guards are fully fortified.' 
                    : securityScore >= 75
                      ? 'System is resilient against casual attacks. Upgrade to Security Suite Pro to unlock hardware MFA and automated IP shunts.'
                      : 'Potential exposure detected. Configure additional immutability locks and enable multi-factor protection.'}
                </p>
              </div>
            </div>

            {/* Right: Breakdown Breakdown Categories */}
            <div className="lg:col-span-7 rounded-2xl bg-slate-950/60 border border-slate-800 p-6 flex flex-col justify-between space-y-4">
              <div className="border-b border-slate-850 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                    Security Dimension Breakdown
                  </h4>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    Granular scoring across authentication, configurations, and external threats.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-400">4 Dimensions</span>
              </div>

              <div className="space-y-3.5">
                {/* 1. Login & Auth Security */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-indigo-400" />
                      Authentication & Login Resilience
                    </span>
                    <span className={`font-bold ${twoFactorEnforced ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {twoFactorEnforced ? '95%' : '65%'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${twoFactorEnforced ? 'bg-emerald-500 w-[95%]' : 'bg-amber-500 w-[65%]'}`} 
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>MFA: {twoFactorEnforced ? 'Active' : 'Optional (Vulnerable)'}</span>
                    <span>Recent Probes: 1 Intercepted</span>
                  </div>
                </div>

                {/* 2. System Configuration Integrity */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-teal-400" />
                      Governance Immutability Locks
                    </span>
                    <span className="font-bold text-teal-400">
                      {lockedFields.length >= 3 ? '100%' : lockedFields.length === 2 ? '80%' : lockedFields.length === 1 ? '60%' : '40%'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-teal-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, Math.max(30, lockedFields.length * 33))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Active Locks: {lockedFields.length} of 3</span>
                    <span>Backend Lock: {lockedFields.includes('systemBackendSettings') ? 'HARDENED' : 'OPEN'}</span>
                  </div>
                </div>

                {/* 3. Endpoint Ingress & DDoS Protection */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-purple-400" />
                      Endpoint Shield & Rate Shunts
                    </span>
                    <span className={`font-bold ${hasSecuritySubscription ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {hasSecuritySubscription ? '98%' : '70%'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${hasSecuritySubscription ? 'bg-emerald-500 w-[98%]' : 'bg-amber-500 w-[70%]'}`} 
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Ceiling: 1,000 req/min</span>
                    <span>DDoS Protection: {hasSecuritySubscription ? 'Autonomous Pro' : 'Standard Basic'}</span>
                  </div>
                </div>

                {/* 4. Automated Alerting & Cease & Desist Webhook */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-pink-400" />
                      Automated Email Alert Dispatch
                    </span>
                    <span className="font-bold text-emerald-400">100% Active</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full w-full" />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Primary: {currentUser?.email || 'gocloudboy2@gmail.com'}</span>
                    <span>Auto C&D Notice: Armed</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Need immediate 98+ score?</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('subscription')}
                  className="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>Explore Security Suite Subscription</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Upsell Banner if not subscribed */}
          {!hasSecuritySubscription && (
            <div className="rounded-2xl p-5 bg-gradient-to-r from-indigo-950 via-slate-900 to-teal-950 border border-teal-500/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-teal-500/20 text-teal-300 rounded-2xl border border-teal-500/40 shrink-0">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold font-mono text-white flex items-center gap-2">
                    <span>Upgrade to CloudboyX Fortified Security Suite™</span>
                    <span className="px-2 py-0.5 rounded bg-teal-500 text-slate-950 text-[9px] font-mono font-black uppercase">
                      Recommended
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 font-sans mt-0.5 max-w-2xl leading-relaxed">
                    Protect reseller API endpoints from unauthorized scrapers, enforce hardware MFA across all partner nodes, and unlock autonomous certified Cease & Desist legal notice dispatch.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-mono text-slate-400">Subscription Price</div>
                  <div className="text-lg font-mono font-extrabold text-teal-400">$149<span className="text-xs font-normal text-slate-400">/mo</span></div>
                </div>
                <button
                  type="button"
                  onClick={onOpenUpgradeModal}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-mono font-extrabold text-xs shadow-lg shadow-teal-500/25 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Activate Security Suite</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────── TAB 2: RECENT LOGIN ATTEMPTS AUDIT TRAIL ──────────────── */}
      {activeTab === 'logins' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-slate-300">
                Filter Login Logs:
              </span>
              <div className="flex items-center gap-1 font-mono text-xs">
                {(['all', 'blocked', 'flagged'] as const).map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setLogFilter(f)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                      logFilter === f
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSimulateAttack}
              className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-950/80 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>Simulate Brute-Force Attack</span>
            </button>
          </div>

          <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
            {filteredLogs.map(log => {
              const isAllowed = log.status === 'allowed';
              const isBlocked = log.status === 'blocked';
              return (
                <div
                  key={log.id}
                  className={`p-4 rounded-xl border text-xs font-sans transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isBlocked
                      ? 'bg-rose-950/20 border-rose-900/60 text-rose-100'
                      : isAllowed
                        ? 'bg-slate-950/80 border-slate-800 text-slate-200'
                        : 'bg-amber-950/20 border-amber-900/60 text-amber-100'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase ${
                        isBlocked
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : isAllowed
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {log.status.toUpperCase()}
                      </span>

                      <span className="font-bold text-white font-mono text-xs">
                        {log.identity}
                      </span>

                      <span className="text-[10px] text-slate-400 font-mono">
                        IP: <code className="text-slate-300">{log.ipAddress}</code> ({log.location})
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      {log.detail}
                    </p>
                  </div>

                  <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-2 text-[10px] font-mono text-slate-400">
                    <span>{log.timestamp}</span>
                    <span className={`px-1.5 py-0.5 rounded ${log.mfaUsed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {log.mfaUsed ? '✓ 2FA Verified' : 'No MFA'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ──────────────── TAB 3: SYSTEM CONFIGURATION INTEGRITY ──────────────── */}
      {activeTab === 'integrity' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-200">
              Active Security Guardrails & Policy Checks
            </h4>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              These policies directly impact your system audit rating. Toggle switches below or use the master governance switches in the Admin console to harden your deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Control 1: Enforce MFA */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                  <Key className="w-4 h-4 text-indigo-400" />
                  <span>Hardware Two-Factor Auth (2FA)</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Requires FIDO2 / WebAuthn passkeys for admin operations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTwoFactorEnforced(!twoFactorEnforced);
                  onPostMessage(`MFA enforcement set to: ${!twoFactorEnforced}`, 'success');
                }}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                  twoFactorEnforced
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {twoFactorEnforced ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* Control 2: IP Geofencing */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                  <Globe className="w-4 h-4 text-teal-400" />
                  <span>Reseller Region Geofencing</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Restricts wholesale API access strictly to designated partner regions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIpGeofenceActive(!ipGeofenceActive);
                  onPostMessage(`Region Geofencing set to: ${!ipGeofenceActive}`, 'success');
                }}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                  ipGeofenceActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {ipGeofenceActive ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* Control 3: Zero-Trust Token Rotation */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>Zero-Trust Token Rotation (15m)</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Revokes dormant session credentials after 15 minutes of inactivity.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setZeroTrustTokens(!zeroTrustTokens);
                  onPostMessage(`Zero-trust rotation set to: ${!zeroTrustTokens}`, 'success');
                }}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                  zeroTrustTokens
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {zeroTrustTokens ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* Control 4: Automated Breach Email Dispatch */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                  <Mail className="w-4 h-4 text-pink-400" />
                  <span>Real-Time Breach Pings</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Transmits immediate violation alerts directly to <strong>gocloudboy2@gmail.com</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRealtimeNotificationArmed(!realtimeNotificationArmed);
                  onPostMessage(`Breach alert pings set to: ${!realtimeNotificationArmed}`, 'success');
                }}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                  realtimeNotificationArmed
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {realtimeNotificationArmed ? 'ARMED' : 'MUTED'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 4: PREMIUM SECURITY SUITE SUBSCRIPTION TIERS ──────────────── */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 font-mono text-[11px] font-bold uppercase tracking-wider">
              Commercial Subscription Suite
            </span>
            <h4 className="text-xl font-extrabold font-mono text-white">
              CloudboyX Fortified Security Suite™ Plans
            </h4>
            <p className="text-xs text-slate-400 font-sans">
              Monetize bank-grade protection for your wholesale network, automated legal cease & desist dispatches, and 24/7 autonomous bot defenders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plan 1: Standard Community / Baseline (Free / Included) */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <div>
                    <h5 className="font-mono font-bold text-sm text-white">Community Standard</h5>
                    <p className="text-[11px] text-slate-400 font-sans">Baseline monitoring & self-hosted ledger</p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    INCLUDED
                  </span>
                </div>

                <div className="text-2xl font-mono font-extrabold text-white">
                  $0 <span className="text-xs font-normal text-slate-400">/ forever</span>
                </div>

                <ul className="space-y-2 text-xs text-slate-300 font-sans">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Double-entry GAAP transactional ledger</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Basic rate ceiling limiting (500 req/min)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Manual audit trail view & log inspection</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-500">
                    <ShieldX className="w-3.5 h-3.5 text-slate-600" />
                    <span className="line-through">Automated MAP Violation Scraper</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-500">
                    <ShieldX className="w-3.5 h-3.5 text-slate-600" />
                    <span className="line-through">1-Click Cease & Desist Certified Courier</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-850">
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-mono font-bold opacity-60 cursor-not-allowed"
                >
                  Current Baseline Active
                </button>
              </div>
            </div>

            {/* Plan 2: Fortified Enterprise Security Suite ($149/mo) */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-indigo-950/40 to-teal-950/40 border-2 border-teal-500 shadow-2xl flex flex-col justify-between space-y-5 relative overflow-hidden">
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-teal-500 text-slate-950 font-mono text-[9px] font-black uppercase tracking-wider">
                COMMERCIAL VALUE
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-teal-500/30 pb-3">
                  <div>
                    <h5 className="font-mono font-bold text-sm text-teal-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-teal-400" />
                      <span>Security Sentinel Pro Suite</span>
                    </h5>
                    <p className="text-[11px] text-slate-300 font-sans">Full autonomous protection & legal enforcement</p>
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-mono font-extrabold text-white">$149</span>
                  <span className="text-xs font-mono text-slate-400">/ month ($1,429/yr billed annually)</span>
                </div>

                <ul className="space-y-2 text-xs text-slate-200 font-sans">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-teal-400" />
                    <span><strong>Autonomous MAP Price Bot:</strong> Live Amazon, TikTok, Walmart crawler</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-teal-400" />
                    <span><strong>1-Click Cease & Desist Transmission:</strong> Certified legal notices</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-teal-400" />
                    <span><strong>Real-Time Email Notifications:</strong> Alerting directly to {currentUser?.email || 'gocloudboy2@gmail.com'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-teal-400" />
                    <span><strong>Hardware 2FA & Zero-Trust Shunts:</strong> Banish rogue IP attacks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-teal-400" />
                    <span><strong>98+ Bank-Grade Security Score</strong> guaranteed under SLA</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-teal-500/30 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setHasSecuritySubscription(true);
                    onOpenUpgradeModal();
                    onPostMessage('🚀 Initiated CloudboyX Security Suite Pro subscription activation!', 'success');
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-mono font-extrabold text-xs shadow-lg shadow-teal-500/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Subscribe to Security Suite ($149/mo)</span>
                </button>

                <p className="text-[10px] text-slate-400 text-center font-mono">
                  Instant activation • Zero cloud fees • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  ShieldAlert, 
  Zap, 
  Lock, 
  Unlock, 
  Skull, 
  Terminal, 
  Globe, 
  RefreshCw,
  Ban
} from 'lucide-react';

interface Reseller {
  id: string;
  name: string;
  domain: string;
  status: 'Authorized' | 'Pending' | 'Revoked';
}

interface EndpointGuardSectionProps {
  resellers: Reseller[];
  onPostMessage: (text: string, type: 'success' | 'err' | 'info') => void;
  isAdminMode?: boolean;
  isBackendLocked?: boolean;
}

interface AccessLog {
  id: string;
  timestamp: string;
  ip: string;
  domain: string;
  endpoint: string;
  method: string;
  rateUsed: number;
  status: 'ALLOWED' | 'BLOCKED' | 'RATE_LIMITED';
}

export default function EndpointGuardSection({ 
  resellers, 
  onPostMessage,
  isAdminMode = true,
  isBackendLocked = false
}: EndpointGuardSectionProps) {
  const [shieldActive, setShieldActive] = useState(true);
  const [globalRateLimit, setGlobalRateLimit] = useState<number>(1000);
  const [activeBlacklist, setActiveBlacklist] = useState<string[]>([
    '45.221.32.14', '185.190.140.23'
  ]);
  const [isSimulatingAttack, setIsSimulatingAttack] = useState(false);
  
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([
    {
      id: "LOG-502",
      timestamp: new Date().toLocaleTimeString(),
      ip: "18.241.15.90",
      domain: "hub.cboy.newyork.us",
      endpoint: "/api/resellers/invoice/post",
      method: "POST",
      rateUsed: 420,
      status: "ALLOWED"
    },
    {
      id: "LOG-501",
      timestamp: new Date(Date.now() - 5000).toLocaleTimeString(),
      ip: "45.221.32.14",
      domain: "unauthorized-scraper.ru",
      endpoint: "/api/resellers/inventory",
      method: "GET",
      rateUsed: 9999,
      status: "BLOCKED"
    },
    {
      id: "LOG-500",
      timestamp: new Date(Date.now() - 11000).toLocaleTimeString(),
      ip: "82.165.45.12",
      domain: "wholesale.cboy.tokyo.com",
      endpoint: "/api/resellers/stock-sync",
      method: "POST",
      rateUsed: 120,
      status: "ALLOWED"
    }
  ]);

  // Attack simulator
  useEffect(() => {
    if (!isSimulatingAttack) return;

    const interval = setInterval(() => {
      const isMalicious = Math.random() > 0.4;
      const randomIp = isMalicious 
        ? `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        : '45.221.32.14'; // already blacklisted
      
      const randomDomain = isMalicious 
        ? "high-frequency-hacker-node.io" 
        : "unauthorized-scraper.ru";

      const rStatus = shieldActive 
        ? (activeBlacklist.includes(randomIp) || isMalicious ? 'BLOCKED' : 'ALLOWED')
        : 'ALLOWED';

      const newLog: AccessLog = {
        id: `LOG-${Math.floor(Math.random() * 900) + 100}`,
        timestamp: new Date().toLocaleTimeString(),
        ip: randomIp,
        domain: randomDomain,
        endpoint: "/api/resellers/invoice/post",
        method: "POST",
        rateUsed: isMalicious ? 2500 : 12,
        status: rStatus
      };

      setAccessLogs(prev => [newLog, ...prev.slice(0, 10)]);

    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulatingAttack, shieldActive, activeBlacklist]);

  const toggleShield = () => {
    setShieldActive(!shieldActive);
    onPostMessage(
      `Enterprise Firewall Shunting protocol ${!shieldActive ? 'ACTIVATED' : 'BYPASSED'}!`, 
      !shieldActive ? 'success' : 'info'
    );
  };

  const clearBlacklist = () => {
    setActiveBlacklist([]);
    onPostMessage('Cleared direct IP firewall blacklist.', 'info');
  };

  const blockNewIp = () => {
    const randomIp = `103.44.190.${Math.floor(Math.random() * 255)}`;
    setActiveBlacklist(prev => [randomIp, ...prev]);
    onPostMessage(`Instantly blacklisted malicious scraper block ${randomIp}/32.`, 'success');
  };

  const handleRateLimitToggle = () => {
    const nextLimit = globalRateLimit === 1000 ? 500 : globalRateLimit === 500 ? 2000 : 1000;
    setGlobalRateLimit(nextLimit);
    onPostMessage(`Adjusted global API limit rate parameters to: ${nextLimit} requests per window.`, 'success');
  };

  return (
    <motion.div
      key="endpoint_guard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 text-left font-sans"
    >
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">API Ingress Shield</span>
            <span className={`w-2 h-2 rounded-full ${shieldActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              {shieldActive ? 'ACTIVE' : 'BYPASS'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-3">Protects CRM/ERP ingress points from external flooders.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Interceded Attacks</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold">142 TOTAL</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-indigo-600">0</span>
            <span className="text-[10px] text-slate-500 font-mono">Current Spammer</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-3">Double-spend and counterfeit endpoint intercept attempts.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Active Banned Hosts</span>
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-rose-600">{activeBlacklist.length} IPs</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-3">Malicious subnet blocks rejected on initial TCP handshake.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Rate Ceiling Limit</span>
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-950">{globalRateLimit}/min</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-3">Dynamic request budget per authorized reseller domain.</p>
        </div>
      </div>

      {/* Main Board Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Shield Controllers and Blacklist Rules */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Dynamic Gateway Protection Shunts</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Automated deep-packet DDoS API filters</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans mb-6">
              You do not need static six-month analytics to defend your infrastructure. Action is required instantly. Block bots and unauthorized regional wholesale scrapers before they degrade processing bandwidth.
            </p>

            {/* Simulated Rate Controller list */}
            <div className="space-y-4 mb-6">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Live Authorization Registry Security Checklist:</span>
              
              {resellers.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-500 text-xs italic">
                  Authorize your first reseller under the Ingress tab to activate Shield telemetry.
                </div>
              ) : (
                resellers.map((reseller) => (
                  <div key={reseller.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-slate-450" />
                      <div>
                        <p className="font-semibold text-slate-800">{reseller.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{reseller.domain}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold">
                        RATE: {globalRateLimit} req/min
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                        🛡️ Protected
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Blacklist block view */}
            <div className={`border rounded-xl p-4 ${isBackendLocked ? 'border-slate-200 bg-slate-50/20' : 'border-rose-100 bg-rose-50/10'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                  {isBackendLocked && <Lock className="w-3 h-3 text-red-500" />}
                  Firewall Banned Subnets:
                </span>
                <button 
                  onClick={() => {
                    if (isBackendLocked) {
                      onPostMessage('🔒 Action Blocked: Reset blacklist is locked by corporate System Admin.', 'err');
                      return;
                    }
                    clearBlacklist();
                  }}
                  disabled={activeBlacklist.length === 0 || isBackendLocked}
                  className="text-[9px] underline font-mono text-slate-500 hover:text-slate-800 cursor-pointer disabled:opacity-40"
                >
                  Reset Blacklist
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {activeBlacklist.length === 0 ? (
                  <span className="text-[10px] italic text-slate-400">Zero active manual IP bans. Secure state.</span>
                ) : (
                  activeBlacklist.map((ip) => (
                    <span key={ip} className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 font-mono text-[10px] rounded-md font-bold flex items-center gap-1">
                      <Ban className="w-3 h-3 text-rose-500" />
                      {ip}/32
                    </span>
                  ))
                )}
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-150 mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => {
                if (isBackendLocked) {
                  onPostMessage('🔒 Action Blocked: Firewall state switching is locked by corporate System Admin.', 'err');
                  return;
                }
                toggleShield();
              }}
              disabled={isBackendLocked}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 border text-white ${
                isBackendLocked
                  ? 'bg-slate-300 border-slate-250 text-slate-400 cursor-not-allowed opacity-75'
                  : shieldActive 
                    ? 'bg-emerald-650 hover:bg-emerald-700' 
                    : 'bg-rose-650 hover:bg-rose-700'
              }`}
            >
              {isBackendLocked ? (
                <>
                  <Lock className="w-4 h-4 text-slate-500" />
                  Shield Registry Locked
                </>
              ) : shieldActive ? (
                <>
                  <Lock className="w-4 h-4" />
                  Shield Active (Deactivate)
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 animate-bounce" />
                  Shield Bypassed (Engage)
                </>
              )}
            </button>
            <button
              onClick={() => {
                if (isBackendLocked) {
                  onPostMessage('🔒 Action Blocked: Manual IP blacklisting is restricted under locking policy.', 'err');
                  return;
                }
                blockNewIp();
              }}
              disabled={isBackendLocked}
              className={`px-4 py-2 border rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5 text-white ${
                isBackendLocked 
                  ? 'bg-slate-300 border-slate-250 text-slate-400 cursor-not-allowed opacity-75' 
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800'
              }`}
            >
              {isBackendLocked ? <Lock className="w-4 h-4 text-slate-500" /> : <Skull className="w-4 h-4 text-slate-400 animate-pulse" />}
              {isBackendLocked ? 'IP Blacklist Locked' : 'Blacklist Rogue Node IP'}
            </button>
            <button
              onClick={() => {
                if (isBackendLocked) {
                  onPostMessage('🔒 Action Blocked: Global rate configurations are secured.', 'err');
                  return;
                }
                handleRateLimitToggle();
              }}
              disabled={isBackendLocked}
              className={`px-4 py-2 border rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isBackendLocked
                  ? 'bg-slate-100 border-slate-200 text-slate-350 cursor-not-allowed opacity-70'
                  : 'bg-slate-50 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
            >
              {isBackendLocked ? <Lock className="w-3.5 h-3.5 text-slate-400" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Toggle Rate
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Threat Terminal Console */}
        <div className="lg:col-span-6 bg-zinc-950 border border-slate-900 rounded-2xl p-5 text-white flex flex-col justify-between shadow-2xl relative">
          <div className="absolute right-0 bottom-0 pointer-events-none opacity-5 font-mono text-5xl">SHIELD-LOG</div>
          
          <div>
            <div className="flex items-center justify-between border-b border-slate-950 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">Endpoint Access Intercept Sentinel</h4>
              </div>

              <button
                onClick={() => {
                  if (isBackendLocked) {
                    onPostMessage('🔒 attack Simulation Locked: Interactive testing streams are disabled by admin policy.', 'err');
                    return;
                  }
                  setIsSimulatingAttack(!isSimulatingAttack);
                }}
                disabled={isBackendLocked}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all border cursor-pointer ${
                  isBackendLocked
                    ? 'bg-slate-900 border-slate-800 text-slate-650 cursor-not-allowed opacity-50'
                    : isSimulatingAttack 
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse' 
                      : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 font-semibold'
                }`}
              >
                {isBackendLocked ? '🔒 THREATS LOCKED' : isSimulatingAttack ? '● Stop attack probe' : '⚡ Simulate DDoS flood'}
              </button>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans mb-4">
              Inspect real-time authentication traffic logs. If unauthorized requests scale past approved thresholds, the automated shield drops them instant.
            </p>

            {/* Scrollable logs */}
            <div className="space-y-2 h-[260px] overflow-y-auto pr-1 scrollbar-thin font-mono text-[10px] select-none text-zinc-300">
              {accessLogs.map((log) => {
                const isBlocked = log.status === 'BLOCKED' || log.status === 'RATE_LIMITED';
                return (
                  <div key={log.id} className={`border-l-2 p-2 rounded-r-lg space-y-1 ${
                    isBlocked 
                      ? 'border-rose-500 bg-rose-500/5' 
                      : 'border-emerald-500 bg-slate-900/40'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={isBlocked ? 'text-rose-400 font-extrabold' : 'text-emerald-400 font-bold'}>
                        {log.status}
                      </span>
                      <span className="text-[8px] text-slate-500">{log.timestamp}</span>
                    </div>
                    <div className="text-[9px] leading-normal font-medium">
                      {log.method} {log.endpoint} IP: <span className="text-white">{log.ip}</span> {log.domain ? `(${log.domain})` : ''}
                    </div>
                    <div className="text-[8px] text-slate-500 font-bold flex justify-between">
                      <span>CLIENT REQUEST RATE: {log.rateUsed}/min</span>
                      <span>SEC: SHIELD_ENFORCED</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-900 pt-3 mt-4 text-[9px] font-mono text-slate-500 flex justify-between">
            <span>AUTOMATED SHIELD FIREWALL: UP</span>
            <span>BLOCKED TOTAL: 142</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

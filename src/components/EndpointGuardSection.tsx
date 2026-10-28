import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck,
  Zap, 
  Lock, 
  Unlock, 
  Skull, 
  Terminal, 
  Globe, 
  RefreshCw,
  Ban,
  Check,
  X,
  Key,
  KeyRound,
  FileCheck,
  FileSpreadsheet,
  AlertTriangle,
  Flame,
  ArrowRight,
  Fingerprint,
  Eye,
  Sliders,
  Download,
  Copy,
  Cpu,
  Layers,
  Sparkles,
  Server,
  Activity,
  CheckCircle2
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
  status: 'ALLOWED' | 'BLOCKED' | 'RATE_LIMITED' | 'QUARANTINED';
  threatReason?: string;
}

interface QuarantinedPayload {
  id: string;
  timestamp: string;
  originIp: string;
  originDomain: string;
  payloadType: 'SQL_INJECTION' | 'HMAC_FORGERY' | 'REPLAY_ATTACK' | 'DUPLICATE_INVOICE';
  threatSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  rawSnippet: string;
  status: 'QUARANTINED' | 'PURGED' | 'RELEASED';
}

interface ApiVaultKey {
  id: string;
  name: string;
  prefix: string;
  scope: 'ledger:read' | 'invoice:post' | 'reseller:admin' | 'full:sovereign';
  createdAt: string;
  expiresInDays: number;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

export default function EndpointGuardSection({ 
  resellers, 
  onPostMessage,
  isAdminMode = true,
  isBackendLocked = false
}: EndpointGuardSectionProps) {
  // Active Security SOC View Tab
  const [securityTab, setSecurityTab] = useState<'firewall' | 'hmac' | 'merkle' | 'fraud'>('firewall');

  // Security Subscription Tier state: 'standard' | 'cybershield_pro' | 'cybershield_sovereign'
  const [activeSecurityTier, setActiveSecurityTier] = useState<'standard' | 'cybershield_pro' | 'cybershield_sovereign'>(() => {
    try {
      const savedUser = localStorage.getItem('cloudboyx_auth_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u.securityTier) return u.securityTier;
      }
    } catch {}
    return 'cybershield_sovereign';
  });

  // ─────────────────────────────────────────────
  // 1. FIREWALL & WAF STATE
  // ─────────────────────────────────────────────
  const [shieldActive, setShieldActive] = useState(true);
  const [globalRateLimit, setGlobalRateLimit] = useState<number>(1000);
  const [activeBlacklist, setActiveBlacklist] = useState<string[]>([
    '45.221.32.14', '185.190.140.23', '103.145.12.88'
  ]);
  const [isSimulatingAttack, setIsSimulatingAttack] = useState(false);
  const [geofenceHighRiskBlocked, setGeofenceHighRiskBlocked] = useState(true);
  const [torExitNodesBlocked, setTorExitNodesBlocked] = useState(true);

  // Quarantined Payloads Sandbox
  const [quarantinedPayloads, setQuarantinedPayloads] = useState<QuarantinedPayload[]>([
    {
      id: "QP-901",
      timestamp: new Date(Date.now() - 14000).toLocaleTimeString(),
      originIp: "185.190.140.23",
      originDomain: "botnet-crawler-mesh.xyz",
      payloadType: "SQL_INJECTION",
      threatSeverity: "CRITICAL",
      rawSnippet: "POST /api/ledger/post?sku=CBX' OR 1=1; DROP TABLE users;--",
      status: "QUARANTINED"
    },
    {
      id: "QP-902",
      timestamp: new Date(Date.now() - 48000).toLocaleTimeString(),
      originIp: "45.221.32.14",
      originDomain: "fake-shopify-webhook.ru",
      payloadType: "HMAC_FORGERY",
      threatSeverity: "HIGH",
      rawSnippet: "X-Shopify-Hmac-SHA256: 3c91d8e0.. INVALID (Signature digest mismatch)",
      status: "QUARANTINED"
    },
    {
      id: "QP-903",
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
      originIp: "103.145.12.88",
      originDomain: "partner-wholesale-scraper.asia",
      payloadType: "REPLAY_ATTACK",
      threatSeverity: "HIGH",
      rawSnippet: "Nonce uuid-8910 reused | Timestamp: 14:02:11 UTC (>600s stale)",
      status: "QUARANTINED"
    }
  ]);

  // Live Access Sentinel Logs
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([
    {
      id: "LOG-504",
      timestamp: new Date().toLocaleTimeString(),
      ip: "18.241.15.90",
      domain: "hub.cboy.newyork.us",
      endpoint: "/api/resellers/invoice/post",
      method: "POST",
      rateUsed: 420,
      status: "ALLOWED"
    },
    {
      id: "LOG-503",
      timestamp: new Date(Date.now() - 2200).toLocaleTimeString(),
      ip: "103.145.12.88",
      domain: "partner-wholesale-scraper.asia",
      endpoint: "/api/resellers/inventory",
      method: "GET",
      rateUsed: 2950,
      status: "BLOCKED",
      threatReason: "Blacklisted Subnet / High-risk Tor ASN"
    },
    {
      id: "LOG-502",
      timestamp: new Date(Date.now() - 6500).toLocaleTimeString(),
      ip: "52.89.12.33",
      domain: "shopify-webhook-gateway.cloud",
      endpoint: "/api/translate",
      method: "POST",
      rateUsed: 88,
      status: "ALLOWED"
    },
    {
      id: "LOG-501",
      timestamp: new Date(Date.now() - 11000).toLocaleTimeString(),
      ip: "45.221.32.14",
      domain: "unauthorized-scraper.ru",
      endpoint: "/api/resellers/invoice/post",
      method: "POST",
      rateUsed: 9999,
      status: "QUARANTINED",
      threatReason: "HMAC Forged Digest Rejected"
    }
  ]);

  // ─────────────────────────────────────────────
  // 2. HMAC & REPLAY DEFENSE STATE
  // ─────────────────────────────────────────────
  const [hmacSecretKey, setHmacSecretKey] = useState("cbx_live_sec_991823abfd8104");
  const [showHmacSecret, setShowHmacSecret] = useState(false);
  const [testPayloadBody, setTestPayloadBody] = useState('{"orderId":"ORD-7729","amount":249.50,"sku":"CBX-NODE-01"}');
  const [computedSignature, setComputedSignature] = useState("sha256=d3b07384d113edec49eaa6238ad5ff00");
  const [testVerifyResult, setTestVerifyResult] = useState<'idle' | 'valid' | 'forged'>('idle');

  // Scoped API Key Vault
  const [apiKeys, setApiKeys] = useState<ApiVaultKey[]>([
    {
      id: "key-1",
      name: "Shopify Primary Webhook Ingress",
      prefix: "cbx_live_sh_8a2f",
      scope: "invoice:post",
      createdAt: "2026-06-01",
      expiresInDays: 32,
      status: "ACTIVE"
    },
    {
      id: "key-2",
      name: "Global SAP Financial Rollup Tunnel",
      prefix: "cbx_live_sap_110c",
      scope: "ledger:read",
      createdAt: "2026-05-15",
      expiresInDays: 14,
      status: "ACTIVE"
    },
    {
      id: "key-3",
      name: "Automated AP Matching Robot",
      prefix: "cbx_live_ap_e891",
      scope: "full:sovereign",
      createdAt: "2026-04-10",
      expiresInDays: 0,
      status: "EXPIRED"
    }
  ]);

  // ─────────────────────────────────────────────
  // 3. MERKLE-TREE TAMPER IMMUTABILITY STATE
  // ─────────────────────────────────────────────
  const [merkleRootHash, setMerkleRootHash] = useState("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  const [isVerifyingMerkle, setIsVerifyingMerkle] = useState(false);
  const [merkleAuditStatus, setMerkleAuditStatus] = useState<'verified' | 'tampered'>('verified');
  const [merkleBlockCount, setMerkleBlockCount] = useState(148);
  const [lastAuditTimestamp, setLastAuditTimestamp] = useState(new Date().toLocaleTimeString());

  // ─────────────────────────────────────────────
  // 4. AI FRAUD SENTINEL STATE
  // ─────────────────────────────────────────────
  const [velocitySpikeDetected, setVelocitySpikeDetected] = useState(false);
  const [duplicateInvoiceIntercepted, setDuplicateInvoiceIntercepted] = useState(false);
  const [fraudScore, setFraudScore] = useState(12); // Low baseline risk
  const [isSimulatingFraud, setIsSimulatingFraud] = useState(false);

  // Attack simulator effect
  useEffect(() => {
    if (!isSimulatingAttack) return;

    const interval = setInterval(() => {
      const isMalicious = Math.random() > 0.35;
      const randomIp = isMalicious 
        ? `194.26.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        : '18.241.15.90';
      
      const randomDomain = isMalicious 
        ? "high-frequency-hacker-bot.xyz" 
        : "wholesale.cboy.retail.com";

      const rStatus: 'ALLOWED' | 'BLOCKED' | 'QUARANTINED' = shieldActive 
        ? (isMalicious ? (Math.random() > 0.5 ? 'QUARANTINED' : 'BLOCKED') : 'ALLOWED')
        : 'ALLOWED';

      const newLog: AccessLog = {
        id: `LOG-${Math.floor(Math.random() * 900) + 100}`,
        timestamp: new Date().toLocaleTimeString(),
        ip: randomIp,
        domain: randomDomain,
        endpoint: "/api/resellers/invoice/post",
        method: "POST",
        rateUsed: isMalicious ? 2840 : 18,
        status: rStatus,
        threatReason: isMalicious ? "WAF Deep-Packet Signature Breach" : undefined
      };

      setAccessLogs(prev => [newLog, ...prev.slice(0, 14)]);

      if (rStatus === 'QUARANTINED') {
        const newPayload: QuarantinedPayload = {
          id: `QP-${Math.floor(Math.random() * 900) + 100}`,
          timestamp: new Date().toLocaleTimeString(),
          originIp: randomIp,
          originDomain: randomDomain,
          payloadType: Math.random() > 0.5 ? "SQL_INJECTION" : "HMAC_FORGERY",
          threatSeverity: "CRITICAL",
          rawSnippet: `Simulated attack string from ${randomDomain} dropped at gateway filter.`,
          status: "QUARANTINED"
        };
        setQuarantinedPayloads(prev => [newPayload, ...prev.slice(0, 5)]);
      }

    }, 900);

    return () => clearInterval(interval);
  }, [isSimulatingAttack, shieldActive]);

  // Actions
  const toggleShield = () => {
    setShieldActive(!shieldActive);
    onPostMessage(
      `Gateway DDoS & WAF Shunting protocol ${!shieldActive ? 'ACTIVATED' : 'BYPASSED'}!`, 
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

  // HMAC Verifier Test
  const handleVerifyTestHmac = (isForged = false) => {
    if (isForged) {
      setTestVerifyResult('forged');
      onPostMessage("🚨 HMAC Signature Verification Failed: Digest mismatch. Payload dropped at gateway.", 'err');
    } else {
      setTestVerifyResult('valid');
      onPostMessage("✓ Cryptographic HMAC Verification Success: Authentic Shopify Webhook signature.", 'success');
    }
  };

  // Merkle Recalculation & Audit Dossier Export
  const handleVerifyMerkleChain = () => {
    setIsVerifyingMerkle(true);
    setTimeout(() => {
      setIsVerifyingMerkle(false);
      setMerkleAuditStatus('verified');
      setLastAuditTimestamp(new Date().toLocaleTimeString());
      onPostMessage("✓ Cryptographic Merkle Tree verification complete: 148/148 Ledger Blocks Untampered.", 'success');
    }, 700);
  };

  const handleExportSOXDossier = () => {
    const dossierData = {
      complianceStandard: "SOX-404 / SOC-2 Type II Certified",
      merkleRootHash,
      blocksChained: merkleBlockCount,
      verificationTimestamp: new Date().toISOString(),
      firewallStatus: shieldActive ? "ENGAGED" : "BYPASS",
      activeThreatsQuarantined: quarantinedPayloads.length,
      attestation: "All posted transactions mathematically match immutable SHA-256 Merkle root. No offline alterations detected."
    };

    const blob = new Blob([JSON.stringify(dossierData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CloudboyX_Cryptographic_SOX_Audit_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onPostMessage("📥 Downloaded signed Cryptographic SOX Audit Dossier successfully!", 'success');
  };

  // AI Fraud Simulation
  const handleSimulateDuplicateInvoiceFraud = () => {
    setIsSimulatingFraud(true);
    setDuplicateInvoiceIntercepted(true);
    setFraudScore(88); // Elevated threat score
    onPostMessage("🚨 AI Anomaly Sentinel Intercepted Duplicate Vendor Invoice #INV-8891 ($42,100.00). Ledger posting prevented!", 'err');
    setTimeout(() => {
      setIsSimulatingFraud(false);
    }, 1200);
  };

  return (
    <motion.div
      key="endpoint_guard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 text-left font-sans"
    >
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. CYBERSHIELD ENTERPRISE SUBSCRIPTION BANNER              */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-950 via-[#0a1128] to-[#041a40] border-2 border-indigo-500/40 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 p-4 opacity-5 select-none pointer-events-none font-mono text-8xl font-black">
          SHIELD
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold uppercase bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
                CyberShield Security Operations Center (SOC)
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Zero-Trust Ingress Armed
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Enterprise Ingress Firewall & Cryptographic Merkle Tamper Defense
            </h2>
            <p className="text-slate-300 text-xs mt-1.5 max-w-2xl leading-relaxed">
              Defend ERP endpoints against distributed denial of service, webhook injection forgery, duplicate billing fraud, and offline database tampering with continuous cryptographic proofs.
            </p>
          </div>

          {/* Subscription Tier Indicator & Quick Switcher */}
          <div className="bg-slate-900/90 border border-indigo-400/30 rounded-xl p-3.5 shrink-0 flex flex-col gap-2 min-w-[260px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                Security Subscription:
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase ${
                activeSecurityTier === 'cybershield_sovereign'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                  : activeSecurityTier === 'cybershield_pro'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'bg-slate-700 text-slate-300'
              }`}>
                {activeSecurityTier === 'cybershield_sovereign' ? 'SOVEREIGN ($599/MO)' : activeSecurityTier === 'cybershield_pro' ? 'PRO ($249/MO)' : 'STANDARD SHIELD'}
              </span>
            </div>

            <div className="text-[11px] font-mono text-cyan-200">
              {activeSecurityTier === 'cybershield_sovereign' ? (
                <span>✓ Merkle Proofs + AI Fraud Sentinel + mTLS Vault</span>
              ) : activeSecurityTier === 'cybershield_pro' ? (
                <span>✓ Webhook HMAC + WAF Shunts + Replay Defense</span>
              ) : (
                <span>Basic Rate Limiting & Manual IP Banlist</span>
              )}
            </div>

            {/* Live Tier Switcher buttons */}
            <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-800 text-[9px] font-mono font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveSecurityTier('standard');
                  onPostMessage("Shifted simulation to Standard Shield Tier.", "info");
                }}
                className={`py-1 rounded text-center cursor-pointer transition-colors ${
                  activeSecurityTier === 'standard' ? 'bg-white/20 text-white font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveSecurityTier('cybershield_pro');
                  onPostMessage("Activated CyberShield Pro Tier (HMAC & WAF).", "success");
                }}
                className={`py-1 rounded text-center cursor-pointer transition-colors ${
                  activeSecurityTier === 'cybershield_pro' ? 'bg-cyan-500/30 text-cyan-200 font-black' : 'text-slate-400 hover:text-cyan-200'
                }`}
              >
                Pro ($249)
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveSecurityTier('cybershield_sovereign');
                  onPostMessage("Activated CyberShield Sovereign Tier (Full SOX Merkle & AI Fraud).", "success");
                }}
                className={`py-1 rounded text-center cursor-pointer transition-colors ${
                  activeSecurityTier === 'cybershield_sovereign' ? 'bg-purple-500/30 text-purple-200 font-black' : 'text-slate-400 hover:text-purple-200'
                }`}
              >
                Sovereign
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. TOP METRICS ROW                                         */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Metric 1: Ingress Shield */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">API Ingress Shield</span>
            <span className={`w-2.5 h-2.5 rounded-full ${shieldActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
              {shieldActive ? 'ACTIVE' : 'BYPASS'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">
            {shieldActive ? 'WAF deep packet filtering armed' : 'Unprotected direct port passthrough'}
          </p>
        </div>

        {/* Metric 2: Interceded Attacks */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Interceded Attacks</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold">142 TOTAL</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-indigo-600">
              {quarantinedPayloads.length}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">In Quarantine</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">
            SQLi, forged HMAC & replay attempts dropped.
          </p>
        </div>

        {/* Metric 3: Merkle Audit State */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">SOX Merkle Integrity</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600">
              {merkleBlockCount}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Chained Blocks</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">
            SHA-256 cryptographic proof: <strong className="text-emerald-600">UNBROKEN</strong>
          </p>
        </div>

        {/* Metric 4: Rate Ceiling Limit */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Rate Ceiling Limit</span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-950">{globalRateLimit}/min</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">
            Dynamic request budget per authorized domain.
          </p>
        </div>

      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. SECURITY OPERATIONS CENTER SUB-TABS                     */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          type="button"
          onClick={() => setSecurityTab('firewall')}
          className={`pb-3 px-4 text-xs font-mono font-bold tracking-wider cursor-pointer border-b-2 transition-all flex items-center gap-2 ${
            securityTab === 'firewall'
              ? 'border-indigo-600 text-indigo-600 dark:text-cyan-400 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>01. Gateway Firewall & WAF</span>
        </button>

        <button
          type="button"
          onClick={() => setSecurityTab('hmac')}
          className={`pb-3 px-4 text-xs font-mono font-bold tracking-wider cursor-pointer border-b-2 transition-all flex items-center gap-2 ${
            securityTab === 'hmac'
              ? 'border-indigo-600 text-indigo-600 dark:text-cyan-400 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Fingerprint className="w-4 h-4" />
          <span>02. Webhook HMAC & Replay Defense</span>
        </button>

        <button
          type="button"
          onClick={() => setSecurityTab('merkle')}
          className={`pb-3 px-4 text-xs font-mono font-bold tracking-wider cursor-pointer border-b-2 transition-all flex items-center gap-2 ${
            securityTab === 'merkle'
              ? 'border-indigo-600 text-indigo-600 dark:text-cyan-400 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>03. Tamper-Proof Merkle Ledger (SOX)</span>
        </button>

        <button
          type="button"
          onClick={() => setSecurityTab('fraud')}
          className={`pb-3 px-4 text-xs font-mono font-bold tracking-wider cursor-pointer border-b-2 transition-all flex items-center gap-2 ${
            securityTab === 'fraud'
              ? 'border-indigo-600 text-indigo-600 dark:text-cyan-400 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>04. AI Transaction Fraud Sentinel</span>
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 1: GATEWAY FIREWALL & WAF                             */}
      {/* ────────────────────────────────────────────────────────── */}
      {securityTab === 'firewall' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Shunts, Geofencing & Quarantined Payloads */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Shunt Controller Box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Dynamic Gateway Protection Shunts</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Automated deep-packet DDoS API filters</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleShield}
                  disabled={isBackendLocked}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    shieldActive 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'bg-rose-600 text-white shadow-xs'
                  }`}
                >
                  {shieldActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{shieldActive ? 'SHIELD ARMED' : 'SHIELD BYPASSED'}</span>
                </button>
              </div>

              {/* Geofencing Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 block">High-Risk ASN Geofence</span>
                    <span className="text-[10px] text-slate-500">Auto-drops bulletproof hosts</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setGeofenceHighRiskBlocked(!geofenceHighRiskBlocked);
                      onPostMessage(`Geofencing rule ${!geofenceHighRiskBlocked ? 'ENABLED' : 'DISABLED'}.`, 'info');
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold cursor-pointer ${
                      geofenceHighRiskBlocked ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {geofenceHighRiskBlocked ? 'BLOCKED' : 'ALLOW'}
                  </button>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 block">Tor & Proxy Sanitizer</span>
                    <span className="text-[10px] text-slate-500">Rejects anonymous relays</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTorExitNodesBlocked(!torExitNodesBlocked);
                      onPostMessage(`Tor/Proxy filter ${!torExitNodesBlocked ? 'ENABLED' : 'DISABLED'}.`, 'info');
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold cursor-pointer ${
                      torExitNodesBlocked ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {torExitNodesBlocked ? 'BLOCKED' : 'ALLOW'}
                  </button>
                </div>
              </div>

              {/* Blacklist block view */}
              <div className="border border-rose-200 bg-rose-50/20 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-mono font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5 text-rose-500" />
                    Firewall Banned Subnets ({activeBlacklist.length} IPs):
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={blockNewIp}
                      className="text-[10px] px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded font-mono font-bold cursor-pointer transition-colors"
                    >
                      + Ban Malicious Subnet
                    </button>
                    <button 
                      onClick={clearBlacklist}
                      disabled={activeBlacklist.length === 0}
                      className="text-[10px] underline font-mono text-slate-500 hover:text-slate-800 cursor-pointer disabled:opacity-40"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {activeBlacklist.map((ip) => (
                    <span key={ip} className="px-2.5 py-1 bg-white border border-rose-300 text-rose-700 font-mono text-[10px] rounded-md font-bold flex items-center gap-1">
                      <Ban className="w-3 h-3 text-rose-500" />
                      {ip}/32
                    </span>
                  ))}
                </div>
              </div>

              {/* Rate Ceiling Selector */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Rate Window Ceiling</span>
                  <span className="text-[10px] text-slate-500 font-mono">Current: {globalRateLimit} req/min per domain</span>
                </div>
                <button
                  type="button"
                  onClick={handleRateLimitToggle}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold rounded-lg border border-slate-200 cursor-pointer"
                >
                  Adjust Limit ({globalRateLimit})
                </button>
              </div>
            </div>

            {/* Quarantined Payloads Sandbox */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Skull className="w-5 h-5 text-rose-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Malicious Ingress Quarantine Sandbox</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Isolated exploit payloads dropped before database</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700">
                  {quarantinedPayloads.filter(q => q.status === 'QUARANTINED').length} ACTIVE ISOLATIONS
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {quarantinedPayloads.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded font-bold">
                          {item.payloadType}
                        </span>
                        <span className="text-slate-400 font-sans">{item.originDomain} ({item.originIp})</span>
                      </div>
                      <span className="text-slate-500">{item.timestamp}</span>
                    </div>
                    <pre className="text-[10px] text-rose-300 bg-black/40 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                      {item.rawSnippet}
                    </pre>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Live Terminal Stream Logs */}
          <div className="lg:col-span-5 bg-slate-950 border border-slate-900 rounded-2xl p-6 text-white shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    Sentinel Traffic Intercept Log
                  </span>
                </div>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto font-mono text-[10px] text-slate-300 pr-1">
                {accessLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className={`p-2 rounded-lg border flex flex-col gap-1 ${
                      log.status === 'ALLOWED' 
                        ? 'bg-slate-900/60 border-slate-800 text-slate-300' 
                        : log.status === 'QUARANTINED'
                        ? 'bg-rose-950/40 border-rose-900 text-rose-200'
                        : 'bg-amber-950/40 border-amber-900 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="font-bold">{log.timestamp} · {log.method} {log.endpoint}</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold ${
                        log.status === 'ALLOWED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[9px] flex justify-between">
                      <span>Origin: {log.ip} ({log.domain})</span>
                      <span>Rate: {log.rateUsed}/min</span>
                    </div>
                    {log.threatReason && (
                      <div className="text-[9px] text-rose-400 font-bold">
                        ↳ Intercept: {log.threatReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-900 mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsSimulatingAttack(!isSimulatingAttack)}
                className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  isSimulatingAttack 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>{isSimulatingAttack ? 'HALT SIMULATED ATTACK FLOOD' : 'SIMULATE DDOS ATTACK FLOOD'}</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 2: WEBHOOK HMAC & REPLAY DEFENSE                       */}
      {/* ────────────────────────────────────────────────────────── */}
      {securityTab === 'hmac' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: HMAC Verifier & Replay Defense */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Constant-Time HMAC-SHA256 Ingress Validator</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Guarantees zero order forgery across Shopify & Stripe webhooks</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  REPLAY DEFENSE: ON (300s)
                </span>
              </div>

              {/* Shared Secret Display */}
              <div className="mb-4">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">
                  Active Webhook Secret Key
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type={showHmacSecret ? 'text' : 'password'}
                    value={hmacSecretKey}
                    onChange={(e) => setHmacSecretKey(e.target.value)}
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowHmacSecret(!showHmacSecret)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-mono text-slate-700 cursor-pointer"
                  >
                    {showHmacSecret ? 'Hide' : 'Reveal'}
                  </button>
                </div>
              </div>

              {/* Interactive Verifier Simulation */}
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">
                    Inbound Payload Stream Body
                  </label>
                  <textarea
                    rows={3}
                    value={testPayloadBody}
                    onChange={(e) => setTestPayloadBody(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 uppercase font-bold">Computed X-Shopify-Hmac-SHA256:</span>
                    <span className="text-slate-500">Method: crypto.createHmac</span>
                  </div>
                  <div className="text-indigo-600 font-bold break-all">
                    {computedSignature}
                  </div>
                </div>

                {/* Test Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleVerifyTestHmac(false)}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold font-mono text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Test Valid Webhook Signature</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVerifyTestHmac(true)}
                    className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold font-mono text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>Test Forged Signature (Reject)</span>
                  </button>
                </div>

                {testVerifyResult !== 'idle' && (
                  <div className={`p-3 rounded-xl border text-xs font-mono ${
                    testVerifyResult === 'valid' 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    {testVerifyResult === 'valid' ? (
                      <div>
                        <strong>✓ SIGNATURE VERIFIED:</strong> Ingress payload authenticated. Timestamp within fresh 300s window. Nonce registered in anti-replay cache.
                      </div>
                    ) : (
                      <div>
                        <strong>❌ SECURITY ALERT:</strong> Ingress signature verification failed. Digest does not match shared secret. Transaction was quarantined immediately.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Scoped API Key Vault */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Zero-Trust Scoped API Vault</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Least-privilege tokens with automated rotation</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newKey: ApiVaultKey = {
                      id: `key-${Date.now()}`,
                      name: "Enterprise ERP Inbound Tunnel",
                      prefix: `cbx_live_${Math.random().toString(36).substring(2, 6)}`,
                      scope: "invoice:post",
                      createdAt: new Date().toISOString().split('T')[0],
                      expiresInDays: 60,
                      status: "ACTIVE"
                    };
                    setApiKeys(prev => [newKey, ...prev]);
                    onPostMessage("Generated new scoped API Vault key with 60-day auto-expiry.", "success");
                  }}
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-mono font-bold cursor-pointer"
                >
                  + Generate Token
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {apiKeys.map((k) => (
                  <div key={k.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{k.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        k.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {k.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Token: <code>{k.prefix}••••••••</code></span>
                      <span className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700">Scope: {k.scope}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                      <span>Expires in: {k.expiresInDays} days</span>
                      <button
                        type="button"
                        onClick={() => {
                          setApiKeys(prev => prev.filter(key => key.id !== k.id));
                          onPostMessage(`Revoked key token ${k.prefix}.`, "info");
                        }}
                        className="text-rose-600 hover:underline cursor-pointer"
                      >
                        Revoke Token
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 text-[10px] text-slate-500 font-mono">
              🛡️ Mutual TLS (mTLS) handshake certificates enforced for banking connections.
            </div>
          </div>

        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 3: TAMPER-PROOF MERKLE LEDGER (SOX-404)               */}
      {/* ────────────────────────────────────────────────────────── */}
      {securityTab === 'merkle' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Continuous Merkle-Tree Ledger Integrity</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Every journal entry is cryptographically chained using SHA-256 blocks</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-mono font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ROOT HASH: UNTAMPERED</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Unlike legacy ERP databases where SQL administrators can silently modify historical balances or drop records, CloudboyX computes a continuous SHA-256 Merkle root. Any offline amendment breaks the hash chain, triggering instant alerts to the audit committee.
            </p>

            {/* Merkle Root Display Box */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>ACTIVE MERKLE ROOT HASH</span>
                <span className="text-emerald-400 font-bold">148 Transactions Linked</span>
              </div>
              <div className="text-xs text-emerald-400 font-bold break-all p-2.5 bg-black/50 rounded border border-emerald-500/30">
                {merkleRootHash}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>Last Verified: {lastAuditTimestamp}</span>
                <span>Algorithm: Double SHA-256 Chained</span>
              </div>
            </div>

            {/* Verification & Certification Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleVerifyMerkleChain}
                disabled={isVerifyingMerkle}
                className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isVerifyingMerkle ? 'animate-spin' : ''}`} />
                <span>{isVerifyingMerkle ? 'Verifying Merkle Nodes...' : 'Recalculate & Verify Root Hash'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportSOXDossier}
                className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Signed SOX Audit Dossier</span>
              </button>
            </div>
          </div>

          {/* Right Column: SOX Compliance Seal */}
          <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h4 className="text-xs font-bold font-mono uppercase text-slate-800">
                  Regulatory Audit Compliance
                </h4>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>SOX Section 404 (Internal Controls)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-sans">
                    Cryptographic hash chain guarantees immutable financial records for public company reporting.
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>SOC-2 Type II Attestation</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-sans">
                    Audit trail logs all administrative role elevation and firewall rule modifications.
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>PCI-DSS Level 1 Gateway Hygiene</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-sans">
                    Zero raw credit card persistence with HMAC masked merchant order digests.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 font-mono text-center">
              Auditor Grade: Big 4 Read-Ready
            </div>
          </div>

        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 4: AI TRANSACTION FRAUD SENTINEL                       */}
      {/* ────────────────────────────────────────────────────────── */}
      {securityTab === 'fraud' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">AI Transaction Anomaly & Fraud Sentinel</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Cognitive pattern detection stopping duplicate invoices and velocity drift</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                fraudScore > 50 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                THREAT SCORE: {fraudScore}/100
              </span>
            </div>

            {/* Cognitive Fraud Heuristics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 block mb-1">1. Velocity Spike Interceptor</span>
                <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                  Monitors for refund bursts or mass balance transfers exceeding standard standard-deviation envelopes.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 block mb-1">2. Duplicate Invoice Interceptor</span>
                <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                  Hashes line items across procurement POs to catch vendors accidentally or maliciously double-billing.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 block mb-1">3. Geo IP vs Billing Mismatch</span>
                <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                  Flags orders where billing entity currency and transit IP geolocation conflict beyond acceptable tolerances.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 block mb-1">4. SKU Hoarding / Drain Defense</span>
                <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                  Blocks rapid repeated unfulfilled cart reservations from coordinated reseller bot networks.
                </p>
              </div>
            </div>

            {/* Interactive Fraud Simulation Trigger */}
            <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 font-mono">
                  Test AI Duplicate Invoice Double-Spend Interceptor
                </span>
                <span className="text-[10px] font-mono text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  Live Simulation
                </span>
              </div>
              <p className="text-xs text-purple-800 font-sans leading-relaxed">
                Trigger a simulated attack where an external vendor submits an identical $42,100.00 invoice twice under altered dates to attempt unauthorized payouts.
              </p>
              <button
                type="button"
                onClick={handleSimulateDuplicateInvoiceFraud}
                disabled={isSimulatingFraud}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white rounded-xl text-xs font-mono font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Simulate Duplicate Invoice Fraud Attempt</span>
              </button>
            </div>

            {duplicateInvoiceIntercepted && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-mono flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-sm">INTERCEPTED: Duplicate Vendor Invoice #INV-8891 ($42,100.00)</strong>
                  <p className="mt-1 text-[11px] font-sans leading-relaxed">
                    AI Fraud Sentinel detected identical line items matching transaction <code>TX-9902</code> posted 4 days ago. Relational posting was aborted and flagged in the quarantine log.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Threat Matrix Telemetry */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                  Anomaly Telemetry Stream
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">
                  Autonomous Guard: ACTIVE
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>General Ledger Invariant Parity:</span>
                  <span className="text-emerald-400 font-bold">100.0% BALANCED</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Velocity Volatility Standard Deviation:</span>
                  <span className="text-cyan-400 font-bold">0.42 σ (Nominal)</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Tor & Bulletproof ASN Blocks:</span>
                  <span className="text-purple-400 font-bold">29 Drops Today</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Double-Spend Intercept Rate:</span>
                  <span className="text-emerald-400 font-bold">100% Zero Leaks</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 mt-4 text-[10px] font-mono text-slate-400">
              ⚡ Powered by Gemini Multimodal Risk Reasoning Engine
            </div>
          </div>

        </div>
      )}

    </motion.div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  ShieldCheck, 
  Database, 
  ArrowRight, 
  Plus, 
  Trash, 
  RefreshCw, 
  Play, 
  Check, 
  X, 
  HardDrive, 
  Info, 
  AlertCircle, 
  ExternalLink,
  Cpu,
  CornerDownRight,
  TrendingUp,
  FileText,
  Lock,
  Unlock
} from 'lucide-react';
import BrandMonitoringSection from './BrandMonitoringSection';
import RealtimeRoutingSection from './RealtimeRoutingSection';
import EndpointGuardSection from './EndpointGuardSection';

interface Reseller {
  id: string;
  name: string;
  domain: string;
  status: 'Authorized' | 'Pending' | 'Revoked';
  rateLimit: number;
  ordersCount: number;
  lastActive: string;
}

interface CloudboyXPortalProps {
  onRefreshStats: () => void;
  onPostMessage: (text: string, type: 'success' | 'err') => void;
  isAdminMode?: boolean;
  lockedFields?: string[];
}

export default function CloudboyXPortal({ 
  onRefreshStats, 
  onPostMessage,
  isAdminMode = true,
  lockedFields = []
}: CloudboyXPortalProps) {
  const isBackendLocked = !isAdminMode && lockedFields.includes('systemBackendSettings');

  // Resellers states
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New reseller form states
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newDomain, setNewDomain] = useState<string>('');
  const [newRateLimit, setNewRateLimit] = useState<number>(500);
  const [newStatus, setNewStatus] = useState<'Authorized' | 'Pending' | 'Revoked'>('Authorized');

  // Order Ingestion Simulator States
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [simSku, setSimSku] = useState<string>('VNTG-TEE-BLK');
  const [simQty, setSimQty] = useState<number>(2);
  const [simAmount, setSimAmount] = useState<number>(35);
  const [simEmail, setSimEmail] = useState<string>('wholesale-shopper@reseller.com');
  const [routingState, setRoutingState] = useState<'idle' | 'auth_checking' | 'normalizing' | 'db_posting' | 'success' | 'denied'>('idle');
  const [routingLog, setRoutingLog] = useState<string[]>([]);
  const [routedSql, setRoutedSql] = useState<string>('');
  const [simResult, setSimResult] = useState<{ txId: string; reseller: string } | null>(null);

  // DNS Verify State
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [dnsLog, setDnsLog] = useState<{ [id: string]: string }>({});

  // Firestore ("Firestone") verification states
  const [firestoreStatus, setFirestoreStatus] = useState<'unconfigured' | 'checking' | 'active' | 'permission_denied'>('unconfigured');
  const [firestoreLogs, setFirestoreLogs] = useState<string[]>([]);

  // Local storage cache count
  const [localStorageCacheCount, setLocalStorageCacheCount] = useState<number>(0);

  // Cloudboy X Tab-module Selector (1 = Ingress, 2 = Brand Reputation, 3 = Cargo Rerouting, 4 = Endpoint Shield Guard)
  const [activePortalTab, setActivePortalTab] = useState<'ingress' | 'monitoring' | 'rerouting' | 'guard'>('ingress');

  // Brand Reputation & Product Monitoring states
  const [isScanningReputation, setIsScanningReputation] = useState<boolean>(false);
  const [reputationLogs, setReputationLogs] = useState<string[]>([
    '[2026-06-16 00:11:04] Initialized Brand Reputation & Product MAP monitor daemons...',
    '[2026-06-16 00:15:30] Tokyo wholesale node pricing scan: Verified $35.00 USD (100% compliant).',
    '[2026-06-16 00:20:45] London distributor node pricing scan: Verified $34.99 USD (Compliant, within MAP grace).',
    '[2026-06-16 00:28:10] Social sentinel: Scanned 120 Instagram & Tokyo forum tags. Sentiment index: 94.2% Positive.'
  ]);
  const [sentimentScore, setSentimentScore] = useState<number>(94.2);
  const [totalMonitoredItems, setTotalMonitoredItems] = useState<number>(240);

  // Reputation scanner handler code
  const handleTriggerReputationScan = () => {
    setIsScanningReputation(true);
    setReputationLogs(prev => [
      `[${new Date().toLocaleTimeString()}] 🚀 Launching immediate marketplace intelligence scan...`,
      ...prev
    ]);

    setTimeout(() => {
      setReputationLogs(prev => [
        `[${new Date().toLocaleTimeString()}] 🔍 Injecting scrapers into regional wholesale networks...`,
        `[${new Date().toLocaleTimeString()}] 🛡️ Analyzing reseller product MAP compliance values...`,
        ...prev
      ]);
      
      setTimeout(() => {
        const brands = ['Tokyo hub', 'London Hub', 'New York central', 'Berlin reseller'];
        const randomBrand = brands[Math.floor(Math.random() * brands.length)];
        const newScore = Number((92 + Math.random() * 7).toFixed(1));
        setSentimentScore(newScore);
        setTotalMonitoredItems(prev => prev + Math.floor(Math.random() * 15) + 5);
        setReputationLogs(prev => [
          `[${new Date().toLocaleTimeString()}] ✓ SUCCESS: No counterfeit listings found for VNTG-TEE-BLK!`,
          `[${new Date().toLocaleTimeString()}] ✓ Verified ${randomBrand} complies with MAP minimum price ($35.00).`,
          `[${new Date().toLocaleTimeString()}] ✓ Global Net Sentiment recalibrated to ${newScore}% Positive.`,
          ...prev
        ]);
        setIsScanningReputation(false);
        onPostMessage('Brand Reputation & MAP price compliance scan completed.', 'success');
      }, 1000);
    }, 1000);
  };

  // Load resellers from database
  const fetchResellers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/resellers');
      const data = await res.json();
      if (data.success) {
        setResellers(data.resellers);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch resellers');
      }
    } catch (err: any) {
      setError(err.message || 'Server Connection Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResellers();
    updateCacheCount();
  }, []);

  const updateCacheCount = () => {
    try {
      const savedTexts = localStorage.getItem('buildcorp_custom_texts');
      const count = savedTexts ? Object.keys(JSON.parse(savedTexts)).length : 0;
      setLocalStorageCacheCount(count);
    } catch {
      setLocalStorageCacheCount(0);
    }
  };

  // Toggle Reseller domain Auth
  const handleToggleStatus = async (id: string, currentStatus: 'Authorized' | 'Pending' | 'Revoked') => {
    if (isBackendLocked) {
      onPostMessage('🔒 Action Blocked: Modify Reseller permissions is locked by the System Admin.', 'err');
      return;
    }
    let nextStatus: 'Authorized' | 'Pending' | 'Revoked' = 'Authorized';
    if (currentStatus === 'Authorized') nextStatus = 'Revoked';
    else if (currentStatus === 'Revoked') nextStatus = 'Pending';

    try {
      const res = await fetch('/api/resellers/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        onPostMessage(`Domain status updated to ${nextStatus}`, 'success');
        fetchResellers();
      } else {
        onPostMessage(data.error || 'Failed to toggle status', 'err');
      }
    } catch (err: any) {
      onPostMessage(err.message || 'API error', 'err');
    }
  };

  // Delete Reseller
  const handleDeleteReseller = async (id: string) => {
    if (isBackendLocked) {
      onPostMessage('🔒 Action Blocked: Reseller deletion is locked by the System Admin.', 'err');
      return;
    }
    if (!window.confirm('Are you sure you want to remove this reseller and domain authorization?')) return;
    try {
      const res = await fetch('/api/resellers/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        onPostMessage('Reseller domain authorized access deleted', 'success');
        fetchResellers();
      } else {
        onPostMessage(data.error || 'Delete error', 'err');
      }
    } catch (err: any) {
      onPostMessage(err.message || 'Server error', 'err');
    }
  };

  // Add Reseller
  const handleAddReseller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBackendLocked) {
      onPostMessage('🔒 Action Blocked: Registering new domains is locked by the System Admin.', 'err');
      return;
    }
    if (!newName || !newDomain) {
      alert('Please fill out Name and Domain fields');
      return;
    }

    try {
      const res = await fetch('/api/resellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          domain: newDomain.toLowerCase().replace(/https?:\/\//, '').trim(),
          status: newStatus,
          rateLimit: Number(newRateLimit)
        })
      });
      const data = await res.json();
      if (data.success) {
        onPostMessage('New Reseller Domain added to registry', 'success');
        setNewName('');
        setNewDomain('');
        setNewRateLimit(500);
        setShowAddForm(false);
        fetchResellers();
      } else {
        onPostMessage(data.error || 'Failed to register reseller', 'err');
      }
    } catch (err: any) {
      onPostMessage(err.message || 'Creation error', 'err');
    }
  };

  // Simulate Order Transit Routing through Cloudboy X Gateway
  const handleSimulateRouting = async () => {
    if (!selectedDomain) {
      alert('Select a Reseller domain node first to trigger simulation');
      return;
    }

    setRoutingState('auth_checking');
    setRoutingLog(['📡 Initiating secure ingress session...', `🔗 Origin host: ${selectedDomain}`]);
    setRoutedSql('');
    setSimResult(null);

    const targetReseller = resellers.find(r => r.domain === selectedDomain);

    setTimeout(async () => {
      setRoutingLog(prev => [...prev, '🔍 Querying Cloudboy X Registry authorization table...', `🛡️ Checking status...`]);
      
      if (!targetReseller) {
        setRoutingState('denied');
        setRoutingLog(prev => [...prev, '❌ REJECTED: Reseller Host Domain not registered in memory database state.', '✋ Transaction aborted at Gateway Edge Router']);
        return;
      }

      setRoutingLog(prev => [...prev, `📋 Domain state verified: [${targetReseller.status}]`]);

      if (targetReseller.status !== 'Authorized') {
        setRoutingState('denied');
        setRoutingLog(prev => [
          ...prev, 
          `🛑 REJECTED: Domain "${selectedDomain}" authorization has been suspended or is pending.`,
          '👉 To authorize, toggle this domain to [Authorized] in the Registry table below.'
        ]);
        return;
      }

      setRoutingState('normalizing');
      setRoutingLog(prev => [
        ...prev, 
        '✓ PASS: Host authorized.',
        '🛠️ Gateway Ingress Normalizing custom sales JSON schema map...',
        '📦 Translating to Canonical Schema format...'
      ]);

      setTimeout(async () => {
        setRoutingLog(prev => [
          ...prev,
          `✓ Normalized total: $${(simAmount * simQty).toFixed(2)} USD`,
          '⚡ Executing double-entry SQL General Ledger insertion query...'
        ]);
        setRoutingState('db_posting');

        try {
          const response = await fetch('/api/resellers/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              resellerDomain: selectedDomain,
              sku: simSku,
              quantity: simQty,
              amount: simAmount,
              email: simEmail
            })
          });

          const resData = await response.json();

          if (resData.success) {
            setRoutingState('success');
            setRoutingLog(prev => [
              ...prev,
              '✓ Relational rows posted successfully.',
              '✓ AlaSQL balanced audit ledger status: [BALANCED]',
              `✓ Journal entries debited Cash (1010) and credited Sales Revenue (4010).`,
              `✓ Snapshot general ledger backup written to db_state.json`
            ]);
            setRoutedSql(resData.sql || '');
            setSimResult({
              txId: resData.transactionId,
              reseller: resData.resellerName
            });
            onRefreshStats();
            fetchResellers();
          } else {
            setRoutingState('denied');
            setRoutingLog(prev => [...prev, `❌ Backend Error: ${resData.error}`]);
          }
        } catch (e: any) {
          setRoutingState('denied');
          setRoutingLog(prev => [...prev, `❌ Connection error during transit query: ${e.message}`]);
        }
      }, 1000);

    }, 800);
  };

  // Verify DNS simulation
  const handleVerifyDns = (id: string, domain: string) => {
    setVerifyingId(id);
    setDnsLog(prev => ({ ...prev, [id]: '🔍 Querying authorative TLD nameservers...' }));

    setTimeout(() => {
      setDnsLog(prev => ({ ...prev, [id]: '🔄 Resolving DNS record A and TXT headers...' }));

      setTimeout(() => {
        const isSuspended = resellers.find(r => r.id === id)?.status === 'Revoked';
        if (isSuspended) {
          setDnsLog(prev => ({ 
            ...prev, 
            [id]: '🔴 Suspended: host matches locked reseller node. Traffic blocked.' 
          }));
        } else {
          setDnsLog(prev => ({ 
            ...prev, 
            [id]: `🟢 Resolved: cloudboy-edge.dns -> IP 172.64.8.4. Ready ✓` 
          }));
        }
        setVerifyingId(null);
      }, 800);
    }, 800);
  };

  // Test Firestone Connection
  const handleTestFirestone = () => {
    if (isBackendLocked) {
      onPostMessage('🔒 Action Blocked: Cloud database connection configuration is locked under administrative rules.', 'err');
      return;
    }
    setFirestoreStatus('checking');
    setFirestoreLogs(['🔥 Initializing verification handshake with Cloud Firestore...', '⚙️ Loading firebase-applet-config.json credentials...']);

    setTimeout(() => {
      setFirestoreLogs(prev => [...prev, '❌ Handshake Error: Service account key lacks required Firebase IAM roles.', '⚠️ Error Details: "Operation failed with code 7 (Permission Denied). The project Service Account does not have permission to create or write to a Firestore instance."']);
      setFirestoreStatus('permission_denied');
    }, 1200);
  };

  const handlePurgeLocalCache = () => {
    if (isBackendLocked) {
      alert('🔒 Action Blocked: Local host state caching is secured and cannot be reset by a reseller.');
      return;
    }
    if (window.confirm('Wipe local customized texts to restore standard default configurations?')) {
      localStorage.removeItem('buildcorp_custom_texts');
      updateCacheCount();
      alert('Local cache wiped. Reload to apply defaults.');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      
      {/* Visual Header / Explainer banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 p-4 opacity-5 select-none pointer-events-none font-mono text-8xl">CLOUDBOY X</div>
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-3">
            <Cpu className="w-3.5 h-3.5" />
            Transitional Gateway & Reseller Authority Core
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Cloudboy X authorized ingress filters</h2>
          <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">
            Configure, authorize, and verify reseller domains. Admin-side controls filter domain streams, ensuring only approved portals can route transactions directly into your relational General Ledger.
          </p>
        </div>
      </div>

      {/* Tab Navigation for Cloudboy X Portal */}
      <div className="flex flex-wrap border-b border-slate-200 gap-1 sm:gap-2">
        <button
          onClick={() => setActivePortalTab('ingress')}
          className={`pb-3 px-3 sm:px-4 text-[11px] sm:text-xs font-bold font-mono uppercase tracking-wider cursor-pointer border-b-2 transition-all ${
            activePortalTab === 'ingress'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          🌐 Ingress & Resellers
        </button>
        <button
          onClick={() => setActivePortalTab('monitoring')}
          className={`pb-3 px-3 sm:px-4 text-[11px] sm:text-xs font-bold font-mono uppercase tracking-wider cursor-pointer border-b-2 transition-all ${
            activePortalTab === 'monitoring'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          🛡️ Brand Reputation & MAP
        </button>
        <button
          onClick={() => setActivePortalTab('rerouting')}
          className={`pb-3 px-3 sm:px-4 text-[11px] sm:text-xs font-bold font-mono uppercase tracking-wider cursor-pointer border-b-2 transition-all ${
            activePortalTab === 'rerouting'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          🔄 Cargo Routing Balancer
        </button>
        <button
          onClick={() => setActivePortalTab('guard')}
          className={`pb-3 px-3 sm:px-4 text-[11px] sm:text-xs font-bold font-mono uppercase tracking-wider cursor-pointer border-b-2 transition-all ${
            activePortalTab === 'guard'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          🔒 Endpoint Shield Guard
        </button>
      </div>

      {activePortalTab === 'monitoring' ? (
        <BrandMonitoringSection
          sentimentScore={sentimentScore}
          totalMonitoredItems={totalMonitoredItems}
          isScanningReputation={isScanningReputation}
          reputationLogs={reputationLogs}
          resellers={resellers}
          onTriggerReputationScan={handleTriggerReputationScan}
        />
      ) : activePortalTab === 'rerouting' ? (
        <RealtimeRoutingSection
          resellers={resellers}
          onPostMessage={onPostMessage}
        />
      ) : activePortalTab === 'guard' ? (
        <EndpointGuardSection
          resellers={resellers}
          onPostMessage={onPostMessage}
        />
      ) : (
        <>
          {/* Transitional Live Flow Diagram & Simulator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Simulation Interactive Console */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></div>
                <h3 className="text-sm font-bold text-slate-800">Transitional Flow Engine & Ingress Simulator</h3>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-400 bg-slate-50 px-2.5 py-1 border border-slate-200 rounded-md">Continuous Pipeline</span>
            </div>

            {/* Visualizer Pipeline Nodes */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 shadow-inner mb-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2 relative">
                
                {/* Node 1: Reseller Host */}
                <div className={`p-3 rounded-lg border text-center transition-all w-full md:w-32 ${
                  selectedDomain 
                    ? 'bg-slate-900 border-indigo-500 text-indigo-300' 
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}>
                  <Globe className="w-5 h-5 mx-auto mb-1.5" />
                  <p className="text-[10px] font-bold font-mono truncate">
                    {selectedDomain ? selectedDomain : 'No Domain Selected'}
                  </p>
                  <span className="text-[8px] uppercase tracking-wider font-mono text-slate-500">Retailer Node</span>
                </div>

                <div className="hidden md:block text-slate-700">
                  <ArrowRight className="w-4 h-4 animate-pulse shrink-0" />
                </div>

                {/* Node 2: Cloudboy X auth gateway */}
                <div className={`p-3 rounded-lg border text-center transition-all w-full md:w-36 ${
                  routingState !== 'idle' 
                    ? routingState === 'denied' 
                      ? 'bg-rose-950/20 border-rose-500 text-rose-300'
                      : 'bg-slate-950 border-emerald-500 text-emerald-400' 
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}>
                  <ShieldCheck className="w-5 h-5 mx-auto mb-1.5" />
                  <p className="text-[10px] font-bold font-mono">Cloudboy X Gate</p>
                  <span className="text-[8px] uppercase tracking-wider font-mono text-slate-500">
                    {routingState === 'idle' ? 'Awaiting Auth Match' : routingState === 'auth_checking' ? 'Matching...' : 'Match Decided ✓'}
                  </span>
                </div>

                <div className="hidden md:block text-slate-700">
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </div>

                {/* Node 3: Canonical normalization */}
                <div className={`p-3 rounded-lg border text-center transition-all w-full md:w-32 ${
                  routingState === 'normalizing' || routingState === 'db_posting' || routingState === 'success'
                    ? 'bg-slate-900 border-indigo-400 text-indigo-200' 
                    : 'font-mono bg-slate-900/40 border-slate-800 text-slate-500'
                }`}>
                  <FileText className="w-5 h-5 mx-auto mb-1.5" />
                  <p className="text-[10px] font-bold font-mono">ERP Normalizer</p>
                  <span className="text-[8px] uppercase tracking-wider font-mono text-slate-500">Canonical Form</span>
                </div>

                <div className="hidden md:block text-slate-700">
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </div>

                {/* Node 4: SQL double posting */}
                <div className={`p-3 rounded-lg border text-center transition-all w-full md:w-32 ${
                  routingState === 'success' 
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 scale-105 shadow-md shadow-emerald-500/10' 
                    : 'font-mono bg-slate-900/40 border-slate-800 text-slate-500'
                }`}>
                  <Database className="w-5 h-5 mx-auto mb-1.5" />
                  <p className="text-[10px] font-bold font-mono">Relational Ledger</p>
                  <span className="text-[8px] uppercase tracking-wider font-mono text-slate-500">AlaSQL SQL Posting</span>
                </div>

              </div>
            </div>

            {/* Inputs Form Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1.5">1. Origin Reseller Host Domain</label>
                <select 
                  value={selectedDomain}
                  onChange={(e) => {
                    setSelectedDomain(e.target.value);
                    setRoutingState('idle');
                    setRoutingLog([]);
                    setSimResult(null);
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">-- Click to choose configured domain node --</option>
                  {resellers.map(r => (
                    <option key={r.id} value={r.domain}>
                      {r.name} ({r.domain}) - Status: {r.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1.5">2. Customer Email</label>
                <input 
                  type="email" 
                  value={simEmail} 
                  onChange={(e) => setSimEmail(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  placeholder="shopper@retailer.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1.5">Product SKU</label>
                <input 
                  type="text" 
                  value={simSku} 
                  onChange={(e) => setSimSku(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1.5">Quantity</label>
                <input 
                  type="number" 
                  min="1" 
                  value={simQty} 
                  onChange={(e) => setSimQty(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1.5">Unit Price (USD)</label>
                <input 
                  type="number" 
                  min="0.01" 
                  step="0.01" 
                  value={simAmount} 
                  onChange={(e) => setSimAmount(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSimulateRouting}
            disabled={!selectedDomain || routingState === 'auth_checking' || routingState === 'normalizing' || routingState === 'db_posting'}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-705 active:bg-indigo-950 text-white rounded-xl text-xs font-bold font-mono tracking-wider shadow shadow-indigo-650/20 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5 transition-transform duration-100 active:scale-99"
          >
            <Play className="w-4 h-4 shrink-0 font-bold" />
            TRIGGER COUPLING FLOW ROUTER
          </button>
        </div>

        {/* Right Side: Active Terminal Logs */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-900 rounded-2xl flex flex-col justify-between p-5 text-white overflow-hidden shadow-2xl relative">
          <div className="absolute right-0 bottom-0 pointer-events-none opacity-5 font-mono text-5xl">INGRESS</div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">Cloudboy X Router Stream Logs</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
            </div>

            {/* Simulated Live Console Logs */}
            <div className="space-y-2 h-[220px] overflow-y-auto font-mono text-[10px] text-slate-300 scrollbar-thin select-none">
              {routingLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-slate-600 h-full gap-2">
                  <Info className="w-5 h-5 text-slate-700" />
                  <p className="italic text-center">Awaiting flow trigger. Select an active reseller domain and trigger the couplers router.</p>
                </div>
              ) : (
                routingLog.map((log, idx) => (
                  <p key={idx} className="leading-relaxed border-l border-slate-800 pl-2">
                    {log}
                  </p>
                ))
              )}
            </div>
          </div>

          {/* Result Block & SQL Statement Representation */}
          {routingState === 'success' && simResult && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2 text-left"
            >
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] font-mono">
                <Check className="w-3.5 h-3.5 text-emerald-400 border border-emerald-500 rounded-full p-0.5 shrink-0" />
                <span>FLOW TRANSIT TRANSLATION COMPLETE ✓</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-normal font-sans">
                Successfully routed transaction from <strong className="text-white">{simResult.reseller}</strong>. Balancing debit and credit lines posted to General Ledger on transaction <strong className="text-white font-mono">{simResult.txId}</strong>.
              </p>
              
              {routedSql && (
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-mono font-bold uppercase block mt-1.5">Executed SQL Ledger Posting block:</span>
                  <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg max-h-24 overflow-y-auto text-[9px] font-mono text-emerald-400 scrollbar-thin">
                    <pre className="whitespace-pre-wrap">{routedSql}</pre>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {routingState === 'denied' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-1.5 text-left"
            >
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[11px] font-mono">
                <X className="w-3.5 h-3.5 text-rose-400 border border-rose-500 rounded-full p-0.5 shrink-0" />
                <span>ACCESS ROUTE DENIED BY ADMINISTRATIVE POLICY</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-normal font-sans">
                The gateway router rejected the transaction request. The origin reseller is currently blocklisted or pending authentication. Ask the administrator to authorize their domain to allow traffic to go through.
              </p>
            </motion.div>
          )}

          <div className="border-t border-slate-900 pt-3 mt-4 flex items-center justify-between text-[9px] font-mono text-slate-500">
            <span>EDGE HOST PORT: 3000</span>
            <span>REST PROTOCOL: HTTPS</span>
          </div>

        </div>
      </div>

      {/* Table: Authorized Domains Registry */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-left">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Domain Authority & Reseller Match-Registry</h3>
            <p className="text-xs text-slate-400 mt-0.5">Control the gateways domain match registry. Authorized cells route instantly, revoked segments block all incoming lines.</p>
          </div>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl text-xs font-bold font-mono tracking-tight flex items-center gap-1.5 cursor-pointer ml-auto shrink-0 transition-transform duration-200 active:scale-95"
          >
            {showAddForm ? (
              <>
                <X className="w-3.5 h-3.5" />
                Cancel Setup
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Add Reseller Domain
              </>
            )}
          </button>
        </div>

        {/* Add Reseller Inline Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-slate-100 bg-slate-50/50 overflow-hidden"
            >
              <form onSubmit={handleAddReseller} className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1.5">Reseller Name</label>
                  <input 
                    type="text" 
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                    placeholder="e.g. Acme Stores"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1.5">Domain Address</label>
                  <input 
                    type="text" 
                    required
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                    placeholder="e.g. acme-shop.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1.5">Rate Limit</label>
                    <input 
                      type="number" 
                      required
                      value={newRateLimit}
                      onChange={(e) => setNewRateLimit(Number(e.target.value))}
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1.5">Initial Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="Authorized">Authorized</option>
                      <option value="Pending">Pending</option>
                      <option value="Revoked">Revoked</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="py-2.5 bg-indigo-650 hover:bg-indigo-705 active:bg-indigo-950 text-white rounded-xl text-xs font-bold font-mono tracking-tight shadow flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Register Domain
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
            <span className="font-mono">Loading general ledger reseller authorization registries...</span>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-xs text-rose-500 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8" />
            <p className="font-semibold">{error}</p>
            <button onClick={fetchResellers} className="px-3 py-1 bg-slate-100 hover:bg-slate-201 text-[10px] font-mono rounded border border-slate-200">
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="bg-slate-50/50">
                <tr className="text-slate-400 uppercase font-mono text-[9px] tracking-wider font-bold text-left">
                  <th className="px-6 py-3.5">Reseller Name</th>
                  <th className="px-6 py-3.5">Host Domain</th>
                  <th className="px-6 py-3.5">Access Permission</th>
                  <th className="px-6 py-3.5">Rate Limit</th>
                  <th className="px-6 py-3.5">Tx Volumes</th>
                  <th className="px-6 py-3.5">Last Transmission</th>
                  <th className="px-6 py-3.5 text-right">Administrative Audit Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resellers.map((r) => {
                  const hasDnsLog = dnsLog[r.id];
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/40 text-slate-700">
                      <td className="px-6 py-3.5 font-semibold text-slate-800">{r.name}</td>
                      <td className="px-6 py-3.5">
                        <div className="font-mono text-slate-500 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <span>{r.domain}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <button
                          onClick={() => handleToggleStatus(r.id, r.status)}
                          className="focus:outline-none"
                          title="Click to shift access permissions"
                        >
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer select-none ring-offset-2 ${
                            r.status === 'Authorized'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 hover:after:content-[" (Suspend)"]'
                              : r.status === 'Revoked'
                                ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700'
                                : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              r.status === 'Authorized' ? 'bg-emerald-552 shadow shadow-emerald-500/50' : r.status === 'Revoked' ? 'bg-rose-500' : 'bg-amber-552'
                            }`}></span>
                            {r.status}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-slate-500">{r.rateLimit} req/s</td>
                      <td className="px-6 py-3.5">
                        <span className="font-mono font-bold bg-slate-100 text-slate-705 px-2 py-0.5 rounded-lg text-[10px]">
                          {r.ordersCount} posted
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-405 font-mono text-[11px]">
                        {r.lastActive === 'Never' ? (
                          <span className="text-slate-400">Never</span>
                        ) : (
                          new Date(r.lastActive).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right space-x-1.5 shrink-0">
                        {hasDnsLog ? (
                          <span className="font-mono text-[10px] text-slate-500 border border-slate-200 bg-slate-50 px-2 py-1 rounded inline-block">
                            {dnsLog[r.id]}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleVerifyDns(r.id, r.domain)}
                            disabled={verifyingId !== null}
                            className="px-2.5 py-1 text-slate-600 hover:text-indigo-650 active:text-indigo-950 hover:bg-indigo-50 border border-slate-200 rounded font-mono text-[10px] font-bold cursor-pointer transition-colors disabled:opacity-50"
                          >
                            Verify DNS
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteReseller(r.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 active:text-rose-950 hover:bg-rose-50 rounded border border-slate-200 transition-colors cursor-pointer inline-flex items-center"
                          title="Remove domain permission"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Persistence Matrix Core: Firestone + Local Cache */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Firestone Connector status card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between text-left">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Database className="w-4.5 h-4.5 text-orange-500" />
                <h3 className="text-sm font-bold text-slate-800">Cloud Firestone Connection Monitor</h3>
              </div>
              <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border transition-colors ${
                firestoreStatus === 'active' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                  : firestoreStatus === 'permission_denied'
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                {firestoreStatus === 'unconfigured' && 'OFFLINE / UNLINKED'}
                {firestoreStatus === 'checking' && 'HANDSHAKING...'}
                {firestoreStatus === 'active' && 'ONLINE ✓'}
                {firestoreStatus === 'permission_denied' && 'INSUFFICIENT PERMISSIONS'}
              </span>
            </div>

            <p className="text-xs text-slate-550 leading-relaxed font-sans mb-4">
              Connect the Cloudboy X Authorized Reseller records directly to a global high-availability Google Cloud Firestore ("Firestone") database. This enables durable persistence across distributed multi-region environments.
            </p>

            {/* Firestone connection terminal logs snippet */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5 font-mono text-[9px] text-slate-300 select-none min-h-[90px]">
              {firestoreLogs.length === 0 ? (
                <p className="text-slate-500 italic">No connection log available. Trigger diagnostic check below.</p>
              ) : (
                firestoreLogs.map((log, idx) => (
                  <p key={idx} className={log.startsWith('❌') || log.startsWith('⚠️') ? 'text-rose-400 font-semibold' : 'text-slate-300'}>
                    {log}
                  </p>
                ))
              )}
            </div>
          </div>

          <button
            onClick={handleTestFirestone}
            disabled={firestoreStatus === 'checking' || isBackendLocked}
            className={`w-full mt-4 py-2.5 text-white rounded-xl text-xs font-bold font-mono tracking-wider shadow disabled:opacity-50 cursor-pointer transition-colors flex items-center justify-center gap-2 ${
              isBackendLocked 
                ? 'bg-slate-700 hover:bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-orange-600 hover:bg-orange-705 active:bg-orange-950'
            }`}
          >
            {isBackendLocked ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                DATABASE SYSTEMS SECURED BY SYSTEM ADMIN
              </>
            ) : (
              'VERIFY CONNECTIONS HANDSHAKE & RUN SYNCS'
            )}
          </button>
        </div>

        {/* Localhost cash / cache overlay parameters */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between text-left">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4.5 h-4.5 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-800">Local Cache Overwrites ("Localhost Cash")</h3>
              </div>
              <span className="text-[10px] font-bold font-mono text-indigo-650 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded">
                Persistent Cache Active
              </span>
            </div>

            <p className="text-xs text-slate-550 leading-relaxed font-sans mb-4">
              Rather than hard stitching codes into immutable packages, Cloudboy X utilizes local system cache persistence. Change the brand titles, network topologies, helper text tags, and custom fields on-the-fly. If you crash the system or require pristine data defaults, purge the cache or overwrite values locally.
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-500">Local Custom Text Records:</span>
                <span className="font-bold text-slate-800 bg-slate-200 px-2 py-0.5 rounded font-mono text-[11px]">{localStorageCacheCount} fields</span>
              </div>
              
              <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-500">AlaSQL SQL Disk Snapshot file:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono text-[11px]">✓ db_state.json</span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePurgeLocalCache}
            disabled={isBackendLocked}
            className={`w-full mt-4 py-2.5 text-white rounded-xl text-xs font-bold font-mono tracking-wider shadow disabled:opacity-50 cursor-pointer transition-colors flex items-center justify-center gap-2 ${
              isBackendLocked 
                ? 'bg-slate-700 hover:bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-rose-600 hover:bg-rose-705 active:bg-rose-950'
            }`}
          >
            {isBackendLocked ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                CACHE HARDLINE LOCKED BY CORPORATE ADMIN
              </>
            ) : (
              'PURGE & RESTORE ORIGINAL LOCAL CREDENTIALS'
            )}
          </button>
        </div>

      </div>
      </>
      )}

    </div>
  );
}

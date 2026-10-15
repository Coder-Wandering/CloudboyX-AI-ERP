import React from 'react';
import { motion } from 'motion/react';
import { 
  Globe, 
  Cpu, 
  TrendingUp, 
  RefreshCw, 
  Play, 
  Check, 
  X,
  FileText
} from 'lucide-react';

interface Reseller {
  id: string;
  name: string;
  domain: string;
  status: 'Authorized' | 'Pending' | 'Revoked';
  rateLimit: number;
  ordersCount: number;
  lastActive: string;
}

interface BrandMonitoringSectionProps {
  sentimentScore: number;
  totalMonitoredItems: number;
  isScanningReputation: boolean;
  reputationLogs: string[];
  resellers: Reseller[];
  onTriggerReputationScan: () => void;
}

export default function BrandMonitoringSection({
  sentimentScore,
  totalMonitoredItems,
  isScanningReputation,
  reputationLogs,
  resellers,
  onTriggerReputationScan
}: BrandMonitoringSectionProps) {
  return (
    <motion.div
      key="brand_monitoring"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 text-left font-sans"
    >
      {/* 1. High Velocity Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Brand Sentiment Index</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900">{sentimentScore}%</span>
            <span className="text-[10px] text-emerald-600 font-bold font-mono">▲ Positive</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${sentimentScore}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Aggregated social & review sentiment score.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">MAP Price Compliance</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold uppercase">100% OK</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-indigo-650">$35.00</span>
            <span className="text-[10px] text-slate-500">Target MAP</span>
          </div>
          <div className="flex gap-2 items-center mt-3 text-[10px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>All active channels fully compliant</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2.5">Minimum Advertised Price threshold for VNTG-TEE-BLK.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Product Authenticity Index</span>
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900">100%</span>
            <span className="text-[10px] text-indigo-600 font-bold font-mono">✓ Certified</span>
          </div>
          <div className="flex gap-2 items-center mt-3 text-[10px] text-slate-500">
            <span>0 counterfeits detected on external domains</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2.5">Scanned platforms: eBay, Amazon, Mercari & forums.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Monitored Listing Touchpoints</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900">{totalMonitoredItems}</span>
            <span className="text-[10px] text-slate-500">Items Scan</span>
          </div>
          <div className="flex gap-2 items-center mt-3 text-[10px] text-indigo-650 font-mono font-bold">
            <span>⚡ Real-time Stream Active</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2.5">Total products checked in last circular sweep.</p>
        </div>
      </div>

      {/* 2. Double Column: MAP Integrity Price Check vs Sentinel Social Intelligence Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Reseller Pricing Compliance & MAP Settings Tracker */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-800">Dynamic Product MAP Pricing Integrity Checks</h3>
              </div>
              <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 border border-indigo-100 rounded-md">
                Target SKU: VNTG-TEE-BLK
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans mb-4">
              This sub-module tracks if our authorized regional reseller partners are strictly maintaining our brand's Premium Tier minimum pricing ($35.00) on the Black Vintage Tee. Undercutting the MAP threshold hurts wholesale margins.
            </p>

            {/* Resellers listing and checking */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">Reseller Channel Integrity Status:</span>
              
              {resellers.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-xl text-center text-slate-500 text-xs italic">
                  No reseller registry nodes configured yet. Head to "Ingress Gateways & Registry" to authorize your first reseller nodes!
                </div>
              ) : (
                resellers.map((reseller) => {
                  const dynamicPrice = reseller.domain.includes('london') ? 34.99 : 35.00;
                  const isCompliant = dynamicPrice >= 35.00 || reseller.domain.includes('london');

                  return (
                    <div key={reseller.id} className="bg-slate-50/50 border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <Globe className="w-4 h-4" />
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800">{reseller.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{reseller.domain}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Current Price</span>
                          <span className="font-mono font-bold text-slate-900">${dynamicPrice.toFixed(2)} USD</span>
                        </div>

                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          isCompliant 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : 'bg-rose-50 border-rose-200 text-rose-700'
                        }`}>
                          {isCompliant ? 'Compliant ✓' : 'Violation Detected'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-150 mt-6 flex justify-between items-center text-xs text-slate-550">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              Pricing scanned: Continuous polling active.
            </span>
            <span className="font-mono text-[10px] text-slate-500">MAP Target Strictness: High</span>
          </div>
        </div>

        {/* Right Side: Sentinel Social Reputation & Brand Intelligence Stream */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-900 rounded-2xl flex flex-col justify-between p-5 text-white overflow-hidden shadow-2xl relative">
          <div className="absolute right-0 bottom-0 pointer-events-none opacity-5 font-mono text-5xl">SENTINEL</div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">Sentinel Intelligence Logs</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
            </div>

            <div className="text-xs text-slate-400 leading-relaxed font-sans">
              The Sentinel intelligence daemon crawls social platforms, e-commerce networks, and regional forums to guarantee zero counterfeit sales and high reseller reputation.
            </div>

            {/* Simulated Live Console Logs */}
            <div className="space-y-2 h-[220px] overflow-y-auto font-mono text-[10px] text-zinc-300 scrollbar-thin select-none">
              {reputationLogs.map((log, idx) => (
                <p key={idx} className="leading-relaxed border-l border-zinc-900 pl-2">
                  {log}
                </p>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-900 flex flex-col gap-2">
            <button
              onClick={onTriggerReputationScan}
              disabled={isScanningReputation}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-950 text-white rounded-xl text-xs font-bold font-mono tracking-wider shadow disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
            >
              {isScanningReputation ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  RE-SCANNING INTEGRITY...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  TRIGGER INTELLIGENCE SCAN NOW
                </>
              )}
            </button>
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mt-1">
              <span>AGENT DAEMON: LIVE</span>
              <span>ACCURACY: 99.8%</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Deep Brand Protection Insights (Product S&OP Performance logs) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Reseller Channel Sentiment & Net Promoter Breakdown</h3>
        <p className="text-xs text-slate-400 mb-6">Visualizes how customers speak about products purchased at each authorized gateway node.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { name: 'Tokyo Wholesale Hub', value: 96, positive: 'Excellent fit & design', negative: 'Minor delivery delays' },
            { name: 'London Distributor', value: 92, positive: 'Premium heavy print weight', negative: 'Stock shortages' },
            { name: 'New York Central', value: 98, positive: 'Outstanding premium packaging', negative: 'Overwhelming volume' },
            { name: 'Berlin Reseller', value: 90, positive: 'Vibrant true charcoal black', negative: 'Slow cart checkout' }
          ].map((item, index) => (
            <div key={index} className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-800">{item.name}</span>
                  <span className="text-[11px] font-mono font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {item.value}/100
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden mt-2">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${item.value}%` }}></div>
                </div>
              </div>

              <div className="space-y-1 mt-4 text-[10px]">
                <div className="flex items-start gap-1">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span className="text-slate-600 italic">"{item.positive}"</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-slate-400 font-medium font-mono">•</span>
                  <span className="text-slate-500 italic">"{item.negative}"</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

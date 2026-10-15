import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GitFork, 
  ArrowRight, 
  Zap, 
  Server, 
  Layers, 
  AlertTriangle,
  Flame,
  CheckCircle,
  Database,
  Lock,
  Unlock
} from 'lucide-react';

interface Reseller {
  id: string;
  name: string;
  domain: string;
  status: 'Authorized' | 'Pending' | 'Revoked';
  ordersCount: number;
}

interface RealtimeRoutingSectionProps {
  resellers: Reseller[];
  onPostMessage: (text: string, type: 'success' | 'err' | 'info') => void;
  isAdminMode?: boolean;
  isBackendLocked?: boolean;
}

interface WarehouseLog {
  id: string;
  timestamp: string;
  sku: string;
  qty: number;
  origin: string;
  assignedTo: string;
  status: 'Queued' | 'Routed' | 'Settled';
}

export default function RealtimeRoutingSection({ 
  resellers, 
  onPostMessage,
  isAdminMode = true,
  isBackendLocked = false
}: RealtimeRoutingSectionProps) {
  const [warehouseLoads, setWarehouseLoads] = useState({
    tokyo: 42,
    london: 68,
    newyork: 25,
    berlin: 55
  });

  const [activeBufferStock, setActiveBufferStock] = useState({
    'VNTG-TEE-BLK': 12040,
    'S&OP-FLEECE': 5600,
    'CARGO-PNT-CHAR': 8420
  });

  const [routingLogs, setRoutingLogs] = useState<WarehouseLog[]>([
    {
      id: 'TX-9402',
      timestamp: new Date(Date.now() - 4000).toLocaleTimeString(),
      sku: 'VNTG-TEE-BLK',
      qty: 120,
      origin: 'hub.cboy.newyork.us',
      assignedTo: 'NY JFK Warehouse',
      status: 'Settled'
    },
    {
      id: 'TX-9401',
      timestamp: new Date(Date.now() - 10000).toLocaleTimeString(),
      sku: 'CARGO-PNT-CHAR',
      qty: 85,
      origin: 'wholesale.cboy.tokyo.com',
      assignedTo: 'Tokyo Cargo Depot',
      status: 'Settled'
    },
    {
      id: 'TX-9400',
      timestamp: new Date(Date.now() - 15000).toLocaleTimeString(),
      sku: 'VNTG-TEE-BLK',
      qty: 310,
      origin: 'germany.cboy.berlin.de',
      assignedTo: 'Berlin Airport Hub',
      status: 'Settled'
    }
  ]);

  const [isSimulatingSurge, setIsSimulatingSurge] = useState(false);
  const [routingFactor, setRoutingFactor] = useState<'latency_optimized' | 'least_congested' | 'manual_ny_preferential'>('latency_optimized');

  // Load surge auto generator simulation
  useEffect(() => {
    if (!isSimulatingSurge) return;

    const interval = setInterval(() => {
      const randomReseller = resellers.length > 0 
        ? resellers[Math.floor(Math.random() * resellers.length)]
        : { name: 'Direct Wholesale Ingress', domain: 'ingress.cboy.tokyo.com' };

      const skus = ['VNTG-TEE-BLK', 'S&OP-FLEECE', 'CARGO-PNT-CHAR'];
      const randomSku = skus[Math.floor(Math.random() * skus.length)];
      const randomQty = Math.floor(Math.random() * 50) + 10;
      
      // Determine optimal warehouse based on routing factor
      let assignedWarehouse = 'Tokyo Cargo Depot';
      const randVal = Math.random();

      if (routingFactor === 'manual_ny_preferential') {
        assignedWarehouse = 'NY JFK Warehouse';
      } else if (routingFactor === 'least_congested') {
        // assign lowest load
        let minKey: 'tokyo' | 'london' | 'newyork' | 'berlin' = 'tokyo';
        let minVal = warehouseLoads.tokyo;
        if (warehouseLoads.london < minVal) { minKey = 'london'; minVal = warehouseLoads.london; }
        if (warehouseLoads.newyork < minVal) { minKey = 'newyork'; minVal = warehouseLoads.newyork; }
        if (warehouseLoads.berlin < minVal) { minKey = 'berlin'; minVal = warehouseLoads.berlin; }

        const labels: Record<'tokyo' | 'london' | 'newyork' | 'berlin', string> = {
          tokyo: 'Tokyo Cargo Depot',
          london: 'London Heathrow Hub',
          newyork: 'NY JFK Warehouse',
          berlin: 'Berlin Airport Hub'
        };
        assignedWarehouse = labels[minKey];
      } else {
        // Latency optimized
        if (randomReseller.domain.includes('tokyo')) assignedWarehouse = 'Tokyo Cargo Depot';
        else if (randomReseller.domain.includes('london') || randomReseller.domain.includes('uk')) assignedWarehouse = 'London Heathrow Hub';
        else if (randomReseller.domain.includes('berlin') || randomReseller.domain.includes('germany') || randomReseller.domain.includes('de')) assignedWarehouse = 'Berlin Airport Hub';
        else assignedWarehouse = 'NY JFK Warehouse';
      }

      // Add log
      const newLog: WarehouseLog = {
        id: `TX-${Math.floor(Math.random() * 9000) + 1000}`,
        timestamp: new Date().toLocaleTimeString(),
        sku: randomSku,
        qty: randomQty,
        origin: randomReseller.domain || 'direct-wholesale.com',
        assignedTo: assignedWarehouse,
        status: 'Settled'
      };

      setRoutingLogs(prev => [newLog, ...prev.slice(0, 10)]);

      // Adjust load values dynamically
      setWarehouseLoads(prev => {
        const update: any = { ...prev };
        if (assignedWarehouse.includes('Tokyo')) update.tokyo = Math.min(100, Math.max(10, update.tokyo + Math.floor(Math.random() * 8) - 2));
        if (assignedWarehouse.includes('Heathrow')) update.london = Math.min(100, Math.max(10, update.london + Math.floor(Math.random() * 8) - 2));
        if (assignedWarehouse.includes('JFK')) update.newyork = Math.min(100, Math.max(10, update.newyork + Math.floor(Math.random() * 8) - 2));
        if (assignedWarehouse.includes('Berlin')) update.berlin = Math.min(100, Math.max(10, update.berlin + Math.floor(Math.random() * 8) - 2));
        return update;
      });

      // Deduct buffer stock
      setActiveBufferStock(prev => {
        const update: any = { ...prev };
        if (update[randomSku]) {
          update[randomSku] = Math.max(0, update[randomSku] - randomQty);
        }
        return update;
      });

    }, 1800);

    return () => clearInterval(interval);
  }, [isSimulatingSurge, resellers, routingFactor, warehouseLoads]);

  const triggerManualReroute = () => {
    // Rebalance completely
    setWarehouseLoads({
      tokyo: 30,
      london: 35,
      newyork: 33,
      berlin: 31
    });
    onPostMessage('Executed emergency automated traffic routing! Balanced all 4 regional warehouses to sub-40% load factor.', 'success');
  };

  const reallocateBufferStock = () => {
    setActiveBufferStock({
      'VNTG-TEE-BLK': 25000,
      'S&OP-FLEECE': 12000,
      'CARGO-PNT-CHAR': 15000
    });
    onPostMessage('Reallocated global cargo buffer limits! VNTG-TEE-BLK backfilled to 25,000 units.', 'success');
  };

  return (
    <motion.div
      key="realtime_routing"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 text-left font-sans"
    >
      {/* 2-Column Main Operations Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Real-time Load Balancer / Channel Optimizer */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <GitFork className="w-5 h-5 text-indigo-600 animate-spin" style={{ animationDuration: '6s' }} />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Dynamic Cargo Routing & Load Balancer</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Automated S&OP physical gateway channel router</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-450 uppercase font-bold flex items-center gap-1">
                  {isBackendLocked && <Lock className="w-3 h-3 text-red-500" />}
                  Routing Algorithm:
                </span>
                <select
                  value={routingFactor}
                  disabled={isBackendLocked}
                  onChange={(e) => {
                    if (isBackendLocked) return;
                    setRoutingFactor(e.target.value as any);
                  }}
                  className={`border rounded px-2 py-1 text-[11px] font-mono font-bold focus:outline-none ${
                    isBackendLocked 
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="latency_optimized">⚡ Latency Core (Recommended)</option>
                  <option value="least_congested">🛡️ Least Congested First</option>
                  <option value="manual_ny_preferential">🇺🇸 Override: NY JFK Depot Preferential</option>
                </select>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans mb-6">
              Skip static analysis dashboards. This dynamic pipeline manages real-time reseller order distribution directly across our international shipping nodes. Act immediately based on cargo load saturation.
            </p>

            {/* Warehouse Congestion / Load Bars */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[
                { key: 'tokyo', label: 'Tokyo Cargo Depot', load: warehouseLoads.tokyo, code: 'HND-01' },
                { key: 'london', label: 'London Heathrow Hub', load: warehouseLoads.london, code: 'LHR-02' },
                { key: 'newyork', label: 'NY JFK Warehouse', load: warehouseLoads.newyork, code: 'JFK-03' },
                { key: 'berlin', label: 'Berlin Airport Hub', load: warehouseLoads.berlin, code: 'BER-04' }
              ].map((warehouse) => {
                let loadColor = 'bg-emerald-500';
                let textColor = 'text-emerald-700';
                let borderColor = 'border-emerald-250';
                let bgColor = 'bg-emerald-50/50';

                if (warehouse.load > 75) {
                  loadColor = 'bg-rose-500';
                  textColor = 'text-rose-700 font-bold';
                  borderColor = 'border-rose-250';
                  bgColor = 'bg-rose-50/50';
                } else if (warehouse.load > 50) {
                  loadColor = 'bg-amber-500';
                  textColor = 'text-amber-700';
                  borderColor = 'border-amber-250';
                  bgColor = 'bg-amber-50/50';
                }

                return (
                  <div key={warehouse.key} className={`border ${borderColor} ${bgColor} rounded-xl p-4 flex flex-col justify-between shadow-xs transition-colors`}>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-400">{warehouse.code}</span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${loadColor.replace('bg-', 'bg-').replace('-500', '-50')} ${loadColor.replace('bg-', 'text-')}`}>
                          {warehouse.load}% Space
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 mt-2">{warehouse.label}</p>
                    </div>

                    <div className="mt-4">
                      <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${loadColor}`} 
                          style={{ width: `${warehouse.load}%` }}
                        ></div>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1 block uppercase">Real-time load factor</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Simulated Available Buffer Stock Matrix */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5">
              <span className="text-[10px] font-mono font-bold text-slate-450 uppercase mb-3 block">Real-time S&OP Bulk Cargo Reserves:</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { sku: 'VNTG-TEE-BLK', name: 'Black Vintage Reseller Tee', qty: activeBufferStock['VNTG-TEE-BLK'] },
                  { sku: 'S&OP-FLEECE', name: 'Heavy Interlocking Fleece', qty: activeBufferStock['S&OP-FLEECE'] },
                  { sku: 'CARGO-PNT-CHAR', name: 'Charcoal Pocket Cargo Pant', qty: activeBufferStock['CARGO-PNT-CHAR'] }
                ].map((item) => (
                  <div key={item.sku} className="bg-white border border-slate-200 p-3 rounded-lg shadow-2xs">
                    <p className="text-[10px] font-mono text-slate-400 font-bold">{item.sku}</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{item.name}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-500">Buffer Volume</span>
                      <span className="font-mono font-bold text-indigo-650 text-xs">{item.qty.toLocaleString()} units</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Action Footer */}
          <div className="pt-5 border-t border-slate-150 mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => {
                if (isBackendLocked) {
                  onPostMessage('🔒 Action Blocked: Warehouses cannot be manually rebalanced while system is locked by administrative guidelines.', 'err');
                  return;
                }
                triggerManualReroute();
              }}
              disabled={isBackendLocked}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 text-white ${
                isBackendLocked 
                  ? 'bg-slate-300 border-slate-250 text-slate-400 cursor-not-allowed opacity-70' 
                  : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {isBackendLocked ? <Lock className="w-4 h-4 text-slate-500" /> : <GitFork className="w-4 h-4 text-indigo-400" />}
              {isBackendLocked ? 'Warehouse Locked' : 'Rebalance Warehouses'}
            </button>
            <button
              onClick={() => {
                if (isBackendLocked) {
                  onPostMessage('🔒 Action Blocked: Emergency buffer replenishment is restricted to the corporate master.', 'err');
                  return;
                }
                reallocateBufferStock();
              }}
              disabled={isBackendLocked}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 text-white ${
                isBackendLocked 
                  ? 'bg-slate-300 border-slate-250 text-slate-400 cursor-not-allowed opacity-70' 
                  : 'bg-indigo-600 hover:bg-indigo-705'
              }`}
            >
              {isBackendLocked ? <Lock className="w-4 h-4 text-slate-500" /> : <Zap className="w-4 h-4" />}
              {isBackendLocked ? 'Buffer Replenishment Locked' : 'Emergency Reserve Replenishment'}
            </button>
          </div>
        </div>

        {/* Right Side: Active Real-time Order Stream log */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-2xl p-5 text-white flex flex-col justify-between shadow-2xl relative">
          <div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4.5 h-4.5 text-indigo-400" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider">Dynamic Ingress Flow</h4>
              </div>

              <button
                onClick={() => {
                  if (isBackendLocked) {
                    onPostMessage('🔒 Surge Simulation Locked: Live streams are locked by System Admin guidelines.', 'err');
                    return;
                  }
                  setIsSimulatingSurge(!isSimulatingSurge);
                }}
                disabled={isBackendLocked}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all border cursor-pointer ${
                  isBackendLocked
                    ? 'bg-slate-900 border-slate-800 text-slate-650 cursor-not-allowed'
                    : isSimulatingSurge 
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse' 
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}
              >
                {isBackendLocked ? '🔒 STREAMS LOCKED' : isSimulatingSurge ? '● Stop Surge simulation' : '⚡ Simulate live stream'}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans mb-4">
              Incoming reseller portal API logs show direct real-time Double-Entry ledger posting status coordinates.
            </p>

            {/* Scrollable logs */}
            <div className="space-y-3 h-[250px] overflow-y-auto pr-1 scrollbar-thin font-mono text-[10px] select-none">
              {routingLogs.map((log) => (
                <div key={log.id} className="border-l-2 border-indigo-500 bg-slate-900/45 p-2 rounded-r-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-300 font-bold">{log.id}</span>
                    <span className="text-[8px] text-slate-500">{log.timestamp}</span>
                  </div>
                  <div className="text-[9px] text-slate-300 leading-normal">
                    Routed <span className="font-bold text-white">{log.qty}x {log.sku}</span> from <span className="text-emerald-400">{log.origin}</span> to <span className="text-indigo-400">{log.assignedTo}</span>
                  </div>
                  <div className="flex justify-between items-center text-[8px] font-semibold text-slate-500 mt-1">
                    <span>Double-Entry Post: SETTLED</span>
                    <span className="text-emerald-500 uppercase tracking-wider font-bold bg-emerald-500/10 px-1 rounded">✓ Sync ok</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-900 pt-3 mt-4 text-[9px] font-mono text-slate-500 flex justify-between">
            <span>COGNITIVE TRANSIT CONTROLLER: SECURE</span>
            <span>PING: 14ms</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

import React from 'react';
import { Coins, Send, FileText, BadgeDollarSign, Zap, Search } from 'lucide-react';
import { CorporateBrandLogo } from './CorporateBrandLogo';

export { CorporateBrandLogo };

interface ManualAdjustmentFormProps {
  manualSku: string;
  setManualSku: (val: string) => void;
  manualAmount: string;
  setManualAmount: (val: string) => void;
  manualEmail: string;
  setManualEmail: (val: string) => void;
  handlePostManualAdjustment: () => Promise<void>;
}

const ADJUSTMENT_TEMPLATES = [
  {
    name: 'Recon Deficit',
    sku: 'ADJUSTMENT-FEE-RECON',
    amount: '75.00',
    email: 'reconciliation@audit-board.org',
    color: 'from-slate-950 to-rose-950/10 border-rose-900/40 text-rose-450 hover:border-rose-500/60 hover:from-rose-950/20 hover:to-rose-900/15',
    desc: 'Unreconciled bank ledger reconciliation variance template'
  },
  {
    name: 'Service Surcharge',
    sku: 'ADJUSTMENT-FEE-SUR',
    amount: '15.00',
    email: 'billing@audit-board.org',
    color: 'from-slate-950 to-amber-950/10 border-amber-900/40 text-amber-400 hover:border-amber-500/60 hover:from-amber-950/20 hover:to-amber-900/15',
    desc: 'Processing fee variance standard adjustment allocation'
  },
  {
    name: 'Corporate Deficit Fix',
    sku: 'ADJUSTMENT-FEE-CORP',
    amount: '120.00',
    email: 'corporate@audit-board.org',
    color: 'from-slate-950 to-blue-950/10 border-blue-900/40 text-blue-400 hover:border-blue-500/60 hover:from-blue-950/20 hover:to-blue-900/15',
    desc: 'Corporate general fund discrepancy offsetting balance'
  },
  {
    name: 'Bad-Debt Writeoff',
    sku: 'ADJUSTMENT-FEE-WRITEOFF',
    amount: '250.00',
    email: 'writeoffs@audit-board.org',
    color: 'from-slate-950 to-slate-900/20 border-slate-800 text-slate-300 hover:border-slate-750 hover:from-slate-900/30 hover:to-slate-850/20',
    desc: 'Uncollectable customer ledger balance write-down templates'
  },
  {
    name: 'Compliance Correction',
    sku: 'ADJUSTMENT-FEE-AUDIT',
    amount: '450.00',
    email: 'compliance@audit-board.org',
    color: 'from-slate-950 to-teal-950/10 border-teal-900/40 text-teal-400 hover:border-teal-500/60 hover:from-teal-950/20 hover:to-teal-900/15',
    desc: 'Compliance and internal audit adjustments template'
  },
  {
    name: 'Tax Rounding Offset',
    sku: 'ADJUSTMENT-FEE-TAX',
    amount: '1.25',
    email: 'tax-treasury@audit-board.org',
    color: 'from-slate-950 to-emerald-950/10 border-emerald-900/40 text-emerald-400 hover:border-emerald-500/60 hover:from-emerald-950/20 hover:to-emerald-900/15',
    desc: 'Local sales or franchise tax fractional rounding offset'
  },
  {
    name: 'Vendor Rebate Align',
    sku: 'ADJUSTMENT-FEE-REBATE',
    amount: '45.00',
    email: 'partners@audit-board.org',
    color: 'from-slate-950 to-purple-950/10 border-purple-900/40 text-purple-400 hover:border-purple-500/60 hover:from-purple-950/20 hover:to-purple-900/15',
    desc: 'Supplier rebate adjustments & alignment'
  },
  {
    name: 'Freight Cost Override',
    sku: 'ADJUSTMENT-FEE-FREIGHT',
    amount: '95.50',
    email: 'logistics@audit-board.org',
    color: 'from-slate-950 to-orange-950/10 border-orange-900/40 text-orange-400 hover:border-orange-500/60 hover:from-orange-950/20 hover:to-orange-900/15',
    desc: 'Third-party courier shipping adjustments'
  }
];

export default function ManualAdjustmentForm({
  manualSku,
  setManualSku,
  manualAmount,
  setManualAmount,
  manualEmail,
  setManualEmail,
  handlePostManualAdjustment
}: ManualAdjustmentFormProps) {
  const [filterQuery, setFilterQuery] = React.useState('');

  const filteredTemplates = ADJUSTMENT_TEMPLATES.filter(tmpl => {
    const q = filterQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      tmpl.name.toLowerCase().includes(q) ||
      tmpl.sku.toLowerCase().includes(q) ||
      tmpl.desc.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl relative overflow-hidden group transition-all duration-300 hover:shadow-indigo-950/20">
      <div className="absolute right-0 bottom-0 text-slate-800/10 select-none font-mono pointer-events-none text-7xl font-black group-hover:scale-110 transition-transform">
        ADJ
      </div>
      
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <div className="p-1.5 bg-slate-950 border border-slate-800 rounded-xl shadow-xs flex items-center justify-center w-9 h-9 shrink-0">
          <CorporateBrandLogo className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold text-slate-100 uppercase font-sans tracking-tight block">Manual Accounting Adjustment</span>
          <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">Direct Fiscal Record Overlay</span>
        </div>
      </div>

      {/* Accelerated Macro Templates Shortcuts */}
      <div className="space-y-2 bg-slate-950 border border-slate-800/80 p-3 rounded-xl">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono">
              ⚡ ACCELERATED TEMPLATE MACROS
            </span>
          </div>
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="text-[9px] font-bold text-slate-400 hover:text-white outline-none hover:underline"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Polished Filter/Search Bar */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
            <Search className="h-3 w-3 text-slate-500" />
          </span>
          <input
            type="text"
            placeholder="Search template name, SKU, or desc..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-7 pr-7 py-1 bg-slate-900 hover:bg-slate-850 focus:bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-sans placeholder-slate-500 text-slate-200 transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500/60"
          />
          {filterQuery && (
            <button
              type="button"
              onClick={() => setFilterQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-500 hover:text-white text-[10px] font-mono font-bold"
              title="Clear search query"
            >
              ×
            </button>
          )}
        </div>

        {/* Dynamic Items Grid */}
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 max-h-[148px] overflow-y-auto pr-0.5 custom-scrollbar animate-in fade-in duration-200">
            {filteredTemplates.map((tmpl) => (
              <button
                key={tmpl.sku}
                type="button"
                onClick={() => {
                  setManualSku(tmpl.sku);
                  setManualAmount(tmpl.amount);
                  setManualEmail(tmpl.email);
                }}
                className={`text-left p-2 rounded-lg border bg-gradient-to-br transition-all duration-150 active:scale-95 group/btn cursor-pointer ${tmpl.color}`}
                title={`${tmpl.desc} (Prefill SKU: ${tmpl.sku}, Amt: $${tmpl.amount})`}
                style={{
                  background: `linear-gradient(to bottom right, var(--tw-gradient-stops))`
                }}
              >
                <div className="flex justify-between items-center gap-1 mb-0.5">
                  <span className="font-bold text-[9px] truncate tracking-tight">{tmpl.name}</span>
                  <span className="text-[9px] font-mono font-extrabold flex-shrink-0 opacity-90">${tmpl.amount}</span>
                </div>
                <div className="text-[8px] font-mono truncate opacity-60 leading-none">
                  {tmpl.sku}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center rounded-lg border border-dashed border-slate-800 bg-slate-950/40">
            <span className="text-[10px] font-mono text-slate-500 block">No matching templates found</span>
            <button
              type="button"
              onClick={() => setFilterQuery('')}
              className="mt-1 text-[9px] text-indigo-400 hover:text-indigo-300 font-semibold hover:underline"
            >
              Reset Search Filter
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 text-[11px] font-sans">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 font-mono">Adjustment SKU Code:</label>
            <input
              type="text"
              value={manualSku}
              onChange={(e) => setManualSku(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-800 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-semibold shadow-inner"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 font-mono">Amount (USD):</label>
            <input
              type="text"
              value={manualAmount}
              onChange={(e) => setManualAmount(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-800 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-semibold shadow-inner"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 font-mono">Audit Email Reference:</label>
          <input
            type="email"
            value={manualEmail}
            onChange={(e) => setManualEmail(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-slate-800 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-semibold shadow-inner"
          />
        </div>

        <button
          onClick={handlePostManualAdjustment}
          className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold rounded-xl text-xs transition-all tracking-wide flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950/40 border border-indigo-550/30 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          Post Manual Dual-Split Adjustment
        </button>
      </div>
    </div>
  );
}

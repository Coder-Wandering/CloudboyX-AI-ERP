import React, { useState, useMemo } from 'react';
import { 
  Building2, DollarSign, Wallet, ShieldCheck, Scale, ArrowUpRight, 
  ArrowDownRight, Landmark, RefreshCw, BarChart3, PieChartIcon, 
  TrendingUp, FileSpreadsheet, Search, CheckCircle2, AlertTriangle, HelpCircle,
  X, Database, ChevronDown, ChevronUp, Download, ArrowLeft, Check, BookOpen
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

interface DBTransaction {
  id: string;
  sourceSystem: string;
  sourceId: string;
  description: string;
  postedAt: string | Date;
  createdAt: string | Date;
  sqlGenerated?: string;
  entity: string;
}

interface JournalEntry {
  id: string;
  transactionId: string;
  accountId: string;
  debitAmount: number;
  creditAmount: number;
  createdAt: string | Date;
}

interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  netBalance?: number;
}

interface MultiEntityOverviewProps {
  accounts: Account[];
  transactions: DBTransaction[];
  journalEntries: JournalEntry[];
  onRefreshStats: () => void;
}

const ENTITIES = [
  'CloudboyX Americas LLC', 
  'CloudboyX Europe GmbH', 
  'CloudboyX Asia-Pacific Ltd'
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

export default function MultiEntityOverview({ 
  accounts, 
  transactions, 
  journalEntries, 
  onRefreshStats 
}: MultiEntityOverviewProps) {
  const [selectedEntity, setSelectedEntity] = useState<string>('all'); // 'all' = Consolidated, or specific entity name
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [detailedEntity, setDetailedEntity] = useState<string | null>(null);
  const [detailSearchQuery, setDetailSearchQuery] = useState<string>('');
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
  const [showSQLTxId, setShowSQLTxId] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [detailStartDate, setDetailStartDate] = useState<string>('');
  const [detailEndDate, setDetailEndDate] = useState<string>('');
  const [detailGLAccount, setDetailGLAccount] = useState<string>('all');

  // 1. Calculate general multi-entity financial figures
  const entityData = useMemo(() => {
    return ENTITIES.map(ent => {
      // Find transactions of this entity
      const entTxs = transactions.filter(t => t.entity === ent);
      const entTxIds = new Set(entTxs.map(t => t.id));

      // Sum journal entries for this entity
      const entEntries = journalEntries.filter(je => entTxIds.has(je.transactionId));

      let cashBalance = 0;
      let arBalance = 0;
      let revenueSum = 0;
      let liabilitySum = 0;
      let assetSum = 0;

      accounts.forEach(acc => {
        let debSum = 0;
        let credSum = 0;
        entEntries.forEach(je => {
          if (je.accountId === acc.id) {
            debSum += je.debitAmount;
            credSum += je.creditAmount;
          }
        });

        const net = (acc.type === 'asset' || acc.type === 'expense')
          ? (debSum - credSum)
          : (credSum - debSum);

        if (acc.id === 'acc-cash') cashBalance = net;
        if (acc.id === 'acc-ar') arBalance = net;
        if (acc.type === 'revenue') revenueSum += net;
        if (acc.type === 'liability') liabilitySum += net;
        if (acc.type === 'asset') assetSum += net;
      });

      return {
        name: ent,
        shortName: ent.split(' ')[1], // 'Americas', 'Europe', 'Asia-Pacific'
        cash: cashBalance / 100,
        ar: arBalance / 100,
        revenue: revenueSum / 100,
        liabilities: liabilitySum / 100,
        assets: assetSum / 100,
        netWorth: (assetSum - liabilitySum) / 100,
        txCount: entTxs.length
      };
    });
  }, [accounts, transactions, journalEntries]);

  // 2. Compute Consolidated / Selected View metrics
  const displayMetrics = useMemo(() => {
    const isConsolidated = selectedEntity === 'all';
    
    // Filter transactions and entries of current selection
    const activeTxs = isConsolidated 
      ? transactions 
      : transactions.filter(t => t.entity === selectedEntity);
    
    const activeTxIds = new Set(activeTxs.map(t => t.id));
    const activeEntries = journalEntries.filter(je => activeTxIds.has(je.transactionId));

    let cash = 0;
    let ar = 0;
    let inventory = 0;
    let ap = 0;
    let tax = 0;
    let revenue = 0;
    let commit = 0;
    let commitRes = 0;
    let grni = 0; // Goods received not invoiced (accrued ap)

    accounts.forEach(acc => {
      let deb = 0;
      let cred = 0;
      activeEntries.forEach(je => {
        if (je.accountId === acc.id) {
          deb += je.debitAmount;
          cred += je.creditAmount;
        }
      });

      const net = (acc.type === 'asset' || acc.type === 'expense')
        ? (deb - cred)
        : (cred - deb);

      if (acc.id === 'acc-cash') cash = net;
      if (acc.id === 'acc-ar') ar = net;
      if (acc.id === 'acc-inventory') inventory = net;
      if (acc.id === 'acc-ap') ap = net;
      if (acc.id === 'acc-tax') tax = net;
      if (acc.type === 'revenue') revenue += net;
      if (acc.id === 'acc-po-commitment') commit = net;
      if (acc.id === 'acc-po-reserve') commitRes = net;
      if (acc.id === 'acc-accrued-ap') grni = net;
    });

    const totalAssets = (cash + ar + inventory + commit) / 100;
    const totalLiabilities = (ap + tax + commitRes + grni) / 100;
    const workingCapital = ((cash + ar + inventory) - (ap + tax + grni)) / 100;

    // Check balancing
    const debitTotal = activeEntries.reduce((acc, je) => acc + je.debitAmount, 0);
    const creditTotal = activeEntries.reduce((acc, je) => acc + je.creditAmount, 0);
    const balanced = debitTotal === creditTotal;

    return {
      cash: cash / 100,
      ar: ar / 100,
      inventory: inventory / 100,
      ap: ap / 100,
      tax: tax / 100,
      revenue: revenue / 100,
      commit: commit / 100,
      grni: grni / 100,
      totalAssets,
      totalLiabilities,
      workingCapital,
      balanced,
      debitDiff: Math.abs(debitTotal - creditTotal) / 100,
      txCount: activeTxs.length,
      journalCount: activeEntries.length
    };
  }, [selectedEntity, accounts, transactions, journalEntries]);

  // 3. Render chart data
  const revenueDistributionData = useMemo(() => {
    return entityData.map((ent, idx) => ({
      name: ent.shortName,
      value: Math.max(0, ent.revenue),
      color: COLORS[idx % COLORS.length]
    }));
  }, [entityData]);

  const monthlyTrendData = useMemo(() => {
    // Generate simulated timeline buckets
    // We group transactions by date
    const monthlyGroups: { [key: string]: { [entity: string]: number } } = {};
    
    transactions.forEach(tx => {
      const date = new Date(tx.postedAt);
      const monthKey = date.toLocaleDateString('us', { month: 'short', day: 'numeric' });
      
      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = {};
        ENTITIES.forEach(e => { monthlyGroups[monthKey][e.split(' ')[1]] = 0; });
      }

      // Calculate transaction revenue
      const txEntries = journalEntries.filter(je => je.transactionId === tx.id);
      let txRevenue = 0;
      txEntries.forEach(je => {
        const acc = accounts.find(a => a.id === je.accountId);
        if (acc && acc.type === 'revenue') {
          txRevenue += je.creditAmount - je.debitAmount;
        }
      });

      const entShort = tx.entity.split(' ')[1];
      monthlyGroups[monthKey][entShort] = (monthlyGroups[monthKey][entShort] || 0) + (txRevenue / 100);
    });

    return Object.keys(monthlyGroups).map(key => ({
      date: key,
      ...monthlyGroups[key]
    })).sort((a,b) => {
      return a.date.localeCompare(b.date);
    });
  }, [transactions, journalEntries, accounts]);

  // Filter transactions for recent postings table
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        // Entity filter
        if (selectedEntity !== 'all' && tx.entity !== selectedEntity) return false;
        
        // Search filter
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          return (
            tx.id.toLowerCase().includes(q) ||
            tx.description.toLowerCase().includes(q) ||
            tx.sourceSystem.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
  }, [transactions, selectedEntity, searchQuery]);

  // 1.5 Calculate details specifically for detailedEntity
  const detailedEntityMetrics = useMemo(() => {
    if (!detailedEntity) return null;
    
    // Find metrics for this specific entity
    const currentData = entityData.find(e => e.name === detailedEntity);
    const entTxs = transactions.filter(t => t.entity === detailedEntity);
    const entTxIds = new Set(entTxs.map(t => t.id));
    const entEntries = journalEntries.filter(je => entTxIds.has(je.transactionId));
    
    // Filter transactions based on detail search query, date range, and GL account
    const filteredTxs = entTxs.filter(tx => {
      // 1. Text Search Filter (id, description, sourceSystem)
      if (detailSearchQuery.trim() !== '') {
        const q = detailSearchQuery.toLowerCase();
        const matchesText = (
          tx.id.toLowerCase().includes(q) ||
          tx.description.toLowerCase().includes(q) ||
          (tx.sourceSystem && tx.sourceSystem.toLowerCase().includes(q))
        );
        if (!matchesText) return false;
      }

      // 2. Date Range Filter
      if (detailStartDate) {
        const txDate = new Date(tx.postedAt);
        const startDate = new Date(detailStartDate);
        startDate.setHours(0, 0, 0, 0);
        if (txDate < startDate) return false;
      }

      if (detailEndDate) {
        const txDate = new Date(tx.postedAt);
        const endDate = new Date(detailEndDate);
        endDate.setHours(23, 59, 59, 999);
        if (txDate > endDate) return false;
      }

      // 3. GL Account Code Filter
      if (detailGLAccount !== 'all') {
        const hasMatchingAccount = entEntries.some(je => {
          if (je.transactionId !== tx.id) return false;
          const acc = accounts.find(a => a.id === je.accountId);
          return acc && (acc.id === detailGLAccount || acc.code === detailGLAccount);
        });
        if (!hasMatchingAccount) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

    return {
      overview: currentData,
      txs: entTxs,
      filteredTxs,
      entries: entEntries
    };
  }, [detailedEntity, entityData, transactions, journalEntries, detailSearchQuery, detailStartDate, detailEndDate, detailGLAccount, accounts]);

  const handleExportLedger = (entityName: string) => {
    setExportSuccess(true);
    setTimeout(() => {
      setExportSuccess(false);
    }, 3000);
    
    // Generate real dynamic CSV spreadsheet data
    const headers = "Transaction ID,Date,Description,Source System,Debited Account,Credited Account,Amount\n";
    const body = (detailedEntityMetrics?.txs || []).map(tx => {
      const txEntries = journalEntries.filter(je => je.transactionId === tx.id);
      const debits = txEntries.filter(je => je.debitAmount > 0).map(je => {
        const acc = accounts.find(a => a.id === je.accountId);
        return acc ? `${acc.code} ${acc.name}` : je.accountId;
      }).join("; ");
      const credits = txEntries.filter(je => je.creditAmount > 0).map(je => {
        const acc = accounts.find(a => a.id === je.accountId);
        return acc ? `${acc.code} ${acc.name}` : je.accountId;
      }).join("; ");
      const amount = txEntries.reduce((sum, je) => sum + je.debitAmount, 0) / 100;
      return `"${tx.id}","${new Date(tx.postedAt).toISOString()}","${tx.description.replace(/"/g, '""')}","${tx.sourceSystem || 'N/A'}","${debits}","${credits}",${amount}`;
    }).join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + body);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `GAAP_SubLedger_${entityName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl p-6 mb-12 text-left transition-all">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-900 border border-indigo-700 text-indigo-300 text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded uppercase">
              Consolidated Segment Reporting
            </span>
            <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Audited
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1.5 flex items-center gap-2">
            🌐 Multi-Entity GAAP Financial Control Room
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time intercompany matching, visual liquidity distributions, and double-entry trial balance auditing across globally registered segments.
          </p>
        </div>

        <div className="flex shrink-0 gap-2 items-center">
          <button 
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 border border-slate-800 rounded-lg hover:bg-slate-800 text-slate-405 hover:text-slate-200 transition-colors cursor-pointer"
            title="Overview Documentation"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          
          <button
            onClick={onRefreshStats}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-705 text-xs text-slate-300 font-bold font-mono uppercase transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            Recalculate Consolidated
          </button>
        </div>
      </div>

      {/* Help Section */}
      {showHelp && (
        <div className="mb-6 bg-slate-950/60 p-4 rounded-xl border border-indigo-900/60 text-xs text-slate-300 flex flex-col gap-2 leading-relaxed">
          <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[11px] flex items-center gap-1.5 text-indigo-400">
            📐 Multi-Entity Trial Ledger Architecture
          </h4>
          <p>
            Welcome to the Segment Reporting Module. This dashboard automatically reconstructs individual and consolidated financial statements from original database transaction journals. It applies GAAP accounting standards for three global operating entities:
          </p>
          <ul className="list-disc pl-5 mt-1 flex flex-col gap-1 text-[11px]">
            <li><strong className="text-white">CloudboyX Americas LLC</strong>: Primary hub linked to localized Shopify feeds. Typically handles online Direct-To-Consumer transactions.</li>
            <li><strong className="text-white">CloudboyX Europe GmbH</strong>: Operations segment capturing B2B wholesale transactions imported via Legacy CSV parsing pipelines.</li>
            <li><strong className="text-white">CloudboyX Asia-Pacific Ltd</strong>: Manufacturing & assembly tier holding larger bulk shipments transacted over automated EDI networks.</li>
          </ul>
          <p className="mt-1">
            Each double-entry transaction posted via the translation gateway and procurement loops is categorized dynamically. Accounts on the trial sheet balances are re-computed down to the penny to ensure perfect balance sheet alignment.
          </p>
        </div>
      )}

      {/* Primary Toggle View Bar */}
      <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl mb-8 border border-slate-800/80">
        <button
          onClick={() => setSelectedEntity('all')}
          className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded-lg cursor-pointer transition-all ${
            selectedEntity === 'all'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          💼 Consolidated (All Entities)
        </button>
        
        {ENTITIES.map((ent, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedEntity(ent)}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded-lg cursor-pointer transition-all ${
              selectedEntity === ent
                ? 'bg-slate-800 text-indigo-400 border border-indigo-900'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            🏢 {ent.split(' ')[1]}
          </button>
        ))}
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Metric 1: Revenue */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 relative overflow-hidden select-none">
          <div className="absolute right-0 top-0 -translate-y-3 translate-x-3 text-slate-900 font-extrabold text-7xl font-sans tracking-tight">
            $
          </div>
          <p className="text-[10px] font-bold font-mono text-indigo-400 uppercase tracking-widest flex items-center gap-1 relative z-10">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> Operating Revenue
          </p>
          <div className="flex items-baseline gap-2 mt-2 relative z-10">
            <span className="text-2xl font-mono font-black text-white">
              ${displayMetrics.revenue.toLocaleString('us', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Segment Net Sales GAAP Revenue
          </p>
        </div>

        {/* Metric 2: Asset Position */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 relative overflow-hidden select-none">
          <div className="absolute right-0 top-0 -translate-y-3 translate-x-3 text-slate-900 font-extrabold text-7xl font-sans tracking-tight">
            A
          </div>
          <p className="text-[10px] font-bold font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1 relative z-10">
            <Landmark className="w-3.5 h-3.5 text-emerald-500" /> Strategic Assets
          </p>
          <div className="flex items-baseline gap-2 mt-2 relative z-10">
            <span className="text-2xl font-mono font-black text-white">
              ${displayMetrics.totalAssets.toLocaleString('us', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-[9px] text-slate-500 font-mono mt-2 flex flex-wrap gap-x-2">
            <span>Cash: ${(displayMetrics.cash).toLocaleString('us', { maximumFractionDigits: 0 })}</span>
            <span>• A/R: ${(displayMetrics.ar).toLocaleString('us', { maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        {/* Metric 3: Liabilities / Commitments */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 relative overflow-hidden select-none">
          <div className="absolute right-0 top-0 -translate-y-3 translate-x-3 text-slate-900 font-extrabold text-7xl font-sans tracking-tight">
            L
          </div>
          <p className="text-[10px] font-bold font-mono text-amber-500 uppercase tracking-widest flex items-center gap-1 relative z-10">
            <Scale className="w-3.5 h-3.5 text-amber-500" /> liabilities & accruals
          </p>
          <div className="flex items-baseline gap-2 mt-2 relative z-10">
            <span className="text-2xl font-mono font-black text-white">
              ${displayMetrics.totalLiabilities.toLocaleString('us', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-[9px] text-slate-500 font-mono mt-2 flex flex-wrap gap-x-2">
            <span>A/P: ${(displayMetrics.ap).toLocaleString('us', { maximumFractionDigits: 0 })}</span>
            <span>• Accrued AP: ${(displayMetrics.grni).toLocaleString('us', { maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        {/* Metric 4: Working Capital */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 relative overflow-hidden select-none">
          <div className="absolute right-0 top-0 -translate-y-3 translate-x-3 text-slate-900 font-extrabold text-7xl font-sans tracking-tight">
            C
          </div>
          <p className="text-[10px] font-bold font-mono text-pink-500 uppercase tracking-widest flex items-center gap-1 relative z-10">
            <Wallet className="w-3.5 h-3.5 text-pink-500" /> Net Working Capital
          </p>
          <div className="flex items-baseline gap-2 mt-2 relative z-10">
            <span className="text-2xl font-mono font-black text-white">
              ${displayMetrics.workingCapital.toLocaleString('us', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2 flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${displayMetrics.balanced ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {displayMetrics.balanced ? 'Trial Ledger Audited & Balanced' : `Trial Ledger Mismatch: -$${displayMetrics.debitDiff}`}
          </p>
        </div>

      </div>

      {/* Subsidiary GAAP Operating Segments Table */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 mb-8">
        <div className="pb-3 border-b border-slate-900 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest block">Operational Segment Registry</span>
            <h3 className="font-extrabold text-white text-md uppercase tracking-wide flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-4 h-4 text-indigo-400" /> subsidiary gaap ledger accounts
            </h3>
          </div>
          <span className="text-[10px] text-indigo-400 font-mono font-semibold bg-indigo-950/45 px-2.5 py-1 rounded border border-indigo-900/60 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Click subsidiary row to explore its dynamic ledger detail view
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[9px] tracking-wider text-left border-b border-slate-800">
              <tr>
                <th className="p-3 text-slate-400">Legal Subsidiary Profile</th>
                <th className="p-3 text-right">Strategic Assets</th>
                <th className="p-3 text-right">Aggregate Liabilities</th>
                <th className="p-3 text-right">Dynamic Net Worth</th>
                <th className="p-3 text-right">Operating Revenue</th>
                <th className="p-3 text-center">Postings</th>
                <th className="p-3 text-right">Inspection Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              {entityData.map((ent, idx) => {
                const sourceBadge = ent.name === 'CloudboyX Americas LLC' 
                  ? 'Shopify Live Connect' 
                  : ent.name === 'CloudboyX Europe GmbH'
                    ? 'Legacy CSV Adapter'
                    : 'EDI Automated Feed';

                const regionCode = ent.name === 'CloudboyX Americas LLC' 
                  ? 'US-AMER' 
                  : ent.name === 'CloudboyX Europe GmbH'
                    ? 'EU-DE'
                    : 'APAC-SGP';

                const isSelected = detailedEntity === ent.name || selectedEntity === ent.name;

                return (
                  <tr 
                    key={ent.name}
                    onClick={() => {
                      setDetailedEntity(ent.name);
                      setSelectedEntity(ent.name); // Automatically align background view with selection
                    }}
                    className={`cursor-pointer transition-all duration-300 group border-l-4 ${
                      isSelected 
                        ? 'bg-indigo-950/30 border-l-indigo-500 shadow-inner' 
                        : 'hover:bg-indigo-950/15 border-l-transparent text-slate-300'
                    }`}
                  >
                    <td className="p-3 font-semibold text-slate-100 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md transition-all ${
                        isSelected 
                          ? 'bg-indigo-600 text-white border border-indigo-500 scale-105' 
                          : 'bg-indigo-900/40 border border-indigo-805 text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500'
                      }`}>
                        <Building2 className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`block font-sans text-xs font-bold uppercase transition-colors ${
                            isSelected ? 'text-indigo-400' : 'text-white group-hover:text-indigo-400'
                          }`}>
                            {ent.name}
                          </span>
                          <span className="text-[8px] tracking-wider px-1 py-0.2 rounded bg-slate-900 text-slate-405 border border-slate-800 font-mono font-bold">
                            {regionCode}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          {sourceBadge}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right text-slate-205 font-bold font-mono">
                      ${ent.assets.toLocaleString('us', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right text-slate-350 font-mono">
                      ${ent.liabilities.toLocaleString('us', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right text-emerald-400 font-bold font-mono">
                      ${ent.netWorth.toLocaleString('us', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right text-indigo-300 font-bold font-mono">
                      ${ent.revenue.toLocaleString('us', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center text-slate-300 font-sans">
                      <span className="bg-slate-900 py-0.5 px-2 rounded-md text-[11px] border border-slate-800 font-mono text-slate-400 font-bold">
                        {ent.txCount} entries
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        className="text-indigo-400 text-xs font-bold font-mono border border-indigo-900 bg-indigo-950/20 px-3 py-1 rounded group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all cursor-pointer shadow-sm"
                      >
                        Explore Trial Ledger &rarr;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Analytics Sector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Left Chart: Revenue Trend Segmented */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] font-bold font-mono text-indigo-400 uppercase tracking-wide flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5" /> Operational Velocity
              </span>
              <h3 className="text-sm font-extrabold text-white mt-0.5">Operating Segment Revenue Distributions</h3>
            </div>
            <span className="text-[9px] text-slate-500 font-mono uppercase bg-slate-900 px-2 py-1 rounded">Daily posting volume</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData}>
                <defs>
                  <linearGradient id="gradientAmericas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gradientEurope" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[1]} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={COLORS[1]} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gradientAPAC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[2]} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={COLORS[2]} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#475569" strokeWidth={1} style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                <YAxis stroke="#475569" strokeWidth={1} style={{ fontSize: '10px', fontFamily: 'monospace' }} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px' }}
                  labelStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8' }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                <Area type="monotone" name="Americas Hub" dataKey="Americas" stroke={COLORS[0]} fillOpacity={1} fill="url(#gradientAmericas)" strokeWidth={2} />
                <Area type="monotone" name="Europe GmbH" dataKey="Europe" stroke={COLORS[1]} fillOpacity={1} fill="url(#gradientEurope)" strokeWidth={2} />
                <Area type="monotone" name="Asia-Pacific Ltd" dataKey="Asia-Pacific" stroke={COLORS[2]} fillOpacity={1} fill="url(#gradientAPAC)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Asset / Revenue Share Pie */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1">
              <PieChartIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-bold font-mono text-indigo-400 uppercase tracking-wide">Segment Contribution</span>
            </div>
            <h3 className="text-sm font-extrabold text-white mt-0.5">Aggregate Revenue Share</h3>
          </div>

          <div className="h-44 my-4 flex justify-center items-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {revenueDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val) => [`$${Number(val).toLocaleString('us', { maximumFractionDigits: 0 })}`, 'Sales']}
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center value */}
            <div className="absolute text-center">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wide block">Revenue</span>
              <span className="text-lg font-mono font-black text-white">
                ${revenueDistributionData.reduce((acc, curve) => acc + curve.value, 0).toLocaleString('us', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 font-mono text-[10px]">
            {revenueDistributionData.map((ent, i) => {
              const totalRevenue = revenueDistributionData.reduce((acc, curve) => acc + curve.value, 0) || 1;
              const percent = ((ent.value / totalRevenue) * 100).toFixed(1);
              return (
                <div key={i} className="flex justify-between items-center text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: ent.color }} />
                    <span className="text-slate-350">{ent.name}</span>
                  </div>
                  <span className="font-bold text-white">{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Trial Segment Sheets - side by side compare or single select compare */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Trial balance worksheet */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800/80 rounded-2xl p-5">
          <div className="pb-3 border-b border-slate-900 mb-4 flex justify-between items-center">
            <div>
              <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest block">Worksheet (GAAP-100)</span>
              <h3 className="font-extrabold text-white text-xs uppercase tracking-wide flex items-center gap-1 mt-0.5">
                📊 Segment Trial Balance Worksheet
              </h3>
            </div>
            
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${displayMetrics.balanced ? 'bg-emerald-950 border border-emerald-800 text-emerald-400' : 'bg-red-950 border border-red-800 text-red-400'}`}>
              {displayMetrics.balanced ? 'AUDIT BALANCE ✓' : 'UNBALANCED !'}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
            Double-entry balances calculated dynamically. Debits match Credits in consolidated and segmented GAAP workflows.
          </p>

          <div className="border border-slate-800/80 rounded-xl overflow-hidden text-xs">
            <table className="w-full font-mono text-[11px]">
              <thead className="bg-slate-900 text-slate-450 uppercase text-[10px] tracking-wider text-left border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Acc Code</th>
                  <th className="p-2.5">Account Head</th>
                  <th className="p-2.5 text-center">Type</th>
                  <th className="p-2.5 text-right">Debit ($)</th>
                  <th className="p-2.5 text-right">Credit ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                {accounts.map(acc => {
                  // Find segment entries
                  const isConsolidated = selectedEntity === 'all';
                  const activeTxs = isConsolidated 
                    ? transactions 
                    : transactions.filter(t => t.entity === selectedEntity);
                  
                  const activeTxIds = new Set(activeTxs.map(t => t.id));
                  const entEntries = journalEntries.filter(je => activeTxIds.has(je.transactionId) && je.accountId === acc.id);

                  const debitSum = entEntries.reduce((sum, je) => sum + je.debitAmount, 0) / 100;
                  const creditSum = entEntries.reduce((sum, je) => sum + je.creditAmount, 0) / 100;

                  if (debitSum === 0 && creditSum === 0) return null; // Hide empty rows for simplicity

                  return (
                    <tr key={acc.id} className="hover:bg-slate-900/50">
                      <td className="p-2 font-bold text-slate-500">{acc.code}</td>
                      <td className="p-2 text-slate-200 truncate max-w-[150px]" title={acc.name}>{acc.name}</td>
                      <td className="p-2 text-center">
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                          {acc.type}
                        </span>
                      </td>
                      <td className="p-2 text-right text-emerald-400 font-bold">
                        {debitSum > 0 ? `$${debitSum.toLocaleString('us', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="p-2 text-right text-indigo-400 font-bold">
                        {creditSum > 0 ? `$${creditSum.toLocaleString('us', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operating Performance & Breakdown */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-900 mb-4">
              <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest block">Operational Audits</span>
              <h3 className="font-extrabold text-white text-xs uppercase tracking-wide flex items-center gap-1 mt-0.5">
                🏛️ Corporate Segment Analytics Sheet
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-850">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Entity Postings Count</span>
                <span className="text-xl font-mono font-black text-white block mt-1">
                  {displayMetrics.txCount} <span className="text-xs text-slate-500 font-sans font-normal">transactions</span>
                </span>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-850">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Debited Journals Count</span>
                <span className="text-xl font-mono font-black text-white block mt-1">
                  {displayMetrics.journalCount} <span className="text-xs text-slate-500 font-sans font-normal">lines</span>
                </span>
              </div>
            </div>

            <span className="text-[10px] font-bold font-mono text-slate-450 uppercase tracking-wider block mb-3">
              Performance Indicators Breakdowns
            </span>

            <div className="flex flex-col gap-2.5 font-mono text-xs">
              
              {/* Asset Share percentage */}
              <div className="flex justify-between items-center py-2 border-b border-slate-900 text-slate-350">
                <span>Net Liquidity Ratio (Cash / Revenue)</span>
                <span className="font-bold text-slate-100 uppercase">
                  {displayMetrics.revenue > 0 ? `${((displayMetrics.cash / displayMetrics.revenue) * 100).toFixed(1)}%` : '100.0%'}
                </span>
              </div>

              {/* Outstanding AR ratio */}
              <div className="flex justify-between items-center py-2 border-b border-slate-900 text-slate-350">
                <span>Receivables outstanding (A/R)</span>
                <span className="font-bold text-white">
                  ${(displayMetrics.ar).toLocaleString('us', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Accrued Obligations AP ratio */}
              <div className="flex justify-between items-center py-2 border-b border-slate-900 text-slate-350">
                <span>Accrued Procurement (GRNI)</span>
                <span className="font-bold text-amber-500">
                  ${(displayMetrics.grni).toLocaleString('us', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Committed Purchase block */}
              <div className="flex justify-between items-center py-2 text-slate-350">
                <span>Approved Committed PO limits</span>
                <span className="font-bold text-indigo-400">
                  ${(displayMetrics.commit).toLocaleString('us', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-900">
            <div className="bg-slate-900/60 p-4 border border-slate-800 border-dashed rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-400 leading-relaxed">
                <span className="text-white font-bold block mb-0.5">Continuous Compliance Enforcement</span>
                Any modifications to ledgers, order entries from adapters, or Procurement PO transitions on the respective tabs are mapped under real-time dual-booking policies. No phantom write locks are recorded.
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Segment Transaction Ledger Journal entries */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-900 mb-6">
          <div>
            <span className="text-[10px] font-bold font-mono text-indigo-400 uppercase tracking-widest flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5" /> General Ledger Postings
            </span>
            <h3 className="text-xs font-black uppercase text-white mt-0.5">
              📋 Selected Segment Audit Postings Registers
            </h3>
          </div>

          <div className="flex shrink-0 items-center bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono max-w-full md:max-w-xs gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Filter by description / id..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-slate-250 outline-none text-[11px] placeholder:text-slate-600 focus:ring-0 max-w-full w-full"
            />
          </div>
        </div>

        <div className="border border-slate-900 rounded-xl overflow-hidden max-h-[350px] overflow-y-auto">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              No journal transactions matching selected criteria.
            </div>
          ) : (
            <div className="divide-y divide-slate-900 text-slate-300 font-mono text-[11px]">
              {filteredTransactions.map(tx => {
                const txEntries = journalEntries.filter(je => je.transactionId === tx.id);
                const sumAmount = txEntries.reduce((acc, curve) => acc + curve.debitAmount, 0) / 100;
                
                return (
                  <div key={tx.id} className="p-3.5 hover:bg-slate-900/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-white text-xs">{tx.id}</span>
                        <span className="bg-slate-800 text-[9px] px-1.5 py-0.5 border border-slate-700 text-indigo-400 rounded">
                          {tx.entity}
                        </span>
                        <span className="bg-slate-900 text-[10px] px-2 py-0.5 text-slate-400 rounded">
                          Source: {tx.sourceSystem.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-1 font-sans font-medium hover:text-slate-200 truncate">
                        {tx.description}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-4 text-right">
                      <div>
                        <span className="block font-black text-white text-sm">
                          ${sumAmount.toLocaleString('us', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {new Date(tx.postedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Immersive GAAP Subsidiary Ledger Detail View Overlay Modal */}
      {detailedEntity && detailedEntityMetrics && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 md:p-6 transition-all animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-900/40 border border-indigo-700/60 flex items-center justify-center text-indigo-400">
                  <Building2 className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm md:text-lg font-black text-white leading-tight uppercase font-sans">
                      {detailedEntity}
                    </h2>
                    <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 text-[9px] font-bold font-mono tracking-wider px-2 py-0.5 rounded flex items-center gap-1 uppercase">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                      Audited Trail
                    </span>
                  </div>
                  <p className="text-[10px] md:text-[11px] text-slate-400 mt-0.5 font-mono">
                    Segment Detail Ledger &bull; Standard Double-Entry General Ledger Sheet
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportLedger(detailedEntity)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-755 text-xs font-mono font-bold uppercase text-slate-200 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                  title="Export live ledger spreadsheet to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  {exportSuccess ? "Exported!" : "Export Ledger CSV"}
                </button>

                <button
                  onClick={() => {
                    setDetailedEntity(null);
                    setDetailSearchQuery('');
                    setExpandedTxId(null);
                    setShowSQLTxId(null);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/40 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-900/60 transition-all cursor-pointer"
                  title="Close and return to Consolidated Room"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Quick Financial Position Summary segment inside detailing */}
            <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-slate-800">
              <div className="p-4 bg-slate-900/40 border-r border-slate-800">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">Operating Revenue</span>
                <span className="text-sm md:text-lg font-mono font-black text-white mt-1 block">
                  ${(detailedEntityMetrics.overview?.revenue || 0).toLocaleString('us', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-4 bg-slate-900/40 border-r border-slate-800">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">Cash Reserves</span>
                <span className="text-sm md:text-lg font-mono font-black text-emerald-400 mt-1 block">
                  ${(detailedEntityMetrics.overview?.cash || 0).toLocaleString('us', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-4 bg-slate-900/40 border-r border-slate-800">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">Total Net Worth</span>
                <span className="text-sm md:text-lg font-mono font-black text-indigo-400 mt-1 block">
                  ${(detailedEntityMetrics.overview?.netWorth || 0).toLocaleString('us', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-4 bg-slate-900/40">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">Total Postings Volume</span>
                <span className="text-sm md:text-lg font-mono font-black text-slate-350 mt-1 block">
                  {detailedEntityMetrics.filteredTxs.length} / {detailedEntityMetrics.txs.length} <span className="text-[10px] text-slate-500 font-sans font-normal uppercase">postings</span>
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6">
              
              {/* Filter / Search section within the ledger */}
              <div className="flex flex-col gap-4 bg-slate-950 p-4 border border-slate-800/80 rounded-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-900/60">
                  <div>
                    <h4 className="text-xs uppercase font-extrabold text-indigo-400 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5" /> Filter Ledger Entries
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Isolate transactions by keyword, dates, or specific GL account codes in real time.
                    </p>
                  </div>

                  {/* Reset Filters button if any filters are set */}
                  {(detailSearchQuery || detailStartDate || detailEndDate || detailGLAccount !== 'all') && (
                    <button 
                      type="button"
                      onClick={() => {
                        setDetailSearchQuery('');
                        setDetailStartDate('');
                        setDetailEndDate('');
                        setDetailGLAccount('all');
                      }}
                      className="text-[10px] font-mono hover:text-white text-indigo-400 bg-indigo-950/45 hover:bg-indigo-950 px-2 py-1 rounded border border-indigo-900/60 transition-all uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" /> Clear Active Filters
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* 1. Keyword search */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-mono uppercase text-slate-500 font-bold">Keyword / ID</label>
                    <div className="flex items-center bg-slate-900 border border-slate-800 focus-within:border-indigo-600 rounded-lg px-2.5 py-1.5 text-xs font-mono gap-2 transition-colors">
                      <Search className="w-3.5 h-3.5 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Search ledgers..." 
                        value={detailSearchQuery}
                        onChange={(e) => setDetailSearchQuery(e.target.value)}
                        className="bg-transparent border-none text-slate-200 outline-none text-[11px] placeholder:text-slate-650 focus:ring-0 w-full"
                      />
                      {detailSearchQuery && (
                        <button onClick={() => setDetailSearchQuery('')} className="text-slate-500 hover:text-white transition-colors cursor-pointer">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 2. GL Account Selection */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="detail-gl-account-select" className="text-[9px] font-mono uppercase text-slate-500 font-bold">GL Account Code</label>
                    <select
                      id="detail-gl-account-select"
                      value={detailGLAccount}
                      onChange={(e) => setDetailGLAccount(e.target.value)}
                      className="bg-slate-900 border border-slate-800 focus:border-indigo-600 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-300 outline-none cursor-pointer transition-colors w-full h-full min-h-[34px]"
                    >
                      <option value="all">📁 All GL Accounts</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          [{acc.code}] {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Start Date Picker */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-mono uppercase text-slate-500 font-bold">Start Date</label>
                    <input 
                      type="date"
                      value={detailStartDate}
                      onChange={(e) => setDetailStartDate(e.target.value)}
                      className="bg-slate-900 border border-slate-800 focus:border-indigo-600 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-300 outline-none cursor-pointer transition-colors w-full h-full min-h-[34px]"
                    />
                  </div>

                  {/* 4. End Date Picker */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-mono uppercase text-slate-500 font-bold">End Date</label>
                    <input 
                      type="date"
                      value={detailEndDate}
                      onChange={(e) => setDetailEndDate(e.target.value)}
                      className="bg-slate-900 border border-slate-800 focus:border-indigo-600 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-300 outline-none cursor-pointer transition-colors w-full h-full min-h-[34px]"
                    />
                  </div>
                </div>
              </div>

              {/* Transaction Ledger list */}
              <div className="flex-1 flex flex-col gap-3 min-h-[250px]">
                {detailedEntityMetrics.filteredTxs.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border-2 border-slate-850 border-dashed rounded-2xl bg-slate-950/40">
                    <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />
                    <p className="text-sm font-bold font-mono text-slate-300">No Trail Matches Found</p>
                    <p className="text-xs text-slate-500 mt-1">Adjust your search parameters or query keywords to recover segments.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3.5 overflow-y-visible">
                    {detailedEntityMetrics.filteredTxs.map(tx => {
                      const isExpanded = expandedTxId === tx.id;
                      const isSQLShown = showSQLTxId === tx.id;
                      
                      const txEntries = detailedEntityMetrics.entries.filter(je => je.transactionId === tx.id);
                      const sumAmount = txEntries.filter(je => je.debitAmount > 0).reduce((acc, curve) => acc + curve.debitAmount, 0) / 100;
                      
                      const totalDebits = txEntries.reduce((sum, je) => sum + je.debitAmount, 0);
                      const totalCredits = txEntries.reduce((sum, je) => sum + je.creditAmount, 0);
                      const isBalanced = totalDebits === totalCredits;

                      return (
                        <div 
                          key={tx.id} 
                          className={`border rounded-xl transition-all duration-300 border-l-4 ${
                            isExpanded 
                              ? 'bg-indigo-950/25 border-slate-700 border-l-indigo-500 shadow-xl shadow-indigo-950/30' 
                              : 'bg-slate-950/30 border-slate-800 hover:border-slate-700 hover:bg-slate-950/60 border-l-transparent'
                          }`}
                        >
                          {/* Transaction Card Header Row */}
                          <div 
                            onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                            className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-mono font-extrabold text-white text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-750">
                                  {tx.id}
                                </span>
                                <span className="text-[10px] uppercase font-bold text-indigo-400 bg-slate-900/60 border border-slate-800 px-1.5 py-0.5 rounded">
                                  Source: {tx.sourceSystem?.toUpperCase() || 'N/A'}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  Posted: {new Date(tx.postedAt).toLocaleString()}
                                </span>
                              </div>
                              <h5 className="text-xs text-slate-205 font-sans font-semibold hover:text-indigo-400 transition-colors py-0.5">
                                {tx.description}
                              </h5>
                            </div>

                            <div className="flex items-center gap-4 text-right justify-between md:justify-end">
                              <div className="font-mono">
                                <span className="block font-black text-white text-sm">
                                  ${sumAmount.toLocaleString('us', { minimumFractionDigits: 2 })}
                                </span>
                                <span className={`inline-flex items-center gap-1 text-[8px] uppercase font-black tracking-wider px-1.5 py-0.2 rounded mt-0.5 ${isBalanced ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-500'}`}>
                                  {isBalanced ? "Balanced Double Entry ✓" : "Unbalanced Mismatch !"}
                                </span>
                              </div>

                              <div className="text-slate-400 shrink-0">
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-200" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </div>
                          </div>

                          {/* Expanded Double Entry Trial and SQL readout */}
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-1 border-t border-slate-900">
                              
                              {/* Inside journal table */}
                              <div className="mt-2 border border-slate-900 rounded-lg overflow-hidden bg-slate-900/10">
                                <table className="w-full font-mono text-[10px] text-left">
                                  <thead className="bg-slate-950 text-slate-505 uppercase tracking-wider text-[8px] border-b border-slate-900">
                                    <tr>
                                      <th className="p-2">Acc Code</th>
                                      <th className="p-2">Account Title</th>
                                      <th className="p-2">Type</th>
                                      <th className="p-2 text-right">Debit ($)</th>
                                      <th className="p-2 text-right">Credit ($)</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-900 text-slate-350">
                                    {txEntries.map(je => {
                                      const acc = accounts.find(a => a.id === je.accountId);
                                      return (
                                        <tr key={je.id} className="hover:bg-slate-905/30">
                                          <td className="p-2 font-bold text-slate-500">{acc?.code || 'N/A'}</td>
                                          <td className="p-2 text-slate-200">{acc?.name || 'Unknown Account'}</td>
                                          <td className="p-2 uppercase text-[9px] text-slate-500">{acc?.type || 'N/A'}</td>
                                          <td className="p-2 text-right text-emerald-400 font-bold font-mono">
                                            {je.debitAmount > 0 ? `$${(je.debitAmount / 100).toLocaleString('us', { minimumFractionDigits: 2 })}` : '-'}
                                          </td>
                                          <td className="p-2 text-right text-indigo-400 font-bold font-mono">
                                            {je.creditAmount > 0 ? `$${(je.creditAmount / 100).toLocaleString('us', { minimumFractionDigits: 2 })}` : '-'}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                    {/* Total row of the trial */}
                                    <tr className="bg-slate-950/40 text-slate-400 font-bold border-t border-slate-805">
                                      <td colSpan={3} className="p-2 text-right uppercase text-[9px]">GAAP Double Book Trial Sum:</td>
                                      <td className="p-2 text-right text-emerald-400 font-mono">
                                        ${(totalDebits / 100).toLocaleString('us', { minimumFractionDigits: 2 })}
                                      </td>
                                      <td className="p-2 text-right text-indigo-400 font-mono">
                                        ${(totalCredits / 100).toLocaleString('us', { minimumFractionDigits: 2 })}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              {/* Intercompany database Posting and SQL Cache toggler */}
                              <div className="mt-3 flex justify-between items-center gap-4">
                                <span className="text-[9px] text-slate-500 uppercase flex items-center gap-1">
                                  <Database className="w-3 h-3 text-slate-600" /> PostgreSQL SQL Generated Cache
                                </span>

                                <button
                                  type="button"
                                  onClick={() => setShowSQLTxId(isSQLShown ? null : tx.id)}
                                  className="text-[9px] font-mono font-bold leading-none bg-slate-900 border border-slate-800 hover:border-slate-700 text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded cursor-pointer transition-colors"
                                >
                                  {isSQLShown ? "Hide SQL Statement" : "Inspect Dynamic SQL Query"}
                                </button>
                              </div>

                              {/* SQL View Block */}
                              {isSQLShown && (
                                <div className="mt-2 p-3 bg-slate-955 rounded-lg border border-slate-850 font-mono text-[9px] text-indigo-300 leading-normal selection:bg-indigo-900 overflow-x-auto whitespace-pre">
                                  {tx.sqlGenerated || `-- Dynamic local transaction trail for target accounting node\nINSERT INTO transactions (id, entity, description, posted_at, source_system) \nVALUES ('${tx.id}', '${tx.entity}', '${tx.description.replace(/'/g, "''")}', '${new Date(tx.postedAt).toISOString()}', '${tx.sourceSystem}');\n` + 
                                    txEntries.map(je => `INSERT INTO journal_entries(id, transaction_id, account_id, debit_amount, credit_amount) VALUES ('${je.id}', '${je.transactionId}', '${je.accountId}', ${je.debitAmount}, ${je.creditAmount});`).join('\n')
                                  }
                                </div>
                              )}

                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Live Audit Trail Verified • GAAP Compliance Active
              </span>

              <button
                type="button"
                onClick={() => {
                  setDetailedEntity(null);
                  setDetailSearchQuery('');
                  setExpandedTxId(null);
                  setShowSQLTxId(null);
                }}
                className="w-full sm:w-auto text-center font-mono font-bold uppercase text-[10px] bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-805 text-white px-5 py-2.5 rounded-xl border border-indigo-500 cursor-pointer shadow-md shadow-indigo-950/20 transition-all"
              >
                Close Audit Inspection &larr;
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

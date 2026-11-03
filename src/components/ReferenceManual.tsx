import React from 'react';
import { Coins, HelpCircle, BookOpen, Layers, Download } from 'lucide-react';

export default function ReferenceManual() {
  return (
    <section className="bg-slate-900 text-slate-300 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl">
      <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/15 rounded-full mix-blend-screen filter blur-3xl opacity-30 -mr-20 -mt-20"></div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-5 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">GAAP Recordkeeping Reference</h3>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">Statutory Rules & Relational Ledgers Protocol</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/CloudboyX_Enterprise_Platform_Guide.pdf"
            download="CloudboyX_Enterprise_Platform_Guide.pdf"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all cursor-pointer active:scale-95"
            title="Download Complete Module Breakdown & Operations Manual (PDF)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF Manual</span>
          </a>
          <span className="text-[9px] uppercase font-mono px-2 py-1 bg-indigo-900/40 text-indigo-300 border border-indigo-800 rounded bg-indigo-950">
            GAAP COMPLIANT (v4.2)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans text-xs leading-relaxed">
        <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold font-mono uppercase tracking-wider text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            1. Double Entry Constraint
          </div>
          <p className="text-slate-400 text-[11px]">
            Every structural database transaction is written with double-entry constraints. Assets must equal liabilities plus equity:
            <span className="font-mono text-indigo-400 block my-2 text-center font-bold bg-slate-950 p-2 rounded-lg border border-slate-800">
              Assets = Liabilities + Equity
            </span>
            An equal balancing debit and credit entry ensures no financial leakage is suffered over the transactional lifecycle.
          </p>
        </div>
        
        <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold font-mono uppercase tracking-wider text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            2. Debit (Dr) vs Credit (Cr)
          </div>
          <p className="text-slate-400 text-[11px]">
            Accounting rules define dynamic changes on accounts:
            <span className="block mt-1.5 space-y-1 font-mono text-[10px]">
              <span className="flex justify-between text-indigo-300 bg-slate-950/80 px-2 py-0.5 rounded">
                <span>Debit (Dr)</span>
                <span>↑ Asset / Expense</span>
              </span>
              <span className="flex justify-between text-emerald-300 bg-slate-950/80 px-2 py-0.5 rounded">
                <span>Credit (Cr)</span>
                <span>↑ Liability / Revenue</span>
              </span>
            </span>
            All asset adjustments default to debit balances in accounts like cash and trades receivable.
          </p>
        </div>

        <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-amber-500 font-semibold font-mono uppercase tracking-wider text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            3. Database Safeguards
          </div>
          <p className="text-slate-400 text-[11px]">
            To prevent precision truncation and float representation errors, prices are handled in integer cents:
            <span className="font-mono text-amber-400 block my-2 text-center font-bold bg-slate-950 p-2 rounded-lg border border-slate-800">
              $19.99 USD → 1999 cents
            </span>
            Idempotency keys and relational indexes prevent duplicated booking from Shopify or legacy files.
          </p>
        </div>
      </div>
    </section>
  );
}

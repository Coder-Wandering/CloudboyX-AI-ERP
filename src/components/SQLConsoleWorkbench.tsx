import React from 'react';
import { Terminal, Lightbulb, Play, AlertTriangle, TableProperties, Database } from 'lucide-react';

interface SQLConsoleWorkbenchProps {
  customSql: string;
  setCustomSql: (val: string) => void;
  sqlRows: any[];
  sqlColumns: string[];
  sqlError: string | null;
  sqlLoading: boolean;
  activeLedgerTransactionSql: string;
  sqlExecuted: string;
  handleExecuteSql: (queryToRun?: string) => Promise<void>;
}

export default function SQLConsoleWorkbench({
  customSql,
  setCustomSql,
  sqlRows,
  sqlColumns,
  sqlError,
  sqlLoading,
  activeLedgerTransactionSql,
  sqlExecuted,
  handleExecuteSql,
}: SQLConsoleWorkbenchProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl text-slate-300 font-mono text-xs overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-indigo-900/10 hover:shadow-xl">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/15 rounded-lg text-emerald-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white text-[13px] tracking-wide block">PostgreSQL Live SQL Workbench</span>
            <span className="text-[9px] text-slate-500 uppercase mt-0.5 block">Sandboxed Query Engine</span>
          </div>
        </div>
        
        {/* Fast Table preset buttons */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
          <span className="text-[8px] text-slate-500 font-bold uppercase px-1.5 font-sans">Tables:</span>
          <button
            onClick={() => {
              setCustomSql('SELECT * FROM accounts;');
              handleExecuteSql('SELECT * FROM accounts;');
            }}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 text-[10px] rounded border border-slate-800 transition-all font-mono cursor-pointer"
          >
            accounts
          </button>
          <button
            onClick={() => {
              setCustomSql('SELECT * FROM transactions;');
              handleExecuteSql('SELECT * FROM transactions;');
            }}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 text-[10px] rounded border border-slate-800 transition-all font-mono cursor-pointer"
          >
            transactions
          </button>
          <button
            onClick={() => {
              setCustomSql('SELECT * FROM journal_entries;');
              handleExecuteSql('SELECT * FROM journal_entries;');
            }}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 text-[10px] rounded border border-slate-800 transition-all font-mono cursor-pointer"
          >
            journal_entries
          </button>
        </div>
      </div>

      <div className="space-y-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[10px] text-slate-400 tracking-wider">WRITE SQL RAW STATEMENT:</label>
            <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-sans">
              <Lightbulb className="w-3 h-3 text-amber-500" />
              <span>Only SELECT statements authorized in sandbox</span>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-2 text-emerald-500 select-none font-bold font-mono">$</span>
              <input
                type="text"
                value={customSql}
                onChange={(e) => setCustomSql(e.target.value)}
                placeholder="SELECT * FROM transactions WHERE currency = 'USD';"
                className="w-full pl-6 pr-2 py-1.5 bg-slate-950 text-emerald-400 border border-slate-800 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>
            <button
              onClick={() => handleExecuteSql()}
              disabled={sqlLoading}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-slate-950 font-bold rounded-lg text-xs font-sans transition-all active:scale-95 flex items-center gap-1.5 shadow-lg shadow-emerald-900/10 cursor-pointer text-white"
            >
              <Play className="w-3.5 h-3.5" />
              {sqlLoading ? 'Executing...' : 'Run Query'}
            </button>
          </div>
        </div>

        {/* Query output panel */}
        <div className="flex-1 bg-slate-950 border border-slate-850 p-3 rounded-xl overflow-auto min-h-[160px] max-h-[220px] text-[10px] relative">
          
          {sqlError && (
            <div className="text-rose-400 rounded-lg bg-rose-950/20 border border-rose-900/40 p-3 flex items-start gap-2.5 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="block text-rose-300 font-bold">SQL Execution Warn:</strong>
                {sqlError}
              </div>
            </div>
          )}

          {!sqlError && sqlRows.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                  <TableProperties className="w-3 h-3 text-emerald-500" />
                  QUERY RETURNED {sqlRows.length} RECORDS ({sqlColumns.length} COLUMNS)
                </span>
                <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase">OK</span>
              </div>
              <table className="min-w-full divide-y divide-slate-800 text-[10px] text-left">
                <thead>
                  <tr>
                    {sqlColumns.map((col) => (
                      <th key={col} className="px-2 py-1 text-slate-400 border-b border-slate-850 font-bold uppercase tracking-wider">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {sqlRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-900/50 transition-colors">
                      {sqlColumns.map((col) => {
                        const val = row[col];
                        const renderedVal = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
                        let colorClass = "text-slate-200";
                        if (col.includes("balance") || col.includes("amount") || col.includes("debit")) {
                          colorClass = "text-indigo-300 font-bold";
                        } else if (col.includes("credit")) {
                          colorClass = "text-emerald-300 font-bold";
                        }
                        return (
                          <td key={col} className={`px-2 py-1.5 font-mono truncate max-w-xs ${colorClass}`} title={renderedVal}>
                            {renderedVal}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !sqlError ? (
            <div className="text-slate-500 italic flex items-center justify-center h-full min-h-[120px] text-center">
              {activeLedgerTransactionSql && !sqlExecuted ? (
                <div className="text-left font-mono w-full">
                  <div className="flex items-center gap-1.5 text-indigo-400 mb-1.5">
                    <Database className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-mono font-semibold uppercase tracking-wider">// RECENT POST GENERATED STATEMENT:</span>
                  </div>
                  <pre className="text-slate-400 border-l-2 border-indigo-500/40 pl-3 leading-relaxed whitespace-pre-wrap">{activeLedgerTransactionSql}</pre>
                </div>
              ) : (
                <div className="max-w-md space-y-1">
                  <p className="font-semibold text-slate-400 text-xs">Sandbox Engine Online</p>
                  <p className="text-[10px] text-slate-600">Enter a query, hit Run, or click one of the preset buttons above.</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

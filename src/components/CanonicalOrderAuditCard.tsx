/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CanonicalOrder } from '../canonical';
import { calculateDoubleEntryPosting, PostingCalculationResult } from '../ledgerEngine';
import { CheckCircle2, AlertTriangle, Code, ChevronDown, ChevronUp, ArrowRight, ShieldCheck } from 'lucide-react';

export interface CanonicalOrderAuditCardProps {
  order: CanonicalOrder;
  postedToCash?: boolean;
  onPost?: (result: PostingCalculationResult) => void;
  defaultShowSql?: boolean;
}

export const CanonicalOrderAuditCard: React.FC<CanonicalOrderAuditCardProps> = ({
  order,
  postedToCash = true,
  onPost,
  defaultShowSql = false,
}) => {
  const [showSql, setShowSql] = useState(defaultShowSql);

  const result = calculateDoubleEntryPosting(order, postedToCash);

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div 
      data-testid="canonical-order-card"
      className="p-5 rounded-2xl bg-[#24232B] border border-white/10 text-white font-mono shadow-xl space-y-4"
    >
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span 
            data-testid="source-badge"
            className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#979BF3]/20 text-[#979BF3] border border-[#979BF3]/30"
          >
            {order.sourceSystem}
          </span>
          <span className="text-xs text-white/50">ID:</span>
          <span data-testid="order-id" className="text-xs font-bold text-white">
            #{order.sourceOrderId}
          </span>
        </div>

        <div className="text-xs">
          <span className="text-white/50">Customer: </span>
          <span data-testid="customer-email" className="text-[#979BF3] font-medium">
            {order.customerEmail || 'No Email Provided'}
          </span>
        </div>
      </div>

      {/* Line Items List */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold uppercase text-white/60 tracking-wider">
          Normalized Canonical Items ({order.items.length})
        </div>
        <div className="space-y-1">
          {order.items.map((item, idx) => (
            <div 
              key={idx} 
              data-testid={`line-item-${idx}`}
              className="flex justify-between items-center text-xs py-1 px-2.5 rounded bg-white/5 border border-white/5"
            >
              <div className="flex items-center gap-2">
                <span className="text-amber-300 font-bold">{item.sku}</span>
                <span className="text-white/50">× {item.quantity}</span>
              </div>
              <div className="text-white font-mono">
                {formatCents(item.unitPrice)} ea ({formatCents(item.unitPrice * item.quantity)})
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals & Breakdown */}
      <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-center text-xs">
        <div>
          <div className="text-[10px] text-white/50 uppercase">Subtotal Revenue</div>
          <div data-testid="subtotal-revenue" className="font-bold text-emerald-400 mt-0.5">
            {formatCents(order.totalAmount - order.taxAmount)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-white/50 uppercase">Sales Tax</div>
          <div data-testid="tax-amount" className="font-bold text-amber-400 mt-0.5">
            {formatCents(order.taxAmount)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-white/50 uppercase">Total Amount</div>
          <div data-testid="total-amount" className="font-bold text-white mt-0.5">
            {formatCents(order.totalAmount)}
          </div>
        </div>
      </div>

      {/* Double-Entry Journal Table */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase text-white/60 tracking-wider">
            Double-Entry Ledger Postings
          </span>
          <span 
            data-testid="balance-badge"
            className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold ${
              result.isBalanced 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {result.isBalanced ? (
              <>
                <ShieldCheck className="w-3 h-3" />
                <span>GAAP BALANCED</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3 h-3" />
                <span>UNBALANCED</span>
              </>
            )}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-[10px] uppercase">
                <th className="py-1">Account</th>
                <th className="py-1">Code</th>
                <th className="py-1 text-right">Debit</th>
                <th className="py-1 text-right">Credit</th>
              </tr>
            </thead>
            <tbody>
              {result.entries.map((entry, idx) => (
                <tr key={idx} data-testid={`journal-entry-${idx}`} className="border-b border-white/5">
                  <td className="py-1.5 text-white/80">{entry.accountName}</td>
                  <td className="py-1.5 text-white/50">{entry.accountCode}</td>
                  <td className="py-1.5 text-right font-bold text-cyan-300">
                    {entry.debitAmount > 0 ? formatCents(entry.debitAmount) : '-'}
                  </td>
                  <td className="py-1.5 text-right font-bold text-indigo-300">
                    {entry.creditAmount > 0 ? formatCents(entry.creditAmount) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/20 font-bold text-white text-[11px]">
                <td colSpan={2} className="py-2">Total Sum (Debits = Credits)</td>
                <td data-testid="total-debits" className="py-2 text-right text-cyan-300">
                  {formatCents(result.totalDebits)}
                </td>
                <td data-testid="total-credits" className="py-2 text-right text-indigo-300">
                  {formatCents(result.totalCredits)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* SQL Script Toggle */}
      <div className="pt-2 border-t border-white/10">
        <button
          type="button"
          data-testid="toggle-sql-button"
          onClick={() => setShowSql(!showSql)}
          className="text-xs text-[#979BF3] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer py-1"
        >
          <Code className="w-3.5 h-3.5" />
          <span>{showSql ? 'Hide SQL Script' : 'Inspect Generated PostgreSQL Script'}</span>
          {showSql ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showSql && (
          <pre 
            data-testid="sql-preview"
            className="mt-2 p-3 rounded-lg bg-black/60 border border-white/10 text-[10px] text-amber-200/90 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48"
          >
            {result.sqlGenerated}
          </pre>
        )}
      </div>

      {/* Action Button */}
      {onPost && (
        <button
          type="button"
          data-testid="post-to-ledger-btn"
          onClick={() => onPost(result)}
          className="w-full py-2.5 px-4 rounded-xl bg-[#979BF3] hover:bg-[#B4B7F7] text-[#1C1B21] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Commit Double-Entry Transaction to General Ledger</span>
        </button>
      )}
    </div>
  );
};

export default CanonicalOrderAuditCard;

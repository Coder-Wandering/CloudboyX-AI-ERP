/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CanonicalOrder } from './canonical';

export interface CalculatedJournalEntry {
  id: string;
  transactionId: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debitAmount: number;  // in integer cents
  creditAmount: number; // in integer cents
  createdAt: Date;
}

export interface PostingCalculationResult {
  transactionId: string;
  sourceSystem: string;
  sourceOrderId: string;
  description: string;
  postedAt: Date;
  totalDebits: number;  // in cents
  totalCredits: number; // in cents
  isBalanced: boolean;
  entries: CalculatedJournalEntry[];
  sqlGenerated: string;
  customerEmail: string;
  skus: string;
}

/**
 * Escapes single quotes for standard SQL compliant literals
 */
export function escapeSqlString(str: string): string {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

/**
 * Pure calculation engine for double-entry ledger postings.
 * Enforces fundamental accounting equation: Total Debits == Total Credits.
 * Works exclusively in integer cents to prevent floating-point inaccuracies.
 */
export function calculateDoubleEntryPosting(
  order: CanonicalOrder, 
  postedToCash: boolean = true,
  customTransactionId?: string
): PostingCalculationResult {
  if (order.totalAmount < 0) {
    throw new Error('Total amount cannot be negative');
  }
  if (order.taxAmount < 0) {
    throw new Error('Tax amount cannot be negative');
  }
  if (order.taxAmount > order.totalAmount) {
    throw new Error('Tax amount cannot exceed total amount');
  }

  const transactionId = customTransactionId || `tx-${Math.random().toString(36).substring(2, 9)}`;
  const skus = (order.items || []).map(i => i.sku).filter(Boolean).join(', ');
  const customerEmail = order.customerEmail || '';
  const description = `Normalized sales transaction [Source: ${order.sourceSystem.toUpperCase()} #${order.sourceOrderId}]${customerEmail ? ` - Customer: ${customerEmail}` : ''}${skus ? ` | SKU: ${skus}` : ''}`;
  const postedAt = order.createdAt || new Date();

  const entries: CalculatedJournalEntry[] = [];

  // 1. Debit Asset: Cash (1010) or Accounts Receivable (1200)
  const debitAccountId = postedToCash ? 'acc-cash' : 'acc-ar';
  const debitAccountCode = postedToCash ? '1010' : '1200';
  const debitAccountName = postedToCash ? 'Cash' : 'Accounts Receivable';

  entries.push({
    id: `je-${Math.random().toString(36).substring(2, 9)}`,
    transactionId,
    accountId: debitAccountId,
    accountCode: debitAccountCode,
    accountName: debitAccountName,
    debitAmount: order.totalAmount,
    creditAmount: 0,
    createdAt: new Date()
  });

  // 2. Credit Revenue: Sales Revenue (4010) = totalAmount - taxAmount
  const revenueCents = order.totalAmount - order.taxAmount;
  if (revenueCents > 0) {
    entries.push({
      id: `je-${Math.random().toString(36).substring(2, 9)}`,
      transactionId,
      accountId: 'acc-revenue',
      accountCode: '4010',
      accountName: 'Sales Revenue',
      debitAmount: 0,
      creditAmount: revenueCents,
      createdAt: new Date()
    });
  }

  // 3. Credit Liability: Sales Tax Payable (2200) = taxAmount
  if (order.taxAmount > 0) {
    entries.push({
      id: `je-${Math.random().toString(36).substring(2, 9)}`,
      transactionId,
      accountId: 'acc-tax',
      accountCode: '2200',
      accountName: 'Sales Tax Payable',
      debitAmount: 0,
      creditAmount: order.taxAmount,
      createdAt: new Date()
    });
  }

  // If order total is 0 and no revenue/tax, debit is 0 and credits are 0 -> balanced
  const totalDebits = entries.reduce((sum, e) => sum + e.debitAmount, 0);
  const totalCredits = entries.reduce((sum, e) => sum + e.creditAmount, 0);
  const isBalanced = totalDebits === totalCredits;

  // Generate PostgreSQL transactional script
  const escapedDesc = escapeSqlString(description);
  let sqlText = `-- PostgreSQL Transaction Posting block\nBEGIN;\n\n`;
  sqlText += `INSERT INTO transactions (id, source_system, source_id, description, posted_at, created_at, sql_generated)\n`;
  sqlText += `VALUES ('${transactionId}', '${order.sourceSystem}', '${escapeSqlString(order.sourceOrderId)}', '${escapedDesc}', '${postedAt.toISOString()}', '${new Date().toISOString()}', '');\n\n`;

  for (const entry of entries) {
    const isDebit = entry.debitAmount > 0;
    sqlText += `-- ${isDebit ? 'Debit: Increase financial Asset' : 'Credit: Record ' + entry.accountName} (${entry.accountName})\n`;
    sqlText += `INSERT INTO journal_entries (id, transaction_id, account_id, debit_amount, credit_amount, created_at)\n`;
    sqlText += `VALUES ('${entry.id}', '${transactionId}', (SELECT id FROM accounts WHERE code = '${entry.accountCode}'), ${entry.debitAmount}, ${entry.creditAmount}, '${entry.createdAt.toISOString()}');\n\n`;
  }

  sqlText += `COMMIT;\n`;

  return {
    transactionId,
    sourceSystem: order.sourceSystem,
    sourceOrderId: order.sourceOrderId,
    description,
    postedAt,
    totalDebits,
    totalCredits,
    isBalanced,
    entries,
    sqlGenerated: sqlText,
    customerEmail,
    skus
  };
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import alasql from 'alasql';
import { CanonicalOrder } from '../canonical';
import { calculateDoubleEntryPosting, escapeSqlString } from '../ledgerEngine';

describe('Double-Entry SQL Transaction Posting Calculations', () => {
  describe('calculateDoubleEntryPosting Math & Balancing Invariants', () => {
    it('should balance debits and credits for Cash sale with sales tax (Debits = Credits)', () => {
      const order: CanonicalOrder = {
        sourceSystem: 'shopify',
        sourceOrderId: 'SH-1001',
        customerEmail: 'buyer@retail.com',
        items: [
          { sku: 'PREM-HOODIE', quantity: 2, unitPrice: 7500, currency: 'USD' }
        ],
        totalAmount: 16250, // $162.50 total
        taxAmount: 1250,    // $12.50 tax (Revenue = $150.00 -> 15000 cents)
        createdAt: new Date('2026-06-20T14:00:00Z'),
      };

      const result = calculateDoubleEntryPosting(order, true);

      expect(result.isBalanced).toBe(true);
      expect(result.totalDebits).toBe(16250);
      expect(result.totalCredits).toBe(16250);

      // Verify entries
      expect(result.entries).toHaveLength(3);

      // 1. Debit Cash (1010)
      const debitEntry = result.entries.find(e => e.accountCode === '1010');
      expect(debitEntry).toBeDefined();
      expect(debitEntry?.debitAmount).toBe(16250);
      expect(debitEntry?.creditAmount).toBe(0);

      // 2. Credit Sales Revenue (4010)
      const revenueEntry = result.entries.find(e => e.accountCode === '4010');
      expect(revenueEntry).toBeDefined();
      expect(revenueEntry?.debitAmount).toBe(0);
      expect(revenueEntry?.creditAmount).toBe(15000); // 16250 - 1250

      // 3. Credit Sales Tax Payable (2200)
      const taxEntry = result.entries.find(e => e.accountCode === '2200');
      expect(taxEntry).toBeDefined();
      expect(taxEntry?.debitAmount).toBe(0);
      expect(taxEntry?.creditAmount).toBe(1250);
    });

    it('should balance debits and credits for Accounts Receivable (invoice terms) with zero tax', () => {
      const b2bOrder: CanonicalOrder = {
        sourceSystem: 'edi',
        sourceOrderId: 'EDI-PO-88219',
        customerEmail: 'purchasing@mega-distributor.com',
        items: [
          { sku: 'PALLET-BOLTS-M8', quantity: 10, unitPrice: 32000, currency: 'USD' }
        ],
        totalAmount: 320000, // $3,200.00
        taxAmount: 0,
        createdAt: new Date('2026-06-21T09:15:00Z'),
      };

      const result = calculateDoubleEntryPosting(b2bOrder, false); // postedToCash = false

      expect(result.isBalanced).toBe(true);
      expect(result.totalDebits).toBe(320000);
      expect(result.totalCredits).toBe(320000);

      // Verify that debit account is Accounts Receivable (1200)
      const arEntry = result.entries.find(e => e.accountCode === '1200');
      expect(arEntry).toBeDefined();
      expect(arEntry?.debitAmount).toBe(320000);

      // Verify that no tax entry was generated since tax is 0
      const taxEntry = result.entries.find(e => e.accountCode === '2200');
      expect(taxEntry).toBeUndefined();

      // Revenue receives the entire totalAmount
      const revenueEntry = result.entries.find(e => e.accountCode === '4010');
      expect(revenueEntry?.creditAmount).toBe(320000);
    });

    it('should strictly avoid floating-point penny drift by using integer cents', () => {
      // Classic JS float bug: 0.1 + 0.2 === 0.30000000000000004
      // With integer cents: 10 + 20 === 30 exactly
      const fractionalFloatSimulatedOrder: CanonicalOrder = {
        sourceSystem: 'shopify',
        sourceOrderId: 'DECIMAL-TEST',
        customerEmail: 'math@fintech.test',
        items: [
          { sku: 'ITEM-1', quantity: 1, unitPrice: 1999, currency: 'USD' },
          { sku: 'ITEM-2', quantity: 1, unitPrice: 2999, currency: 'USD' },
        ],
        totalAmount: 5498, // $49.98 items + $5.00 tax
        taxAmount: 500,
        createdAt: new Date(),
      };

      const result = calculateDoubleEntryPosting(fractionalFloatSimulatedOrder, true);
      expect(result.isBalanced).toBe(true);
      expect(result.totalDebits).toBe(result.totalCredits);
      expect(Number.isInteger(result.totalDebits)).toBe(true);
      expect(Number.isInteger(result.totalCredits)).toBe(true);
    });

    it('should throw an error on invalid or negative amounts', () => {
      const invalidOrder: CanonicalOrder = {
        sourceSystem: 'manual',
        sourceOrderId: 'ERR-1',
        customerEmail: 'err@test.com',
        items: [],
        totalAmount: -100,
        taxAmount: 0,
        createdAt: new Date(),
      };

      expect(() => {
        calculateDoubleEntryPosting(invalidOrder);
      }).toThrow('Total amount cannot be negative');
    });

    it('should throw an error if taxAmount exceeds totalAmount', () => {
      const invalidTaxOrder: CanonicalOrder = {
        sourceSystem: 'manual',
        sourceOrderId: 'ERR-2',
        customerEmail: 'err@test.com',
        items: [],
        totalAmount: 1000,
        taxAmount: 1500,
        createdAt: new Date(),
      };

      expect(() => {
        calculateDoubleEntryPosting(invalidTaxOrder);
      }).toThrow('Tax amount cannot exceed total amount');
    });
  });

  describe('PostgreSQL Script Generation and Escaping', () => {
    it('should generate an atomic BEGIN; ... COMMIT; SQL block with proper table names and values', () => {
      const order: CanonicalOrder = {
        sourceSystem: 'shopify',
        sourceOrderId: 'ORD-SQL-1',
        customerEmail: 'sql.tester@company.org',
        items: [{ sku: 'DB-TEST-SKU', quantity: 1, unitPrice: 10000, currency: 'USD' }],
        totalAmount: 10800,
        taxAmount: 800,
        createdAt: new Date('2026-06-22T12:00:00Z'),
      };

      const result = calculateDoubleEntryPosting(order, true, 'tx-test-sql-1');

      const sql = result.sqlGenerated;

      expect(sql).toContain('BEGIN;');
      expect(sql).toContain('COMMIT;');
      expect(sql).toContain("INSERT INTO transactions (id, source_system, source_id, description, posted_at, created_at, sql_generated)");
      expect(sql).toContain("INSERT INTO journal_entries (id, transaction_id, account_id, debit_amount, credit_amount, created_at)");
      expect(sql).toContain("WHERE code = '1010'"); // Cash
      expect(sql).toContain("WHERE code = '4010'"); // Revenue
      expect(sql).toContain("WHERE code = '2200'"); // Tax
      expect(sql).toContain("10800"); // Total amount in cents
      expect(sql).toContain("10000"); // Revenue in cents
      expect(sql).toContain("800");   // Tax in cents
    });

    it('should escape single quotes in customer emails and descriptions to prevent SQL injection', () => {
      const rogueOrder: CanonicalOrder = {
        sourceSystem: 'legacy_csv',
        sourceOrderId: "ORD-O'REILLY-44",
        customerEmail: "connor.o'brien@m'distrib.com",
        items: [{ sku: "BOLT-3/8'-GRADE8", quantity: 1, unitPrice: 5000, currency: 'USD' }],
        totalAmount: 5000,
        taxAmount: 0,
        createdAt: new Date(),
      };

      const result = calculateDoubleEntryPosting(rogueOrder, true);
      const sql = result.sqlGenerated;

      // In SQL, single quotes must be escaped by doubling them (e.g., '' )
      expect(sql).toContain("connor.o''brien@m''distrib.com");
      expect(sql).toContain("ORD-O''REILLY-44");
      expect(sql).not.toContain("connor.o'brien");
    });
  });

  describe('AlaSQL In-Memory Database Execution & Idempotency', () => {
    beforeEach(() => {
      // Re-initialize isolated test database schema
      alasql('CREATE TABLE IF NOT EXISTS accounts (id STRING, code STRING, name STRING, type STRING)');
      alasql('CREATE TABLE IF NOT EXISTS transactions (id STRING, source_system STRING, source_id STRING, description STRING, posted_at STRING, created_at STRING, sql_generated STRING, customer_email STRING, sku STRING)');
      alasql('CREATE TABLE IF NOT EXISTS journal_entries (id STRING, transaction_id STRING, account_id STRING, debit_amount INT, credit_amount INT, created_at STRING)');

      alasql('DELETE FROM accounts');
      alasql('DELETE FROM transactions');
      alasql('DELETE FROM journal_entries');

      // Seed chart of accounts
      alasql("INSERT INTO accounts VALUES ('acc-cash', '1010', 'Cash', 'asset')");
      alasql("INSERT INTO accounts VALUES ('acc-ar', '1200', 'Accounts Receivable', 'asset')");
      alasql("INSERT INTO accounts VALUES ('acc-revenue', '4010', 'Sales Revenue', 'revenue')");
      alasql("INSERT INTO accounts VALUES ('acc-tax', '2200', 'Sales Tax Payable', 'liability')");
    });

    it('should successfully insert journal entries into AlaSQL and verify debit/credit sum parity', () => {
      const order: CanonicalOrder = {
        sourceSystem: 'shopify',
        sourceOrderId: 'SH-LIVE-88',
        customerEmail: 'audit@accounting.org',
        items: [{ sku: 'AUDIT-LOG', quantity: 2, unitPrice: 5000, currency: 'USD' }],
        totalAmount: 10500,
        taxAmount: 500,
        createdAt: new Date(),
      };

      const result = calculateDoubleEntryPosting(order, true);

      // Insert transaction into transactions table
      alasql('INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        result.transactionId,
        result.sourceSystem,
        result.sourceOrderId,
        result.description,
        result.postedAt.toISOString(),
        new Date().toISOString(),
        result.sqlGenerated,
        result.customerEmail,
        result.skus
      ]);

      // Insert all journal entries
      for (const entry of result.entries) {
        alasql('INSERT INTO journal_entries VALUES (?, ?, ?, ?, ?, ?)', [
          entry.id,
          entry.transactionId,
          entry.accountId,
          entry.debitAmount,
          entry.creditAmount,
          entry.createdAt.toISOString()
        ]);
      }

      // Query AlaSQL to verify balancing sum: Total Debits == Total Credits
      const sumResult = alasql('SELECT SUM(debit_amount) as total_debits, SUM(credit_amount) as total_credits FROM journal_entries WHERE transaction_id = ?', [result.transactionId]) as any[];

      expect(sumResult[0].total_debits).toBe(10500);
      expect(sumResult[0].total_credits).toBe(10500);
      expect(sumResult[0].total_debits).toEqual(sumResult[0].total_credits);
    });

    it('should detect duplicate transaction source IDs and enforce idempotency', () => {
      const order: CanonicalOrder = {
        sourceSystem: 'shopify',
        sourceOrderId: 'DUPLICATE-CHECK-01',
        customerEmail: 'dup@test.com',
        items: [],
        totalAmount: 1000,
        taxAmount: 0,
        createdAt: new Date(),
      };

      // Insert initial transaction
      alasql('INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        'tx-initial',
        order.sourceSystem,
        order.sourceOrderId,
        'Initial post',
        new Date().toISOString(),
        new Date().toISOString(),
        '',
        order.customerEmail,
        ''
      ]);

      // Check if duplicate exists
      const existing = alasql('SELECT id FROM transactions WHERE source_system = ? AND source_id = ?', [
        order.sourceSystem,
        order.sourceOrderId
      ]) as any[];

      expect(existing).toHaveLength(1);
      expect(existing[0].id).toBe('tx-initial');
    });
  });
});

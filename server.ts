/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import alasql from 'alasql';
import { UniversalGateway } from './src/gateway';
import { CanonicalOrder, CanonicalLineItem } from './src/canonical';
import { registerMapProtectionRoutes } from './src/server/mapProtectionRoutes';
import { registerPredictRoutes } from './src/server/predictRoutes';

// Setup file URL helpers for ES Modules format
const __filename = typeof import.meta !== 'undefined' && import.meta.url ? fileURLToPath(import.meta.url) : '';
const __dirname = __filename ? path.dirname(__filename) : '';

// Initialize Gemini SDK with custom user agent telemetry
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: key || 'dummy-key-to-prevent-immediate-crash',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// In-Memory Database Simulation mirroring the Postgres schema
interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  createdAt: Date;
}

interface DBTransaction {
  id: string;
  sourceSystem: string;
  sourceId: string;
  description: string;
  postedAt: Date;
  createdAt: Date;
  sqlGenerated?: string; // Cache the Postgres commands generated in posting
  entity?: string;
  customerEmail?: string;
  sku?: string;
}

function getTransactionEntity(r: any): string {
  if (r.entity) return r.entity;
  
  // Try parsing from description, e.g. [Entity: CloudboyX Europe GmbH, PO: ...]
  const match = r.description?.match(/\[Entity:\s*([^,\]]+)/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // Map based on source system
  const source = r.source_system || r.sourceSystem;
  if (source === 'shopify') {
    return 'CloudboyX Americas LLC';
  }
  if (source === 'legacy_csv') {
    return 'CloudboyX Europe GmbH';
  }
  if (source === 'edi') {
    return 'CloudboyX Asia-Pacific Ltd';
  }
  
  return 'CloudboyX Americas LLC'; // default
}

interface JournalEntry {
  id: string;
  transactionId: string;
  accountId: string;
  debitAmount: number;  // in cents
  creditAmount: number; // in cents
  createdAt: Date;
}

// Pre-seeded Chart of Accounts
const ACCOUNTS: Account[] = [
  { id: 'acc-cash', code: '1010', name: 'Cash', type: 'asset', createdAt: new Date() },
  { id: 'acc-ar', code: '1200', name: 'Accounts Receivable', type: 'asset', createdAt: new Date() },
  { id: 'acc-revenue', code: '4010', name: 'Sales Revenue', type: 'revenue', createdAt: new Date() },
  { id: 'acc-tax', code: '2200', name: 'Sales Tax Payable', type: 'liability', createdAt: new Date() },
  { id: 'acc-shipping', code: '4020', name: 'Shipping Revenue', type: 'revenue', createdAt: new Date() },
  { id: 'acc-inventory', code: '1400', name: 'Inventory / Corporate Assets', type: 'asset', createdAt: new Date() },
  { id: 'acc-po-commitment', code: '1900', name: 'Procurement Commitments', type: 'asset', createdAt: new Date() },
  { id: 'acc-po-reserve', code: '2400', name: 'Accrued Purchase Commitments', type: 'liability', createdAt: new Date() },
  { id: 'acc-accrued-ap', code: '2150', name: 'Goods Received Not Invoiced (Accrued AP)', type: 'liability', createdAt: new Date() },
  { id: 'acc-ap', code: '2100', name: 'Accounts Payable', type: 'liability', createdAt: new Date() },
];

const DB_FILE_PATH = path.join(process.cwd(), 'db_state.json');

// Save all tables to a local JSON file to persist between backend restarts
export function saveDatabaseToFile() {
  try {
    const dbAccounts = alasql('SELECT * FROM accounts') || [];
    const dbTransactions = alasql('SELECT * FROM transactions') || [];
    const dbEntries = alasql('SELECT * FROM journal_entries') || [];
    const dbResellers = alasql('SELECT * FROM resellers') || [];
    const dbUsers = alasql('SELECT * FROM users') || [];
    
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify({
      accounts: dbAccounts,
      transactions: dbTransactions,
      journal_entries: dbEntries,
      resellers: dbResellers,
      users: dbUsers
    }, null, 2), 'utf8');
    console.log('✓ General ledger persistent backup successfully written to disk');
  } catch (err) {
    console.error('Failed to write database snapshot to disk:', err);
  }
}

// Password hashing helper for self-hosted zero-cost auth (no GCP / Firebase fees)
export function hashPassword(password: string, salt: string): string {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

// Restore all tables from local JSON database snapshot
export function loadDatabaseFromFile(): boolean {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const dataStr = fs.readFileSync(DB_FILE_PATH, 'utf8');
      const data = JSON.parse(dataStr);
      
      alasql('DELETE FROM accounts');
      alasql('DELETE FROM transactions');
      alasql('DELETE FROM journal_entries');
      alasql('CREATE TABLE IF NOT EXISTS resellers (id STRING, name STRING, domain STRING, status STRING, rate_limit INT, orders_count INT, last_active STRING)');
      alasql('DELETE FROM resellers');
      alasql('CREATE TABLE IF NOT EXISTS users (id STRING, name STRING, email STRING, password_hash STRING, salt STRING, company STRING, plan_type STRING, modules STRING, billing_cycle STRING, created_at STRING)');
      alasql('DELETE FROM users');
      
      if (Array.isArray(data.accounts)) {
        data.accounts.forEach((acc: any) => {
          alasql('INSERT INTO accounts VALUES (?, ?, ?, ?, ?)', [
            acc.id, acc.code, acc.name, acc.type, acc.created_at || acc.createdAt
          ]);
        });
      }
      
      if (Array.isArray(data.transactions)) {
        data.transactions.forEach((r: any) => {
          let customerEmail = r.customer_email || r.customerEmail || '';
          let sku = r.sku || '';
          const sourceId = r.source_id || r.sourceId || '';
          if (!customerEmail && sourceId === 'SH-84920') customerEmail = 'alice.miller@icloud.com';
          if (!sku && sourceId === 'SH-84920') sku = 'VNTG-TEE-BLK, DENIM-JKT-L';
          if (!customerEmail && sourceId === 'REC-30911') customerEmail = 'b2b-purchaser@industrial.corp';
          if (!sku && sourceId === 'REC-30911') sku = 'STEEL-RIVET-100';
          if (!customerEmail && sourceId === 'EDIPO-904128') customerEmail = 'edi-partner@b2b.system';
          if (!sku && sourceId === 'EDIPO-904128') sku = 'BULK-PALLET-A';

          alasql('INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            r.id,
            r.source_system || r.sourceSystem,
            sourceId,
            r.description,
            r.posted_at || r.postedAt,
            r.created_at || r.createdAt,
            r.sql_generated || r.sqlGenerated,
            customerEmail,
            sku
          ]);
        });
      }
      
      if (Array.isArray(data.journal_entries)) {
        data.journal_entries.forEach((je: any) => {
          alasql('INSERT INTO journal_entries VALUES (?, ?, ?, ?, ?, ?)', [
            je.id, je.transaction_id || je.transactionId, je.account_id || je.accountId, je.debit_amount || je.debitAmount, je.credit_amount || je.creditAmount, je.created_at || je.createdAt
          ]);
        });
      }

      if (Array.isArray(data.resellers)) {
        data.resellers.forEach((resell: any) => {
          alasql('INSERT INTO resellers VALUES (?, ?, ?, ?, ?, ?, ?)', [
            resell.id, resell.name, resell.domain, resell.status, resell.rate_limit || resell.rateLimit, resell.orders_count || resell.ordersCount, resell.last_active || resell.lastActive
          ]);
        });
      }

      if (Array.isArray(data.users)) {
        data.users.forEach((usr: any) => {
          alasql('INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            usr.id, usr.name, usr.email, usr.password_hash || usr.passwordHash, usr.salt, usr.company, usr.plan_type || usr.planType, usr.modules, usr.billing_cycle || usr.billingCycle, usr.created_at || usr.createdAt
          ]);
        });
      }

      console.log('✓ General ledger, resellers, and user accounts successfully restored from disk snapshot.', {
        accounts: data.accounts?.length,
        transactions: data.transactions?.length,
        journalEntries: data.journal_entries?.length,
        resellers: data.resellers?.length,
        users: data.users?.length
      });
      return true;
    }
  } catch (err) {
    console.error('Failed to restore database from local snapshot file:', err);
  }
  return false;
}

// Initialize database schema and tables in the AlaSQL memory database
function initDatabase() {
  try {
    alasql('CREATE TABLE IF NOT EXISTS accounts (id STRING, code STRING, name STRING, type STRING, created_at STRING)');
    alasql('CREATE TABLE IF NOT EXISTS transactions (id STRING, source_system STRING, source_id STRING, description STRING, posted_at STRING, created_at STRING, sql_generated STRING, customer_email STRING, sku STRING)');
    alasql('CREATE TABLE IF NOT EXISTS journal_entries (id STRING, transaction_id STRING, account_id STRING, debit_amount INT, credit_amount INT, created_at STRING)');
    alasql('CREATE TABLE IF NOT EXISTS resellers (id STRING, name STRING, domain STRING, status STRING, rate_limit INT, orders_count INT, last_active STRING)');
    alasql('CREATE TABLE IF NOT EXISTS users (id STRING, name STRING, email STRING, password_hash STRING, salt STRING, company STRING, plan_type STRING, modules STRING, billing_cycle STRING, created_at STRING)');
    
    // Seed default demo account if no accounts exist
    const userCount = (alasql('SELECT COUNT(*) as cnt FROM users') as any[])[0]?.cnt || 0;
    if (userCount === 0) {
      const demoSalt = 'cloudboyx_salt_demo';
      const demoHash = hashPassword('demo1234', demoSalt);
      alasql('INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        'usr-demo-01',
        'Elena Vance, CPA',
        'elena.vance@omniretail.global',
        demoHash,
        demoSalt,
        'OmniRetail Global Enterprise',
        'full_suite',
        JSON.stringify(['ledger', 'ingress', 'procurement']),
        'annual',
        new Date().toISOString()
      ]);
      console.log('✓ Seeded default zero-cost demo user account (elena.vance@omniretail.global)');
    }

    console.log('✓ AlaSQL Relational Database Schema established with Zero-Cost Users table');
  } catch (err) {
    console.error('Failed to initialize AlaSQL relational tables:', err);
  }
}

// Getters fetching matching types from raw SQL schemas
function getAccounts(): Account[] {
  try {
    const rows = (alasql('SELECT * FROM accounts') as any[]) || [];
    return rows.map((r: any) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      type: r.type,
      createdAt: new Date(r.created_at || Date.now())
    }));
  } catch {
    return [];
  }
}

function getTransactions(): DBTransaction[] {
  try {
    const rows = (alasql('SELECT * FROM transactions') as any[]) || [];
    return rows.map((r: any) => {
      let customerEmail = r.customer_email || r.customerEmail || '';
      let sku = r.sku || '';

      const sourceId = r.source_id || r.sourceId || '';
      if (!customerEmail || !sku) {
        if (sourceId === 'SH-84920') {
          customerEmail = customerEmail || 'alice.miller@icloud.com';
          sku = sku || 'VNTG-TEE-BLK, DENIM-JKT-L';
        } else if (sourceId === 'REC-30911') {
          customerEmail = customerEmail || 'b2b-purchaser@industrial.corp';
          sku = sku || 'STEEL-RIVET-100';
        } else if (sourceId === 'EDIPO-904128') {
          customerEmail = customerEmail || 'edi-partner@b2b.system';
          sku = sku || 'BULK-PALLET-A';
        }
      }

      if (!customerEmail && r.description) {
        const emailMatch = r.description.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        if (emailMatch) customerEmail = emailMatch[1];
      }
      if (!sku && r.description) {
        const skuMatch = r.description.match(/SKU[:\s]+([A-Za-z0-9-_, ]+)/i);
        if (skuMatch) sku = skuMatch[1].trim();
      }

      return {
        id: r.id,
        sourceSystem: r.source_system || r.sourceSystem,
        sourceId: r.source_id || r.sourceId,
        description: r.description,
        postedAt: new Date(r.posted_at || r.postedAt || Date.now()),
        createdAt: new Date(r.created_at || r.createdAt || Date.now()),
        sqlGenerated: r.sql_generated || r.sqlGenerated,
        entity: getTransactionEntity(r),
        customerEmail,
        sku
      };
    });
  } catch {
    return [];
  }
}

function getJournalEntries(): JournalEntry[] {
  try {
    const rows = (alasql('SELECT * FROM journal_entries') as any[]) || [];
    return rows.map((r: any) => ({
      id: r.id,
      transactionId: r.transaction_id,
      accountId: r.account_id,
      debitAmount: Number(r.debit_amount || 0),
      creditAmount: Number(r.credit_amount || 0),
      createdAt: new Date(r.created_at || Date.now())
    }));
  } catch {
    return [];
  }
}

// Seed on startup or reset
function seedInitialTransactions(forceRefresh = false) {
  initDatabase();

  if (!forceRefresh) {
    const loaded = loadDatabaseFromFile();
    if (loaded) {
      return;
    }
  }

  console.log('No local persistence snapshot found, or force reset requested. Seeding initial general ledger data & resellers...');

  // Clean wipe
  alasql('DELETE FROM accounts');
  alasql('DELETE FROM transactions');
  alasql('DELETE FROM journal_entries');
  alasql('CREATE TABLE IF NOT EXISTS resellers (id STRING, name STRING, domain STRING, status STRING, rate_limit INT, orders_count INT, last_active STRING)');
  alasql('DELETE FROM resellers');

  // Populate chart of accounts conforming to GAAP defaults
  ACCOUNTS.forEach(acc => {
    alasql('INSERT INTO accounts VALUES (?, ?, ?, ?, ?)', [
      acc.id,
      acc.code,
      acc.name,
      acc.type,
      acc.createdAt.toISOString()
    ]);
  });

  // Seed default resellers
  const initialResellers = [
    { id: 'resell-1', name: 'Acme Distribution', domain: 'acme-reselling.com', status: 'Authorized', rate_limit: 500, orders_count: 142, last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 'resell-2', name: 'Global Apex Prime', domain: 'apex-import.co.uk', status: 'Authorized', rate_limit: 1000, orders_count: 87, last_active: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
    { id: 'resell-3', name: 'Shadow Wholesale Inc.', domain: 'shadow-bulk.net', status: 'Pending', rate_limit: 100, orders_count: 0, last_active: 'Never' },
    { id: 'resell-4', name: 'Calypso Retail Node', domain: 'calypso-shop.org', status: 'Revoked', rate_limit: 250, orders_count: 12, last_active: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }
  ];

  initialResellers.forEach(res => {
    alasql('INSERT INTO resellers VALUES (?, ?, ?, ?, ?, ?, ?)', [
      res.id, res.name, res.domain, res.status, res.rate_limit, res.orders_count, res.last_active
    ]);
  });

  const shopifySeed: CanonicalOrder = {
    sourceSystem: 'shopify',
    sourceOrderId: 'SH-84920',
    customerEmail: 'alice.miller@icloud.com',
    items: [
      { sku: 'VNTG-TEE-BLK', quantity: 2, unitPrice: 3500, currency: 'USD' },
      { sku: 'DENIM-JKT-L', quantity: 1, unitPrice: 12000, currency: 'USD' }
    ],
    totalAmount: 20520, // $190 + $15.20 tax
    taxAmount: 1520,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  };

  const csvSeed: CanonicalOrder = {
    sourceSystem: 'legacy_csv',
    sourceOrderId: 'REC-30911',
    customerEmail: 'b2b-purchaser@industrial.corp',
    items: [
      { sku: 'STEEL-RIVET-100', quantity: 5, unitPrice: 8000, currency: 'USD' }
    ],
    totalAmount: 40000,
    taxAmount: 0,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  };

  const ediSeed: CanonicalOrder = {
    sourceSystem: 'edi',
    sourceOrderId: 'EDIPO-904128',
    customerEmail: 'edi-partner@b2b.system',
    items: [
      { sku: 'BULK-PALLET-A', quantity: 3, unitPrice: 25000, currency: 'USD' },
    ],
    totalAmount: 75000,
    taxAmount: 0,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  };

  postOrderToSimulatedLedger(shopifySeed, true); // True posts to Cash
  postOrderToSimulatedLedger(csvSeed, false);   // False posts to Accounts Receivable (invoice terms)
  postOrderToSimulatedLedger(ediSeed, false);   // B2B purchases go to A/R

  // Save the newly seeded data structure to snapshot
  saveDatabaseToFile();
}

// Ledger posting utility generating Double-Entry balancing and standard compliant PostgreSQL commands
function postOrderToSimulatedLedger(order: CanonicalOrder, postedToCash = true): { transaction: DBTransaction; entries: JournalEntry[] } {
  // Check if already exists in transactions table using AlaSQL
  const exists = alasql('SELECT id FROM transactions WHERE source_system = ? AND source_id = ?', [order.sourceSystem, order.sourceOrderId]) as any[];
  if (exists && exists.length > 0) {
    throw new Error(`Transaction conflict: Source (${order.sourceSystem}) ID (${order.sourceOrderId}) was already posted to general ledger.`);
  }

  const transactionId = `tx-${Math.random().toString(36).substring(2, 9)}`;
  const skus = (order.items || []).map(i => i.sku).filter(Boolean).join(', ');
  const customerEmail = order.customerEmail || '';
  const description = `Normalized sales transaction [Source: ${order.sourceSystem.toUpperCase()} #${order.sourceOrderId}]${customerEmail ? ` - Customer: ${customerEmail}` : ''}${skus ? ` | SKU: ${skus}` : ''}`;
  const postedAt = order.createdAt || new Date();

  // 1. Generate SQL representation matching the PostgreSQL blueprint
  const escapedDesc = description.replace(/'/g, "''");
  let sqlText = `-- PostgreSQL Transaction Posting block\nBEGIN;\n\n`;
  sqlText += `INSERT INTO transactions (id, source_system, source_id, description, posted_at, created_at, sql_generated)\n`;
  sqlText += `VALUES ('${transactionId}', '${order.sourceSystem}', '${order.sourceOrderId}', '${escapedDesc}', '${postedAt.toISOString()}', '${new Date().toISOString()}', '');\n\n`;

  // Create temporary accounting journals
  const debitAccountId = postedToCash ? 'acc-cash' : 'acc-ar';
  const debitAccountCode = postedToCash ? '1010' : '1200';
  const debitAccountName = postedToCash ? 'Cash' : 'Accounts Receivable';

  const entriesList: JournalEntry[] = [];

  // Rules:
  // 1. Debit Cash/AR for the full TotalAmount
  const dbEntryDebit: JournalEntry = {
    id: `je-${Math.random().toString(36).substring(2, 9)}`,
    transactionId,
    accountId: debitAccountId,
    debitAmount: order.totalAmount,
    creditAmount: 0,
    createdAt: new Date()
  };
  entriesList.push(dbEntryDebit);
  sqlText += `-- Debit: Increase financial Asset (${debitAccountName})\n`;
  sqlText += `INSERT INTO journal_entries (id, transaction_id, account_id, debit_amount, credit_amount, created_at)\n`;
  sqlText += `VALUES ('${dbEntryDebit.id}', '${transactionId}', (SELECT id FROM accounts WHERE code = '${debitAccountCode}'), ${order.totalAmount}, 0, '${dbEntryDebit.createdAt.toISOString()}');\n\n`;

  // 2. Credit Sales Revenue (totalAmount - taxAmount)
  const revenueCents = order.totalAmount - order.taxAmount;
  if (revenueCents > 0) {
    const dbEntryRev: JournalEntry = {
      id: `je-${Math.random().toString(36).substring(2, 9)}`,
      transactionId,
      accountId: 'acc-revenue',
      debitAmount: 0,
      creditAmount: revenueCents,
      createdAt: new Date()
    };
    entriesList.push(dbEntryRev);
    sqlText += `-- Credit: Record Sales revenue\n`;
    sqlText += `INSERT INTO journal_entries (id, transaction_id, account_id, debit_amount, credit_amount, created_at)\n`;
    sqlText += `VALUES ('${dbEntryRev.id}', '${transactionId}', (SELECT id FROM accounts WHERE code = '4010'), 0, ${revenueCents}, '${dbEntryRev.createdAt.toISOString()}');\n\n`;
  }

  // 3. Credit Tax Payable (taxAmount)
  if (order.taxAmount > 0) {
    const dbEntryTax: JournalEntry = {
      id: `je-${Math.random().toString(36).substring(2, 9)}`,
      transactionId,
      accountId: 'acc-tax',
      debitAmount: 0,
      creditAmount: order.taxAmount,
      createdAt: new Date()
    };
    entriesList.push(dbEntryTax);
    sqlText += `-- Credit: Record Liability output tax code\n`;
    sqlText += `INSERT INTO journal_entries (id, transaction_id, account_id, debit_amount, credit_amount, created_at)\n`;
    sqlText += `VALUES ('${dbEntryTax.id}', '${transactionId}', (SELECT id FROM accounts WHERE code = '2200'), 0, ${order.taxAmount}, '${dbEntryTax.createdAt.toISOString()}');\n\n`;
  }

  sqlText += `COMMIT;\n`;

  const newTx: DBTransaction = {
    id: transactionId,
    sourceSystem: order.sourceSystem,
    sourceId: order.sourceOrderId,
    description,
    postedAt,
    createdAt: new Date(),
    sqlGenerated: sqlText,
    customerEmail,
    sku: skus
  };

  // Run AlaSQL executions
  alasql('INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
    newTx.id,
    newTx.sourceSystem,
    newTx.sourceId,
    newTx.description,
    newTx.postedAt.toISOString(),
    newTx.createdAt.toISOString(),
    newTx.sqlGenerated,
    newTx.customerEmail || '',
    newTx.sku || ''
  ]);

  entriesList.forEach(entry => {
    alasql('INSERT INTO journal_entries VALUES (?, ?, ?, ?, ?, ?)', [
      entry.id,
      entry.transactionId,
      entry.accountId,
      entry.debitAmount,
      entry.creditAmount,
      entry.createdAt.toISOString()
    ]);
  });

  // Save the newly added transaction to local file backup for persistence
  saveDatabaseToFile();

  return { transaction: newTx, entries: entriesList };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add body parsers for high payload parsing sizes
  app.use(express.json({ limit: '10mb' }));

  // Seed on startup
  seedInitialTransactions();

  // API 1: Test Server Health
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date() });
  });

  // Client Custom Branding API
  const BRANDING_FILE_PATH = path.join(process.cwd(), 'branding_state.json');

  app.get('/api/branding', (req, res) => {
    try {
      if (fs.existsSync(BRANDING_FILE_PATH)) {
        const dataStr = fs.readFileSync(BRANDING_FILE_PATH, 'utf8');
        const parsed = JSON.parse(dataStr);
        return res.json({ success: true, ...parsed });
      }
      return res.json({ success: false, message: 'No custom branding stored on server' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/branding', (req, res) => {
    try {
      const { customTexts, erpTopologyImg, controllerAvatarImg, lockedFields, isAdminMode } = req.body;
      const dataToSave = {
        customTexts: customTexts || null,
        erpTopologyImg: erpTopologyImg || null,
        controllerAvatarImg: controllerAvatarImg || null,
        lockedFields: lockedFields || null,
        isAdminMode: isAdminMode !== undefined ? isAdminMode : null,
      };
      fs.writeFileSync(BRANDING_FILE_PATH, JSON.stringify(dataToSave, null, 2), 'utf8');
      return res.json({ success: true, message: 'Custom branding successfully persisted on master server' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Client Procurement & Purchasing Lifecycle API
  const PROCUREMENT_FILE_PATH = path.join(process.cwd(), 'procurement_state.json');

  // Helper inside server to ensure seed data for Procurement exists
  function getProcurementBackup() {
    try {
      if (fs.existsSync(PROCUREMENT_FILE_PATH)) {
        const dataStr = fs.readFileSync(PROCUREMENT_FILE_PATH, 'utf8');
        return JSON.parse(dataStr);
      }
    } catch (e) {
      console.error('Failed to read procurement state', e);
    }

    // Default Seed Data
    const defaultPOs = [
      {
        id: 'PO-2026-608',
        entity: 'CloudboyX Americas LLC',
        department: 'Operations & Engineering',
        costCenter: 'CC-900',
        vendorName: 'Apex Logistics Supply',
        vendorEmail: 'billing@apexlogistics.com',
        items: [
          { id: 'i-1', sku: 'STEEL-RIVET-100', name: 'Industrial Grade Reinforced Steel Rivets', quantity: 500, unitPrice: 15 }, // $75.00
          { id: 'i-2', sku: 'CAB-FBR-OP', name: 'Fiber Optic High-Speed Network Cabling (100m)', quantity: 15, unitPrice: 3200 } // $480.00
        ],
        totalAmount: 55500, // $555.00 in cents
        status: 'PAID',
        approvalChain: [
          { role: 'Requestor (Engineer Julie)', approverEmail: 'julie@cloudboyx.net', status: 'APPROVED', comment: 'Network expansion materials', actionDate: '2026-06-15T09:00:00Z' },
          { role: 'Department Chief (Head of Ops)', approverEmail: 'ops-boss@cloudboyx.net', status: 'APPROVED', comment: 'Approved. Essential infrastructure.', actionDate: '2026-06-15T10:15:00Z' },
          { role: 'CFO (Financial Director)', approverEmail: 'clara-cfo@cloudboyx.net', status: 'APPROVED', comment: 'Verified budget availability.', actionDate: '2026-06-15T11:00:00Z' }
        ],
        currentApprovalLevel: 3,
        createdAt: '2026-06-15T08:30:00Z',
        updatedAt: '2026-06-15T11:30:00Z',
        commitmentTxId: 'tx-po-commit-608',
        matchingTxId: 'tx-po-gr-608',
        paymentTxId: 'tx-po-pay-608'
      },
      {
        id: 'PO-2026-724',
        entity: 'CloudboyX Europe GmbH',
        department: 'Research & Development',
        costCenter: 'CC-801',
        vendorName: 'München Lab Instruments',
        vendorEmail: 'europe@munichlab.de',
        items: [
          { id: 'i-3', sku: 'LAB-PH-SENS', name: 'Precision pH Electrochemical Sensor probes', quantity: 4, unitPrice: 12500 } // $500.00
        ],
        totalAmount: 50000, // $500.00
        status: 'COMMITTED',
        approvalChain: [
          { role: 'Requestor (Lab Tech)', approverEmail: 'tech-clara@cloudboyx.net', status: 'APPROVED', comment: 'pH probes calibration replenishment', actionDate: '2026-06-16T14:22:00Z' },
          { role: 'Department Chief (Head of R&D)', approverEmail: 'rd-chief@cloudboyx.net', status: 'APPROVED', comment: 'Crucial for clinical test stream.', actionDate: '2026-06-16T15:10:00Z' },
          { role: 'CFO (Financial Director)', approverEmail: 'clara-cfo@cloudboyx.net', status: 'PENDING', comment: '', actionDate: '' }
        ],
        currentApprovalLevel: 2,
        createdAt: '2026-06-16T14:00:00Z',
        updatedAt: '2026-06-16T15:10:00Z',
        commitmentTxId: ''
      }
    ];

    try {
      fs.writeFileSync(PROCUREMENT_FILE_PATH, JSON.stringify(defaultPOs, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to write default procurement seeds', e);
    }
    return defaultPOs;
  }

  app.get('/api/procurement', (req, res) => {
    try {
      const pos = getProcurementBackup();
      return res.json({ success: true, pos });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/procurement', (req, res) => {
    try {
      const newPos = req.body.pos;
      if (!newPos || !Array.isArray(newPos)) {
        return res.status(400).json({ success: false, error: 'Expected POs array structure' });
      }
      fs.writeFileSync(PROCUREMENT_FILE_PATH, JSON.stringify(newPos, null, 2), 'utf8');
      return res.json({ success: true, message: 'Procurement state written successfully' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // End-to-end procurement transaction ledger poster and workflow transitioner
  app.post('/api/procurement/transition', (req, res) => {
    try {
      const { poId, action, comment, approverEmail } = req.body;
      const pos = getProcurementBackup();
      const poIndex = pos.findIndex((p: any) => p.id === poId);

      if (poIndex === -1) {
        return res.status(404).json({ success: false, error: 'Procurement PO document not found' });
      }

      const po = pos[poIndex];
      const nowString = new Date().toISOString();
      let sqlGenerated = '';
      
      // We will perform the selected action
      if (action === 'APPROVE') {
        const level = po.currentApprovalLevel;
        if (level < po.approvalChain.length) {
          po.approvalChain[level].status = 'APPROVED';
          po.approvalChain[level].comment = comment || 'Approved in portal bulk flow.';
          po.approvalChain[level].actionDate = nowString;
          po.currentApprovalLevel += 1;
        }

        // If newly fully approved, transition to COMMITTED and post PO commitment double-entry
        if (po.currentApprovalLevel === po.approvalChain.length && po.status === 'DRAFT') {
          po.status = 'COMMITTED';
          
          // Double-entry 1: Commitment Entry
          // Debit: Procurement Commitments (acc-po-commitment: 1900)
          // Credit: Accrued Purchase Commitments (acc-po-reserve: 2400)
          const transactionId = `tx-po-commit-${Math.random().toString(36).substring(2, 8)}`;
          po.commitmentTxId = transactionId;
          const description = `PO Commitment [Entity: ${po.entity}, PO: ${po.id}, CC: ${po.costCenter}, Dept: ${po.department}]`;
          const escapedDesc = description.replace(/'/g, "''");

          sqlGenerated += `-- Phase 1: Post Approved PO Commitment\nBEGIN;\n`;
          sqlGenerated += `INSERT INTO transactions (id, source_system, source_id, description, posted_at, created_at, sql_generated)\n`;
          sqlGenerated += `VALUES ('${transactionId}', 'procurement', '${po.id}', '${escapedDesc}', '${nowString}', '${nowString}', '');\n\n`;

          const jeId1 = `je-poc-${Math.random().toString(36).substring(2, 8)}`;
          const jeId2 = `je-poc-${Math.random().toString(36).substring(2, 8)}`;

          // Insert AlaSQL records directly
          alasql('INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            transactionId, 'procurement', po.id, description, nowString, nowString, '', 'procurement@cloudboyx.corp', po.items?.[0]?.sku || 'PO-COMMITMENT'
          ]);
          alasql('INSERT INTO journal_entries VALUES (?, ?, ?, ?, ?, ?)', [
            jeId1, transactionId, 'acc-po-commitment', po.totalAmount, 0, nowString
          ]);
          alasql('INSERT INTO journal_entries VALUES (?, ?, ?, ?, ?, ?)', [
            jeId2, transactionId, 'acc-po-reserve', 0, po.totalAmount, nowString
          ]);

          sqlGenerated += `-- Debit: Increase Committed Contract purchase limits\n`;
          sqlGenerated += `INSERT INTO journal_entries (id, transaction_id, account_id, debit_amount, credit_amount, created_at)\n`;
          sqlGenerated += `VALUES ('${jeId1}', '${transactionId}', 'acc-po-commitment', ${po.totalAmount}, 0, '${nowString}');\n\n`;

          sqlGenerated += `-- Credit: Record Accrued commitment reserves obligation\n`;
          sqlGenerated += `INSERT INTO journal_entries (id, transaction_id, account_id, debit_amount, credit_amount, created_at)\n`;
          sqlGenerated += `VALUES ('${jeId2}', '${transactionId}', 'acc-po-reserve', 0, ${po.totalAmount}, '${nowString}');\nCOMMIT;\n`;
        }
      } 
      else if (action === 'RECEIVE') {
        if (po.status !== 'COMMITTED') {
          return res.status(400).json({ success: false, error: 'PO must be in COMMITTED state to log receipt.' });
        }
        po.status = 'RECEIVED';
        
        // Double-entry 2: Goods Receipt
        // Step A: Reverse PO Commitment (Debit acc-po-reserve 2400, Credit acc-po-commitment 1900)
        // Step B: Record Inventory Goods (Debit acc-inventory 1400, Credit acc-accrued-ap 2150)
        const trIdCollapse = `tx-po-rvs-${Math.random().toString(36).substring(2, 8)}`;
        const trIdReceipt = `tx-po-gr-${Math.random().toString(36).substring(2, 8)}`;
        po.matchingTxId = trIdReceipt;

        const rvsDesc = `PO commitment reversal on GR [Entity: ${po.entity}, PO: ${po.id}]`;
        const grDesc = `Goods receipt accrual [Entity: ${po.entity}, PO: ${po.id}, CC: ${po.costCenter}, Dept: ${po.department}]`;

        alasql('INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [trIdCollapse, 'procurement', `${po.id}-RVS`, rvsDesc, nowString, nowString, '', 'procurement@cloudboyx.corp', po.items?.[0]?.sku || 'PO-COMMITMENT']);
        const rvsJe1 = `je-rvs-${Math.random().toString(36).substring(2, 8)}`;
        const rvsJe2 = `je-rvs-${Math.random().toString(36).substring(2, 8)}`;
        alasql('INSERT INTO journal_entries VALUES (?, ?, ?, ?, ?, ?)', [rvsJe1, trIdCollapse, 'acc-po-reserve', po.totalAmount, 0, nowString]);
        alasql('INSERT INTO journal_entries VALUES (?, ?, ?, ?, ?, ?)', [rvsJe2, trIdCollapse, 'acc-po-commitment', 0, po.totalAmount, nowString]);

        alasql('INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [trIdReceipt, 'procurement', `${po.id}-GR`, grDesc, nowString, nowString, '', 'warehouse@cloudboyx.corp', po.items?.[0]?.sku || 'PO-GR']);
        const grJe1 = `je-gr-${Math.random().toString(36).substring(2, 8)}`;
        const grJe2 = `je-gr-${Math.random().toString(36).substring(2, 8)}`;
        alasql('INSERT INTO journal_entries VALUES (?, ?, ?, ?, ?, ?)', [grJe1, trIdReceipt, 'acc-inventory', po.totalAmount, 0, nowString]);
        alasql('INSERT INTO journal_entries VALUES (?, ?, ?, ?, ?, ?)', [grJe2, trIdReceipt, 'acc-accrued-ap', 0, po.totalAmount, nowString]);

        sqlGenerated += `-- Phase 2: Collapse Contract Commitment\nBEGIN;\n`;
        sqlGenerated += `INSERT INTO transactions VALUES ('${trIdCollapse}', 'procurement', '${po.id}-RVS', '${rvsDesc.replace(/'/g, "''")}', '${nowString}', '${nowString}', '');\n`;
        sqlGenerated += `INSERT INTO journal_entries VALUES ('${rvsJe1}', '${trIdCollapse}', 'acc-po-reserve', ${po.totalAmount}, 0, '${nowString}');\n`;
        sqlGenerated += `INSERT INTO journal_entries VALUES ('${rvsJe2}', '${trIdCollapse}', 'acc-po-commitment', 0, ${po.totalAmount}, '${nowString}');\nCOMMIT;\n\n`;

        sqlGenerated += `-- Phase 3: Book Accrued Asset Received\nBEGIN;\n`;
        sqlGenerated += `INSERT INTO transactions VALUES ('${trIdReceipt}', 'procurement', '${po.id}-GR', '${grDesc.replace(/'/g, "''")}', '${nowString}', '${nowString}', '');\n`;
        sqlGenerated += `INSERT INTO journal_entries VALUES ('${grJe1}', '${trIdReceipt}', 'acc-inventory', ${po.totalAmount}, 0, '${nowString}');\n`;
        sqlGenerated += `INSERT INTO journal_entries VALUES ('${grJe2}', '${trIdReceipt}', 'acc-accrued-ap', 0, ${po.totalAmount}, '${nowString}');\nCOMMIT;\n`;
      } 
      else if (action === 'MATCH_INVOICE') {
        if (po.status !== 'RECEIVED') {
          return res.status(400).json({ success: false, error: 'PO must be RECEIVED to record 3-way matching.' });
        }
        po.status = 'INVOICE_MATCHED';

        // Double-entry 3: Reclassify Goods Received Accrual to Accounts Payable
        // Debit: Accrued AP (acc-accrued-ap: 2150)
        // Credit: Accounts Payable (acc-ap: 2100)
        const trIdMatched = `tx-po-im-${Math.random().toString(36).substring(2, 8)}`;
        const imDesc = `3-way Invoice Match [Entity: ${po.entity}, PO: ${po.id}, Vendor: ${po.vendorName}]`;

        alasql('INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [trIdMatched, 'procurement', `${po.id}-IM`, imDesc, nowString, nowString, '', 'ap-invoices@cloudboyx.corp', po.items?.[0]?.sku || 'PO-IM']);
        const imJe1 = `je-im-${Math.random().toString(36).substring(2, 8)}`;
        const imJe2 = `je-im-${Math.random().toString(36).substring(2, 8)}`;
        alasql('INSERT INTO journal_entries VALUES (?, ?, ?, ?, ?, ?)', [imJe1, trIdMatched, 'acc-accrued-ap', po.totalAmount, 0, nowString]);
        alasql('INSERT INTO journal_entries VALUES (?, ?, ?, ?, ?, ?)', [imJe2, trIdMatched, 'acc-ap', 0, po.totalAmount, nowString]);

        sqlGenerated += `-- Phase 4: Match Supplier Invoice and Finalize Accounts Payable\nBEGIN;\n`;
        sqlGenerated += `INSERT INTO transactions VALUES ('${trIdMatched}', 'procurement', '${po.id}-IM', '${imDesc.replace(/'/g, "''")}', '${nowString}', '${nowString}', '');\n`;
        sqlGenerated += `INSERT INTO journal_entries VALUES ('${imJe1}', '${trIdMatched}', 'acc-accrued-ap', ${po.totalAmount}, 0, '${nowString}');\n`;
        sqlGenerated += `INSERT INTO journal_entries VALUES ('${imJe2}', '${trIdMatched}', 'acc-ap', 0, ${po.totalAmount}, '${nowString}');\nCOMMIT;\n`;
      } 
      else if (action === 'PAY') {
        if (po.status !== 'INVOICE_MATCHED') {
          return res.status(400).json({ success: false, error: 'PO must be in INVOICE_MATCHED status to settle payment journal.' });
        }
        po.status = 'PAID';

        // Double-entry 4: Settle Accounts Payable
        // Debit: Accounts Payable (acc-ap: 2100)
        // Credit: Cash (acc-cash: 1010)
        const trIdPay = `tx-po-pay-${Math.random().toString(36).substring(2, 8)}`;
        po.paymentTxId = trIdPay;
        const payDesc = `Vendor payment settlement [Entity: ${po.entity}, PO: ${po.id}, Vendor: ${po.vendorName}]`;

        alasql('INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [trIdPay, 'procurement', `${po.id}-PAY`, payDesc, nowString, nowString, '', 'treasury@cloudboyx.corp', po.items?.[0]?.sku || 'PO-PAY']);
        const payJe1 = `je-pay-${Math.random().toString(36).substring(2, 8)}`;
        const payJe2 = `je-pay-${Math.random().toString(36).substring(2, 8)}`;
        alasql('INSERT INTO journal_entries VALUES (?, ?, ?, ?, ?, ?)', [payJe1, trIdPay, 'acc-ap', po.totalAmount, 0, nowString]);
        alasql('INSERT INTO journal_entries VALUES (?, ?, ?, ?, ?, ?)', [payJe2, trIdPay, 'acc-cash', 0, po.totalAmount, nowString]);

        sqlGenerated += `-- Phase 5: Liquidate AP via Treasury Cash Outflow\nBEGIN;\n`;
        sqlGenerated += `INSERT INTO transactions VALUES ('${trIdPay}', 'procurement', '${po.id}-PAY', '${payDesc.replace(/'/g, "''")}', '${nowString}', '${nowString}', '');\n`;
        sqlGenerated += `INSERT INTO journal_entries VALUES ('${payJe1}', '${trIdPay}', 'acc-ap', ${po.totalAmount}, 0, '${nowString}');\n`;
        sqlGenerated += `INSERT INTO journal_entries VALUES ('${payJe2}', '${trIdPay}', 'acc-cash', 0, ${po.totalAmount}, '${nowString}');\nCOMMIT;\n`;
      }
      else if (action === 'REJECT') {
        const level = po.currentApprovalLevel;
        if (level < po.approvalChain.length) {
          po.approvalChain[level].status = 'REJECTED';
          po.approvalChain[level].comment = comment || 'Rejected during review.';
          po.approvalChain[level].actionDate = nowString;
        }
        po.status = 'REJECTED';
      }

      po.updatedAt = nowString;
      pos[poIndex] = po;

      fs.writeFileSync(PROCUREMENT_FILE_PATH, JSON.stringify(pos, null, 2), 'utf8');
      saveDatabaseToFile(); // Persist AlaSQL updates to db_state.json

      return res.json({
        success: true,
        message: `Successfully executed ${action} action on procurement document ${poId}`,
        po,
        sqlGenerated
      });

    } catch (err: any) {
      return res.status(550).json({ success: false, error: err.message });
    }
  });

  // ────────────────────────────────────────────────────────
  // ZERO-COST LOCAL & SELF-HOSTED AUTHENTICATION API
  // No Google Cloud Identity, No Firebase, $0.00 Running Cost
  // ────────────────────────────────────────────────────────
  app.get('/api/auth/status', (req, res) => {
    try {
      const userCount = (alasql('SELECT COUNT(*) as cnt FROM users') as any[])[0]?.cnt || 0;
      res.json({
        success: true,
        mode: 'self_hosted_zero_cost',
        provider: 'Native Server Cryptographic Auth',
        cloudCost: '$0.00 / month',
        requiresFirebase: false,
        requiresGCPBilling: false,
        registeredUsersCount: userCount,
        description: 'Zero-cost authentication running entirely in-memory with SHA-256 salted hashes and disk persistence. No Google Cloud Identity, no Firebase, and zero billing fees.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, password, company, planType, selectedModules, billingCycle, monthlyPrice } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ success: false, error: 'Full name, email, and password are required.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const existing = alasql('SELECT id FROM users WHERE email = ?', [cleanEmail]) as any[];
      if (existing && existing.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'An account with this email address is already registered. Please sign in instead.' 
        });
      }

      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = hashPassword(password, salt);
      const userId = `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      const cleanName = name.trim();
      const cleanCompany = (company || '').trim() || (cleanEmail.includes('@') ? cleanEmail.split('@')[1].split('.')[0].toUpperCase() + ' Corp' : 'Enterprise Corp');
      const plan = planType || 'full_suite';
      const modules = Array.isArray(selectedModules) ? selectedModules : ['ledger', 'ingress', 'procurement'];
      const cycle = billingCycle || 'annual';
      const createdAt = new Date().toISOString();

      alasql('INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        userId,
        cleanName,
        cleanEmail,
        passwordHash,
        salt,
        cleanCompany,
        plan,
        JSON.stringify(modules),
        cycle,
        createdAt
      ]);

      saveDatabaseToFile();

      const initials = cleanName.split(' ').length >= 2
        ? (cleanName.split(' ')[0][0] + cleanName.split(' ')[1][0]).toUpperCase()
        : cleanName.substring(0, 2).toUpperCase();

      const user = {
        name: cleanName,
        email: cleanEmail,
        company: cleanCompany,
        planType: plan,
        selectedModules: modules,
        billingCycle: cycle,
        monthlyPrice: monthlyPrice || (plan === 'full_suite' ? 959 : 499),
        signedIn: true,
        avatarInitials: initials
      };

      console.log(`✓ [Zero-Cost Auth] Registered user ${cleanEmail} (${cleanCompany}) without external cloud charges.`);
      res.json({ success: true, message: 'Account registered successfully with zero cloud fees!', user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required.' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const rows = alasql('SELECT * FROM users WHERE email = ?', [cleanEmail]) as any[];

      if (!rows || rows.length === 0) {
        // Check if demo email with fallback demo password
        if (cleanEmail === 'elena.vance@omniretail.global' && (password === 'demo1234' || password === 'password123')) {
          const demoUser = {
            name: 'Elena Vance, CPA',
            email: 'elena.vance@omniretail.global',
            company: 'OmniRetail Global Enterprise',
            planType: 'full_suite',
            selectedModules: ['ledger', 'ingress', 'procurement'],
            billingCycle: 'annual',
            monthlyPrice: 959,
            signedIn: true,
            avatarInitials: 'EV'
          };
          return res.json({ success: true, user: demoUser });
        }

        return res.status(401).json({ 
          success: false, 
          error: 'No account found with this email. Please check your spelling or sign up.' 
        });
      }

      const userRow = rows[0];
      const computedHash = hashPassword(password, userRow.salt);

      if (computedHash !== userRow.password_hash) {
        // Special case: allow demo password for demo user
        if (cleanEmail === 'elena.vance@omniretail.global' && (password === 'demo1234' || password === 'password123')) {
          // allow
        } else {
          return res.status(401).json({ success: false, error: 'Incorrect password. Please verify and try again.' });
        }
      }

      let parsedModules = ['ledger', 'ingress', 'procurement'];
      try {
        parsedModules = JSON.parse(userRow.modules);
      } catch {}

      const cleanName = userRow.name;
      const initials = cleanName.split(' ').length >= 2
        ? (cleanName.split(' ')[0][0] + cleanName.split(' ')[1][0]).toUpperCase()
        : cleanName.substring(0, 2).toUpperCase();

      const user = {
        name: userRow.name,
        email: userRow.email,
        company: userRow.company,
        planType: userRow.plan_type,
        selectedModules: parsedModules,
        billingCycle: userRow.billing_cycle,
        monthlyPrice: userRow.plan_type === 'full_suite' ? 959 : 499,
        signedIn: true,
        avatarInitials: initials
      };

      console.log(`✓ [Zero-Cost Auth] Authenticated user ${cleanEmail} successfully.`);
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Reseller Domain Controller API Endpoints
  app.get('/api/resellers', (req, res) => {
    try {
      const rows = (alasql('SELECT * FROM resellers') as any[]) || [];
      const resellers = rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        domain: r.domain,
        status: r.status,
        rateLimit: Number(r.rate_limit || 0),
        ordersCount: Number(r.orders_count || 0),
        lastActive: r.last_active
      }));
      res.json({ success: true, resellers });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/resellers', (req, res) => {
    try {
      const { id, name, domain, status, rateLimit } = req.body;
      const resellerId = id || `resell-${Math.random().toString(36).substring(2, 9)}`;
      
      const exists = alasql('SELECT id FROM resellers WHERE id = ?', [resellerId]) as any[];
      if (exists && exists.length > 0) {
        alasql('UPDATE resellers SET name = ?, domain = ?, status = ?, rate_limit = ? WHERE id = ?', [
          name, domain, status, Number(rateLimit || 0), resellerId
        ]);
      } else {
        alasql('INSERT INTO resellers VALUES (?, ?, ?, ?, ?, ?, ?)', [
          resellerId, name, domain, status || 'Pending', Number(rateLimit || 100), 0, 'Never'
        ]);
      }
      
      saveDatabaseToFile();
      res.json({ success: true, message: 'Reseller updated/created successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/resellers/toggle', (req, res) => {
    try {
      const { id, status } = req.body;
      alasql('UPDATE resellers SET status = ? WHERE id = ?', [status, id]);
      saveDatabaseToFile();
      res.json({ success: true, message: `Reseller status shifted to ${status}` });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/resellers/delete', (req, res) => {
    try {
      const { id } = req.body;
      alasql('DELETE FROM resellers WHERE id = ?', [id]);
      saveDatabaseToFile();
      res.json({ success: true, message: 'Reseller removed successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/resellers/simulate', (req, res) => {
    try {
      const { resellerDomain, sku, quantity, amount, email } = req.body;
      
      // Look up reseller by domain to verify if allowed domain is active (given "the auth to go through")
      const resellers = alasql('SELECT * FROM resellers WHERE domain = ?', [resellerDomain.toLowerCase().trim()]) as any[];
      if (!resellers || resellers.length === 0) {
        return res.status(403).json({ 
          success: false, 
          error: `Access Denied: Domain "${resellerDomain}" is not in the system registry.` 
        });
      }
      
      const reseller = resellers[0];
      if (reseller.status !== 'Authorized') {
        return res.status(403).json({ 
          success: false, 
          error: `Authorization Required: Domain "${resellerDomain}" has state "${reseller.status}". Reseller is unauthorized to route transactions.` 
        });
      }
      
      // Reseller is allowed! Update their orders count and last active
      const nowString = new Date().toISOString();
      alasql('UPDATE resellers SET orders_count = orders_count + 1, last_active = ? WHERE id = ?', [
        nowString, reseller.id
      ]);
      
      // Let's create a Canonical Order and post it to General Ledger!
      const newOrder: CanonicalOrder = {
        sourceSystem: 'ai_mapped', // Routed via reseller API
        sourceOrderId: `RSL-${Math.floor(100000 + Math.random() * 900000)}`,
        customerEmail: email || 'shopper@reseller-portal.net',
        items: [{
          sku: sku || 'RESELLER-ITEM-ABC',
          quantity: Number(quantity || 1),
          unitPrice: Math.round(Number(amount || 50) * 100),
          currency: 'USD'
        }],
        totalAmount: Math.round(Number(amount || 50) * Number(quantity || 1) * 100),
        taxAmount: 0,
        createdAt: new Date()
      };
      
      const result = postOrderToSimulatedLedger(newOrder, true); // Sells to Cash
      saveDatabaseToFile();
      
      res.json({ 
        success: true, 
        message: 'Order routed successfully and posted to the General Ledger!',
        resellerName: reseller.name,
        resellerDomain: reseller.domain,
        transactionId: result.transaction.id,
        sql: result.transaction.sqlGenerated
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API 2: Standard Gateway Payload Parsing
  app.post('/api/translate', (req, res) => {
    const { sourceType, payload } = req.body;
    try {
      if (!sourceType || !payload) {
        res.status(400).json({ error: 'Missing sourceType or payload parameter' });
        return;
      }

      let canonical: CanonicalOrder;
      if (sourceType === 'shopify') {
        canonical = UniversalGateway.fromShopifyWebhook(payload);
      } else if (sourceType === 'legacy_csv') {
        canonical = UniversalGateway.fromLegacyCSVRow(payload);
      } else if (sourceType === 'edi') {
        canonical = UniversalGateway.fromEDIPayload(payload);
      } else if (sourceType === 'manual') {
        // Manual translation validation
        const items = (payload.items || []).map((i: any) => ({
          sku: i.sku || 'UNKNOWN-SKU',
          quantity: parseInt(i.quantity || '0', 10),
          unitPrice: Math.round(parseFloat(i.unitPrice || '0') * 100),
          currency: i.currency || 'USD'
        }));
        const total = Math.round(parseFloat(payload.totalAmount || '0') * 100);
        const tax = Math.round(parseFloat(payload.taxAmount || '0') * 100);

        canonical = {
          sourceSystem: 'manual',
          sourceOrderId: payload.sourceOrderId || `MN-${Date.now().toString().slice(-6)}`,
          customerEmail: payload.customerEmail || 'manual@system.local',
          items,
          totalAmount: total,
          taxAmount: tax,
          createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date()
        };
      } else {
        res.status(400).json({ error: 'Unsupported sourceType format parameter' });
        return;
      }

      res.json({ success: true, order: canonical });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // API 3: AI-Powered Custom File Schema Mapping using Gemini 3.5 Flash
  app.post('/api/ai-map', async (req, res) => {
    const { rawData, notes } = req.body;
    try {
      if (!rawData) {
        res.status(400).json({ error: 'Please supply raw text feed data for AI structure translation.' });
        return;
      }

      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        res.status(500).json({
          error: 'GEMINI_API_KEY environment variable is not defined. Please configure a secret in AI Studio Settings.'
        });
        return;
      }

      const client = getGeminiClient();

      const systemInstruction = `
        You are a seasoned ERP translation gateway system integrated with a general ledger.
        Your responsibility is to analyze arbitrary raw billing logs, files (including irregular JSON, custom XML, or semi-structured plain text order notifications), extract key information, and structure it exactly matching the Canonical schema model.
        
        Mandatory rules:
        1. Always output prices, sub-totals, and total Amounts converted into INTEGER CENTS (e.g. $10.50 must be extracted as 1050).
        2. Attempt to parse line items successfully. If individual quantities or prices are missing, make a realistic guess or compute backwards from the totals.
        3. Assign a reasonable identifier to "sourceOrderId" (look for identifiers like Order ID, Invoice, Record No, or create a clean deterministic MD5/alphanumeric reference).
        4. Populate totalAmount and taxAmount. Total amount must include the unit prices multiplied by quantities, plus tax.
        5. Populate items correctly. Ensure each has a valid SKU, integer unitPrice (in cents), quantity (integer), and currency code (default to USD if not indicated).
        6. Explicit custom mapping user instructions: ${notes || 'none'}.
      `;

      const promptText = `
        Convert the following actual messy raw transactional order document or payload into standardized JSON format adhering to the response schema requested.
        
        --- RAW TRANSACTION ENTRY ---
        ${rawData}
        --- END DATA ---
      `;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptText,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sourceOrderId: { type: Type.STRING, description: 'Derived or designated order ID' },
              customerEmail: { type: Type.STRING, description: 'Customer email address. Defaults to customer@unknown.local' },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sku: { type: Type.STRING, description: 'Item Stock Keeping Unit code' },
                    quantity: { type: Type.INTEGER, description: 'Item quantity purchased' },
                    unitPrice: { type: Type.INTEGER, description: 'Unit price in integer CENTS (e.g., $15.99 -> 1599)' },
                    currency: { type: Type.STRING, description: 'Standard 3-letter currency code, e.g. USD' }
                  },
                  required: ['sku', 'quantity', 'unitPrice', 'currency']
                }
              },
              totalAmount: { type: Type.INTEGER, description: 'Total Order amount in integer cents' },
              taxAmount: { type: Type.INTEGER, description: 'Applicable calculated or stated tax in integer cents' }
            },
            required: ['sourceOrderId', 'customerEmail', 'items', 'totalAmount', 'taxAmount']
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Gemini model yielded empty translation text output.');
      }

      const parsedJSON = JSON.parse(responseText.trim());

      // Prepare official canonical model object
      const mappedOrder: CanonicalOrder = {
        sourceSystem: 'ai_mapped',
        sourceOrderId: parsedJSON.sourceOrderId || `AI-${Math.floor(Math.random() * 900000 + 100000)}`,
        customerEmail: parsedJSON.customerEmail || 'ai-mapping@processed.local',
        items: (parsedJSON.items || []).map((item: any) => ({
          sku: item.sku || 'UNMAPPED-SKU',
          quantity: typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity || '1', 10),
          unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : Math.round(parseFloat(item.unitPrice || '0') * 100),
          currency: item.currency || 'USD'
        })),
        totalAmount: typeof parsedJSON.totalAmount === 'number' ? parsedJSON.totalAmount : Math.round(parseFloat(parsedJSON.totalAmount || '0') * 100),
        taxAmount: typeof parsedJSON.taxAmount === 'number' ? parsedJSON.taxAmount : Math.round(parseFloat(parsedJSON.taxAmount || '0') * 100),
        createdAt: new Date()
      };

      res.json({ success: true, order: mappedOrder, rawAIResponse: parsedJSON });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API 4: Get Chart of Accounts & Ledger Balance Sheets
  app.get('/api/ledger', (req, res) => {
    // Calculate running balance sheet balances
    const activeAccounts = getAccounts();
    const activeTransactions = getTransactions();
    const activeEntries = getJournalEntries();

    const balances = activeAccounts.map(acc => {
      let debitSum = 0;
      let creditSum = 0;
      
      activeEntries.forEach(entry => {
        if (entry.accountId === acc.id) {
          debitSum += entry.debitAmount;
          creditSum += entry.creditAmount;
        }
      });

      // Normal balances rules:
      // Assets & Expenses: Debits increase (+), Credits decrease (-)
      // Liabilities, Equity, Revenues: Credits increase (+), Debits decrease (-)
      let netBalance = 0;
      if (acc.type === 'asset' || acc.type === 'expense') {
        netBalance = debitSum - creditSum;
      } else {
        netBalance = creditSum - debitSum;
      }

      return {
        ...acc,
        debitSum,
        creditSum,
        netBalance // Balance in cents
      };
    });

    res.json({
      accounts: balances,
      transactions: activeTransactions,
      journalEntries: activeEntries,
      auditBalanced: activeEntries.reduce((sum, je) => sum + je.debitAmount, 0) === activeEntries.reduce((sum, je) => sum + je.creditAmount, 0)
    });
  });

  // API 5: Post Normalized Order to General Ledger
  app.post('/api/ledger/post', (req, res) => {
    const { order, postToCash } = req.body;
    try {
      if (!order) {
        res.status(400).json({ error: 'Missing standard canonical order object to commit to ledger database.' });
        return;
      }

      // Convert order dates back if string
      const preparedOrder: CanonicalOrder = {
        ...order,
        createdAt: order.createdAt ? new Date(order.createdAt) : new Date()
      };

      const result = postOrderToSimulatedLedger(preparedOrder, postToCash === undefined ? true : postToCash);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // API 6: Purge transactions database back to initial seeds
  app.post('/api/ledger/reset', (req, res) => {
    try {
      seedInitialTransactions(true);
      res.json({ success: true, message: 'Simulated general ledger reset succeeded' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API 7: High-fidelity Live SQL Simulator Query Console
  app.post('/api/ledger/query', (req, res) => {
    const { sql } = req.body;
    try {
      if (!sql || typeof sql !== 'string') {
        res.status(400).json({ error: 'Please submit a valid SQL raw string query parameter.' });
        return;
      }

      // Execute standard SQL query via AlaSQL
      const result = alasql(sql);

      // If query is a modifying SQL action, save state to disk
      const trimmedUpperSql = sql.trim().toUpperCase();
      if (
        trimmedUpperSql.startsWith('INSERT') ||
        trimmedUpperSql.startsWith('UPDATE') ||
        trimmedUpperSql.startsWith('DELETE') ||
        trimmedUpperSql.startsWith('CREATE') ||
        trimmedUpperSql.startsWith('DROP') ||
        trimmedUpperSql.startsWith('REPLACE') ||
        trimmedUpperSql.startsWith('ALTER')
      ) {
        saveDatabaseToFile();
      }

      let columns: string[] = [];
      let rows: any[] = [];

      if (Array.isArray(result) && result.length > 0) {
        const firstRow = result[0];
        if (typeof firstRow === 'object' && firstRow !== null) {
          columns = Object.keys(firstRow);
          rows = result;
        } else {
          columns = ['result'];
          rows = result.map(val => ({ result: val }));
        }
      } else if (Array.isArray(result)) {
        columns = ['notice'];
        rows = [{ notice: 'Query executed successfully with 0 rows returned.' }];
      } else {
        columns = ['result'];
        rows = [{ result: String(result) }];
      }

      res.json({
        success: true,
        sqlExecuted: sql,
        columns,
        rowCount: rows.length,
        rows
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // API 8: AI-Driven Financial Forecasting & Scenario Planning (S&OP)
  app.get('/api/ai/forecast', async (req, res) => {
    try {
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not defined. Please configure a secret in AI Studio Settings.');
      }

      const client = getGeminiClient();
      const accountsList = getAccounts();
      const transactionsList = getTransactions();
      const journalList = getJournalEntries();

      const stats = accountsList.map(a => {
        let debits = 0, credits = 0;
        journalList.forEach(je => {
          if (je.accountId === a.id) {
            debits += je.debitAmount;
            credits += je.creditAmount;
          }
        });
        const bal = (a.type === 'asset' || a.type === 'expense') ? (debits - credits) : (credits - debits);
        return { code: a.code, name: a.name, netBalanceUSD: bal / 100 };
      });

      const txSummary = transactionsList.slice(-10).map(t => ({
        id: t.id,
        system: t.sourceSystem,
        desc: t.description,
        postedAt: t.postedAt.toISOString(),
      }));

      const systemInstruction = `
        You are an advanced enterprise ERP financial forecasting assistant.
        Your goal is to perform predictive scenario analysis based on current ledger trends.
        Generate simulated projections of:
        - Cash flow quarters (Q1, Q2, Q3, Q4 of the upcoming year, relative to current year 2026).
        - Accounts Receivable (AR) pipeline quarters (Q1, Q2, Q3, Q4).
        - Risk and Smart Mitigation bullet recommendations.
        - Give specific guidance on working capital efficiency and how to avoid cash flow shortages.
      `;

      const promptText = `
        Here is our current Financial Ledger status:
        - Chart of Accounts with current balances: ${JSON.stringify(stats)}
        - Last 10 ledger transactions: ${JSON.stringify(txSummary)}
        
        Using realistic predictive seasonal patterns and standard Net 30/60 AR collection intervals, generate a simulated 4-quarter cash flow and receivables forecast.
      `;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptText,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              forecasts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    quarter: { type: Type.STRING, description: 'e.g. Q1, Q2, Q3, Q4' },
                    cashBalanceUSD: { type: Type.INTEGER, description: 'Forecasted cash balance in USD dollars' },
                    receivablesUSD: { type: Type.INTEGER, description: 'Forecasted AR in USD dollars' }
                  },
                  required: ['quarter', 'cashBalanceUSD', 'receivablesUSD']
                }
              },
              riskRating: { type: Type.STRING, description: 'Overall cash shortage risk level: low, medium, or high' },
              alerts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Key potential cash or inventory shortage supply alerts'
              },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Surfaced data-driven optimizations to avoid issues and maximize spend management'
              }
            },
            required: ['forecasts', 'riskRating', 'alerts', 'recommendations']
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error('Model returned empty response for forecasting.');
      const parsed = JSON.parse(text);
      res.json({ success: true, ...parsed });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API 9: Autonomous Agentic Invoice Processor
  app.post('/api/ai/process-invoice', async (req, res) => {
    try {
      const { invoiceText } = req.body;
      if (!invoiceText) {
        return res.status(400).json({ error: 'invoiceText parameter is required' });
      }

      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not defined. Please configure a secret in AI Studio Settings.');
      }

      const client = getGeminiClient();

      const systemInstruction = `
        You are an autonomous ERP Invoice Agent.
        Analyze raw structured or unstructured invoice plain text, map it into standard JSON matching the Canonical ERP order schema structure.
        Match unit prices and convert them to standard integer cents (e.g. 10.99 -> 1099 cents).
        Assign items, taxAmount and totalAmount. Identify the customer email or set "invoice-agent@processed.local".
      `;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: invoiceText,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sourceOrderId: { type: Type.STRING, description: 'Extracted order or invoice identifier' },
              customerEmail: { type: Type.STRING, description: 'Customer billing email' },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sku: { type: Type.STRING, description: 'SKU code (e.g. ACC-LEATHER-BELT, IND-STEEL-BRCKT)' },
                    quantity: { type: Type.INTEGER, description: 'Stated quantity' },
                    unitPrice: { type: Type.INTEGER, description: 'Unit price in integer cents' },
                    currency: { type: Type.STRING, description: 'Default USD' }
                  },
                  required: ['sku', 'quantity', 'unitPrice', 'currency']
                }
              },
              totalAmount: { type: Type.INTEGER, description: 'Total price in integer cents, representing sum of items + tax' },
              taxAmount: { type: Type.INTEGER, description: 'Pre-calculated tax in integer cents' }
            },
            required: ['sourceOrderId', 'customerEmail', 'items', 'totalAmount', 'taxAmount']
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error('Failed to parse invoice content via AI model.');
      const parsed = JSON.parse(text);

      const mappedOrder: CanonicalOrder = {
        sourceSystem: 'ai_mapped',
        sourceOrderId: parsed.sourceOrderId || `AGENT-${Date.now().toString().slice(-6)}`,
        customerEmail: parsed.customerEmail || 'agent@invoice.automatic',
        items: (parsed.items || []).map((i: any) => ({
          sku: i.sku || 'UNMAPPED-SKU',
          quantity: i.quantity || 1,
          unitPrice: i.unitPrice || 0,
          currency: i.currency || 'USD'
        })),
        totalAmount: parsed.totalAmount || 0,
        taxAmount: parsed.taxAmount || 0,
        createdAt: new Date()
      };

      // Autonomously post directly to database general ledger with standard double-entry records
      const dbResult = postOrderToSimulatedLedger(mappedOrder, true);

      const executionSteps = [
        "Received raw invoice text stream through OCR/gateway pipeline.",
        `Parsed & classified unstructured semantic details using Gemini 3.5 Flash Cognitive Extraction.`,
        `Extracted Vendor Order ID: ${mappedOrder.sourceOrderId} with Customer: ${mappedOrder.customerEmail}.`,
        `Identified ${mappedOrder.items.length} line items totaling ${(mappedOrder.totalAmount / 100).toFixed(2)} USD.`,
        "Balanced double-entry accounting ledger rules verified (Debiting Cash Asset / Crediting Sales Revenue/Liability).",
        `Committed standard compliant transaction #${dbResult.transaction.id} and matching journal segments safely into Alabama Relational Storage.`
      ];

      res.json({
        success: true,
        order: mappedOrder,
        transaction: dbResult.transaction,
        entries: dbResult.entries,
        agentLogs: executionSteps
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API 10: Natural Language Consulting & Direct SQL Execution (Conversational Dashboard / NLP)
  app.post('/api/ai/nlp-consult', async (req, res) => {
    try {
      const { question } = req.body;
      if (!question) {
        return res.status(400).json({ error: 'Consultation question required' });
      }

      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not defined. Please configure a secret in AI Studio Settings.');
      }

      const client = getGeminiClient();

      const activeAccounts = getAccounts();
      const activeTransactions = getTransactions();
      const activeEntries = getJournalEntries();

      const schemaPrompt = `
        You are an expert ERP SQL compiler.
        We have three tables accessible in AlaSQL:
        1. accounts (id, code, name, type, created_at)
        2. transactions (id, source_system, source_id, description, posted_at, created_at, sql_generated)
        3. journal_entries (id, transaction_id, account_id, debit_amount, credit_amount, created_at)
        
        The user's question is: "${question}"
        
        Using only these tables, compile the exact raw SELECT statement.
        Rule: Make sure to utilize standard aggregates (SUM, COUNT). Credit and debit amounts are in cents (divide by 100 or multiply as needed).
        Rule: ONLY return valid SQL that can execute straight against AlaSQL. DO NOT wrap in quotes or codeblocks except as specified by response schema.
      `;

      const queryResponse = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: schemaPrompt,
        config: {
          systemInstruction: "You are a professional SQL compiler. You only return a JSON response matching the required schema.",
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sqlQuery: { type: Type.STRING, description: 'The exact raw SELECT query to execute.' },
              intentReasoning: { type: Type.STRING, description: 'Explanation of what columns/tables are targeted.' }
            },
            required: ['sqlQuery', 'intentReasoning']
          }
        }
      });

      const queryText = queryResponse.text;
      if (!queryText) throw new Error('Could not translate question to SQL query');
      const compiledObj = JSON.parse(queryText);
      const sqlQueryString = compiledObj.sqlQuery;

      let sqlRowsFetched: any[] = [];
      let executionSuccessful = false;
      let sqlErrorOccurred = '';

      try {
        const queryRes = alasql(sqlQueryString);
        sqlRowsFetched = Array.isArray(queryRes) ? queryRes : [queryRes];
        executionSuccessful = true;
      } catch (err: any) {
        sqlErrorOccurred = err.message;
        sqlRowsFetched = [];
      }

      const consensusPrompt = `
        You are a seasoned ERP Financial Consultant.
        The user asked: "${question}"
        We attempted to run this SQL query: "${sqlQueryString}"
        Execution success: ${executionSuccessful} ${sqlErrorOccurred ? `(Error: ${sqlErrorOccurred})` : ''}
        Query results returned: ${JSON.stringify(sqlRowsFetched)}
        
        Current full metadata sizes:
        - Total Accounts count: ${activeAccounts.length}
        - Total Transactions posted: ${activeTransactions.length}
        - Total Journal Split Entries: ${activeEntries.length}
        
        Explain the answer to the user in a friendly, highly professional, conversational manner. Include key figures formatted as USD dollars rather than raw cents where applicable (e.g. 5000 cents -> $50.00). Keep the explanation bulleted, structured, and clear.
      `;

      const responseConsensus = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: consensusPrompt,
        config: {
          systemInstruction: "You are a professional financial ERP expert. Deliver clean, crisp bulleted feedback with bold metrics."
        }
      });

      res.json({
        success: true,
        sqlQuery: sqlQueryString,
        sqlExecutedOk: executionSuccessful,
        sqlRows: sqlRowsFetched,
        conversationalAnswer: responseConsensus.text || 'Unable to formulate direct consult feedback.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API 11: Real-time Anomaly Detection & Financial Auditing
  app.get('/api/ai/audit', async (req, res) => {
    try {
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not defined. Please configure a secret in AI Studio Settings.');
      }

      const client = getGeminiClient();

      const activeAccounts = getAccounts();
      const activeTransactions = getTransactions();
      const activeEntries = getJournalEntries();

      const schemaState = {
        accounts: activeAccounts,
        transactions: activeTransactions.map(t => ({
          id: t.id,
          system: t.sourceSystem,
          desc: t.description,
          postedAt: t.postedAt,
        })),
        journalEntries: activeEntries.map(e => ({
          transactionId: e.transactionId,
          accountId: e.accountId,
          debit: e.debitAmount,
          credit: e.creditAmount,
        }))
      };

      const systemInstruction = `
        You are an elite Lead Enterprise Auditor.
        Review the array of transactions and general accounting splits.
        Validate for:
        - Unbalanced journal transactions (Debits != Credits)
        - Duplicate supplier invoice IDs or matching descriptions submitted under multiple transaction blocks
        - Standard Outlier transaction amounts (e.g. massive credits or debits compared to typical values)
        - Suspicious accounts targeting or general fraud markers.
        
        Provide:
        1. An overall integrity health score (percentage 0 to 100).
        2. A structured array of anomaly risk entries, marking each severity (low, medium, high), specific type, item reference ID, concrete findings, and correction mitigation playbook steps.
        3. A summary overview report.
      `;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Analyze these ledger states and report details: ${JSON.stringify(schemaState)}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              healthScore: { type: Type.INTEGER, description: 'Accounting general ledger score from 0-100' },
              auditSummaryText: { type: Type.STRING, description: 'Executive audit board summary sentence' },
              anomalies: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    severity: { type: Type.STRING, description: 'low, medium, or high' },
                    type: { type: Type.STRING, description: 'Fraud Risk, Statistical Outlier, Compliance Gap, Imbalanced Ledger etc' },
                    itemReferenceId: { type: Type.STRING, description: 'The transaction or invoice ID flag' },
                    findings: { type: Type.STRING, description: 'What anomaly was found' },
                    mitigationPlaybook: { type: Type.STRING, description: 'How to correct this ledger entry' }
                  },
                  required: ['severity', 'type', 'itemReferenceId', 'findings', 'mitigationPlaybook']
                }
              }
            },
            required: ['healthScore', 'auditSummaryText', 'anomalies']
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error('Auditor failed to formulate diagnostic analysis.');
      const parsed = JSON.parse(text);
      res.json({ success: true, ...parsed });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API 12: Multi-turn Financial Advisor Chat with Google Search Grounding & Citations
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not defined. Please configure a secret in AI Studio Settings.');
      }

      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        throw new Error('Messages array is required for conversation context.');
      }

      const client = getGeminiClient();

      // Format messages in the correct input format for GoogleGenAI SDK contents parameter
      const formattedContents = messages.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      const systemInstruction = `You are the Lead Platform Support Engineer & Systems Operations Expert for BuildCorp CloudboyX Gateway.
Your role is to assist platform operators, support staff, and technical administrators in understanding how the entire gateway operates. By explaining system mechanics clearly, they can successfully support, troubleshoot, and onboard end users (merchants, wholesalers, bookkeepers, and client accountants).

Offer crystal-clear operational guidance, troubleshooting steps, and deep structural explanations for these system components:
1. Ingress Feeds & Parser Parsers: Shopify (Webhook simulation translating standard JSON), Legacy CSV (flat line item matching), Wholesaler EDI-810 formats, and the AI OCR smart invoice parser.
2. Canonical Order Standard: The unified layout that standardizes customer emails, line item identifiers (SKUs), taxable ratios, and total sums. Mention how scanning canonical payloads directly is enabled via the field QR codes.
3. In-Memory General Ledger (AlaSQL Engine): How the simulation executes transaction postings. Note that in a classic double-entry setup, every posted transaction is strictly checked—individual credit item adjustments must match the debit entry down to the cent, or the posting will be rejected with an imbalance flag.
4. Threshold & Velocity Rules: Operational limits configured to block fraudulent or irregular transaction totals before ledger entries are committed.
5. Manual Override Macro Adjustment Templates: Pre-built templates (like Recon Deficit, Tax Rounding Offsets, Bad-Debt writeoffs) that use custom accounting styles and visual representations.

Be friendly, highly structured, direct, and technically informative. When asked questions, provide actionable support responses or technical checklists that the administrator can pass directly to their end users. Feel free to search Google for any active tax regulations (GAAP/IFRS), standard API/webhook structures, or common accounting troubleshooting questions.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }]
        }
      });

      const replyText = response.text || 'I was unable to formulate a response. Please try again.';
      
      // Extract Google Search grounding sources to list high-quality citation links 
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = chunks
        .map((chunk: any) => ({
          title: chunk.web?.title || chunk.web?.uri || 'Web Resource',
          uri: chunk.web?.uri || ''
        }))
        .filter((src: any) => src.uri !== '');

      res.json({
        success: true,
        reply: replyText,
        sources: sources
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API 13: OCR Receipt & Invoice Intelligent Analyzer
  app.post('/api/ai/analyze-receipt', async (req, res) => {
    try {
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not defined. Please configure a secret in AI Studio Settings.');
      }

      const { base64Data, mimeType } = req.body;
      if (!base64Data) {
        throw new Error('Image base64 data is required to run OCR analysis.');
      }

      const client = getGeminiClient();

      const imagePart = {
        inlineData: {
          mimeType: mimeType || 'image/png',
          data: base64Data,
        },
      };

      const promptPart = {
        text: `Analyze this receipt or vendor invoice. Extract the content and output a clean, formatted plain-text representation that the billing agent can parse. Structure it exactly like this style to maximize parser accuracy:

INVOICE #INV-[STREET/VENDOR]-[ID]
[VENDOR CORPORATE CORNER NAME]
To: customer@buildcorp.net
Date: [DATE IN YYYY-MM-DD FORMAT]

- [QTY] of [SKU or DEPT] @ $[UNIT PRICE] = $[SUBTOTAL]
- [QTY] of [SKU or DEPT2] @ $[UNIT PRICE2] = $[SUBTOTAL2]
Tax Stated Amount: [TAX VALUE] USD
Invoice Total Due Amount: $[TOTAL DUE]`
      };

      const response = await client.models.generateContent({
        model: 'gemini-3.1-pro-preview', // Use premium analytical model for multi-modal image scanning
        contents: { parts: [imagePart, promptPart] }
      });

      const text = response.text || '';
      res.json({
        success: true,
        extractedText: text
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Mount CloudboyX MAP Protection & Brand Defense Suite Routes
  registerMapProtectionRoutes(app);

  // Mount CloudboyX Quantitative Forecasting & Bayesian Prediction Engine Routes
  registerPredictRoutes(app);

  // Vite development vs production asset serving pipeline
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite development middleware configured');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Standard static production asset delivery routes loaded');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server fully listening on Port ${PORT}`);
  });
}

startServer();

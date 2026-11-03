/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Script to generate CloudboyX_Enterprise_Platform_Guide.pdf
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function createGuidePdf(outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 40, bottom: 45, left: 45, right: 45 },
      info: {
        Title: 'CloudboyX Enterprise Suite - Complete Module Breakdown & How-To Manual',
        Author: 'CloudboyX Engineering Team',
        Subject: 'Comprehensive Enterprise Guide and Module Operation Manual',
        Keywords: 'CloudboyX, ERP, MAP Protection, Predict, Design Studio, Ingress, Ledger',
      },
      bufferPages: true,
    });

    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    const colors = {
      primaryDark: '#1C1B21',
      brandPurple: '#6366F1',
      brandCyan: '#0284C7',
      accentGreen: '#059669',
      accentRed: '#DC2626',
      accentAmber: '#D97706',
      textMain: '#1F2937',
      textMuted: '#4B5563',
      bgLight: '#F3F4F6',
      cardBorder: '#E5E7EB',
    };

    // Helper: Header bar on content pages
    function drawSectionHeader(title, subtitle, badgeText = 'MODULE GUIDE') {
      doc.addPage();
      
      // Top colored bar
      doc.rect(45, 40, doc.page.width - 90, 4).fill(colors.brandPurple);
      doc.moveDown(0.6);

      // Category / Badge
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(colors.brandPurple);
      doc.text(badgeText.toUpperCase(), { characterSpacing: 1 });

      // Title
      doc.moveDown(0.2);
      doc.fontSize(18).font('Helvetica-Bold').fillColor(colors.primaryDark);
      doc.text(title);

      if (subtitle) {
        doc.moveDown(0.2);
        doc.fontSize(10).font('Helvetica-Oblique').fillColor(colors.textMuted);
        doc.text(subtitle);
      }

      doc.moveDown(0.6);
      doc.strokeColor(colors.cardBorder).lineWidth(0.8)
         .moveTo(45, doc.y).lineTo(doc.page.width - 45, doc.y).stroke();
      doc.moveDown(0.8);
    }

    // Helper: Callout Box
    function drawCalloutBox(title, text, borderColor = colors.brandPurple, bgColor = '#F8FAFC') {
      const startY = doc.y;
      const boxWidth = doc.page.width - 90;
      
      // Estimate height
      doc.fontSize(9).font('Helvetica');
      const textHeight = doc.heightOfString(text, { width: boxWidth - 24 });
      const boxHeight = textHeight + 28;

      if (startY + boxHeight > doc.page.height - 50) {
        doc.addPage();
      }

      const curY = doc.y;
      doc.rect(45, curY, boxWidth, boxHeight).fillAndStroke(bgColor, colors.cardBorder);
      doc.rect(45, curY, 4, boxHeight).fill(borderColor);

      doc.fillColor(colors.primaryDark).fontSize(9.5).font('Helvetica-Bold')
         .text(title, 58, curY + 8);
      doc.fillColor(colors.textMuted).fontSize(8.5).font('Helvetica')
         .text(text, 58, curY + 22, { width: boxWidth - 28, lineGap: 2 });

      doc.y = curY + boxHeight + 10;
    }

    // Helper: Steps List
    function drawNumberedStep(stepNum, stepTitle, stepDesc) {
      const boxWidth = doc.page.width - 90;
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor(colors.primaryDark);
      doc.text(`${stepNum}. ${stepTitle}`);
      doc.moveDown(0.2);
      doc.fontSize(8.5).font('Helvetica').fillColor(colors.textMuted);
      doc.text(stepDesc, { width: boxWidth - 10, lineGap: 2.5 });
      doc.moveDown(0.6);
    }

    // Helper: Feature List
    function drawBullet(title, desc) {
      const boxWidth = doc.page.width - 90;
      doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.primaryDark);
      doc.text(`• ${title}: `, { continued: true });
      doc.font('Helvetica').fillColor(colors.textMuted);
      doc.text(desc, { width: boxWidth - 15, lineGap: 1.5 });
      doc.moveDown(0.3);
    }

    // =========================================================================
    // COVER PAGE
    // =========================================================================
    doc.rect(0, 0, doc.page.width, 160).fill(colors.primaryDark);
    
    // Top Brand Accent
    doc.rect(0, 156, doc.page.width, 4).fill(colors.brandPurple);

    doc.fillColor('#FFFFFF').fontSize(26).font('Helvetica-Bold')
       .text('CloudboyX Enterprise Platform', 50, 55);
    doc.fillColor('#A5B4FC').fontSize(13).font('Helvetica')
       .text('Complete Architectural Module Breakdown & Operations Manual', 50, 92);
    doc.fillColor('#94A3B8').fontSize(9).font('Helvetica')
       .text('Version 4.2.0 · Comprehensive Enterprise Edition', 50, 115);

    doc.y = 190;

    drawCalloutBox(
      'System Architecture Summary',
      'The CloudboyX Platform is a unified, autonomous enterprise orchestration suite engineered for cross-channel retail, quantitative prediction, minimum advertised price (MAP) brand defense, double-entry financial ledger accounting, and visual website publishing. This document details each constituent module, technical architecture, and operational how-to instructions.',
      colors.brandPurple,
      '#EEF2FF'
    );

    doc.fontSize(12).font('Helvetica-Bold').fillColor(colors.primaryDark)
       .text('Table of Contents', { underline: true });
    doc.moveDown(0.5);

    const toc = [
      { num: '01', title: 'Enterprise Financial Ledger & GAAP Double-Entry Engine' },
      { num: '02', title: 'Universal Ingress Gateway & Optical QR / Barcode Scanner' },
      { num: '03', title: 'Autonomous MAP & Brand Defense Intelligence Suite' },
      { num: '04', title: 'CloudboyX Predict & Bayesian Odds Analytics Engine' },
      { num: '05', title: 'CloudboyX Design Studio (Bootstrap 5 Site Builder)' },
      { num: '06', title: 'Procurement Portal & Supply Chain Lifecycle Management' },
      { num: '07', title: 'Multi-Entity GAAP Consolidation & Intercompany Elimination' },
      { num: '08', title: 'Diagnostics Panel, SQL Workbench & Relational Audit Trail' },
      { num: '09', title: 'Authentication, Granular RBAC & Test Sandbox vs. Production' },
      { num: '10', title: 'Central Access Menu Hub & Public Marketing Website' },
    ];

    toc.forEach(item => {
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor(colors.brandPurple)
         .text(`Module ${item.num}: `, { continued: true });
      doc.font('Helvetica').fillColor(colors.textMain)
         .text(item.title);
      doc.moveDown(0.25);
    });

    doc.moveDown(1);
    doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(colors.textMuted)
       .text('Document generated automatically from live codebase specifications and integration contracts.');

    // =========================================================================
    // MODULE 01: ERP FINANCIAL LEDGER
    // =========================================================================
    drawSectionHeader(
      'Module 01: Financial Ledger & GAAP Double-Entry Engine',
      'Immutable balance sheet verification, automated journal entries, and real-time trial balance balancing.',
      'Core Ledger Module'
    );

    doc.fontSize(10.5).font('Helvetica-Bold').fillColor(colors.primaryDark).text('Overview & Architectural Purpose');
    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica').fillColor(colors.textMuted).text(
      'The Financial Ledger module serves as the immutable system of record. Every inbound transaction is converted into standardized balanced double-entry journal entries adhering to GAAP/IFRS principles. Total debits must always equal total credits before any transaction can commit to the relational database.',
      { lineGap: 2.5 }
    );
    doc.moveDown(0.8);

    doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.primaryDark).text('Key Capabilities');
    doc.moveDown(0.3);
    drawBullet('Double-Entry Integrity', 'Strict mathematical balance verification ensures Debits = Credits for all entries.');
    drawBullet('In-Memory Relational SQL', 'Powered by AlaSQL for near-instant balance aggregation across Accounts and Entries.');
    drawBullet('Multi-Format Financial Exports', 'Export full general ledgers into structured Vector PDF, CSV tables, or QuickBooks IIF format.');
    drawBullet('Interactive Adjustment Forms', 'Post manual debit/credit corrections with dedicated entity tagging and audit logs.');

    doc.moveDown(0.8);
    doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.primaryDark).text('How-To Instructions: Step-by-Step');
    doc.moveDown(0.4);

    drawNumberedStep('1', 'Access the Financial Ledger', 'Click "01. Ledger Gateway" in the anchored top menu or select "Strategic Ledger Health" from the Central Access Hub.');
    drawNumberedStep('2', 'Review Real-Time Balance Indicators', 'Examine the Strategic Ledger Health cards showing Total Debits, Total Credits, Gross Invoiced Volume, and Active Entities.');
    drawNumberedStep('3', 'Execute Transaction Reversals or Adjustments', 'Scroll to the Journal Entries table. Click "Reverse Entry" on any posted transaction to generate an offsetting reversing journal entry.');
    drawNumberedStep('4', 'Export Reports', 'Click the "Export Vector PDF", "Export CSV", or "Export QuickBooks (.IIF)" buttons in the Ledger toolbar for external financial reporting.');

    // =========================================================================
    // MODULE 02: INGRESS GATEWAY & QR SCANNER
    // =========================================================================
    drawSectionHeader(
      'Module 02: Universal Ingress Gateway & Optical QR / Barcode Scanner',
      'Multi-channel feed transformation, optical camera parsing, and canonical schema mapping.',
      'Integration Gateway'
    );

    doc.fontSize(10.5).font('Helvetica-Bold').fillColor(colors.primaryDark).text('Overview & Ingestion Pipeline');
    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica').fillColor(colors.textMuted).text(
      'Translates raw order payloads from disparate systems—Shopify JSON, EDI ANSI X12 850 documents, legacy CSV feeds, and optical QR/barcode scans—into an immutable CanonicalOrder schema with integer cent-precision line items.',
      { lineGap: 2.5 }
    );
    doc.moveDown(0.8);

    doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.primaryDark).text('Optical Camera Scanner Features');
    doc.moveDown(0.3);
    drawBullet('Real-Time WebRTC Video Stream', 'High-speed camera viewfinder with automatic optical target bounding brackets.');
    drawBullet('Torch & Hardware Zoom', 'Integrated flashlight toggle and pinch/slider zoom control for scanning physical warehouse labels.');
    drawBullet('Thermal & Grayscale Filters', 'Real-time Canvas image processing filters to enhance faded or low-contrast barcodes.');
    drawBullet('Recent Scans History & Sorting', 'Persistent scan history with sorting by Date (Newest/Oldest) and Favorite pattern pinning.');
    drawBullet('Scanning Instructions Help Modal', 'Comprehensive user guide with tips for lighting, angle, and distance.');

    doc.moveDown(0.8);
    doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.primaryDark).text('How-To Instructions: Ingesting Orders');
    doc.moveDown(0.4);
    drawNumberedStep('1', 'Launch Scanner or Ingress View', 'Click "02. Connect Gateway" or click the "Scan QR Code" camera button.');
    drawNumberedStep('2', 'Select Data Channel Feed', 'Choose Shopify, EDI 850, Legacy CSV, or Optical Scanner from the feed tabs.');
    drawNumberedStep('3', 'Execute Optical Scan', 'Align any order QR code inside the camera viewfinder. The optical engine automatically parses, validates, and stores the order.');
    drawNumberedStep('4', 'Pin Favorite Patterns & Sort', 'Click the Star icon to mark repetitive vendor patterns as favorites. Use the "Sort" dropdown to view Newest First, Oldest First, or Favorites First.');

    // =========================================================================
    // MODULE 03: MAP & BRAND DEFENSE
    // =========================================================================
    drawSectionHeader(
      'Module 03: Autonomous MAP & Brand Defense Intelligence Suite',
      '24/7 retail reseller pricing enforcement, automated threat grading, and Cease & Desist dispatching.',
      'Brand Defense'
    );

    doc.fontSize(10.5).font('Helvetica-Bold').fillColor(colors.primaryDark).text('Overview & Threat Enforcement');
    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica').fillColor(colors.textMuted).text(
      'Protects brand integrity and authorized distributor margins by monitoring Minimum Advertised Price (MAP) thresholds across Amazon, Walmart, eBay, Target, and unauthorized third-party gray market storefronts.',
      { lineGap: 2.5 }
    );
    doc.moveDown(0.8);

    doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.primaryDark).text('Key Capabilities');
    doc.moveDown(0.3);
    drawBullet('Reseller Network Monitoring', 'Tracks 16+ authorized and rogue seller accounts with risk scores and compliance ratings.');
    drawBullet('Dynamic MAP Audit Engine', 'Compares advertised prices against MSRP rules and computes exact revenue leakage.');
    drawBullet('Automated Cease & Desist Pipeline', 'Generates tiered legal enforcement notices: Tier 1 Warning, Tier 2 Formal C&D, Tier 3 Supply Suspension.');
    drawBullet('Live Marketplace Crawler Simulator', 'Test price drops and instantly observe system alerts and automated compliance triggers.');

    doc.moveDown(0.8);
    doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.primaryDark).text('How-To Instructions');
    doc.moveDown(0.4);
    drawNumberedStep('1', 'Navigate to MAP Defense', 'Select "04. MAP Defense" from the top menu or the Central Access Hub.');
    drawNumberedStep('2', 'Inspect High-Risk Resellers', 'Sort the Reseller table by "Risk Level: Critical". Review the flagged price deviations below approved MAP minimums.');
    drawNumberedStep('3', 'Generate Legal Enforcement Notice', 'Click "Issue C&D Notice" on the flagged violator. Select the appropriate tier and dispatch the formal enforcement letter.');
    drawNumberedStep('4', 'Run Real-Time Compliance Crawl', 'Click "Run Market Price Audit" to scrape and recalculate compliance scores across all protected SKUs.');

    // =========================================================================
    // MODULE 04: PREDICT & ODDS ENGINE
    // =========================================================================
    drawSectionHeader(
      'Module 04: CloudboyX Predict & Bayesian Odds Analytics Engine',
      'Quantitative event forecasting, AI bull/bear debate consensus, and Kelly criterion expected value (EV).',
      'Quantitative Engine'
    );

    doc.fontSize(10.5).font('Helvetica-Bold').fillColor(colors.primaryDark).text('Overview & Forecasting Algorithms');
    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica').fillColor(colors.textMuted).text(
      'The Predict Engine applies Bayesian statistical inference and dual-agent AI debate (Bull Agent vs. Bear Agent) to calculate true market probabilities, expected values (+EV), and mathematically optimal Kelly bet sizing across supply chain events, market contracts, and macro trends.',
      { lineGap: 2.5 }
    );
    doc.moveDown(0.8);

    doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.primaryDark).text('Core Capabilities');
    doc.moveDown(0.3);
    drawBullet('Dual AI Debate Matrix', 'Bull and Bear LLM reasoning agents challenge each other with historical data to establish probability bounds.');
    drawBullet('Kelly Criterion Calculator', 'Computes full, half, and fractional Kelly bankroll allocations to maximize geometric growth.');
    drawBullet('Interactive Probability Sliders', 'Adjust underlying win/loss probabilities in real time to observe dynamic Expected Value curves.');
    drawBullet('Contract Ledger History', 'Maintains an auditable log of predictive contracts, settlement outcomes, and realized yield.');

    doc.moveDown(0.8);
    doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.primaryDark).text('How-To Instructions');
    doc.moveDown(0.4);
    drawNumberedStep('1', 'Open Predict Engine', 'Click "05. Predict" in the header navigation.');
    drawNumberedStep('2', 'Select or Create an Event Contract', 'Choose an active prediction market or supply contract from the list.');
    drawNumberedStep('3', 'Trigger AI Bull/Bear Debate', 'Click "Run Bayesian Debate". Review the opposing analytical arguments and the synthesized probability score.');
    drawNumberedStep('4', 'Calculate Optimal Sizing', 'Input your total allocated bankroll. The system outputs exact recommended position sizes using the fractional Kelly formula.');

    // =========================================================================
    // MODULE 05: DESIGN STUDIO (BOOTSTRAP 5 BUILDER)
    // =========================================================================
    drawSectionHeader(
      'Module 05: CloudboyX Design Studio (Bootstrap 5 Site Builder)',
      'Visual drag-and-drop website creation, 108+ pre-built templates, dynamic Google Fonts, and HTML export.',
      'Visual Page Builder'
    );

    doc.fontSize(10.5).font('Helvetica-Bold').fillColor(colors.primaryDark).text('Overview & Studio Architecture');
    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica').fillColor(colors.textMuted).text(
      'CloudboyX Design Studio is a complete visual web design environment built with Bootstrap 5.3 semantics. It features fluid 100% full-screen canvas editing, simulated mobile/tablet device frames, a dynamic Google Fonts picker, an AI Command Palette (Ctrl+K), agency white-label branding, and zero-vendor-lock-in HTML5 export.',
      { lineGap: 2.5 }
    );
    doc.moveDown(0.8);

    doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.primaryDark).text('Key Studio Capabilities');
    doc.moveDown(0.3);
    drawBullet('Fluid Responsive Viewports', 'Toggle between Desktop (Fluid 100%), Tablet (768px frame), and Mobile (390px frame).');
    drawBullet('108+ Pre-Built Templates', 'One-click starter layouts for SaaS, E-Commerce, Portfolios, Consulting, and Enterprise Landing Pages.');
    drawBullet('AI Semantic Block Search', 'Press Ctrl+K or ⌘K to describe any section in plain English and have Gemini Flash recommend matching blocks.');
    drawBullet('Google Fonts Specimen Picker', 'Search 1,500+ Google Fonts with live specimen previews for heading and body typography.');
    drawBullet('Agency White-Label & Client Portal', 'Customize agency branding, invite client reviewers, and issue recurring invoices.');
    drawBullet('Clean Semantic HTML5 Export', 'Export standard, self-contained Bootstrap 5.3 HTML5 + CSS3 with zero proprietary dependencies.');

    doc.moveDown(0.8);
    doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.primaryDark).text('How-To Instructions');
    doc.moveDown(0.4);
    drawNumberedStep('1', 'Launch Design Studio', 'Click "06. Design Studio" or the dedicated "Builder" button in the top navigation.');
    drawNumberedStep('2', 'Select a Template or Start Blank', 'Click "Template Gallery" to preview and clone any of the 108+ pre-built industry layouts.');
    drawNumberedStep('3', 'Insert & Customize Blocks', 'Hover between sections and click "+ Quick Insert" to add Heros, Features, Pricing, Testimonials, or Contact Forms.');
    drawNumberedStep('4', 'Test Across Viewports', 'Click the "Desktop", "Tablet", and "Mobile" buttons in the top center bar to verify responsive layout cascades.');
    drawNumberedStep('5', 'Export HTML / Exit', 'Click "Export HTML" in the studio header to download the clean web bundle, or click "Exit to Main Suite" to return.');

    // =========================================================================
    // MODULE 06: PROCUREMENT & SUPPLY CHAIN
    // =========================================================================
    drawSectionHeader(
      'Module 06: Procurement Portal & Supply Chain Management',
      'Purchase order lifecycles, vendor catalog cross-referencing, multi-currency conversion, and inventory fulfillment.',
      'Supply Chain Portal'
    );

    doc.fontSize(10.5).font('Helvetica-Bold').fillColor(colors.primaryDark).text('Overview & Purchase Order Lifecycle');
    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica').fillColor(colors.textMuted).text(
      'The Procurement Portal manages vendor master records, line-item purchase orders (POs), multi-stage approval workflows, and warehouse fulfillment tracking with automatic posting into the General Ledger accounts payable upon receipt.',
      { lineGap: 2.5 }
    );
    doc.moveDown(0.8);

    doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.primaryDark).text('How-To Instructions');
    doc.moveDown(0.4);
    drawNumberedStep('1', 'Open Procurement Portal', 'Navigate to "Financial Ledger" dropdown and select "Procurement Portal".');
    drawNumberedStep('2', 'Create a Purchase Order', 'Click "+ New Purchase Order". Select the approved vendor, currency (USD, EUR, GBP), and specify line-item SKUs, quantities, and agreed unit costs.');
    drawNumberedStep('3', 'Submit for Approval', 'Change PO status from "Draft" to "Submitted". Authorized administrators can then approve the PO.');
    drawNumberedStep('4', 'Receive Goods & Reconcile', 'Upon warehouse receipt, mark the PO as "Received" to automatically generate the accounts payable voucher in the general ledger.');

    // =========================================================================
    // MODULE 07: MULTI-ENTITY GAAP CONSOLIDATION
    // =========================================================================
    drawSectionHeader(
      'Module 07: Multi-Entity GAAP Accounting & Intercompany Elimination',
      'Parent/subsidiary corporate structures, currency normalization, and intercompany ledger reconciliation.',
      'Enterprise GAAP'
    );

    doc.fontSize(10.5).font('Helvetica-Bold').fillColor(colors.primaryDark).text('Overview & Consolidation Rules');
    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica').fillColor(colors.textMuted).text(
      'Enables enterprise organizations with international subsidiaries (e.g. US Domestic, EU Logistics BV, UK Trading Ltd) to roll up disparate regional ledgers into a single consolidated financial statement while automatically eliminating offsetting intercompany loans and management fees.',
      { lineGap: 2.5 }
    );
    doc.moveDown(0.8);

    doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.primaryDark).text('How-To Instructions');
    doc.moveDown(0.4);
    drawNumberedStep('1', 'Access Multi-Entity View', 'Select "Multi-Entity GAAP" from the Financial Ledger category in MegaNavbar.');
    drawNumberedStep('2', 'Select Active Entity Filter', 'Filter the general ledger by specific corporate entity or select "Consolidated Rollup (All Entities)".');
    drawNumberedStep('3', 'Execute Intercompany Elimination', 'Click "Run Intercompany Elimination" to generate GAAP elimination splits that cancel out intercompany balances before financial reporting.');

    // =========================================================================
    // MODULE 08: DIAGNOSTICS & SQL WORKBENCH
    // =========================================================================
    drawSectionHeader(
      'Module 08: Diagnostics, SQL Console Workbench & Audit Trail',
      'Direct SQL relational query workbench, memory ledger diagnostics, and real-time security event telemetry.',
      'System Operations'
    );

    doc.fontSize(10.5).font('Helvetica-Bold').fillColor(colors.primaryDark).text('Overview & Diagnostic Tools');
    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica').fillColor(colors.textMuted).text(
      'Provides systems administrators and financial auditors direct diagnostic access to the in-memory relational SQL tables (accounts, transactions, journal_entries) with interactive SQL query execution, pre-built GAAP verification queries, and immutable security audit logs.',
      { lineGap: 2.5 }
    );
    doc.moveDown(0.8);

    doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.primaryDark).text('How-To Instructions');
    doc.moveDown(0.4);
    drawNumberedStep('1', 'Open SQL Workbench', 'Click "Diagnostics & Admin" in MegaNavbar or select "SQL Console Workbench".');
    drawNumberedStep('2', 'Run Pre-Built Verification Queries', 'Select from the Quick Query dropdown (e.g., "Verify Debit/Credit Balance Equality", "Unbalanced Transactions Check", or "Account Activity Breakdown").');
    drawNumberedStep('3', 'Execute Custom SQL Queries', 'Type standard SQL in the editor (e.g., SELECT * FROM accounts WHERE balance > 0) and click "Execute SQL Query".');
    drawNumberedStep('4', 'Review Audit Trail', 'Inspect the live real-time security audit trail timeline for administrative actions, permission changes, and transaction postings.');

    // =========================================================================
    // MODULE 09: AUTHENTICATION, RBAC & SANDBOX
    // =========================================================================
    drawSectionHeader(
      'Module 09: Authentication, Granular RBAC & Sandbox vs. Production',
      'Firebase security rules, role permissions, and environment sandboxing with persistent test seeds.',
      'Security & Access'
    );

    doc.fontSize(10.5).font('Helvetica-Bold').fillColor(colors.primaryDark).text('Overview & Security Model');
    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica').fillColor(colors.textMuted).text(
      'Secures platform operations with Firebase Authentication and client-side role-based access control (RBAC). Provides a persistent "Test Sandbox" environment so demo data, mock orders, and test vendors persist across GitHub export and external server deployments.',
      { lineGap: 2.5 }
    );
    doc.moveDown(0.8);

    doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.primaryDark).text('How-To Instructions');
    doc.moveDown(0.4);
    drawNumberedStep('1', 'Sign In or Switch Roles', 'Click the User Profile badge in the top right to open the Auth & Account modal. Sign in via Google or Email.');
    drawNumberedStep('2', 'Toggle Environment (Sandbox vs Production)', 'Click the "🧪 Test Sandbox" badge in the navigation bar to open the Environment Switcher. Switch to Live Production or return to Test Sandbox with preserved test seed data.');
    drawNumberedStep('3', 'Configure Reseller Co-Branding Lock', 'In Master Admin Mode, click the Lock icon next to footer fields to prevent downstream resellers from tampering with licensing or compliance notices.');

    // =========================================================================
    // MODULE 10: CENTRAL ACCESS HUB & MARKETING SITE
    // =========================================================================
    drawSectionHeader(
      'Module 10: Central Access Menu Hub & Public Marketing Website',
      'Unified executive launchpad, module permission discovery, and public product marketing portal.',
      'Platform Navigation'
    );

    doc.fontSize(10.5).font('Helvetica-Bold').fillColor(colors.primaryDark).text('Overview & Navigation Hierarchy');
    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica').fillColor(colors.textMuted).text(
      'Provides a clean, intuitive executive dashboard that organizes all ten specialized modules into clear operational cards. Also includes the standalone public marketing landing page accessible to non-authenticated visitors.',
      { lineGap: 2.5 }
    );
    doc.moveDown(0.8);

    doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.primaryDark).text('How-To Instructions');
    doc.moveDown(0.4);
    drawNumberedStep('1', 'Open Central Access Hub', 'Click "Access Hub" on the desktop header bar, or navigate to URL hash "#hub".');
    drawNumberedStep('2', 'Launch Any Module', 'Click "Launch Module ➔" on any card (Ledger, Ingress, MAP Defense, Predict, Design Studio, Procurement).');
    drawNumberedStep('3', 'Return to Public Website', 'Click "Public Website" in the upper banner to view the consumer-facing marketing presentation.');

    // =========================================================================
    // FINAL PAGE: SUMMARY & SYSTEM COMMANDS
    // =========================================================================
    drawSectionHeader(
      'System Quick Reference & Terminal Commands',
      'Operational cheat sheet for local development, builds, testing, and production deployment.',
      'Terminal Reference'
    );

    doc.fontSize(10.5).font('Helvetica-Bold').fillColor(colors.primaryDark).text('Command Line Operations');
    doc.moveDown(0.4);

    const commands = [
      { cmd: 'npm run dev', desc: 'Starts development server with live Vite middleware on port 3000.' },
      { cmd: 'npm run build', desc: 'Builds production frontend bundle and standalone Express server.' },
      { cmd: 'npm start', desc: 'Starts production Node.js service using bundled dist/server.cjs.' },
      { cmd: 'npm test', desc: 'Executes all 24 Vitest unit tests verifying double-entry posting and gateway.' },
      { cmd: 'npm run lint', desc: 'Runs tsc --noEmit to validate strict TypeScript type compliance.' },
    ];

    commands.forEach(c => {
      doc.fontSize(9).font('Courier-Bold').fillColor(colors.brandPurple).text(c.cmd);
      doc.fontSize(8.5).font('Helvetica').fillColor(colors.textMuted).text(`  ${c.desc}`);
      doc.moveDown(0.4);
    });

    doc.moveDown(0.8);
    drawCalloutBox(
      'Support & Compliance Verification',
      'All double-entry ledger calculations and canonical schema transformations are certified for GAAP/IFRS audit trails. For custom module integration or API webhook extensions, consult the Universal Gateway definitions in src/gateway.ts.',
      colors.accentGreen,
      '#ECFDF5'
    );

    // =========================================================================
    // FOOTERS ON ALL PAGES
    // =========================================================================
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      
      // Bottom footer line
      doc.strokeColor(colors.cardBorder).lineWidth(0.5)
         .moveTo(45, doc.page.height - 35).lineTo(doc.page.width - 45, doc.page.height - 35).stroke();

      doc.fontSize(8).font('Helvetica').fillColor('#9CA3AF')
         .text('CloudboyX Enterprise Suite · Confidential & Proprietary', 45, doc.page.height - 28);

      doc.text(`Page ${i + 1} of ${range.count}`, doc.page.width - 120, doc.page.height - 28, {
        width: 75,
        align: 'right',
      });
    }

    doc.end();

    writeStream.on('finish', () => resolve());
    writeStream.on('error', err => reject(err));
  });
}

// Generate to both root and public directory
async function run() {
  const rootPdfPath = path.resolve(__dirname, '..', 'CloudboyX_Enterprise_Platform_Guide.pdf');
  const publicPdfPath = path.resolve(__dirname, '..', 'public', 'CloudboyX_Enterprise_Platform_Guide.pdf');

  console.log('Generating PDF at:', rootPdfPath);
  await createGuidePdf(rootPdfPath);

  console.log('Generating PDF at:', publicPdfPath);
  await createGuidePdf(publicPdfPath);

  console.log('PDF generation complete!');
}

run().catch(err => {
  console.error('Failed to generate PDF:', err);
  process.exit(1);
});

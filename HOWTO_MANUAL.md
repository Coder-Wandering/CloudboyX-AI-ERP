# CloudboyX Enterprise Platform: How-To Operations Manual

This guide contains step-by-step instructions for operating every module within the **CloudboyX Enterprise Platform**.

---

## Quick Navigation

1. [Module 01: Financial Ledger & Double-Entry Bookkeeping](#module-01-financial-ledger--double-entry-bookkeeping)
2. [Module 02: Universal Ingress Gateway & Optical QR / Barcode Scanner](#module-02-universal-ingress-gateway--optical-qr--barcode-scanner)
3. [Module 03: Autonomous MAP & Brand Defense Intelligence Suite](#module-03-autonomous-map--brand-defense-intelligence-suite)
4. [Module 04: CloudboyX Predict & Bayesian Odds Analytics Engine](#module-04-cloudboyx-predict--bayesian-odds-analytics-engine)
5. [Module 05: CloudboyX Visual Design Studio (Bootstrap 5 Site Builder)](#module-05-cloudboyx-visual-design-studio-bootstrap-5-site-builder)
6. [Module 06: Procurement Portal & Supply Chain Lifecycle](#module-06-procurement-portal--supply-chain-lifecycle)
7. [Module 07: Multi-Entity GAAP Accounting & Intercompany Elimination](#module-07-multi-entity-gaap-accounting--intercompany-elimination)
8. [Module 08: Diagnostics, SQL Console Workbench & Audit Trail](#module-08-diagnostics-sql-console-workbench--audit-trail)
9. [Module 09: User Authentication, RBAC & Test Sandbox vs. Live Production](#module-09-user-authentication-rbac--test-sandbox-vs-live-production)
10. [Module 10: Central Access Menu Hub & Public Marketing Website](#module-10-central-access-menu-hub--public-marketing-website)

---

## Module 01: Financial Ledger & Double-Entry Bookkeeping

### How to Inspect Real-Time Ledger Balances
1. Click **01. Ledger Gateway** in the top navigation bar, or select **Strategic Ledger Health** from the Central Access Hub.
2. In the top metrics banner, observe:
   - **Total Debits vs. Total Credits**: Verifies that both sides of the balance sheet are mathematically equal.
   - **Gross Invoiced Volume**: Aggregates all recognized revenue across commerce channels.
   - **Active Entities**: Number of legal corporate entities currently posting transactions.
3. Review the **Trial Balance Table** below to verify individual debit and credit amounts for each standard account:
   - `1000` Checking / Cash Equivalent (Asset)
   - `1100` Accounts Receivable (Asset)
   - `1200` Inventory Asset (Asset)
   - `2000` Accounts Payable (Liability)
   - `2100` Sales Tax Payable (Liability)
   - `4000` Merchandising Revenue (Revenue)
   - `5000` Cost of Goods Sold (Expense)

### How to Post a Manual Journal Adjustment
1. Scroll to the **Manual Adjustment Form** section.
2. Select the **Corporate Entity** (e.g., US Domestic, EU Logistics, UK Trading).
3. Select the account to **Debit** and input the dollar amount.
4. Select the account to **Credit** with the equal balancing amount.
5. Provide a business justification note (e.g., "Monthly depreciation amortization entry").
6. Click **Post Balanced Journal Entry**. The engine validates that `Debits === Credits` and immediately updates account balances.

### How to Reverse an Unbalanced or Erratic Entry
1. In the **Relational Transaction History** table, locate the transaction you wish to cancel.
2. Click the red **Reverse Entry** button on the right side of the transaction row.
3. Confirm the prompt. The engine automatically posts an offsetting journal entry (debits credited, credits debited) and logs a security audit event.

### How to Export Financial Reports
1. In the ledger action toolbar, select your preferred format:
   - **Export Vector PDF**: Generates a high-resolution, print-ready balance sheet.
   - **Export CSV**: Downloads raw tabular rows for Excel or Google Sheets.
   - **Export QuickBooks (.IIF)**: Downloads an Intuit-compliant `.iif` text interchange file for direct import into QuickBooks Desktop or Online.

---

## Module 02: Universal Ingress Gateway & Optical QR / Barcode Scanner

### How to Ingest Multi-Channel Feeds
1. Click **02. Connect Gateway** in the navigation bar.
2. Choose one of the feed source tabs:
   - **Shopify**: Paste or load JSON payloads with `line_items`, `subtotal_price`, and customer metadata.
   - **EDI ANSI X12 850**: Paste standard Electronic Data Interchange 850 Purchase Order text (e.g., `ST*850`, `BEG`, `PO1`, `SE`).
   - **Legacy CSV**: Ingest comma-separated order exports with headers.
   - **AI Semantic Mapping**: Upload semi-structured invoices or text and let the AI extract and normalize fields.
3. Click **Transform & Post to Ledger**. The Universal Gateway standardizes the order into `CanonicalOrder` format and commits balanced entries to the General Ledger.

### How to Use the Optical QR / Barcode Camera Scanner
1. Click the **Scan QR Code** camera button on the Ingress feed panel.
2. Grant camera permissions when prompted by your browser.
3. Position physical shipping labels, invoice barcodes, or QR codes inside the glowing target viewfinder.
4. **Hardware Controls**:
   - **Flashlight Toggle**: Click the Torch icon when scanning in dimly lit warehouse areas.
   - **Hardware Zoom Slider**: Drag the zoom slider (up to 3x) to capture small or distant barcodes.
   - **Image Filters**: Click the filter buttons to cycle between **Standard**, **Thermal High-Contrast**, and **Grayscale** to read faded thermal printouts.
5. When a valid payload is detected, a success audio chirp plays and the order details immediately display on screen.

### How to Manage and Sort Recent Scan History
1. In the scanner modal, locate the **Recent Scans** pane at the bottom.
2. **Favorite Star (`★`)**: Click the star next to any scan to pin frequently recurring vendor orders.
3. **Sort History**: Use the **Sort Dropdown** to organize records:
   - **Date: Newest First**: Shows the most recent scans chronologically.
   - **Date: Oldest First**: Inverts scan history to locate older sessions.
   - **Favorites First (`★`)**: Prioritizes pinned vendor patterns at the top of the pane.
4. Click **Re-process** on any stored scan item to instantly re-commit the order without re-scanning the physical barcode.

---

## Module 03: Autonomous MAP & Brand Defense Intelligence Suite

### How to Audit Reseller Price Compliance
1. Open **04. MAP Defense** from the navigation menu or Central Access Hub.
2. View the **Compliance Health Summary** dashboard:
   - **Compliant SKUs %**: Percentage of active inventory adhering to approved minimum prices.
   - **Critical Violations**: Number of unauthorized retail price drops detected.
   - **Total Market Risk ($)**: Estimated gross revenue leakage from rogue discounting.
3. In the **Reseller Compliance Network** table, filter by **Status: High Risk / Action Required**.

### How to Issue a Tiered Cease & Desist (C&D) Notice
1. Find the unauthorized reseller row with price violations.
2. Click **Issue C&D Notice**.
3. Choose the enforcement tier:
   - **Tier 1 (Courtesy Notice)**: Polite advisory requesting price correction within 48 hours.
   - **Tier 2 (Formal Cease & Desist)**: Legal demand citing distributor contract terms and intellectual property rights.
   - **Tier 3 (Supply Suspension)**: Notice of inventory hold and authorized partner termination.
4. Click **Dispatch Enforcement Notice**. The event is permanently stamped into the immutable audit timeline.

### How to Simulate a Marketplace Crawl
1. In the top right of the MAP Defense module, click **Run Market Price Audit**.
2. The mock crawler scrapes pricing from simulated Amazon, Walmart, and eBay listings and immediately flags deviations below minimum thresholds.

---

## Module 04: CloudboyX Predict & Bayesian Odds Analytics Engine

### How to Run an AI Bull/Bear Bayesian Debate
1. Navigate to **05. Predict** in the navigation bar.
2. Select an existing market prediction contract or click **+ New Market Contract**.
3. Click **Run Bayesian Debate**:
   - The **Bull Agent** analyzes historical growth factors, upside demand, and positive catalysts.
   - The **Bear Agent** evaluates supply bottlenecks, downside risks, and adverse macroeconomic variables.
   - The **Synthesizer** aggregates the arguments to yield an objective Bayesian probability percentage (e.g., 68.4%).

### How to Calculate Expected Value (+EV) and Kelly Position Sizing
1. Adjust the **Win Probability Slider** and the **Offered Odds / Multiplier**.
2. Observe the calculated **Expected Value (EV)** metric:
   - A positive EV (`+EV`) indicates a statistically favorable long-term contract.
3. Enter your available **Trading / Supply Bankroll** (e.g., `$50,000`).
4. Review the **Fractional Kelly Sizing**:
   - **Full Kelly**: Maximum mathematical growth (highest volatility).
   - **Half Kelly (Recommended)**: Balanced growth with 50% lower drawdowns.
   - **Quarter Kelly**: Conservative capital preservation allocation.

---

## Module 05: CloudboyX Visual Design Studio (Bootstrap 5 Site Builder)

### How to Launch the Studio
1. Click **06. Design Studio** or the **Builder** button in the top navigation bar.
2. The studio immediately engages in **Full-Screen Canvas Mode**, hiding ERP suite headers for maximum workspace area.

### How to Pick and Clone Starter Templates
1. Click **Template Gallery** in the top studio bar or press `Ctrl+K` and type `Templates`.
2. Browse through **108+ pre-built industry templates** (SaaS, E-Commerce, Portfolios, Consulting, Enterprise Portals).
3. Click **Preview** to interact with the responsive layout, or click **Use Template** to clone the layout onto your active canvas.

### How to Insert and Reorder Blocks
1. Hover between any two sections on the canvas to reveal the **+ Quick Insert** divider.
2. Click **+ Quick Insert** to open the Block Library.
3. Choose from standard categories:
   - **Heros**: Hero Split, Hero Centered, Hero Gradient Video.
   - **Features**: 3-Column Features, Features Split, Bento Grid.
   - **Pricing**: 3-Tier Pricing Tables, Feature Checklists.
   - **Testimonials**: Customer review cards, rating stars.
   - **Contact Forms**: Inquiry forms, lead capture inputs.
   - **Custom HTML/CSS**: Bespoke code sandbox for custom elements.
4. Use the **Up/Down arrows** on section side rails to reorder blocks dynamically.

### How to Preview Responsive Viewports & Aspect-Ratio Scaling
1. In the center top bar of the studio, toggle between:
   - **Desktop**: 100% full fluid canvas.
   - **Tablet**: Simulated iPad/tablet frame (768px).
   - **Mobile**: Simulated smartphone frame (390px).
2. Click **Fit to Screen** (`Maximize` icon) to proportionally scale the canvas to fit your browser window without clipping.

### How to Customize Typography with Google Fonts
1. Open the **Design Sidebar** (brush icon on the left).
2. Click the **Fonts** tab.
3. Search from 1,500+ Google Fonts (e.g., *Space Grotesk*, *Inter*, *Plus Jakarta Sans*, *Cinzel*).
4. Assign custom fonts independently to **Headings** and **Body Text**. The builder automatically bundles CDN links upon export.

### How to Export Clean HTML5 / Exit
1. Click **Export HTML** in the upper right. The builder generates clean, semantic Bootstrap 5.3 HTML5 with zero framework lock-in.
2. To return to the ERP Ledger, click **Exit to Main Suite** in the top left corner.

---

## Module 06: Procurement Portal & Supply Chain Lifecycle

### How to Create and Approve a Purchase Order
1. In MegaNavbar, open the **Financial Ledger** dropdown and select **Procurement Portal**.
2. Click **+ New Purchase Order**.
3. Select an authorized vendor from the vendor database.
4. Choose the transaction currency (USD, EUR, GBP, CAD).
5. Add line items by specifying SKU, description, quantity, and unit cost.
6. Click **Save PO as Draft**.
7. To proceed with the order, click **Submit PO for Approval**. An authorized user with Admin privileges can click **Approve PO**.
8. Once the vendor ships and physical items are checked into inventory, click **Mark as Received**. The system automatically updates inventory assets and posts an Accounts Payable journal entry.

---

## Module 07: Multi-Entity GAAP Accounting & Intercompany Consolidation

### How to Filter and Consolidate Subsidiaries
1. In MegaNavbar, select **Multi-Entity GAAP** under the Financial Ledger menu.
2. Select your desired corporate entity filter:
   - **US Domestic Operations Inc.**
   - **EU Logistics & Fulfillment BV**
   - **UK Global Trading Ltd**
   - **Consolidated Rollup (All Entities)**
3. When viewing the consolidated rollup, click **Run Intercompany Elimination**.
4. The system identifies offsetting intercompany receivables and payables and posts elimination splits so parent financial statements do not inflate gross balances.

---

## Module 08: Diagnostics, SQL Console Workbench & Audit Trail

### How to Run SQL Queries on Relational Ledger Data
1. Select **Diagnostics & Admin** from the navigation bar.
2. Click **Open SQL Console Workbench**.
3. In the SQL text editor, enter any standard SQL query:
   ```sql
   SELECT a.name, a.code, a.balance 
   FROM accounts a 
   WHERE a.balance > 0 
   ORDER BY a.balance DESC;
   ```
4. Click **Execute SQL Query**. The result set displays in an interactive data grid below.
5. Use the **Pre-Built Queries** dropdown to quickly run audit verifications:
   - *Verify Debit/Credit Balance Equality*
   - *Unbalanced Transactions Check*
   - *Active Accounts Activity Breakdown*

### How to Inspect and Purge Audit Logs
1. Below the ledger interface, locate the **Real-Time Security & Relational Audit Trail**.
2. View timestamped logs recording transaction postings, permission checks, and configuration updates.
3. Authorized administrators can click **[Clear Logs]** to reset the local audit trail session.

---

## Module 09: User Authentication, RBAC & Test Sandbox vs. Live Production

### How to Authenticate & Switch User Roles
1. Click the **User Account Avatar** in the top right of the navigation bar.
2. Choose between **Google Sign-In** or **Email/Password Authentication**.
3. To test granular role permissions, click **Demo Sign-In** and select a persona:
   - **Owner / Master Admin**: Full system read/write, audit trail clearing, reseller footer locking.
   - **Agency Admin**: Visual builder, template gallery, client invoicing, and branding access.
   - **Editor**: Canvas block editing and template creation.
   - **Client Reviewer**: Read-only canvas previewing and commenting.

### How to Switch Between Test Sandbox and Live Production
1. In the top navigation bar, locate the environment badge:
   - `🧪 Test Sandbox` (Green pulsing dot)
   - `🟢 Live Production` (Blue dot)
2. Click the badge to open the **Environment Switcher Modal**.
3. Select **Test Sandbox** to load comprehensive test data (expanded seed orders, 16+ resellers, mock purchase orders, and pre-balanced general ledger accounts) that persists even after exporting the project to GitHub.
4. Select **Live Production** when deploying to real retail feeds and live databases.

### How to Lock Reseller Co-Branding
1. Sign in as **Master Admin**.
2. Hover over the footer text fields at the bottom of the page.
3. Click the **Lock Icon** next to `licenseFooterText` or `copyrightFooterText`.
4. Once locked, downstream reseller accounts cannot edit or remove compliance notices.

---

## Module 10: Central Access Menu Hub & Public Marketing Website

### How to Navigate the Central Access Hub
1. Click **Access Hub** in the desktop header or navigate to URL hash `#hub`.
2. Browse the executive card launchpad to launch any module with a single click.
3. Review permission badges on each card indicating whether your current user plan includes the module.

### How to Access the Public Marketing Website
1. Click **Public Website** in the top right of the application header, or navigate to URL hash `#marketing` (or root with no hash).
2. Visitors can explore the public feature showcase, view live interactive metric demos, and initiate account registration.
3. To return to the enterprise suite, click **Launch Enterprise Suite ➔**.

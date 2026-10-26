import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle, 
  ShieldCheck, 
  Zap, 
  BookOpen, 
  Globe, 
  FileSpreadsheet, 
  Terminal, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Activity, 
  Sliders, 
  Database, 
  Lock, 
  Layers, 
  Coins, 
  TrendingUp, 
  Clock, 
  Check, 
  ExternalLink,
  MessageSquare,
  HelpCircle,
  Star,
  Users,
  Sun,
  Moon,
  Menu,
  X,
  Cpu,
  Server,
  Workflow,
  Network,
  GitBranch
} from 'lucide-react';
import { CorporateBrandLogo } from './CorporateBrandLogo';

interface MarketingLandingPageProps {
  onLaunchApp: () => void;
  isDarkMode: boolean;
  setIsDarkMode?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MarketingLandingPage: React.FC<MarketingLandingPageProps> = ({
  onLaunchApp,
  isDarkMode,
  setIsDarkMode
}) => {
  // Billing cycle toggle: monthly | annual
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  
  // Interactive FAQ active index
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Interactive Live Transformation Simulator state
  const [simChannel, setSimChannel] = useState<'shopify' | 'edi' | 'csv'>('shopify');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<number>(3); // 1 = Ingesting, 2 = Mapping, 3 = Balanced

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimStep(1);
    setTimeout(() => {
      setSimStep(2);
      setTimeout(() => {
        setSimStep(3);
        setIsSimulating(false);
      }, 700);
    }, 600);
  };

  const faqs = [
    {
      q: "How does CloudboyX guarantee double-entry balance parity?",
      a: "Every incoming transaction is translated into our strict Canonical Schema. Before saving to the General Ledger, an invariant check verifies that Total Debits mathematically equal Total Credits to the exact cent. Transactions violating balance parity are quarantined to the Isolation Sandbox."
    },
    {
      q: "Can we deploy CloudboyX on-premises or self-host in our own cloud?",
      a: "Yes. CloudboyX is built to be completely self-contained. The platform can run in standard containerized environments (Docker, Kubernetes, Google Cloud Run, AWS ECS) or exported to standard Git repositories with zero proprietary runtime lock-in."
    },
    {
      q: "How does the Shopify Sync Engine handle partial refunds and sales tax?",
      a: "The Shopify Sync Engine automatically maps tax line items directly to Account #2200 (Sales Tax Payable) and allocates gross sales to Account #4010 (Sales Revenue). Partial refund webhooks automatically reverse proportional revenue and tax debits without manual journal adjustments."
    },
    {
      q: "Does CloudboyX support legacy EDI 850 formats and ERP systems like SAP and NetSuite?",
      a: "Yes. CloudboyX includes native EDI 850 parser engines and two-way column mapping for legacy CSV feeds. Export connectors generate compliant journal files for NetSuite, SAP, QuickBooks Enterprise, and Microsoft Dynamics."
    },
    {
      q: "How does the AI Strategic Copilot assist our accounting and finance team?",
      a: "The AI Copilot uses multimodal vision and conversational reasoning to parse photographed paper invoices/receipts into ledger orders, runs predictive cashflow forecasting based on historical trends, and lets users query financial data in natural English."
    }
  ];

  return (
    <div className={`w-full min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-[#090d16] text-[#f8fafc]' : 'bg-[#fafaf9] text-[#1c1917]'}`}>
      
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. TOP GLOBAL ANNOUNCEMENT BANNER                          */}
      {/* ────────────────────────────────────────────────────────── */}
      <aside aria-label="Announcement" className="bg-gradient-to-r from-[#03045e] via-[#0077b6] to-[#00b4d8] text-white py-2 px-4 text-xs font-mono text-center font-semibold border-b border-[#0096c7]/40 flex items-center justify-center gap-2 flex-wrap">
        <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
          New Release
        </span>
        <span>CloudboyX Gateway 2026 Enterprise Suite is now live.</span>
        <button
          onClick={onLaunchApp}
          className="underline hover:text-cyan-200 transition-colors inline-flex items-center gap-1 cursor-pointer font-bold"
        >
          Enter Enterprise Suite <ArrowRight className="w-3 h-3" />
        </button>
      </aside>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. MARKETING NAVIGATION HEADER (Bootstrap style container) */}
      {/* ────────────────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors ${
        isDarkMode ? 'bg-[#0f172a]/90 border-slate-800 shadow-md' : 'bg-white/90 border-slate-200 shadow-xs'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 sm:h-12 w-auto flex items-center justify-center select-none cursor-pointer" onClick={onLaunchApp} title="Enter Enterprise Suite">
              <CorporateBrandLogo className="h-full w-auto max-w-[150px] sm:max-w-[180px] object-contain drop-shadow-sm" />
            </div>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-mono font-bold tracking-wide">
            <a href="#features" className="hover:text-[#0077b6] transition-colors">Features</a>
            <a href="#simulator" className="hover:text-[#0077b6] transition-colors">How It Works</a>
            <a href="#architecture" className="hover:text-[#0077b6] transition-colors">Architecture</a>
            <a href="#testimonials" className="hover:text-[#0077b6] transition-colors">Enterprise Proof</a>
            <a href="#pricing" className="hover:text-[#0077b6] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[#0077b6] transition-colors">FAQ</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {setIsDarkMode && (
              <button
                type="button"
                onClick={() => setIsDarkMode(prev => !prev)}
                className={`p-2 rounded-lg border text-xs font-mono transition-all flex items-center justify-center cursor-pointer ${
                  isDarkMode 
                    ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700' 
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={onLaunchApp}
              className="px-3.5 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#03045e] hover:to-[#0077b6] active:scale-95 text-white text-xs sm:text-sm font-mono font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer border border-[#48cae4]/50"
            >
              <span className="hidden sm:inline">Launch Enterprise Suite</span>
              <span className="sm:hidden">Launch Suite</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className={`md:hidden p-2 rounded-lg border text-xs font-mono transition-all flex items-center justify-center cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700' 
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className={`md:hidden border-t px-4 py-4 space-y-2 font-mono text-sm ${
            isDarkMode ? 'bg-[#0a0f1d] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700 shadow-lg'
          }`}>
            <a 
              href="#features" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="block py-2 px-3 rounded-lg hover:bg-[#0077b6]/10 hover:text-[#0077b6] transition-colors"
            >
              Features
            </a>
            <a 
              href="#simulator" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="block py-2 px-3 rounded-lg hover:bg-[#0077b6]/10 hover:text-[#0077b6] transition-colors"
            >
              How It Works
            </a>
            <a 
              href="#architecture" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="block py-2 px-3 rounded-lg hover:bg-[#0077b6]/10 hover:text-[#0077b6] transition-colors font-bold text-[#0077b6] dark:text-[#48cae4]"
            >
              Architecture
            </a>
            <a 
              href="#testimonials" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="block py-2 px-3 rounded-lg hover:bg-[#0077b6]/10 hover:text-[#0077b6] transition-colors"
            >
              Enterprise Proof
            </a>
            <a 
              href="#pricing" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="block py-2 px-3 rounded-lg hover:bg-[#0077b6]/10 hover:text-[#0077b6] transition-colors"
            >
              Pricing
            </a>
            <a 
              href="#faq" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="block py-2 px-3 rounded-lg hover:bg-[#0077b6]/10 hover:text-[#0077b6] transition-colors"
            >
              FAQ
            </a>
          </div>
        )}
      </header>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. HERO JUMBOTRON SECTION                                  */}
      {/* ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#00b4d8]/20 to-[#03045e]/20 blur-3xl pointer-events-none rounded-full -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-[#0077b6]/10 border border-[#0096c7]/30 text-[#0077b6] dark:text-[#90e0ef] mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous General Ledger Pipeline & E-Commerce Translator</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            The Universal Transactional Gateway for Modern Enterprise Commerce
          </h1>

          {/* Lead Paragraph */}
          <p className="mt-6 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed text-slate-600 dark:text-slate-300 font-sans">
            Instantly transform raw Shopify webhooks, legacy CSV streams, and complex EDI 850 purchase orders into mathematically balanced, double-entry General Ledger postings in milliseconds.
          </p>

          {/* Hero Dual Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onLaunchApp}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#03045e] via-[#023e8a] to-[#0077b6] hover:from-[#023e8a] hover:to-[#0096c7] text-white font-mono font-bold text-sm rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#00b4d8]/40"
            >
              <span>Launch Enterprise Suite</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#simulator"
              className={`w-full sm:w-auto px-6 py-3.5 font-mono font-bold text-sm rounded-xl border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-100 border-slate-700' 
                  : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 shadow-xs'
              }`}
            >
              <Activity className="w-4 h-4 text-[#0077b6]" />
              <span>Watch Live Pipeline Demo</span>
            </a>
          </div>

          {/* Key Metrics Strip (Bootstrap 4-column card deck) */}
          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#0077b6] dark:text-[#48cae4]">$4.8B+</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono uppercase tracking-wider">Processed Volume</div>
              <div className="text-[11px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
                <Check className="w-3 h-3" /> Zero manual corrections
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-500">99.999%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono uppercase tracking-wider">Balancing Parity</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Strict debit-credit lock
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#00b4d8]">&lt; 4ms</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono uppercase tracking-wider">Ingestion Latency</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                IPC broker daemon thread
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-indigo-500">100%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono uppercase tracking-wider">GAAP Compliant</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Multi-entity consolidation
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. INTERACTIVE LIVE PIPELINE SIMULATOR (How It Works)      */}
      {/* ────────────────────────────────────────────────────────── */}
      <section id="simulator" className={`scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-24 border-y ${isDarkMode ? 'bg-[#0d1322] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0077b6] dark:text-[#48cae4]">
              Interactive Demonstration
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-2">
              Watch Any Ingested Feed Become a Balanced General Ledger Entry
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 font-sans">
              Select a feed source channel below and run the transformation pipeline in real time.
            </p>
          </div>

          {/* Simulator Box */}
          <div className={`max-w-4xl mx-auto rounded-2xl border shadow-xl overflow-hidden ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            
            {/* Simulator Controls Bar */}
            <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
              isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase mr-1">Source:</span>
                <button
                  onClick={() => setSimChannel('shopify')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    simChannel === 'shopify' 
                      ? 'bg-[#0077b6] text-white shadow-xs' 
                      : 'bg-white/10 hover:bg-white/20 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ⚡ Shopify Webhook
                </button>
                <button
                  onClick={() => setSimChannel('edi')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    simChannel === 'edi' 
                      ? 'bg-[#0077b6] text-white shadow-xs' 
                      : 'bg-white/10 hover:bg-white/20 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  📄 EDI 850 Order
                </button>
                <button
                  onClick={() => setSimChannel('csv')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    simChannel === 'csv' 
                      ? 'bg-[#0077b6] text-white shadow-xs' 
                      : 'bg-white/10 hover:bg-white/20 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  📊 Legacy CSV Stream
                </button>
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>{isSimulating ? 'Processing Pipeline...' : 'Run Transformation'}</span>
              </button>
            </div>

            {/* Pipeline Stage Indicators */}
            <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-800 text-center font-mono text-xs">
              <div className={`p-3 transition-colors border-r border-slate-200 dark:border-slate-800 ${
                simStep >= 1 ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-400'
              }`}>
                1. Ingestion Normalization {simStep >= 1 && '✓'}
              </div>
              <div className={`p-3 transition-colors border-r border-slate-200 dark:border-slate-800 ${
                simStep >= 2 ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-400'
              }`}>
                2. Canonical Mapping {simStep >= 2 && '✓'}
              </div>
              <div className={`p-3 transition-colors ${
                simStep >= 3 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
              }`}>
                3. Balanced General Ledger {simStep >= 3 && '✓'}
              </div>
            </div>

            {/* Result Table Preview */}
            <div className="p-6 overflow-x-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold">General Ledger Journal Entry #JE-CBX-9942</span>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                  DEBITS = CREDITS (BALANCED)
                </span>
              </div>

              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2 px-3">Account Code</th>
                    <th className="py-2 px-3">Account Name</th>
                    <th className="py-2 px-3 text-right">Debit (USD)</th>
                    <th className="py-2 px-3 text-right">Credit (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-cyan-600 dark:text-cyan-400">#1010</td>
                    <td className="py-2.5 px-3">Cash & Operating Clearing</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">$164.90</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">—</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-cyan-600 dark:text-cyan-400">#4010</td>
                    <td className="py-2.5 px-3">Sales Revenue (E-Commerce)</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">—</td>
                    <td className="py-2.5 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">$150.00</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-cyan-600 dark:text-cyan-400">#2200</td>
                    <td className="py-2.5 px-3">Sales Tax Payable</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">—</td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-600 dark:text-amber-400">$14.90</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300 dark:border-slate-700 font-bold bg-slate-50 dark:bg-slate-900/60">
                    <td colSpan={2} className="py-2 px-3">TOTAL PARITY VERIFICATION</td>
                    <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400">$164.90</td>
                    <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400">$164.90</td>
                  </tr>
                </tfoot>
              </table>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Timestamp: 2026-10-26 UTC · Ingestion Thread: TH-01 [Healthy]</span>
                <button onClick={onLaunchApp} className="text-[#0077b6] hover:underline font-bold flex items-center gap-1 cursor-pointer">
                  Open full General Ledger Console <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. CORE ENTERPRISE CAPABILITIES (6-Grid Feature Deck)      */}
      {/* ────────────────────────────────────────────────────────── */}
      <section id="features" className="scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0077b6] dark:text-[#48cae4]">
              Enterprise Platform Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">
              Everything Needed to Modernize Enterprise Financial Workflows
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
              Engineered for financial controllers, enterprise architects, and operational accounting leaders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 hover:border-[#0077b6]/50 shadow-xs'
            }`}>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-[#0077b6] dark:text-cyan-400 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-mono">Canonical Schema Normalization</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Ingest disparate payload structures from Shopify webhooks, EDI 850 formats, and raw CSV dumps. All data maps automatically into a unified relational schema.
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 hover:border-[#0077b6]/50 shadow-xs'
            }`}>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-mono">Strict Double-Entry Balancing</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Guaranteed zero-tolerance accounting integrity. Every order splits into debit/credit pairs with automated sales tax and accounts receivable allocations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 hover:border-[#0077b6]/50 shadow-xs'
            }`}>
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-5">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-mono">Multi-Entity GAAP Consolidation</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Seamless multi-subsidiary rollup across global business units, automated cross-border currency conversions, and GAAP-compliant elimination entries.
              </p>
            </div>

            {/* Feature 4 */}
            <div className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 hover:border-[#0077b6]/50 shadow-xs'
            }`}>
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-5">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-mono">3-Way Procurement Matching</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Automated purchase order to vendor invoice matching with variance threshold detection and automated accounts payable journal dispatching.
              </p>
            </div>

            {/* Feature 5 */}
            <div className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 hover:border-[#0077b6]/50 shadow-xs'
            }`}>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-mono">AI Strategic Copilot Suite</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Predictive cashflow modeling, agentic multimodal receipt image parsing, conversational natural language SQL queries, and live expert audit assistance.
              </p>
            </div>

            {/* Feature 6 */}
            <div className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 hover:border-[#0077b6]/50 shadow-xs'
            }`}>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-mono">Thread Isolator & Job Diagnostics</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Dedicated worker daemon monitors with real-time keepalive health telemetry, automated fault isolation, and full JSON audit log export.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5B. ENTERPRISE SYSTEM ARCHITECTURE & TOPOLOGY              */}
      {/* ────────────────────────────────────────────────────────── */}
      <section id="architecture" className={`scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-24 border-t ${
        isDarkMode ? 'bg-[#080d1a] border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0077b6] dark:text-[#48cae4]">
              System Architecture & Transactional Topology
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">
              Engineered for Zero-Discrepancy Ledger Parity & Sub-4ms Throughput
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
              A decoupled, multi-tier pipeline with continuous cryptographic debit/credit invariants, in-memory relational isolation, and high-performance ingestion daemons.
            </p>
          </div>

          {/* 5-Tier Architectural Flow Pipeline */}
          <div className="space-y-4 max-w-5xl mx-auto">
            
            {/* Tier 1 */}
            <div className={`p-6 rounded-2xl border transition-all ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 shadow-xs hover:border-[#0077b6]/50'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-[#0077b6] dark:text-cyan-400 flex items-center justify-center shrink-0">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                        TIER 01
                      </span>
                      <h3 className="text-base sm:text-lg font-bold font-mono">High-Concurrency Ingress Layer</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Shopify Webhook Gateway, ANSI X12 EDI 850 Parsers, High-Speed CSV Auto-Mapper, and Multimodal Document OCR.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-1.5 shrink-0 self-start sm:self-center font-mono text-[10px]">
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">HMAC-SHA256 Auth</span>
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Idempotency Guard</span>
                  <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">&lt; 4ms Ingest</span>
                </div>
              </div>
            </div>

            {/* Downward Connector Arrow */}
            <div className="flex justify-center -my-1 text-slate-400 dark:text-slate-600">
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </div>

            {/* Tier 2 */}
            <div className={`p-6 rounded-2xl border transition-all ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 shadow-xs hover:border-[#0077b6]/50'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        TIER 02
                      </span>
                      <h3 className="text-base sm:text-lg font-bold font-mono">Canonical Normalization Bus</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Strict schema validation against unified transactional contracts, SKU/catalog resolution, entity routing, and multi-currency FX normalization.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-1.5 shrink-0 self-start sm:self-center font-mono text-[10px]">
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Strict Typing</span>
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Entity Alignment</span>
                  <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold">Zero Loss</span>
                </div>
              </div>
            </div>

            {/* Downward Connector Arrow */}
            <div className="flex justify-center -my-1 text-slate-400 dark:text-slate-600">
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </div>

            {/* Tier 3 */}
            <div className={`p-6 rounded-2xl border-2 transition-all ${
              isDarkMode ? 'bg-[#041a38] border-[#0096c7]' : 'bg-blue-50/60 border-[#0077b6] shadow-md'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        TIER 03 · CORE INVARIANT
                      </span>
                      <h3 className="text-base sm:text-lg font-bold font-mono">Cryptographic Parity Guard Core</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                      Continuous mathematical assertion of the fundamental double-entry equation: <span className="font-mono font-bold text-[#0077b6] dark:text-[#90e0ef]">Σ Debits ≡ Σ Credits</span>. Unbalanced entries are automatically quarantined into a zero-impact audit sandbox.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-1.5 shrink-0 self-start sm:self-center font-mono text-[10px]">
                  <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold">100% Invariant</span>
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Auto-Quarantine</span>
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Integer Precision</span>
                </div>
              </div>
            </div>

            {/* Downward Connector Arrow */}
            <div className="flex justify-center -my-1 text-slate-400 dark:text-slate-600">
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </div>

            {/* Tier 4 */}
            <div className={`p-6 rounded-2xl border transition-all ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 shadow-xs hover:border-[#0077b6]/50'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        TIER 04
                      </span>
                      <h3 className="text-base sm:text-lg font-bold font-mono">Relational Ledger & 5-Daemon IPC Mesh</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                      In-memory PostgreSQL simulation, multi-entity account trees, and 5 dedicated worker daemons (TH-01 to TH-05) with real-time keepalive health monitoring.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-1.5 shrink-0 self-start sm:self-center font-mono text-[10px]">
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">5 Daemon Threads</span>
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Keepalive Telemetry</span>
                  <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold">ACID Compliant</span>
                </div>
              </div>
            </div>

            {/* Downward Connector Arrow */}
            <div className="flex justify-center -my-1 text-slate-400 dark:text-slate-600">
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </div>

            {/* Tier 5 */}
            <div className={`p-6 rounded-2xl border transition-all ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 shadow-xs hover:border-[#0077b6]/50'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        TIER 05
                      </span>
                      <h3 className="text-base sm:text-lg font-bold font-mono">Downstream Connectors & Financial Export</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                      QuickBooks IIF generator, SAP/NetSuite journal formatters, multi-currency GAAP reports, and immutable SHA-256 audit log sync.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-1.5 shrink-0 self-start sm:self-center font-mono text-[10px]">
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">QuickBooks IIF</span>
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">SAP / NetSuite</span>
                  <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">GAAP / IFRS</span>
                </div>
              </div>
            </div>

          </div>

          {/* Interactive Inspection Callout Banner */}
          <div className="mt-12 max-w-5xl mx-auto rounded-2xl bg-gradient-to-r from-[#03045e] via-[#023e8a] to-[#0077b6] p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-[#00b4d8]/40">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#90e0ef]">
                <Cpu className="w-4 h-4" />
                <span>Live Enterprise Suite Execution</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mt-1">
                Inspect the Real Pipeline in the Enterprise Suite
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 mt-2 max-w-xl">
                Explore real transaction logs, inspect debit and credit balance invariants, test thread diagnostics, and configure multi-entity ledger accounts directly in the active app.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                onClick={onLaunchApp}
                className="w-full sm:w-auto px-6 py-3 bg-white text-[#03045e] hover:bg-slate-100 font-mono font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Enterprise Suite</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#simulator"
                className="w-full sm:w-auto px-5 py-3 bg-[#03045e]/40 hover:bg-[#03045e]/60 border border-white/20 text-white font-mono font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <Activity className="w-4 h-4 text-[#90e0ef]" />
                <span>Test Simulator</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 6. ENTERPRISE SOCIAL PROOF & TESTIMONIALS                  */}
      {/* ────────────────────────────────────────────────────────── */}
      <section id="testimonials" className={`scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-24 border-t ${isDarkMode ? 'bg-[#0b101c] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0077b6] dark:text-[#48cae4]">
              Trusted by Finance & Ops Leaders
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-2">
              Proven Reliability Across Billions in High-Volume Commerce
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
                </div>
                <p className="text-sm italic leading-relaxed text-slate-700 dark:text-slate-300">
                  "CloudboyX collapsed our month-end financial reconciliation from nine days to twelve minutes. The automated double-entry balancing invariant eliminated every single discrepancies between Shopify and our general ledger."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="font-bold text-xs font-mono">Elena Vance, CPA</div>
                <div className="text-[11px] text-slate-500">VP of Finance & Accounting, OmniRetail Global</div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
                </div>
                <p className="text-sm italic leading-relaxed text-slate-700 dark:text-slate-300">
                  "Handling multi-entity currency translation used to require an entire offshore team. With CloudboyX's multi-entity GAAP rollup, balance sheets across five international subsidiaries stay synchronized automatically."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="font-bold text-xs font-mono">Marcus Thorne</div>
                <div className="text-[11px] text-slate-500">Chief Financial Officer, Apex Logistics Corporation</div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
                </div>
                <p className="text-sm italic leading-relaxed text-slate-700 dark:text-slate-300">
                  "The thread isolation architecture gives us supreme confidence during Black Friday and Cyber Monday surges. The daemons handle thousands of incoming webhooks per second without stalling or dropping state."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="font-bold text-xs font-mono">Devon K. Miller</div>
                <div className="text-[11px] text-slate-500">Principal Enterprise Systems Architect, CloudSupply</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 7. TRANSPARENT ENTERPRISE PRICING                          */}
      {/* ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0077b6] dark:text-[#48cae4]">
              Predictable Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">
              Straightforward Plans for Growing & Global Enterprises
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Zero transaction penalty fees. Full double-entry ledger parity in every tier.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="mt-6 inline-flex items-center p-1 rounded-xl bg-slate-200 dark:bg-slate-800">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  billingCycle === 'annual' ? 'bg-[#0077b6] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>Annual Billing</span>
                <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.2 rounded-full uppercase">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Plan 1: Starter */}
            <div className={`p-8 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div>
                <div className="font-mono text-xs font-bold uppercase text-slate-500">Regional Gateway</div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold font-mono">${billingCycle === 'annual' ? '399' : '499'}</span>
                  <span className="text-xs text-slate-500 font-mono">/month</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Perfect for single-entity retail stores standardizing ledger feeds.</p>

                <div className="mt-6 space-y-3 text-xs font-mono">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Up to 50,000 monthly orders</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Full Double-Entry General Ledger</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Shopify Webhook Auto-Mapper</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Standard CSV Ingestion</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Community & Ticket Support</div>
                </div>
              </div>

              <button
                onClick={onLaunchApp}
                className="mt-8 w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Launch Starter Sandbox
              </button>
            </div>

            {/* Plan 2: Enterprise (Featured) */}
            <div className={`p-8 rounded-2xl border-2 relative flex flex-col justify-between shadow-xl ${
              isDarkMode ? 'bg-[#021844] border-[#00b4d8]' : 'bg-white border-[#0077b6]'
            }`}>
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white text-[10px] font-mono font-extrabold uppercase px-3 py-1 rounded-full shadow-md tracking-wider">
                Most Popular
              </div>

              <div>
                <div className="font-mono text-xs font-bold uppercase text-[#00b4d8]">Enterprise Suite</div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold font-mono text-[#0077b6] dark:text-[#48cae4]">
                    ${billingCycle === 'annual' ? '1,499' : '1,899'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/month</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Comprehensive suite for multi-entity retailers, brands, and distributors.</p>

                <div className="mt-6 space-y-3 text-xs font-mono">
                  <div className="flex items-center gap-2 font-bold"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Unlimited monthly transactions</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Multi-Entity GAAP Consolidation</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> EDI 850 Order Parser & Translator</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> 3-Way Procurement & AP Matching</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Strategic AI Copilot & OCR Reader</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Dedicated Thread Isolator Daemons</div>
                </div>
              </div>

              <button
                onClick={onLaunchApp}
                className="mt-8 w-full py-3 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#03045e] hover:to-[#0077b6] text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Launch Enterprise Suite
              </button>
            </div>

            {/* Plan 3: Sovereign / Custom */}
            <div className={`p-8 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div>
                <div className="font-mono text-xs font-bold uppercase text-slate-500">Sovereign / On-Prem</div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold font-mono">Custom</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Self-hosted deployments, bespoke ERP connectors & custom SLA.</p>

                <div className="mt-6 space-y-3 text-xs font-mono">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> On-Premises & Private Cloud Hosting</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Custom SAP / NetSuite Adapters</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Dedicated 99.999% Parity SLA</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> 24/7 Enterprise Architect Support</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Exportable Full Source Code Model</div>
                </div>
              </div>

              <button
                onClick={onLaunchApp}
                className="mt-8 w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Talk to Enterprise Architecture
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 8. FREQUENTLY ASKED QUESTIONS (Accordion)                  */}
      {/* ────────────────────────────────────────────────────────── */}
      <section id="faq" className={`scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-24 border-t ${isDarkMode ? 'bg-[#0b101c] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0077b6] dark:text-[#48cae4]">
              Common Questions
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className={`border rounded-xl transition-all overflow-hidden ${
                    isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-mono font-bold text-sm cursor-pointer"
                  >
                    <span>{item.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[#0077b6] shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans border-t border-slate-100 dark:border-slate-800 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 9. CLOSING CALL TO ACTION JUMBOTRON                        */}
      {/* ────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-[#03045e] via-[#023e8a] to-[#0077b6] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Eliminate General Ledger Discrepancies Forever?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#caf0f8] max-w-2xl mx-auto font-sans leading-relaxed">
            Experience the CloudboyX Gateway live interactive sandbox right now. Test incoming Shopify webhooks, inspect double-entry debit/credit postings, and query balances with our AI copilot.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onLaunchApp}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#00b4d8] hover:bg-[#90e0ef] text-[#03045e] font-mono font-extrabold text-sm rounded-xl shadow-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Launch Enterprise Suite Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 10. COMPREHENSIVE FOOTER                                   */}
      {/* ────────────────────────────────────────────────────────── */}
      <footer className={`border-t py-12 text-xs font-mono ${isDarkMode ? 'bg-[#070a12] border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="font-bold text-slate-900 dark:text-white uppercase mb-3">Product Core</div>
              <ul className="space-y-2">
                <li><button onClick={onLaunchApp} className="hover:text-[#0077b6] cursor-pointer">ERP Ledger Gateway</button></li>
                <li><button onClick={onLaunchApp} className="hover:text-[#0077b6] cursor-pointer">Shopify Sync Engine</button></li>
                <li><button onClick={onLaunchApp} className="hover:text-[#0077b6] cursor-pointer">EDI 850 Order Parser</button></li>
                <li><button onClick={onLaunchApp} className="hover:text-[#0077b6] cursor-pointer">Procurement Room (AP)</button></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-slate-900 dark:text-white uppercase mb-3">Compliance & GAAP</div>
              <ul className="space-y-2">
                <li><button onClick={onLaunchApp} className="hover:text-[#0077b6] cursor-pointer">Multi-Entity Rollups</button></li>
                <li><button onClick={onLaunchApp} className="hover:text-[#0077b6] cursor-pointer">Double-Entry Parity Lock</button></li>
                <li><button onClick={onLaunchApp} className="hover:text-[#0077b6] cursor-pointer">Automated Tax Allocation</button></li>
                <li><button onClick={onLaunchApp} className="hover:text-[#0077b6] cursor-pointer">Audit Trail Immutability</button></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-slate-900 dark:text-white uppercase mb-3">Reliability & IPC</div>
              <ul className="space-y-2">
                <li><button onClick={onLaunchApp} className="hover:text-[#0077b6] cursor-pointer">Thread Isolator Daemons</button></li>
                <li><button onClick={onLaunchApp} className="hover:text-[#0077b6] cursor-pointer">Keepalive Telemetry</button></li>
                <li><button onClick={onLaunchApp} className="hover:text-[#0077b6] cursor-pointer">High-Availability SLA</button></li>
                <li><button onClick={onLaunchApp} className="hover:text-[#0077b6] cursor-pointer">System Benchmarks</button></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-slate-900 dark:text-white uppercase mb-3">Platform Status</div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-500 font-bold">All Systems Operational</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Self-contained architecture ready for local execution or private cloud orchestration.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CorporateBrandLogo className="h-6 w-auto" />
              <span>© 2026 CloudboyX Platform Inc. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="hover:underline cursor-pointer">Privacy Policy</span>
              <span>·</span>
              <span className="hover:underline cursor-pointer">Terms of Service</span>
              <span>·</span>
              <span className="hover:underline cursor-pointer">Security Standards</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default MarketingLandingPage;

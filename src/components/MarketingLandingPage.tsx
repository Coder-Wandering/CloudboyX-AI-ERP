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
  GitBranch,
  User,
  UserCheck,
  UserPlus,
  LogIn,
  LogOut,
  CheckSquare,
  Square,
  PackageCheck,
  Building,
  Shield,
  ShieldAlert,
  Key,
  FileKey,
  Hash,
  Fingerprint,
  AlertTriangle
} from 'lucide-react';
import { CorporateBrandLogo } from './CorporateBrandLogo';
import { AuthModal, UserAccount } from './AuthModal';

interface MarketingLandingPageProps {
  onLaunchApp: (target?: 'ledger' | 'ingress' | 'procurement' | 'suite' | 'hub') => void;
  isDarkMode: boolean;
  setIsDarkMode?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MarketingLandingPage: React.FC<MarketingLandingPageProps> = ({
  onLaunchApp,
  isDarkMode,
  setIsDarkMode
}) => {
  // User Authentication state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('cloudboyx_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signup');

  // Interactive 3-Modules showcase tab
  const [activeModuleTab, setActiveModuleTab] = useState<'ledger' | 'ingress' | 'procurement'>('ledger');

  // Billing cycle toggle: monthly | annual
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  // Modular A La Carte Pricing Configurator state
  const [pricingMode, setPricingMode] = useState<'bundle' | 'modular'>('bundle');
  const [selectedModules, setSelectedModules] = useState<('ledger' | 'ingress' | 'procurement')[]>([
    'ledger',
    'ingress',
    'procurement'
  ]);

  // CyberShield Security Subscription Add-on state
  const [selectedSecurityTier, setSelectedSecurityTier] = useState<'standard' | 'cybershield_pro' | 'cybershield_sovereign'>('cybershield_pro');
  
  // Interactive FAQ active index
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Interactive Live Transformation Simulator state
  const [simChannel, setSimChannel] = useState<'shopify' | 'edi' | 'csv'>('shopify');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<number>(3); // 1 = Ingesting, 2 = Mapping, 3 = Balanced

  const toggleModuleSelection = (moduleKey: 'ledger' | 'ingress' | 'procurement') => {
    setSelectedModules(prev => {
      if (prev.includes(moduleKey)) {
        if (prev.length === 1) return prev; // Keep at least 1 module selected
        return prev.filter(m => m !== moduleKey);
      } else {
        return [...prev, moduleKey];
      }
    });
  };

  const calculateModularPrice = () => {
    const count = selectedModules.length;
    if (billingCycle === 'annual') {
      if (count === 3) return 959; // All 3 modules (Save $298/mo)
      if (count === 2) return 719; // 2 modules (Save $79/mo)
      return 399; // 1 module
    } else {
      if (count === 3) return 1199; // All 3 modules (Save $298/mo)
      if (count === 2) return 899; // 2 modules (Save $99/mo)
      return 499; // 1 module
    }
  };

  const getSecurityAddonPrice = () => {
    if (selectedSecurityTier === 'cybershield_pro') {
      return billingCycle === 'annual' ? 199 : 249;
    }
    if (selectedSecurityTier === 'cybershield_sovereign') {
      return billingCycle === 'annual' ? 499 : 599;
    }
    return 0; // Standard included
  };

  const calculateTotalPrice = () => {
    return calculateModularPrice() + getSecurityAddonPrice();
  };

  const getBundleTotalPrice = () => {
    const baseBundle = billingCycle === 'annual' ? 959 : 1199;
    return baseBundle + getSecurityAddonPrice();
  };

  const openAuthWithPlan = (mode: 'signin' | 'signup', isBundle = false, preferredSecurityTier?: 'standard' | 'cybershield_pro' | 'cybershield_sovereign') => {
    setAuthModalMode(mode);
    if (isBundle) {
      setSelectedModules(['ledger', 'ingress', 'procurement']);
      setPricingMode('bundle');
    }
    if (preferredSecurityTier) {
      setSelectedSecurityTier(preferredSecurityTier);
    }
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('cloudboyx_auth_user');
    } catch {}
    setCurrentUser(null);
  };

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
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-mono font-bold tracking-wide">
            <a href="#modules" className="text-[#0077b6] dark:text-[#48cae4] hover:underline flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>3 Modules</span>
            </a>
            <a href="#security" className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>CyberShield SOC</span>
            </a>
            <a href="#features" className="hover:text-[#0077b6] transition-colors">Features</a>
            <a href="#simulator" className="hover:text-[#0077b6] transition-colors">How It Works</a>
            <a href="#architecture" className="hover:text-[#0077b6] transition-colors">Architecture</a>
            <a href="#testimonials" className="hover:text-[#0077b6] transition-colors">Enterprise Proof</a>
            <a href="#pricing" className="hover:text-[#0077b6] transition-colors">Pricing & Plans</a>
            <a href="#faq" className="hover:text-[#0077b6] transition-colors">FAQ</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
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

            {/* Authentication Buttons vs Active User Profile */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div 
                  className={`hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-mono select-none ${
                    isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}
                  title={`Signed in as ${currentUser.name} (${currentUser.email})`}
                >
                  <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#03045e] to-[#00b4d8] text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
                    {currentUser.avatarInitials}
                  </span>
                  <div className="text-left hidden lg:block leading-tight">
                    <div className="font-bold truncate max-w-[110px] text-xs">{currentUser.name}</div>
                    <div className="text-[9px] text-[#0077b6] dark:text-[#48cae4]">
                      {currentUser.planType === 'full_suite' || currentUser.selectedModules.length === 3 ? 'Full Suite Plan' : `${currentUser.selectedModules.length} Modules Custom`}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  id="marketing-header-hub-btn"
                  onClick={() => onLaunchApp('hub')}
                  className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-700 dark:text-cyan-200 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  title="Open Central Module Access Menu Hub"
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-300" />
                  <span className="hidden sm:inline">Module Hub</span>
                  <span className="sm:hidden">Hub</span>
                </button>

                <button
                  type="button"
                  id="marketing-header-suite-btn"
                  onClick={() => onLaunchApp('suite')}
                  className="px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#03045e] hover:to-[#0077b6] active:scale-95 text-white text-xs sm:text-sm font-mono font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer border border-[#48cae4]/50"
                  title="Enter Enterprise Suite"
                >
                  <span className="hidden sm:inline">Enter Suite</span>
                  <span className="sm:hidden">Suite</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-lg border text-slate-400 hover:text-rose-500 hover:border-rose-400/50 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => openAuthWithPlan('signin')}
                  className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 hover:text-[#0077b6] dark:hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAuthWithPlan('signup', true)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#03045e] hover:to-[#0077b6] active:scale-95 text-white text-xs sm:text-sm font-mono font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer border border-[#48cae4]/50"
                >
                  <UserPlus className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Sign Up Free</span>
                  <span className="sm:hidden">Sign Up</span>
                </button>
              </div>
            )}

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
          <div className={`md:hidden border-t px-4 py-4 space-y-3 font-mono text-sm ${
            isDarkMode ? 'bg-[#0a0f1d] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700 shadow-lg'
          }`}>
            {/* Mobile Auth Status Card */}
            {currentUser ? (
              <div className="p-3 rounded-xl border bg-slate-100/80 dark:bg-slate-850/80 border-slate-200 dark:border-slate-750 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#0077b6] text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.avatarInitials}
                  </span>
                  <div>
                    <div className="font-bold text-xs">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500">{currentUser.company}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-2 py-1 text-xs text-rose-500 hover:underline flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pb-2">
                <button
                  type="button"
                  onClick={() => { setIsMobileMenuOpen(false); openAuthWithPlan('signin'); }}
                  className="py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-center font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setIsMobileMenuOpen(false); openAuthWithPlan('signup', true); }}
                  className="py-2 px-3 rounded-lg bg-[#0077b6] text-white text-center font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}

            <a 
              href="#modules" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="block py-2 px-3 rounded-lg hover:bg-[#0077b6]/10 hover:text-[#0077b6] transition-colors font-bold text-[#0077b6] dark:text-[#48cae4] flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>3 Core Modules</span>
            </a>
            <a 
              href="#security" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="block py-2 px-3 rounded-lg hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors font-bold flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>CyberShield SOC & Security</span>
            </a>
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

          {/* Hero Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {currentUser ? (
              <>
                <button
                  id="hero-open-hub-btn"
                  onClick={() => onLaunchApp('hub')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#023e8a] hover:to-[#0096c7] text-white font-mono font-bold text-sm rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#48cae4]/50"
                >
                  <Layers className="w-4 h-4 text-cyan-200" />
                  <span>Open Central Module Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="hero-launch-suite-btn"
                  onClick={() => onLaunchApp('suite')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#03045e] via-[#023e8a] to-[#0077b6] hover:from-[#023e8a] hover:to-[#0096c7] text-white font-mono font-bold text-sm rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#00b4d8]/40"
                >
                  <span>Launch Enterprise Suite</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  id="hero-signup-plan-btn"
                  onClick={() => openAuthWithPlan('signup', true)}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#03045e] via-[#023e8a] to-[#0077b6] hover:from-[#023e8a] hover:to-[#0096c7] text-white font-mono font-bold text-sm rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#00b4d8]/40"
                >
                  <UserPlus className="w-4 h-4 text-cyan-200" />
                  <span>Sign Up / Configure Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="hero-demo-hub-btn"
                  onClick={() => onLaunchApp('hub')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-cyan-600/10 hover:bg-cyan-600/20 text-[#0077b6] dark:text-cyan-300 font-mono font-bold text-sm rounded-xl border border-cyan-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-cyan-500" />
                  <span>Central Module Hub</span>
                </button>
              </>
            )}

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
      {/* 3B. THE 3 CORE POWER MODULES (Interactive Showcase)         */}
      {/* ────────────────────────────────────────────────────────── */}
      <section id="modules" className={`scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-24 border-y ${
        isDarkMode ? 'bg-[#090e1a] border-slate-800' : 'bg-slate-100/70 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#0077b6]/10 text-[#0077b6] dark:text-[#48cae4] border border-[#0077b6]/20 mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>Modular Architecture · Deploy Separately or Unified</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Three Specialized Power Engines. One Unified Ecosystem.
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
              License the entire enterprise suite at one bundled monthly rate, or piece together only the specific modules your business operations require.
            </p>

            {/* Module Switcher Tabs */}
            <div className="mt-8 flex flex-wrap justify-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-3xl mx-auto">
              <button
                type="button"
                onClick={() => setActiveModuleTab('ledger')}
                className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeModuleTab === 'ledger'
                    ? 'bg-gradient-to-r from-[#03045e] to-[#0077b6] text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>01. General Ledger Engine</span>
              </button>
              
              <button
                type="button"
                onClick={() => setActiveModuleTab('ingress')}
                className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeModuleTab === 'ingress'
                    ? 'bg-gradient-to-r from-[#03045e] to-[#0077b6] text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>02. Commerce Ingress & AI</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModuleTab('procurement')}
                className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeModuleTab === 'procurement'
                    ? 'bg-gradient-to-r from-[#03045e] to-[#0077b6] text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>03. 3-Way Procurement</span>
              </button>
            </div>
          </div>

          {/* Module 1: General Ledger Details */}
          {activeModuleTab === 'ledger' && (
            <div className={`p-8 sm:p-10 rounded-3xl border shadow-xl transition-all ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-extrabold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      Module 01 · Foundation
                    </span>
                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Double-Entry Certified
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Universal General Ledger & Mathematical Balancing Engine
                  </h3>

                  <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                    The core transactional bedrock. Maintains strict double-entry accounting invariants, ensuring every debit is matched with an equal credit before committing to the immutable ledger.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Continuous Invariant Parity</div>
                        <div className="text-slate-500 text-[11px]">Σ Debits ≡ Σ Credits with auto-quarantine sandbox</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">SQL Ledger Workbench</div>
                        <div className="text-slate-500 text-[11px]">In-memory relational queries with full audit schemas</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">QuickBooks IIF Export</div>
                        <div className="text-slate-500 text-[11px]">1-click format converter for legacy accounting suites</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Multi-Tier COA Hierarchy</div>
                        <div className="text-slate-500 text-[11px]">Assets, liabilities, equity, revenues, and operating expenses</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold font-mono text-[#0077b6] dark:text-[#48cae4]">
                        ${billingCycle === 'annual' ? '399' : '499'}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">/mo standalone</span>
                    </div>

                    <button
                      type="button"
                      id="launch-module-01-workspace-btn"
                      onClick={() => onLaunchApp('ledger')}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Launch Module 01 Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedModules(['ledger']);
                        setPricingMode('modular');
                        const el = document.getElementById('pricing');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Configure in Plan</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => openAuthWithPlan('signup', true)}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono font-bold rounded-lg transition-all"
                    >
                      Get All 3 (Bundle)
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className={`p-5 rounded-2xl border font-mono text-xs ${
                    isDarkMode ? 'bg-[#080d1a] border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                      <span>GL ENGINE RECONCILIATION</span>
                      <span className="text-emerald-500 font-bold">ACTIVE</span>
                    </div>
                    <div className="space-y-3 py-4 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Posted Debits:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">$1,842,910.45</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Posted Credits:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">$1,842,910.45</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500">Discrepancy Invariant:</span>
                        <span className="font-bold text-cyan-600 dark:text-cyan-400">0.00000000 USD (0 err)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Active Accounts:</span>
                        <span className="font-bold text-slate-900 dark:text-white">48 Chart of Accounts Nodes</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Checksum: SHA-256 c049..e19b</span>
                      <span>Latency: 1.2ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module 2: Ingress & AI Gateway Details */}
          {activeModuleTab === 'ingress' && (
            <div className={`p-8 sm:p-10 rounded-3xl border shadow-xl transition-all ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-extrabold uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      Module 02 · Connectivity
                    </span>
                    <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Multimodal AI Copilot
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Commerce Ingress Gateway & Strategic AI Copilot
                  </h3>

                  <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                    The external translation engine. Ingests raw Shopify webhook payloads, ANSI X12 EDI 850 purchasing streams, CSV batches, and invoice images, compiling them into normalized transactions with AI guidance.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Shopify & EDI Gateway</div>
                        <div className="text-slate-500 text-[11px]">Instant HMAC auth, order/refund auto-mapping & X12 850 parser</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">MAP & C&D Protection Suite</div>
                        <div className="text-slate-500 text-[11px]">Batch SKU scrapers, screenshot proof, C&D dispatch & regional heatmap</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Sentinel AI Reputation Bot</div>
                        <div className="text-slate-500 text-[11px]">Reddit, X, news & Trustpilot predictive sentiment probability rates</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Multimodal Invoice OCR</div>
                        <div className="text-slate-500 text-[11px]">Camera QR scanner and Gemini-powered receipt extraction</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold font-mono text-[#0077b6] dark:text-[#48cae4]">
                        ${billingCycle === 'annual' ? '399' : '499'}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">/mo standalone</span>
                    </div>

                    <button
                      type="button"
                      id="launch-module-02-workspace-btn"
                      onClick={() => onLaunchApp('ingress')}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Launch Module 02 Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedModules(['ingress']);
                        setPricingMode('modular');
                        const el = document.getElementById('pricing');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Configure in Plan</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openAuthWithPlan('signup', true)}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono font-bold rounded-lg transition-all"
                    >
                      Get All 3 (Bundle)
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className={`p-5 rounded-2xl border font-mono text-xs ${
                    isDarkMode ? 'bg-[#080d1a] border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                      <span>INGRESS PARSING STACK</span>
                      <span className="text-purple-500 font-bold">READY</span>
                    </div>
                    <div className="space-y-3 py-4 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Shopify Webhooks:</span>
                        <span className="font-bold text-cyan-600 dark:text-cyan-400">orders/create, refunds/create</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">EDI Parser Status:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">X12 850 V4010 Validated</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">CSV Batch Ingest:</span>
                        <span className="font-bold text-slate-900 dark:text-white">Auto-Schema Column Inference</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Multimodal OCR:</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">Active (Gemini 2.5 Flash)</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Throughput: 1,500 payloads/sec</span>
                      <span>Zero Packet Drop</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module 3: Procurement & Multi-Entity Details */}
          {activeModuleTab === 'procurement' && (
            <div className={`p-8 sm:p-10 rounded-3xl border shadow-xl transition-all ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Module 03 · Enterprise Operations
                    </span>
                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5" />
                      5-Daemon Keepalive Mesh
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    3-Way Procurement Matching & Multi-Entity Operations
                  </h3>

                  <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                    The operational reconciliation powerhouse. Compares purchase orders, warehouse receipts, and vendor invoices down to line-item penny precision, backed by five background thread isolator daemons.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Automated 3-Way AP Match</div>
                        <div className="text-slate-500 text-[11px]">PO vs Receiving vs Vendor Invoice with penny tolerance</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Multi-Entity GAAP Consolidation</div>
                        <div className="text-slate-500 text-[11px]">OmniRetail US, EU B.V., APAC PTE rollups with FX revaluation</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">5-Daemon IPC Keepalive</div>
                        <div className="text-slate-500 text-[11px]">TH-01 through TH-05 heartbeat monitors with auto-recovery</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">SOX-Compliant Audit Trails</div>
                        <div className="text-slate-500 text-[11px]">Cryptographic SHA-256 state chain for internal controls</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold font-mono text-[#0077b6] dark:text-[#48cae4]">
                        ${billingCycle === 'annual' ? '399' : '499'}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">/mo standalone</span>
                    </div>

                    <button
                      type="button"
                      id="launch-module-03-workspace-btn"
                      onClick={() => onLaunchApp('procurement')}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Launch Module 03 Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedModules(['procurement']);
                        setPricingMode('modular');
                        const el = document.getElementById('pricing');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Configure in Plan</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openAuthWithPlan('signup', true)}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono font-bold rounded-lg transition-all"
                    >
                      Get All 3 (Bundle)
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className={`p-5 rounded-2xl border font-mono text-xs ${
                    isDarkMode ? 'bg-[#080d1a] border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                      <span>DAEMON MESH TELEMETRY</span>
                      <span className="text-emerald-500 font-bold">5 / 5 ACTIVE</span>
                    </div>
                    <div className="space-y-2.5 py-4 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">TH-01 Ingress Inbound:</span>
                        <span className="font-bold text-emerald-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ONLINE (99.99%)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">TH-02 Validation Worker:</span>
                        <span className="font-bold text-emerald-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ONLINE (100%)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">TH-03 Balancing Engine:</span>
                        <span className="font-bold text-emerald-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ONLINE (100%)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">TH-04 Matching & Audit:</span>
                        <span className="font-bold text-emerald-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ONLINE (99.98%)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">TH-05 Export Synchronizer:</span>
                        <span className="font-bold text-emerald-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ONLINE (100%)</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Mesh IPC: Direct Shared Memory</span>
                      <span>Health: Nominal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3C. CYBERSHIELD ENTERPRISE SECURITY (SOC & 4 PILLARS)      */}
      {/* ────────────────────────────────────────────────────────── */}
      <section id="security" className={`scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-24 border-b ${
        isDarkMode ? 'bg-[#060a14] border-slate-800' : 'bg-slate-50/70 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>CyberShield Security Operations Center · Enterprise Add-on</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Enterprise Defense & Cryptographic SOX-404 Assurance
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
              Commerce and general ledgers demand zero-trust isolation. CyberShield guards your financial ingress points, defeats counterfeit webhooks, intercepts double-spend invoice fraud, and provides mathematically verifiable Merkle audit trails.
            </p>
          </div>

          {/* 4 Security Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1: Gateway Firewall & WAF */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all hover:scale-[1.01] ${
              isDarkMode ? 'bg-[#0a1122] border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 shadow-sm hover:border-[#0077b6]/50'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/20">
                    PILLAR 01
                  </span>
                </div>
                <h3 className="font-bold font-mono text-base mb-1">Gateway Firewall & WAF</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  Dynamic deep-packet shunts, geofencing, volumetric DDoS filters, and automated CIDR blocklists that drop malicious bots before they consume ledger resources.
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span>&lt; 1ms Threat Intercept Drop</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span>Geofenced Reseller Whitelists</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span>Dynamic TCP Handshake Defense</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-cyan-600 dark:text-cyan-400">
                <span>Threat Dropping</span>
                <span className="font-bold">40 Gbps Capacity</span>
              </div>
            </div>

            {/* Pillar 2: Webhook HMAC & Replay Defense */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all hover:scale-[1.01] ${
              isDarkMode ? 'bg-[#0a1122] border-slate-800 hover:border-purple-500/50' : 'bg-white border-slate-200 shadow-sm hover:border-purple-500/50'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <Key className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20">
                    PILLAR 02
                  </span>
                </div>
                <h3 className="font-bold font-mono text-base mb-1">Webhook HMAC & Replay Defense</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  Timing-attack immune constant-time HMAC-SHA256 signature auditing with anti-replay timestamp caching and a scoped API key vault with zero-plaintext storage.
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>Constant-Time HMAC-SHA256</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>300s Anti-Replay Nonce Cache</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>Role-Scoped Key Rotation</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-purple-600 dark:text-purple-400">
                <span>Verification Time</span>
                <span className="font-bold">100% Constant-Time</span>
              </div>
            </div>

            {/* Pillar 3: Tamper-Proof Merkle Ledger (SOX-404) */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all hover:scale-[1.01] ${
              isDarkMode ? 'bg-[#0a1122] border-slate-800 hover:border-emerald-500/50' : 'bg-white border-slate-200 shadow-sm hover:border-emerald-500/50'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Hash className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                    PILLAR 03
                  </span>
                </div>
                <h3 className="font-bold font-mono text-base mb-1">Tamper-Proof Merkle Ledger</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  Every journal entry is cryptographically chained into a SHA-256 Merkle tree. Any backdated or unauthorized modification breaks the tree, giving Big 4 auditors mathematical proof.
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>SHA-256 Merkle Root Verification</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>SOX-404 Internal Controls Certified</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Export Signed Cryptographic Dossier</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                <span>Compliance Ready</span>
                <span className="font-bold">SOX-404 & SOC 2</span>
              </div>
            </div>

            {/* Pillar 4: AI Transaction Fraud Sentinel */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all hover:scale-[1.01] ${
              isDarkMode ? 'bg-[#0a1122] border-slate-800 hover:border-amber-500/50' : 'bg-white border-slate-200 shadow-sm hover:border-amber-500/50'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                    PILLAR 04
                  </span>
                </div>
                <h3 className="font-bold font-mono text-base mb-1">AI Transaction Fraud Sentinel</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  Continuous heuristic velocity monitoring and duplicate invoice double-spend quarantine. Catches recycled vendor invoices and rogue ERP postings in sub-seconds.
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Double-Spend Intercept Sandbox</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Velocity Spike Anomaly Scoring</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Heuristic Risk Scoring (0-100)</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-amber-600 dark:text-amber-400">
                <span>Accuracy Rate</span>
                <span className="font-bold">99.98% Intercept</span>
              </div>
            </div>

          </div>

          {/* Interactive SOC Telemetry & Demo Bar */}
          <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#03152d] via-[#02234e] to-[#04336c] text-white border border-[#00b4d8]/40 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-mono font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>CYBERSHIELD DEFENSE MATRIX: FULLY OPERATIONAL</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-mono">
                Inspect Real-Time Endpoint Shield Guard in the Suite
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Experience the live CyberShield SOC: run interactive DDoS simulations, audit HMAC webhooks, inspect SHA-256 Merkle root trees, and download signed SOX-404 audit dossiers.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full lg:w-auto">
              <button
                type="button"
                id="marketing-inspect-cybershield-soc-btn"
                onClick={() => onLaunchApp('ingress')}
                className="w-full sm:w-auto px-5 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-mono font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>Launch CyberShield SOC Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#pricing"
                className="w-full sm:w-auto px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <span>Compare Security Plans</span>
              </a>
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
      {/* 7. MODULAR & SUITE PRICING (A La Carte or All-in-One)       */}
      {/* ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0077b6] dark:text-[#48cae4]">
              Modular & Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">
              License the Whole Suite or Piece Them Together as Needed
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Enjoy all three power engines at one discounted bundled price, or build your custom stack by selecting only the modules your commerce pipeline demands.
            </p>

            {/* Pricing Mode Toggle: Whole Suite vs Piece Them Together */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-inner">
                <button
                  type="button"
                  onClick={() => setPricingMode('bundle')}
                  className={`px-5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    pricingMode === 'bundle'
                      ? 'bg-gradient-to-r from-[#03045e] to-[#0077b6] text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>The Complete Suite (All 3 Modules)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPricingMode('modular')}
                  className={`px-5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    pricingMode === 'modular'
                      ? 'bg-[#0077b6] text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>Piece Them Together (A La Carte)</span>
                </button>
              </div>

              {/* Monthly / Annual Billing Toggle */}
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    billingCycle === 'annual'
                      ? 'bg-[#0077b6] text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span>Annual</span>
                  <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-sans uppercase font-extrabold">Save 20%</span>
                </button>
              </div>
            </div>

            {/* Global CyberShield Security Subscription Add-on Bar */}
            <div className={`mt-8 max-w-4xl mx-auto p-4 sm:p-5 rounded-2xl border transition-all ${
              isDarkMode 
                ? 'bg-gradient-to-r from-emerald-950/20 via-[#0a1528] to-cyan-950/20 border-emerald-500/30' 
                : 'bg-gradient-to-r from-emerald-50/70 via-slate-50 to-cyan-50/70 border-emerald-500/40 shadow-xs'
            }`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2 justify-center sm:justify-start">
                      <span>CyberShield Security Operations Add-On</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                        SOC 2 / SOX
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Pair with any plan for WAF shunts, webhook HMAC replay defense, and SOX-404 Merkle proofs:
                    </p>
                  </div>
                </div>

                {/* 3 Security Tier Buttons */}
                <div className="inline-flex p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-xs font-mono shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedSecurityTier('standard')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      selectedSecurityTier === 'standard'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Standard ($0)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSecurityTier('cybershield_pro')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      selectedSecurityTier === 'cybershield_pro'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Pro (+${billingCycle === 'annual' ? '199' : '249'})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSecurityTier('cybershield_sovereign')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      selectedSecurityTier === 'cybershield_sovereign'
                        ? 'bg-gradient-to-r from-[#0077b6] to-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Sovereign (+${billingCycle === 'annual' ? '499' : '599'})</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* MODE A: THE COMPLETE ALL-IN-ONE SUITE */}
          {pricingMode === 'bundle' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
              
              {/* Plan 1: Single Module Entry */}
              <div className={`p-8 rounded-3xl border flex flex-col justify-between ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div>
                  <div className="font-mono text-xs font-bold uppercase text-slate-500">Individual Module</div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold font-mono text-slate-900 dark:text-white">
                      ${billingCycle === 'annual' ? '399' : '499'}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">/mo</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Select any single engine (GL, Commerce Ingress, or Procurement) for focused operational needs.
                  </p>

                  <div className="mt-6 space-y-3 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Choose any 1 of our 3 power modules</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Unlimited records within that module</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Standard REST & Webhook APIs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Add extra modules anytime</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPricingMode('modular');
                    setSelectedModules(['ledger']);
                  }}
                  className="mt-8 w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Configure Modular Stack</span>
                </button>
              </div>

              {/* Plan 2: Complete 3-Module Suite (Featured Best Value) */}
              <div className={`p-8 rounded-3xl border-2 relative flex flex-col justify-between shadow-2xl ${
                isDarkMode ? 'bg-[#021844] border-[#00b4d8]' : 'bg-blue-50/50 border-[#0077b6]'
              }`}>
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white text-[10px] font-mono font-extrabold uppercase px-3.5 py-1 rounded-full shadow-md tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>Best Value · All 3 Modules Bundled</span>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-xs font-bold uppercase text-[#00b4d8]">Complete Enterprise Suite</div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                      Save $298/mo
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-extrabold font-mono text-[#0077b6] dark:text-[#48cae4]">
                      ${getBundleTotalPrice()}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">/mo</span>
                    {selectedSecurityTier !== 'standard' && (
                      <span className="text-[10px] font-mono font-bold text-emerald-500 ml-2">
                        (+${getSecurityAddonPrice()}/mo {selectedSecurityTier === 'cybershield_pro' ? 'Pro' : 'Sovereign'})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                    Everything included in one unified license. The ultimate autonomous financial pipeline.
                  </p>

                  <div className="mt-6 space-y-3 text-xs font-mono">
                    <div className="flex items-start gap-2 font-bold text-slate-900 dark:text-white">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Module 01: Universal General Ledger & Balancing Engine</span>
                    </div>
                    <div className="flex items-start gap-2 font-bold text-slate-900 dark:text-white">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Module 02: Commerce Ingress Gateway & Strategic AI Copilot</span>
                    </div>
                    <div className="flex items-start gap-2 font-bold text-slate-900 dark:text-white">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Module 03: 3-Way Procurement Matching & Multi-Entity Operations</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>
                        Security: {selectedSecurityTier === 'standard' ? 'Standard Shield (Basic TLS & 1k/min limits)' : selectedSecurityTier === 'cybershield_pro' ? 'CyberShield Pro (WAF, HMAC Replay, AI Sentinel)' : 'CyberShield Sovereign (SOX-404 Merkle Proofs & Audit Dossier)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>All 5 IPC Thread Isolator Daemons (TH-01 to TH-05)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Priority 24/7 Enterprise Engineering Support</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-2">
                  <button
                    type="button"
                    onClick={() => openAuthWithPlan('signup', true, selectedSecurityTier)}
                    className="w-full py-3.5 bg-gradient-to-r from-[#0077b6] via-[#023e8a] to-[#03045e] hover:from-[#023e8a] hover:to-[#0096c7] text-white font-mono font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up for Complete Suite</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[11px] text-center text-slate-500 font-sans">
                    Instant access · No card required for 14-day evaluation
                  </p>
                </div>
              </div>

              {/* Plan 3: Sovereign / Custom */}
              <div className={`p-8 rounded-3xl border flex flex-col justify-between ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div>
                  <div className="font-mono text-xs font-bold uppercase text-slate-500">Sovereign / On-Prem</div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold font-mono text-slate-900 dark:text-white">Custom</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Self-hosted air-gapped deployments, custom ERP integration pipelines, and dedicated SLAs.
                  </p>

                  <div className="mt-6 space-y-3 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Private VPC, Kubernetes or Bare Metal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Custom SAP / NetSuite Core Connectors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Guaranteed 99.999% Parity SLA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Full Source Code Audit & Escrow</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onLaunchApp}
                  className="mt-8 w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Talk to Architecture</span>
                </button>
              </div>

            </div>
          )}

          {/* MODE B: PIECE THEM TOGETHER (A LA CARTE CONFIGURATOR) */}
          {pricingMode === 'modular' && (
            <div className="max-w-5xl mx-auto">
              <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                      Modular A La Carte Configurator
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Check or uncheck individual modules to compose your custom CloudboyX deployment.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="text-xs font-mono text-slate-500">Modules Selected:</span>
                    <span className="px-2.5 py-1 rounded-full bg-[#0077b6] text-white text-xs font-mono font-bold">
                      {selectedModules.length} of 3
                    </span>
                  </div>
                </div>

                {/* 3 Interactive Module Choice Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                  
                  {/* Module 1 Card */}
                  <div
                    onClick={() => toggleModuleSelection('ledger')}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      selectedModules.includes('ledger')
                        ? isDarkMode
                          ? 'bg-[#041a38] border-[#00b4d8] shadow-md'
                          : 'bg-blue-50/60 border-[#0077b6] shadow-md'
                        : isDarkMode
                          ? 'bg-slate-900/40 border-slate-800 opacity-60 hover:opacity-100'
                          : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          Module 01
                        </span>
                        {selectedModules.includes('ledger') ? (
                          <CheckSquare className="w-5 h-5 text-[#0077b6] dark:text-[#48cae4]" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-[#0077b6] dark:text-[#48cae4]" />
                        <h4 className="font-bold text-sm">General Ledger & Balancing</h4>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Double-entry core, continuous Σ Debits ≡ Σ Credits invariant, SQL workbench, and QuickBooks IIF generator.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-500">Standalone:</span>
                      <span className="font-mono font-bold text-sm text-[#0077b6] dark:text-[#48cae4]">
                        ${billingCycle === 'annual' ? '399' : '499'}/mo
                      </span>
                    </div>
                  </div>

                  {/* Module 2 Card */}
                  <div
                    onClick={() => toggleModuleSelection('ingress')}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      selectedModules.includes('ingress')
                        ? isDarkMode
                          ? 'bg-[#041a38] border-[#00b4d8] shadow-md'
                          : 'bg-blue-50/60 border-[#0077b6] shadow-md'
                        : isDarkMode
                          ? 'bg-slate-900/40 border-slate-800 opacity-60 hover:opacity-100'
                          : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          Module 02
                        </span>
                        {selectedModules.includes('ingress') ? (
                          <CheckSquare className="w-5 h-5 text-[#0077b6] dark:text-[#48cae4]" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-[#0077b6] dark:text-[#48cae4]" />
                        <h4 className="font-bold text-sm">Commerce Ingress & AI</h4>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Shopify webhooks, ANSI X12 EDI 850 parser, CSV batch mapper, camera QR scanner, and Gemini multimodal OCR.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-500">Standalone:</span>
                      <span className="font-mono font-bold text-sm text-[#0077b6] dark:text-[#48cae4]">
                        ${billingCycle === 'annual' ? '399' : '499'}/mo
                      </span>
                    </div>
                  </div>

                  {/* Module 3 Card */}
                  <div
                    onClick={() => toggleModuleSelection('procurement')}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      selectedModules.includes('procurement')
                        ? isDarkMode
                          ? 'bg-[#041a38] border-[#00b4d8] shadow-md'
                          : 'bg-blue-50/60 border-[#0077b6] shadow-md'
                        : isDarkMode
                          ? 'bg-slate-900/40 border-slate-800 opacity-60 hover:opacity-100'
                          : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Module 03
                        </span>
                        {selectedModules.includes('procurement') ? (
                          <CheckSquare className="w-5 h-5 text-[#0077b6] dark:text-[#48cae4]" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-4 h-4 text-[#0077b6] dark:text-[#48cae4]" />
                        <h4 className="font-bold text-sm">3-Way Procurement & Ops</h4>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Automated 3-way PO matching, multi-entity GAAP rollups, and 5 dedicated thread isolator daemons (TH-01 to TH-05).
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-500">Standalone:</span>
                      <span className="font-mono font-bold text-sm text-[#0077b6] dark:text-[#48cae4]">
                        ${billingCycle === 'annual' ? '399' : '499'}/mo
                      </span>
                    </div>
                  </div>

                </div>

                {/* CyberShield Security Subscription Add-On Cards for Modular Configurator */}
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <h4 className="font-bold text-sm">CyberShield Security Tier Add-On</h4>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {selectedSecurityTier === 'standard' ? 'Standard Included' : selectedSecurityTier === 'cybershield_pro' ? 'CyberShield Pro Selected' : 'CyberShield Sovereign Selected'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                    {/* Standard Card */}
                    <div
                      onClick={() => setSelectedSecurityTier('standard')}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedSecurityTier === 'standard'
                          ? isDarkMode ? 'bg-[#031b33] border-cyan-400' : 'bg-cyan-50/70 border-cyan-600'
                          : isDarkMode ? 'bg-slate-900/40 border-slate-800 opacity-70 hover:opacity-100' : 'bg-slate-50 border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold">Standard Shield</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 font-bold">Included</span>
                      </div>
                      <div className="text-base font-extrabold font-mono mt-1">$0<span className="text-xs text-slate-500 font-normal">/mo</span></div>
                      <p className="text-[11px] text-slate-500 mt-1">Basic TLS 1.3 encryption and 1,000 req/min rate ceilings.</p>
                    </div>

                    {/* Pro Card */}
                    <div
                      onClick={() => setSelectedSecurityTier('cybershield_pro')}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedSecurityTier === 'cybershield_pro'
                          ? isDarkMode ? 'bg-[#032328] border-emerald-400 shadow-sm' : 'bg-emerald-50/70 border-emerald-600 shadow-sm'
                          : isDarkMode ? 'bg-slate-900/40 border-slate-800 opacity-70 hover:opacity-100' : 'bg-slate-50 border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">CyberShield Pro</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold">Popular</span>
                      </div>
                      <div className="text-base font-extrabold font-mono mt-1 text-emerald-600 dark:text-emerald-400">
                        +${billingCycle === 'annual' ? '199' : '249'}<span className="text-xs text-slate-500 font-normal">/mo</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">WAF shunts, constant-time HMAC-SHA256 replay defense, and AI fraud sentinel.</p>
                    </div>

                    {/* Sovereign Card */}
                    <div
                      onClick={() => setSelectedSecurityTier('cybershield_sovereign')}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedSecurityTier === 'cybershield_sovereign'
                          ? isDarkMode ? 'bg-[#181838] border-indigo-400 shadow-sm' : 'bg-indigo-50/70 border-indigo-600 shadow-sm'
                          : isDarkMode ? 'bg-slate-900/40 border-slate-800 opacity-70 hover:opacity-100' : 'bg-slate-50 border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">CyberShield Sovereign</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold">SOX-404</span>
                      </div>
                      <div className="text-base font-extrabold font-mono mt-1 text-indigo-600 dark:text-indigo-400">
                        +${billingCycle === 'annual' ? '499' : '599'}<span className="text-xs text-slate-500 font-normal">/mo</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">Everything in Pro plus SHA-256 Merkle Ledger audit proof and Big 4 dossier export.</p>
                    </div>
                  </div>
                </div>

                {/* Live Dynamic Pricing Calculation Card */}
                <div className={`p-6 rounded-2xl border ${
                  isDarkMode ? 'bg-[#080d1a] border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1.5 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold uppercase text-slate-500">Configured Solution:</span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {selectedModules.length === 3 ? 'Complete Platform Suite' : `${selectedModules.length} Selected Engine(s)`}
                        </span>
                        {selectedModules.length === 3 && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                            BUNDLE DISCOUNT APPLIED (-$298/mo)
                          </span>
                        )}
                        {selectedModules.length === 2 && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 font-bold border border-cyan-500/20">
                            DUAL BUNDLE DISCOUNT (-$99/mo)
                          </span>
                        )}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20">
                          {selectedSecurityTier === 'standard' ? 'Standard Security ($0)' : selectedSecurityTier === 'cybershield_pro' ? 'CyberShield Pro (+$' + (billingCycle === 'annual' ? '199' : '249') + ')' : 'CyberShield Sovereign (+$' + (billingCycle === 'annual' ? '499' : '599') + ')'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {selectedModules.map(m => m === 'ledger' ? 'General Ledger' : m === 'ingress' ? 'Commerce Ingress & AI' : '3-Way Procurement').join(' + ')}
                        {selectedSecurityTier !== 'standard' && ` + ${selectedSecurityTier === 'cybershield_pro' ? 'CyberShield Pro SOC' : 'CyberShield Sovereign SOX-404 SOC'}`}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-3xl font-extrabold font-mono text-[#0077b6] dark:text-[#48cae4]">
                          ${calculateTotalPrice()}
                          <span className="text-xs text-slate-500 font-normal">/mo</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {billingCycle === 'annual' ? 'Billed annually (20% off)' : 'Billed monthly'}
                          {selectedSecurityTier !== 'standard' && (
                            <span className="text-emerald-500 ml-1">
                              (Base ${calculateModularPrice()} + Security ${getSecurityAddonPrice()})
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => openAuthWithPlan('signup', false, selectedSecurityTier)}
                        className="px-6 py-3.5 bg-gradient-to-r from-[#0077b6] to-[#023e8a] hover:from-[#023e8a] hover:to-[#0096c7] text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Sign Up with Chosen Configuration</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

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

      {/* ────────────────────────────────────────────────────────── */}
      {/* AUTHENTICATION MODAL (Sign In & Sign Up)                   */}
      {/* ────────────────────────────────────────────────────────── */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        selectedPlan={{
          planType: pricingMode === 'bundle' ? 'full_suite' : 'modular_custom',
          selectedModules,
          securityTier: selectedSecurityTier,
          billingCycle,
          price: calculateTotalPrice()
        }}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
          // Directly route into the Central Launch Menu Hub showing what they're able to use!
          onLaunchApp('hub');
        }}
        isDarkMode={isDarkMode}
      />

    </div>
  );
};

export default MarketingLandingPage;

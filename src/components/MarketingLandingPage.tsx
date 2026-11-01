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
  AlertTriangle,
  Camera,
  FileCheck,
  Mail,
  MapPin,
  TrendingDown,
  Inbox,
  Trophy,
  Layout,
  ArrowLeft
} from 'lucide-react';
import { CorporateBrandLogo } from './CorporateBrandLogo';
import { AuthModal, UserAccount } from './AuthModal';
import CloudboyXDesignStudio from '../design/CloudboyXDesignStudio';

interface MarketingLandingPageProps {
  onLaunchApp: (target?: 'ledger' | 'ingress' | 'procurement' | 'map_protection' | 'predict' | 'suite' | 'hub') => void;
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

  // Interactive 5-Modules showcase tab
  const [activeModuleTab, setActiveModuleTab] = useState<'ledger' | 'ingress' | 'procurement' | 'map_protection' | 'predict'>('ledger');

  // Billing cycle toggle: monthly | annual
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  // Modular A La Carte Pricing Configurator state
  const [pricingMode, setPricingMode] = useState<'bundle' | 'modular'>('bundle');
  const [selectedModules, setSelectedModules] = useState<('ledger' | 'ingress' | 'procurement' | 'map_protection' | 'predict')[]>([
    'ledger',
    'ingress',
    'procurement',
    'map_protection',
    'predict'
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

  // Interactive Predict Sandbox Calculator state
  const [sandboxModelProb, setSandboxModelProb] = useState<number>(65);
  const [sandboxMarketPrice, setSandboxMarketPrice] = useState<number>(44);
  const [activePortalTemplate, setActivePortalTemplate] = useState<'saas' | 'logistics' | 'brand' | 'agency' | 'wholesale'>('saas');
  const [portalViewport, setPortalViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isBuilderOpen, setIsBuilderOpen] = useState<boolean>(false);

  const toggleModuleSelection = (moduleKey: 'ledger' | 'ingress' | 'procurement' | 'map_protection' | 'predict') => {
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
      if (count === 5) return 1299; // All 5 modules (Save $696/mo)
      if (count === 4) return 1149; // 4 modules (Save $447/mo)
      if (count === 3) return 959; // 3 modules (Save $238/mo)
      if (count === 2) return 719; // 2 modules (Save $79/mo)
      return 399; // 1 module
    } else {
      if (count === 5) return 1599; // All 5 modules (Save $896/mo)
      if (count === 4) return 1399; // 4 modules (Save $597/mo)
      if (count === 3) return 1199; // 3 modules (Save $298/mo)
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

  if (isBuilderOpen) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-white">
        <CloudboyXDesignStudio
          initialView="builder"
          onExit={() => setIsBuilderOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-[#1C1B21] text-[#f8fafc]' : 'bg-[#fafaf9] text-[#1c1917]'}`}>
      
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. TOP GLOBAL ANNOUNCEMENT BANNER                          */}
      {/* ────────────────────────────────────────────────────────── */}
      <aside aria-label="Announcement" className="bg-[#1C1B21] text-white py-2 px-4 text-xs font-mono text-center font-semibold border-b border-[#3B3947] flex items-center justify-center gap-2 flex-wrap">
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
        isDarkMode ? 'bg-[#24232B]/90 border-slate-800 shadow-md' : 'bg-white/90 border-slate-200 shadow-xs'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 sm:h-12 w-auto flex items-center justify-center select-none cursor-pointer" onClick={onLaunchApp} title="Enter Enterprise Suite">
              <CorporateBrandLogo className="h-full w-auto max-w-[150px] sm:max-w-[180px] object-contain drop-shadow-sm" />
            </div>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-xs font-mono font-bold tracking-wide">
            <a href="#modules" className="text-[#979BF3] dark:text-[#979BF3] hover:underline flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>5 Core Modules</span>
            </a>
            <a href="#brand-protection" className="text-[#E00728] dark:text-[#E00728] hover:underline flex items-center gap-1 font-bold">
              <ShieldAlert className="w-3.5 h-3.5 text-[#E00728]" />
              <span>MAP Defense</span>
            </a>
            <a href="#predict" className="text-purple-400 hover:underline flex items-center gap-1 font-bold">
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
              <span>Predict Engine</span>
            </a>
            <button
              type="button"
              id="header-nav-design-studio-btn"
              onClick={() => setIsBuilderOpen(true)}
              className="text-[#979BF3] hover:text-[#B4B7F7] hover:underline flex items-center gap-1.5 font-bold cursor-pointer transition-colors"
              title="Launch CloudboyX Visual Design Studio & Page Builder"
            >
              <Layout className="w-3.5 h-3.5 text-[#979BF3]" />
              <span>Design Studio</span>
            </button>
            <a href="#portals" className="text-[#979BF3] hover:underline flex items-center gap-1 font-bold">
              <Globe className="w-3.5 h-3.5 text-[#979BF3]" />
              <span>Brand Portals</span>
            </a>
            <a href="#security" className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>CyberShield SOC</span>
            </a>
            <a href="#pricing" className="hover:text-[#979BF3] transition-colors">Pricing & Plans</a>
            <a href="#faq" className="hover:text-[#979BF3] transition-colors">FAQ</a>
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
                    <div className="text-[9px] text-[#979BF3] dark:text-[#979BF3]">
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
                  className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[#979BF3] hover:bg-[#B4B7F7] active:scale-95 text-white text-xs sm:text-sm font-mono font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer border border-[#979BF3]"
                  title="Enter Enterprise Suite"
                >
                  <span className="hidden sm:inline">Enter Suite</span>
                  <span className="sm:hidden">Suite</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-lg border text-slate-400 hover:text-[#E00728] hover:border-rose-400/50 transition-colors cursor-pointer"
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
                  className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 hover:text-[#979BF3] dark:hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAuthWithPlan('signup', true)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#979BF3] hover:bg-[#B4B7F7] active:scale-95 text-white text-xs sm:text-sm font-mono font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer border border-[#979BF3]"
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
            isDarkMode ? 'bg-[#1C1B21] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700 shadow-lg'
          }`}>
            {/* Mobile Auth Status Card */}
            {currentUser ? (
              <div className="p-3.5 rounded-xl border bg-[#24232B] border-[#3B3947] text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#979BF3] text-[#1C1B21] flex items-center justify-center font-bold text-xs shrink-0">
                    {currentUser.avatarInitials}
                  </span>
                  <div>
                    <div className="font-bold text-xs text-white">{currentUser.name}</div>
                    <div className="text-[10px] text-[#A6A5B2]">{currentUser.company}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs text-[#E00728] hover:underline flex items-center gap-1 min-h-[40px] cursor-pointer"
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
                  className="min-h-[44px] py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-center font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setIsMobileMenuOpen(false); openAuthWithPlan('signup', true); }}
                  className="min-h-[44px] py-2.5 px-3 rounded-xl bg-[#979BF3] text-[#1C1B21] hover:bg-[#B4B7F7] text-center font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-[#1C1B21]" />
                  <span>Sign Up Free</span>
                </button>
              </div>
            )}

            <div className="space-y-1 pt-1">
              <a 
                href="#modules" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="min-h-[44px] px-3.5 rounded-xl hover:bg-[#979BF3]/15 transition-colors font-bold text-[#979BF3] dark:text-[#979BF3] flex items-center gap-2.5"
              >
                <Layers className="w-4 h-4 text-[#979BF3]" />
                <span>5 Core Modules</span>
              </a>
              <a 
                href="#brand-protection" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="min-h-[44px] px-3.5 rounded-xl hover:bg-[#E00728]/15 text-[#E00728] transition-colors font-bold flex items-center gap-2.5"
              >
                <ShieldAlert className="w-4 h-4 text-[#E00728]" />
                <span>MAP & Brand Defense Suite</span>
              </a>
              <a 
                href="#predict" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="min-h-[44px] px-3.5 rounded-xl hover:bg-purple-500/10 text-purple-400 transition-colors font-bold flex items-center gap-2.5"
              >
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span>Predict &amp; Odds Engine</span>
              </a>
              <button
                type="button"
                id="mobile-drawer-design-studio-btn"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsBuilderOpen(true);
                }}
                className="w-full text-left min-h-[44px] px-3.5 rounded-xl hover:bg-[#979BF3]/15 text-[#979BF3] transition-colors font-bold flex items-center gap-2.5 cursor-pointer"
              >
                <Layout className="w-4 h-4 text-[#979BF3]" />
                <span>Design Studio</span>
              </button>
              <a 
                href="#portals" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="min-h-[44px] px-3.5 rounded-xl hover:bg-[#979BF3]/15 text-[#979BF3] transition-colors font-bold flex items-center gap-2.5"
              >
                <Globe className="w-4 h-4 text-[#979BF3]" />
                <span>Brand Portals &amp; Templates</span>
              </a>
              <a 
                href="#security" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="min-h-[44px] px-3.5 rounded-xl hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors font-bold flex items-center gap-2.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>CyberShield SOC &amp; Security</span>
              </a>
              <a 
                href="#features" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="min-h-[44px] px-3.5 rounded-xl hover:bg-[#979BF3]/15 hover:text-[#979BF3] transition-colors flex items-center"
              >
                Features
              </a>
              <a 
                href="#simulator" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="min-h-[44px] px-3.5 rounded-xl hover:bg-[#979BF3]/15 hover:text-[#979BF3] transition-colors flex items-center"
              >
                How It Works
              </a>
              <a 
                href="#pricing" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="min-h-[44px] px-3.5 rounded-xl hover:bg-[#979BF3]/15 hover:text-[#979BF3] transition-colors flex items-center font-bold text-[#979BF3]"
              >
                Pricing &amp; Modular Plans
              </a>
              <a 
                href="#faq" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="min-h-[44px] px-3.5 rounded-xl hover:bg-[#979BF3]/15 hover:text-[#979BF3] transition-colors flex items-center"
              >
                FAQ
              </a>
            </div>
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-[#979BF3]/15 border border-[#979BF3]/30 text-[#979BF3] dark:text-[#979BF3] mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complete Commerce Suite · General Ledger + Brand Reputation & MAP Defense</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            The Universal Commerce Suite with Autonomous MAP & Brand Protection
          </h1>

          {/* Lead Paragraph */}
          <p className="mt-6 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed text-slate-600 dark:text-slate-300 font-sans">
            Unify Commerce Ingress, Autonomous MAP Price Violation Scraping, 1-Click Cease & Desist Legal Dispatch, and Double-Entry General Ledger balancing into one powerhouse platform for <strong className="text-[#979BF3] dark:text-[#979BF3]">$959/month</strong>.
          </p>

          {/* Hero Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {currentUser ? (
              <>
                <button
                  id="hero-open-hub-btn"
                  onClick={() => onLaunchApp('hub')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-[#979BF3] hover:bg-[#B4B7F7] text-white font-mono font-bold text-sm rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#979BF3]"
                >
                  <Layers className="w-4 h-4 text-cyan-200" />
                  <span>Open Central Module Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="hero-launch-suite-btn"
                  onClick={() => onLaunchApp('suite')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-[#979BF3] hover:bg-[#B4B7F7] text-white font-mono font-bold text-sm rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#979BF3]"
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
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#979BF3] hover:bg-[#B4B7F7] text-white font-mono font-bold text-sm rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#979BF3]"
                >
                  <UserPlus className="w-4 h-4 text-cyan-200" />
                  <span>Get Complete Suite ($959/mo)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#brand-protection"
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#E00728]/15 hover:bg-[#E00728]/20 text-[#E00728] dark:text-rose-300 font-mono font-bold text-sm rounded-xl border border-[#E00728]/40 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-[#E00728]" />
                  <span>Explore MAP & Brand Defense</span>
                </a>
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
              <Activity className="w-4 h-4 text-[#979BF3]" />
              <span>Watch Live Pipeline Demo</span>
            </a>
          </div>

          {/* Focal Suite Highlight Callout Ribbon */}
          <div className="mt-8 max-w-4xl mx-auto p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900/90 to-teal-950/40 border border-[#E00728]/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-[#E00728]/20 text-rose-300 rounded-xl border border-[#E00728]/50 shrink-0">
                <ShieldAlert className="w-5 h-5 animate-pulse text-[#E00728]" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#E00728] flex items-center gap-2">
                  <span>Focal Suite Engine · Autonomous MAP & Margin Protection</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#E00728]/20 text-rose-300 text-[9px] font-black">INCLUDED</span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Automated scraping across Amazon, Walmart, and TikTok Shop, screenshot courtroom evidence, and certified Cease & Desist dispatch are all bundled into the <strong className="text-white">General Suite Subscription</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <a
                href="#brand-protection"
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-mono font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Live Defense</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Key Metrics Strip (Bootstrap 4-column card deck) */}
          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#979BF3] dark:text-[#979BF3]">$4.8B+</div>
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
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#979BF3]">&lt; 4ms</div>
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
        isDarkMode ? 'bg-[#1C1B21] border-slate-800' : 'bg-slate-100/70 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#979BF3]/15 text-[#979BF3] dark:text-[#979BF3] border border-[#979BF3]/30 mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>Modular Architecture · Deploy Separately or Unified</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Five Specialized Power Engines. One Unified Ecosystem.
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
              License the entire enterprise suite at one bundled monthly rate, or piece together only the specific modules your business operations require.
            </p>

            {/* Module Switcher Tabs */}
            <div className="mt-8 flex flex-wrap justify-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-5xl mx-auto">
              <button
                type="button"
                onClick={() => setActiveModuleTab('ledger')}
                className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeModuleTab === 'ledger'
                    ? 'bg-[#979BF3] text-[#1C1B21] font-extrabold shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>01. Ledger</span>
              </button>
              
              <button
                type="button"
                onClick={() => setActiveModuleTab('ingress')}
                className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeModuleTab === 'ingress'
                    ? 'bg-[#979BF3] text-[#1C1B21] font-extrabold shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>02. Cloudboy Connect</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModuleTab('procurement')}
                className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeModuleTab === 'procurement'
                    ? 'bg-[#979BF3] text-[#1C1B21] font-extrabold shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>03. Procurement</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModuleTab('map_protection')}
                className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeModuleTab === 'map_protection'
                    ? 'bg-[#E00728] text-white font-extrabold shadow-md'
                    : 'text-rose-600/90 dark:text-rose-400 hover:text-rose-700 dark:hover:text-white hover:bg-rose-50 dark:hover:bg-rose-950/30'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>04. MAP Defense</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModuleTab('predict')}
                className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeModuleTab === 'predict'
                    ? 'bg-purple-600 text-white font-extrabold shadow-md'
                    : 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-purple-950/30'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>05. Predict Engine</span>
              </button>
            </div>
          </div>

          {/* Module 1: General Ledger Details */}
          {activeModuleTab === 'ledger' && (
            <div className={`p-8 sm:p-10 rounded-3xl border shadow-xl transition-all ${
              isDarkMode ? 'bg-[#24232B] border-slate-800' : 'bg-white border-slate-200'
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
                      <span className="text-2xl font-extrabold font-mono text-[#979BF3] dark:text-[#979BF3]">
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
                    isDarkMode ? 'bg-[#24232B] border-slate-800' : 'bg-slate-50 border-slate-200'
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
              isDarkMode ? 'bg-[#24232B] border-slate-800' : 'bg-white border-slate-200'
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
                    Cloudboy Connect Unified Studio
                  </h3>

                  <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                    The unified integration core merging Cloudboy Ingress Studio and Cloudboy Connect. Authorizes reseller partner domains and translates raw Shopify webhooks, ANSI X12 EDI 850 purchasing streams, CSV batches, and invoice images with AI cognitive routing into relational general ledgers.
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
                        <div className="font-bold text-slate-900 dark:text-white">Reseller Domain Authority</div>
                        <div className="text-slate-500 text-[11px]">DNS verification, rate-limit governance, and certified ingress routes</div>
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
                      <span className="text-2xl font-extrabold font-mono text-[#979BF3] dark:text-[#979BF3]">
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
                      <span>Launch Cloudboy Connect Studio</span>
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
                    isDarkMode ? 'bg-[#24232B] border-slate-800' : 'bg-slate-50 border-slate-200'
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
              isDarkMode ? 'bg-[#24232B] border-slate-800' : 'bg-white border-slate-200'
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
                      <span className="text-2xl font-extrabold font-mono text-[#979BF3] dark:text-[#979BF3]">
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
                    isDarkMode ? 'bg-[#24232B] border-slate-800' : 'bg-slate-50 border-slate-200'
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

          {/* Module 4: Brand Reputation & MAP Protection Details */}
          {activeModuleTab === 'map_protection' && (
            <div className={`p-8 sm:p-10 rounded-3xl border shadow-xl transition-all ${
              isDarkMode ? 'bg-[#24232B] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-extrabold uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      Module 04 · Autonomous Enforcement
                    </span>
                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      240+ Touchpoints Active
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Brand Reputation Sentinel &amp; Autonomous MAP Defense Suite
                  </h3>

                  <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                    Protects your brand margins across major online marketplaces (Amazon, Walmart, TikTok Shop, eBay). Crawlers photograph price cuts in real time, cryptographically hash screenshot evidence for courtroom admissibility, and transmit certified Cease &amp; Desist warnings.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Continuous Multi-Marketplace Sweeps</div>
                        <div className="text-slate-500 text-[11px]">Amazon, Walmart, TikTok Shop, Mercari, eBay</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Court-Ready Evidence Hashes</div>
                        <div className="text-slate-500 text-[11px]">SHA-256 screenshot notarization &amp; DOM capture</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">1-Click Cease &amp; Desist Notice</div>
                        <div className="text-slate-500 text-[11px]">Automated transmission &amp; email alert notifications</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Sentinel AI Brand Bot</div>
                        <div className="text-slate-500 text-[11px]">Multi-channel social, review &amp; news sentiment rate</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onLaunchApp('map_protection')}
                      className="px-5 py-3 bg-[#E00728] hover:bg-rose-600 text-white font-mono font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Launch MAP Protection Suite ➔</span>
                    </button>
                    <a
                      href="#brand-protection"
                      className="px-4 py-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono font-bold rounded-xl transition-all"
                    >
                      View Live Violation Evidence
                    </a>
                  </div>
                </div>

                {/* Right Interactive Telemetry Box */}
                <div className="lg:col-span-5">
                  <div className={`p-6 rounded-2xl border font-mono text-xs space-y-4 ${
                    isDarkMode ? 'bg-[#1C1B21] border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                        <span className="font-bold uppercase tracking-wider text-rose-500">MAP Sentinel Node</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Live Crawl Active</span>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">Target SKU:</span>
                          <span className="font-bold text-slate-900 dark:text-white">VNTG-TEE-BLK</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">Target MAP Floor:</span>
                          <span className="font-bold text-emerald-500">$35.00</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">Breach Price:</span>
                          <span className="font-bold text-rose-500">$26.99 (-$8.01)</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 space-y-1">
                        <div className="flex items-center justify-between font-bold text-[11px]">
                          <span>Cease &amp; Desist Dispatched</span>
                          <span>CD-2026-MAP-0842</span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          To: legal@apexdeals.com · Lanham Act 15 U.S.C. § 1114 Warning Sent
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                          <div className="text-slate-400 text-[10px]">Brand Sentiment</div>
                          <div className="font-bold text-emerald-500 mt-0.5">94.2% Positive</div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                          <div className="text-slate-400 text-[10px]">Active SKUs</div>
                          <div className="font-bold text-slate-900 dark:text-white mt-0.5">240 Monitored</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Scraper Cycle: 100% Online</span>
                      <span className="text-emerald-500 font-bold">Email Alerts Armed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module 5: CloudboyX Predict & Bayesian Odds Details */}
          {activeModuleTab === 'predict' && (
            <div className={`p-8 sm:p-10 rounded-3xl border shadow-xl transition-all ${
              isDarkMode ? 'bg-[#24232B] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-extrabold uppercase bg-purple-500/10 text-purple-600 dark:text-[#979BF3] border border-purple-500/20">
                      Module 05 · Quantitative Intelligence
                    </span>
                    <span className="text-xs font-mono text-purple-500 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                      Live Prediction Feeds
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Quantitative Forecasting &amp; Bayesian Prediction Engine
                  </h3>

                  <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                    Engineered from the ground up for high-velocity probability forecasting. Combines real-time Kalshi and Polymarket contract spreads, NFL player props statistical distribution models, Bayesian probability updates, and Kelly Criterion capital allocation.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Bayesian Probability Calculus</div>
                        <div className="text-slate-500 text-[11px]">Fair odds, Kelly Criterion bankroll sizing &amp; EV</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Kalshi &amp; Polymarket Volatility</div>
                        <div className="text-slate-500 text-[11px]">Real-time contract spreads, order book depth &amp; sentiment</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">NFL Player Props Edge Matrix</div>
                        <div className="text-slate-500 text-[11px]">Poisson distribution &amp; sportsbook discrepancy finder</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Backtesting &amp; Webhook Hub</div>
                        <div className="text-slate-500 text-[11px]">Historical event replay, catalyst impact &amp; REST APIs</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onLaunchApp('predict')}
                      className="px-5 py-3 bg-[#979BF3] hover:bg-[#B4B7F7] text-[#1C1B21] font-mono font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Launch Predict &amp; Odds Engine ➔</span>
                    </button>
                    <a
                      href="#predict"
                      className="px-4 py-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono font-bold rounded-xl transition-all"
                    >
                      Explore Interactive Sandbox
                    </a>
                  </div>
                </div>

                {/* Right Interactive Telemetry Box */}
                <div className="lg:col-span-5">
                  <div className={`p-6 rounded-2xl border font-mono text-xs space-y-4 ${
                    isDarkMode ? 'bg-[#1C1B21] border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                        <span className="font-bold uppercase tracking-wider text-[#979BF3]">Kelly Criterion Live Calculator</span>
                      </div>
                      <span className="text-[10px] text-emerald-500 font-bold">+21.0% Edge</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400">Market Implied Price:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{sandboxMarketPrice}¢ (44% prob)</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="90"
                          value={sandboxMarketPrice}
                          onChange={(e) => setSandboxMarketPrice(Number(e.target.value))}
                          className="w-full accent-purple-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400">Model Bayesian Estimate:</span>
                          <span className="font-bold text-[#979BF3]">{sandboxModelProb}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="90"
                          value={sandboxModelProb}
                          onChange={(e) => setSandboxModelProb(Number(e.target.value))}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                      </div>

                      {/* Computed Outcome */}
                      <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">Statistical Edge:</span>
                          <span className="font-bold text-emerald-500">
                            {sandboxModelProb > sandboxMarketPrice ? `+${sandboxModelProb - sandboxMarketPrice}% Alpha` : `${sandboxModelProb - sandboxMarketPrice}% Drift`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">Optimal Kelly Sizing:</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {Math.max(0, Math.round(((sandboxModelProb / 100) - (sandboxMarketPrice / 100)) / (1 - (sandboxMarketPrice / 100)) * 100))}% Bankroll
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">Expected Value:</span>
                          <span className="font-bold text-[#979BF3]">
                            +${Math.max(0, Math.round(((sandboxModelProb - sandboxMarketPrice) / sandboxMarketPrice) * 100))}% ROI
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                          <div className="text-slate-400 text-[10px]">Tracked Contracts</div>
                          <div className="font-bold text-slate-900 dark:text-white mt-0.5">Kalshi + Poly</div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                          <div className="text-slate-400 text-[10px]">NFL Props</div>
                          <div className="font-bold text-emerald-500 mt-0.5">32 Teams Synced</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Engine: Bayesian MCMC Node</span>
                      <span className="text-purple-400 font-bold">&lt; 2ms Inference</span>
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
        isDarkMode ? 'bg-[#24232B] border-slate-800' : 'bg-slate-50/70 border-slate-200'
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
              isDarkMode ? 'bg-[#24232B] border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 shadow-sm hover:border-[#979BF3]/50'
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
              isDarkMode ? 'bg-[#24232B] border-slate-800 hover:border-purple-500/50' : 'bg-white border-slate-200 shadow-sm hover:border-purple-500/50'
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
              isDarkMode ? 'bg-[#24232B] border-slate-800 hover:border-emerald-500/50' : 'bg-white border-slate-200 shadow-sm hover:border-emerald-500/50'
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
              isDarkMode ? 'bg-[#24232B] border-slate-800 hover:border-amber-500/50' : 'bg-white border-slate-200 shadow-sm hover:border-amber-500/50'
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
          <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#03152d] via-[#02234e] to-[#04336c] text-white border border-[#979BF3] shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
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
      {/* 3D. BRAND REPUTATION & AUTONOMOUS MAP PROTECTION FOCAL SUITE */}
      {/* ────────────────────────────────────────────────────────── */}
      <section id="brand-protection" className={`scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-24 border-b relative overflow-hidden ${
        isDarkMode ? 'bg-[#080718] border-slate-800' : 'bg-gradient-to-b from-rose-50/40 via-white to-slate-50 border-slate-200'
      }`}>
        {/* Ambient atmospheric glow */}
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[350px] bg-[#E00728]/15 dark:bg-[#E00728]/10 blur-3xl rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[300px] bg-indigo-500/10 dark:bg-indigo-600/10 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-[#E00728]/15 text-[#E00728] dark:text-[#E00728] border border-[#E00728]/40 mb-4 shadow-xs">
              <ShieldAlert className="w-4 h-4 text-[#E00728] animate-pulse" />
              <span>FOCAL SUITE CAPABILITY · AUTONOMOUS MAP DEFENSE & REPUTATION ENGINE</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Defend Wholesale Margins & Enforce Minimum Advertised Pricing
            </h2>
            
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              Rogue resellers and grey-market undercutting erode wholesale distribution relationships and destroy brand value. CloudboyX deploys autonomous circular scrapers across Amazon, Walmart, TikTok Shop, and Mercari—capturing courtroom evidence, transmitting formal Cease &amp; Desist demands, and delivering real-time email alerts.
            </p>
          </div>

          {/* 6 High-Impact Capabilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            
            {/* Card 1: Batch SKU Scrapers */}
            <div className={`p-6 rounded-2xl border transition-all hover:scale-[1.01] flex flex-col justify-between ${
              isDarkMode ? 'bg-[#24232B] border-slate-800 hover:border-rose-500/50' : 'bg-white border-slate-200 shadow-sm hover:border-rose-500/50'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#E00728]/15 text-[#E00728] dark:text-[#E00728] flex items-center justify-center font-bold">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E00728]/15 text-[#E00728] dark:text-[#E00728] font-bold border border-rose-500/20">
                    AUTOMATED SCRAPERS
                  </span>
                </div>
                <h3 className="font-bold font-mono text-base mb-1">Batch SKU Multi-Marketplace Crawler</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  Upload CSV product feeds or single SKUs. Daemons run circular sweeps across Amazon US, Walmart, TikTok Shop, Mercari, and eBay to flag price cuts beneath your MAP floor.
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-[#E00728] shrink-0" />
                    <span>240+ Listing Touchpoints Scanned</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-[#E00728] shrink-0" />
                    <span>Sub-Minute Price Breach Detection</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-[#E00728] dark:text-[#E00728]">
                <span>Coverage</span>
                <span className="font-bold">Amazon, Walmart, TikTok &amp; eBay</span>
              </div>
            </div>

            {/* Card 2: Courtroom Screenshot Evidence */}
            <div className={`p-6 rounded-2xl border transition-all hover:scale-[1.01] flex flex-col justify-between ${
              isDarkMode ? 'bg-[#24232B] border-slate-800 hover:border-purple-500/50' : 'bg-white border-slate-200 shadow-sm hover:border-purple-500/50'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20">
                    LEGAL EVIDENCE
                  </span>
                </div>
                <h3 className="font-bold font-mono text-base mb-1">Courtroom-Ready Screenshot Proof</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  The moment a violation occurs, the scraper takes a full viewport screenshot of the reseller listing, stamping it with UTC timestamps and cryptographic SHA-256 evidence hashes.
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>Immutable SHA-256 Cryptographic Hash</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>Tamper-Proof Audit Attachment</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-purple-600 dark:text-purple-400">
                <span>Admissibility</span>
                <span className="font-bold">Federal Courtroom Compliant</span>
              </div>
            </div>

            {/* Card 3: Automated Cease & Desist Warning */}
            <div className={`p-6 rounded-2xl border transition-all hover:scale-[1.01] flex flex-col justify-between ${
              isDarkMode ? 'bg-[#24232B] border-slate-800 hover:border-indigo-500/50' : 'bg-white border-slate-200 shadow-sm hover:border-indigo-500/50'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">
                    LEGAL ENFORCEMENT
                  </span>
                </div>
                <h3 className="font-bold font-mono text-base mb-1">Automated Cease &amp; Desist Engine</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  Generates legal notices citing Lanham Act 15 U.S.C. § 1125(a) and authorized reseller terms. Features a 24h–48h cure period countdown with 1-click certified dispatch.
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>1-Click Certified Legal Transmission</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Active 24h/48h Cure Window Tracker</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                <span>Transmission</span>
                <span className="font-bold">SendGrid &amp; Lob Courier Gateway</span>
              </div>
            </div>

            {/* Card 4: Automated Email Notifications */}
            <div className={`p-6 rounded-2xl border transition-all hover:scale-[1.01] flex flex-col justify-between ${
              isDarkMode ? 'bg-[#24232B] border-slate-800 hover:border-emerald-500/50' : 'bg-white border-slate-200 shadow-sm hover:border-emerald-500/50'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                    REAL-TIME ALERTS
                  </span>
                </div>
                <h3 className="font-bold font-mono text-base mb-1">Automated Email Notification System</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  Instant HTML email alerts delivered when breaches occur, featuring product SKU, price delta, scraper screenshot evidence, and a direct link to the Cease &amp; Desist draft.
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Pre-Configured to gocloudboy2@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Direct 1-Click Link into C&amp;D Draft</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                <span>Speed</span>
                <span className="font-bold">&lt; 5s Alert Dispatch</span>
              </div>
            </div>

            {/* Card 5: Regional Heatmap */}
            <div className={`p-6 rounded-2xl border transition-all hover:scale-[1.01] flex flex-col justify-between ${
              isDarkMode ? 'bg-[#24232B] border-slate-800 hover:border-amber-500/50' : 'bg-white border-slate-200 shadow-sm hover:border-amber-500/50'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                    GEOGRAPHIC INTEL
                  </span>
                </div>
                <h3 className="font-bold font-mono text-base mb-1">Regional MAP Compliance Heatmap</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  Interactive visual breakdown mapping active MAP breaches by region (US-West, Midwest, Southwest, Europe, Asia) to expose geographic wholesale leakage.
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Dynamic Regional Compliance Percentages</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Rogue Reseller Hub Geolocation</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-amber-600 dark:text-amber-400">
                <span>Granularity</span>
                <span className="font-bold">5 Regional Enclaves</span>
              </div>
            </div>

            {/* Card 6: Sentinel AI Reputation Bot */}
            <div className={`p-6 rounded-2xl border transition-all hover:scale-[1.01] flex flex-col justify-between ${
              isDarkMode ? 'bg-[#24232B] border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 shadow-sm hover:border-cyan-500/50'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/20">
                    PREDICTIVE BOT
                  </span>
                </div>
                <h3 className="font-bold font-mono text-base mb-1">Sentinel AI Brand Reputation Bot</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  Autonomous bot crawling Reddit, X, Trustpilot, and regional forums. Evaluates real-time brand sentiment and computes forward-looking trajectory probability rates.
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span>Sentiment Index: 94.2% Positive</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span>Predictive Brand Drift Trajectory</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-cyan-600 dark:text-cyan-400">
                <span>Intelligence</span>
                <span className="font-bold">Multichannel Sentiment Feed</span>
              </div>
            </div>

          </div>

          {/* Interactive Incident & C&D Notice Preview Card */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-[#E00728]/50 text-white shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E00728]">
                    LIVE SYSTEM SIMULATION · ACTIVE MAP VIOLATION DETECTED
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-mono mt-1">
                  Incident Ref: CD-2026-MAP-0842 · Amazon US
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Rogue reseller <strong>Apex Deals LLC</strong> detected selling <strong>VNTG-TEE-BLK</strong> at $26.99 (target MAP floor: $35.00). Price degradation: -$8.01 (-23%).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-xs font-bold">
                  ⏳ 19 Hours Cure Remaining
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold">
                  ✓ Email Alert Delivered
                </span>
              </div>
            </div>

            {/* Incident Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block uppercase">Scraper Screenshot Evidence</span>
                <div className="text-white font-bold flex items-center gap-2">
                  <Camera className="w-4 h-4 text-indigo-400" />
                  <span>Captured with SHA-256 Hash</span>
                </div>
                <span className="text-slate-400 text-[9px] truncate block font-mono">e3b0c44298fc1c149afbf4c8996fb9...</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block uppercase">Formal Demand Reference</span>
                <div className="text-white font-bold flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#E00728]" />
                  <span>Lanham Act § 1125(a) Demand</span>
                </div>
                <span className="text-slate-400 text-[10px] block">Notice ID: TRK-CD-9941-US</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block uppercase">Automated Alert Destination</span>
                <div className="text-white font-bold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span>gocloudboy2@gmail.com</span>
                </div>
                <span className="text-slate-400 text-[10px] block">1-Click C&amp;D Review Link Active</span>
              </div>
            </div>

            {/* Focal Call to Action Card Inside Brand Protection */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/60 via-slate-950 to-indigo-950/60 border border-[#E00728]/50 flex flex-col lg:flex-row items-center justify-between gap-5">
              <div className="text-center lg:text-left space-y-1">
                <div className="text-xs font-mono font-bold text-[#E00728] uppercase tracking-wider">
                  ALL-IN-ONE SUITE SUBSCRIPTION VALUE
                </div>
                <h4 className="text-lg sm:text-xl font-bold font-mono text-white">
                  Get Brand Reputation &amp; MAP Protection in the Complete Suite ($959/mo)
                </h4>
                <p className="text-xs text-slate-300 max-w-xl">
                  Why pay thousands for separate web scrapers, legal notice dispatchers, and accounting software? Everything is integrated into one unified monthly subscription.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full lg:w-auto">
                <button
                  type="button"
                  id="brand-protection-signup-suite-btn"
                  onClick={() => openAuthWithPlan('signup', true)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-rose-600 via-red-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-mono font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Get Complete Suite ($959/mo)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  id="brand-protection-launch-workspace-btn"
                  onClick={() => onLaunchApp('ingress')}
                  className="w-full sm:w-auto px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold text-xs sm:text-sm rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Launch Live Workspace</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3E. CLOUDBOYX PREDICT: QUANTITATIVE FORECASTING & ODDS     */}
      {/* ────────────────────────────────────────────────────────── */}
      <section id="predict" className={`scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-24 border-b relative overflow-hidden ${
        isDarkMode ? 'bg-[#0f0c1b] border-slate-800' : 'bg-gradient-to-b from-purple-50/50 via-white to-slate-50 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-[#979BF3] border border-purple-500/30 mb-3">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>MODULE 05 · QUANTITATIVE PREDICTION &amp; EVENT ENGINE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Bayesian Probability Models &amp; Real-Time Market Intelligence
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
              Transform qualitative assumptions into mathematical conviction. Live Kalshi &amp; Polymarket spread feeds, NFL player props statistical edge detection, Bayesian probability updates, and algorithmic Kelly Criterion bankroll sizing.
            </p>
          </div>

          {/* 4 Pillars of Predict Engine */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            
            {/* Predict Pillar 1 */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all hover:scale-[1.01] ${
              isDarkMode ? 'bg-[#1C1B21] border-slate-800 hover:border-purple-500/50' : 'bg-white border-slate-200 shadow-sm hover:border-purple-400'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-[#979BF3] flex items-center justify-center font-bold">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-[#979BF3] font-bold border border-purple-500/20">
                    BAYESIAN
                  </span>
                </div>
                <h3 className="font-bold font-mono text-base mb-1">Probability Studio</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  Computes Bayesian probability adjustments as breaking news and earnings reports arrive, outputting fair probability distributions vs market price.
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>Real-time Invariant Scoring</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>Kelly Criterion Stake Sizing</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>Expected ROI Inversion</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-purple-500">
                <span>Model Latency</span>
                <span className="font-bold">&lt; 2ms Inference</span>
              </div>
            </div>

            {/* Predict Pillar 2 */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all hover:scale-[1.01] ${
              isDarkMode ? 'bg-[#1C1B21] border-slate-800 hover:border-indigo-500/50' : 'bg-white border-slate-200 shadow-sm hover:border-indigo-400'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">
                    MARKETS
                  </span>
                </div>
                <h3 className="font-bold font-mono text-base mb-1">Live Contract Volatility</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  Continuous multi-source order book scraping across Kalshi event contracts and Polymarket crypto liquidity pools for macro, political, and economic events.
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Order Book Depth Feeds</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Cross-Exchange Spread Arbitrage</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Sentiment Momentum Tracking</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-indigo-500">
                <span>Data Ingestion</span>
                <span className="font-bold">Sub-Second WebSocket</span>
              </div>
            </div>

            {/* Predict Pillar 3 */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all hover:scale-[1.01] ${
              isDarkMode ? 'bg-[#1C1B21] border-slate-800 hover:border-emerald-500/50' : 'bg-white border-slate-200 shadow-sm hover:border-emerald-400'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                    SPORTS MATRIX
                  </span>
                </div>
                <h3 className="font-bold font-mono text-base mb-1">NFL Props Edge Matrix</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  Player prop projections (passing, rushing, receiving, touchdowns) with Poisson distribution modeling to identify statistical mispricings vs consensus books.
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>32 NFL Teams Monitored</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Injury &amp; Weather Volatility</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Automated Edge Percentile</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-emerald-500">
                <span>Edge Accuracy</span>
                <span className="font-bold">+18.4% Mean Alpha</span>
              </div>
            </div>

            {/* Predict Pillar 4 */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all hover:scale-[1.01] ${
              isDarkMode ? 'bg-[#1C1B21] border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 shadow-sm hover:border-cyan-400'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/20">
                    HISTORICAL
                  </span>
                </div>
                <h3 className="font-bold font-mono text-base mb-1">Catalysts &amp; Backtesting</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  Chronological milestone calendars showing event resolution criteria, catalyst impact weights, and historical strategy backtests with Sharpe ratios.
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span>5,000+ Replayed Events</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span>Brier Score Calibration</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span>REST / Webhook Ingestion Hub</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-cyan-500">
                <span>Backtest Set</span>
                <span className="font-bold">2.4M Historical Ticks</span>
              </div>
            </div>

          </div>

          {/* Interactive Predict Engine Simulator Bar */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#170a2a] via-[#100c28] to-[#0a1828] text-white border border-[#979BF3]/40 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-mono font-bold text-purple-400">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span>PREDICT ENGINE WORKBENCH: READY TO EXECUTE</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-mono">
                Experience Quantitative Event Analytics Inside CloudboyX
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Run live probability calculations, inspect NFL prop discrepancies, replay historical resolution timelines, and configure automated data connectors.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => onLaunchApp('predict')}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#979BF3] hover:bg-[#B4B7F7] active:scale-95 text-[#1C1B21] font-mono font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 text-[#1C1B21]" />
                <span>Launch Predict Workbench ➔</span>
              </button>
              <a
                href="#pricing"
                className="w-full sm:w-auto px-5 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono font-bold text-xs sm:text-sm rounded-xl transition-all text-center cursor-pointer"
              >
                <span>Add Module 05 to Plan</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3F. WHITE-LABEL BRAND PORTALS & INSTANT SITE BUILDER       */}
      {/* ────────────────────────────────────────────────────────── */}
      <section id="portals" className={`scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-24 border-b relative overflow-hidden ${
        isDarkMode ? 'bg-[#15141c] border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#979BF3]/15 text-[#979BF3] border border-[#979BF3]/30 mb-3">
              <Globe className="w-3.5 h-3.5" />
              <span>BRAND PORTALS &amp; INSTANT COMPILER · ZERO-RUNTIME OVERHEAD</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Enterprise White-Label Brand Portals &amp; Instant Site Builder
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
              Launch turnkey, responsive public portals for your resellers, logistics partners, and brand protection compliance teams. Visual drag-and-drop block composition, live multi-viewport preview, and 1-click static code exports with $0.00 recurring builder fees.
            </p>
          </div>

          {/* Interactive Portal Showcase Matrix */}
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl mb-12 ${
            isDarkMode ? 'bg-[#1C1B21] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            
            {/* Top Toolbar: Viewport & Template Selectors */}
            <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
              
              {/* Template Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-slate-400 mr-1 hidden sm:inline">Portal Kit:</span>
                {[
                  { key: 'saas', label: 'SaaS Rocket Hub', icon: '🚀' },
                  { key: 'logistics', label: 'SafeShip Cargo', icon: '🚚' },
                  { key: 'brand', label: 'Brand MAP Shield', icon: '🛡️' },
                  { key: 'agency', label: 'Creative Studio', icon: '⚡' },
                  { key: 'wholesale', label: 'B2B Wholesale', icon: '🏢' },
                ].map((tpl) => (
                  <button
                    key={tpl.key}
                    type="button"
                    onClick={() => setActivePortalTemplate(tpl.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activePortalTemplate === tpl.key
                        ? 'bg-[#979BF3] text-[#1C1B21] shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>{tpl.icon}</span>
                    <span>{tpl.label}</span>
                  </button>
                ))}
              </div>

              {/* Viewport Toggles */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPortalViewport('desktop')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    portalViewport === 'desktop'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Desktop (1920)
                </button>
                <button
                  type="button"
                  onClick={() => setPortalViewport('tablet')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    portalViewport === 'tablet'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Tablet (768)
                </button>
                <button
                  type="button"
                  onClick={() => setPortalViewport('mobile')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    portalViewport === 'mobile'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Mobile (375)
                </button>
              </div>
            </div>

            {/* Live Interactive Portal Canvas Preview */}
            <div className="py-6 sm:py-8 w-full overflow-x-auto">
              <div className={`mx-auto w-full transition-all duration-300 ${
                portalViewport === 'desktop' ? 'max-w-5xl' : portalViewport === 'tablet' ? 'max-w-xl' : 'max-w-xs'
              }`}>
                
                {/* Mock Browser Frame */}
                <div className="rounded-2xl border border-slate-700/60 overflow-hidden shadow-2xl bg-[#0F172A] text-white font-sans">
                  
                  {/* Browser Bar */}
                  <div className="bg-[#0b101d] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                    </div>
                    <div className="bg-slate-900 px-4 py-1 rounded-lg text-[11px] text-slate-300 border border-slate-800 truncate max-w-[280px]">
                      https://portal.enterprise.cloudboyx.io/{activePortalTemplate}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-bold">200 OK</div>
                  </div>

                  {/* Portal Body Preview */}
                  <div className="p-6 sm:p-8 space-y-6">
                    {activePortalTemplate === 'saas' && (
                      <div className="space-y-6">
                        <div className="text-center max-w-xl mx-auto space-y-3">
                          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            SaaS Deployment Autopilot
                          </span>
                          <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                            Manage Complex Multi-Channel Logistics On Autopilot
                          </h4>
                          <p className="text-xs text-slate-300">
                            Complete compliance auditing, sub-second latency reporting, and white-labeled exports.
                          </p>
                          <div className="flex justify-center gap-2 pt-2">
                            <span className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold font-mono">
                              Start Free 14-Day Trial
                            </span>
                            <span className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg text-xs font-mono">
                              API Documentation
                            </span>
                          </div>
                        </div>

                        {/* 3-Column Bento */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                            <div className="text-indigo-400 text-base mb-1">⚡</div>
                            <div className="font-bold">Sub-Second Scrapes</div>
                            <div className="text-[11px] text-slate-400 mt-1">Discovers pricing deviations in real time across 240+ touchpoints.</div>
                          </div>
                          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                            <div className="text-emerald-400 text-base mb-1">🛡️</div>
                            <div className="font-bold">Ironclad Security</div>
                            <div className="text-[11px] text-slate-400 mt-1">WAF shunts, HMAC signature validation, and Merkle root proofs.</div>
                          </div>
                          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                            <div className="text-purple-400 text-base mb-1">📈</div>
                            <div className="font-bold">Reseller Analytics</div>
                            <div className="text-[11px] text-slate-400 mt-1">Automated partner scorecards and Lanham Act legal notice templates.</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activePortalTemplate === 'logistics' && (
                      <div className="space-y-6">
                        <div className="text-center max-w-xl mx-auto space-y-2">
                          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            Volumetric Courier Engine
                          </span>
                          <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                            Multi-Carrier Dispatch &amp; Rate Optimizer
                          </h4>
                          <p className="text-xs text-slate-300">
                            Compare dynamic FedEx, UPS, USPS, and DHL transit tariffs with instant automated label dispatch slips.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                            <div className="text-xs font-mono text-slate-400">Ground Parcel</div>
                            <div className="text-xl font-bold font-mono text-white mt-1">$12<span className="text-xs text-slate-400">/parcel</span></div>
                            <div className="text-[10px] text-slate-400 mt-1">3-5 day transit delivery</div>
                          </div>
                          <div className="p-3.5 rounded-xl bg-slate-900 border-2 border-indigo-500 text-center relative">
                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] bg-indigo-600 px-2 py-0.5 rounded-full font-bold">POPULAR</span>
                            <div className="text-xs font-mono text-indigo-300">Priority Air Freight</div>
                            <div className="text-xl font-bold font-mono text-white mt-1">$36<span className="text-xs text-slate-400">/parcel</span></div>
                            <div className="text-[10px] text-slate-400 mt-1">Guaranteed 1-2 day air flight</div>
                          </div>
                          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                            <div className="text-xs font-mono text-slate-400">Overnight Hot-Shot</div>
                            <div className="text-xl font-bold font-mono text-white mt-1">$72<span className="text-xs text-slate-400">/parcel</span></div>
                            <div className="text-[10px] text-slate-400 mt-1">Next-day terminal routing</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activePortalTemplate === 'brand' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                          <div>
                            <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">MAP Compliance Incident Desk</span>
                            <h4 className="text-lg font-bold">Rogue Price-Breaker Incident TRK-CD-9941</h4>
                          </div>
                          <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-400 text-xs font-mono font-bold">
                            EVIDENTIARY HASH READY
                          </span>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs font-mono">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Violator Domain:</span>
                            <span className="text-white font-bold">Apex Deals LLC (Amazon US Storefront)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Product SKU:</span>
                            <span className="text-indigo-300">VNTG-TEE-BLK</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Price Deviation:</span>
                            <span className="text-rose-400 font-bold">$26.99 (Target MAP: $35.00 · -$8.01)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Remedy Action:</span>
                            <span className="text-emerald-400">Certified Lanham Act C&amp;D Transmitted</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activePortalTemplate === 'agency' && (
                      <div className="text-center max-w-lg mx-auto space-y-3 py-2">
                        <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Creative Engineering
                        </span>
                        <h4 className="text-2xl font-extrabold tracking-tight">
                          We Engineer Bespoke Digital Products That Users Love
                        </h4>
                        <p className="text-xs text-slate-300">
                          Modern UI engineering, real-time compliance workflows, and strategic positioning for ambitious ventures.
                        </p>
                        <div className="pt-2">
                          <span className="px-5 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-mono font-bold">
                            Schedule Design Sprint ➔
                          </span>
                        </div>
                      </div>
                    )}

                    {activePortalTemplate === 'wholesale' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <h4 className="text-base font-bold font-mono">B2B Authorized Reseller Whitelist</h4>
                          <span className="text-xs font-mono text-emerald-400 font-bold">34 Partners Active</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                            <div>
                              <div className="font-bold text-white">Nordic Commerce AS</div>
                              <div className="text-[10px] text-slate-400">Tier: Platinum · Margin Lock: 42%</div>
                            </div>
                            <span className="text-emerald-400 font-bold">VERIFIED</span>
                          </div>
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                            <div>
                              <div className="font-bold text-white">Pacific Basin Retailers</div>
                              <div className="text-[10px] text-slate-400">Tier: Gold · Margin Lock: 38%</div>
                            </div>
                            <span className="text-emerald-400 font-bold">VERIFIED</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom 5 Key Advantages Grid */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">100% Zero-Cloud Runtime</div>
                  <div className="text-slate-500 text-[11px]">$0.00/mo self-hosting with no lock-in fees</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">1-Click Static HTML Export</div>
                  <div className="text-slate-500 text-[11px]">Download production HTML5, React TSX, or JSON</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Live Multi-Viewport Auditing</div>
                  <div className="text-slate-500 text-[11px]">Test Desktop, Tablet, and Mobile layouts</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">AI Copywriting Assistant</div>
                  <div className="text-slate-500 text-[11px]">Drafts marketing copy &amp; legal notices in seconds</div>
                </div>
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
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#979BF3] dark:text-[#979BF3]">
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
            isDarkMode ? 'bg-[#24232B] border-slate-800' : 'bg-white border-slate-200'
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
                      ? 'bg-[#979BF3] text-[#1C1B21] text-white shadow-xs' 
                      : 'bg-white/10 hover:bg-white/20 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ⚡ Shopify Webhook
                </button>
                <button
                  onClick={() => setSimChannel('edi')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    simChannel === 'edi' 
                      ? 'bg-[#979BF3] text-[#1C1B21] text-white shadow-xs' 
                      : 'bg-white/10 hover:bg-white/20 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  📄 EDI 850 Order
                </button>
                <button
                  onClick={() => setSimChannel('csv')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    simChannel === 'csv' 
                      ? 'bg-[#979BF3] text-[#1C1B21] text-white shadow-xs' 
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
                <button onClick={onLaunchApp} className="text-[#979BF3] hover:underline font-bold flex items-center gap-1 cursor-pointer">
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
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#979BF3] dark:text-[#979BF3]">
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
              isDarkMode ? 'bg-[#24232B] border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 hover:border-[#979BF3]/50 shadow-xs'
            }`}>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-[#979BF3] dark:text-cyan-400 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-mono">Canonical Schema Normalization</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Ingest disparate payload structures from Shopify webhooks, EDI 850 formats, and raw CSV dumps. All data maps automatically into a unified relational schema.
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${
              isDarkMode ? 'bg-[#24232B] border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 hover:border-[#979BF3]/50 shadow-xs'
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
              isDarkMode ? 'bg-[#24232B] border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 hover:border-[#979BF3]/50 shadow-xs'
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
              isDarkMode ? 'bg-[#24232B] border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 hover:border-[#979BF3]/50 shadow-xs'
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
              isDarkMode ? 'bg-[#24232B] border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 hover:border-[#979BF3]/50 shadow-xs'
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
              isDarkMode ? 'bg-[#24232B] border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 hover:border-[#979BF3]/50 shadow-xs'
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
        isDarkMode ? 'bg-[#24232B] border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#979BF3] dark:text-[#979BF3]">
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
              isDarkMode ? 'bg-[#24232B] border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 shadow-xs hover:border-[#979BF3]/50'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-[#979BF3] dark:text-cyan-400 flex items-center justify-center shrink-0">
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
              isDarkMode ? 'bg-[#24232B] border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 shadow-xs hover:border-[#979BF3]/50'
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
              isDarkMode ? 'bg-[#24232B] border-[#0096c7]' : 'bg-blue-50/60 border-[#979BF3] shadow-md'
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
                      Continuous mathematical assertion of the fundamental double-entry equation: <span className="font-mono font-bold text-[#979BF3] dark:text-[#979BF3]">Σ Debits ≡ Σ Credits</span>. Unbalanced entries are automatically quarantined into a zero-impact audit sandbox.
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
              isDarkMode ? 'bg-[#24232B] border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 shadow-xs hover:border-[#979BF3]/50'
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
              isDarkMode ? 'bg-[#24232B] border-slate-800 hover:border-cyan-500/50' : 'bg-white border-slate-200 shadow-xs hover:border-[#979BF3]/50'
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
          <div className="mt-12 max-w-5xl mx-auto rounded-2xl bg-[#979BF3] p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-[#979BF3]">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#979BF3]">
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
                <Activity className="w-4 h-4 text-[#979BF3]" />
                <span>Test Simulator</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 6. ENTERPRISE SOCIAL PROOF & TESTIMONIALS                  */}
      {/* ────────────────────────────────────────────────────────── */}
      <section id="testimonials" className={`scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-24 border-t ${isDarkMode ? 'bg-[#24232B] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#979BF3] dark:text-[#979BF3]">
              Trusted by Finance & Ops Leaders
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-2">
              Proven Reliability Across Billions in High-Volume Commerce
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-[#24232B] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
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
              isDarkMode ? 'bg-[#24232B] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
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
              isDarkMode ? 'bg-[#24232B] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-gradient-to-r from-[#0077b6]/15 via-rose-500/15 to-emerald-500/15 text-[#979BF3] dark:text-[#979BF3] border border-[#979BF3]/30 mb-3 shadow-xs">
              <Sparkles className="w-4 h-4 text-[#E00728] animate-pulse" />
              <span>GENERAL SUITE SUBSCRIPTION · ONE BUNDLED PRICE OR PIECE THEM TOGETHER</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2">
              General Suite Subscription: All Engines, One Simple Price
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Get the entire platform—including autonomous <strong>Brand Reputation &amp; MAP Price Defense</strong>, General Ledger, Ingress Pipelines, Procurement Matching, and CyberShield Security—for just <strong>${billingCycle === 'annual' ? '959' : '1,199'}/month</strong>. Or piece together individual modules as needed.
            </p>

            {/* General Suite Call to Action Banner Ribbon */}
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-[#0077b6]/10 to-emerald-500/10 border border-[#979BF3]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-[#0077b6] text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>COMPLETE SUITE INCLUDES MAP &amp; REPUTATION SHIELD</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#E00728]/20 text-[#E00728] dark:text-[#E00728] font-extrabold">NEW</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    240+ touchpoint scrapers, court-ready screenshot evidence hashes, automated Cease &amp; Desist dispatch, and email alerts.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openAuthWithPlan('signup', true, selectedSecurityTier)}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-[#0077b6] to-[#023e8a] hover:bg-[#B4B7F7] text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Get General Suite (${billingCycle === 'annual' ? '959' : '1,199'}/mo)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pricing Mode Toggle: Whole Suite vs Piece Them Together */}
            {/* Pricing Mode Toggle: Whole Suite vs Piece Them Together */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xl mx-auto">
              <div className="flex flex-col sm:inline-flex sm:flex-row p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-inner w-full sm:w-auto gap-1">
                <button
                  type="button"
                  onClick={() => setPricingMode('bundle')}
                  className={`min-h-[44px] px-4 sm:px-5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    pricingMode === 'bundle'
                      ? 'bg-[#979BF3] text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <PackageCheck className="w-4 h-4 shrink-0" />
                  <span>General Suite All-in-One ($959/mo)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPricingMode('modular')}
                  className={`min-h-[44px] px-4 sm:px-5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    pricingMode === 'modular'
                      ? 'bg-[#979BF3] text-[#1C1B21] shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sliders className="w-4 h-4 shrink-0" />
                  <span>Piece Them Together (A La Carte)</span>
                </button>
              </div>

              {/* Monthly / Annual Billing Toggle */}
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`min-h-[44px] px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
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
                  className={`min-h-[44px] px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    billingCycle === 'annual'
                      ? 'bg-[#979BF3] text-[#1C1B21] shadow-xs'
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
                isDarkMode ? 'bg-[#24232B] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
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

              {/* Plan 2: General Suite All-in-One (Featured Best Value) */}
              <div className={`p-8 rounded-3xl border-2 relative flex flex-col justify-between shadow-2xl ${
                isDarkMode ? 'bg-[#24232B] border-[#00b4d8]' : 'bg-blue-50/50 border-[#979BF3]'
              }`}>
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-500 via-[#0077b6] to-[#00b4d8] text-white text-[10px] font-mono font-extrabold uppercase px-4 py-1 rounded-full shadow-md tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>General Suite All-in-One · Best Value</span>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-xs font-bold uppercase text-[#979BF3]">General Suite Subscription</div>
                      <div className="text-[11px] font-mono text-[#E00728] dark:text-[#E00728] font-bold mt-0.5">
                        Includes Brand Reputation &amp; MAP Defense
                      </div>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                      Save $298/mo
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-extrabold font-mono text-[#979BF3] dark:text-[#979BF3]">
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
                    Everything bundled into one turnkey subscription price. The complete financial ledger, autonomous commerce ingress, and multi-marketplace brand protection system.
                  </p>

                  <div className="mt-6 space-y-2.5 text-xs font-mono">
                    <div className="flex items-start gap-2 font-bold text-[#E00728] dark:text-[#E00728] bg-[#E00728]/15 p-2 rounded-lg border border-rose-500/20">
                      <ShieldAlert className="w-4 h-4 text-[#E00728] shrink-0 mt-0.5" />
                      <span>FOCAL: Autonomous Brand Reputation &amp; MAP Protection Suite (Batch SKU Scrapers, Courtroom Screenshot Hashing, Cease &amp; Desist Dispatch &amp; Email Alerts)</span>
                    </div>
                    <div className="flex items-start gap-2 font-bold text-slate-900 dark:text-white">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Module 01: Universal General Ledger &amp; Balancing Engine</span>
                    </div>
                    <div className="flex items-start gap-2 font-bold text-slate-900 dark:text-white">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Module 02: Cloudboy Connect Unified Studio</span>
                    </div>
                    <div className="flex items-start gap-2 font-bold text-slate-900 dark:text-white">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Module 03: 3-Way Procurement Matching &amp; Multi-Entity Operations</span>
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
                    className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-[#0077b6] to-[#023e8a] hover:from-rose-500 hover:to-[#0096c7] text-white font-mono font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Get General Suite (${billingCycle === 'annual' ? '959' : '1,199'}/mo)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[11px] text-center text-slate-500 font-sans">
                    Instant access · No card required for 14-day evaluation
                  </p>
                </div>
              </div>

              {/* Plan 3: Sovereign / Custom */}
              <div className={`p-8 rounded-3xl border flex flex-col justify-between ${
                isDarkMode ? 'bg-[#24232B] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
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
                isDarkMode ? 'bg-[#24232B] border-slate-800' : 'bg-white border-slate-200'
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
                    <span className="px-2.5 py-1 rounded-full bg-[#979BF3] text-[#1C1B21] font-extrabold text-xs font-mono">
                      {selectedModules.length} of 5
                    </span>
                  </div>
                </div>

                {/* 5 Interactive Module Choice Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
                  
                  {/* Module 1 Card */}
                  <div
                    onClick={() => toggleModuleSelection('ledger')}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      selectedModules.includes('ledger')
                        ? isDarkMode
                          ? 'bg-[#24232B] border-[#979BF3] shadow-md'
                          : 'bg-blue-50/60 border-[#979BF3] shadow-md'
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
                          <CheckSquare className="w-5 h-5 text-[#979BF3] dark:text-[#979BF3]" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-[#979BF3] dark:text-[#979BF3]" />
                        <h4 className="font-bold text-sm">General Ledger &amp; Balancing</h4>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Double-entry core, continuous Σ Debits ≡ Σ Credits invariant, SQL workbench, and QuickBooks IIF generator.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-500">Standalone:</span>
                      <span className="font-mono font-bold text-sm text-[#979BF3] dark:text-[#979BF3]">
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
                          ? 'bg-[#24232B] border-[#979BF3] shadow-md'
                          : 'bg-blue-50/60 border-[#979BF3] shadow-md'
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
                          <CheckSquare className="w-5 h-5 text-[#979BF3] dark:text-[#979BF3]" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-[#979BF3] dark:text-[#979BF3]" />
                        <h4 className="font-bold text-sm">Cloudboy Connect Studio</h4>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Unified ingress core, reseller domain filtering, Shopify &amp; ANSI X12 EDI 850 webhooks, CSV batch mapper, and Gemini AI copilot.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-500">Standalone:</span>
                      <span className="font-mono font-bold text-sm text-[#979BF3] dark:text-[#979BF3]">
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
                          ? 'bg-[#24232B] border-[#979BF3] shadow-md'
                          : 'bg-blue-50/60 border-[#979BF3] shadow-md'
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
                          <CheckSquare className="w-5 h-5 text-[#979BF3] dark:text-[#979BF3]" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <h4 className="font-bold text-sm">3-Way Procurement &amp; Ops</h4>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Automated 3-way PO matching, multi-entity GAAP rollups, and 5 dedicated thread isolator daemons (TH-01 to TH-05).
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-500">Standalone:</span>
                      <span className="font-mono font-bold text-sm text-[#979BF3] dark:text-[#979BF3]">
                        ${billingCycle === 'annual' ? '399' : '499'}/mo
                      </span>
                    </div>
                  </div>

                  {/* Module 4 Card */}
                  <div
                    onClick={() => toggleModuleSelection('map_protection')}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      selectedModules.includes('map_protection')
                        ? isDarkMode
                          ? 'bg-[#24232B] border-[#E00728] shadow-md'
                          : 'bg-rose-50/60 border-rose-500 shadow-md'
                        : isDarkMode
                          ? 'bg-slate-900/40 border-slate-800 opacity-60 hover:opacity-100'
                          : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
                          Module 04
                        </span>
                        {selectedModules.includes('map_protection') ? (
                          <CheckSquare className="w-5 h-5 text-[#E00728]" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert className="w-4 h-4 text-[#E00728]" />
                        <h4 className="font-bold text-sm">MAP Defense &amp; Brand</h4>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        240+ touchpoint multi-marketplace scrapers, screenshot SHA-256 evidence hashes, and 1-click Cease &amp; Desist email alerts.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-500">Standalone:</span>
                      <span className="font-mono font-bold text-sm text-rose-500">
                        ${billingCycle === 'annual' ? '399' : '499'}/mo
                      </span>
                    </div>
                  </div>

                  {/* Module 5 Card */}
                  <div
                    onClick={() => toggleModuleSelection('predict')}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      selectedModules.includes('predict')
                        ? isDarkMode
                          ? 'bg-[#24232B] border-purple-500 shadow-md'
                          : 'bg-purple-50/60 border-purple-500 shadow-md'
                        : isDarkMode
                          ? 'bg-slate-900/40 border-slate-800 opacity-60 hover:opacity-100'
                          : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          Module 05
                        </span>
                        {selectedModules.includes('predict') ? (
                          <CheckSquare className="w-5 h-5 text-purple-500" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <h4 className="font-bold text-sm">Predict &amp; Bayesian Odds</h4>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Bayesian models, live Kalshi &amp; Polymarket contract volatility, NFL player props edge matrix, and backtest simulations.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-500">Standalone:</span>
                      <span className="font-mono font-bold text-sm text-purple-500">
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
                          ? isDarkMode ? 'bg-[#24232B] border-cyan-400' : 'bg-cyan-50/70 border-cyan-600'
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
                  isDarkMode ? 'bg-[#24232B] border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1.5 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold uppercase text-slate-500">Configured Solution:</span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {selectedModules.length === 5 ? 'All 5 Specialized Engines' : `${selectedModules.length} Selected Engine(s)`}
                        </span>
                        {selectedModules.length === 5 && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                            FULL 5-ENGINE BUNDLE DISCOUNT (-$696/mo)
                          </span>
                        )}
                        {selectedModules.length === 4 && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                            QUAD BUNDLE DISCOUNT (-$447/mo)
                          </span>
                        )}
                        {selectedModules.length === 3 && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                            TRIPLE BUNDLE DISCOUNT (-$238/mo)
                          </span>
                        )}
                        {selectedModules.length === 2 && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 font-bold border border-cyan-500/20">
                            DUAL BUNDLE DISCOUNT (-$79/mo)
                          </span>
                        )}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20">
                          {selectedSecurityTier === 'standard' ? 'Standard Security ($0)' : selectedSecurityTier === 'cybershield_pro' ? 'CyberShield Pro (+$' + (billingCycle === 'annual' ? '199' : '249') + ')' : 'CyberShield Sovereign (+$' + (billingCycle === 'annual' ? '499' : '599') + ')'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {selectedModules.map(m => m === 'ledger' ? 'General Ledger' : m === 'ingress' ? 'Cloudboy Connect' : m === 'procurement' ? '3-Way Procurement' : m === 'map_protection' ? 'MAP Defense' : 'Predict & Odds Engine').join(' + ')}
                        {selectedSecurityTier !== 'standard' && ` + ${selectedSecurityTier === 'cybershield_pro' ? 'CyberShield Pro SOC' : 'CyberShield Sovereign SOX-404 SOC'}`}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-3xl font-extrabold font-mono text-[#979BF3] dark:text-[#979BF3]">
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
                        className="px-6 py-3.5 bg-gradient-to-r from-[#0077b6] to-[#023e8a] hover:bg-[#B4B7F7] text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
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
      <section id="faq" className={`scroll-mt-20 sm:scroll-mt-24 py-16 sm:py-24 border-t ${isDarkMode ? 'bg-[#24232B] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#979BF3] dark:text-[#979BF3]">
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
                    isDarkMode ? 'bg-[#24232B] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-mono font-bold text-sm cursor-pointer"
                  >
                    <span>{item.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[#979BF3] shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
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
      <section className="py-16 sm:py-24 bg-gradient-to-r from-[#03045e] via-[#02234e] to-[#04336c] text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-[#E00728]/15 blur-3xl rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-white/10 text-[#979BF3] border border-white/20 mb-4 shadow-xs">
            <Sparkles className="w-4 h-4 text-[#E00728]" />
            <span>GENERAL SUITE SUBSCRIPTION · ALL ENGINES INCLUDED AT $959/MONTH</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Stop Margin Erosion. Automate Accounting. Defend Your Brand.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#caf0f8] max-w-2xl mx-auto font-sans leading-relaxed">
            Gain immediate access to autonomous MAP price violation scraping, court-ready screenshot evidence hashes, 1-click cease and desist transmission, double-entry general ledger balancing, and enterprise security.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openAuthWithPlan('signup', true, selectedSecurityTier)}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-rose-500 to-[#00b4d8] hover:from-rose-600 hover:to-[#90e0ef] text-white font-mono font-extrabold text-sm rounded-xl shadow-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Get General Suite All-in-One ($959/mo)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onLaunchApp}
              className="w-full sm:w-auto px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-mono font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-[#E00728]" />
              <span>Launch Live Workspace Sandbox</span>
            </button>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 10. COMPREHENSIVE FOOTER                                   */}
      {/* ────────────────────────────────────────────────────────── */}
      <footer className={`border-t py-12 text-xs font-mono ${isDarkMode ? 'bg-[#1C1B21] border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="font-bold text-slate-900 dark:text-white uppercase mb-3">Product Core</div>
              <ul className="space-y-2">
                <li><button onClick={onLaunchApp} className="hover:text-[#979BF3] cursor-pointer">ERP Ledger Gateway</button></li>
                <li><button onClick={onLaunchApp} className="hover:text-[#979BF3] cursor-pointer">Shopify Sync Engine</button></li>
                <li><button onClick={onLaunchApp} className="hover:text-[#979BF3] cursor-pointer">EDI 850 Order Parser</button></li>
                <li><button onClick={onLaunchApp} className="hover:text-[#979BF3] cursor-pointer">Procurement Room (AP)</button></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-slate-900 dark:text-white uppercase mb-3">Compliance & GAAP</div>
              <ul className="space-y-2">
                <li><button onClick={onLaunchApp} className="hover:text-[#979BF3] cursor-pointer">Multi-Entity Rollups</button></li>
                <li><button onClick={onLaunchApp} className="hover:text-[#979BF3] cursor-pointer">Double-Entry Parity Lock</button></li>
                <li><button onClick={onLaunchApp} className="hover:text-[#979BF3] cursor-pointer">Automated Tax Allocation</button></li>
                <li><button onClick={onLaunchApp} className="hover:text-[#979BF3] cursor-pointer">Audit Trail Immutability</button></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-slate-900 dark:text-white uppercase mb-3">Reliability & IPC</div>
              <ul className="space-y-2">
                <li><button onClick={onLaunchApp} className="hover:text-[#979BF3] cursor-pointer">Thread Isolator Daemons</button></li>
                <li><button onClick={onLaunchApp} className="hover:text-[#979BF3] cursor-pointer">Keepalive Telemetry</button></li>
                <li><button onClick={onLaunchApp} className="hover:text-[#979BF3] cursor-pointer">High-Availability SLA</button></li>
                <li><button onClick={onLaunchApp} className="hover:text-[#979BF3] cursor-pointer">System Benchmarks</button></li>
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

import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  Layers, 
  FileSpreadsheet, 
  Zap, 
  Bot, 
  Terminal, 
  Shield, 
  Sliders, 
  Sun, 
  Moon, 
  ChevronDown, 
  ChevronRight, 
  Sparkles, 
  RefreshCw, 
  Globe, 
  Activity, 
  Check, 
  LayoutGrid,
  Menu,
  X,
  Database,
  Cpu,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

import { CorporateBrandLogo } from './CorporateBrandLogo';
import { UserAccount } from './AuthModal';

export type MainViewType = 'erp' | 'cloudboy_x' | 'troubleshooting' | 'admin' | 'procurement' | 'multientity' | 'map_protection' | 'predict';

interface MegaNavbarProps {
  mainView: MainViewType;
  setMainView: (view: MainViewType) => void;
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAdminConsoleOpen: (open: boolean) => void;
  addAuditEvent: (type: any, title: string, description: string) => void;
  handleResetLedger: () => void;
  onTriggerBotPrompt?: (prompt: string) => void;
  onExitToMarketing?: () => void;
  currentUser?: UserAccount | null;
  onOpenModuleSwitcher?: () => void;
  onGoToHub?: () => void;
  onAttemptLockedModule?: (mod: 'ledger' | 'ingress' | 'procurement') => void;
}

export const MegaNavbar: React.FC<MegaNavbarProps> = ({
  mainView,
  setMainView,
  isDarkMode,
  setIsDarkMode,
  setIsAdminConsoleOpen,
  addAuditEvent,
  handleResetLedger,
  onTriggerBotPrompt,
  onExitToMarketing,
  currentUser,
  onOpenModuleSwitcher,
  onGoToHub,
  onAttemptLockedModule
}) => {
  // Active dropdown tab on desktop: 'ledger' | 'cloudboy' | 'diagnostics' | 'all' | null
  const [activeDropdown, setActiveDropdown] = useState<'ledger' | 'cloudboy' | 'diagnostics' | 'all' | null>(null);
  
  // Mobile & Tablet drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown and drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isModulePermitted = (view: MainViewType): boolean => {
    if (!currentUser) return true;
    if (currentUser.planType === 'full_suite') return true;
    if (view === 'erp') return currentUser.selectedModules.includes('ledger');
    if (view === 'cloudboy_x') return currentUser.selectedModules.includes('ingress');
    if (view === 'procurement' || view === 'multientity') return currentUser.selectedModules.includes('procurement');
    if (view === 'map_protection') return currentUser.selectedModules.includes('map_protection' as any);
    if (view === 'predict') return currentUser.selectedModules.includes('predict' as any);
    return true;
  };

  const handleSelectView = (view: MainViewType, auditTitle: string) => {
    if (!isModulePermitted(view)) {
      const modKey: 'ledger' | 'ingress' | 'procurement' | 'map_protection' | 'predict' = 
        view === 'erp' ? 'ledger' : 
        view === 'cloudboy_x' ? 'ingress' : 
        view === 'map_protection' ? 'map_protection' :
        view === 'predict' ? 'predict' : 'procurement';
      onAttemptLockedModule?.(modKey);
      setActiveDropdown(null);
      setIsMobileMenuOpen(false);
      return;
    }
    setMainView(view);
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
    addAuditEvent('system_init', 'Navigation Switch', `Switched view to ${auditTitle}`);
  };

  const toggleDropdown = (tab: 'ledger' | 'cloudboy' | 'diagnostics' | 'all') => {
    setActiveDropdown(prev => prev === tab ? null : tab);
  };

  // Get current active view details
  const getCurrentViewInfo = () => {
    switch (mainView) {
      case 'erp':
        return { label: 'ERP Ledger Gateway', category: 'Ledger', icon: <BookOpen className="w-3.5 h-3.5 text-[#979BF3]" /> };
      case 'cloudboy_x':
        return { label: 'Cloudboy Connect', category: 'Connect', icon: <Zap className="w-3.5 h-3.5 text-amber-300" /> };
      case 'troubleshooting':
        return { label: 'Diagnostics & Isolator', category: 'Diagnostics', icon: <Terminal className="w-3.5 h-3.5 text-emerald-300" /> };
      case 'admin':
        return { label: 'System Admin Console', category: 'Admin', icon: <Shield className="w-3.5 h-3.5 text-indigo-300" /> };
      case 'procurement':
        return { label: 'Procurement Room', category: 'Ledger', icon: <FileSpreadsheet className="w-3.5 h-3.5 text-pink-300" /> };
      case 'multientity':
        return { label: 'Multi-Entity GAAP', category: 'Ledger', icon: <Globe className="w-3.5 h-3.5 text-teal-300" /> };
      case 'map_protection':
        return { label: 'MAP & Brand Defense', category: 'Defense', icon: <Shield className="w-3.5 h-3.5 text-[#E00728]" /> };
      case 'predict':
        return { label: 'Predict & Odds Engine', category: 'Predict', icon: <TrendingUp className="w-3.5 h-3.5 text-[#979BF3]" /> };
      default:
        return { label: 'System Gateway', category: 'Platform', icon: <Database className="w-3.5 h-3.5 text-sky-300" /> };
    }
  };

  const activeViewInfo = getCurrentViewInfo();

  return (
    <div 
      ref={navRef} 
      id="module-navigation-bar" 
      className="bg-[#1C1B21] border-b border-[#3B3947] text-white relative z-40 select-none shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          
          {/* ============================================================== */}
          {/* LEFT SECTION:                                                  */}
          {/* - Desktop: Mega Menu Button & Category Dropdown Triggers       */}
          {/* - Mobile/Tablet: Modules removed from bar; shows Active Badge  */}
          {/* ============================================================== */}
          
          {/* Desktop Mega Menu Category Triggers (Hidden on Tablet & Mobile) */}
          <div className="hidden lg:flex items-center gap-1 sm:gap-2">
            
            {/* 1. All Modules Mega Menu Button */}
            <button
              type="button"
              id="mega-menu-all-modules-btn"
              onClick={() => toggleDropdown('all')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer border ${
                activeDropdown === 'all'
                  ? 'bg-[#979BF3] text-[#1C1B21] border-[#979BF3] shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white hover:text-white border-white/15'
              }`}
              title="Open full Mega Menu across all platform modules and controls"
              aria-expanded={activeDropdown === 'all'}
            >
              <LayoutGrid className="w-4 h-4 shrink-0 text-[#979BF3]" />
              <span>Mega Menu</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'all' ? 'rotate-180' : ''}`} />
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-white/15 mx-1" />

            {/* 2. Financial Ledger Category Dropdown */}
            <div className="relative">
              <button
                type="button"
                id="mega-nav-category-ledger"
                onClick={() => toggleDropdown('ledger')}
                className={`px-3 py-2 text-xs font-mono font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeDropdown === 'ledger' || ['erp', 'procurement', 'multientity'].includes(mainView)
                    ? 'text-white bg-white/15 font-bold'
                    : 'text-[#979BF3] hover:text-white hover:bg-white/10'
                }`}
                aria-expanded={activeDropdown === 'ledger'}
              >
                <BookOpen className="w-3.5 h-3.5 text-[#979BF3]" />
                <span>Financial Ledger</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'ledger' ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* 3. Cloudboy Connect Category Dropdown */}
            <div className="relative">
              <button
                type="button"
                id="mega-nav-category-cloudboy"
                onClick={() => toggleDropdown('cloudboy')}
                className={`px-3 py-2 text-xs font-mono font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeDropdown === 'cloudboy' || mainView === 'cloudboy_x'
                    ? 'text-white bg-white/15 font-bold'
                    : 'text-[#979BF3] hover:text-white hover:bg-white/10'
                }`}
                aria-expanded={activeDropdown === 'cloudboy'}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Cloudboy Connect</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'cloudboy' ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* 4. Diagnostics & Operations Dropdown */}
            <div className="relative">
              <button
                type="button"
                id="mega-nav-category-diagnostics"
                onClick={() => toggleDropdown('diagnostics')}
                className={`px-3 py-2 text-xs font-mono font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeDropdown === 'diagnostics' || ['troubleshooting', 'admin'].includes(mainView)
                    ? 'text-white bg-white/15 font-bold'
                    : 'text-[#979BF3] hover:text-white hover:bg-white/10'
                }`}
                aria-expanded={activeDropdown === 'diagnostics'}
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-300" />
                <span>Diagnostics & Admin</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'diagnostics' ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* 5. Autonomous MAP & Brand Defense Module */}
            <button
              type="button"
              onClick={() => handleSelectView('map_protection', 'MAP & Brand Protection Suite')}
              className={`px-3 py-2 text-xs font-mono font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                mainView === 'map_protection'
                  ? 'text-white bg-[#E00728]/30 font-bold border border-[#E00728]/60 shadow-xs'
                  : 'text-rose-200/90 hover:text-white hover:bg-[#E00728]/25'
              }`}
              title="Launch Autonomous Brand Reputation & MAP Protection Suite"
            >
              <Shield className="w-3.5 h-3.5 text-[#E00728]" />
              <span>MAP &amp; Brand Defense</span>
            </button>

            {/* 6. Quantitative Predict & Event Intelligence Engine */}
            <button
              type="button"
              onClick={() => handleSelectView('predict', 'CloudboyX Predict & Event Engine')}
              className={`px-3 py-2 text-xs font-mono font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                mainView === 'predict'
                  ? 'text-[#1C1B21] bg-[#979BF3] font-bold border border-[#979BF3] shadow-xs'
                  : 'text-purple-200/90 hover:text-white hover:bg-[#979BF3]/20'
              }`}
              title="Launch Quantitative Forecasting & Bayesian Prediction Engine"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#979BF3]" />
              <span>Predict Engine</span>
            </button>
          </div>

          {/* Mobile & Tablet Left Display: Interactive Module Switcher Button */}
          <button
            type="button"
            id="mobile-active-module-trigger-btn"
            onClick={onOpenModuleSwitcher || (() => setIsMobileMenuOpen(prev => !prev))}
            className="flex lg:hidden items-center gap-2 py-1.5 px-2.5 sm:px-3 bg-black/40 hover:bg-black/60 border border-white/15 rounded-lg text-xs font-mono text-[#979BF3] cursor-pointer transition-all active:scale-95 select-none"
            title="Tap to switch module"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-white/50 text-[10px] hidden sm:inline">Active:</span>
            <span className="font-bold text-white flex items-center gap-1.5 truncate max-w-[140px] sm:max-w-[240px]">
              {activeViewInfo.icon}
              <span className="truncate">{activeViewInfo.label}</span>
            </span>
            <ChevronDown className="w-3 h-3 text-[#979BF3] shrink-0" />
          </button>

          {/* ============================================================== */}
          {/* RIGHT SECTION:                                                 */}
          {/* - Desktop: Active Pill, Theme Toggle, Admin Console Button     */}
          {/* - Mobile/Tablet: Hub Quick Button, Theme Toggle, Hamburger     */}
          {/* ============================================================== */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Active View Quick Indicator (Desktop Only) */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 bg-black/25 border border-white/10 rounded-lg text-[11px] font-mono text-[#979BF3]/90">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/50 text-[10px]">Active:</span>
              <span className="font-bold text-white flex items-center gap-1">
                {activeViewInfo.icon}
                {activeViewInfo.label}
              </span>
            </div>

            {/* My Modules Pop-Up Box Button (Shows what user is able to use) */}
            {onOpenModuleSwitcher && (
              <button
                type="button"
                id="desktop-module-switcher-btn"
                onClick={onOpenModuleSwitcher}
                className="hidden sm:flex px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-mono font-bold rounded-lg border border-cyan-400/40 bg-cyan-500/15 hover:bg-cyan-500/25 text-[#979BF3] hover:text-white transition-all items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                title="Open In-Suite Module Access Pop-Up Box"
              >
                <Layers className="w-3.5 h-3.5 text-[#979BF3] shrink-0" />
                <span>My Modules</span>
              </button>
            )}

            {/* Central Access Menu Hub Button */}
            {onGoToHub && (
              <>
                <button
                  type="button"
                  id="desktop-module-hub-btn"
                  onClick={onGoToHub}
                  className="hidden lg:flex px-3 py-2 text-xs font-mono font-semibold rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white hover:text-white transition-all items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  title="Open Central Access Menu Hub"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-[#979BF3] shrink-0" />
                  <span>Access Hub</span>
                </button>

                <button
                  type="button"
                  id="mobile-quick-hub-btn"
                  onClick={onGoToHub}
                  className="flex lg:hidden px-2 py-1.5 sm:px-2.5 sm:py-2 text-xs font-mono font-semibold rounded-lg border border-white/15 bg-white/10 hover:bg-white/20 text-white transition-all items-center gap-1 cursor-pointer active:scale-95"
                  title="Return to Central Access Hub"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-[#979BF3] shrink-0" />
                  <span className="text-[11px] font-bold hidden sm:inline">Hub</span>
                </button>
              </>
            )}

            {/* Global Dark / Light Theme Toggle (Always Present on Bar) */}
            <button
              type="button"
              id="global-dark-mode-toggle-btn"
              onClick={() => setIsDarkMode(prev => !prev)}
              className="p-1.5 sm:px-2.5 sm:py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-mono font-bold text-white rounded-lg shadow-sm border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-xs select-none"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-pressed={isDarkMode}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-300 shrink-0" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-sky-200 shrink-0" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            {/* Exit to Public Website (Desktop) */}
            {onExitToMarketing && (
              <button
                type="button"
                id="desktop-exit-to-marketing-btn"
                onClick={onExitToMarketing}
                className="hidden md:flex px-3 py-2 text-xs font-mono font-semibold rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white hover:text-white transition-all items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                title="Return to the public CloudboyX marketing website"
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-180 text-[#979BF3]" />
                <span>Public Website</span>
              </button>
            )}

            {/* Mobile & Tablet Hamburger Button */}
            <button
              type="button"
              id="mobile-nav-toggle-btn"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="p-2 sm:px-3 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/15 cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
              title="Toggle Navigation Menu & Controls"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 text-rose-300" /> : <Menu className="w-4 h-4 text-[#979BF3]" />}
              <span className="text-xs font-mono font-bold hidden sm:inline">Menu</span>
            </button>

          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* MOBILE & TABLET QUICK MODULE SWITCHER RAIL (1-TAP ACCESS)  */}
      {/* ────────────────────────────────────────────────────────── */}
      <div 
        id="mobile-quick-module-rail"
        className="lg:hidden border-t border-[#3B3947]/70 bg-[#17161C] px-2.5 sm:px-4 py-2 overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 select-none touch-pan-x"
        role="tablist"
        aria-label="Mobile and Tablet Module Switcher"
      >
        <button
          type="button"
          onClick={() => handleSelectView('erp', 'ERP Ledger Gateway')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
            mainView === 'erp'
              ? 'bg-[#979BF3] text-[#1C1B21] border-[#979BF3] shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>01. Ledger</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectView('cloudboy_x', 'Cloudboy Connect')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
            mainView === 'cloudboy_x'
              ? 'bg-[#979BF3] text-[#1C1B21] border-[#979BF3] shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          <span>02. Cloudboy Connect</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectView('procurement', 'Procurement Room')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
            mainView === 'procurement'
              ? 'bg-[#979BF3] text-[#1C1B21] border-[#979BF3] shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-pink-300" />
          <span>03. Procurement</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectView('map_protection', 'MAP & Brand Protection')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
            mainView === 'map_protection'
              ? 'bg-[#E00728] text-white border-[#E00728] shadow-sm'
              : 'bg-white/5 hover:bg-[#E00728]/20 text-rose-300 border-white/10'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-[#E00728]" />
          <span>04. MAP Defense</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectView('predict', 'Predict & Odds Engine')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
            mainView === 'predict'
              ? 'bg-[#979BF3] text-[#1C1B21] border-[#979BF3] shadow-sm'
              : 'bg-white/5 hover:bg-[#979BF3]/20 text-purple-200 border-white/10'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-[#979BF3]" />
          <span>05. Predict</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectView('troubleshooting', 'Diagnostics & Isolator')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
            mainView === 'troubleshooting'
              ? 'bg-[#979BF3] text-[#1C1B21] border-[#979BF3] shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-300" />
          <span>Diagnostics</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectView('admin', 'System Admin Console')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
            mainView === 'admin'
              ? 'bg-[#979BF3] text-[#1C1B21] border-[#979BF3] shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-indigo-300" />
          <span>Admin</span>
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. FINANCIAL LEDGER CATEGORY DROPDOWN PANEL (DESKTOP)      */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeDropdown === 'ledger' && (
        <div className="hidden lg:block absolute top-full left-0 right-0 bg-[#24232B]/95 backdrop-blur-md border-b-2 border-[#00b4d8] shadow-2xl z-50 animate-fadeIn max-h-[calc(100vh-120px)] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#979BF3]" />
                <h3 className="text-xs font-mono uppercase tracking-widest text-white font-bold">
                  Financial Ledger & Core Accounting Modules
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#979BF3]/70">Double-entry verified • Real-time audit integrity</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              
              {/* Module 1: ERP Ledger Gateway */}
              <button
                type="button"
                id="tab-view-erp"
                onClick={() => handleSelectView('erp', 'ERP Ledger Translation Gateway')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                  mainView === 'erp'
                    ? 'bg-[#979BF3]/35 border-[#00b4d8] shadow-lg ring-1 ring-[#00b4d8]'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-cyan-400/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-cyan-500/20 text-[#979BF3]">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    {mainView === 'erp' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#979BF3] text-[#03045e]">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-[#979BF3] transition-colors font-mono">
                    📋 ERP Ledger Translation Gateway
                  </h4>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">
                    Double-entry general ledger, canonical order auto-mapping, chart of accounts & real-time thresholds.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#979BF3]">
                  <span>General Ledger & Balancing</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Module 2: Multi-Entity GAAP Overview */}
              <button
                type="button"
                id="tab-view-multientity"
                onClick={() => handleSelectView('multientity', 'Multi-Entity GAAP Overview')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                  mainView === 'multientity'
                    ? 'bg-[#979BF3]/35 border-[#00b4d8] shadow-lg ring-1 ring-[#00b4d8]'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-cyan-400/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300">
                      <Globe className="w-5 h-5" />
                    </div>
                    {mainView === 'multientity' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#979BF3] text-[#03045e]">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-teal-200 transition-colors font-mono">
                    🌐 Multi-Entity GAAP Overview
                  </h4>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">
                    Multi-subsidiary financial statements, cross-border currency conversions & inter-entity eliminations.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-teal-300">
                  <span>GAAP Parity & Global Entities</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Module 3: Procurement Room */}
              <button
                type="button"
                id="tab-view-procurement"
                onClick={() => handleSelectView('procurement', 'Procurement Room & Accounts Payable')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                  mainView === 'procurement'
                    ? 'bg-[#979BF3]/35 border-[#00b4d8] shadow-lg ring-1 ring-[#00b4d8]'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-cyan-400/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-pink-500/20 text-pink-300">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    {mainView === 'procurement' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#979BF3] text-[#03045e]">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-pink-200 transition-colors font-mono">
                    📥 Procurement Room & AP
                  </h4>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">
                    Purchase Order 3-way matching, automated invoice reconciliation & accounts payable workflows.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-pink-300">
                  <span>Vendor AP & PO Matching</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. CLOUDBOY X SUITE CATEGORY DROPDOWN PANEL (DESKTOP)      */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeDropdown === 'cloudboy' && (
        <div className="hidden lg:block absolute top-full left-0 right-0 bg-[#24232B]/95 backdrop-blur-md border-b-2 border-amber-400 shadow-2xl z-50 animate-fadeIn max-h-[calc(100vh-120px)] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-300" />
                <h3 className="text-xs font-mono uppercase tracking-widest text-white font-bold">
                  Cloudboy Connect Unified Studio & Intelligent Integrations
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#979BF3]/70">E-Commerce Webhooks • EDI 850 • AI Copilot</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              
              {/* Cloudboy Connect Unified Studio */}
              <button
                type="button"
                id="tab-view-cloudboy-x"
                onClick={() => handleSelectView('cloudboy_x', 'Cloudboy Connect Studio')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                  mainView === 'cloudboy_x'
                    ? 'bg-[#979BF3]/35 border-amber-400 shadow-lg ring-1 ring-amber-400'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-amber-400/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
                      <Zap className="w-5 h-5" />
                    </div>
                    {mainView === 'cloudboy_x' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400 text-slate-950">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors font-mono">
                    ⚡ Cloudboy Connect Studio
                  </h4>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">
                    Unified reseller domain authority, live Shopify transaction feeds, EDI 850 purchase order translator & high-speed batch router.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-amber-300">
                  <span>Open Cloudboy Connect Studio</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Strategic AI Copilot Hub */}
              <button
                type="button"
                onClick={() => {
                  handleSelectView('erp', 'AI Strategic Copilot Suite');
                  if (onTriggerBotPrompt) {
                    onTriggerBotPrompt("Provide an executive financial health summary of our active ledger balances and current operational risk status.");
                  }
                }}
                className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-400/50 text-left transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                      AI ENGINE
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors font-mono">
                    🤖 Advanced Enterprise AI Copilot Suite
                  </h4>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">
                    Predictive cashflow forecasting, agentic OCR receipt reader, conversational natural language SQL querying & live advisory chat.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-indigo-300">
                  <span>Launch Cognitive Copilot in ERP</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. DIAGNOSTICS & ADMIN CATEGORY DROPDOWN PANEL (DESKTOP)   */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeDropdown === 'diagnostics' && (
        <div className="hidden lg:block absolute top-full left-0 right-0 bg-[#24232B]/95 backdrop-blur-md border-b-2 border-emerald-400 shadow-2xl z-50 animate-fadeIn max-h-[calc(100vh-120px)] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-300" />
                <h3 className="text-xs font-mono uppercase tracking-widest text-white font-bold">
                  System Diagnostics, Thread Isolation & Security Controls
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#979BF3]/70">Thread isolation • Keepalive telemetry • Admin guards</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              
              {/* Diagnostics & Job Isolator */}
              <button
                type="button"
                id="tab-view-diagnostics"
                onClick={() => handleSelectView('troubleshooting', 'Diagnostics & Job Isolator')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                  mainView === 'troubleshooting'
                    ? 'bg-[#979BF3]/35 border-emerald-400 shadow-lg ring-1 ring-emerald-400'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-emerald-400/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
                      <Terminal className="w-5 h-5" />
                    </div>
                    {mainView === 'troubleshooting' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-400 text-slate-950">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-200 transition-colors font-mono">
                    🛠️ Diagnostics & Job Isolator
                  </h4>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">
                    Inspect 5 active worker daemon threads, isolate stalled keepalive processes & analyze real-time IPC event streams.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-emerald-300">
                  <span>Monitor Thread Telemetry</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* System Admin Console */}
              <button
                type="button"
                id="tab-view-admin"
                onClick={() => handleSelectView('admin', 'System Admin Console')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                  mainView === 'admin'
                    ? 'bg-[#979BF3]/35 border-emerald-400 shadow-lg ring-1 ring-emerald-400'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-emerald-400/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300">
                      <Shield className="w-5 h-5" />
                    </div>
                    {mainView === 'admin' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-400 text-slate-950">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors font-mono">
                    🛡️ System Admin Console
                  </h4>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">
                    Configure hardline branding locks, inspect audit trails, manage reseller roles and execute security overrides.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-indigo-300">
                  <span>Manage System Governance</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. EXPANSIVE "ALL MODULES" MEGA MENU FLYOUT PANEL (DESKTOP)*/}
      {/* ────────────────────────────────────────────────────────── */}
      {activeDropdown === 'all' && (
        <div className="hidden lg:block absolute top-full left-0 right-0 bg-[#1C1B21]/98 backdrop-blur-xl border-b-4 border-[#00b4d8] shadow-2xl z-50 animate-fadeIn max-h-[calc(100vh-120px)] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            
            {/* Mega Menu Top Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/15">
              <div>
                <h3 className="text-base font-bold font-mono tracking-tight text-white flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-[#979BF3]" />
                  CloudboyX Enterprise Navigation Hub
                </h3>
                <p className="text-xs text-white/70 mt-0.5">
                  Complete architectural overview across accounting ledgers, e-commerce pipelines, diagnostics and global system preferences.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveDropdown(null)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close (Esc)</span>
              </button>
            </div>

            {/* 4-Column Mega Grid */}
            <div className="grid grid-cols-4 gap-6">
              
              {/* Column 1: Core Financial Ledger */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-[#3B3947]/40">
                  <BookOpen className="w-4 h-4 text-[#979BF3]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#979BF3]">
                    Core Accounting
                  </span>
                </div>
                
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleSelectView('erp', 'ERP Ledger Gateway')}
                    className={`w-full p-2.5 rounded-lg text-left transition-all flex items-start gap-3 cursor-pointer group ${
                      mainView === 'erp' ? 'bg-[#979BF3]/40 border border-[#00b4d8]' : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-[#979BF3] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-[#979BF3] font-mono flex items-center gap-1">
                        ERP Ledger Gateway
                        {mainView === 'erp' && <Check className="w-3 h-3 text-[#979BF3]" />}
                      </div>
                      <div className="text-[11px] text-white/60 mt-0.5">Double-entry ledger & chart of accounts</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectView('multientity', 'Multi-Entity GAAP')}
                    className={`w-full p-2.5 rounded-lg text-left transition-all flex items-start gap-3 cursor-pointer group ${
                      mainView === 'multientity' ? 'bg-[#979BF3]/40 border border-[#00b4d8]' : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-teal-300 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-teal-200 font-mono flex items-center gap-1">
                        Multi-Entity GAAP
                        {mainView === 'multientity' && <Check className="w-3 h-3 text-teal-300" />}
                      </div>
                      <div className="text-[11px] text-white/60 mt-0.5">Subsidiary balances & currency translation</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectView('procurement', 'Procurement Room')}
                    className={`w-full p-2.5 rounded-lg text-left transition-all flex items-start gap-3 cursor-pointer group ${
                      mainView === 'procurement' ? 'bg-[#979BF3]/40 border border-[#00b4d8]' : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-pink-300 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-pink-200 font-mono flex items-center gap-1">
                        Procurement & AP
                        {mainView === 'procurement' && <Check className="w-3 h-3 text-pink-300" />}
                      </div>
                      <div className="text-[11px] text-white/60 mt-0.5">PO 3-way matching & vendor ledger routing</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Column 2: Cloudboy X & E-Commerce */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-amber-400/40">
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-200">
                    Transitional Gateway
                  </span>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleSelectView('cloudboy_x', 'Cloudboy X Flow')}
                    className={`w-full p-2.5 rounded-lg text-left transition-all flex items-start gap-3 cursor-pointer group ${
                      mainView === 'cloudboy_x' ? 'bg-[#979BF3]/40 border border-amber-400' : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-200 font-mono flex items-center gap-1">
                        Cloudboy X Gateway
                        {mainView === 'cloudboy_x' && <Check className="w-3 h-3 text-amber-300" />}
                      </div>
                      <div className="text-[11px] text-white/60 mt-0.5">Reseller routing & Shopify webhook listener</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSelectView('erp', 'Strategic AI Copilot');
                      if (onTriggerBotPrompt) {
                        onTriggerBotPrompt("Explain how our incoming Shopify and EDI orders map into double-entry ledger debit/credit postings.");
                      }
                    }}
                    className="w-full p-2.5 rounded-lg text-left transition-all flex items-start gap-3 cursor-pointer group hover:bg-white/5 border border-transparent"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-300 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-indigo-200 font-mono">
                        AI Copilot Hub
                      </div>
                      <div className="text-[11px] text-white/60 mt-0.5">Cash forecasting & receipt image OCR</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Column 3: Diagnostics & Reliability */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-emerald-400/40">
                  <Terminal className="w-4 h-4 text-emerald-300" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-200">
                    Diagnostics & Guard
                  </span>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleSelectView('troubleshooting', 'Diagnostics & Isolator')}
                    className={`w-full p-2.5 rounded-lg text-left transition-all flex items-start gap-3 cursor-pointer group ${
                      mainView === 'troubleshooting' ? 'bg-[#979BF3]/40 border border-emerald-400' : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Terminal className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-emerald-200 font-mono flex items-center gap-1">
                        Diagnostics & Isolator
                        {mainView === 'troubleshooting' && <Check className="w-3 h-3 text-emerald-300" />}
                      </div>
                      <div className="text-[11px] text-white/60 mt-0.5">Daemon threads & worker keepalives</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectView('admin', 'System Admin Console')}
                    className={`w-full p-2.5 rounded-lg text-left transition-all flex items-start gap-3 cursor-pointer group ${
                      mainView === 'admin' ? 'bg-[#979BF3]/40 border border-indigo-400' : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-indigo-300 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-indigo-200 font-mono flex items-center gap-1">
                        System Admin Console
                        {mainView === 'admin' && <Check className="w-3 h-3 text-indigo-300" />}
                      </div>
                      <div className="text-[11px] text-white/60 mt-0.5">Asset locks, audit trail & permissions</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Column 4: Header Controls & System Tools */}
              <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 pb-2 border-b border-white/15">
                  <Sliders className="w-4 h-4 text-sky-300" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-200">
                    Header Controls
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  
                  {/* External Link to Public Website */}
                  {onExitToMarketing && (
                    <div>
                      <span className="text-[10px] font-mono text-white/60 uppercase block mb-1">Public Website</span>
                      <button
                        type="button"
                        id="mega-menu-exit-to-marketing-btn"
                        onClick={() => {
                          onExitToMarketing();
                          setActiveDropdown(null);
                        }}
                        className="w-full py-2 px-3 text-xs font-mono font-bold rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white hover:text-white transition-all flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-[#979BF3]" />
                          Visit Public Website
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Admin Control Panel action */}
                  <div>
                    <span className="text-[10px] font-mono text-white/60 uppercase block mb-1">Administrative Drawer</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdminConsoleOpen(true);
                        setActiveDropdown(null);
                        addAuditEvent('rebrand', 'System Console Opened', 'User opened Admin Panel via Mega Menu.');
                      }}
                      className="w-full py-2 px-3 bg-gradient-to-r from-[#0096c7] to-[#00b4d8] hover:from-[#0077b6] hover:to-[#0096c7] text-white text-xs font-mono font-bold rounded-lg shadow-sm flex items-center justify-between cursor-pointer border border-[#48cae4]/50"
                    >
                      <span className="flex items-center gap-2">
                        <Sliders className="w-3.5 h-3.5" />
                        Admin Control Panel
                      </span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Dark Mode Theme Toggle */}
                  <div>
                    <span className="text-[10px] font-mono text-white/60 uppercase block mb-1">Theme Preference</span>
                    <button
                      type="button"
                      onClick={() => setIsDarkMode(prev => !prev)}
                      className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold rounded-lg border border-white/20 flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-sky-200" />}
                        {isDarkMode ? "Active: Dark Canvas" : "Active: Maritime Light"}
                      </span>
                      <span className="text-[10px] text-[#979BF3] font-normal">Toggle</span>
                    </button>
                  </div>

                  {/* Reset SQL Ledger Maintenance */}
                  <div>
                    <span className="text-[10px] font-mono text-white/60 uppercase block mb-1">Quick Maintenance</span>
                    <button
                      type="button"
                      onClick={() => {
                        handleResetLedger();
                        setActiveDropdown(null);
                      }}
                      className="w-full py-2 px-3 bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 hover:text-white text-xs font-mono font-bold rounded-lg border border-rose-400/30 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#E00728]" />
                      Reset General Ledger
                    </button>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. HAMBURGER NAVIGATION & ADMINISTRATIVE DRAWER             */}
      {/* Contains All Modules, Admin Controls & Theme Switcher      */}
      {/* ────────────────────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-nav-drawer" 
          className="absolute top-full left-0 right-0 bg-[#1C1B21]/98 backdrop-blur-2xl border-b-4 border-[#00b4d8] shadow-2xl z-50 p-4 sm:p-6 animate-fadeIn max-h-[calc(100vh-100px)] overflow-y-auto"
          role="dialog"
          aria-label="Navigation and Administrative Drawer"
        >
          <div className="max-w-7xl mx-auto space-y-5">
          {/* Drawer Header with Title and Close Button */}
          <div className="flex items-center justify-between pb-3 border-b border-white/15">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#979BF3] flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-[#979BF3]" />
                Navigation & Control Center
              </span>
              <p className="text-[11px] text-white/60 mt-0.5">All modules & administrative functions</p>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
              title="Close Menu"
              aria-label="Close Navigation Menu"
            >
              <X className="w-4 h-4 text-rose-300" />
            </button>
          </div>

          {/* 1. ADMIN NAVIGATION CARD (Nested under Hamburger on Tablet & Mobile) */}
          <div className="p-3.5 bg-gradient-to-r from-[#0077b6]/35 to-[#00b4d8]/20 border border-[#00b4d8]/40 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#979BF3] font-bold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#979BF3]" />
                Administrative Oversight
              </span>
              <span className="text-[9px] font-mono font-bold bg-[#979BF3]/30 text-[#979BF3] px-1.5 py-0.5 rounded border border-[#00b4d8]/40">
                MASTER
              </span>
            </div>
            <p className="text-[11px] text-white/70 leading-snug">
              Access element branding locks, audit trail logs, reseller roles & ledger calibration.
            </p>
            <button
              type="button"
              id="mobile-open-admin-console-btn"
              onClick={() => {
                setIsAdminConsoleOpen(true);
                setIsMobileMenuOpen(false);
                addAuditEvent('rebrand', 'System Console Opened', 'User opened Admin Panel via Mobile/Tablet Menu.');
              }}
              className="w-full py-2.5 px-3.5 bg-gradient-to-r from-[#0096c7] to-[#00b4d8] hover:from-[#0077b6] hover:to-[#0096c7] active:scale-98 text-white text-xs font-mono font-bold rounded-lg shadow-md flex items-center justify-between cursor-pointer border border-[#48cae4]/50 transition-all"
            >
              <span className="flex items-center gap-2">
                <Sliders className="w-4 h-4 shrink-0" />
                Launch Admin Control Panel
              </span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
          </div>

          {/* 2. THEME SWITCHER CARD (Nested under Hamburger on Tablet & Mobile) */}
          <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/10 text-white shrink-0">
                {isDarkMode ? <Moon className="w-4 h-4 text-sky-200" /> : <Sun className="w-4 h-4 text-amber-300" />}
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-white">Theme Preference</div>
                <div className="text-[10px] font-mono text-[#979BF3]/70">
                  {isDarkMode ? "Current: High-Contrast Dark Canvas" : "Current: Maritime Light Mode"}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsDarkMode(prev => !prev)}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-mono font-bold text-white rounded-lg border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-sky-200" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>

          {/* Exit to Public Website (Tablet & Mobile) */}
          {onExitToMarketing && (
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#979BF3]" />
                  Public Website
                </div>
                <div className="text-[10px] text-white/60 mt-0.5">Return to public marketing homepage</div>
              </div>
              <button
                type="button"
                id="mobile-exit-to-marketing-btn"
                onClick={() => {
                  onExitToMarketing();
                  setIsMobileMenuOpen(false);
                }}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-mono font-bold text-white rounded-lg border border-white/20 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Visit</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Module Access Switcher & Central Hub (Tablet & Mobile) */}
          <div className="p-3 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-400/30 rounded-xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#979BF3]" />
                <span className="text-xs font-mono font-bold text-cyan-100 uppercase tracking-wide">
                  Module Access
                </span>
              </div>
              {currentUser && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/20 text-[#979BF3] border border-cyan-400/30">
                  {currentUser.planType === 'full_suite' ? 'Full Suite' : `${currentUser.selectedModules.length} Modules`}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {onOpenModuleSwitcher && (
                <button
                  type="button"
                  id="mobile-module-switcher-btn"
                  onClick={() => {
                    onOpenModuleSwitcher();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-[#979BF3] text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>My Modules</span>
                </button>
              )}
              {onGoToHub && (
                <button
                  type="button"
                  id="mobile-module-hub-btn"
                  onClick={() => {
                    onGoToHub();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-[#979BF3]" />
                  <span>Central Hub</span>
                </button>
              )}
            </div>
          </div>

          {/* 3. ALL MODULES (Nested under Hamburger on Tablet & Mobile) */}
          <div className="space-y-4 pt-1">
            
            {/* Group A: Core Accounting Ledgers */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#979BF3]/80 font-bold block px-1">
                Core Accounting Ledgers
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                
                {/* Module 1: ERP Gateway */}
                <button
                  type="button"
                  id="tab-view-erp-mobile"
                  onClick={() => handleSelectView('erp', 'ERP Ledger Gateway')}
                  className={`w-full p-3 text-left rounded-xl text-xs font-mono font-bold flex items-center justify-between transition-all cursor-pointer border ${
                    mainView === 'erp' 
                      ? 'bg-[#979BF3] text-white border-cyan-300 shadow-md ring-1 ring-cyan-300' 
                      : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-[#979BF3] shrink-0" />
                    <div>
                      <div className="text-xs font-bold">ERP Ledger Gateway</div>
                      <div className="text-[10px] text-white/60 font-normal">Double-entry ledger & chart of accounts</div>
                    </div>
                  </div>
                  {mainView === 'erp' && <Check className="w-4 h-4 text-[#979BF3] shrink-0" />}
                </button>

                {/* Module 2: Multi-Entity GAAP */}
                <button
                  type="button"
                  id="tab-view-multientity-mobile"
                  onClick={() => handleSelectView('multientity', 'Multi-Entity GAAP')}
                  className={`w-full p-3 text-left rounded-xl text-xs font-mono font-bold flex items-center justify-between transition-all cursor-pointer border ${
                    mainView === 'multientity' 
                      ? 'bg-[#979BF3] text-white border-cyan-300 shadow-md ring-1 ring-cyan-300' 
                      : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-teal-300 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Multi-Entity GAAP</div>
                      <div className="text-[10px] text-white/60 font-normal">Subsidiary ledgers & currency parity</div>
                    </div>
                  </div>
                  {mainView === 'multientity' && <Check className="w-4 h-4 text-teal-200 shrink-0" />}
                </button>

                {/* Module 3: Procurement Room */}
                <button
                  type="button"
                  id="tab-view-procurement-mobile"
                  onClick={() => handleSelectView('procurement', 'Procurement Room')}
                  className={`w-full p-3 text-left rounded-xl text-xs font-mono font-bold flex items-center justify-between transition-all cursor-pointer border ${
                    mainView === 'procurement' 
                      ? 'bg-[#979BF3] text-white border-cyan-300 shadow-md ring-1 ring-cyan-300' 
                      : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="w-4 h-4 text-pink-300 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Procurement & AP</div>
                      <div className="text-[10px] text-white/60 font-normal">PO matching & vendor invoice routing</div>
                    </div>
                  </div>
                  {mainView === 'procurement' && <Check className="w-4 h-4 text-pink-200 shrink-0" />}
                </button>

              </div>
            </div>

            {/* Group B: Cloudboy Connect Suite */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300/80 font-bold block px-1">
                Cloudboy Connect Unified Suite
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                
                {/* Module 4: Cloudboy Connect Unified Studio */}
                <button
                  type="button"
                  id="tab-view-cloudboy-x-mobile"
                  onClick={() => handleSelectView('cloudboy_x', 'Cloudboy Connect Studio')}
                  className={`w-full p-3 text-left rounded-xl text-xs font-mono font-bold flex items-center justify-between transition-all cursor-pointer border ${
                    mainView === 'cloudboy_x' 
                      ? 'bg-[#979BF3] text-white border-amber-300 shadow-md ring-1 ring-amber-300' 
                      : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-amber-300 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Cloudboy Connect Studio</div>
                      <div className="text-[10px] text-white/60 font-normal">Unified reseller router & Shopify webhooks</div>
                    </div>
                  </div>
                  {mainView === 'cloudboy_x' && <Check className="w-4 h-4 text-amber-200 shrink-0" />}
                </button>

                {/* Module: AI Copilot Hub */}
                <button
                  type="button"
                  onClick={() => {
                    handleSelectView('erp', 'AI Strategic Copilot');
                    if (onTriggerBotPrompt) {
                      onTriggerBotPrompt("Provide an overview of our double-entry ledger status and predictive trends.");
                    }
                  }}
                  className="w-full p-3 text-left rounded-xl text-xs font-mono font-bold flex items-center justify-between transition-all cursor-pointer border bg-white/5 hover:bg-white/10 text-white border-white/10"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-300 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Strategic AI Copilot</div>
                      <div className="text-[10px] text-white/60 font-normal">Forecasting, receipt OCR & SQL advisor</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-indigo-300 shrink-0" />
                </button>

              </div>
            </div>

            {/* Group C: Diagnostics & Administration */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300/80 font-bold block px-1">
                Reliability & Security Console
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                
                {/* Module 5: Diagnostics & Isolator */}
                <button
                  type="button"
                  id="tab-view-diagnostics-mobile"
                  onClick={() => handleSelectView('troubleshooting', 'Diagnostics & Isolator')}
                  className={`w-full p-3 text-left rounded-xl text-xs font-mono font-bold flex items-center justify-between transition-all cursor-pointer border ${
                    mainView === 'troubleshooting' 
                      ? 'bg-[#979BF3] text-white border-emerald-300 shadow-md ring-1 ring-emerald-300' 
                      : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Terminal className="w-4 h-4 text-emerald-300 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Diagnostics & Isolator</div>
                      <div className="text-[10px] text-white/60 font-normal">5 daemon threads & keepalives</div>
                    </div>
                  </div>
                  {mainView === 'troubleshooting' && <Check className="w-4 h-4 text-emerald-200 shrink-0" />}
                </button>

                {/* Module 6: System Admin Console */}
                <button
                  type="button"
                  id="tab-view-admin-mobile"
                  onClick={() => handleSelectView('admin', 'System Admin Console')}
                  className={`w-full p-3 text-left rounded-xl text-xs font-mono font-bold flex items-center justify-between transition-all cursor-pointer border ${
                    mainView === 'admin' 
                      ? 'bg-[#979BF3] text-white border-indigo-300 shadow-md ring-1 ring-indigo-300' 
                      : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-indigo-300 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">System Admin Console</div>
                      <div className="text-[10px] text-white/60 font-normal">Element locks, audit logs & roles</div>
                    </div>
                  </div>
                  {mainView === 'admin' && <Check className="w-4 h-4 text-indigo-200 shrink-0" />}
                </button>

              </div>
            </div>

            {/* Group D: Brand Reputation & Predictive Intelligence */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300/80 font-bold block px-1">
                Brand Defense &amp; Quantitative Predict
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                
                {/* Module 7: MAP & Brand Defense */}
                <button
                  type="button"
                  id="tab-view-map-mobile"
                  onClick={() => handleSelectView('map_protection', 'MAP & Brand Protection Suite')}
                  className={`w-full p-3 text-left rounded-xl text-xs font-mono font-bold flex items-center justify-between transition-all cursor-pointer border ${
                    mainView === 'map_protection' 
                      ? 'bg-[#E00728] text-white border-rose-300 shadow-md ring-1 ring-rose-300' 
                      : 'bg-white/5 hover:bg-[#E00728]/20 text-white border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-[#E00728] shrink-0" />
                    <div>
                      <div className="text-xs font-bold">MAP &amp; Brand Defense</div>
                      <div className="text-[10px] text-white/60 font-normal">240+ touchpoints &amp; C&amp;D notices</div>
                    </div>
                  </div>
                  {mainView === 'map_protection' && <Check className="w-4 h-4 text-white shrink-0" />}
                </button>

                {/* Module 8: Predict Engine */}
                <button
                  type="button"
                  id="tab-view-predict-mobile"
                  onClick={() => handleSelectView('predict', 'CloudboyX Predict & Event Engine')}
                  className={`w-full p-3 text-left rounded-xl text-xs font-mono font-bold flex items-center justify-between transition-all cursor-pointer border ${
                    mainView === 'predict' 
                      ? 'bg-[#979BF3] text-[#1C1B21] border-[#979BF3] shadow-md ring-1 ring-white' 
                      : 'bg-white/5 hover:bg-[#979BF3]/20 text-white border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4 text-[#979BF3] shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Predict &amp; Odds Engine</div>
                      <div className="text-[10px] text-white/60 font-normal">Bayesian models &amp; NFL props</div>
                    </div>
                  </div>
                  {mainView === 'predict' && <Check className="w-4 h-4 text-[#1C1B21] shrink-0" />}
                </button>

              </div>
            </div>

          </div>

          {/* Quick Ledger Reset on Tablet & Mobile */}
          <div className="pt-2 border-t border-white/15 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                handleResetLedger();
                setIsMobileMenuOpen(false);
              }}
              className="py-2 px-3 bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 text-xs font-mono font-bold rounded-lg border border-rose-400/30 flex items-center gap-2 cursor-pointer transition-colors active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#E00728] shrink-0" />
              <span>Reset General Ledger</span>
            </button>
            <span className="text-[10px] font-mono text-[#979BF3]/50">Double-Entry Mode</span>
          </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MegaNavbar;

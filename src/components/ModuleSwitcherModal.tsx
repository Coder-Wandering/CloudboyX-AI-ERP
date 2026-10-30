import React from 'react';
import { 
  X, 
  BookOpen, 
  Zap, 
  ShieldCheck, 
  Check, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  PackageCheck, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  TrendingUp
} from 'lucide-react';
import { UserAccount } from './AuthModal';

interface ModuleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onSelectModule: (moduleKey: 'ledger' | 'ingress' | 'procurement' | 'map_protection' | 'predict' | 'suite') => void;
  onOpenUpgradeModal: () => void;
  onGoToHub: () => void;
  onExitToMarketing: () => void;
  lockedAttemptModule?: 'ledger' | 'ingress' | 'procurement' | 'map_protection' | 'predict' | null;
  isDarkMode: boolean;
}

export const ModuleSwitcherModal: React.FC<ModuleSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectModule,
  onOpenUpgradeModal,
  onGoToHub,
  onExitToMarketing,
  lockedAttemptModule = null,
  isDarkMode
}) => {
  if (!isOpen) return null;

  const user: UserAccount = currentUser || {
    name: 'Elena Vance, CPA',
    email: 'elena.vance@omniretail.global',
    company: 'OmniRetail Global Enterprise',
    planType: 'full_suite',
    selectedModules: ['ledger', 'ingress', 'procurement', 'map_protection', 'predict'],
    billingCycle: 'annual',
    monthlyPrice: 959,
    signedIn: true,
    avatarInitials: 'EV'
  };

  const isModuleUnlocked = (mod: 'ledger' | 'ingress' | 'procurement' | 'map_protection' | 'predict') => {
    if (user.planType === 'full_suite') return true;
    return user.selectedModules.includes(mod as any);
  };

  const unlockedCount = ['ledger', 'ingress', 'procurement', 'map_protection', 'predict'].filter(m => isModuleUnlocked(m as any)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all text-left ${
          isDarkMode 
            ? 'bg-[#1C1B21] border-slate-800 text-slate-100 shadow-cyan-950/20' 
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-[#24232B] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#3B3947] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20">
              <Layers className="w-5 h-5 text-[#979BF3]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold font-mono tracking-tight flex items-center gap-2">
                <span>My Module Access & Pop-Up Switcher</span>
              </h3>
              <p className="text-[11px] text-[#A6A5B2] font-mono">
                {user.company} · {user.planType === 'full_suite' ? 'Complete Suite (5/5 Modules)' : `${unlockedCount}/5 Modules Active`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If user attempted to click a locked module, show paywall alert banner */}
        {lockedAttemptModule && (
          <div className="p-3.5 sm:p-4 bg-amber-500/10 border-b border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-start gap-3 text-xs font-mono shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold uppercase tracking-wider text-[11px]">Paywall Protected Module</div>
              <p className="mt-0.5 text-slate-600 dark:text-slate-300 font-sans">
                The module you selected is not currently included in your active plan. You can add it to your modular subscription for $399/mo or upgrade to the Complete Suite.
              </p>
            </div>
          </div>
        )}

        {/* 5 Modules Switcher Rows (Scrollable on small mobile and landscape viewports) */}
        <div className="p-3 sm:p-5 space-y-3 overflow-y-auto flex-1">
          
          {/* Row 1: General Ledger */}
          <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
            isModuleUnlocked('ledger')
              ? isDarkMode ? 'bg-slate-900/60 border-slate-700/80 hover:border-cyan-500' : 'bg-slate-50 border-slate-200 hover:border-[#979BF3]'
              : isDarkMode ? 'bg-slate-950/40 border-slate-800/80 opacity-70' : 'bg-slate-100/50 border-slate-200 opacity-70'
          }`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-[#979BF3] dark:text-[#979BF3] shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    MOD 01
                  </span>
                  <h4 className="font-bold text-xs truncate">General Ledger & Double-Entry</h4>
                  {isModuleUnlocked('ledger') ? (
                    <span className="text-[9px] font-mono font-bold text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ACTIVE
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono font-bold text-slate-400 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> LOCKED
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  Trial balance, SQL workbench, Chart of Accounts, QuickBooks IIF export
                </p>
              </div>
            </div>

            {isModuleUnlocked('ledger') ? (
              <button
                type="button"
                onClick={() => { onSelectModule('ledger'); onClose(); }}
                className="px-3.5 py-2 rounded-xl bg-[#979BF3] text-[#1C1B21] hover:bg-[#023e8a] text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Launch</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { onClose(); onOpenUpgradeModal(); }}
                className="px-3.5 py-2 rounded-xl border border-amber-500/40 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Lock className="w-3 h-3" />
                <span>Unlock ($399)</span>
              </button>
            )}
          </div>

          {/* Row 2: Ingress & AI */}
          <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
            isModuleUnlocked('ingress')
              ? isDarkMode ? 'bg-slate-900/60 border-slate-700/80 hover:border-purple-500' : 'bg-slate-50 border-slate-200 hover:border-purple-600'
              : isDarkMode ? 'bg-slate-950/40 border-slate-800/80 opacity-70' : 'bg-slate-100/50 border-slate-200 opacity-70'
          }`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    MOD 02
                  </span>
                  <h4 className="font-bold text-xs truncate">Commerce Ingress & AI Copilot</h4>
                  {isModuleUnlocked('ingress') ? (
                    <span className="text-[9px] font-mono font-bold text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ACTIVE
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono font-bold text-slate-400 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> LOCKED
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  Shopify webhooks, EDI 850 parser, CSV auto-mapper, QR/barcode scanner, OCR
                </p>
              </div>
            </div>

            {isModuleUnlocked('ingress') ? (
              <button
                type="button"
                onClick={() => { onSelectModule('ingress'); onClose(); }}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Launch</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { onClose(); onOpenUpgradeModal(); }}
                className="px-3.5 py-2 rounded-xl border border-amber-500/40 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Lock className="w-3 h-3" />
                <span>Unlock ($399)</span>
              </button>
            )}
          </div>

          {/* Row 3: Procurement & Multi-Entity */}
          <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
            isModuleUnlocked('procurement')
              ? isDarkMode ? 'bg-slate-900/60 border-slate-700/80 hover:border-emerald-500' : 'bg-slate-50 border-slate-200 hover:border-emerald-600'
              : isDarkMode ? 'bg-slate-950/40 border-slate-800/80 opacity-70' : 'bg-slate-100/50 border-slate-200 opacity-70'
          }`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    MOD 03
                  </span>
                  <h4 className="font-bold text-xs truncate">3-Way Procurement & Multi-Entity</h4>
                  {isModuleUnlocked('procurement') ? (
                    <span className="text-[9px] font-mono font-bold text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ACTIVE
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono font-bold text-slate-400 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> LOCKED
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  3-way PO matching, multi-entity GAAP rollups, 5-daemon keepalive threads
                </p>
              </div>
            </div>

            {isModuleUnlocked('procurement') ? (
              <button
                type="button"
                onClick={() => { onSelectModule('procurement'); onClose(); }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Launch</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { onClose(); onOpenUpgradeModal(); }}
                className="px-3.5 py-2 rounded-xl border border-amber-500/40 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Lock className="w-3 h-3" />
                <span>Unlock ($399)</span>
              </button>
            )}
          </div>

          {/* Row 4: MAP & Brand Defense */}
          <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
            isModuleUnlocked('map_protection')
              ? isDarkMode ? 'bg-slate-900/60 border-slate-700/80 hover:border-rose-500' : 'bg-slate-50 border-slate-200 hover:border-rose-600'
              : isDarkMode ? 'bg-slate-950/40 border-slate-800/80 opacity-70' : 'bg-slate-100/50 border-slate-200 opacity-70'
          }`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-[#E00728]/15 text-rose-600 dark:text-[#E00728] shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#E00728]/15 text-rose-600 dark:text-[#E00728]">
                    MOD 04
                  </span>
                  <h4 className="font-bold text-xs truncate">Brand Reputation & MAP Defense</h4>
                  {isModuleUnlocked('map_protection') ? (
                    <span className="text-[9px] font-mono font-bold text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ACTIVE
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono font-bold text-slate-400 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> LOCKED
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  240+ touchpoint scrapers, screenshot hashes, automated C&amp;D notices, email alerts
                </p>
              </div>
            </div>

            {isModuleUnlocked('map_protection') ? (
              <button
                type="button"
                onClick={() => { onSelectModule('map_protection'); onClose(); }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-[#0077b6] hover:from-rose-500 hover:to-[#0096c7] text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Launch</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { onClose(); onOpenUpgradeModal(); }}
                className="px-3.5 py-2 rounded-xl border border-amber-500/40 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Lock className="w-3 h-3" />
                <span>Unlock ($399)</span>
              </button>
            )}
          </div>

          {/* Row 5: CloudboyX Predict & Bayesian Engine */}
          <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
            isModuleUnlocked('predict')
              ? isDarkMode ? 'bg-slate-900/60 border-slate-700/80 hover:border-purple-500' : 'bg-slate-50 border-slate-200 hover:border-purple-600'
              : isDarkMode ? 'bg-slate-950/40 border-slate-800/80 opacity-70' : 'bg-slate-100/50 border-slate-200 opacity-70'
          }`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-600 dark:text-[#979BF3] shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-600 dark:text-[#979BF3]">
                    MOD 05
                  </span>
                  <h4 className="font-bold text-xs truncate">Quantitative Predict &amp; Bayesian Engine</h4>
                  {isModuleUnlocked('predict') ? (
                    <span className="text-[9px] font-mono font-bold text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ACTIVE
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono font-bold text-slate-400 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> LOCKED
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  Kalshi &amp; Polymarket odds, NFL player props, backtesting simulations, Kelly sizing
                </p>
              </div>
            </div>

            {isModuleUnlocked('predict') ? (
              <button
                type="button"
                onClick={() => { onSelectModule('predict'); onClose(); }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-[#979BF3] hover:from-purple-500 hover:to-indigo-400 text-[#1C1B21] text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Launch</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { onClose(); onOpenUpgradeModal(); }}
                className="px-3.5 py-2 rounded-xl border border-amber-500/40 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Lock className="w-3 h-3" />
                <span>Unlock ($399)</span>
              </button>
            )}
          </div>

        </div>

        {/* Modal Footer Bar */}
        <div className={`p-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs font-mono ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { onClose(); onGoToHub(); }}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
            >
              Central Launch Menu
            </button>
            <button
              type="button"
              onClick={() => { onClose(); onExitToMarketing(); }}
              className="px-3 py-1.5 rounded-lg hover:text-[#979BF3] dark:hover:text-[#979BF3] transition-colors cursor-pointer"
            >
              Marketing Website
            </button>
          </div>

          <button
            type="button"
            onClick={() => { onClose(); onOpenUpgradeModal(); }}
            className="text-[#979BF3] dark:text-[#979BF3] hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Manage Modular Plan</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ModuleSwitcherModal;

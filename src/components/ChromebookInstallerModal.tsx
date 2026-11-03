/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Laptop, 
  Download, 
  CheckCircle, 
  HelpCircle, 
  ExternalLink, 
  X, 
  ShieldCheck, 
  Sparkles, 
  FileCode, 
  ArrowRight,
  Pin,
  Monitor
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface ChromebookInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export const ChromebookInstallerModal: React.FC<ChromebookInstallerModalProps> = ({
  isOpen,
  onClose,
  isDarkMode = true,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isChromeOS, setIsChromeOS] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Detect standalone PWA mode (already running as installed app)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect ChromeOS / Chromebook user agent
    const ua = window.navigator.userAgent.toLowerCase();
    setIsChromeOS(ua.includes('cros') || ua.includes('chromebook'));

    // Capture Chrome/ChromeOS beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallSuccess(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const [showBrowserPromptHint, setShowBrowserPromptHint] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If prompt event has not fired yet or is inside an iframe, display step-by-step inline Chrome install guidance
      setShowBrowserPromptHint(true);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setInstallSuccess(true);
        setDeferredPrompt(null);
      }
    } catch (err) {
      console.warn("PWA install error:", err);
      setShowBrowserPromptHint(true);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-xl rounded-2xl shadow-2xl border transition-all overflow-hidden flex flex-col max-h-[90vh] ${
          isDarkMode ? 'bg-[#1C1B21] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Laptop className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight font-mono uppercase text-white">
                  Chromebook &amp; Desktop App Installer
                </h3>
                {isChromeOS && (
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    ChromeOS Detected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Install CloudboyX as a standalone app with shelf icon and offline support.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-left text-xs leading-relaxed">
          {/* Status Banner */}
          {isInstalled || installSuccess ? (
            <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="block font-bold text-white text-xs">CloudboyX is Already Installed!</strong>
                <span className="text-[11px] text-emerald-300/90">
                  The application is running in standalone mode or registered on your Chromebook Shelf.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/80 via-purple-950/70 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Primary Chromebook Installation
                </span>
                <h4 className="text-sm font-bold text-white">1-Click Install to Shelf &amp; Launcher</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Creates an independent window with custom title bar and shelf pinning.
                </p>
              </div>
              <button
                type="button"
                id="btn-trigger-pwa-install"
                onClick={handleInstallClick}
                className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Laptop className="w-4 h-4" />
                <span>Install on Chromebook</span>
              </button>
            </div>
          )}

          {/* Browser Address Bar Fallback Hint */}
          {showBrowserPromptHint && !isInstalled && !installSuccess && (
            <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 animate-fadeIn space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <HelpCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>ChromeOS Direct Install Instructions:</span>
              </div>
              <p className="text-[11px] text-amber-100/90 leading-relaxed">
                When running inside an embedded preview iframe, your Chromebook browser reserves installation permissions for the top-level window. To install CloudboyX directly:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px] font-mono text-slate-200 pt-1">
                <div className="p-2 rounded bg-black/40 border border-white/10">
                  <strong className="text-amber-300 block mb-0.5">Method 1 (Fastest):</strong>
                  Look at the right side of your Chrome URL bar at the top and click the <strong>Install app icon (⊕ or desktop monitor)</strong>.
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/10">
                  <strong className="text-amber-300 block mb-0.5">Method 2 (Chrome Menu):</strong>
                  Click Chrome Menu (<strong>⋮</strong>) &rarr; <strong>Save and share</strong> &rarr; <strong>Install CloudboyX...</strong>
                </div>
              </div>
            </div>
          )}

          {/* Downloadable Install Files Section */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              Downloadable Install Files for Chromebook
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Chromebook Web App Launcher HTML */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                      Chromebook App (.html)
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      Standalone
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Double-clickable Chromebook launcher file. Save to your Chromebook Files / Downloads folder.
                  </p>
                </div>
                <a
                  href="/CloudboyX_Chromebook_App.html"
                  download="CloudboyX_Chromebook_App.html"
                  className="w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/10"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download .html Launcher</span>
                </a>
              </div>

              {/* Option 2: Linux .desktop Launcher */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-blue-400" />
                      Linux .desktop Entry
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
                      Crostini Linux
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    For Chromebooks with Linux environment enabled. Pins to ChromeOS Linux application group.
                  </p>
                </div>
                <a
                  href="/cloudboyx.desktop"
                  download="cloudboyx.desktop"
                  className="w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/10"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>Download .desktop File</span>
                </a>
              </div>
            </div>
          </div>

          {/* Step-by-Step ChromeOS Walkthrough */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
            <h5 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Pin className="w-3.5 h-3.5 text-amber-400" />
              How to Pin to your Chromebook Shelf (Taskbar)
            </h5>
            <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-300">
              <li>
                In the Chrome address bar, look for the <strong>Install App icon</strong> (monitor with down arrow) on the far right.
              </li>
              <li>
                Click <strong>Install</strong> to add CloudboyX to your Chromebook.
              </li>
              <li>
                Alternatively, open the Chrome Menu (<strong>⋮</strong>) in the top-right corner, select <strong>Save and share</strong>, then click <strong>Install CloudboyX...</strong>
              </li>
              <li>
                Once opened, right-click the CloudboyX icon on your bottom <strong>Chromebook Shelf</strong> and select <strong>Pin</strong>.
              </li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>PWA Manifest v4.2 · Offline Precache Ready</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

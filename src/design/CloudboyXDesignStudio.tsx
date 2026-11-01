/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider } from './context/AuthContext';
import DesignApp from './App';
import { ArrowLeft, Sparkles, Layout } from 'lucide-react';

export interface CloudboyXDesignStudioProps {
  onExit?: () => void;
  initialView?: 'landing' | 'builder' | 'admin';
}

export const CloudboyXDesignStudio: React.FC<CloudboyXDesignStudioProps> = ({
  onExit,
  initialView = 'builder',
}) => {
  return (
    <AuthProvider>
      <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans">
        {onExit && (
          <header className="sticky top-0 z-50 bg-[#1C1B21] border-b border-white/10 px-4 py-2 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onExit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-white/10 hover:bg-white/20 text-[#979BF3] hover:text-white transition-all cursor-pointer border border-white/10 shadow-xs"
                title="Return to CloudboyX Main Application"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit to Main Suite</span>
              </button>
              <div className="hidden sm:block h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-[#979BF3]" />
                <span className="text-xs font-mono font-bold text-white tracking-wide">
                  CloudboyX Design Studio
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-[#979BF3]/20 text-[#979BF3] border border-[#979BF3]/30">
                  Bootstrap 5 Visual Cascade
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-white/60">
              <span className="hidden md:inline">Ctrl+K / ⌘K Command Palette</span>
              <button
                type="button"
                onClick={onExit}
                className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
          </header>
        )}
        <div className="flex-1 w-full">
          <DesignApp initialView={initialView as 'landing' | 'builder' | 'admin'} onExit={onExit} />
        </div>
      </div>
    </AuthProvider>
  );
};

export default CloudboyXDesignStudio;

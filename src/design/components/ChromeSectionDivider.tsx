/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Database, RefreshCw, CheckCircle, ShieldCheck } from 'lucide-react';
import { Breakpoint, BREAKPOINT_LABELS } from '../engine/bootstrapCascade';

export interface ChromeSectionDividerProps {
  themeMode?: 'light' | 'dark';
  activeBreakpoint?: Breakpoint;
  isSchemaSyncing?: boolean;
  lastSyncTime?: string | null;
  onSyncSchema?: () => void;
  schemaVersion?: string;
}

export const ChromeSectionDivider: React.FC<ChromeSectionDividerProps> = ({
  themeMode = 'dark',
  activeBreakpoint = 'lg',
  isSchemaSyncing = false,
  lastSyncTime,
  onSyncSchema,
  schemaVersion = '2.5.0',
}) => {
  const isDark = themeMode === 'dark';
  const bpInfo = BREAKPOINT_LABELS[activeBreakpoint] || { label: 'Desktop', desc: 'lg' };

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className="relative w-full z-20 select-none transition-colors duration-200"
    >
      {/* Primary Visual Delineation Strip */}
      <div
        className={`w-full h-[3px] sm:h-[4px] relative overflow-hidden transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-r from-transparent via-[#979BF3]/35 to-transparent'
            : 'bg-gradient-to-r from-transparent via-blue-500/30 to-transparent'
        }`}
      >
        {/* Subtle dynamic micro-glow runner */}
        <div
          className={`absolute inset-0 w-1/3 bg-gradient-to-r from-transparent ${
            isDark ? 'via-[#00E5D1]/30' : 'via-[#979BF3]/30'
          } to-transparent animate-pulse`}
          style={{ animationDuration: '4s' }}
        />
      </div>

      {/* High-Precision Border Line */}
      <div
        className={`w-full border-b transition-colors ${
          isDark ? 'border-slate-800/90' : 'border-slate-200/90'
        }`}
      />

      {/* Floating Micro-Badge Cluster for Application Chrome Delineation */}
      <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-2 pointer-events-auto">
        <div
          className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-semibold flex items-center gap-1.5 shadow-2xs backdrop-blur-md transition-all ${
            isDark
              ? 'bg-[#111520]/90 border-slate-700/80 text-slate-300'
              : 'bg-white/95 border-slate-200 text-slate-600'
          }`}
          title={`Active Breakpoint: ${bpInfo.label} (${bpInfo.desc})`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Viewport:
          </span>
          <span className="font-bold text-slate-700 dark:text-slate-200">{activeBreakpoint.toUpperCase()}</span>

          <span className="w-px h-2.5 bg-slate-300 dark:bg-slate-700 mx-0.5" />

          {/* Canonical Gateway Live Sync Indicator */}
          <div
            className="flex items-center gap-1 text-[9px] font-mono"
            title={
              lastSyncTime
                ? `Canonical Schema synced with Universal Gateway at ${new Date(lastSyncTime).toLocaleTimeString()}`
                : 'Canonical Schema connected to Universal Gateway v' + schemaVersion
            }
          >
            <Database className="w-2.5 h-2.5 text-cyan-400" />
            <span className="text-slate-400 dark:text-slate-500">Gateway:</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">v{schemaVersion}</span>
          </div>

          {onSyncSchema && (
            <button
              type="button"
              onClick={onSyncSchema}
              disabled={isSchemaSyncing}
              className={`p-0.5 rounded transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                isSchemaSyncing ? 'animate-spin text-cyan-400' : 'text-slate-400 hover:text-cyan-400'
              }`}
              title="Automated Sync: Pull latest Canonical Schema from Gateway"
              aria-label="Automated Sync with Gateway"
            >
              <RefreshCw className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Database,
  RefreshCw,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Layers,
  ArrowRight,
  Code2,
  FileCode,
  X,
  Sparkles,
  Info,
  CheckCircle,
} from 'lucide-react';
import { CanonicalSchemaDefinition, CanonicalFieldDefinition } from '../../canonical';
import {
  syncCanonicalSchemaWithGateway,
  getAvailableCanonicalDataTokens,
  CanonicalDataToken,
} from '../engine/canonicalSchemaSync';
import { BlockInstance } from '../types';

export interface CanonicalSchemaSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSchema: CanonicalSchemaDefinition;
  onSchemaUpdated: (newSchema: CanonicalSchemaDefinition) => void;
  themeMode?: 'light' | 'dark';
  selectedBlock?: BlockInstance | null;
  onApplyBindingsToBlock?: (blockId: string, bindings: Record<string, string>) => void;
  showToast?: (toast: { title: string; description?: string }) => void;
}

export const CanonicalSchemaSyncModal: React.FC<CanonicalSchemaSyncModalProps> = ({
  isOpen,
  onClose,
  currentSchema,
  onSchemaUpdated,
  themeMode = 'dark',
  selectedBlock,
  onApplyBindingsToBlock,
  showToast,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'fields' | 'adapters' | 'bindings'>('fields');
  const isDark = themeMode === 'dark';

  if (!isOpen) return null;

  const tokens = getAvailableCanonicalDataTokens(currentSchema);

  const handleExecuteAutomatedSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncCanonicalSchemaWithGateway();
      onSchemaUpdated(result.schema);
      if (showToast) {
        showToast({
          title: 'Gateway Schema Synced',
          description: `Updated internal Design Studio schema types to match Universal Gateway v${result.schema.version} (${result.fieldsCount} attributes).`,
        });
      }
    } catch (err: any) {
      if (showToast) {
        showToast({
          title: 'Sync Failed',
          description: err.message || 'Unable to connect to Universal Gateway.',
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
    if (showToast) {
      showToast({
        title: 'Token Copied',
        description: `Copied "${token}" to clipboard. Paste into any block parameter field.`,
      });
    }
  };

  const handleAutoBindSelectedBlock = () => {
    if (!selectedBlock || !onApplyBindingsToBlock) return;

    // Detect block category/type and map relevant canonical fields
    const bindings: Record<string, string> = {};
    if (selectedBlock.content.title !== undefined) {
      bindings.title = `Order #{{order.sourceOrderId}} Fulfillment`;
    }
    if (selectedBlock.content.subtitle !== undefined) {
      bindings.subtitle = `Customer: {{order.customerEmail}} • Total: {{order.totalAmountFormatted}}`;
    }
    if (selectedBlock.content.price !== undefined) {
      bindings.price = `{{order.totalAmountFormatted}}`;
    }
    if (selectedBlock.content.badgeText !== undefined) {
      bindings.badgeText = `Ingested via {{order.sourceSystem}}`;
    }
    if (selectedBlock.content.description !== undefined) {
      bindings.description = `Normalized Canonical Order with {{order.items.length}} items, tax of {{order.taxAmountFormatted}}, created at {{order.createdAt}}.`;
    }

    onApplyBindingsToBlock(selectedBlock.id, bindings);
    if (showToast) {
      showToast({
        title: 'Parameters Auto-Bound',
        description: `Applied ${Object.keys(bindings).length} Canonical Schema bindings to "${selectedBlock.name}".`,
      });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="canonical-sync-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-200 ${
          isDark
            ? 'bg-[#111520] border-slate-800 text-slate-100 shadow-cyan-950/20'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-400/20'
        }`}
      >
        {/* Header Bar */}
        <header
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'border-slate-800 bg-[#0d111a]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="canonical-sync-modal-title" className="text-base font-bold tracking-tight">
                  Universal Gateway Canonical Schema
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  v{currentSchema.version}
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                Automated schema synchronization between Gateway adapters and Design Studio block parameters
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Sync Status Banner */}
        <div
          className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs font-mono ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100/70 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 text-slate-300 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Target Entity:</span>
            <span className="font-bold text-cyan-400">{currentSchema.entity}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">
              Adapters: {currentSchema.sourceSystemsSupported.join(', ')}
            </span>
          </div>

          {/* Automated Sync Action Button */}
          <button
            type="button"
            id="btn-automated-schema-sync-modal"
            data-testid="btn-automated-schema-sync-modal"
            onClick={handleExecuteAutomatedSync}
            disabled={isSyncing}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 ${
              isSyncing
                ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400 cursor-wait'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold border border-cyan-400 shadow-md shadow-cyan-500/20'
            }`}
            title="Pulls the latest Canonical Schema definition from the Universal Gateway"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Pulling from Gateway...' : 'Pull Latest Schema from Gateway'}</span>
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className={`px-5 pt-3 border-b flex items-center gap-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <button
            type="button"
            onClick={() => setActiveTab('fields')}
            className={`pb-2.5 text-xs font-mono font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'fields'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Schema Fields ({Object.keys(currentSchema.fields).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bindings')}
            className={`pb-2.5 text-xs font-mono font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'bindings'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Block Parameter Tokens ({tokens.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('adapters')}
            className={`pb-2.5 text-xs font-mono font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'adapters'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Gateway Adapters ({currentSchema.sourceSystemsSupported.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'fields' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                These types are normalized in real-time from incoming Shopify webhooks, legacy supplier CSVs, and EDI 850 documents:
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {(Object.entries(currentSchema.fields) as [string, CanonicalFieldDefinition][]).map(([fieldName, fieldDef]) => (
                  <div
                    key={fieldName}
                    className={`p-3.5 rounded-xl border transition-colors ${
                      isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-cyan-400">
                          {fieldDef.field}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30">
                          {fieldDef.type}
                        </span>
                        {fieldDef.unit && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            {fieldDef.unit}
                          </span>
                        )}
                        {fieldDef.required && (
                          <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                            required
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyToken(`{{order.${fieldDef.field}}}`)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold border transition flex items-center gap-1 cursor-pointer ${
                          copiedToken === `{{order.${fieldDef.field}}}`
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : isDark
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                        title="Copy binding token for block parameters"
                      >
                        {copiedToken === `{{order.${fieldDef.field}}}` ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Token</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      {fieldDef.description}
                    </p>

                    <div className="mt-2 text-[11px] font-mono text-slate-500 flex items-center gap-2">
                      <span>Sample:</span>
                      <code className="text-slate-300 bg-black/25 px-1.5 py-0.5 rounded">
                        {String(fieldDef.example)}
                      </code>
                    </div>

                    {/* Subfields (e.g. items) */}
                    {fieldDef.subFields && (
                      <div className="mt-3 pl-3.5 border-l-2 border-cyan-500/30 space-y-2">
                        <div className="text-[11px] font-mono font-bold text-slate-300">
                          Array Item Attributes:
                        </div>
                        {(Object.entries(fieldDef.subFields) as [string, CanonicalFieldDefinition][]).map(([subKey, subDef]) => (
                          <div
                            key={subKey}
                            className="flex items-center justify-between text-xs font-mono py-1 border-b border-white/5"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-cyan-300 font-semibold">{subKey}</span>
                              <span className="text-slate-500">({subDef.type})</span>
                              {subDef.unit && (
                                <span className="text-[10px] text-amber-400">{subDef.unit}</span>
                              )}
                            </div>
                            <span className="text-slate-400 text-[11px]">
                              e.g. {String(subDef.example)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bindings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Insert these dynamic data tokens into any block parameter (titles, subtitles, pricing labels, badges) to automatically populate with live canonical order data:
                </p>

                {selectedBlock && onApplyBindingsToBlock && (
                  <button
                    type="button"
                    onClick={handleAutoBindSelectedBlock}
                    className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#979BF3] hover:bg-[#B4B7F7] text-slate-950 transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95"
                    title={`Auto-map Canonical Schema onto selected block "${selectedBlock.name}"`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Bind to "{selectedBlock.name}"</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {tokens.map((tok) => (
                  <div
                    key={tok.token}
                    onClick={() => handleCopyToken(tok.token)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                      copiedToken === tok.token
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : isDark
                        ? 'bg-slate-900/40 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/80'
                        : 'bg-slate-50 border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-slate-200 dark:text-slate-200">
                        {tok.label}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 group-hover:underline">
                        {copiedToken === tok.token ? 'Copied!' : 'Click to Copy'}
                      </span>
                    </div>

                    <code className="text-xs font-mono text-cyan-300 font-bold block truncate">
                      {tok.token}
                    </code>

                    <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
                      <span className="truncate">{tok.description}</span>
                      <span className="font-mono text-slate-500 shrink-0 ml-2">
                        {tok.example}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'adapters' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 leading-relaxed">
                The Universal Gateway ingests from diverse formats and transforms them into this single Canonical Schema:
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-emerald-400 font-mono">1. Shopify Webhook Adapter</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400">fromShopifyWebhook</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Converts line items, total_price, total_tax, and customer object into CanonicalOrder in cents.
                  </p>
                </div>

                <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-amber-400 font-mono">2. Legacy CSV Supplier Adapter</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400">fromLegacyCSVRow</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Normalizes heterogeneous column naming (PartNum vs SKU, OrderTotal vs Total) into standardized CanonicalOrder.
                  </p>
                </div>

                <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-indigo-400 font-mono">3. EDI 850 Transaction Adapter</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-400">fromEDIPayload</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Unwraps nested EDI PO1 line item loops and beginning_segment PO numbers into standard fields.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer
          className={`px-5 py-3 border-t flex items-center justify-between shrink-0 text-xs font-mono ${
            isDark ? 'border-slate-800 bg-[#0d111a]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="text-slate-400 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ready for block parameter injection &amp; live preview</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded-xl font-semibold border transition cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};

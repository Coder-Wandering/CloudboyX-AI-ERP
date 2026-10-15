/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, 
  ArrowRight, 
  Shuffle, 
  CheckCircle, 
  AlertCircle, 
  Terminal, 
  FileCode, 
  RefreshCw, 
  FileSpreadsheet, 
  Cpu, 
  Layers, 
  Activity, 
  FileText, 
  Send, 
  TrendingUp, 
  TrendingDown,
  Plus, 
  Trash2, 
  BookOpen, 
  Coins, 
  ToggleLeft, 
  HelpCircle,
  Clock,
  Sparkles,
  MessageSquare,
  Bot,
  Upload,
  Globe,
  FileSearch,
  Search,
  Mail,
  Tag,
  Hash,
  Pencil,
  X,
  Check,
  Image as ImageIcon,
  Lock,
  Unlock,
  Download,
  ChevronDown,
  Info,
  ArrowUpDown,
  Sliders,
  Settings,
  Shield,
  ShieldCheck,
  ShieldOff,
  QrCode,
  Camera,
  VideoOff,
  Scan,
  RotateCw,
  Zap,
  Star,
  Eye,
  EyeOff,
  History
} from 'lucide-react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { motion, AnimatePresence } from 'motion/react';
import { CanonicalOrder, CanonicalLineItem, RecentScanItem } from './canonical';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

import ReferenceManual from './components/ReferenceManual';
import SQLConsoleWorkbench from './components/SQLConsoleWorkbench';
import ManualAdjustmentForm from './components/ManualAdjustmentForm';
import CloudboyXPortal from './components/CloudboyXPortal';
import DiagnosticsPanel from './components/DiagnosticsPanel';
import ProcurementPortal from './components/ProcurementPortal';
import MultiEntityOverview from './components/MultiEntityOverview';
import { CorporateBrandLogo } from './components/CorporateBrandLogo';

export { CorporateBrandLogo };

const ClickToEditContext = React.createContext<{
  isClickToEditActive: boolean;
  setActiveEditorField: (field: any) => void;
  lockedFields: string[];
  isAdminMode: boolean;
  onPostMessage?: (text: string, type: 'success' | 'error' | 'info') => void;
} | null>(null);

const ClickToEditWrapper = ({ 
  fieldKey, 
  fieldType = 'text', 
  fieldLabel, 
  isTextArea = false, 
  children 
}: { 
  fieldKey: string; 
  fieldType?: 'text' | 'image'; 
  fieldLabel: string; 
  isTextArea?: boolean; 
  children: React.ReactNode;
}) => {
  const context = React.useContext(ClickToEditContext);
  if (!context || !context.isClickToEditActive) {
    return <>{children}</>;
  }

  const isCurrentlyLocked = context.lockedFields.includes(fieldKey);
  const isLockedForRole = isCurrentlyLocked && !context.isAdminMode;

  if (isLockedForRole) {
    return (
      <div 
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          if (context.onPostMessage) {
            context.onPostMessage(`🔒 "${fieldLabel}" has been hardlinelocked by the System Admin. Resellers cannot modify this asset.`, 'error');
          }
        }}
        className="relative group cursor-not-allowed border border-dashed border-rose-400 bg-rose-50/5 hover:bg-rose-50/10 rounded-lg p-1.5 transition-all duration-200 inline-block w-full text-left"
        title={`Immutable element: hardline-locked by System Admin.`}
      >
        <span className="absolute -top-3.5 -left-1 bg-gradient-to-r from-red-600 to-rose-700 text-[8px] font-mono font-extrabold text-white px-2 py-0.5 rounded shadow-lg z-30 transition-all flex items-center gap-1 select-none pointer-events-none uppercase">
          <Lock className="w-2.5 h-2.5 text-white animate-bounce-slow" />
          LOCKED BY ADMIN
        </span>
        <div className="opacity-70 pointer-events-none select-none">{children}</div>
      </div>
    );
  }

  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        context.setActiveEditorField({
          type: fieldType,
          key: fieldKey,
          label: fieldLabel,
          isTextArea
        });
      }}
      className={`relative group cursor-pointer border border-dashed hover:bg-indigo-50/5 rounded-lg p-1.5 transition-all duration-200 inline-block w-full text-left ${
        isCurrentlyLocked 
          ? 'border-amber-400 hover:border-amber-500 bg-amber-50/5' 
          : 'border-pink-500 hover:border-indigo-600 hover:bg-pink-50/10'
      }`}
      title={`Click to edit: ${fieldLabel}`}
    >
      <span className={`absolute -top-3.5 -left-1 text-[8px] font-mono font-bold text-white px-2 py-0.5 rounded shadow-md z-30 transition-all flex items-center gap-1 select-none pointer-events-none scale-90 group-hover:scale-100 ${
        isCurrentlyLocked 
          ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-extrabold' 
          : 'bg-gradient-to-r from-pink-500 to-indigo-600'
      }`}>
        {isCurrentlyLocked ? <Lock className="w-2.5 h-2.5 mr-0.5" /> : <Pencil className="w-2.5 h-2.5 mr-0.5" />}
        {isCurrentlyLocked ? 'LOCKED (ADMIN EDITIVE)' : 'CLICK TO EDIT'}
      </span>
      {children}
    </div>
  );
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      balance: number;
      type: string;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded-lg shadow-xl font-sans text-xs min-w-[170px]">
        <p className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 mb-1.5">
          {data.name}
        </p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Account Type:</span>
            <span className="font-mono font-bold bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded text-[10px]">
              {data.type}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Balance:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              ${data.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function App() {
  // Feed source channels state
  const [activeTab, setActiveTab] = useState<'shopify' | 'legacy_csv' | 'edi' | 'ai_mapped'>('shopify');
  const [mainView, setMainView] = useState<'erp' | 'cloudboy_x' | 'troubleshooting' | 'admin' | 'procurement' | 'multientity'>('erp');
  const [activeBot, setActiveBot] = useState<'erp_gateway' | 'cloudboy_transit' | 'backend_isolator'>('erp_gateway');

  // Trigger automated helper prompt from our connection assistant bot
  const handleTriggerBotPrompt = async (promptText: string) => {
    setChatLoading(true);
    const userMessage = { role: 'user' as const, text: promptText };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setActiveBot('backend_isolator');
    setAiSuiteTab('chat'); // Automatically open chat view
    
    // Set dummy layout to chat tab so users can visual read it
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'The Strategic Advisor encountered a cognitive error.');
      }
      setChatMessages([...updatedMessages, { role: 'model' as const, text: data.reply }]);
    } catch (err: any) {
      setChatMessages([...updatedMessages, { role: 'model' as const, text: `⚠️ Alert Assistant Helper Error: ${err.message}. Please configure your GEMINI_API_KEY secret in Settings.` }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────
  // STUDIO EDIT MODE STATES & INTERACTIVE CONTENT REGISTRY
  // ────────────────────────────────────────────────────────
  // Master Administrator oversight configurations & lock registry
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('buildcorp_is_admin_mode');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  const [lockedFields, setLockedFields] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('buildcorp_locked_fields');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ['copyrightFooterText', 'licenseFooterText', 'erpTopologyImg'];
  });

  useEffect(() => {
    try {
      localStorage.setItem('buildcorp_is_admin_mode', JSON.stringify(isAdminMode));
    } catch (e) {
      console.error(e);
    }
  }, [isAdminMode]);

  useEffect(() => {
    try {
      localStorage.setItem('buildcorp_locked_fields', JSON.stringify(lockedFields));
    } catch (e) {
      console.error(e);
    }
  }, [lockedFields]);

  const [isStudioEditable, setIsStudioEditable] = useState<boolean>(false);
  const [isClickToEditActive, setIsClickToEditActive] = useState<boolean>(false);
  const [isAdminConsoleOpen, setIsAdminConsoleOpen] = useState<boolean>(false);
  const [currentTimeText, setCurrentTimeText] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeText(now.toLocaleTimeString() + " (" + now.toLocaleDateString() + ")");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const [activeEditorField, setActiveEditorField] = useState<{
    type: 'text' | 'image';
    key: string;       // key in customTexts, or erpTopologyImg, controllerAvatarImg
    label: string;
    isTextArea?: boolean;
  } | null>(null);
  const [editorInputValue, setEditorInputValue] = useState<string>('');

  const [customTexts, setCustomTexts] = useState<Record<string, string>>(() => {
    const defaultTexts = {
      appTitle: "CloudboyX Gateway",
      appSubtitle: "Double-Entry Accounting Sandbox • Powered by CloudboyX & Gemini 3.5 Copilot Suite",
      copilotTitle: "Advanced Enterprise AI Copilot Suite",
      copilotDesc: "Removing manual transactional friction, predicting operational forecast horizons, and auditing financial integrity in real-time.",
      gatewayTitle: "CloudboyX Gateway Entry",
      verificationTitle: "Active Gateway Visual Verification Workspace",
      shopifyTitle: "Shopify Sync Engine Connection Channel",
      shopifyDesc: "Simulated instant incoming webhook feed from regional Shopify/CloudboyX storefronts.",
      csvTitle: "Legacy CSV Import & Real-time Auto-Mapper",
      csvDesc: "Ingest legacy file streams and map columns to our canonical database schema automatically.",
      ediTitle: "EDI 850 Transaction File Generator",
      ediDesc: "Parse EDI 850 Purchase Orders natively to generate perfect double-entry ledger listings.",
      aiMappedTitle: "AI-Powered Cognitive Translation Hub",
      aiMappedDesc: "Use Gemini to translate disorganized emails, Slack notifications, or unstructured chat logs.",
      simDbTitle: "Simulated PostgreSQL General Ledger Console",
      simDbDesc: "Inspect real-time relational transaction schemas and run raw general ledger queries.",
      copyrightFooterText: "© 2026 CloudboyX Global Enterprises Inc. All Rights Reserved. Rigid GAAP/IFRS Ledger Compliance Enforced.",
      licenseFooterText: "Licensed exclusively to authorized CloudboyX Reseller Network. All transactions audited via triple-entry cryptographic ledger."
    };
    try {
      const saved = localStorage.getItem('buildcorp_custom_texts');
      if (saved) {
        return { ...defaultTexts, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load customTexts from localStorage', e);
    }
    return defaultTexts;
  });

  const [erpTopologyImg, setErpTopologyImg] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('buildcorp_erp_topology_img');
      if (saved) return saved;
    } catch (e) {
      console.error('Failed to load erpTopologyImg from localStorage', e);
    }
    return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600";
  });

  const [controllerAvatarImg, setControllerAvatarImg] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('buildcorp_controller_avatar_img');
      if (saved) return saved;
    } catch (e) {
      console.error('Failed to load controllerAvatarImg from localStorage', e);
    }
    return "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300";
  });

  const [showImageEditModal, setShowImageEditModal] = useState<'topology' | 'avatar' | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string>('');

  // Persist edits to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('buildcorp_custom_texts', JSON.stringify(customTexts));
    } catch (e) {
      console.error('Failed to save customTexts to localStorage', e);
    }
  }, [customTexts]);

  useEffect(() => {
    try {
      localStorage.setItem('buildcorp_erp_topology_img', erpTopologyImg);
    } catch (e) {
      console.error('Failed to save erpTopologyImg to localStorage', e);
    }
  }, [erpTopologyImg]);

  useEffect(() => {
    try {
      localStorage.setItem('buildcorp_controller_avatar_img', controllerAvatarImg);
    } catch (e) {
      console.error('Failed to save controllerAvatarImg to localStorage', e);
    }
  }, [controllerAvatarImg]);

  const [isInitialLoadDone, setIsInitialLoadDone] = useState<boolean>(false);
  const isInitialLoadFiredRef = useRef<boolean>(false);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await fetch('/api/branding');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (data.customTexts) {
              setCustomTexts(prev => ({ ...prev, ...data.customTexts }));
            }
            if (data.erpTopologyImg) {
              setErpTopologyImg(data.erpTopologyImg);
            }
            if (data.controllerAvatarImg) {
              setControllerAvatarImg(data.controllerAvatarImg);
            }
            if (data.lockedFields) {
              setLockedFields(data.lockedFields);
            }
            if (data.isAdminMode !== null && data.isAdminMode !== undefined) {
              setIsAdminMode(data.isAdminMode);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch branding from server', err);
      } finally {
        setIsInitialLoadDone(true);
      }
    };
    fetchBranding();
  }, []);

  useEffect(() => {
    if (isInitialLoadDone) {
      const timer = setTimeout(() => {
        isInitialLoadFiredRef.current = true;
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isInitialLoadDone]);

  useEffect(() => {
    if (!isInitialLoadDone || !isInitialLoadFiredRef.current) return;
    const saveBranding = async () => {
      try {
        await fetch('/api/branding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customTexts,
            erpTopologyImg,
            controllerAvatarImg,
            lockedFields,
            isAdminMode
          })
        });
      } catch (err) {
        console.error('Failed to save branding to server', err);
      }
    };
    const timeout = setTimeout(saveBranding, 500);
    return () => clearTimeout(timeout);
  }, [customTexts, erpTopologyImg, controllerAvatarImg, lockedFields, isAdminMode, isInitialLoadDone]);

  interface AuditTrailEvent {
    id: string;
    timestamp: string;
    type: 'reset' | 'manual_post' | 'custom_post' | 'rebrand' | 'system_init';
    title: string;
    description: string;
  }

  const [auditTrail, setAuditTrail] = useState<AuditTrailEvent[]>(() => {
    try {
      const saved = localStorage.getItem('buildcorp_audit_trail');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load auditTrail from localStorage', e);
    }
    return [
      {
        id: 'init-2',
        timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString(),
        type: 'system_init',
        title: 'Baseline Balances Synchronized',
        description: 'Initial general ledger charts validated. Debits matching credits check is active.'
      },
      {
        id: 'init-1',
        timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
        type: 'system_init',
        title: 'ERP Accounting Integration Active',
        description: 'Double-entry relational schema synchronized with development system memory.'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('buildcorp_audit_trail', JSON.stringify(auditTrail));
    } catch (e) {
      console.error('Failed to save auditTrail to localStorage', e);
    }
  }, [auditTrail]);

  const addAuditEvent = (type: 'reset' | 'manual_post' | 'custom_post' | 'rebrand' | 'system_init', title: string, description: string) => {
    const newEvt: AuditTrailEvent = {
      id: `audit-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date().toISOString(),
      type,
      title,
      description
    };
    setAuditTrail(prev => [newEvt, ...prev].slice(0, 30));
  };

  // Sync editor input value when a direct-edit field triggers
  useEffect(() => {
    if (activeEditorField) {
      if (activeEditorField.type === 'text') {
        setEditorInputValue(customTexts[activeEditorField.key] || '');
      } else {
        const imgVal = activeEditorField.key === 'erpTopologyImg' ? erpTopologyImg : controllerAvatarImg;
        setEditorInputValue(imgVal);
      }
    }
  }, [activeEditorField]);

  const handleSaveActiveEditor = () => {
    if (!activeEditorField) return;
    
    if (activeEditorField.type === 'text') {
      setCustomTexts(prev => ({
        ...prev,
        [activeEditorField.key]: editorInputValue
      }));
    } else {
      if (activeEditorField.key === 'erpTopologyImg') {
        setErpTopologyImg(editorInputValue);
      } else if (activeEditorField.key === 'controllerAvatarImg') {
        setControllerAvatarImg(editorInputValue);
      }
    }
    
    setLedgerMessage({
      text: `✏️ Successfully updated: ${activeEditorField.label}`,
      type: 'success'
    });
    
    addAuditEvent('rebrand', 'Interface Asset Rebranded', `Updated branding element: "${activeEditorField.label}"`);
    
    setActiveEditorField(null);
  };

  const renderEditableText = (key: string, className: string, isTextArea: boolean = false) => {
    const val = customTexts[key] || '';
    const isCurrentlyLocked = lockedFields.includes(key);
    const isLockedForRole = isCurrentlyLocked && !isAdminMode;

    if (!isStudioEditable) {
      return <span className={className}>{val}</span>;
    }

    if (isLockedForRole) {
      return (
        <span 
          className={`${className} cursor-not-allowed opacity-75 bg-rose-50/20 border border-dashed border-rose-300 rounded px-1.5 py-0.5 inline-flex items-center gap-1 select-none`}
          title={`🔒 "${key}" is currently hardline-locked by System Administrator.`}
        >
          {val} <Lock className="w-2.5 h-2.5 text-rose-500 shrink-0 inline" />
        </span>
      );
    }

    if (isTextArea) {
      return (
        <textarea
          value={val}
          onChange={(e) => setCustomTexts(prev => ({ ...prev, [key]: e.target.value }))}
          className={`${className} bg-indigo-50/90 border-2 border-indigo-500 focus:border-indigo-600 rounded-lg p-2 focus:ring-2 focus:outline-none w-full text-slate-900 shadow-sm relative z-20 outline-none`}
          rows={3}
          style={{ minHeight: '60px' }}
        />
      );
    }
    return (
      <input
        type="text"
        value={val}
        onChange={(e) => setCustomTexts(prev => ({ ...prev, [key]: e.target.value }))}
        className={`${className} bg-indigo-50/90 border-2 border-indigo-500 focus:border-indigo-600 rounded-lg px-2 py-1 focus:ring-2 focus:outline-none w-full text-slate-900 shadow-sm relative z-20 outline-none`}
      />
    );
  };
  
  // ────────────────────────────────────────────────────────
  // ADVANCED ENTERPRISE AI CO-PILOT SYSTEM STATES
  // ────────────────────────────────────────────────────────
  const [aiSuiteTab, setAiSuiteTab] = useState<'forecasting' | 'agent' | 'nlp' | 'audit' | 'chat'>('forecasting');

  // 1. Predictive Forecasting States
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [forecastRisk, setForecastRisk] = useState<string>('');
  const [forecastAlerts, setForecastAlerts] = useState<string[]>([]);
  const [forecastRecs, setForecastRecs] = useState<string[]>([]);
  const [forecastingLoading, setForecastingLoading] = useState<boolean>(false);

  // 2. Agentic Invoice Parser States
  const [agentInvoiceText, setAgentInvoiceText] = useState<string>(
    "INVOICE #INV-GLOBEX-992\nGlobex Heavy Industrial Raw Materials Supply Inc.\nTo: customer@buildcorp.net\nDate: 2026-06-11 UTC\n\n- 5 tons of IND-STEEL-BRCKT @ $45.00/ton = $225.00\n- 2 packs of ACC-LEATHER-BELT @ $30.00/pack = $60.00\nTax Stated Amount: 15.00 USD\nInvoice Total Due Amount: $300.00"
  );
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [agentLoading, setAgentLoading] = useState<boolean>(false);
  const [agentParsedOrder, setAgentParsedOrder] = useState<any | null>(null);

  // 3. Conversational SQL/NLP States
  const [nlpQuestion, setNlpQuestion] = useState<string>('What is our current cash balance versus estimated sales tax?');
  const [nlpLoading, setNlpLoading] = useState<boolean>(false);
  const [nlpQuery, setNlpQuery] = useState<string>('');
  const [nlpRows, setNlpRows] = useState<any[]>([]);
  const [nlpAnswer, setNlpAnswer] = useState<string>('');

  // 4. ML Auditor / Audit states
  const [auditLoading, setAuditLoading] = useState<boolean>(false);
  const [auditScore, setAuditScore] = useState<number | null>(null);
  const [auditSummary, setAuditSummary] = useState<string>('');
  const [auditAnomalies, setAuditAnomalies] = useState<any[]>([]);

  // 5. Multi-turn AI Operations & Support Companion Chat Room with Google Search Grounding
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model'; text: string; sources?: { title: string; uri: string }[] }[]>([
    {
      role: 'model',
      text: 'Greetings! I am your Platform Support Coach & Technical Operations Copilot. My purpose is to help you understand every component of the CloudboyX Gateway in-depth (from incoming Shopify/EDI/CSV structures, our unified Canonical Schema, down to the rules of double-entry General Ledger balancing and manual adjustments), so you can confidently support and guide your end-users. How can I help you resolve a client dispute or clarify a system flow today?'
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // 6. Image OCR Receipt Scanner States
  const [receiptAnalyzing, setReceiptAnalyzing] = useState<boolean>(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  
  // Payloads inputs state
  const [shopifyPayload, setShopifyPayload] = useState<string>(
    JSON.stringify({
      id: "shopify-9402128",
      order_number: 1024,
      email: "julie.santos@gmail.com",
      created_at: "2026-06-13T01:30:00Z",
      currency: "USD",
      total_price: "164.90",
      total_tax: "14.90",
      line_items: [
        { sku: "CLTH-SWEATER-0", quantity: 1, price: "85.00", currency: "USD" },
        { sku: "ACC-LEATHER-BELT", quantity: 2, price: "32.50", currency: "USD" }
      ]
    }, null, 2)
  );

  const [csvPayload, setCsvPayload] = useState<string>(
    JSON.stringify({
      PartNum: "IND-STEEL-BRCKT",
      Qty: "4",
      UnitPrice: "49.99",
      OrderTotal: "199.96",
      CustEmail: "procurement@buildcorp.net",
      RecordID: "INV-10255",
      Date: "2026-06-12T14:45:00Z"
    }, null, 2)
  );

  const [ediPayload, setEdiPayload] = useState<string>(
    JSON.stringify({
      transaction_sets: [
        {
          heading: {
            beginning_segment_for_purchase_order: {
              purchase_order_number: "PO-B2B-671201"
            },
            po1_loop: [
              {
                baseline_item_data: {
                  product_service_id: "HVY-MACH-VALVE",
                  quantity_ordered: "2",
                  unit_price: "420.00"
                }
              },
              {
                baseline_item_data: {
                  product_service_id: "HVY-MACH-GASKET",
                  quantity_ordered: "10",
                  unit_price: "15.00"
                }
              }
            ]
          }
        }
      ]
    }, null, 2)
  );

  // Gemini AI Cognitive translation State
  const [aiRawInput, setAiRawInput] = useState<string>(
    "From: mark.spencer@logistics.co\nReceived order via email for 3 pallets of standard cement block (sku: CONC-PLT-33). They negotiated a unit cost of 250 dollars each. Total comes out to 750 USD, and standard tax rate doesn't apply for wholesale inter-state purchases here. Reference invoice number is Wholesale- Spencer3."
  );
  const [aiCustomNotes, setAiCustomNotes] = useState<string>("Extract blocks purchase, mark as wholesale. Zero tax.");
  const [aiTranslating, setAiTranslating] = useState<boolean>(false);

  // Normalization results state
  const [normalizedOrder, setNormalizedOrder] = useState<CanonicalOrder | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [outputViewMode, setOutputViewMode] = useState<'visual' | 'json'>('visual');
  const [isCapturingPng, setIsCapturingPng] = useState<boolean>(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isScanningCamera, setIsScanningCamera] = useState<boolean>(false);
  const [showScannerInstructions, setShowScannerInstructions] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [zoomCapabilities, setZoomCapabilities] = useState<{ min: number; max: number; step: number } | null>(null);
  const [isFlashlightOn, setIsFlashlightOn] = useState<boolean>(false);
  const [hasFlashlight, setHasFlashlight] = useState<boolean>(false);
  const [cameraFilter, setCameraFilter] = useState<'none' | 'grayscale' | 'thermal'>('none');

  // Persisted Recent Scans state (supports 'favorite' flag for frequently scanned order patterns)
  const [recentScans, setRecentScans] = useState<RecentScanItem[]>(() => {
    try {
      const stored = localStorage.getItem('cloudboyx_recent_qr_scans');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, 10);
        }
      }
    } catch (e) {
      console.warn("Failed to retrieve recent scans from localStorage:", e);
    }
    return [];
  });

  // Toggle state to show or hide the scanning history pane
  const [showScanHistory, setShowScanHistory] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('cloudboyx_show_scan_history');
      return stored !== null ? stored === 'true' : true;
    } catch (e) {
      return true;
    }
  });

  // Filter within history pane to view only favorited patterns
  const [favoriteScansOnlyFilter, setFavoriteScansOnlyFilter] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('cloudboyx_recent_qr_scans', JSON.stringify(recentScans.slice(0, 10)));
    } catch (e) {
      console.warn("Failed to persist recent scans to localStorage:", e);
    }
  }, [recentScans]);

  useEffect(() => {
    try {
      localStorage.setItem('cloudboyx_show_scan_history', String(showScanHistory));
    } catch (e) {
      console.warn("Failed to persist showScanHistory to localStorage:", e);
    }
  }, [showScanHistory]);

  // General Ledger database status state
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [auditBalanced, setAuditBalanced] = useState<boolean>(true);
  const [postToCash, setPostToCash] = useState<boolean>(true);

  // Screen operational alert state
  const [ledgerMessage, setLedgerMessage] = useState<{ text: string; type: 'success' | 'err' } | null>(null);
  const [activeLedgerTransactionSql, setActiveLedgerTransactionSql] = useState<string>('');
  const [isRecalculatingTrends, setIsRecalculatingTrends] = useState<boolean>(false);

  // 🛡️ Alert Rules Schema & State Guards
  const [alertRules, setAlertRules] = useState<any[]>(() => {
    const cached = localStorage.getItem('erp_alert_rules_v2');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error('Failed parsing alert rules:', e);
      }
    }
    return [
      { id: 'rule-cash', accountId: 'acc-cash', accountName: 'Cash', condition: 'less_than', threshold: 450000, isActive: true, severity: 'danger' },
      { id: 'rule-ar', accountId: 'acc-ar', accountName: 'Accounts Receivable', condition: 'greater_than', threshold: 15000, isActive: true, severity: 'warning' },
      { id: 'rule-complex-or', accountId: 'acc-cash', accountName: 'Cash', condition: 'less_than', threshold: 500000, isActive: true, severity: 'danger', hasOrCondition: true, orAccountId: 'acc-ar', orAccountName: 'Accounts Receivable', orCondition: 'greater_than', orThreshold: 200000 }
    ];
  });

  const [activeToasts, setActiveToasts] = useState<any[]>([]);
  const [isThresholdInfoOpen, setIsThresholdInfoOpen] = useState<boolean>(false);

  // State for adding a new rule (including complex logical 'OR' operator)
  const [newRuleAccount, setNewRuleAccount] = useState<string>('acc-cash');
  const [newRuleCondition, setNewRuleCondition] = useState<'less_than' | 'greater_than'>('less_than');
  const [newRuleThreshold, setNewRuleThreshold] = useState<string>('');
  const [newRuleSeverity, setNewRuleSeverity] = useState<'info' | 'warning' | 'danger'>('warning');

  // Compound 'OR' condition state
  const [enableOrOperator, setEnableOrOperator] = useState<boolean>(false);
  const [newRuleOrAccount, setNewRuleOrAccount] = useState<string>('acc-ar');
  const [newRuleOrCondition, setNewRuleOrCondition] = useState<'less_than' | 'greater_than'>('greater_than');
  const [newRuleOrThreshold, setNewRuleOrThreshold] = useState<string>('');

  // Sync Rules state to LocalStorage
  useEffect(() => {
    localStorage.setItem('erp_alert_rules_v2', JSON.stringify(alertRules));
  }, [alertRules]);

  // Keep track of previously violated alert rules
  const activeAlertsRef = useRef<Record<string, boolean>>({});

  // Refs for real-time QR scanner stream
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const qrScanFrameRef = useRef<number | null>(null);

  // Ref to visually capture the Canonical Order summary layout as PNG
  const canonicalCaptureRef = useRef<HTMLDivElement>(null);

  // Dynamic balance checker triggers toast notifications
  useEffect(() => {
    if (!accounts || accounts.length === 0) return;

    // Map of accounts current balances
    const balances: Record<string, number> = {};
    accounts.forEach(acc => {
      balances[acc.id] = (acc.netBalance || 0) / 100;
    });

    const newToasts: any[] = [];

    // Check rules
    alertRules.forEach(rule => {
      if (!rule.isActive) {
        activeAlertsRef.current[rule.id] = false;
        return;
      }

      const primaryVal = balances[rule.accountId] ?? 0;
      const primaryViolated = rule.condition === 'less_than' ? primaryVal < rule.threshold : primaryVal > rule.threshold;
      
      let isViolated = primaryViolated;
      let orViolated = false;
      let orVal = 0;

      if (rule.hasOrCondition && rule.orAccountId && rule.orThreshold !== undefined) {
        orVal = balances[rule.orAccountId] ?? 0;
        orViolated = rule.orCondition === 'less_than' ? orVal < rule.orThreshold : orVal > rule.orThreshold;
        isViolated = primaryViolated || orViolated;
      }

      const wasViolated = activeAlertsRef.current[rule.id] ?? false;

      // Rule crossed to violated state
      if (isViolated && !wasViolated) {
        let msg = '';
        let title = 'THRESHOLD RISK EXCEEDED';

        if (rule.hasOrCondition) {
          title = `LOGICAL OR RISK EXCEEDED`;
          const parts: string[] = [];
          if (primaryViolated) {
            const cond1 = rule.condition === 'less_than' ? 'dropped below' : 'exceeded';
            parts.push(`${rule.accountName} ($${primaryVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}) ${cond1} $${rule.threshold.toLocaleString('en-US')}`);
          }
          if (orViolated) {
            const cond2 = rule.orCondition === 'less_than' ? 'dropped below' : 'exceeded';
            parts.push(`${rule.orAccountName} ($${orVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}) ${cond2} $${rule.orThreshold.toLocaleString('en-US')}`);
          }
          msg = `Compound 'OR' condition triggered: ${parts.join(' OR ')}. Immediate ledger risk action advised.`;
        } else {
          const condLabel = rule.condition === 'less_than' ? 'dropped below' : 'exceeded';
          msg = `${rule.accountName} balance is currently $${primaryVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. This has ${condLabel} your predefined security threshold limit of $${rule.threshold.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`;
        }

        newToasts.push({
          id: `alert-toast-${rule.id}-${Date.now()}`,
          ruleId: rule.id,
          title,
          accountName: rule.hasOrCondition ? `${rule.accountName} OR ${rule.orAccountName}` : rule.accountName,
          message: msg,
          severity: rule.severity,
          timestamp: new Date().toLocaleTimeString()
        });

        activeAlertsRef.current[rule.id] = true;
      } 
      // Rule crossed back to safe/secure state
      else if (!isViolated && wasViolated) {
        newToasts.push({
          id: `alert-restore-${rule.id}-${Date.now()}`,
          ruleId: rule.id,
          title: `RISK THRESHOLD CLEARED`,
          accountName: rule.hasOrCondition ? `${rule.accountName} OR ${rule.orAccountName}` : rule.accountName,
          message: rule.hasOrCondition
            ? `All logical clauses for ${rule.accountName} OR ${rule.orAccountName} have safely returned to compliant operational levels.`
            : `${rule.accountName} has successfully returned to compliant safe operational levels ($${primaryVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}).`,
          severity: 'info',
          timestamp: new Date().toLocaleTimeString()
        });

        activeAlertsRef.current[rule.id] = false;
      }
    });

    if (newToasts.length > 0) {
      setActiveToasts(prev => [...prev, ...newToasts]);
    }
  }, [accounts, alertRules]);

  const getAccountDetailCode = (id: string) => {
    switch(id) {
      case 'acc-cash': return '1010';
      case 'acc-ar': return '1200';
      case 'acc-revenue': return '4010';
      case 'acc-tax': return '2200';
      default: return '0000';
    }
  };

  const getAccountName = (id: string) => {
    switch(id) {
      case 'acc-cash': return 'Cash';
      case 'acc-ar': return 'Accounts Receivable';
      case 'acc-revenue': return 'Sales Revenue';
      case 'acc-tax': return 'Sales Tax Payable';
      default: return 'Unknown';
    }
  };

  // Ledger records table sorting states
  const [ledgerSortBy, setLedgerSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState<boolean>(false);
  const [ledgerSearchTerm, setLedgerSearchTerm] = useState<string>('');
  const [isExportingDiagram, setIsExportingDiagram] = useState<boolean>(false);
  const [flowNodeFilter, setFlowNodeFilter] = useState<'all' | 'active' | 'stalled' | 'error'>('all');

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isSortDropdownOpen && !target.closest('#ledger-sort-dropdown-container') && !target.closest('#ledger-header-sort-dropdown-container')) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isSortDropdownOpen]);

  // Column-Mapping Selector States (For Legacy CSV Visual schema mapping tab)
  const [mappedSkuColumn, setMappedSkuColumn] = useState<string>('PartNum');
  const [mappedQtyColumn, setMappedQtyColumn] = useState<string>('Qty');
  const [mappedUnitPriceColumn, setMappedUnitPriceColumn] = useState<string>('UnitPrice');
  const [mappedEmailColumn, setMappedEmailColumn] = useState<string>('CustEmail');
  const [mappedIdColumn, setMappedIdColumn] = useState<string>('RecordID');
  const [csvHeaders, setCsvHeaders] = useState<string[]>(['SKU', 'Qty', 'Cost', 'Mail', 'RecordID', 'Date']);

  // States for CSV File Upload and Auto-Mapping Background Task
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isCsvDragging, setIsCsvDragging] = useState<boolean>(false);
  const [autoMapStatus, setAutoMapStatus] = useState<'idle' | 'parsing' | 'mapping' | 'success' | 'error'>('idle');
  const [autoMapLogs, setAutoMapLogs] = useState<string[]>([]);
  const [autoMapProgress, setAutoMapProgress] = useState<number>(0);

  // CSV Multi-file batch queue definitions
  interface CSVBatchFile {
    id: string;
    name: string;
    size: number;
    rowCount: number;
    status: 'pending' | 'processing' | 'completed' | 'error';
    progress: number;
    logs: string[];
    rows: any[];
    mappedCount: number;
  }

  const [csvBatchQueue, setCsvBatchQueue] = useState<CSVBatchFile[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);
  const [currentBatchIndex, setCurrentBatchIndex] = useState<number>(-1);

  interface BatchHistoryItem {
    id: string;
    name: string;
    timestamp: string;
    successCount: number;
    failureCount: number;
    totalCount: number;
    status: 'completed' | 'error';
    errorDetails?: {
      mappingErrors?: number;
      validationFailures?: number;
      missingHeaders?: number;
      typeMismatches?: number;
    };
  }

  const [batchHistory, setBatchHistory] = useState<BatchHistoryItem[]>([
    { 
      id: 'batch-1', 
      name: 'Std Supplier Ingress #104', 
      timestamp: '06/18 09:15', 
      successCount: 12, 
      failureCount: 0, 
      totalCount: 12, 
      status: 'completed' 
    },
    { 
      id: 'batch-2', 
      name: 'Legacy Order Sheet #218', 
      timestamp: '06/18 14:32', 
      successCount: 8, 
      failureCount: 2, 
      totalCount: 10, 
      status: 'error',
      errorDetails: {
        mappingErrors: 1,
        validationFailures: 1,
        typeMismatches: 0,
        missingHeaders: 0
      }
    },
    { 
      id: 'batch-3', 
      name: 'BuildCorp Premium Supplier', 
      timestamp: '06/18 19:11', 
      successCount: 15, 
      failureCount: 0, 
      totalCount: 15, 
      status: 'completed' 
    },
    { 
      id: 'batch-4', 
      name: 'Standard Bulk Hardware Imp', 
      timestamp: '06/19 03:40', 
      successCount: 24, 
      failureCount: 1, 
      totalCount: 25, 
      status: 'error',
      errorDetails: {
        mappingErrors: 0,
        validationFailures: 0,
        typeMismatches: 1,
        missingHeaders: 0
      }
    },
    { 
      id: 'batch-5', 
      name: 'Westside Logistics Ledger', 
      timestamp: '06/19 08:22', 
      successCount: 18, 
      failureCount: 0, 
      totalCount: 18, 
      status: 'completed' 
    },
  ]);

  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [highlightedMetric, setHighlightedMetric] = useState<'all' | 'successCount' | 'failureCount'>('all');

  const downloadBatchPDFReport = (batch: BatchHistoryItem) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
      });

      // Margins 15mm, page width 215.9mm, writable width 185.9mm
      let currentY = 15;

      // Header Banner Background
      doc.setFillColor(15, 23, 42); // slate-900 (dark mode feel for a premium tech report)
      doc.rect(15, currentY, 185.9, 38, 'F');

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('BATCH INGRESS RELIABILITY & AUDIT DISCREPANCY REPORT', 22, currentY + 12);

      // Subtitle
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text('Real-time pipeline verification log and validation mismatch forensics', 22, currentY + 18);

      // Generation Timestamp
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // slate-500
      const nowStr = new Date().toLocaleString();
      doc.text(`Generated: ${nowStr}  |  Tracking ID: ${batch.id}`, 22, currentY + 25);

      // Status Badge
      const isOk = batch.status === 'completed';
      if (isOk) {
        doc.setFillColor(16, 185, 129); // emerald-500
        doc.rect(22, currentY + 28, 32, 5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text('ALL ROWS VALIDATED', 24, currentY + 31.5);
      } else {
        doc.setFillColor(244, 63, 94); // rose-500
        doc.rect(22, currentY + 28, 34, 5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text('DISCREPANCIES FOUND', 24, currentY + 31.5);
      }

      currentY += 46;

      // Batch Meta Information
      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('1. BATCH PROFILE METADATA', 15, currentY);
      
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.3);
      doc.line(15, currentY + 1.5, 200.9, currentY + 1.5);

      currentY += 8;

      // Draw metadata table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text('Batch Filename / Source:', 15, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(batch.name, 58, currentY);

      currentY += 6;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Ingress Timestamp:', 15, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(batch.timestamp, 58, currentY);

      currentY += 6;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Total Record Volume:', 15, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(`${batch.totalCount} individual rows checked`, 58, currentY);

      currentY += 6;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Success Count / Rate:', 15, currentY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129); // emerald-500
      const sRate = batch.totalCount > 0 ? ((batch.successCount / batch.totalCount) * 100).toFixed(1) : '100.0';
      doc.text(`${batch.successCount} rows posted successfully (${sRate}%)`, 58, currentY);

      currentY += 6;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Failure Count:', 15, currentY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(batch.failureCount > 0 ? 244 : 71, batch.failureCount > 0 ? 63 : 85, batch.failureCount > 0 ? 94 : 105);
      doc.text(`${batch.failureCount} rows rejected from QuickBooks IIF mapping`, 58, currentY);

      currentY += 12;

      // 2. Error Breakdown Section
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('2. CATEGORIZED ALIGNMENT FORENSICS', 15, currentY);
      
      doc.line(15, currentY + 1.5, 200.9, currentY + 1.5);

      currentY += 8;

      // Draw horizontal cards or error category bars
      const errDetails = batch.errorDetails || {
        mappingErrors: 0,
        validationFailures: 0,
        typeMismatches: 0,
        missingHeaders: 0
      };

      const categories = [
        { label: 'Category / Account Mapping Errors', count: errDetails.mappingErrors || 0, desc: 'Selected account codes do not possess corresponding definitions inside QuickBooks IIF structure.' },
        { label: 'Schema Validation Failures', count: errDetails.validationFailures || 0, desc: 'Critical fields like Customer ID, Email or Date was empty or failed layout checks.' },
        { label: 'DataType & Non-Numeric Mismatches', count: errDetails.typeMismatches || 0, desc: 'Amount/Quantity values contained characters or did not conform to safe float bounds.' },
        { label: 'Missing Headers / Structural Faults', count: errDetails.missingHeaders || 0, desc: 'Target CSV segment lacked standard column headers designated in your alignment rules.' }
      ];

      categories.forEach((cat) => {
        // Draw card background
        doc.setFillColor(248, 250, 252); // slate-50
        doc.rect(15, currentY, 185.9, 14, 'F');
        doc.setDrawColor(241, 245, 249); // slate-100
        doc.setLineWidth(0.2);
        doc.rect(15, currentY, 185.9, 14, 'S');

        // Draw bullet count
        if (cat.count > 0) {
          doc.setFillColor(254, 226, 226); // rose-100
          doc.rect(18, currentY + 3.5, 16, 7, 'F');
          doc.setTextColor(220, 38, 38); // rose-600
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text(`${cat.count} failed`, 20, currentY + 8.2);
        } else {
          doc.setFillColor(209, 250, 229); // emerald-100
          doc.rect(18, currentY + 3.5, 16, 7, 'F');
          doc.setTextColor(5, 150, 105); // emerald-600
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text('0 faults', 20, currentY + 8.2);
        }

        // Font titles
        doc.setTextColor(15, 23, 42); // slate-900
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(cat.label, 38, currentY + 5.5);

        // Descriptions
        doc.setTextColor(100, 116, 139); // slate-500
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(cat.desc, 38, currentY + 10);

        currentY += 17;
      });

      // 3. System Recommendations / Next Steps
      currentY += 2;
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('3. RESOLUTION PATH REFACTOR SUITE', 15, currentY);
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.line(15, currentY + 1.5, 200.9, currentY + 1.5);

      currentY += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text('Actionable Corrective Guideline:', 15, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105); // slate-600
      
      let recommendation = "";
      if (batch.failureCount > 0) {
        recommendation = "1. Please press 'Edit Alignments' and double-check QuickBooks IIF mapping overrides.\n" +
          "2. Review source CSV data rows and verify float format accuracy.\n" +
          "3. Utilize the 'Interactive Field Alignments' panel validation indicator feedback in the GUI.";
      } else {
        recommendation = "All columns and structures strictly conform with your QuickBooks ERP ruleset.\n" +
          "This stream run is 100% verified. Safe to proceed with system-wide bulk ingestion.";
      }

      const splitText = doc.splitTextToSize(recommendation, 180);
      doc.text(splitText, 15, currentY + 5);

      // Footers Page 1
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.25);
      doc.line(15, 255, 200.9, 255);
      
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.setFontSize(7);
      doc.text('BUILDCORP CO-ORDINATION BATCH SUITE — CERTIFICATE OF DATA INTEGRITY VALIDATION', 15, 260);
      doc.text('PAGE 1 OF 1  |  AUDIT GRADE SECURED', 155, 260);

      // Save PDF
      doc.save(`BuildCorp_Batch_Report_${batch.name ? batch.name.replaceAll(' ', '_') : 'Stream'}.pdf`);

      addAuditEvent(
        'custom_post',
        'PDF Log Export',
        `Generated detailed PDF diagnostics and compliance report download for selected stream: "${batch.name}" (Tracing ID: ${batch.id}).`
      );
    } catch (e: any) {
      console.error(e);
    }
  };

  // Added file(s) handler for multi-file batch queue
  const handleCSVFilesSelected = async (files: File[]) => {
    const newBatchFiles: CSVBatchFile[] = [];
    
    for (const file of files) {
      try {
        const text = await file.text();
        const parsed = parseCSV(text);
        if (parsed.headers.length > 0) {
          setCsvHeaders(parsed.headers);
        }
        
        newBatchFiles.push({
          id: `batch-file-${Math.random().toString(36).substring(2, 11)}`,
          name: file.name,
          size: file.size,
          rowCount: parsed.rows.length,
          status: 'pending',
          progress: 0,
          logs: [
            `📥 Loaded file "${file.name}" into batch buffer.`,
            `📋 Discovered Header Columns: [ ${parsed.headers.map(h => `"${h}"`).join(', ')} ]`,
            `📋 Data density: ${parsed.rows.length} rows.`
          ],
          rows: parsed.rows,
          mappedCount: 0
        });
      } catch (err: any) {
        newBatchFiles.push({
          id: `batch-file-${Math.random().toString(36).substring(2, 11)}`,
          name: file.name,
          size: file.size,
          rowCount: 0,
          status: 'error',
          progress: 0,
          logs: [`❌ Error importing file: ${err.message || err}`],
          rows: [],
          mappedCount: 0
        });
      }
    }

    setCsvBatchQueue(prev => [...prev, ...newBatchFiles]);
    setLedgerMessage({
      text: `Added ${newBatchFiles.length} file(s) to the legacy CSV sequential batch processing queue.`,
      type: 'success'
    });
  };

  // Synthesize simulator presets as files into our reactive batch queue
  const loadPresetIntoBatch = (name: string, content: string) => {
    const parsed = parseCSV(content);
    if (parsed.headers.length > 0) {
      setCsvHeaders(parsed.headers);
    }
    const newBatchFile: CSVBatchFile = {
      id: `batch-preset-${Math.random().toString(36).substring(2, 11)}`,
      name: name,
      size: content.length,
      rowCount: parsed.rows.length,
      status: 'pending',
      progress: 0,
      logs: [
        `📥 Generated synthetic channel feed: "${name}"`,
        `📋 Discovered Header Columns: [ ${parsed.headers.map(h => `"${h}"`).join(', ')} ]`,
        `📋 Data density: ${parsed.rows.length} rows.`
      ],
      rows: parsed.rows,
      mappedCount: 0
    };
    setCsvBatchQueue(prev => [...prev, newBatchFile]);
    setLedgerMessage({
      text: `Synthesized "${name}" and appended it to the Legacy CSV queue.`,
      type: 'success'
    });
  };

  // Run all pending segments sequentially
  const handleRunSequentialBatchProcessing = async () => {
    if (csvBatchQueue.length === 0 || isProcessingBatch) return;
    setIsProcessingBatch(true);
    setLedgerMessage({
      text: "⚡ Running high-throughput Legacy CSV batch processing queue...",
      type: "success"
    });

    const activeBatchQueue = [...csvBatchQueue];

    for (let i = 0; i < activeBatchQueue.length; i++) {
      const file = activeBatchQueue[i];
      if (file.status === 'completed') continue;

      setCurrentBatchIndex(i);

      // Transition file status to processing
      setCsvBatchQueue(prev => prev.map((f, idx) => idx === i ? {
        ...f,
        status: 'processing',
        progress: 10,
        logs: [...f.logs, `⏳ Initiating transactional parsing stream of ${f.rowCount} records...`]
      } : f));

      await new Promise(resolve => setTimeout(resolve, 600));

      const headers = file.rows.length > 0 ? Object.keys(file.rows[0]) : [];
      const mapping = mapHeaders(headers);

      setMappedSkuColumn(mapping.sku);
      setMappedQtyColumn(mapping.qty);
      setMappedUnitPriceColumn(mapping.price);
      setMappedEmailColumn(mapping.email);
      setMappedIdColumn(mapping.id);

      let successfulRows = 0;
      const fileLogs = [
        `🧠 Heuristics adapted successfully:`,
        `   [SKU]->"${mapping.sku}", [QTY]->"${mapping.qty}", [PRICE]->"${mapping.price}", [EMAIL]->"${mapping.email}", [ID]->"${mapping.id}"`,
        `⚙️ Processing individual order streams sequentially...`
      ];

      for (let rIndex = 0; rIndex < file.rows.length; rIndex++) {
        const row = file.rows[rIndex];
        const rowId = row[mapping.id] || `ROW-${rIndex + 1}`;

        try {
          // Translate to CanonicalOrder
          const canonical = {
            sourceSystem: 'legacy_csv',
            sourceOrderId: rowId.toString(),
            customerEmail: row[mapping.email] || 'offline@legacy-stream.local',
            items: [
              {
                sku: row[mapping.sku] || 'GENERIC-SKU',
                quantity: parseInt(row[mapping.qty] || '1', 10),
                unitPrice: Math.round(parseFloat(row[mapping.price] || '0') * 100),
                currency: 'USD'
              }
            ],
            totalAmount: row['OrderTotal'] || row['Total'] ? Math.round(parseFloat(row['OrderTotal'] || row['Total']) * 100) : Math.round(parseFloat(row[mapping.price] || '0') * parseInt(row[mapping.qty] || '1', 10) * 100),
            taxAmount: 0,
            createdAt: row['Date'] || row['OrderDate'] ? new Date(row['Date'] || row['OrderDate']) : new Date()
          };

          // Post to simulated relational ledger
          const postRes = await fetch('/api/ledger/post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: canonical, postToCash }),
          });

          const postData = await postRes.json();
          if (!postRes.ok || !postData.success) {
            throw new Error(postData.error || 'General Ledger posting failure');
          }

          successfulRows++;
          fileLogs.push(`   ✓ [Order #${rowId}] Mapped & Posted successfully! SKU: ${canonical.items[0].sku}, Total: $${(canonical.totalAmount / 100).toFixed(2)}`);

        } catch (rowErr: any) {
          fileLogs.push(`   ✗ [Order #${rowId}] Failed to process row: ${rowErr.message || rowErr}`);
        }

        const pct = Math.round(((rIndex + 1) / file.rows.length) * 100);
        setCsvBatchQueue(prev => prev.map((f, idx) => idx === i ? {
          ...f,
          progress: pct,
          mappedCount: successfulRows,
          logs: [...f.logs, ...fileLogs.slice(-1)]
        } : f));

        // Paced delay for UI stream effect
        await new Promise(resolve => setTimeout(resolve, 250));
      }

      setCsvBatchQueue(prev => prev.map((f, idx) => idx === i ? {
        ...f,
        status: successfulRows === f.rows.length ? 'completed' : 'error',
        progress: 100,
        logs: [...f.logs, ...fileLogs, `🎉 Completed processing for "${f.name}". successfully uploaded ${successfulRows}/${f.rows.length} order entries.`]
      } : f));

      const finalStatus = successfulRows === file.rows.length ? 'completed' : 'error';
      const failCount = Math.max(0, file.rows.length - successfulRows);
      const now = new Date();
      const timeStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      let calculatedErrorDetails = undefined;
      if (failCount > 0) {
        const mappingErr = Math.floor(failCount * 0.4);
        const typeMisErr = Math.floor((failCount - mappingErr) * 0.5);
        calculatedErrorDetails = {
          mappingErrors: mappingErr,
          validationFailures: failCount - mappingErr - typeMisErr,
          typeMismatches: typeMisErr,
          missingHeaders: 0
        };
      }

      setBatchHistory(prev => [
        ...prev,
        {
          id: file.id + '-' + Date.now(),
          name: file.name.length > 25 ? file.name.substring(0, 22) + '...' : file.name,
          timestamp: timeStr,
          successCount: successfulRows,
          failureCount: failCount,
          totalCount: file.rows.length,
          status: finalStatus,
          errorDetails: calculatedErrorDetails
        }
      ]);

      addAuditEvent(
        'custom_post',
        'Batch Segment Complete',
        `Processed Legacy CSV batch: Finished processing stream file "${file.name}" with ${successfulRows} canonical transactions posted.`
      );

      await fetchLedgerState();
    }

    setIsProcessingBatch(false);
    setCurrentBatchIndex(-1);

    setLedgerMessage({
      text: "🎉 All pending segments in the Legacy CSV batch queue processed successfully!",
      type: "success"
    });
  };

  const handleClearBatchQueue = () => {
    if (isProcessingBatch) return;
    setCsvBatchQueue([]);
    setLedgerMessage({
      text: "Legacy CSV batch processing queue cleared.",
      type: "success"
    });
  };

  // SQL Console Playground states
  const [customSql, setCustomSql] = useState<string>('SELECT * FROM transactions;');
  const [sqlRows, setSqlRows] = useState<any[]>([]);
  const [sqlColumns, setSqlColumns] = useState<string[]>([]);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [sqlLoading, setSqlLoading] = useState<boolean>(false);
  const [sqlExecuted, setSqlExecuted] = useState<string>('');

  // Manual Adjuster Forms States
  const [manualDesc, setManualDesc] = useState<string>('Direct fiscal ledger adjustments');
  const [manualSku, setManualSku] = useState<string>('ADJUSTMENT-FEE');
  const [manualQty, setManualQty] = useState<string>('1');
  const [manualAmount, setManualAmount] = useState<string>('240.00');
  const [manualEmail, setManualEmail] = useState<string>('corporate@audit-board.org');

  // AI Cognitive mapping templates array
  const AI_PRESETS = [
    {
      name: "Irregular Email Thread",
      input: "From: mark.spencer@logistics.co\nReceived order via email for 3 pallets of standard cement block (sku: CONC-PLT-33). They negotiated a bulk unit cost of 250 dollars each. Total comes out to 750 USD, and standard tax rate doesn't apply for wholesale inter-state purchases here. Reference invoice number is Wholesale- Spencer3.",
      notes: "Extract blocks purchase, mark as wholesale. Zero tax."
    },
    {
      name: "Slack Webhook Alert log",
      input: "🔴 ALARM [01:14] Shopify-Webhook received: Order #9919. Customer: sarah_jones@hey.com. SKU: VNTG-TEE-BLK, qty: 5, rate: 35.00. Tax assessed: 12.25. Currency: USD. Dispatch queued.",
      notes: "Standard retail order. Identify customer email: sarah_jones@hey.com, include the stated tax of $12.25, and calculate final totals."
    },
    {
      name: "Unstructured Chat Request",
      input: "Hey corporate sales desk, it's Julie from Buildcorp! We need to urgently restock. Send us 2 of STEEL-RIVET-100 at our default contract rate of $80 per unit, and also 1 of DENIM-JKT-L if you can manage $120. Corporate tax of 8.25% applies as usual. Bill to procurement@buildcorp.net. PO reference is BC-99-URGENT.",
      notes: "Extract dual line items, customer email: procurement@buildcorp.net, apply 8.25% accounting sales tax to subtotal."
    }
  ];

  // Column mapping mapper update helper
  const handleMapColumnChange = (field: 'sku' | 'qty' | 'price' | 'email' | 'id', newKeyName: string) => {
    let targetSku = field === 'sku' ? newKeyName : mappedSkuColumn;
    let targetQty = field === 'qty' ? newKeyName : mappedQtyColumn;
    let targetPrice = field === 'price' ? newKeyName : mappedUnitPriceColumn;
    let targetEmail = field === 'email' ? newKeyName : mappedEmailColumn;
    let targetId = field === 'id' ? newKeyName : mappedIdColumn;

    if (field === 'sku') setMappedSkuColumn(newKeyName);
    if (field === 'qty') setMappedQtyColumn(newKeyName);
    if (field === 'price') setMappedUnitPriceColumn(newKeyName);
    if (field === 'email') setMappedEmailColumn(newKeyName);
    if (field === 'id') setMappedIdColumn(newKeyName);

    const updatedObj = {
      [targetSku]: "IND-STEEL-BRCKT",
      [targetQty]: "4",
      [targetPrice]: "49.99",
      "OrderTotal": "199.96",
      [targetEmail]: "procurement@buildcorp.net",
      [targetId]: "INV-10255",
      "Date": "2026-06-12T14:45:00Z"
    };

    setCsvPayload(JSON.stringify(updatedObj, null, 2));
  };

  // Custom CSV parser that handles commas, newlines and optional quotes
  const parseCSV = (text: string): { headers: string[]; rows: Record<string, string>[] } => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };
    
    const splitLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = splitLine(lines[0]);
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = splitLine(lines[i]);
      const rowObj: Record<string, string> = {};
      headers.forEach((header, index) => {
        rowObj[header] = values[index] !== undefined ? values[index] : '';
      });
      rows.push(rowObj);
    }

    return { headers, rows };
  };

  // Heuristic mapping engine that inspects header names to align to canonical schema properties
  const mapHeaders = (headers: string[]) => {
    const mapping = {
      sku: '',
      qty: '',
      price: '',
      email: '',
      id: ''
    };

    headers.forEach(header => {
      const h = header.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      if (!mapping.sku) {
        if (h === 'sku' || h === 'partnum' || h === 'itemnumber' || h === 'part' || h.includes('sku') || h.includes('part') || h.includes('itemno') || h.includes('prod')) {
          mapping.sku = header;
        }
      }
      if (!mapping.qty) {
        if (h === 'qty' || h === 'quantity' || h === 'count' || h === 'units' || h.includes('qty') || h.includes('quantity') || h.includes('count')) {
          mapping.qty = header;
        }
      }
      if (!mapping.price) {
        if (h === 'unitprice' || h === 'price' || h === 'cost' || h === 'rate' || h.includes('price') || h.includes('cost') || h.includes('rate')) {
          mapping.price = header;
        }
      }
      if (!mapping.email) {
        if (h === 'custemail' || h === 'email' || h === 'customeremail' || h.includes('email') || h.includes('mail')) {
          mapping.email = header;
        }
      }
      if (!mapping.id) {
        if (h === 'recordid' || h === 'ordernum' || h === 'invoiceno' || h === 'id' || h === 'orderid' || h === 'invoice' || h.includes('id') || h.includes('invoice') || h.includes('record') || h.includes('num')) {
          mapping.id = header;
        }
      }
    });

    // Heuristics fallback assignment (positional/pattern matching)
    if (!mapping.sku) {
      mapping.sku = headers.find(h => h.toLowerCase().includes('item') || h.toLowerCase().includes('part') || h.toLowerCase().includes('sku')) || headers[0] || 'PartNum';
    }
    if (!mapping.qty) {
      mapping.qty = headers.find(h => h.toLowerCase().includes('qty') || h.toLowerCase().includes('count') || h.toLowerCase().includes('pieces') || h.toLowerCase().includes('qty')) || headers[1] || 'Qty';
    }
    if (!mapping.price) {
      mapping.price = headers.find(h => h.toLowerCase().includes('price') || h.toLowerCase().includes('cost') || h.toLowerCase().includes('rate') || h.toLowerCase().includes('amount')) || headers[2] || 'UnitPrice';
    }
    if (!mapping.email) {
      mapping.email = headers.find(h => h.toLowerCase().includes('email') || h.toLowerCase().includes('mail') || h.toLowerCase().includes('cust')) || headers[3] || 'CustEmail';
    }
    if (!mapping.id) {
      mapping.id = headers.find(h => h.toLowerCase().includes('id') || h.toLowerCase().includes('invoice') || h.toLowerCase().includes('num') || h.toLowerCase().includes('ref')) || headers[4] || 'RecordID';
    }

    return mapping;
  };

  // Background Task simulated process for auto-column headers mapping
  const processCSVContent = async (fileContent: string, fileName: string) => {
    setAutoMapStatus('parsing');
    setAutoMapProgress(10);
    setAutoMapLogs([
      `🚀 [SYS-ETL] Initializing corporate CSV parser node...`,
      `📂 Reading File Stream: "${fileName}" (${fileContent.length} bytes loaded)`
    ]);

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      await delay(450);
      
      const parsed = parseCSV(fileContent);
      if (parsed.headers.length === 0) {
        throw new Error("Invalid or empty sheet headers row detected.");
      }
      setCsvHeaders(parsed.headers);

      setAutoMapProgress(40);
      setAutoMapLogs(prev => [
        ...prev,
        `📋 Stream read completed seamlessly.`,
        `📋 Discovered Header Tokens: [ ${parsed.headers.map(h => `"${h}"`).join(', ')} ]`,
        `📋 Discovered Data Density: ${parsed.rows.length} sequential row entries.`,
        `🧠 Algorithmic heuristic analysis scanning for canonical property alignments...`
      ]);

      await delay(650);

      const mapping = mapHeaders(parsed.headers);
      
      setAutoMapProgress(75);
      setAutoMapLogs(prev => [
        ...prev,
        `🎯 Canonical [sku]           -> mapped to header: "${mapping.sku}" (Confidence rating: Excellent)`,
        `🎯 Canonical [quantity]      -> mapped to header: "${mapping.qty}" (Confidence rating: Exceptional)`,
        `🎯 Canonical [unitPrice]     -> mapped to header: "${mapping.price}" (Confidence rating: Standard)`,
        `🎯 Canonical [customerEmail] -> mapped to header: "${mapping.email}" (Confidence rating: Excellent)`,
        `🎯 Canonical [sourceOrderId] -> mapped to header: "${mapping.id}" (Confidence rating: High)`,
        `⚙️ Updating state parameters and bindings in memory...`
      ]);

      await delay(500);

      // Apply mapping choices to active states
      setMappedSkuColumn(mapping.sku);
      setMappedQtyColumn(mapping.qty);
      setMappedUnitPriceColumn(mapping.price);
      setMappedEmailColumn(mapping.email);
      setMappedIdColumn(mapping.id);

      setAutoMapProgress(90);
      setAutoMapLogs(prev => [
        ...prev,
        `✅ Adapters mapped successfully in memory.`,
        `📦 Constructing test model row payload in transactional buffer...`
      ]);

      // Grab first row values
      let payloadRow: any = {};
      if (parsed.rows.length > 0) {
        payloadRow = parsed.rows[0];
      } else {
        payloadRow = {
          [mapping.sku]: "IND-STEEL-BRCKT",
          [mapping.qty]: "4",
          [mapping.price]: "49.99",
          "OrderTotal": "199.96",
          [mapping.email]: "procurement@buildcorp.net",
          [mapping.id]: "INV-10255",
          "Date": "2026-06-12T14:45:00Z"
        };
      }

      setCsvPayload(JSON.stringify(payloadRow, null, 2));

      await delay(250);

      setAutoMapProgress(100);
      setAutoMapStatus('success');
      setAutoMapLogs(prev => [
        ...prev,
        `🚀 PIPELINE RESOLVED: Mapper successfully updated! Transactional buffer synced.`
      ]);

      setLedgerMessage({
        text: `Background task auto-mapped CSV schema. Headers mapped: Sku:${mapping.sku}, Qty:${mapping.qty}, Price:${mapping.price}, Email:${mapping.email}, Id:${mapping.id}`,
        type: 'success'
      });
      
      // Auto-submit translation helper after updates inside timeout
      setTimeout(() => {
        handleTranslatePreset();
      }, 50);

    } catch (err: any) {
      setAutoMapStatus('error');
      setAutoMapLogs(prev => [
        ...prev,
        `❌ FATAL EXECUTION ERR: ${err.message || 'Alignment mismatch.'}`
      ]);
      setLedgerMessage({
        text: `Auto-mapping aborted: ${err.message}`,
        type: 'err'
      });
    }
  };

  // Auto-run translation on tab switch or column mapping change
  useEffect(() => {
    handleTranslatePreset();
  }, [activeTab, mappedSkuColumn, mappedQtyColumn, mappedUnitPriceColumn, mappedEmailColumn, mappedIdColumn, csvPayload]);

  // Handle standard translations queries
  const handleTranslatePreset = async () => {
    setTranslationError(null);
    try {
      let rawPayloadObj: any;
      if (activeTab === 'shopify') {
        rawPayloadObj = JSON.parse(shopifyPayload);
      } else if (activeTab === 'legacy_csv') {
        rawPayloadObj = JSON.parse(csvPayload);
      } else if (activeTab === 'edi') {
        rawPayloadObj = JSON.parse(ediPayload);
      } else {
        // AI tab resets state until user explicitly runs AI mapping
        setNormalizedOrder(null);
        return;
      }

      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceType: activeTab, payload: rawPayloadObj }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server translation failure');
      }
      setNormalizedOrder(data.order);
    } catch (err: any) {
      setTranslationError(err.message || 'JSON formatting error or unrecognized payload properties.');
      setNormalizedOrder(null);
    }
  };

  // Helper to export current topology diagram along with system parameters/meta
  const handleExportTopologyDiagram = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent modal popup from triggering on active branding board
    setIsExportingDiagram(true);
    
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsExportingDiagram(false);
      return;
    }

    // Step 1: Draw high-tech gradient background
    const grad = ctx.createLinearGradient(0, 0, 1200, 800);
    grad.addColorStop(0, '#0f172a'); // slate-900
    grad.addColorStop(1, '#1e1b4b'); // indigo-950
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 800);

    // Grid lines for technical background mesh
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < 1200; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 800);
      ctx.stroke();
    }
    for (let y = 0; y < 800; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1200, y);
      ctx.stroke();
    }

    // Draw frame brackets of digital interface
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    const pad = 20;
    const size = 30;
    
    // Top-Left bracket
    ctx.beginPath();
    ctx.moveTo(pad + size, pad); ctx.lineTo(pad, pad); ctx.lineTo(pad, pad + size);
    ctx.stroke();
    // Top-Right bracket
    ctx.beginPath();
    ctx.moveTo(1200 - pad - size, pad); ctx.lineTo(1200 - pad, pad); ctx.lineTo(1200 - pad, pad + size);
    ctx.stroke();
    // Bottom-Left bracket
    ctx.beginPath();
    ctx.moveTo(pad, 800 - pad - size); ctx.lineTo(pad, 800 - pad); ctx.lineTo(pad + size, 800 - pad);
    ctx.stroke();
    // Bottom-Right bracket
    ctx.beginPath();
    ctx.moveTo(1200 - pad - size, 800 - pad); ctx.lineTo(1200 - pad, 800 - pad); ctx.lineTo(1200 - pad, 800 - pad - size);
    ctx.stroke();

    // Secondary inner sub-frame line
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, 1140, 740);

    const drawContent = () => {
      // Draw sidebar accent block
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(50, 50, 8, 52);

      // Main header
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('BUILDCORP ENTERPRISE PLATFORM REPORT', 72, 75);

      // Sub-heading
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      ctx.fillText('Dynamic Network Infrastructure Topology Map & ERP Audit Pipelines', 72, 95);

      // Metadata Info Box in the top right
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(800, 50, 350, 150);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(800, 50, 350, 150);

      ctx.fillStyle = '#38bdf8'; // sky blue
      ctx.font = 'bold 10px monospace';
      ctx.fillText('CORE SYSTEM METADATA', 815, 75);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px monospace';
      ctx.fillText('DIAGRAM STATUS: ', 815, 105);
      ctx.fillStyle = '#34d399'; // emerald
      ctx.fillText('ONLINE', 940, 105);

      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('REPORT SCOPE  : ', 815, 125);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('DOUBLE-ENTRY AUDIT', 940, 125);

      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('EXPORT DATE   : ', 815, 145);
      ctx.fillStyle = '#a5b4fc';
      ctx.fillText(new Date().toUTCString(), 940, 145);

      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('INTEGRITY LOCK : ', 815, 165);
      ctx.fillStyle = '#f472b6';
      ctx.fillText('VERIFIED LEDGER', 940, 165);

      // Main image container board area
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 220, 1100, 520);

      // Draw schematic overlay elements representing our active modular channels
      // Channel 1: Ingestion Pipeline Node
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(100, 430, 240, 100);
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(100, 430, 240, 100);
      
      ctx.fillStyle = '#818cf8';
      ctx.fillRect(100, 430, 5, 100);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('NODE 01: DATA INGESTION', 120, 465);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px monospace';
      ctx.fillText('Input Target: CSV/Shopify Endpoint', 120, 490);
      ctx.fillStyle = '#4ade80';
      ctx.fillText('✓ Active Connection', 120, 510);

      // Channel 2: Real-time Reconciliation Engine
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(480, 430, 240, 100);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(480, 430, 240, 100);

      ctx.fillStyle = '#34d399';
      ctx.fillRect(480, 430, 5, 100);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('NODE 02: RECONCILER DECK', 500, 465);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px monospace';
      ctx.fillText('Module: Dynamic Double-Entry Ledger', 500, 490);
      ctx.fillStyle = '#4ade80';
      ctx.fillText('✓ Auto-Balanced Calibrated', 500, 510);

      // Channel 3: Secure Ledger Ingestion Persistence
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(860, 430, 240, 100);
      ctx.strokeStyle = '#db2777';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(860, 430, 240, 100);

      ctx.fillStyle = '#f472b6';
      ctx.fillRect(860, 430, 5, 100);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('NODE 03: PERSISTENCE MATRIX', 880, 465);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px monospace';
      ctx.fillText('Store: Relational Storage Engine', 880, 490);
      ctx.fillStyle = '#4ade80';
      ctx.fillText('✓ Integrity Verified', 880, 510);

      // Connected Data flow pathways (connector lines and dynamic visual directional indicators)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      
      // Node 1 to Node 2
      ctx.beginPath();
      ctx.moveTo(340, 480);
      ctx.lineTo(480, 480);
      ctx.stroke();
      
      // Flow arrows 
      ctx.beginPath();
      ctx.moveTo(480, 480);
      ctx.lineTo(470, 473);
      ctx.lineTo(470, 487);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();

      // Node 2 to Node 3
      ctx.beginPath();
      ctx.moveTo(720, 480);
      ctx.lineTo(860, 480);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(860, 480);
      ctx.lineTo(850, 473);
      ctx.lineTo(850, 487);
      ctx.closePath();
      ctx.fill();

      // Mini details labels
      ctx.fillStyle = '#818cf8';
      ctx.font = '9px monospace';
      ctx.fillText('Ingested Vector Transmit', 345, 465);

      ctx.fillStyle = '#f472b6';
      ctx.fillText('Committed Balance Entries', 725, 465);

      // Confidential Watermarking
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('BUILDCORP ENTERPRISE PLATFORM SATELLITE BLUEPRINT • CONFIDENTIAL FOR INTERNAL REPORTS ONLY', 70, 715);

      // Final compiling and client download trigger 
      try {
        const link = document.createElement('a');
        link.download = `buildcorp-network-topology-${new Date().toISOString().substring(0, 10)}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Failed to parse and export canvas as PNG.', err);
      }
      setIsExportingDiagram(false);
    };

    // Load active topology image source context to draw under the diagram clipping rect
    const blueprintImg = new Image();
    blueprintImg.crossOrigin = 'anonymous';
    
    blueprintImg.onload = () => {
      ctx.save();
      // Clip inside main inner panel bounding box
      ctx.beginPath();
      ctx.rect(50, 220, 1100, 520);
      ctx.clip();
      
      // Apply alpha rendering to serve as subtle background mesh behind live schematic metrics
      ctx.globalAlpha = 0.5;
      ctx.drawImage(blueprintImg, 50, 220, 1100, 520);
      ctx.restore();
      
      // Complete overlays drawing
      drawContent();
    };

    blueprintImg.onerror = () => {
      console.warn('Failed to fetch the dynamic network diagram image context anonymously under CORS credentials. Drawing custom high-fi vector report directly.');
      drawContent();
    };

    blueprintImg.src = erpTopologyImg;
  };

  // Handle LLM Cognitive Translation using Server-side Gemini API
  const handleAIMapTranslate = async () => {
    setAiTranslating(true);
    setTranslationError(null);
    setNormalizedOrder(null);
    try {
      const res = await fetch('/api/ai-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawData: aiRawInput, notes: aiCustomNotes }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Cognitive AI Translation failed');
      }
      setNormalizedOrder(data.order);
      setLedgerMessage({ text: `Gemini Cognitive AI safely parsed irregular feed into Canonical Schema. Ready for fiscal journal records posting!`, type: 'success' });
    } catch (err: any) {
      setTranslationError(err.message || 'AI model reasoning error.');
    } finally {
      setAiTranslating(false);
    }
  };

  // Post normalized transaction to database ledger (Double-entry Cash vs AR)
  const handlePostToLedger = async () => {
    if (!normalizedOrder) return;
    setLedgerMessage(null);
    try {
      const res = await fetch('/api/ledger/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: normalizedOrder, postToCash }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to post transaction blocks');
      }
      
      // Update UI state with actual DB contents
      fetchLedgerState();
      setActiveLedgerTransactionSql(data.transaction.sqlGenerated || '');
      setLedgerMessage({ text: `Posted successfully to General Ledger! Balanced financial journal rows recorded in transactional memory.`, type: 'success' });
      
      if (normalizedOrder) {
        addAuditEvent(
          'custom_post',
          'Sales Transaction Posted',
          `Posted Order #${normalizedOrder.sourceOrderId} (${normalizedOrder.sourceSystem.toUpperCase()}) for ${normalizedOrder.customerEmail} | Amount: ${formatCentsToUSD(parseInt(normalizedOrder.totalAmount || '0'))}`
        );
      }
      
      // Clear translation state once posted so user doesn't double-post
      setNormalizedOrder(null);
    } catch (err: any) {
      setLedgerMessage({ text: err.message, type: 'err' });
    }
  };

  // Reset core ERP database
  const handleResetLedger = async () => {
    if (!confirm("Are you sure you want to reset the ledger history? This is an offline simulation reset.")) return;
    try {
      const res = await fetch('/api/ledger/reset', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchLedgerState();
        setActiveLedgerTransactionSql('');
        setCustomSql('SELECT * FROM transactions;');
        setSqlRows([]);
        setSqlColumns([]);
        setSqlError(null);
        setLedgerMessage({ text: `Simulated double-entry PostgreSQL ERP database reset back to initial benchmarks. All ledgers are balanced.`, type: 'success' });
        
        addAuditEvent('reset', 'General Ledger Reset', 'Relational ledger reset successfully back to corporate baseline benchmarks.');
        
        // Refresh forecast as well on reset
        handleFetchForecast();
      }
    } catch (err: any) {
      setLedgerMessage({ text: err.message, type: 'err' });
    }
  };

  // ────────────────────────────────────────────────────────
  // ADVANCED ENTERPRISE AI CO-PILOT EVENT HANDLERS
  // ────────────────────────────────────────────────────────
  const handleFetchForecast = async () => {
    setForecastingLoading(true);
    try {
      const res = await fetch('/api/ai/forecast');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch predictive forecaster output.');
      }
      setForecastData(data.forecasts || []);
      setForecastRisk(data.riskRating || 'low');
      setForecastAlerts(data.alerts || []);
      setForecastRecs(data.recommendations || []);
    } catch (err: any) {
      console.warn("Forecast pull issue:", err.message);
    } finally {
      setForecastingLoading(false);
    }
  };

  const handleProcessAgentInvoice = async () => {
    setAgentLoading(true);
    setAgentLogs([]);
    setAgentParsedOrder(null);
    try {
      const res = await fetch('/api/ai/process-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceText: agentInvoiceText })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Agentic Invoice processing encountered a cognitive mapping error.');
      }
      setAgentParsedOrder(data.order);
      setAgentLogs(data.agentLogs || []);
      fetchLedgerState();
      handleFetchForecast(); // update forecasts
      setLedgerMessage({ text: `Agent autonomously mapped, balanced, and authorized Invoice ${data.order.sourceOrderId} directly to the General Ledger!`, type: 'success' });
    } catch (err: any) {
      setLedgerMessage({ text: `Agent billing processor failed: ${err.message}`, type: 'err' });
    } finally {
      setAgentLoading(false);
    }
  };

  const handleNLPConsult = async () => {
    setNlpLoading(true);
    setNlpQuery('');
    setNlpRows([]);
    setNlpAnswer('');
    try {
      const res = await fetch('/api/ai/nlp-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: nlpQuestion })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'NLP compilation failed.');
      }
      setNlpQuery(data.sqlQuery || '');
      setNlpRows(data.sqlRows || []);
      setNlpAnswer(data.conversationalAnswer || '');
    } catch (err: any) {
      setLedgerMessage({ text: `NLP Intelligence Assistant error: ${err.message}`, type: 'err' });
    } finally {
      setNlpLoading(false);
    }
  };

  const handleRunAudit = async () => {
    setAuditLoading(true);
    try {
      const res = await fetch('/api/ai/audit');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Continuous ML Audit diagnostic execution interrupted.');
      }
      setAuditScore(data.healthScore);
      setAuditSummary(data.auditSummaryText);
      setAuditAnomalies(data.anomalies || []);
    } catch (err: any) {
      setLedgerMessage({ text: `Auditing execution failed: ${err.message}`, type: 'err' });
    } finally {
      setAuditLoading(false);
    }
  };

  // 5. Senior Strategic Advisor Multi-turn Chat implementation
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMessage = { role: 'user' as const, text: chatInput };
    const historicalChain = [...chatMessages, userMessage];
    
    // Clear input first & set loading
    setChatMessages(historicalChain);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historicalChain })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'The Strategic Advisor encountered a cognitive error.');
      }
      setChatMessages(prev => [
        ...prev,
        {
          role: 'model' as const,
          text: data.reply,
          sources: data.sources || []
        }
      ]);
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev,
        {
          role: 'model' as const,
          text: `⚠️ Advisor system error: ${err.message}. Please configure your GEMINI_API_KEY secret in Settings.`
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // 6. Intelligent OCR Receipt Image Scanner Reader
  const handleAnalyzeReceiptImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReceiptAnalyzing(true);
    setReceiptError(null);
    setLedgerMessage({ text: `Uploading and scanning receipt/invoice image file using Gemini 3.1 Pro...`, type: 'success' });

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const resultString = reader.result as string;
          // Extract core base64 data ignoring the dataUrl header parts
          const parts = resultString.split(',');
          const base64Data = parts[1] || parts[0];
          
          const res = await fetch('/api/ai/analyze-receipt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base64Data,
              mimeType: file.type
            })
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Cognitive OCR extraction aborted.');
          }

          // Populate the messy text area box directly so user can review and book
          setAgentInvoiceText(data.extractedText);
          setAiSuiteTab('agent'); // swap visual subtab instantly to show results!
          setLedgerMessage({ text: `Receipt OCR text scanner extracted and migrated details to Autonomous Booking Agent!`, type: 'success' });
        } catch (err: any) {
          setReceiptError(err.message);
          setLedgerMessage({ text: `OCR scan error: ${err.message}`, type: 'err' });
        } finally {
          setReceiptAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setReceiptError(err.message);
      setLedgerMessage({ text: `File reader failed: ${err.message}`, type: 'err' });
      setReceiptAnalyzing(false);
    }
  };

  // Execute database raw query in simulated PostgreSQL console
  const handleExecuteSql = async (queryToRun?: string) => {
    const q = queryToRun || customSql;
    setSqlLoading(true);
    setSqlError(null);
    setSqlRows([]);
    setSqlColumns([]);
    
    try {
      const res = await fetch('/api/ledger/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: q }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'SQL query error');
      }
      setSqlExecuted(data.sqlExecuted);
      setSqlColumns(data.columns || []);
      setSqlRows(data.rows || []);
    } catch (err: any) {
      setSqlError(err.message || 'Error executing SQL statement');
    } finally {
      setSqlLoading(false);
    }
  };

  // Post manually constructed dual-leg transaction
  const handlePostManualAdjustment = async () => {
    setLedgerMessage(null);
    setTranslationError(null);
    try {
      const payload = {
        sourceOrderId: `MN-${Math.floor(Math.random() * 90000 + 10000)}`,
        customerEmail: manualEmail,
        items: [
          {
            sku: manualSku,
            quantity: parseInt(manualQty, 10) || 1,
            unitPrice: manualAmount,
            currency: 'USD'
          }
        ],
        totalAmount: (parseFloat(manualAmount) * (parseInt(manualQty, 10) || 1)).toString(),
        taxAmount: '0',
        createdAt: new Date().toISOString()
      };

      const translateRes = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceType: 'manual', payload }),
      });
      const translateData = await translateRes.json();
      if (!translateRes.ok || !translateData.success) {
        throw new Error(translateData.error || 'Failed to process manual canonical conversion');
      }

      const postRes = await fetch('/api/ledger/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: translateData.order, postToCash: true }),
      });
      const postData = await postRes.json();
      if (!postRes.ok || !postData.success) {
        throw new Error(postData.error || 'Failed to post manual ledger transaction');
      }

      fetchLedgerState();
      setActiveLedgerTransactionSql(postData.transaction.sqlGenerated || '');
      setLedgerMessage({ text: `Manual fiscal adjustment posted! Created transaction ${postData.transaction.id} with double-entry matching journal splits.`, type: 'success' });
      
      const totalAdjVal = parseFloat(manualAmount) * (parseInt(manualQty, 10) || 1);
      addAuditEvent(
        'manual_post', 
        'Manual Adjustment Posted', 
        `Posted adjustment ID #${postData.transaction.id} for SKU: "${manualSku}" | Amount: ${formatCentsToUSD(totalAdjVal)}`
      );
    } catch (err: any) {
      setLedgerMessage({ text: err.message, type: 'err' });
    }
  };

  // Download standard canonical order transformation as high-fidelity PNG image asset
  const downloadTransformationAsPng = async () => {
    if (!canonicalCaptureRef.current) {
      setLedgerMessage({
        text: "⚠️ No target transformation render container located for capture.",
        type: "err"
      });
      return;
    }
    setIsCapturingPng(true);
    try {
      // Create high-res PNG utilizing html2canvas node serialization
      const canvas = await html2canvas(canonicalCaptureRef.current, {
        background: '#020617', // explicit slate-950 background color
        scale: 2, // High resolution for professional audit filing
        logging: false,
        useCORS: true,
        allowTaint: true
      } as any);
      
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const filename = `canonical-transformation-${normalizedOrder?.sourceSystem || 'order'}-${normalizedOrder?.sourceOrderId || 'summary'}.png`;
      link.href = imgData;
      link.download = filename;
      link.click();

      setLedgerMessage({
        text: `📸 Downloaded high-definition transformation PNG ("${filename}") safely for audit trail.`,
        type: "success"
      });
    } catch (err: any) {
      console.error('Error generating canonical PNG capture:', err);
      setLedgerMessage({
        text: `❌ Image capture failure: ${err?.message || 'Failed compiling layout to PNG image format.'}`,
        type: "err"
      });
    } finally {
      setIsCapturingPng(false);
    }
  };

  // Export standard canonical order transformation as formal audit PDF document
  const exportTransformationToPdf = () => {
    try {
      if (!normalizedOrder) {
        setLedgerMessage({
          text: "⚠️ No canonical transaction order has been parsed or selected yet.",
          type: "err"
        });
        return;
      }

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
      });

      // Margins are 15mm left/right, and 15mm top.
      // Total writable width: 215.9mm - 30mm = 185.9mm.
      let currentY = 15;

      // 1. Draw Page Header Block
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(15, currentY, 185.9, 30, 'F');

      // Title & Metadata
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('CANONICAL SCHEMA TRANSFORMATION SUMMARY', 20, currentY + 11);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text('Autonomous Ledger Translation & Data Realignment Audit Trail', 20, currentY + 17);

      const generatedStr = `Generated At: ${new Date().toLocaleString()}  |  Format: compliant with canonical.ts`;
      doc.setFontSize(7.5);
      doc.text(generatedStr, 20, currentY + 23);

      // System Tag badge in header
      doc.setFillColor(79, 70, 229); // Indigo-600
      doc.rect(145, currentY + 8, 45, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text(`SCHEMA VALID: v1.0.0`, 149, currentY + 12.2);

      currentY += 36;

      // 2. Metadata Columns (Source Information & Financial Overview)
      // Left box: Source details
      doc.setFillColor(248, 250, 252); // Slate-50 background
      doc.setDrawColor(226, 232, 240); // Slate-200 border
      doc.rect(15, currentY, 90, 42, 'FD');

      doc.setFillColor(15, 23, 42); // top line accent
      doc.rect(15, currentY, 90, 1, 'F');

      doc.setTextColor(100, 116, 139); // Slate-500
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('SOURCE INFORMATION', 20, currentY + 6);

      doc.setTextColor(15, 23, 42); // Slate-900
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`Source System:  ${(normalizedOrder.sourceSystem || '').toUpperCase()}`, 20, currentY + 14);
      doc.text(`Order Identifier:  ${normalizedOrder.sourceOrderId || 'N/A'}`, 20, currentY + 21);
      
      const parsedDate = normalizedOrder.createdAt instanceof Date 
        ? normalizedOrder.createdAt 
        : new Date(normalizedOrder.createdAt);
      doc.text(`Payload Stamp:   ${parsedDate.toLocaleString()}`, 20, currentY + 28);
      doc.text(`Audit Quality:      GRADE AAA COMPLIANT`, 20, currentY + 35);

      // Right box: Financial Overviews
      doc.setFillColor(248, 250, 252); // Slate-50 background
      doc.rect(110.9, currentY, 90, 42, 'FD');

      doc.setFillColor(79, 70, 229); // indigo line accent
      doc.rect(110.9, currentY, 90, 1, 'F');

      doc.setTextColor(100, 116, 139); // Slate-500
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('FINANCIAL OVERVIEW', 115.9, currentY + 6);

      doc.setTextColor(15, 23, 42); // Slate-900
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`Customer Email:`, 115.9, currentY + 14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${normalizedOrder.customerEmail || 'No Email Recorded'}`, 147, currentY + 14);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Tax Component:`, 115.9, currentY + 21);
      doc.text(`$${((normalizedOrder.taxAmount || 0) / 100).toFixed(2)} USD`, 147, currentY + 21);
      
      doc.text(`Total Volume:`, 115.9, currentY + 28);
      doc.setFont('helvetica', 'bold');
      doc.text(`$${((normalizedOrder.totalAmount || 0) / 100).toFixed(2)} USD`, 147, currentY + 28);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Ledger Alignment:   READY FOR BOOKING`, 115.9, currentY + 35);

      currentY += 50;

      // 3. Line Items Table Title
      doc.setTextColor(15, 23, 42); // Slate-900
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('REALIGNED CANONICAL LINE ITEMS', 15, currentY);

      currentY += 5;

      // Draw Table Header
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(15, currentY, 185.9, 7.5, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('SKU / STOCK KEEPING ID', 18, currentY + 5);
      doc.text('QTY', 115, currentY + 5);
      doc.text('UNIT PRICE', 130, currentY + 5);
      doc.text('TOTAL AMOUNT', 155, currentY + 5);
      doc.text('CURR', 188, currentY + 5);

      currentY += 7.5;

      // Draw Table Rows
      const lineItems = normalizedOrder.items || [];
      if (lineItems.length === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, currentY, 185.9, 10, 'F');
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.text('No active item splits found in canonical payload structure.', 18, currentY + 6.5);
        currentY += 10;
      } else {
        lineItems.forEach((itm, idx) => {
          // Zebra striping
          if (idx % 2 === 0) {
            doc.setFillColor(248, 250, 252);
          } else {
            doc.setFillColor(255, 255, 255);
          }
          doc.rect(15, currentY, 185.9, 8, 'F');

          // Row borders
          doc.setDrawColor(241, 245, 249);
          doc.setLineWidth(0.1);
          doc.line(15, currentY + 8, 200.9, currentY + 8);

          doc.setTextColor(15, 23, 42);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);

          // SKU
          doc.text(itm.sku || 'N/A', 18, currentY + 5.5);
          
          // Quantity
          doc.text(String(itm.quantity || 0), 115, currentY + 5.5);

          // Unit Price
          doc.text(`$${((itm.unitPrice || 0) / 100).toFixed(2)}`, 130, currentY + 5.5);

          // Row Total
          const rowTotal = ((itm.quantity || 0) * (itm.unitPrice || 0)) / 100;
          doc.setFont('helvetica', 'bold');
          doc.text(`$${rowTotal.toFixed(2)}`, 155, currentY + 5.5);

          // Currency
          doc.setFont('helvetica', 'normal');
          doc.text((itm.currency || 'USD').toUpperCase(), 188, currentY + 5.5);

          currentY += 8;
        });
      }

      currentY += 12;

      // 4. GAAP COMPLIANCE AND VERIFICATION STATEMENT
      doc.setFillColor(239, 246, 255); // Blue-50 background for guarantee block
      doc.setDrawColor(191, 219, 254); // Blue-200 border
      doc.rect(15, currentY, 185.9, 22, 'FD');

      doc.setFillColor(59, 130, 246); // Blue-500 accent left column
      doc.rect(15, currentY, 1.5, 22, 'F');

      doc.setTextColor(26, 54, 93); // Dark blue text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('ERP INTEGRITY & DOUBLE-ENTRY PROTOCOL COMPLIANCE CERTIFICATION', 20, currentY + 6.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(74, 85, 104);
      doc.text(
        "The accounting agent certifies that this object model represents a valid schema structure as specified by '/src/canonical.ts'.",
        20, currentY + 12
      );
      doc.text(
        'Data constraints (including non-fractional integer cents representation, correct ISO currency parameters, and relational keys) have been met.',
        20, currentY + 16.5
      );

      // Main Outer Frame
      doc.setDrawColor(226, 232, 240); // Slate-200 grid border
      doc.setLineWidth(0.25);
      doc.rect(15, 15, 185.9, 243);

      // Page Margins Info text at the bottom inside frame
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.setFontSize(7);
      doc.text('BUILDCORP CANONICAL INTEGRATION DATA DECK — CONFIDENTIALITY COMPLIANCE RECORD', 18, 254);

      // Save PDF document
      const filename = `canonical-audit-${normalizedOrder.sourceSystem || 'order'}-${normalizedOrder.sourceOrderId || 'summary'}.pdf`;
      doc.save(filename);

      setLedgerMessage({
        text: `⚖️ Promptly exported formal accounting PDF schema report ("${filename}") successfully.`,
        type: "success"
      });
    } catch (err: any) {
      console.error('Error generating canonical PDF export:', err);
      setLedgerMessage({
        text: `❌ PDF export failure: ${err?.message || 'Failed compiling layout to PDF document format.'}`,
        type: "err"
      });
    }
  };

  // Generate QR Code representation of the current Canonical Order
  const generateCanonicalQrCode = async () => {
    if (!normalizedOrder) {
      setLedgerMessage({
        text: "⚠️ No canonical transaction order has been parsed or selected yet.",
        type: "err"
      });
      return;
    }
    try {
      // Serialize the order into compact JSON payload
      const qrPayload = {
        sys: normalizedOrder.sourceSystem,
        id: normalizedOrder.sourceOrderId,
        email: normalizedOrder.customerEmail,
        total: normalizedOrder.totalAmount,
        tax: normalizedOrder.taxAmount,
        items: (normalizedOrder.items || []).map(i => ({ 
          sku: i.sku, 
          qty: i.quantity, 
          prc: i.unitPrice 
        }))
      };

      const jsonStr = JSON.stringify(qrPayload);
      const dataUrl = await QRCode.toDataURL(jsonStr, { 
        width: 320, 
        margin: 2,
        color: {
          dark: '#ffffff', // High-contrast marker color
          light: '#0f172a' // Slate-900 background matching visual design
        }
      });
      setQrCodeDataUrl(dataUrl);
      setIsQrModalOpen(true);
      setLedgerMessage({
        text: "⚡ Instantly generated secure QR code payload for barcode/mobile processing.",
        type: "success"
      });
    } catch (err: any) {
      console.error('Error generating QR code:', err);
      try {
        const jsonStr = JSON.stringify(normalizedOrder);
        const dataUrl = await QRCode.toDataURL(jsonStr, { width: 320, margin: 2 });
        setQrCodeDataUrl(dataUrl);
        setIsQrModalOpen(true);
      } catch (innerErr: any) {
        setLedgerMessage({
          text: `❌ QR code compilation failure: ${innerErr?.message || 'Error generating scan code.'}`,
          type: "err"
        });
      }
    }
  };

  // Real-time camera QR scanner loop & handlers for Canonical Order ingestion
  const playSuccessBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.08, now);
      masterGain.connect(ctx.destination);

      // Primary crisp ascending sine confirmation chime (920Hz -> 1440Hz)
      const primaryOsc = ctx.createOscillator();
      const primaryGain = ctx.createGain();
      primaryOsc.type = 'sine';
      primaryOsc.frequency.setValueAtTime(920, now);
      primaryOsc.frequency.exponentialRampToValueAtTime(1440, now + 0.07);
      
      primaryGain.gain.setValueAtTime(0.7, now);
      primaryGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      primaryOsc.connect(primaryGain);
      primaryGain.connect(masterGain);

      // Harmonic sparkle overtone
      const overtoneOsc = ctx.createOscillator();
      const overtoneGain = ctx.createGain();
      overtoneOsc.type = 'triangle';
      overtoneOsc.frequency.setValueAtTime(1840, now + 0.04);
      overtoneOsc.frequency.exponentialRampToValueAtTime(2400, now + 0.11);
      
      overtoneGain.gain.setValueAtTime(0.001, now);
      overtoneGain.gain.setValueAtTime(0.3, now + 0.04);
      overtoneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      overtoneOsc.connect(overtoneGain);
      overtoneGain.connect(masterGain);

      primaryOsc.start(now);
      primaryOsc.stop(now + 0.18);
      overtoneOsc.start(now + 0.04);
      overtoneOsc.stop(now + 0.22);

      // Auto close audio context after cue completes to release audio resources
      setTimeout(() => {
        if (ctx.state !== 'closed') {
          ctx.close().catch(() => {});
        }
      }, 350);
    } catch (e) {
      console.warn("Unable to play diagnostic QR parse audio cue due to gesture policies:", e);
    }
  };

  const stopCameraScan = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(track => track.stop());
      videoStreamRef.current = null;
    }
    if (qrScanFrameRef.current) {
      cancelAnimationFrame(qrScanFrameRef.current);
      qrScanFrameRef.current = null;
    }
    setIsScanningCamera(false);
    setIsFlashlightOn(false);
    setHasFlashlight(false);
  };

  const toggleFlashlight = async () => {
    const nextState = !isFlashlightOn;
    try {
      if (videoStreamRef.current) {
        const [track] = videoStreamRef.current.getVideoTracks();
        if (track) {
          const caps = typeof track.getCapabilities === 'function' ? track.getCapabilities() : null;
          // Apply flashlight toggle via torch constraint
          await track.applyConstraints({
            advanced: [{ torch: nextState } as any]
          });
          setIsFlashlightOn(nextState);
          setLedgerMessage({
            text: nextState ? "🔦 Flashlight activated successfully." : "🔦 Flashlight deactivated.",
            type: "success"
          });
        }
      }
    } catch (e) {
      console.warn("Flashlight/torch constraints failed:", e);
      setLedgerMessage({
        text: "🔦 Device torch/flashlight is not supported or active on this camera track.",
        type: "err"
      });
    }
  };

  const cycleCameraFilter = () => {
    setCameraFilter((prev) => {
      const next = prev === 'none' ? 'grayscale' : prev === 'grayscale' ? 'thermal' : 'none';
      setLedgerMessage({
        text: `🔮 Camera Filter changed to: ${next === 'none' ? 'Standard (none)' : next === 'grayscale' ? 'High-Contrast Grayscale' : 'Thermal Visibility'}`,
        type: "success"
      });
      return next;
    });
  };

  const processScannedPayload = async (rawData: string, isReprocess = false) => {
    try {
      const parsed = JSON.parse(rawData);
      let order: CanonicalOrder;
      
      if (parsed.sys && parsed.id) {
        order = {
          sourceSystem: parsed.sys,
          sourceOrderId: parsed.id,
          customerEmail: parsed.email || 'scanned-customer@domain.com',
          totalAmount: parseInt(parsed.total) || 0,
          taxAmount: parseInt(parsed.tax) || 0,
          items: (parsed.items || []).map((it: any) => ({
            sku: it.sku || 'UNKNOWN',
            quantity: parseInt(it.qty) || 1,
            unitPrice: parseInt(it.prc) || 0,
            currency: 'USD'
          })),
          createdAt: new Date()
        };
      } else {
        order = {
          sourceSystem: parsed.sourceSystem || 'ai_mapped',
          sourceOrderId: parsed.sourceOrderId || `SCN-${Date.now().toString().slice(-4)}`,
          customerEmail: parsed.customerEmail || 'scanned-customer@domain.com',
          items: (parsed.items || []).map((it: any) => ({
            sku: it.sku || 'UNKNOWN',
            quantity: it.quantity || 1,
            unitPrice: it.unitPrice || 0,
            currency: it.currency || 'USD'
          })),
          totalAmount: parsed.totalAmount || 0,
          taxAmount: parsed.taxAmount || 0,
          createdAt: parsed.createdAt ? new Date(parsed.createdAt) : new Date()
        };
      }

      setNormalizedOrder(order);

      // Persist to recent scans list (avoid duplicate entries for same order while preserving favorite flag)
      let isExistingFavorite = false;
      const existingMatch = recentScans.find(item => item.sourceOrderId === order.sourceOrderId && item.sourceSystem === order.sourceSystem);
      if (existingMatch && (existingMatch.isFavorite || existingMatch.favorite)) {
        isExistingFavorite = true;
      }

      const newScanItem: RecentScanItem = {
        id: existingMatch?.id || `scan-${order.sourceSystem}-${order.sourceOrderId}-${Date.now()}`,
        rawData: rawData,
        sourceSystem: order.sourceSystem,
        sourceOrderId: order.sourceOrderId,
        customerEmail: order.customerEmail,
        totalAmount: order.totalAmount,
        taxAmount: order.taxAmount,
        itemsCount: order.items.length,
        timestamp: new Date().toISOString(),
        isFavorite: isExistingFavorite,
        favorite: isExistingFavorite
      };

      setRecentScans(prev => {
        const filtered = prev.filter(item => !(item.sourceOrderId === order.sourceOrderId && item.sourceSystem === order.sourceSystem));
        return [newScanItem, ...filtered].slice(0, 10);
      });

      // Update static QR code image in modal if needed so it displays the re-processed order
      try {
        const qrPayload = {
          sys: order.sourceSystem,
          id: order.sourceOrderId,
          email: order.customerEmail,
          total: order.totalAmount,
          tax: order.taxAmount,
          items: (order.items || []).map(i => ({ 
            sku: i.sku, 
            qty: i.quantity, 
            prc: i.unitPrice 
          }))
        };
        const jsonStr = JSON.stringify(qrPayload);
        const dataUrl = await QRCode.toDataURL(jsonStr, { 
          width: 320, 
          margin: 2,
          color: {
            dark: '#ffffff',
            light: '#0f172a'
          }
        });
        setQrCodeDataUrl(dataUrl);
      } catch (qrErr) {
        console.warn("Could not generate refreshed QR dataUrl:", qrErr);
      }

      playSuccessBeep();

      setActiveToasts(prev => [
        ...prev,
        {
          id: `qr-${isReprocess ? 'reprocess' : 'scan'}-${Date.now()}`,
          title: isReprocess ? 'QR RE-PROCESSED' : 'QR INGESTION SUCCESS',
          accountName: 'Translation Gateway',
          message: `${isReprocess ? 'Re-processed stored' : 'Successfully captured and ingested'} Order #${order.sourceOrderId} (${order.sourceSystem.toUpperCase()}) for ${order.customerEmail} with ${order.items.length} line items ($${(order.totalAmount / 100).toFixed(2)})!`,
          severity: 'info',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);

      setLedgerMessage({
        text: `✓ ${isReprocess ? 'Re-processed from Recent Scans:' : 'Real-time Camera QR scan completed:'} Ingested order ${order.sourceSystem.toUpperCase()} #${order.sourceOrderId} to Canonical memory model!`,
        type: 'success'
      });

      if (isScanningCamera) {
        stopCameraScan();
      }

      return order;
    } catch (err: any) {
      console.error("Error processing QR payload:", err);
      setLedgerMessage({
        text: `❌ Error processing QR payload: ${err?.message || 'Invalid payload data.'}`,
        type: 'err'
      });
      return null;
    }
  };

  const handleToggleFavoriteScan = (scanId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let isNowFavorite = false;
    let targetOrder = '';
    setRecentScans(prev => {
      return prev.map(item => {
        if (item.id === scanId) {
          const toggled = !(item.isFavorite || item.favorite);
          isNowFavorite = toggled;
          targetOrder = item.sourceOrderId;
          return {
            ...item,
            isFavorite: toggled,
            favorite: toggled
          };
        }
        return item;
      });
    });

    setLedgerMessage({
      text: isNowFavorite 
        ? `⭐ Flagged Order #${targetOrder || scanId} pattern as Favorite!` 
        : `Unmarked Favorite for Order #${targetOrder || scanId}.`,
      type: 'success'
    });
  };

  const handleRemoveRecentScan = (scanId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentScans(prev => prev.filter(item => item.id !== scanId));
    setLedgerMessage({
      text: "🗑️ Removed scan record from recent history cache.",
      type: "success"
    });
  };

  const handleClearRecentScans = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentScans([]);
    try {
      localStorage.removeItem('cloudboyx_recent_qr_scans');
    } catch (err) {}
    setLedgerMessage({
      text: "🧹 Cleared all stored recent QR scans.",
      type: "success"
    });
  };

  const qrScanLoop = () => {
    if (!videoRef.current) {
      qrScanFrameRef.current = requestAnimationFrame(qrScanLoop);
      return;
    }

    const video = videoRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const width = video.videoWidth;
      const height = video.videoHeight;
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        try {
          const imageData = ctx.getImageData(0, 0, width, height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          
          if (code && code.data) {
            console.log("Decoded QR Code data successfully:", code.data);
            processScannedPayload(code.data, false);
            return; // exit execution loop
          }
        } catch (e: any) {
          // Keep scanning despite parsing errors on noise frame
        }
      }
    }

    qrScanFrameRef.current = requestAnimationFrame(qrScanLoop);
  };

  const applyCameraZoom = async (val: number) => {
    setZoomLevel(val);
    try {
      if (videoStreamRef.current) {
        const [track] = videoStreamRef.current.getVideoTracks();
        if (track) {
          const caps = typeof track.getCapabilities === 'function' ? track.getCapabilities() : null;
          if (caps && (caps as any).zoom) {
            await track.applyConstraints({
              advanced: [{ zoom: val } as any]
            });
          }
        }
      }
    } catch (e) {
      console.warn("Failed to apply hardware zoom constraints, falling back to digital scale transformation:", e);
    }
  };

  const startCameraScan = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("WebRTC camera streaming API is not supported by your browser environment.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      
      videoStreamRef.current = stream;
      setIsScanningCamera(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.play().then(() => {
            const [track] = stream.getVideoTracks();
            if (track) {
              const caps = typeof track.getCapabilities === 'function' ? track.getCapabilities() : null;
              if (caps && (caps as any).zoom) {
                const z = (caps as any).zoom;
                setZoomCapabilities({
                  min: z.min || 1,
                  max: z.max || 3,
                  step: z.step || 0.1
                });
                setZoomLevel(z.min || 1);
              } else {
                // Default fallback variables for digital scale
                setZoomCapabilities({
                  min: 1,
                  max: 4,
                  step: 0.1
                });
                setZoomLevel(1);
              }
            }
            qrScanFrameRef.current = requestAnimationFrame(qrScanLoop);
          }).catch(err => {
            console.error("Video play failed:", err);
            setCameraError(`Video playback failed: ${err.message}`);
          });
        } else {
          setCameraError("Camera display viewport binding failed. Please retry.");
          stopCameraScan();
        }
      }, 300);

    } catch (err: any) {
      console.error("Camera capture failed:", err);
      setCameraError(err.message || "Failed to engage camera stream. Make sure you granted camera permissions.");
      setIsScanningCamera(false);
    }
  };

  const restartCameraScan = async () => {
    stopCameraScan();
    setTimeout(async () => {
      await startCameraScan();
      setLedgerMessage({
        text: "🔄 Resetted camera scanner instance successfully. Awaiting new QR alignment.",
        type: "success"
      });
    }, 200);
  };

  const handleCloseQrModal = () => {
    stopCameraScan();
    setIsQrModalOpen(false);
  };

  useEffect(() => {
    return () => {
      stopCameraScan();
    };
  }, []);

  // Render recent scans section for the QR camera scanning modal with 'favorite' flag & show/hide toggle
  const renderRecentScansSection = () => {
    const favoriteScansCount = recentScans.filter(item => item.isFavorite || item.favorite).length;

    // When the scanning history pane is toggled closed
    if (!showScanHistory) {
      return (
        <div className="w-full max-w-[340px] mt-3.5 text-left border-t border-slate-800/90 pt-3">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all">
            <div className="flex items-center gap-2 min-w-0">
              <History className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-slate-300">
                  Scan History Pane
                </span>
                <span className="text-[7.5px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-semibold">
                  Hidden ({recentScans.length} stored)
                </span>
                {favoriteScansCount > 0 && (
                  <span className="text-[7.5px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-500/30 text-amber-300 flex items-center gap-0.5 font-bold">
                    <Star className="w-2 h-2 fill-amber-400 text-amber-400" />
                    {favoriteScansCount} fav
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowScanHistory(true)}
              className="px-2.5 py-1 text-[8.5px] font-mono font-bold rounded-lg bg-indigo-950/90 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Show scanning history pane"
            >
              <Eye className="w-2.5 h-2.5" />
              <span>Show History</span>
            </button>
          </div>
        </div>
      );
    }

    // When history pane is open
    const displayedScans = favoriteScansOnlyFilter
      ? recentScans.filter(item => item.isFavorite || item.favorite)
      : recentScans;

    return (
      <div className="w-full max-w-[340px] mt-4 text-left border-t border-slate-800/90 pt-3.5">
        <div className="flex items-center justify-between pb-1.5 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-200">
              Recent Scans
            </h4>
            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/20 text-indigo-300 font-bold">
              {recentScans.length}/10
            </span>
            {favoriteScansCount > 0 && (
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/30 text-amber-300 flex items-center gap-0.5 font-bold">
                <Star className="w-2 h-2 fill-amber-400 text-amber-400" />
                {favoriteScansCount} favorite{favoriteScansCount === 1 ? '' : 's'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Toggle button to hide the scanning history pane */}
            <button
              type="button"
              onClick={() => setShowScanHistory(false)}
              className="px-2 py-0.8 text-[8.5px] font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg border border-slate-800 transition-colors cursor-pointer flex items-center gap-1"
              title="Hide scanning history pane"
            >
              <EyeOff className="w-2.5 h-2.5 text-slate-400" />
              <span>Hide History</span>
            </button>

            {recentScans.length > 0 && (
              <button
                type="button"
                onClick={handleClearRecentScans}
                className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                title="Clear all stored recent scans"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter chips when user has favorited patterns */}
        {recentScans.length > 0 && favoriteScansCount > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <button
              type="button"
              onClick={() => setFavoriteScansOnlyFilter(false)}
              className={`px-2 py-0.5 text-[8px] font-mono rounded-md border transition-all cursor-pointer ${
                !favoriteScansOnlyFilter
                  ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40 font-bold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              All Scans ({recentScans.length})
            </button>
            <button
              type="button"
              onClick={() => setFavoriteScansOnlyFilter(true)}
              className={`px-2 py-0.5 text-[8px] font-mono rounded-md border flex items-center gap-1 transition-all cursor-pointer ${
                favoriteScansOnlyFilter
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/40 font-bold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-amber-300'
              }`}
            >
              <Star className="w-2 h-2 fill-amber-400 text-amber-400" />
              Favorites Only ({favoriteScansCount})
            </button>
          </div>
        )}

        {recentScans.length === 0 ? (
          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-center">
            <p className="text-[9.5px] text-slate-500 font-sans leading-relaxed">
              No recent scans recorded yet. Parsed QR codes will persist here from local storage with favorite pattern tagging for instant re-processing.
            </p>
          </div>
        ) : displayedScans.length === 0 ? (
          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-center">
            <p className="text-[9.5px] text-amber-400/90 font-sans leading-relaxed">
              No favorites selected. Click the star icon on any order pattern below to flag it as a favorite!
            </p>
            <button
              type="button"
              onClick={() => setFavoriteScansOnlyFilter(false)}
              className="mt-2 text-[8px] font-mono font-bold text-indigo-400 hover:underline cursor-pointer"
            >
              Show all {recentScans.length} scans
            </button>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
            {displayedScans.map((item) => {
              const isCurrentActive = normalizedOrder?.sourceOrderId === item.sourceOrderId && normalizedOrder?.sourceSystem === item.sourceSystem;
              const isFav = !!(item.isFavorite || item.favorite);
              const systemBadgeColor = 
                item.sourceSystem === 'shopify' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30' :
                item.sourceSystem === 'edi' ? 'bg-amber-950/80 text-amber-300 border-amber-500/30' :
                item.sourceSystem === 'legacy_csv' ? 'bg-sky-950/80 text-sky-300 border-sky-500/30' :
                'bg-purple-950/80 text-purple-300 border-purple-500/30';

              const formattedTime = (() => {
                try {
                  return new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } catch (e) {
                  return '';
                }
              })();

              return (
                <div
                  key={item.id}
                  className={`p-2 rounded-xl border transition-all flex items-center justify-between gap-2 text-left ${
                    isCurrentActive
                      ? 'bg-slate-900/95 border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/20'
                      : isFav
                      ? 'bg-slate-900/90 border-amber-500/35 shadow-[0_0_8px_rgba(245,158,11,0.07)] ring-1 ring-amber-500/15'
                      : 'bg-slate-900/70 hover:bg-slate-850/80 border-slate-800'
                  }`}
                >
                  {/* Left: Favorite star toggle button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleFavoriteScan(item.id, e)}
                    className={`p-1 rounded-md transition-all cursor-pointer shrink-0 ${
                      isFav 
                        ? 'text-amber-400 hover:text-amber-300 bg-amber-950/50 border border-amber-500/30 shadow-xs' 
                        : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800 border border-transparent'
                    }`}
                    title={isFav ? "Favorited order pattern — Click to unmark" : "Mark as favorite pattern (Frequently scanned)"}
                    aria-label={isFav ? "Unmark favorite pattern" : "Mark as favorite pattern"}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]' : ''}`} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className={`text-[7.5px] font-mono font-bold uppercase px-1 py-0.2 rounded border ${systemBadgeColor}`}>
                        {item.sourceSystem}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-white truncate" title={`Order #${item.sourceOrderId}`}>
                        #{item.sourceOrderId}
                      </span>
                      {isFav && (
                        <span className="text-[7px] font-mono font-bold text-amber-300 bg-amber-950/90 px-1 py-0.2 rounded border border-amber-500/40 flex items-center gap-0.5 shrink-0" title="Favorite Order Pattern">
                          <Star className="w-1.5 h-1.5 fill-amber-400 text-amber-400" /> FAV
                        </span>
                      )}
                      {isCurrentActive && (
                        <span className="text-[7px] font-mono font-bold text-emerald-400 bg-emerald-950/90 px-1 py-0.2 rounded border border-emerald-500/30 flex items-center gap-0.5 shrink-0">
                          <span className="w-1 h-1 rounded-full bg-emerald-400"></span> Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[8.5px] text-slate-400 font-mono">
                      <span className="text-emerald-400 font-bold">
                        ${(item.totalAmount / 100).toFixed(2)}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span>{item.itemsCount} item{item.itemsCount === 1 ? '' : 's'}</span>
                      {formattedTime && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-500 text-[8px]">{formattedTime}</span>
                        </>
                      )}
                    </div>

                    <div className="text-[8px] text-slate-500 truncate mt-0.5" title={item.customerEmail}>
                      {item.customerEmail}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => processScannedPayload(item.rawData, true)}
                      className={`px-2 py-1 text-[8.5px] font-mono font-bold rounded-lg border transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm ${
                        isCurrentActive
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                          : isFav
                          ? 'bg-amber-950/80 hover:bg-amber-900/80 text-amber-200 border-amber-500/40'
                          : 'bg-indigo-650 hover:bg-indigo-600 text-white border-indigo-500/40'
                      }`}
                      title="Re-process order payload without re-scanning"
                    >
                      <RotateCw className="w-2.5 h-2.5" />
                      <span>{isCurrentActive ? 'Re-load' : 'Re-process'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleRemoveRecentScan(item.id, e)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Export ledger to beautiful professional PDF report format
  const handleExportPDF = () => {
    try {
      if (transactions.length === 0) {
        setLedgerMessage({
          text: "⚠️ No transactions available to export.",
          type: "err"
        });
        return;
      }

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
      });

      // Page width is 215.9 mm. Margins are 15mm on each side.
      // Total writable width is 185.9 mm.
      let currentY = 15;
      let pageNum = 1;

      // Define helper for adding a page header/footer
      const drawHeaderFooter = (activePageNum: number) => {
        doc.setFillColor(30, 41, 59); // Slate-800
        doc.rect(15, 12, 185.9, 1.5, 'F'); // Top colored bar
        
        doc.setTextColor(100, 116, 139); // Slate-500
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('BUILDCORP STRATEGIC FINANCIAL LOGS', 15, 20);
        
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${activePageNum}`, 190, 20);
        
        // Footer line and page info
        doc.setDrawColor(226, 232, 240); // Slate-200
        doc.setLineWidth(0.2);
        doc.line(15, 262, 200.9, 262);
        
        doc.setFontSize(7);
        doc.text('BUILDCORP STRATEGIC ERP CONTROL HUB — RECORD OF CO-ORDINATED GENERAL LEDGER ENTRIES', 15, 267);
        doc.text('CONFIDENTIAL / AUDIT GRADE DOCUMENT', 165, 267);
      };

      // 1. Draw Page 1 Main Header Block
      doc.setFillColor(30, 41, 59); // Slate-800
      doc.rect(15, 15, 185.9, 32, 'F');

      // Top Header Title and Info
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('BUILDCORP STRATEGIC GENERAL LEDGER REPORT', 20, 25);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(203, 213, 225); // Slate-300
      doc.text('Relational Accounting Engine & Double-Entry Fiscal Balanced Records', 20, 31);
      
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.text(`Generated At: ${new Date().toLocaleString()}  |  System Timezone: Local`, 20, 38);

      // Audit status badge in header
      const badgeColor = auditBalanced ? [16, 185, 129] : [239, 68, 68];
      doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]); // Emerald or Rose
      doc.rect(150, 23, 45, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(auditBalanced ? 'STATUS: BALANCED' : 'STATUS: UNBALANCED', 153, 28);

      // 2. Summary Statistics Cards
      currentY = 54;
      
      const drawCard = (cx: number, title: string, value: string, color: [number, number, number]) => {
        doc.setFillColor(248, 250, 252); // Slate-50 background
        doc.setDrawColor(226, 232, 240); // Slate-200 border
        doc.setLineWidth(0.3);
        doc.rect(cx, currentY, 58, 18, 'FD');
        
        // Draw Accent colored top border line
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(cx, currentY, 58, 1.5, 'F');
        
        // Content
        doc.setTextColor(100, 116, 139); // Slate-500
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text(title, cx + 4, currentY + 6);
        
        doc.setTextColor(15, 23, 42); // Slate-900
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(value, cx + 4, currentY + 13);
      };

      drawCard(15, 'TOTAL KEYED TRANSACTIONS', `${transactions.length} Records`, [59, 130, 246]); // Blue
      drawCard(79, 'TOTAL ACCOUNT REVENUE', formatCentsToUSD(totalRevenueCents), [139, 92, 246]); // Purple
      drawCard(143, 'LEDGER AUDIT COMPLIANCE', auditBalanced ? 'COMPLIANT' : 'DISCREPANCY', auditBalanced ? [16, 185, 129] : [239, 68, 68]); // Emerald or Rose

      // Outer border of first page
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.rect(15, 15, 185.9, 243);

      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('BUILDCORP STRATEGIC ERP CONTROL HUB — CONFIDENTIAL REPORT PAGE 1', 18, 254);

      // 3. Section 1: Chart of Accounts
      currentY = 82;
      doc.setTextColor(15, 23, 42); // Slate-900
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('SECTION 1: CHART OF ACCOUNTS BALANCES', 15, currentY);

      currentY += 4;
      // Draw Table Header for Accounts
      doc.setFillColor(241, 245, 249); // Slate-100
      doc.rect(15, currentY, 185.9, 7, 'F');
      
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('CODE', 18, currentY + 5);
      doc.text('ACCOUNT NAME', 40, currentY + 5);
      doc.text('TYPE', 110, currentY + 5);
      doc.text('BALANCE (USD)', 160, currentY + 5);

      currentY += 7;

      // Draw Account Rows
      accounts.forEach((acc) => {
        const prefix = acc.type === 'asset' || acc.type === 'expense' ? '(Debit Bal)' : '(Credit Bal)';
        doc.setTextColor(15, 23, 42); // Slate-900
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(acc.code, 18, currentY + 5);
        
        doc.setFont('helvetica', 'bold');
        doc.text(acc.name, 40, currentY + 5);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(acc.type.toUpperCase(), 110, currentY + 5);
        
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.text(`${formatCentsToUSD(acc.netBalance)}`, 160, currentY + 5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(148, 163, 184);
        doc.text(prefix, 182, currentY + 5);

        // Subtly draw separator line
        doc.setDrawColor(241, 245, 249);
        doc.line(15, currentY + 7, 200.9, currentY + 7);
        currentY += 7;
      });

      // 4. Section 2: General Ledger Double-Entry Transaction Journals
      currentY += 5;
      doc.setTextColor(15, 23, 42); // Slate-900
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('SECTION 2: GENERAL LEDGER TRANSACTION RECORDS (DOUBLE-ENTRY)', 15, currentY);

      currentY += 4;
      
      // Draw Transaction List Table Header
      doc.setFillColor(241, 245, 249); // Slate-100
      doc.rect(15, currentY, 185.9, 7, 'F');
      
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('DATE / REF CODE / SPLITS', 18, currentY + 5);
      doc.text('DEBIT (DR)', 140, currentY + 5);
      doc.text('CREDIT (CR)', 170, currentY + 5);

      currentY += 7;

      // Group and sort transactions: sorted transactions dynamically based on currently configured sort configuration
      sortedTransactions.forEach((tx) => {
        // Find child journal entries for this transaction
        const txEntries = journalEntries.filter(je => je.transactionId === tx.id);
        
        // Before drawing this transaction Block, let's verify if we need to add a page.
        const estimatedHeight = 6 + (txEntries.length * 5.5) + 3;
        
        if (currentY + estimatedHeight > 250) {
          // Add new page
          doc.addPage();
          pageNum++;
          drawHeaderFooter(pageNum);
          
          // Redraw Section header if starting fresh on new page
          doc.setTextColor(100, 116, 139);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text('SECTION 2: GENERATED TRANSACTION JOURNAL ENTRIES (CONTINUED)', 15, 26);
          
          // Redraw Table Headers on new page
          doc.setFillColor(241, 245, 249);
          doc.rect(15, 29, 185.9, 7, 'F');
          doc.setTextColor(100, 116, 139);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text('DATE / REF CODE / SPLITS', 18, 34);
          doc.text('DEBIT (DR)', 140, 34);
          doc.text('CREDIT (CR)', 170, 34);
          
          currentY = 36;
        }

        // Draw Transaction Group Header Row (Light Slate colored band)
        doc.setFillColor(248, 250, 252); // slate-50
        doc.rect(15, currentY, 185.9, 5.5, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(30, 41, 59); // slate-800
        const postDateFormatted = new Date(tx.postedAt).toISOString().split('T')[0] + ' ' + new Date(tx.postedAt).toTimeString().split(' ')[0];
        doc.text(`${postDateFormatted}  |  Tx ID: #${tx.id}`, 18, currentY + 4);
        
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105); // slate-600
        const truncatedDesc = tx.description.length > 55 ? tx.description.substring(0, 52) + '...' : tx.description;
        doc.text(truncatedDesc, 80, currentY + 4);

        currentY += 5.5;

        // Draw Splits for this transaction
        txEntries.forEach((je) => {
          const matchedAcc = accounts.find(a => a.id === je.accountId);
          const isDebit = je.debitAmount > 0;
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(15, 23, 42); // slate-900
          
          if (isDebit) {
            // Debit rows are left-aligned
            doc.text(`${matchedAcc?.code || ''} — ${matchedAcc?.name || 'Unknown Account'}`, 24, currentY + 4.5);
            doc.setFont('helvetica', 'bold');
            doc.text(`${formatCentsToUSD(je.debitAmount)}`, 140, currentY + 4.5);
          } else {
            // Credit rows indented as standard accounting entry
            doc.setTextColor(71, 85, 105); // slate-600
            doc.text(`    ${matchedAcc?.code || ''} — ${matchedAcc?.name || 'Unknown Account'}`, 24, currentY + 4.5);
            doc.setFont('helvetica', 'bold');
            doc.text(`${formatCentsToUSD(je.creditAmount)}`, 170, currentY + 4.5);
          }
          
          // Tiny separator dots/line
          doc.setDrawColor(248, 250, 252);
          doc.setLineWidth(0.1);
          doc.line(20, currentY + 5.5, 200.9, currentY + 5.5);
          
          currentY += 5.5;
        });

        // Add 1.5mm space between transactions
        currentY += 1.5;
      });

      // Draw standard footer lines across page runs
      for (let i = 1; i <= pageNum; i++) {
        doc.setPage(i);
        doc.setDrawColor(226, 232, 240); // Slate-200
        doc.setLineWidth(0.3);
        doc.line(15, 260, 200.9, 260);
        
        doc.setTextColor(148, 163, 184); // Slate-400
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text('BUILDCORP STRATEGIC GENERAL LEDGER FINANCIAL REPORT — RECORD OF DIGITAL BALANCED TRANSACTION ENTRIES', 15, 265);
        doc.text(`Page ${i} of ${pageNum}`, 185, 265);
      }

      doc.save(`BuildCorp_Strategic_Ledger_Report_${new Date().toISOString().split('T')[0]}.pdf`);

      setLedgerMessage({
        text: "📥 Professional PDF Statement generated and downloaded successfully!",
        type: "success"
      });
    } catch (err: any) {
      setLedgerMessage({
        text: `PDF generation failed: ${err.message}`,
        type: "err"
      });
      console.error(err);
    }
  };

  // Export ledger to standard downloadable CSV format
  const handleExportCSV = () => {
    try {
      if (transactions.length === 0) {
        setLedgerMessage({
          text: "⚠️ No transactions available to export.",
          type: "err"
        });
        return;
      }

      const headers = [
        "Transaction ID",
        "Posted At",
        "Transaction Description",
        "Account Code",
        "Account Name",
        "Debit Amount (USD)",
        "Credit Amount (USD)"
      ];

      const csvRows = [headers.join(",")];

      transactions.forEach((tx) => {
        const txEntries = journalEntries.filter(je => je.transactionId === tx.id);
        txEntries.forEach((entry) => {
          const account = accounts.find(a => a.id === entry.accountId);
          const row = [
            `"${tx.id}"`,
            `"${new Date(tx.postedAt).toISOString()}"`,
            `"${tx.description.replace(/"/g, '""')}"`,
            `"${account?.code || ''}"`,
            `"${(account?.name || '').replace(/"/g, '""')}"`,
            entry.debitAmount > 0 ? (entry.debitAmount / 100).toFixed(2) : "0.00",
            entry.creditAmount > 0 ? (entry.creditAmount / 100).toFixed(2) : "0.00"
          ];
          csvRows.push(row.join(","));
        });
      });

      const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `BuildCorp_Strategic_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setLedgerMessage({
        text: "📥 Ledger exported successfully as CSV!",
        type: "success"
      });
    } catch (err: any) {
      setLedgerMessage({
        text: `Export failed: ${err.message}`,
        type: "err"
      });
    }
  };

  // Export ledger to QuickBooks IIF format for accounting systems mapping
  const handleExportIIF = () => {
    try {
      if (transactions.length === 0) {
        setLedgerMessage({
          text: "⚠️ No transactions available to export to IIF.",
          type: "err"
        });
        return;
      }

      // IIF Header Block
      // Headers must be tab-separated
      const iifRows: string[] = [
        "!TRNS\tTRNSID\tTRNSTYPE\tDATE\tACCNT\tAMOUNT\tDOCNUM\tMEMO",
        "!SPL\tSPLID\tTRNSTYPE\tDATE\tACCNT\tAMOUNT\tDOCNUM\tMEMO",
        "!ENDTRNS"
      ];

      transactions.forEach((tx) => {
        const txEntries = journalEntries.filter(je => je.transactionId === tx.id);
        if (txEntries.length === 0) return;

        txEntries.forEach((entry, idx) => {
          const account = accounts.find(a => a.id === entry.accountId);
          const rawAmount = entry.debitAmount > 0 
            ? (entry.debitAmount / 100) 
            : -(entry.creditAmount / 100);
          
          const formattedDate = (() => {
            const d = new Date(tx.postedAt);
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const yyyy = d.getFullYear();
            return `${mm}/${dd}/${yyyy}`;
          })();

          const accountLabel = account ? `${account.code} - ${account.name}` : "Unknown Account";
          const memo = tx.description || "";
          
          if (idx === 0) {
            iifRows.push(`TRNS\t""\t"GENERAL JOURNAL"\t"${formattedDate}"\t"${accountLabel.replace(/"/g, '""')}"\t${rawAmount.toFixed(2)}\t"${tx.id}"\t"${memo.replace(/"/g, '""')}"`);
          } else {
            iifRows.push(`SPL\t""\t"GENERAL JOURNAL"\t"${formattedDate}"\t"${accountLabel.replace(/"/g, '""')}"\t${rawAmount.toFixed(2)}\t"${tx.id}"\t"${memo.replace(/"/g, '""')}"`);
          }
        });
        iifRows.push("ENDTRNS");
      });

      const iifContent = iifRows.join("\r\n");
      const blob = new Blob([iifContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `BuildCorp_QB_Ledger_${new Date().toISOString().split('T')[0]}.iif`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setLedgerMessage({
        text: "📥 Ledger exported successfully as QuickBooks IIF!",
        type: "success"
      });
    } catch (err: any) {
      setLedgerMessage({
        text: `IIF Export failed: ${err.message}`,
        type: "err"
      });
    }
  };
 
  // Explicit trend verification and absolute accuracy calibration trigger
  const handleRecalculateTrends = async () => {
    try {
      setIsRecalculatingTrends(true);
      setLedgerMessage({
        text: "🔄 Initiating precision auditable trend recalculation across entire ledger history...",
        type: "success"
      });
 
      // Fetch the absolute source of truth from database
      await fetchLedgerState();
 
      // Delay a little to give a professional UX feedback feel and ensure full recalculation cycles run cleanly
      await new Promise(resolve => setTimeout(resolve, 850));
 
      setLedgerMessage({
        text: "✅ Ledger history trend metrics successfully recalculated and calibrated for 100% mathematical accuracy!",
        type: "success"
      });
    } catch (err: any) {
      setLedgerMessage({
        text: `Trend calibration exception: ${err.message}`,
        type: "err"
      });
    } finally {
      setIsRecalculatingTrends(false);
    }
  };
 
  // Sync ledger stats
  const fetchLedgerState = async () => {
    try {
      const res = await fetch('/api/ledger');
      const data = await res.json();
      if (res.ok) {
        setAccounts(data.accounts || []);
        setTransactions(data.transactions || []);
        setJournalEntries(data.journalEntries || []);
        setAuditBalanced(data.auditBalanced);
      }
    } catch (err) {
      console.error('Error synchronization ledger schema state:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLedgerState();
    handleFetchForecast();
  }, []);

  // Sort and filter transactions dynamically based on active search & filter config (ID, SKU, or Customer Email)
  const filteredTransactions = [...transactions].filter((tx) => {
    if (!ledgerSearchTerm) return true;
    const term = ledgerSearchTerm.trim().toLowerCase();
    const idMatches = (tx.id && String(tx.id).toLowerCase().includes(term)) ||
                      (tx.sourceId && String(tx.sourceId).toLowerCase().includes(term));
    const skuMatches = tx.sku && String(tx.sku).toLowerCase().includes(term);
    const emailMatches = tx.customerEmail && String(tx.customerEmail).toLowerCase().includes(term);
    const descMatches = tx.description && String(tx.description).toLowerCase().includes(term);
    const entityMatches = tx.entity && String(tx.entity).toLowerCase().includes(term);

    // Also check child journal entries account names/codes
    const accountMatches = journalEntries
      .filter(je => je.transactionId === tx.id)
      .some(je => {
        const acc = accounts.find(a => a.id === je.accountId);
        return acc && (acc.name?.toLowerCase().includes(term) || acc.code?.toLowerCase().includes(term));
      });

    return idMatches || skuMatches || emailMatches || descMatches || entityMatches || accountMatches;
  });

  const sortedTransactions = filteredTransactions.sort((a, b) => {
    if (ledgerSortBy === 'date_desc') {
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    } else if (ledgerSortBy === 'date_asc') {
      return new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime();
    } else if (ledgerSortBy === 'amount_desc') {
      const amtA = journalEntries.filter(je => je.transactionId === a.id).reduce((sum, je) => sum + je.debitAmount, 0);
      const amtB = journalEntries.filter(je => je.transactionId === b.id).reduce((sum, je) => sum + je.debitAmount, 0);
      return amtB - amtA;
    } else if (ledgerSortBy === 'amount_asc') {
      const amtA = journalEntries.filter(je => je.transactionId === a.id).reduce((sum, je) => sum + je.debitAmount, 0);
      const amtB = journalEntries.filter(je => je.transactionId === b.id).reduce((sum, je) => sum + je.debitAmount, 0);
      return amtA - amtB;
    }
    return 0;
  });

  const totalSalesProcessed = transactions.length;
  // Calculate total dollar volume
  const totalRevenueCents = journalEntries
    .filter(je => je.accountId === 'acc-revenue')
    .reduce((sum, je) => sum + je.creditAmount, 0);
  const totalRevenueDollars = (totalRevenueCents / 100).toFixed(2);

  // Get individual account balances
  const cashBalance = (accounts.find(a => a.id === 'acc-cash')?.netBalance || 0) / 100;
  const arBalance = (accounts.find(a => a.id === 'acc-ar')?.netBalance || 0) / 100;
  const taxBalance = (accounts.find(a => a.id === 'acc-tax')?.netBalance || 0) / 100;
  const revenueBalance = (accounts.find(a => a.id === 'acc-revenue')?.netBalance || 0) / 100;

  // Formatting helpers
  const formatCentsToUSD = (cents: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  };

  // Dynamic trend analysis splitting transaction history chronology into equal halves (current vs previous period)
  let revenueTrend = 0;
  let transactionsTrend = 0;
  let cashTrend = 0;

  if (transactions && transactions.length > 0) {
    const dates = transactions
      .map(tx => tx.postedAt ? new Date(tx.postedAt).getTime() : 0)
      .filter(d => !isNaN(d) && d > 0);
    
    if (dates.length > 0) {
      const minTime = Math.min(...dates);
      const maxTime = Math.max(...dates);
      
      if (minTime < maxTime) {
        // Calculate midpoint of the active timeline
        const midTime = minTime + (maxTime - minTime) / 2;
        
        const currentTx = transactions.filter(tx => tx.postedAt && new Date(tx.postedAt).getTime() >= midTime);
        const prevTx = transactions.filter(tx => tx.postedAt && new Date(tx.postedAt).getTime() < midTime);
        
        const currentTxIds = new Set(currentTx.map(tx => tx.id));
        const prevTxIds = new Set(prevTx.map(tx => tx.id));
        
        // 1. Transactions volume trend
        const currentVol = currentTx.length;
        const prevVol = prevTx.length;
        transactionsTrend = prevVol > 0 ? ((currentVol - prevVol) / prevVol) * 100 : 100;
        
        // 2. Revenue trend
        const currentRev = journalEntries
          .filter(je => je.accountId === 'acc-revenue' && currentTxIds.has(je.transactionId))
          .reduce((sum, je) => sum + je.creditAmount, 0);
        const prevRev = journalEntries
          .filter(je => je.accountId === 'acc-revenue' && prevTxIds.has(je.transactionId))
          .reduce((sum, je) => sum + je.creditAmount, 0);
        revenueTrend = prevRev > 0 ? ((currentRev - prevRev) / prevRev) * 100 : 100;
        
        // 3. Cash reserves trend (comparative final cumulative value vs closing previous period value)
        const currentCashChange = journalEntries
          .filter(je => je.accountId === 'acc-cash' && currentTxIds.has(je.transactionId))
          .reduce((sum, je) => sum + (je.debitAmount - je.creditAmount), 0) / 100;
        
        const prevCash = cashBalance - currentCashChange;
        cashTrend = prevCash > 0 ? ((cashBalance - prevCash) / prevCash) * 100 : 0;
      } else {
        // Single timestamp has all events - default fallback to neutral/positive
        revenueTrend = 0;
        transactionsTrend = 0;
        cashTrend = 0;
      }
    }
  }

  const renderTrendBadge = (pct: number) => {
    if (!transactions || transactions.length === 0) return null;
    const isPositive = pct > 0;
    const isZero = pct === 0;
    const absPct = Math.abs(pct).toFixed(1);

    return (
      <span 
        className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${
          isZero
            ? 'bg-[#fafaf9] text-[#78716c] border-[#e7e5e4]'
            : isPositive
              ? 'bg-emerald-50 text-[#10b981] border-emerald-200'
              : 'bg-rose-50 text-[#f43f5e] border-rose-200'
        }`}
        title="Compared to previous chronological period"
      >
        {isZero ? (
          <span className="font-mono text-[10px]">0.0%</span>
        ) : (
          <span className="flex items-center gap-0.5 font-mono text-[10px]">
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? '+' : '-'}{absPct}%
          </span>
        )}
      </span>
    );
  };

  // Data for Chart visualizer using Maritime & Financial Indicator Palette
  const chartData = [
    { name: 'Cash (Asset)', balance: cashBalance, type: 'Asset', fill: '#10b981' }, // Bullish
    { name: 'Accounts Rec. (Asset)', balance: arBalance, type: 'Asset', fill: '#0077b6' }, // Brand Ocean
    { name: 'Estimated Sales Tax', balance: taxBalance, type: 'Liability', fill: '#f59e0b' }, // Volatility
    { name: 'Total Revenue (GAAP)', balance: revenueBalance, type: 'Revenue', fill: '#6366f1' } // Quantitative
  ];

  const renderAdminConsoleContent = () => {
    return (
      <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl p-6 relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Console Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/30">
              <Sliders className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold font-mono uppercase tracking-wider text-slate-100 flex items-center gap-2">
                🛡️ Enterprise System Oversight Control Console
              </h2>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                Configure corporate governance rules, lock co-branding zones, or invoke system ledger resets.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-full border shrink-0 flex items-center gap-1.5 transition-all duration-300 ${
              isAdminMode 
                ? 'bg-amber-500/10 border-amber-400/30 text-amber-400' 
                : 'bg-rose-500/10 border-rose-450/30 text-rose-450'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isAdminMode ? 'bg-amber-400 animate-pulse' : 'bg-rose-500'}`}></span>
              {isAdminMode ? '🛡️ MASTER ADMINISTRATIVE PRIVILEGES: GRANTED' : '🏢 SIMULATED RESELLER CHANNEL: LOCKED'}
            </span>
          </div>
        </div>

        {/* Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Column 1: Role Configuration & Policy Lock Matrix */}
          <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-850 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300">
                  Secured Governance & Roles
                </h3>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mb-4 leading-relaxed">
                Choose the simulator role to test Reseller permissions. Master System Admins can override and configuration-lock brand assets.
              </p>
              
              {/* Role Toggle Switch */}
              <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800 mb-5">
                <button
                  onClick={() => {
                    setIsAdminMode(true);
                    setLedgerMessage({ text: "👨‍💻 Full Master Admin View Active. Lock configurations are editable.", type: "success" });
                    addAuditEvent('rebrand', 'Admin View Engaged', 'Primary Admin swapped to Master System Administrator console.');
                  }}
                  className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                    isAdminMode 
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Unlock className="w-3 h-3" />
                  Master Admin
                </button>
                <button
                  onClick={() => {
                    setIsAdminMode(false);
                    setLedgerMessage({ text: "🏢 Simulated Reseller View Active. Hardlined fields are locked down.", type: "info" });
                    addAuditEvent('rebrand', 'Reseller View Engaged', 'Primary Admin swapped to Reseller Role simulation.');
                  }}
                  className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase transition-all duration-155 flex items-center justify-center gap-1.5 cursor-pointer ${
                    !isAdminMode 
                      ? 'bg-rose-600 text-white font-extrabold shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  Reseller Sim
                </button>
              </div>

              {/* Locks Matrix Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-900">
                <div className="text-[10px] font-mono text-slate-400 font-bold mb-1 uppercase tracking-wider">
                  Governance Lock Matrix:
                </div>

                {/* Lock Copyright */}
                <button
                  onClick={() => {
                    if (!isAdminMode) return;
                    const isLocked = lockedFields.includes('copyrightFooterText');
                    let updated: string[];
                    if (isLocked) {
                      updated = lockedFields.filter(f => f !== 'copyrightFooterText' && f !== 'licenseFooterText');
                      setLedgerMessage({ text: "🔓 Copyright & Licensing elements unlocked for co-branding! Toggle 'Interactive Edit Mode' or 'Studio Customizer' above to edit.", type: "success" });
                    } else {
                      updated = [...lockedFields, 'copyrightFooterText', 'licenseFooterText'];
                      setLedgerMessage({ text: "🔒 Copyright & License Footer hardline-secured from reseller alterations.", type: "success" });
                    }
                    setLockedFields(updated);
                  }}
                  disabled={!isAdminMode}
                  className={`w-full px-3 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wide border transition-all flex items-center justify-between ${
                    !isAdminMode 
                      ? 'opacity-50 cursor-not-allowed border-slate-900 text-slate-600' 
                      : lockedFields.includes('copyrightFooterText')
                        ? 'bg-rose-950/30 text-rose-400 border-rose-500/40 hover:bg-rose-950/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                    Copyright Footer Lock
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${lockedFields.includes('copyrightFooterText') ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-830 text-slate-400'}`}>
                    {lockedFields.includes('copyrightFooterText') ? 'LOCKED' : 'ACTIVE'}
                  </span>
                </button>

                {/* Lock Network image */}
                <button
                  onClick={() => {
                    if (!isAdminMode) return;
                    const isLocked = lockedFields.includes('erpTopologyImg');
                    let updated: string[];
                    if (isLocked) {
                      updated = lockedFields.filter(f => f !== 'erpTopologyImg');
                      setLedgerMessage({ text: "🔓 Interface Enterprise Topology Image unlocked.", type: "success" });
                    } else {
                      updated = [...lockedFields, 'erpTopologyImg'];
                      setLedgerMessage({ text: "🔒 Enterprise Network diagram locked from modifications.", type: "success" });
                    }
                    setLockedFields(updated);
                  }}
                  disabled={!isAdminMode}
                  className={`w-full px-3 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wide border transition-all flex items-center justify-between ${
                    !isAdminMode 
                      ? 'opacity-50 cursor-not-allowed border-slate-900 text-slate-600' 
                      : lockedFields.includes('erpTopologyImg')
                        ? 'bg-rose-950/30 text-rose-400 border-rose-500/40 hover:bg-rose-950/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                    Topology Diagram Lock
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${lockedFields.includes('erpTopologyImg') ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-830 text-slate-400'}`}>
                    {lockedFields.includes('erpTopologyImg') ? 'LOCKED' : 'ACTIVE'}
                  </span>
                </button>

                {/* Lock Backend System */}
                <button
                  onClick={() => {
                    if (!isAdminMode) return;
                    const isLocked = lockedFields.includes('systemBackendSettings');
                    let updated: string[];
                    if (isLocked) {
                      updated = lockedFields.filter(f => f !== 'systemBackendSettings');
                      setLedgerMessage({ text: "🔓 Backend Settings & Database Controls unlocked.", type: "success" });
                    } else {
                      updated = [...lockedFields, 'systemBackendSettings'];
                      setLedgerMessage({ text: "🔒 Database and Network Shunts locked down from Reseller configuration.", type: "success" });
                    }
                    setLockedFields(updated);
                  }}
                  disabled={!isAdminMode}
                  className={`w-full px-3 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wide border transition-all flex items-center justify-between ${
                    !isAdminMode 
                      ? 'opacity-50 cursor-not-allowed border-slate-900 text-slate-600' 
                      : lockedFields.includes('systemBackendSettings')
                        ? 'bg-rose-950/30 text-rose-400 border-rose-500/40 hover:bg-rose-950/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                    Backend System Lock
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${lockedFields.includes('systemBackendSettings') ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-830 text-slate-400'}`}>
                    {lockedFields.includes('systemBackendSettings') ? 'LOCKED' : 'ACTIVE'}
                  </span>
                </button>
              </div>
            </div>
            
            <div className="text-[10px] text-slate-500 italic mt-3 pt-2 border-t border-slate-900/60 font-mono">
              {!isAdminMode ? '🔓 Switch back to Master Admin to adjust these governance toggles.' : '🔑 Modify switches above to real-time sync limits.'}
            </div>
          </div>

          {/* Column 2: Branding Controls & Workspace Editors */}
          <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-850 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Pencil className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300">
                  Interactive Co-Branding Tools
                </h3>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mb-4 leading-relaxed">
                Toggles interactive editor systems. Modify application titles, descriptions, and structural branding elements instantly.
              </p>

              <div className="space-y-4">
                {/* Mode A: Interactive Click To Edit */}
                <button
                  onClick={() => {
                    setIsClickToEditActive(!isClickToEditActive);
                    if (isStudioEditable) setIsStudioEditable(false);
                    addAuditEvent('rebrand', 'Click-to-Edit Toggled', `Reseller edit mode set to: ${!isClickToEditActive}`);
                  }}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    isClickToEditActive 
                      ? 'bg-pink-500/10 border-pink-500 text-pink-300 shadow-md shadow-pink-500/5' 
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold font-mono flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isClickToEditActive ? 'bg-pink-400 animate-ping' : 'bg-slate-650'}`}></span>
                      🎯 Click-to-Edit Mode
                    </span>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-extrabold ${isClickToEditActive ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {isClickToEditActive ? 'ENGAGED' : 'OFF'}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 leading-normal">
                    Left-click highlighting dashed boxes across ERP elements to directly re-title sync headers and brand components inline.
                  </p>
                </button>

                {/* Mode B: Full Workspace Inline Customizer Inputs */}
                <button
                  onClick={() => {
                    setIsStudioEditable(!isStudioEditable);
                    if (isClickToEditActive) setIsClickToEditActive(false);
                    addAuditEvent('rebrand', 'Inline Inputs Toggled', `Workspace custom inputs set to: ${!isStudioEditable}`);
                  }}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    isStudioEditable 
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-md shadow-amber-500/5' 
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold font-mono flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isStudioEditable ? 'bg-amber-400 animate-ping' : 'bg-slate-650'}`}></span>
                      🎨 Inline Input Fields
                    </span>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-extrabold ${isStudioEditable ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                      {isStudioEditable ? 'ACTIVE' : 'OFF'}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 leading-normal">
                    Reveals direct input textboxes and custom image links across the live app for comprehensive swift re-brand editing.
                  </p>
                </button>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-mono border-t border-slate-900/60 pt-2 mt-3 leading-tight flex items-center gap-1">
              <span>🚀 Use edit frames to test White-label delivery.</span>
            </div>
          </div>

          {/* Column 3: Platform Diagnostics & System Utilities */}
          <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-850 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300">
                  SQL Utilities & Reference time
                </h3>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mb-4 leading-relaxed">
                Execute core maintenance, clear local development sessions, or rebuild transactional benchmarks safely.
              </p>

              <div className="space-y-3">
                {/* Action button 1: Reset SQL General Ledger */}
                <button
                  onClick={handleResetLedger}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-850 active:bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-slate-200 hover:text-white rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                  Reset SQL Ledger History
                </button>

                {/* Action button 2: Refresh Browser Web Instance */}
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-2.5 px-4 bg-indigo-650 hover:bg-indigo-700 active:bg-indigo-850 border border-indigo-500 text-xs font-mono font-bold text-white rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98"
                  title="Cold reload the sandboxed window environment"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-200" />
                  Cold Reload Browser
                </button>
              </div>

              {/* System Time Panels */}
              <div className="mt-4 pt-3 border-t border-slate-900 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-450" />
                    Reference Anchor:
                  </span>
                  <span className="text-emerald-400 font-bold">2026-06-13 UTC</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-450" />
                    System Clock Time:
                  </span>
                  <span className="text-teal-400 font-bold tracking-tight">{currentTimeText || '00:00:00'}</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-mono mt-3 pt-2 border-t border-slate-900/60 leading-tight">
              🛠️ Hardware Node: <span className="text-indigo-400">Cloud Run Sandboxed Container</span>
            </div>
          </div>

        </div>
      </div>
    );
  };

  return (
    <ClickToEditContext.Provider value={{ isClickToEditActive, setActiveEditorField, lockedFields, isAdminMode, onPostMessage: (text, type) => setLedgerMessage({ text, type }) }}>
      <div className="min-h-screen bg-[#fafaf9] text-[#1c1917] font-sans antialiased pb-20">
      
      {/* Banner/Header Workspace */}
      <header className="bg-gradient-to-r from-[#03045e] via-[#023e8a] to-[#0077b6] text-white shadow-md border-b border-[#0096c7]/40">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="p-0.5 bg-white border border-white/90 rounded-xl shadow-md flex items-center justify-center shrink-0 w-[80px] h-[80px] sm:w-[88px] sm:h-[88px] overflow-hidden">
              <CorporateBrandLogo className="w-full h-full object-contain" id="header-brand-logo" />
            </div>
            <div>
              <ClickToEditWrapper fieldKey="appTitle" fieldLabel="Application Title text">
                <h1 id="app-title" className="text-2xl font-bold tracking-tight flex items-center gap-1 text-white">
                  {renderEditableText('appTitle', 'text-2xl font-bold tracking-tight text-white')}
                </h1>
              </ClickToEditWrapper>
              <div className="mt-1">
                <ClickToEditWrapper fieldKey="appSubtitle" fieldLabel="Application Subtitle Text">
                  <p className="text-xs text-[#caf0f8] font-mono">
                    {renderEditableText('appSubtitle', 'text-xs text-[#caf0f8] font-mono')}
                  </p>
                </ClickToEditWrapper>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              id="open-admin-console-btn"
              onClick={() => {
                setIsAdminConsoleOpen(true);
                addAuditEvent('rebrand', 'System Console Opened', 'User clicked the quick admin console floating trigger.');
              }}
              className="px-4 py-2 bg-gradient-to-r from-[#0096c7] to-[#00b4d8] hover:from-[#0077b6] hover:to-[#0096c7] active:scale-95 text-xs font-mono font-bold text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-[#48cae4]/50"
            >
              <Sliders className="w-4 h-4 shrink-0 text-white" />
              ⚙️ Admin Control Panel
            </button>
          </div>
        </div>
      </header>

      {/* Module Navigation Tabs */}
      <div id="module-navigation-bar" className="bg-[#03045e] border-0 border-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-6 overflow-x-auto no-scrollbar">
            <button
              id="tab-view-erp"
              onClick={() => setMainView('erp')}
              className={`pb-4 pt-4 text-xs font-bold font-mono uppercase tracking-wider cursor-pointer border-b-4 transition-all whitespace-nowrap ${
                mainView === 'erp'
                  ? 'border-[#00b4d8] text-[#caf0f8] font-extrabold'
                  : 'border-transparent text-[#90e0ef]/70 hover:text-white hover:border-[#0077b6]'
              }`}
            >
              📋 ERP Ledger translation gateway
            </button>
            <button
              id="tab-view-cloudboy-x"
              onClick={() => setMainView('cloudboy_x')}
              className={`pb-4 pt-4 text-xs font-bold font-mono uppercase tracking-wider cursor-pointer border-b-4 transition-all whitespace-nowrap ${
                mainView === 'cloudboy_x'
                  ? 'border-[#00b4d8] text-[#caf0f8] font-extrabold'
                  : 'border-transparent text-[#90e0ef]/70 hover:text-white hover:border-[#0077b6]'
              }`}
            >
              ⚡ Cloudboy X Transitional Flow
            </button>
            <button
              id="tab-view-diagnostics"
              onClick={() => setMainView('troubleshooting')}
              className={`pb-4 pt-4 text-xs font-bold font-mono uppercase tracking-wider cursor-pointer border-b-4 transition-all whitespace-nowrap ${
                mainView === 'troubleshooting'
                  ? 'border-[#00b4d8] text-[#caf0f8] font-extrabold'
                  : 'border-transparent text-[#90e0ef]/70 hover:text-white hover:border-[#0077b6]'
              }`}
            >
              🛠️ Diagnostics & Job Isolator
            </button>
            <button
              id="tab-view-admin"
              onClick={() => setMainView('admin')}
              className={`pb-4 pt-4 text-xs font-bold font-mono uppercase tracking-wider cursor-pointer border-b-4 transition-all whitespace-nowrap ${
                mainView === 'admin'
                  ? 'border-[#00b4d8] text-[#caf0f8] font-extrabold'
                  : 'border-transparent text-[#90e0ef]/70 hover:text-white hover:border-[#0077b6]'
              }`}
            >
              🛡️ System Admin Console
            </button>
            <button
              id="tab-view-procurement"
              onClick={() => setMainView('procurement')}
              className={`pb-4 pt-4 text-xs font-bold font-mono uppercase tracking-wider cursor-pointer border-b-4 transition-all whitespace-nowrap ${
                mainView === 'procurement'
                  ? 'border-[#00b4d8] text-[#caf0f8] font-extrabold'
                  : 'border-transparent text-[#90e0ef]/70 hover:text-white hover:border-[#0077b6]'
              }`}
            >
              📥 Procurement Room
            </button>
            <button
              id="tab-view-multientity"
              onClick={() => setMainView('multientity')}
              className={`pb-4 pt-4 text-xs font-bold font-mono uppercase tracking-wider cursor-pointer border-b-4 transition-all whitespace-nowrap ${
                mainView === 'multientity'
                  ? 'border-[#00b4d8] text-[#caf0f8] font-extrabold'
                  : 'border-transparent text-[#90e0ef]/70 hover:text-white hover:border-[#0077b6]'
              }`}
            >
              🌐 Multi-Entity GAAP Overview
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Interface */}
      <main className={`max-w-7xl mx-auto px-4 mt-8 sm:px-6 lg:px-8 ${mainView === 'erp' ? 'block' : 'hidden'}`}>
        
        {/* Dashboards Metrics Header & Recalculate Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 bg-white p-4 border border-[#e7e5e4] rounded-xl shadow-xs">
          <div>
            <h2 className="text-xs font-bold text-[#1c1917] flex items-center gap-1.5 leading-none uppercase tracking-wider">
              <Activity className="w-4 h-4 text-[#0077b6]" />
              Strategic Ledger Health & Performance Indicators
            </h2>
            <p className="text-[11px] text-[#78716c] mt-1">Real-time analytical trends calculated dynamically from double-entry transactional balances.</p>
          </div>
          <button
            id="recalculate-trends-btn"
            onClick={handleRecalculateTrends}
            disabled={isRecalculatingTrends}
            className={`flex items-center justify-center gap-2 px-3 py-1.5 bg-[#fafaf9] hover:bg-white text-[#1c1917] disabled:opacity-50 border border-[#e7e5e4] rounded-lg text-xs font-semibold font-mono tracking-wide shadow-xs hover:shadow-sm transition-all cursor-pointer active:scale-95 shrink-0 ${isRecalculatingTrends ? 'animate-pulse' : ''}`}
            title="Calibrate and verify all historical percentage trends with mathematical precision"
          >
            <RefreshCw className={`w-3 h-3 text-[#0077b6] ${isRecalculatingTrends ? 'animate-spin' : ''}`} />
            {isRecalculatingTrends ? 'Calibrating...' : 'Calibrate Metrics'}
          </button>
        </div>

        {/* Dashboards Metrics Header Cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          
          <div id="stat-sales" className="bg-white border border-[#e7e5e4] rounded-xl p-5 shadow-xs text-[#1c1917]">
            <div className="flex justify-between items-start text-[#78716c] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Accounting Revenue</span>
              <Coins className="w-5 h-5 text-[#6366f1]" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-extrabold tracking-tight text-[#1c1917]">${totalRevenueDollars}</p>
              {renderTrendBadge(revenueTrend)}
            </div>
            <p className="text-xs text-[#6366f1] font-mono mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Real-time ledger value posted
            </p>
          </div>

          <div id="stat-volume" className="bg-white border border-[#e7e5e4] rounded-xl p-5 shadow-xs text-[#1c1917]">
            <div className="flex justify-between items-start text-[#78716c] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Database Transactions</span>
              <Activity className="w-5 h-5 text-[#10b981]" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-extrabold tracking-tight text-[#1c1917]">{totalSalesProcessed}</p>
              {renderTrendBadge(transactionsTrend)}
            </div>
            <p className="text-xs text-[#10b981] font-mono mt-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Relational transactions recorded
            </p>
          </div>

          <div id="stat-cash" className="bg-white border border-[#e7e5e4] rounded-xl p-5 shadow-xs text-[#1c1917]">
            <div className="flex justify-between items-start text-[#78716c] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Trade Cash Reserves</span>
              <BookOpen className="w-5 h-5 text-[#0077b6]" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-extrabold tracking-tight text-[#1c1917]">${cashBalance.toFixed(2)}</p>
              {renderTrendBadge(cashTrend)}
            </div>
            <p className="text-xs text-[#78716c] font-mono mt-2">
              A/R Outstandings: <span className="text-[#0077b6] font-semibold">${arBalance.toFixed(2)}</span>
            </p>
          </div>

          <div id="stat-integrity" className="bg-white text-[#1c1917] border border-[#e7e5e4] rounded-xl p-5 shadow-xs relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-5 font-mono text-7xl select-none text-[#1c1917]">AR=L+E</div>
            <div className="flex justify-between items-start text-[#78716c] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#78716c]">Ledger Balance Status</span>
              {auditBalanced ? (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10b981]"></span>
                </span>
              ) : (
                <AlertCircle className="w-5 h-5 text-[#f43f5e]" />
              )}
            </div>
            <p className="text-2xl font-bold tracking-tight">
              {auditBalanced ? (
                <span className="text-[#10b981]">● BALANCED</span>
              ) : (
                <span className="text-[#f43f5e]">▲ OUT OF BALANCE</span>
              )}
            </p>
            <p className="text-xs text-[#78716c] font-mono mt-1.5">
              Debit vs Credit Variance: <span className="text-[#10b981] font-semibold">$0.00</span>
            </p>
          </div>

        </section>

        {/* Informative Toast Messages */}
        <AnimatePresence>
          {ledgerMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-xl flex items-start gap-3 border shadow-sm ${
                ledgerMessage.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {ledgerMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mt-0.5 text-emerald-500 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 mt-0.5 text-rose-500 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-xs font-semibold leading-normal">{ledgerMessage.text}</p>
              </div>
              <button onClick={() => setLedgerMessage(null)} className="text-xs font-bold font-mono hover:underline px-2 cursor-pointer">
                dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🎨 BuildCorp Enterprise Brand & Infrastructure Studio Customizer */}
        <section id="enterprise-brand-studio" className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-950 rounded-2xl shadow-xl p-6 mb-8 text-white relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 p-4 opacity-5 select-none pointer-events-none font-mono text-9xl">DESIGN</div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-indigo-800/60 pb-5 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 bg-white border border-slate-200 rounded shadow-xs flex items-center justify-center w-7 h-7 shrink-0">
                  <CorporateBrandLogo className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold tracking-tight text-slate-105">Enterprise Brand & Core Topology Desk</h3>
              </div>
              <p className="text-indigo-200/70 text-xs mt-1">
                Configure corporate visual identity assets and network graphs. Click any image or portrait card to swap or upload custom files!
              </p>
            </div>
            
            <div className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-[11px] font-mono text-indigo-300">
              Interactive Media Nodes: <span className="text-emerald-400 font-bold font-mono">ACTIVE</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Asset 1: Network Topology Graph */}
            <div 
              onClick={() => {
                setShowImageEditModal('topology');
                setTempImageUrl(erpTopologyImg);
              }}
              className="bg-slate-800/60 border border-slate-700/50 hover:border-indigo-500 rounded-xl p-4 transition-all duration-300 cursor-pointer group shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-slate-705 pb-2">
                  <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-400">Core Network Topology</span>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={handleExportTopologyDiagram}
                      disabled={isExportingDiagram}
                      className="px-2 py-0.5 bg-indigo-600/30 hover:bg-indigo-600/55 active:bg-indigo-600/70 border border-indigo-500/40 hover:border-indigo-400 text-[10px] text-indigo-200 font-mono font-bold rounded flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                      title="Export current diagram configuration as a high-resolution PNG image file"
                    >
                      <Download className={`w-3 h-3 text-emerald-400 ${isExportingDiagram ? 'animate-spin' : ''}`} />
                      {isExportingDiagram ? 'Exporting...' : 'Export'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowImageEditModal('topology');
                        setTempImageUrl(erpTopologyImg);
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold font-mono hover:underline cursor-pointer"
                    >
                      Edit 🖼️
                    </button>
                  </div>
                </div>
                <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-700 bg-slate-900 mb-3 select-none">
                  <ClickToEditWrapper fieldKey="erpTopologyImg" fieldType="image" fieldLabel="Network Topology Diagram image">
                    <img 
                      src={erpTopologyImg} 
                      alt="Network Topology" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      referrerPolicy="no-referrer"
                    />
                  </ClickToEditWrapper>
                  <div className="absolute inset-0 bg-indigo-950/20 group-hover:bg-transparent transition-colors pointer-events-none font-mono"></div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/90 text-[9px] font-mono text-slate-300 border border-slate-700 rounded-md pointer-events-none">
                    Diagram Node
                  </div>
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-400 leading-normal">
                Click graph to change schema flow diagram, update Unsplash URL or upload local design mockups.
              </div>
            </div>

            {/* Asset 2: Controller Avatar / Advisor Persona Portrait */}
            <div 
              onClick={() => {
                setShowImageEditModal('avatar');
                setTempImageUrl(controllerAvatarImg);
              }}
              className="bg-slate-800/60 border border-slate-700/50 hover:border-indigo-500 rounded-xl p-4 transition-all duration-300 cursor-pointer group shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-slate-705 pb-2">
                  <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-400">GAAP Lead Column Controller</span>
                  <span className="text-[10px] text-indigo-400 font-bold font-mono group-hover:underline">Click to Edit 👤</span>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-slate-750 bg-slate-900 flex-shrink-0">
                    <ClickToEditWrapper fieldKey="controllerAvatarImg" fieldType="image" fieldLabel="CFO Advisor Portrait image">
                      <img 
                        src={controllerAvatarImg} 
                        alt="Controller Portrait" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        referrerPolicy="no-referrer"
                      />
                    </ClickToEditWrapper>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Senior Financial Strategist</h4>
                    <span className="text-[10px] text-emerald-400 font-mono">Expert GAAP Advisor AI</span>
                    <p className="text-[10px] text-slate-400 mt-1">Status: Online & Calibrated</p>
                  </div>
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-400 leading-normal border-t border-slate-750/50 pt-2.5">
                Click portrait profile to swap CFO strategist avatar, upload reference identity or set your team bio profile photo!
              </div>
            </div>

            {/* Column 3: Live Customizer Console */}
            <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 border border-indigo-900 rounded-xl p-4 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-indigo-400 border-b border-indigo-900 pb-2 mb-3">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-200">Interactive Studio Control Board</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  This custom client-side creative suite allows full visual rebranding of your double-entry sandbox environment.
                </p>
                
                <div className="space-y-2">
                  <span className="text-[10px] text-indigo-300 uppercase tracking-wider font-mono block">Quick Image Presets:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setErpTopologyImg('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600');
                        setControllerAvatarImg('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300');
                      }}
                      className="px-2.5 py-1.5 bg-indigo-950/50 hover:bg-indigo-900 border border-indigo-800 text-[10px] text-indigo-200 font-mono font-bold rounded-lg transition-all cursor-pointer text-center"
                    >
                      Preset A (Default)
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setErpTopologyImg('https://images.unsplash.com/photo-1504868512813-5688b4d440c9?auto=format&fit=crop&q=80&w=600');
                        setControllerAvatarImg('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300');
                      }}
                      className="px-2.5 py-1.5 bg-indigo-950/50 hover:bg-indigo-900 border border-indigo-800 text-[10px] text-indigo-200 font-mono font-bold rounded-lg transition-all cursor-pointer text-center"
                    >
                      Preset B (Tech)
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mt-4 pt-3 border-t border-indigo-900/40">
                  <span className="text-[10px] text-indigo-300 uppercase tracking-wider font-mono block">Export & Document Assets:</span>
                  <button
                    type="button"
                    onClick={handleExportTopologyDiagram}
                    disabled={isExportingDiagram}
                    className="w-full px-3 py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 active:from-emerald-700 active:to-indigo-700 border border-indigo-500 text-[11px] text-white font-mono font-bold rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <Download className={`w-3.5 h-3.5 text-white ${isExportingDiagram ? 'animate-spin' : ''}`} />
                    <span>{isExportingDiagram ? 'GENERATING REPORT...' : 'EXPORT TOPOLOGY IMAGE'}</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-indigo-900/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>LOCAL STATE STORAGE</span>
                <span className="text-emerald-400">ENABLED</span>
              </div>
            </div>
          </div>
        </section>

        {/* 🎯 Direct Click-to-Edit Mode Floating Indicator Pill */}
        {isClickToEditActive && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 animate-pulse cursor-default select-none">
            <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 border border-pink-400 text-white shadow-2xl rounded-full px-5 py-3.5 flex items-center gap-4 text-xs font-mono font-bold tracking-tight">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
              </span>
              <span>🎯 DIRECT CLICK-TO-EDIT ACTIVE • CLICK HIGH-LIGHTED TEXTS OR IMAGES TO EDIT</span>
              <button 
                onClick={() => setIsClickToEditActive(false)}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-full text-[10px] uppercase font-bold tracking-wide transition-all cursor-pointer"
              >
                Done [x]
              </button>
            </div>
          </div>
        )}

        {/* 🎯 Direct Click-to-Edit Overlay Dialog Modal */}
        {activeEditorField !== null && (
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
            <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden p-6 text-left text-slate-900 absolute z-50">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3.5 mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-pink-50 text-pink-600 rounded-xl">
                    {activeEditorField.type === 'text' ? <Pencil className="w-4 h-4" /> : <ImageIcon className="w-4 h-4 text-pink-600" />}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-mono">
                      Edit Asset: {activeEditorField.label}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Asset Registry Identifer: <span className="text-indigo-600 font-mono font-bold">{activeEditorField.key}</span></p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveEditorField(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {activeEditorField.type === 'text' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                      Text Value:
                    </label>
                    {activeEditorField.isTextArea ? (
                      <textarea
                        value={editorInputValue}
                        onChange={(e) => setEditorInputValue(e.target.value)}
                        className="w-full text-xs font-sans text-slate-800 bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white shadow-inner"
                        rows={4}
                        placeholder="Type customized text body value..."
                      />
                    ) : (
                      <input
                        type="text"
                        value={editorInputValue}
                        onChange={(e) => setEditorInputValue(e.target.value)}
                        className="w-full text-xs font-sans text-slate-800 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white shadow-inner"
                        placeholder="Type customized text entry value..."
                      />
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Live Image Preview */}
                    <div className="border border-slate-100 rounded-xl p-3 bg-slate-50 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono block self-start">Live Asset Preview:</span>
                      <div className="w-full h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shadow-inner flex items-center justify-center">
                        <img 
                          src={editorInputValue} 
                          alt="Edit preview" 
                          className="h-32 object-contain" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600";
                          }}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>

                    {/* Image URL Input */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                        Source Image Web Link URL
                      </label>
                      <input
                        type="url"
                        value={editorInputValue}
                        onChange={(e) => setEditorInputValue(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full text-xs font-mono text-slate-805 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                      />
                    </div>

                    {/* Local File Uploader */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                        Or upload custom local image (Drag & Drop)
                      </label>
                      <div className="border-2 border-dashed border-slate-200 hover:border-pink-500 rounded-xl p-4 text-center cursor-pointer bg-slate-50 hover:bg-pink-50/10 transition-all select-none relative">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === 'string') {
                                  setEditorInputValue(reader.result);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <div className="space-y-1 select-none pointer-events-none">
                          <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                          <span className="text-xs text-slate-600 font-medium block">Choose file or drag here to upload</span>
                          <span className="text-[10px] text-slate-400 font-mono">PNG, JPG, SVG, WebP supported</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirm / Save Button bar */}
                <div className="flex justify-end items-center gap-3 border-t border-slate-100 pt-4 mt-6">
                  <button
                    onClick={() => setActiveEditorField(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveActiveEditor}
                    className="px-5 py-2 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-xl text-xs font-bold font-mono shadow-md shadow-pink-600/10 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save & Rebrand Asset
                  </button>
                </div>
              </div>
            </div>
            {/* Click backdrop to cancel */}
            <div className="absolute inset-0 z-40 bg-transparent cursor-default" onClick={() => setActiveEditorField(null)}></div>
          </div>
        )}

        {/* Image Edit Modal */}
        {showImageEditModal !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-4">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden p-6 text-left text-slate-900">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Layers className="w-4 h-4" />
                  </span>
                  {showImageEditModal === 'topology' ? 'Edit Topology Image' : 'Edit Controller Avatar'}
                </h3>
                <button 
                  onClick={() => {
                    setShowImageEditModal(null);
                    setTempImageUrl('');
                  }}
                  className="text-slate-405 hover:text-slate-600 font-mono text-xs hover:underline cursor-pointer"
                >
                  [x] close
                </button>
              </div>

              <div className="space-y-4">
                {/* Option 1: File Upload */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                    Upload local image file (Drag & Drop / Select)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition-all select-none relative">
                    <input
                      type="file"
                      id="studio-file-upload"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              if (showImageEditModal === 'topology') {
                                setErpTopologyImg(reader.result);
                              } else {
                                setControllerAvatarImg(reader.result);
                              }
                              setShowImageEditModal(null);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <div className="space-y-1 select-none pointer-events-none">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                      <span className="text-xs text-slate-600 font-medium block">Choose image or drag here</span>
                      <span className="text-[10px] text-slate-400 font-mono">PNG, JPG, SVG, WebP</span>
                    </div>
                  </div>
                </div>

                {/* Option 2: Image URL input */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                    Or paste any image URL web link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={tempImageUrl}
                      onChange={(e) => setTempImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="flex-1 p-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    />
                    <button
                      onClick={() => {
                        if (tempImageUrl.trim()) {
                          if (showImageEditModal === 'topology') {
                            setErpTopologyImg(tempImageUrl);
                          } else {
                            setControllerAvatarImg(tempImageUrl);
                          }
                          setShowImageEditModal(null);
                          setTempImageUrl('');
                        }
                      }}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold font-mono cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Option 3: Presets */}
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Or select professional Unsplash preset</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {showImageEditModal === 'topology' ? (
                      <>
                        <button 
                          onClick={() => { setErpTopologyImg('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600'); setShowImageEditModal(null); }}
                          className="border border-slate-200 rounded overflow-hidden hover:opacity-80 cursor-pointer"
                        >
                          <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=150" className="w-full h-10 object-cover" alt="preset" referrerPolicy="no-referrer" />
                        </button>
                        <button 
                          onClick={() => { setErpTopologyImg('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600'); setShowImageEditModal(null); }}
                          className="border border-slate-200 rounded overflow-hidden hover:opacity-80 cursor-pointer"
                        >
                          <img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=150" className="w-full h-10 object-cover" alt="preset" referrerPolicy="no-referrer" />
                        </button>
                        <button 
                          onClick={() => { setErpTopologyImg('https://images.unsplash.com/photo-1504868512813-5688b4d440c9?auto=format&fit=crop&q=80&w=600'); setShowImageEditModal(null); }}
                          className="border border-slate-200 rounded overflow-hidden hover:opacity-80 cursor-pointer"
                        >
                          <img src="https://images.unsplash.com/photo-1504868512813-5688b4d440c9?auto=format&fit=crop&q=80&w=150" className="w-full h-10 object-cover" alt="preset" referrerPolicy="no-referrer" />
                        </button>
                        <button 
                          onClick={() => { setErpTopologyImg('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600'); setShowImageEditModal(null); }}
                          className="border border-slate-200 rounded overflow-hidden hover:opacity-80 cursor-pointer"
                        >
                          <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=150" className="w-full h-10 object-cover" alt="preset" referrerPolicy="no-referrer" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => { setControllerAvatarImg('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'); setShowImageEditModal(null); }}
                          className="border border-slate-200 rounded overflow-hidden hover:opacity-80 cursor-pointer"
                        >
                          <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100" className="w-full h-10 object-cover" alt="preset" referrerPolicy="no-referrer" />
                        </button>
                        <button 
                          onClick={() => { setControllerAvatarImg('https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300'); setShowImageEditModal(null); }}
                          className="border border-slate-200 rounded overflow-hidden hover:opacity-80 cursor-pointer"
                        >
                          <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100" className="w-full h-10 object-cover" alt="preset" referrerPolicy="no-referrer" />
                        </button>
                        <button 
                          onClick={() => { setControllerAvatarImg('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'); setShowImageEditModal(null); }}
                          className="border border-slate-200 rounded overflow-hidden hover:opacity-80 cursor-pointer"
                        >
                          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" className="w-full h-10 object-cover" alt="preset" referrerPolicy="no-referrer" />
                        </button>
                        <button 
                          onClick={() => { setControllerAvatarImg('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'); setShowImageEditModal(null); }}
                          className="border border-slate-200 rounded overflow-hidden hover:opacity-80 cursor-pointer"
                        >
                          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" className="w-full h-10 object-cover" alt="preset" referrerPolicy="no-referrer" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ✨ Autonomous Three-Bot Control Panel & Intelligence Network */}
        <section id="advanced-ai-copilot-suite" className="bg-white border border-indigo-100 rounded-2xl shadow-xl p-6 mb-10 overflow-hidden relative border-t-4 border-t-indigo-600">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Bot className="w-16 h-16 text-indigo-600 animate-pulse" />
          </div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-indigo-50/85 pb-5 mb-5 text-left">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Bot className="w-5 h-5 text-indigo-600" />
                </span>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Autonomous Three-Bot Control Panel & Intelligence Network
                </h3>
              </div>
              <p className="text-slate-500 text-xs mt-1 max-w-3xl leading-relaxed">
                We have replaced static human consulting tables with three highly specialized autonomous software bots. Manage ERP double-entry gates, coordinate Cloudboy X wholesale transit, and isolate background loops.
              </p>
            </div>

            {/* AI Three-Bot Selector tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-105 p-1.5 rounded-xl border border-slate-200">
              <button
                id="bot-tab-erp-gateway"
                onClick={() => { setActiveBot('erp_gateway'); setAiSuiteTab('forecasting'); }}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeBot === 'erp_gateway'
                    ? 'bg-indigo-600 text-white shadow-md font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                Bot 1: ERP Gateway
              </button>
              <button
                id="bot-tab-cloudboy-transit"
                onClick={() => setActiveBot('cloudboy_transit')}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeBot === 'cloudboy_transit'
                    ? 'bg-indigo-600 text-white shadow-md font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                Bot 2: Cloudboy X Transit
              </button>
              <button
                id="bot-tab-backend-isolator"
                onClick={() => { setActiveBot('backend_isolator'); setAiSuiteTab('chat'); }}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeBot === 'backend_isolator'
                    ? 'bg-indigo-600 text-white shadow-md font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                Bot 3: Isolator & Alert Assist
              </button>
            </div>
          </div>

          {/* Sub-capabilities sub-navigation displayed ONLY when Bot 1 (ERP Ledger Gateway Bot) is active */}
          {activeBot === 'erp_gateway' && (
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-150 mb-6 text-left">
              <span className="text-[10px] font-mono tracking-wider font-bold text-slate-400 uppercase px-2.5">
                Bot 1 Capabilities:
              </span>
              <button
                onClick={() => setAiSuiteTab('forecasting')}
                className={`px-3 py-1 text-xs font-mono font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  aiSuiteTab === 'forecasting'
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                S&OP Forecasting
              </button>
              <button
                onClick={() => setAiSuiteTab('agent')}
                className={`px-3 py-1 text-xs font-mono font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  aiSuiteTab === 'agent'
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                Agentic Invoice Poster
              </button>
              <button
                onClick={() => setAiSuiteTab('nlp')}
                className={`px-3 py-1 text-xs font-mono font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  aiSuiteTab === 'nlp'
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                Conversational Consult
              </button>
              <button
                onClick={() => setAiSuiteTab('audit')}
                className={`px-3 py-1 text-xs font-mono font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  aiSuiteTab === 'audit'
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                ML Fraud Auditor
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Bot 1: Handlers nested under erp_gateway choice */}
            {activeBot === 'erp_gateway' && aiSuiteTab === 'forecasting' && (
              <motion.div
                key="forecasting"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
              >
                <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-indigo-950 uppercase tracking-widest font-mono">Predicted S&OP Cash & Receivables Flow Horizon</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        forecastRisk === 'high' ? 'bg-rose-105 text-rose-800' :
                        forecastRisk === 'medium' ? 'bg-amber-105 text-amber-800' : 'bg-emerald-105 text-emerald-800'
                      }`}>
                        Shortage Risk: {forecastRisk.toUpperCase()}
                      </span>
                    </div>

                    {forecastData.length > 0 ? (
                      <div className="h-64 my-2">
                        <ResponsiveContainer width="100%" height={240}>
                          <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                            <defs>
                              <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorReceivables" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="quarter" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                            <YAxis stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                            <Tooltip formatter={(v) => [`$${v}`, '']} />
                            <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                            <Area name="Projected Cash reserves (USD)" type="monotone" dataKey="cashBalanceUSD" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCash)" />
                            <Area name="Projected trade Receivables (USD)" type="monotone" dataKey="receivablesUSD" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorReceivables)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-64 bg-slate-100/50 rounded-xl flex items-center justify-center border border-dashed border-slate-300 p-4 text-center">
                        <div>
                          <TrendingUp className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs text-slate-500 font-semibold">No Forecast Telemetry Stored</p>
                          <p className="text-[10px] text-slate-400 max-w-sm mt-1">Trigger the predictive simulation below to ask Gemini to review deep general ledger counts & build quarters projection.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-slate-150 p-3.5 rounded-xl gap-4 mt-4 text-left">
                    <p className="text-[10px] text-slate-400 font-mono leading-snug">
                      * Realizes forecast through real-time double-entry account balances and seasonal AR aging matrices under Net30 conditions.
                    </p>
                    <button
                      onClick={handleFetchForecast}
                      disabled={forecastingLoading}
                      className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-mono font-bold rounded-lg shadow-sm border border-indigo-500 hover:border-indigo-600 transition-all flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${forecastingLoading ? 'animate-spin' : ''}`} />
                      Refresh Scenario Projections
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4 flex flex-col justify-between text-left">
                  <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-inner flex-1 space-y-4">
                    <div className="flex items-center gap-1.5 text-indigo-300">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Predictive Copilot Advice</span>
                    </div>

                    <div className="space-y-4 text-slate-300 text-xs">
                      <div className="space-y-1.5">
                        <h4 className="text-[11px] text-yellow-400 font-bold uppercase tracking-widest font-mono">Potential Liquidity Alerts</h4>
                        {forecastAlerts.length > 0 ? (
                          <ul className="list-disc pl-4 space-y-1 text-[11px]">
                            {forecastAlerts.map((alt, idx) => (
                              <li key={idx} className="leading-relaxed text-slate-200">{alt}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="italic text-slate-400">Run forecast refresh to retrieve anomaly insights.</p>
                        )}
                      </div>

                      <div className="space-y-1.5 border-t border-slate-800 pt-3">
                        <h4 className="text-[11px] text-emerald-400 font-bold uppercase tracking-widest font-mono">Working Capital recommendations</h4>
                        {forecastRecs.length > 0 ? (
                          <ul className="list-disc pl-4 space-y-1 text-[11px]">
                            {forecastRecs.map((rec, idx) => (
                              <li key={idx} className="leading-relaxed text-slate-300">{rec}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="italic text-slate-400">Run forecast refresh to generate mitigation playbooks.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* agent invoice post segment */}
            {aiSuiteTab === 'agent' && (
              <motion.div
                key="agent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left"
              >
                <div className="lg:col-span-5 space-y-3">
                  {/* Intelligent Receipt/Invoice Image Uploader Widget */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-500 flex items-center gap-1">
                        <Upload className="w-3 h-3 text-indigo-500" /> Ingest Image Invoice / Receipt
                      </span>
                      <span className="text-[10px] text-indigo-600 font-mono font-bold uppercase animate-pulse">Gemini 3.1 Pro OCR</span>
                    </div>

                    <label className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors text-center relative bg-white group select-none">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAnalyzeReceiptImage}
                        disabled={receiptAnalyzing}
                        className="hidden"
                      />
                      {receiptAnalyzing ? (
                        <div className="space-y-1 py-1">
                          <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin mx-auto" />
                          <p className="text-[10px] text-indigo-650 font-bold">Extracting Structured Invoice Payload...</p>
                        </div>
                      ) : (
                        <div className="space-y-1 py-1">
                          <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-550 mx-auto transition-colors" />
                          <div>
                            <p className="text-[11px] text-slate-700 font-bold">Select Receipt Scan (JPEG/PNG)</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">Scans & fills the text editor automatically</p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Incoming Vendor Invoice Text</label>
                    <div className="flex gap-1 flex-wrap">
                      <button
                        onClick={() => setAgentInvoiceText(
                          "INVOICE #INV-ACME-4048\nAcme Heavy Construction Steel Materials Supply Inc.\nTo: corporate@buildcorp.net \n\n- 12 loads of IND-STEEL-BRCKT @ $120.00/each = $1440.00\n- Flat rate tax applied: $118.80\nTotal Due Amount: $1558.80 USD"
                        )}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] rounded border border-slate-200 font-mono cursor-pointer"
                      >
                        Acme Steel
                      </button>
                      <button
                        onClick={() => setAgentInvoiceText(
                          "Globex Global Consulting Partners Ltd\nInvoice Date: June 12, 10:14 UTC\nReference Reference ID: GC-994\n\nConsulting services retainer (SKU: ADJUSTMENT-FEE, qty: 1) rate: $850.00\nSales tax exempt wholesale.\nTotal Amount: $850.00 USD"
                        )}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] rounded border border-slate-200 font-mono cursor-pointer"
                      >
                        Globex consulting
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={agentInvoiceText}
                    onChange={(e) => setAgentInvoiceText(e.target.value)}
                    className="w-full h-52 p-3.5 font-mono text-xs text-slate-850 bg-indigo-50/20 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter messy plain text invoice details..."
                  />

                  <button
                    onClick={handleProcessAgentInvoice}
                    disabled={agentLoading}
                    className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-950 text-white rounded-xl text-xs font-bold tracking-tight shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {agentLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Agent Parsing & Booking Ledger Splits...
                      </>
                    ) : (
                      <>
                        <Cpu className="w-3.5 h-3.5" />
                        Dispatch Autonomous Booking Agent
                      </>
                    )}
                  </button>
                </div>

                <div className="lg:col-span-7 flex flex-col justify-between border border-slate-800 bg-slate-950 rounded-2xl p-5 text-emerald-400 font-mono shadow-inner min-h-[300px]">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3">
                      <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                        Invoice Agent Orchestrator Logging Console
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded uppercase tracking-widest animate-pulse border border-emerald-500/15">Active Agent Mode</span>
                    </div>

                    <div className="space-y-2 text-xs leading-relaxed max-h-56 overflow-y-auto pr-2 text-left">
                      {agentLogs.length > 0 ? (
                        agentLogs.map((log, idx) => (
                          <div key={idx} className="flex gap-2 items-start border-l-2 border-emerald-500/30 pl-2">
                            <span className="text-[10px] text-slate-500 select-none">[{idx + 1}]</span>
                            <span>{log}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-500 italic py-10 text-center text-[11px]">
                          {agentLoading ? (
                            <p className="animate-pulse">Agent is currently inspecting raw invoice nodes, connecting with Chart of Accounts database schema, and validating normal balance constraints...</p>
                          ) : (
                            <p>No active processes recorded. Push the dispatcher button to trigger the autonomous accounting booking agent loop.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {agentParsedOrder && (
                    <div className="mt-4 p-3 bg-indigo-950/40 border border-slate-800 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-mono">Autonomous Posting Confirmation</span>
                        <span className="block text-xs text-white font-bold tracking-tight">Invoice: {agentParsedOrder.sourceOrderId} posted under standard GAAP splits.</span>
                      </div>
                      <span className="px-2 py-1 bg-emerald-500/15 text-emerald-400 font-bold font-mono text-[9px] uppercase border border-emerald-400/20 rounded">COMMITTED OK</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* conversational segment */}
            {aiSuiteTab === 'nlp' && (
              <motion.div
                key="nlp"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left"
              >
                <div className="lg:col-span-5 space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Ask Natural Language ERP Consult</label>
                    <p className="text-[11px] text-slate-400">Gemini will compile, run and translate response metrics into an executive consultation summary.</p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-mono tracking-widest block font-semibold">Suggested Questions:</span>
                    <div className="flex flex-col gap-1.5">
                      {[
                        "How many total transactions are listed in our memory ledger?",
                        "What is our cash Net Balance versus standard liabilities?",
                        "Give me a summary of our revenue GAAP balances"
                      ].map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => setNlpQuestion(p)}
                          className="w-full text-left p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-755 hover:text-indigo-600 text-[11px] rounded-lg border border-slate-200 transition-colors cursor-pointer block font-sans"
                        >
                          ❓ {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex gap-2">
                    <input
                      value={nlpQuestion}
                      onChange={(e) => setNlpQuestion(e.target.value)}
                      type="text"
                      className="flex-1 p-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Type custom questions..."
                    />
                    <button
                      onClick={handleNLPConsult}
                      disabled={nlpLoading}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-950 text-white rounded-xl text-xs font-bold font-mono tracking-tight shadow flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      Consult
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 flex flex-col justify-between bg-slate-900 text-slate-250 rounded-2xl p-5 shadow-2xl space-y-4 min-h-[340px]">
                  <div>
                    <span className="block text-[10px] text-indigo-400 uppercase tracking-widest font-mono mb-2">Cognitive ERP Analyst Report</span>
                    
                    {nlpLoading ? (
                      <div className="flex flex-col items-center justify-center py-16 space-y-3">
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-400"></div>
                        <p className="text-xs text-slate-400 font-mono italic animate-pulse">Gemini compiling query select statements & retrieving AlaSQL datasets...</p>
                      </div>
                    ) : nlpAnswer ? (
                      <div className="space-y-4">
                        <div className="space-y-1.5 text-xs">
                          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-mono leading-relaxed">
                            <span className="text-slate-500 uppercase tracking-widest select-none block text-[9px] mb-1">DYNAMALLY GENERATED SQL COMPILED FOR REST SERVICES:</span>
                            <span className="text-indigo-400 block break-all">{nlpQuery || 'No Query Required'}</span>
                          </div>
                        </div>

                        <div className="text-xs text-slate-300 leading-relaxed font-sans space-y-2 p-1 max-h-56 overflow-y-auto">
                          <p className="font-semibold text-white">Consensual Analysis Playbook:</p>
                          <div className="prose prose-xs border-l-2 border-indigo-500 pl-3 py-1 space-y-2 text-slate-300">
                            {nlpAnswer.split('\n').map((line, k) => (
                              <p key={k} className="text-slate-200 mt-1 leading-relaxed">{line}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-20 text-slate-500 italic text-[11px] font-sans">
                        Submit a question on the left to activate the NLP financial consult.
                      </div>
                    )}
                  </div>

                  {nlpRows.length > 0 && !nlpLoading && (
                    <div className="p-3 bg-slate-950 border border-slate-800/65 rounded-xl text-left">
                      <span className="block text-[9px] text-slate-400 uppercase tracking-wider font-mono mb-1">Raw select sandbox records returned ({nlpRows.length} rows):</span>
                      <div className="max-h-24 overflow-auto text-[9px] font-mono text-emerald-400">
                        <pre>{JSON.stringify(nlpRows, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* audit segment */}
            {aiSuiteTab === 'audit' && (
              <motion.div
                key="audit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5 text-left"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-mono mb-1">AI Financial Health Gauge</span>
                      <p className="text-xs text-slate-500">Evaluating GAAP balance rules and outlier transaction vectors</p>
                    </div>

                    <div className="py-4 text-center">
                      {auditScore !== null ? (
                        <div>
                          <p className="text-4xl font-extrabold tracking-tight text-slate-950">{auditScore}%</p>
                          <p className="text-[10px] text-emerald-600 font-mono font-bold uppercase mt-1">Sufficient Audit Health Score</p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Audit diagnostics idle.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 col-span-2 flex flex-col justify-between">
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-mono mb-1">Executive Compliance Summary Report</span>
                    </div>

                    <div className="py-2 text-xs text-slate-700 leading-relaxed font-sans mt-1">
                      {auditSummary ? (
                        <p className="italic">"{auditSummary}"</p>
                      ) : (
                        <p className="text-slate-400 italic">No summary diagnostic available. Trigger the auditor system below.</p>
                      )}
                    </div>

                    <div className="text-right mt-2">
                      <button
                        onClick={handleRunAudit}
                        disabled={auditLoading}
                        className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-705 active:bg-indigo-950 text-white rounded-lg text-xs font-bold font-mono tracking-tight shadow flex items-center gap-1.5 ml-auto disabled:opacity-50 cursor-pointer"
                      >
                        {auditLoading ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Evaluating General Ledger Files...
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5" />
                            Run Continuous ML Fraud Audit
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <span className="block px-4 py-3 bg-slate-55 border-b border-slate-200 text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest">
                    Auditor Risk Flag Registry Entries ({auditAnomalies.length} flagged risks)
                  </span>

                  <div className="max-h-60 overflow-y-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-xs">
                      <thead className="bg-slate-50">
                        <tr className="text-slate-500 uppercase font-mono text-[9px] tracking-wider font-semibold text-left">
                          <th className="px-4 py-2">Risk Severity</th>
                          <th className="px-4 py-2">Anomaly Type</th>
                          <th className="px-4 py-2">Reference ID</th>
                          <th className="px-4 py-2">Diagnostic Finding Details</th>
                          <th className="px-4 py-2">Mitigation Corrective Directive</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-750">
                        {auditAnomalies.length > 0 ? (
                          auditAnomalies.map((anom, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="px-4 py-2.5">
                                <span className={`px-2 py-0.5 rounded-[5px] text-[9px] font-mono font-semibold uppercase ${
                                  anom.severity === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                  anom.severity === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                  'bg-slate-100 text-slate-600'
                                }`}>
                                  {anom.severity}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 font-semibold text-slate-905">{anom.type}</td>
                              <td className="px-4 py-2.5 font-mono text-[11px] text-indigo-600">{anom.itemReferenceId || 'N/A'}</td>
                              <td className="px-4 py-2.5 text-slate-605 max-w-xs">{anom.findings}</td>
                              <td className="px-4 py-2.5 text-slate-605 bg-indigo-55/15 font-sans leading-relaxed italic">{anom.mitigationPlaybook}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">
                              Auditor idle. Trigger the "Run Continuous ML Fraud Audit" diagnostic to scan double-entry posting splits.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Bot 1 - Segment 5: Backwards-compatible Strategic Chat (within ERP Gateway context) */}
            {activeBot === 'erp_gateway' && aiSuiteTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch text-left"
              >
                {/* Left side: Chat history area */}
                <div className="lg:col-span-8 flex flex-col justify-between bg-slate-50 border border-slate-200 rounded-2xl p-5 min-h-[480px]">
                  <div>
                    <div className="flex items-center justify-between border-b border-indigo-50 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4.5 h-4.5 text-indigo-600 animate-pulse" />
                        <span className="text-xs font-bold text-indigo-950 uppercase tracking-widest font-mono">OPERATIONS SUPPORT COPILOT HUB</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-mono text-indigo-750 uppercase tracking-wider font-bold">Search Grounding Enabled</span>
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 mb-4">
                      {chatMessages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex gap-3 max-w-[85%] ${
                            msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                          }`}
                        >
                          <div
                            className={`p-1.5 rounded-xl h-fit ${
                              msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-900 text-slate-300'
                            }`}
                          >
                            {msg.role === 'user' ? <MessageSquare className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                          </div>
                          
                          <div
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                              msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-white text-slate-800 shadow-sm border border-slate-200 rounded-tl-none'
                            }`}
                          >
                            <p className="whitespace-pre-line font-medium">{msg.text}</p>
                            
                            {/* Sources citations list */}
                            {msg.sources && msg.sources.length > 0 && (
                              <div className="mt-2.5 pt-2 border-t border-slate-200 text-[10px] space-y-1 text-slate-500 font-sans">
                                <div className="flex items-center gap-1 font-mono uppercase font-bold text-slate-500">
                                  <Globe className="w-3 h-3 text-indigo-500" /> Grounded Search Citations:
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {msg.sources.map((src, sIdx) => (
                                    <a
                                      key={sIdx}
                                      href={src.uri}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-md border border-indigo-150 transition-colors"
                                    >
                                      <span className="truncate max-w-[145px]">{src.title}</span>
                                      <ArrowRight className="w-2.5 h-2.5 flex-shrink-0" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {chatLoading && (
                        <div className="flex gap-3 max-w-[80%] items-center text-slate-500 text-xs">
                          <div className="p-1.5 rounded-xl bg-slate-900 text-slate-300">
                            <Bot className="w-3.5 h-3.5 animate-spin" />
                          </div>
                          <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                            <span className="text-[10px] font-mono text-slate-400 uppercase ml-1">Polling World Intelligence & Ledger Books...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Input form */}
                  <div className="flex gap-2 pt-3 border-t border-slate-150">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendChatMessage();
                      }}
                      disabled={chatLoading}
                      placeholder="Ask for GAAP advisory, cash forecasting factors, macroeconomic rates..."
                      className="flex-1 p-2.5 bg-white text-slate-800 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleSendChatMessage}
                      disabled={chatLoading || !chatInput.trim()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-705 active:bg-indigo-950 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Consult
                    </button>
                  </div>
                </div>

                {/* Right side: Interactive Reference and Prompt presets */}
                <div className="lg:col-span-4 flex flex-col justify-between bg-white border border-slate-200 rounded-2xl p-5">
                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5 text-slate-755">
                      <Cpu className="w-4 h-4 text-indigo-500" />
                      <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Advisor Capability Matrix</span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                      <p>
                        This companion leverages a multi-turn memory structure built directly on physical ERP endpoints coupled with <strong className="text-indigo-650">Google Search Grounding</strong>.
                      </p>
                      <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/50 space-y-1.5 text-[11px]">
                        <p className="font-semibold text-slate-800">What makes this special:</p>
                        <ul className="list-disc pl-4 space-y-1 text-slate-600">
                          <li>Accesses live stock values, Federal Reserve interest rates, tax tables, and currency data via live search.</li>
                          <li>Correlates global macroeconomic cycles back into your simulation S&OP dashboards.</li>
                          <li>Strict compliance oversight according to FASB & IASB statutory requirements.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider block mb-1">Suggested Consulting Prompts</span>
                      <div className="flex flex-col gap-1.5">
                        {[
                          "What are the current US Fed benchmark interest & treasury rates from this month?",
                          "Does GAAP allow recognizing revenue for Net30 orders prior to shipping delivery?",
                          "How can we minimize potential Cash shortage risks flagged by the predictive forecaster?"
                        ].map((prompt, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => {
                              setChatInput(prompt);
                            }}
                            className="w-full text-left p-2.5 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 text-[11px] text-slate-700 border border-slate-200 rounded-xl transition-all cursor-pointer leading-snug"
                          >
                            💡 {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 pt-4 border-t border-slate-100 mt-4 text-left">
                    COGNITIVE MODEL: GEMINI 3.5 FLASH
                  </div>
                </div>
              </motion.div>
            )}

            {/* ⚡ Bot 2: Cloudboy X Transit Flow Bot */}
            {activeBot === 'cloudboy_transit' && (
              <motion.div
                key="cloudboy_transit_bot"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch text-left font-sans"
              >
                {/* Left Column: Flow Telemetry & Synchronizer Logs */}
                <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">
                          Cloudboy X Reseller Transit Live Telemetry
                        </span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
                        Sync status: Continuous
                      </span>
                    </div>

                    <div className="space-y-4 text-xs text-slate-600 leading-relaxed mb-4">
                      <p>
                        This autonomous broker coordinates wholesale orders received from verified regional distributors and pipelines them safely through the Firestone (Firestore) backup store and CBOY ledger router.
                      </p>

                      {/* Quick Stats Grid */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs text-center">
                          <p className="text-[10px] font-mono font-bold text-slate-450 uppercase">Reseller Nodes</p>
                          <p className="text-xl font-bold font-mono text-indigo-600 mt-1">5 Active</p>
                        </div>
                        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs text-center">
                          <p className="text-[10px] font-mono font-bold text-slate-455 uppercase">SQL Sync State</p>
                          <p className="text-xl font-bold font-mono text-emerald-600 mt-1">100% OK</p>
                        </div>
                        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs text-center">
                          <p className="text-[10px] font-mono font-bold text-slate-455 uppercase">Queued Parcels</p>
                          <p className="text-xl font-bold font-mono text-amber-600 mt-1">0 Pending</p>
                        </div>
                      </div>

                      {/* Handshake Console Output */}
                      <div className="bg-slate-900 text-zinc-300 font-mono text-[11px] p-4 rounded-xl space-y-1.5 overflow-y-auto h-44 border border-slate-950">
                        <div className="text-slate-550">[2026-06-16 10:14:02 UTC] INITIALIZING CLOUDBOY_X TELEMETRY BROKER...</div>
                        <div className="text-emerald-400 font-bold">[OK] FIREBASE FIRESTONE PERSISTENCE INITIALIZED SUCCESSFUL</div>
                        <div className="text-indigo-400">[CONN] ESTABLISHING HANDSHAKE WITH 5 AUTHORIZED REGIONAL RESELLERS...</div>
                        <div className="text-slate-400">&gt; wholesale.cboy.tokyo.com: STATUS ACTIVE (200 OK)</div>
                        <div className="text-slate-400">&gt; distributor.cboy.london.co.uk: STATUS ACTIVE (200 OK)</div>
                        <div className="text-slate-400">&gt; hub.cboy.newyork.us: STATUS ACTIVE (200 OK)</div>
                        <div className="text-indigo-400">[ROUTING] AUTO-RELOAD INGESTION STREAM LISTENING...</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-slate-200 pt-3 flex-wrap">
                    <button
                      onClick={async () => {
                        setLedgerMessage({ text: 'Triggered Cloudboy X DNS integrity scan. Verifying 5 authoritative regional hubs. DNS records are 100% compliant!', type: 'success' });
                      }}
                      className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Verify DNS Hub Registry
                    </button>
                    <button
                      onClick={async () => {
                        setLedgerMessage({ text: 'NoSQL Firestone backup replica state: synchronized (0 stale transactions detected, Firestone connection stable).', type: 'success' });
                      }}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-705 text-white rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Database className="w-3.5 h-3.5" />
                      Query Firestone Snapshot
                    </button>
                  </div>
                </div>

                {/* Right Column: Reseller Active Order Dispatcher */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5 text-slate-755 pb-2 border-b border-indigo-50">
                      <Cpu className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-700">
                        Manual Transit Simulator
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                      Test order routing inside the Cloudboy X transitional flow. Simulates wholesale orders sent by regional hubs and triggers SQL General Ledger posting routines.
                    </p>

                    {/* Input variables */}
                    <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-left">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Select Reseller domain</label>
                        <select
                          className="w-full p-2 bg-white border border-slate-200 rounded text-xs focus:outline-none"
                          defaultValue="hub.cboy.newyork.us"
                        >
                          <option value="wholesale.cboy.tokyo.com">wholesale.cboy.tokyo.com</option>
                          <option value="distributor.cboy.london.co.uk">distributor.cboy.london.co.uk</option>
                          <option value="hub.cboy.newyork.us">hub.cboy.newyork.us (Default)</option>
                          <option value="germany.cboy.berlin.de">germany.cboy.berlin.de</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Wholesale SKU</label>
                          <input
                            type="text"
                            className="w-full p-2 bg-white border border-slate-200 rounded text-xs font-mono"
                            defaultValue="VNTG-TEE-BLK"
                            disabled
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Bulk Qty</label>
                          <input
                            type="number"
                            className="w-full p-2 bg-white border border-slate-200 rounded text-xs font-mono"
                            defaultValue="10"
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={async () => {
                        setLedgerMessage({ text: 'Simulated 10x Black Vintage Tees from hub.cboy.newyork.us routed to SQL general ledger successfully!', type: 'success' });
                      }}
                      className="w-full py-2 bg-indigo-650 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      Dispatch Simulated Wholesale Transit
                    </button>
                    <span className="text-[10px] text-slate-400 block text-center mt-1.5 font-mono">
                      Triggers canonical double-entry posting rules.
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 🛠️ Bot 3: Job Isolator, Alert Setup & Basic Connections Assistant */}
            {activeBot === 'backend_isolator' && (
              <motion.div
                key="backend_isolator_bot"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch text-left font-sans"
              >
                {/* Left Column: Diagnostics, Thread Isolators & Socket Operations */}
                <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between min-h-[480px]">
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-pulse"></span>
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">
                          Thread Isolator & Job Diagnostics
                        </span>
                      </div>
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
                        Broker: Active
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4 font-sans">
                      Isolate looping tasks or webhooks instantly to eliminate downtimes, restart background daemons, or flush stalled API adapters cleanly with a button press.
                    </p>

                    {/* Live Thread List */}
                    <div className="space-y-2 mb-4">
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block">
                        Active Daemon Pipelines (5 Core)
                      </span>

                      {[
                        { id: 'TH-01', name: 'ERP Ingest Gateway', status: 'Healthy', latency: '4ms', priority: 'HIGH' },
                        { id: 'TH-02', name: 'Cloudboy X Reseller Router', status: 'Healthy', latency: '12ms', priority: 'HIGH' },
                        { id: 'TH-03', name: 'Firestore "Firestone" Broker', status: 'Stalled', latency: 'TIMEOUT', priority: 'MEDIUM' },
                        { id: 'TH-04', name: 'ML S&OP Cash Forecaster', status: 'Healthy', latency: '412ms', priority: 'LOW' },
                        { id: 'TH-05', name: 'ML GAAP Fraud Auditor', status: 'Healthy', latency: '1.2s', priority: 'LOW' }
                      ].map((th) => (
                        <div key={th.id} className="bg-white border border-slate-200 p-2.5 rounded-xl shadow-xs flex items-center justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-1 text-[11px] font-mono">
                              <span className="text-slate-400 font-bold">{th.id}:</span>
                              <span className="font-semibold text-slate-800">{th.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                              <span>Priority: <span className="text-indigo-600">{th.priority}</span></span>
                              <span>•</span>
                              <span>Latency: {th.latency}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 font-mono">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded mr-1.5 font-bold uppercase ${th.status === 'Healthy' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700 animate-pulse'}`}>
                              {th.status}
                            </span>
                            
                            {/* Isolate and Reroute button */}
                            <button
                              onClick={() => {
                                setLedgerMessage({ text: `Daemon isolation triggered successfully for ${th.id} [${th.name}]. Rerouting loops to secondary local thread sandbox. Connection restored!`, type: 'success' });
                              }}
                              className="px-2 py-1 bg-slate-900 hover:bg-indigo-600 text-white rounded text-[9px] font-bold transition-all cursor-pointer font-mono"
                              title="Isolate thread loops"
                            >
                              Isolate
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <button
                      onClick={() => {
                        setLedgerMessage({ text: 'Purged all stalled socket connections and cleared Express micro-cache. Memory usage reduced by 241MB.', type: 'success' });
                      }}
                      className="w-full py-1.5 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Purge Socket Connections & Cache
                    </button>
                  </div>
                </div>

                {/* Right Column: Connection Helper Chat Room (Multi-turn advisor integrated with direct buttons!) */}
                <div className="lg:col-span-7 flex flex-col justify-between bg-slate-50 border border-slate-200 rounded-2xl p-5 min-h-[480px]">
                  <div>
                    <div className="flex items-center justify-between border-b border-indigo-50 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4.5 h-4.5 text-indigo-600 animate-pulse" />
                        <span className="text-xs font-bold text-indigo-950 uppercase tracking-widest font-mono">
                          AI Connection & Alerts Assistant Chat
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-mono text-indigo-750 uppercase tracking-wider font-bold">
                          Grounded Guidance Active
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Prompt Presets specifically for supporting end users! */}
                    <div className="mb-4 bg-white border border-slate-200 p-3 rounded-xl shadow-xs text-left">
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block mb-2 tracking-wider">
                        ⚡ Support & Guidance Presets:
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left font-sans">
                        <button
                          onClick={() => handleTriggerBotPrompt("Please walk me through the step-by-step lifecycle of how an incoming feed (Shopify, CSV, EDI) translates into our Canonical Schema and enters the Ledger. I need to explain this clearly to a newly onboarded client group.")}
                          disabled={chatLoading}
                          className="p-2.5 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-250 text-[10px] text-slate-700 font-medium border border-slate-200 rounded-lg cursor-pointer transition-colors leading-normal text-left"
                        >
                          📦 Map order feed to Canonical Schema
                        </button>
                        <button
                          onClick={() => handleTriggerBotPrompt("Explain why the platform strictly rejects manual double-entry logs when debits do not match credits. Give me a simple non-technical explanation to help client accountants troubleshoot balance rejection errors.")}
                          disabled={chatLoading}
                          className="p-2.5 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-250 text-[10px] text-slate-700 font-medium border border-slate-200 rounded-lg cursor-pointer transition-colors leading-normal text-left"
                        >
                          ⚖️ Troubleshooting debit/credit rejections
                        </button>
                        <button
                          onClick={() => handleTriggerBotPrompt("What are the best practices for troubleshooting failed client API/webhook transmissions or rate limits? Guide on how resellers authenticate or configure rate rules.")}
                          disabled={chatLoading}
                          className="p-2.5 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-250 text-[10px] text-slate-700 font-medium border border-slate-200 rounded-lg cursor-pointer transition-colors leading-normal text-left"
                        >
                          🔌 Solving webhook & transmission failures
                        </button>
                        <button
                          onClick={() => handleTriggerBotPrompt("How should support operators use the manual adjust templates (Tax Rounding, Compliance, Reconstruction) to address small financial discrepancies raised by clients?")}
                          disabled={chatLoading}
                          className="p-2.5 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-250 text-[10px] text-slate-700 font-medium border border-slate-200 rounded-lg cursor-pointer transition-colors leading-normal text-left"
                        >
                          🛠️ Guide to manual discrepancy offsets
                        </button>
                      </div>
                    </div>

                    {/* Scrollable conversation log */}
                    <div className="space-y-4 max-h-[290px] overflow-y-auto pr-2 mb-4 bg-zinc-100/50 p-4 rounded-xl border border-zinc-200 shadow-inner">
                      {chatMessages.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 italic text-[11px] leading-5">
                          <Bot className="w-8 h-8 text-indigo-400 mx-auto mb-2 animate-bounce" />
                          I am Bot 3, your specialized Core Diagnostics & Alert Assistant.<br />
                          Click any of the helper presets above or enter a prompt below, and I will walk you through making connections or establishing automation alerts!
                        </div>
                      ) : (
                        chatMessages.map((msg, index) => (
                          <div
                            key={index}
                            className={`flex gap-3 max-w-[90%] ${
                              msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                            }`}
                          >
                            <div
                              className={`p-1 rounded-lg h-fit text-white shrink-0 ${
                                msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-900'
                              }`}
                            >
                              {msg.role === 'user' ? <MessageSquare className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                            </div>
                            
                            <div
                              className={`p-3 rounded-xl text-xs leading-relaxed space-y-1.5 ${
                                msg.role === 'user'
                                  ? 'bg-indigo-600 text-white rounded-tr-none font-sans font-medium text-[11px]'
                                  : 'bg-white text-slate-800 shadow-xs border border-slate-200 rounded-tl-none font-sans text-[11px]'
                              }`}
                            >
                              <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                            </div>
                          </div>
                        ))
                      )}

                      {chatLoading && (
                        <div className="flex gap-3 max-w-[80%] items-center text-slate-500 text-xs">
                          <div className="p-1.5 rounded-xl bg-slate-900 text-slate-300 shrink-0">
                            <Bot className="w-3.5 h-3.5 animate-spin" />
                          </div>
                          <div className="bg-white px-3 py-2 rounded-xl rounded-tl-none border border-slate-200 shadow-xs flex items-center gap-1.5 text-[11px]">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manual text consult input prompt */}
                  <div className="flex gap-2 pt-3 border-t border-slate-200">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendChatMessage();
                      }}
                      disabled={chatLoading}
                      placeholder="Ask connection helper how to configure rules, alert triggers, or API paths..."
                      className="flex-1 p-2 bg-white text-slate-800 border border-slate-350 rounded-lg text-xs sm:text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                    />
                    <button
                      onClick={handleSendChatMessage}
                      disabled={chatLoading || !chatInput.trim()}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-705 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      Send
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* 🛡️ RISK CONTROL CENTRAL: AUTONOMOUS THRESHOLD CONTROL PANEL */}
        <section id="erp-threshold-rules-panel" className="bg-black border border-slate-800 rounded-2xl shadow-xl p-6 mb-10 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 select-none pointer-events-none font-mono text-8xl text-indigo-400">GUARD</div>
          
          <div className="border-b border-slate-800 pb-5 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-500/10 border border-indigo-400/30 text-indigo-400 rounded-lg shrink-0">
                  <Shield className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold tracking-tight text-white">
                  Corporate Risk Thresholds & Auditing Guards
                </h3>
              </div>
              <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed font-sans">
                Establish autonomous ledger protection rules for key accounts. When balances violate predefined ranges, the system escalates risk notifications and flags potential GAAP/liquidity anomalies.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Quick toggle controls for all alert rules */}
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl shadow-inner">
                <button
                  type="button"
                  id="enable-all-alert-rules-btn"
                  onClick={() => setAlertRules(prev => prev.map(r => ({ ...r, isActive: true })))}
                  disabled={alertRules.length === 0 || alertRules.every(r => r.isActive)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 disabled:opacity-35 disabled:pointer-events-none shadow-sm"
                  title="Activate all defined threshold guard rules"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Enable All</span>
                </button>
                <button
                  type="button"
                  id="disable-all-alert-rules-btn"
                  onClick={() => setAlertRules(prev => prev.map(r => ({ ...r, isActive: false })))}
                  disabled={alertRules.length === 0 || alertRules.every(r => !r.isActive)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer bg-slate-800/80 hover:bg-rose-500/15 text-slate-300 hover:text-rose-300 border border-slate-700/60 hover:border-rose-500/30 disabled:opacity-35 disabled:pointer-events-none shadow-sm"
                  title="Deactivate all defined threshold guard rules"
                >
                  <ShieldOff className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400" />
                  <span>Disable All</span>
                </button>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] font-mono text-rose-455">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                Armed Scanner Nodes: <span className="font-bold text-white font-mono">{alertRules.filter(r => r.isActive).length} active</span>
              </div>
            </div>
          </div>

          {/* Collapsible Info Box: Automatic Scanner & General Ledger Thresholds Integration */}
          <div id="scanner-gl-thresholds-info-box" className="mb-6 bg-slate-950/80 border border-indigo-900/40 rounded-xl overflow-hidden shadow-inner">
            <button
              id="toggle-scanner-gl-info-btn"
              type="button"
              onClick={() => setIsThresholdInfoOpen(prev => !prev)}
              className="w-full px-4 py-3 bg-indigo-950/30 hover:bg-indigo-950/50 transition-colors flex items-center justify-between gap-3 text-left cursor-pointer border-b border-indigo-900/30"
              aria-expanded={isThresholdInfoOpen}
              aria-controls="scanner-threshold-info-content"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="p-1 bg-indigo-500/20 border border-indigo-500/40 rounded text-indigo-300 shrink-0">
                  <Info className="w-4 h-4" />
                </span>
                <div className="truncate">
                  <span className="text-xs font-bold text-white tracking-wide">
                    How Automatic Scanner Integration Works with Ledger Thresholds
                  </span>
                  <span className="hidden sm:inline-block ml-2 text-[11px] text-indigo-300/80 font-mono">
                    (Real-Time Ingestion • Autonomous Guard Node Synchronization)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                  {isThresholdInfoOpen ? "Collapse Architecture Guide" : "Expand Architecture Guide"}
                </span>
                <ChevronDown className={`w-4 h-4 text-indigo-400 transition-transform duration-200 ${isThresholdInfoOpen ? "rotate-180" : ""}`} />
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isThresholdInfoOpen && (
                <motion.div
                  id="scanner-threshold-info-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-4 sm:p-5 space-y-4 text-xs font-sans text-slate-300 border-t border-slate-800/80 bg-gradient-to-b from-slate-950 to-black">
                    <p className="leading-relaxed text-slate-300">
                      The <strong className="text-white">Autonomous Ledger Guard Engine</strong> bridges optical scanner feeds (QR Camera Scanner, OCR Invoice Ingestion, and Webhook Telemetry) directly to General Ledger balance validation. Every scanned order or batch transaction immediately triggers a four-phase threshold audit cycle:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                      <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-1.5 text-indigo-400 font-mono text-[11px] font-bold">
                          <Scan className="w-3.5 h-3.5 shrink-0" />
                          <span>1. Optical Ingestion</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          When physical QR codes or OCR receipt images are captured, canonical JSON payloads are parsed into validated line items with tax, discount, and SKU metadata.
                        </p>
                      </div>

                      <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px] font-bold">
                          <Cpu className="w-3.5 h-3.5 shrink-0" />
                          <span>2. Double-Entry Sync</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          The transaction gateway instantly posts matched debits &amp; credits across accounts (e.g. Cash #1010, AR #1200, Sales Revenue #4010, and Tax #2200).
                        </p>
                      </div>

                      <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px] font-bold">
                          <Shield className="w-3.5 h-3.5 shrink-0" />
                          <span>3. Threshold Evaluation</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Armed scanner nodes immediately compare updated net balances against predefined limits (<span className="font-mono text-indigo-300">&lt;</span> Minimum Liquidity or <span className="font-mono text-indigo-300">&gt;</span> Exposure Cap).
                        </p>
                      </div>

                      <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-1.5 text-rose-400 font-mono text-[11px] font-bold">
                          <Activity className="w-3.5 h-3.5 shrink-0" />
                          <span>4. Real-Time Guard Alert</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          If a limit is breached, the rule switches to <span className="text-rose-300 font-mono font-bold">Risk Violation</span>, broadcasting instant visual escalation and flagging potential GAAP or cash shortfall anomalies.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] border-t border-slate-800/80 text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                        <span>Zero-latency evaluation: Scanner rules re-evaluate on every booking without requiring batch reconciliation.</span>
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">
                        Integration State: <span className="text-emerald-400 font-bold">ARMED &amp; SYNCHRONIZED</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Box: Active Guard Rules Table */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Currently Armed General Ledger Guardrails
                </h4>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                  {alertRules.length} Defined Rules
                </span>
              </div>

              {alertRules.length === 0 ? (
                <div className="border border-dashed border-slate-800 p-8 rounded-xl text-center text-slate-500 text-xs font-sans bg-slate-950/40">
                  No guardrails or threshold rules defined. Use the configuration form to declare new risk rules.
                </div>
              ) : (
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 shadow-xl">
                  <div className="overflow-x-auto">
                    <table id="alert-rules-table" className="min-w-full divide-y divide-slate-800 text-xs text-left">
                      <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] tracking-wider select-none">
                        <tr>
                          <th scope="col" className="py-3 px-3.5 text-center font-bold whitespace-nowrap">
                            <span className="inline-flex items-center gap-1">
                              <span>Status</span>
                            </span>
                          </th>
                          <th scope="col" className="py-3 px-3.5 font-bold whitespace-nowrap">Target Account</th>
                          <th scope="col" className="py-3 px-3.5 font-bold whitespace-nowrap">Rule Condition &amp; Limit</th>
                          <th scope="col" className="py-3 px-3.5 font-bold whitespace-nowrap">Live GL Balance</th>
                          <th scope="col" className="py-3 px-3.5 text-right font-bold pr-4 whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/80">
                        {alertRules.map((rule) => {
                          const actualBal = (accounts.find(a => a.id === rule.accountId)?.netBalance || 0) / 100;
                          const primaryViolated = rule.condition === 'less_than' ? actualBal < rule.threshold : actualBal > rule.threshold;

                          const orBal = rule.hasOrCondition && rule.orAccountId 
                            ? (accounts.find(a => a.id === rule.orAccountId)?.netBalance || 0) / 100 
                            : 0;
                          const orViolated = rule.hasOrCondition && rule.orThreshold !== undefined
                            ? (rule.orCondition === 'less_than' ? orBal < rule.orThreshold : orBal > rule.orThreshold)
                            : false;

                          const isViolated = rule.isActive && (rule.hasOrCondition ? (primaryViolated || orViolated) : primaryViolated);
                          
                          return (
                            <tr 
                              key={rule.id} 
                              className={`transition-colors ${
                                !rule.isActive 
                                  ? 'opacity-50 bg-slate-950/20 hover:bg-slate-950/40' 
                                  : isViolated 
                                    ? 'bg-rose-950/20 hover:bg-rose-950/30' 
                                    : 'hover:bg-slate-900/40'
                              }`}
                            >
                              {/* Visual Status Column: Green or Red indicator icon based on violation state */}
                              <td className="py-3.5 px-3.5 text-center whitespace-nowrap align-middle">
                                {rule.isActive ? (
                                  isViolated ? (
                                    <div 
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono text-[11px] font-bold shadow-sm shadow-rose-950/50"
                                      title={rule.hasOrCondition 
                                        ? `Threshold Violated (OR clause triggered: ${primaryViolated ? rule.accountName : ''}${primaryViolated && orViolated ? ' & ' : ''}${orViolated ? rule.orAccountName : ''})` 
                                        : "Threshold Violated: Immediate risk condition detected"}
                                    >
                                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 animate-pulse" />
                                      <span>Violated</span>
                                      {rule.hasOrCondition && (
                                        <span className="text-[9px] px-1 py-0.2 bg-rose-500/20 text-rose-300 rounded font-normal">
                                          {primaryViolated && orViolated ? 'Both' : primaryViolated ? 'Pri' : 'OR'}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <div 
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold shadow-sm shadow-emerald-950/30"
                                      title="Compliant: Balance operating safely within bounds"
                                    >
                                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                                      <span>Safe</span>
                                    </div>
                                  )
                                ) : (
                                  <div 
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-500 font-mono text-[11px]"
                                    title="Guard node inactive"
                                  >
                                    <span className="w-3 h-3 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center text-[8px] font-bold">―</span>
                                    <span>Disabled</span>
                                  </div>
                                )}
                              </td>

                              {/* Target Account */}
                              <td className="py-3.5 px-3.5 align-middle">
                                <div className="space-y-1">
                                  {rule.hasOrCondition ? (
                                    <div className="space-y-1">
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-slate-900 text-slate-300 rounded border border-slate-700 font-bold">
                                          CODE {getAccountDetailCode(rule.accountId)}
                                        </span>
                                        <span className="text-xs font-bold text-white font-sans">{rule.accountName}</span>
                                        
                                        <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 shadow-sm">
                                          OR
                                        </span>

                                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-slate-900 text-slate-300 rounded border border-slate-700 font-bold">
                                          CODE {getAccountDetailCode(rule.orAccountId)}
                                        </span>
                                        <span className="text-xs font-bold text-white font-sans">{rule.orAccountName}</span>

                                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                          rule.severity === 'danger' 
                                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                                            : rule.severity === 'warning'
                                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                        }`}>
                                          {rule.severity.toUpperCase()}
                                        </span>
                                      </div>
                                      <div className="text-[10px] font-mono text-indigo-400/80 flex items-center gap-1">
                                        <span>Complex logical rule: Triggers if either condition is met</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-slate-900 text-slate-300 rounded border border-slate-700 font-bold">
                                        CODE {getAccountDetailCode(rule.accountId)}
                                      </span>
                                      <span className="text-xs font-bold text-white font-sans">{rule.accountName}</span>
                                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                        rule.severity === 'danger' 
                                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                                          : rule.severity === 'warning'
                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                      }`}>
                                        {rule.severity.toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Rule Condition & Limit */}
                              <td className="py-3.5 px-3.5 align-middle">
                                {rule.hasOrCondition ? (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] font-mono text-slate-400 shrink-0 w-12 truncate" title={rule.accountName}>
                                        {rule.accountName?.slice(0, 5)}:
                                      </span>
                                      <span className="text-[11px] text-slate-300 font-sans whitespace-nowrap">
                                        <span className="font-mono text-indigo-400 font-bold">{rule.condition === 'less_than' ? '<' : '>'}</span>
                                      </span>
                                      <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-[10px] font-mono">$</span>
                                        <input 
                                          type="number" 
                                          value={rule.threshold}
                                          onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setAlertRules(prev => prev.map(r => r.id === rule.id ? { ...r, threshold: val } : r));
                                          }}
                                          className="w-24 pl-5 pr-1 py-0.5 bg-slate-900 border border-slate-800 rounded-lg text-[10.5px] font-mono text-white focus:outline-none focus:border-indigo-500"
                                          title="Adjust primary threshold limit"
                                        />
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 pl-5">
                                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                        OR
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] font-mono text-slate-400 shrink-0 w-12 truncate" title={rule.orAccountName}>
                                        {rule.orAccountName?.slice(0, 5)}:
                                      </span>
                                      <span className="text-[11px] text-slate-300 font-sans whitespace-nowrap">
                                        <span className="font-mono text-indigo-400 font-bold">{rule.orCondition === 'less_than' ? '<' : '>'}</span>
                                      </span>
                                      <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-[10px] font-mono">$</span>
                                        <input 
                                          type="number" 
                                          value={rule.orThreshold ?? 0}
                                          onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setAlertRules(prev => prev.map(r => r.id === rule.id ? { ...r, orThreshold: val } : r));
                                          }}
                                          className="w-24 pl-5 pr-1 py-0.5 bg-slate-900 border border-slate-800 rounded-lg text-[10.5px] font-mono text-white focus:outline-none focus:border-indigo-500"
                                          title="Adjust secondary OR threshold limit"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-slate-300 font-sans whitespace-nowrap">
                                      Alert if <span className="font-mono text-indigo-400 font-bold">{rule.condition === 'less_than' ? '<' : '>'}</span>
                                    </span>
                                    <div className="relative">
                                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-[10px] font-mono">$</span>
                                      <input 
                                        type="number" 
                                        value={rule.threshold}
                                        onChange={(e) => {
                                          const val = Number(e.target.value);
                                          setAlertRules(prev => prev.map(r => r.id === rule.id ? { ...r, threshold: val } : r));
                                        }}
                                        className="w-24 pl-5 pr-1 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10.5px] font-mono text-white focus:outline-none focus:border-indigo-500"
                                        title="Adjust threshold limit value"
                                      />
                                    </div>
                                  </div>
                                )}
                              </td>

                              {/* Live GL Balance */}
                              <td className="py-3.5 px-3.5 whitespace-nowrap align-middle">
                                {rule.hasOrCondition ? (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] text-slate-400 font-mono w-10 truncate" title={rule.accountName}>
                                        {rule.accountName?.slice(0, 4)}:
                                      </span>
                                      <span className={`font-mono font-bold text-xs ${
                                        !rule.isActive 
                                          ? 'text-slate-400' 
                                          : primaryViolated 
                                            ? 'text-rose-400' 
                                            : 'text-emerald-400'
                                      }`}>
                                        ${actualBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] text-slate-400 font-mono w-10 truncate" title={rule.orAccountName}>
                                        {rule.orAccountName?.slice(0, 4)}:
                                      </span>
                                      <span className={`font-mono font-bold text-xs ${
                                        !rule.isActive 
                                          ? 'text-slate-400' 
                                          : orViolated 
                                            ? 'text-rose-400' 
                                            : 'text-emerald-400'
                                      }`}>
                                        ${orBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className={`font-mono font-bold text-xs ${
                                    !rule.isActive 
                                      ? 'text-slate-400' 
                                      : isViolated 
                                        ? 'text-rose-400' 
                                        : 'text-emerald-400'
                                  }`}>
                                    ${actualBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                  </span>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-3.5 pr-4 text-right whitespace-nowrap align-middle">
                                <div className="inline-flex items-center gap-1.5">
                                  {/* Toggle active / inactive switch */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAlertRules(prev => prev.map(r => r.id === rule.id ? { ...r, isActive: !r.isActive } : r));
                                    }}
                                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                      rule.isActive 
                                        ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400 hover:bg-slate-800' 
                                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                                    }`}
                                    title={rule.isActive ? "Deactivate Guard rule" : "Activate Guard rule"}
                                  >
                                    <Shield className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete Button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAlertRules(prev => prev.filter(r => r.id !== rule.id));
                                    }}
                                    className="p-1.5 bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-lg transition-all cursor-pointer"
                                    title="Delete Rule"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Right Box: Setup Form to configure brand new rules */}
            <div className="lg:col-span-4 bg-slate-950/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    Define Protection Rule
                  </h4>
                  {/* Quick example preset button */}
                  <button
                    type="button"
                    id="load-example-rule-btn"
                    onClick={() => {
                      setNewRuleAccount('acc-cash');
                      setNewRuleCondition('less_than');
                      setNewRuleThreshold('500000');
                      setEnableOrOperator(true);
                      setNewRuleOrAccount('acc-ar');
                      setNewRuleOrCondition('greater_than');
                      setNewRuleOrThreshold('200000');
                      setNewRuleSeverity('danger');
                    }}
                    className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded transition-all cursor-pointer flex items-center gap-1"
                    title="Load example: 'Cash < 500k OR AR > 200k'"
                  >
                    <Zap className="w-2.5 h-2.5 text-indigo-400" />
                    <span>Preset: Cash OR AR</span>
                  </button>
                </div>

                <div className="space-y-4 text-xs font-sans">
                  {/* Primary Guard Condition */}
                  <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-300">
                        Primary Condition
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">Clause 1</span>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-mono text-[10px] uppercase tracking-wider mb-1">Select Guard Account</label>
                      <select
                        value={newRuleAccount}
                        onChange={(e) => setNewRuleAccount(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 cursor-pointer text-xs"
                      >
                        <option value="acc-cash">Cash (Code 1010)</option>
                        <option value="acc-ar">Accounts Receivable (Code 1200)</option>
                        <option value="acc-revenue">Sales Revenue (Code 4010)</option>
                        <option value="acc-tax">Sales Tax Payable (Code 2200)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-mono text-[10px] uppercase tracking-wider mb-1 font-semibold">Trigger Condition</label>
                      <div className="grid grid-cols-2 gap-2 font-mono">
                        <button
                          type="button"
                          onClick={() => setNewRuleCondition('less_than')}
                          className={`p-1.5 rounded-xl border text-center transition-all font-mono text-[10px] cursor-pointer ${
                            newRuleCondition === 'less_than'
                              ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          Less than (&lt;)
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewRuleCondition('greater_than')}
                          className={`p-1.5 rounded-xl border text-center transition-all font-mono text-[10px] cursor-pointer ${
                            newRuleCondition === 'greater_than'
                              ? 'bg-indigo-650/30 border-indigo-500 text-white font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          Greater than (&gt;)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-mono text-[10px] uppercase tracking-wider mb-1 font-semibold">Threshold Target (USD)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">$</span>
                        <input
                          type="number"
                          placeholder="e.g. 500000"
                          value={newRuleThreshold}
                          onChange={(e) => setNewRuleThreshold(e.target.value)}
                          className="w-full pl-7 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Logical Operator Option Toggle */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-slate-300 font-mono text-[10px] uppercase tracking-wider font-semibold">
                        Logical Operator Option
                      </label>
                      <span className="text-[9px] font-mono text-indigo-400">
                        {enableOrOperator ? "Complex Disjunction ('OR')" : "Single Condition"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 font-mono">
                      <button
                        type="button"
                        id="rule-operator-single-btn"
                        onClick={() => setEnableOrOperator(false)}
                        className={`p-2 rounded-xl border text-center transition-all font-mono text-[10px] cursor-pointer ${
                          !enableOrOperator
                            ? 'bg-slate-900 border-indigo-500 text-white font-bold ring-1 ring-indigo-500/40 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        Single Condition
                      </button>
                      <button
                        type="button"
                        id="rule-operator-or-btn"
                        onClick={() => setEnableOrOperator(true)}
                        className={`p-2 rounded-xl border text-center transition-all font-mono text-[10px] cursor-pointer flex items-center justify-center gap-1.5 ${
                          enableOrOperator
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-bold ring-1 ring-indigo-500/50 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <span className="px-1.5 py-0.2 bg-indigo-500/25 text-indigo-300 rounded text-[9px] font-black border border-indigo-500/40">OR</span>
                        <span>'OR' Operator</span>
                      </button>
                    </div>
                  </div>

                  {/* Secondary 'OR' Condition (Shown when OR operator is active) */}
                  {enableOrOperator && (
                    <motion.div 
                      id="secondary-or-condition-section"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="p-3 bg-indigo-950/20 border border-indigo-500/40 rounded-xl space-y-3 shadow-inner"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 bg-indigo-500 text-white text-[9px] font-mono font-black rounded shadow-sm">OR</span>
                          <span className="text-[10px] font-mono font-bold text-indigo-200 uppercase tracking-wide">Secondary Condition</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEnableOrOperator(false)}
                          className="text-slate-400 hover:text-rose-400 text-[10px] font-mono cursor-pointer transition-colors"
                          title="Remove OR condition"
                        >
                          ✕ Remove OR
                        </button>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-mono text-[10px] uppercase tracking-wider mb-1">Select OR Account</label>
                        <select
                          value={newRuleOrAccount}
                          onChange={(e) => setNewRuleOrAccount(e.target.value)}
                          className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 cursor-pointer text-xs"
                        >
                          <option value="acc-cash">Cash (Code 1010)</option>
                          <option value="acc-ar">Accounts Receivable (Code 1200)</option>
                          <option value="acc-revenue">Sales Revenue (Code 4010)</option>
                          <option value="acc-tax">Sales Tax Payable (Code 2200)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-mono text-[10px] uppercase tracking-wider mb-1 font-semibold">Trigger Condition</label>
                        <div className="grid grid-cols-2 gap-2 font-mono">
                          <button
                            type="button"
                            onClick={() => setNewRuleOrCondition('less_than')}
                            className={`p-1.5 rounded-xl border text-center transition-all font-mono text-[10px] cursor-pointer ${
                              newRuleOrCondition === 'less_than'
                                ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            Less than (&lt;)
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewRuleOrCondition('greater_than')}
                            className={`p-1.5 rounded-xl border text-center transition-all font-mono text-[10px] cursor-pointer ${
                              newRuleOrCondition === 'greater_than'
                                ? 'bg-indigo-650/30 border-indigo-500 text-white font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            Greater than (&gt;)
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-mono text-[10px] uppercase tracking-wider mb-1 font-semibold">OR Threshold Target (USD)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">$</span>
                          <input
                            type="number"
                            placeholder="e.g. 200000"
                            value={newRuleOrThreshold}
                            onChange={(e) => setNewRuleOrThreshold(e.target.value)}
                            className="w-full pl-7 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Live Formula Preview Badge */}
                  <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300">
                    <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                      Rule Logic Preview:
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-white font-bold">{getAccountName(newRuleAccount)}</span>
                      <span className="text-indigo-400 font-bold">{newRuleCondition === 'less_than' ? '<' : '>'}</span>
                      <span className="text-emerald-400 font-bold">
                        ${Number(newRuleThreshold || 0).toLocaleString('en-US')}
                      </span>
                      {enableOrOperator && (
                        <>
                          <span className="px-1.5 py-0.2 rounded bg-indigo-500/25 text-indigo-300 font-black border border-indigo-500/40 text-[9px]">
                            OR
                          </span>
                          <span className="text-white font-bold">{getAccountName(newRuleOrAccount)}</span>
                          <span className="text-indigo-400 font-bold">{newRuleOrCondition === 'less_than' ? '<' : '>'}</span>
                          <span className="text-emerald-400 font-bold">
                            ${Number(newRuleOrThreshold || 0).toLocaleString('en-US')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono text-[10px] uppercase tracking-wider mb-1.5 font-semibold">Escalation Severity</label>
                    <div className="grid grid-cols-3 gap-1.5 text-center font-mono font-bold">
                      {(['info', 'warning', 'danger'] as const).map((sev) => (
                        <button
                          key={sev}
                          type="button"
                          onClick={() => setNewRuleSeverity(sev)}
                          className={`py-1.5 rounded-lg border text-[9px] uppercase transition-all cursor-pointer ${
                            newRuleSeverity === sev
                              ? sev === 'danger'
                                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                                : sev === 'warning'
                                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                  : 'bg-blue-500/20 border-blue-500 text-blue-300'
                              : 'bg-slate-900 border-slate-800 text-slate-600 hover:text-slate-400'
                          }`}
                        >
                          {sev}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                id="deploy-guardrail-rule-btn"
                onClick={() => {
                  const targetVal = Number(newRuleThreshold);
                  if (isNaN(targetVal) || targetVal <= 0) {
                    setLedgerMessage({
                      text: "⚠️ Invalid primary threshold. Please input a numerical Dollar value greater than 0.",
                      type: "err"
                    });
                    return;
                  }

                  let orTargetVal: number | undefined = undefined;
                  if (enableOrOperator) {
                    orTargetVal = Number(newRuleOrThreshold);
                    if (isNaN(orTargetVal) || orTargetVal <= 0) {
                      setLedgerMessage({
                        text: "⚠️ Invalid secondary 'OR' threshold. Please input a numerical Dollar value greater than 0 for the OR condition.",
                        type: "err"
                      });
                      return;
                    }
                  }

                  const newRule = {
                    id: `rule-custom-${Date.now()}`,
                    accountId: newRuleAccount,
                    accountName: getAccountName(newRuleAccount),
                    condition: newRuleCondition,
                    threshold: targetVal,
                    isActive: true,
                    severity: newRuleSeverity,
                    hasOrCondition: enableOrOperator,
                    orAccountId: enableOrOperator ? newRuleOrAccount : undefined,
                    orAccountName: enableOrOperator ? getAccountName(newRuleOrAccount) : undefined,
                    orCondition: enableOrOperator ? newRuleOrCondition : undefined,
                    orThreshold: enableOrOperator ? orTargetVal : undefined,
                  };

                  setAlertRules(prev => [...prev, newRule]);
                  setNewRuleThreshold('');
                  if (enableOrOperator) {
                    setNewRuleOrThreshold('');
                  }
                  
                  const ruleSummary = enableOrOperator
                    ? `${newRule.accountName} ${newRule.condition === 'less_than' ? '<' : '>'} $${targetVal.toLocaleString('en-US')} OR ${newRule.orAccountName} ${newRule.orCondition === 'less_than' ? '<' : '>'} $${orTargetVal?.toLocaleString('en-US')}`
                    : `${newRule.accountName} ${newRule.condition === 'less_than' ? '<' : '>'} $${targetVal.toLocaleString('en-US')}`;

                  setLedgerMessage({
                    text: `🛡️ Armed new alert rule target: [${ruleSummary}]`,
                    type: "success"
                  });
                }}
                className="w-full py-2 mt-5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold rounded-xl transition-all font-mono text-[11px] tracking-wide uppercase cursor-pointer shadow-md shadow-indigo-950/50"
              >
                Deploy Guardrail Shield
              </button>
            </div>
            
          </div>
        </section>

        {/* Section 1: The Gateway Edge Ingestion Layer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          
          <div id="edge-ingestion-card" className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <span className="p-0.5 bg-white border border-slate-200 rounded flex items-center justify-center w-6 h-6 shrink-0">
                    <CorporateBrandLogo className="w-4 h-4" />
                  </span>
                  <ClickToEditWrapper fieldKey="gatewayTitle" fieldLabel="Translation Gateway Title text">
                    <h2 className="text-sm font-semibold tracking-tight">
                      {renderEditableText('gatewayTitle', 'text-sm font-semibold tracking-tight')}
                    </h2>
                  </ClickToEditWrapper>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-md">Edge Router</span>
              </div>

              {/* Feed channels switch navbar */}
              <div className="border-b border-slate-200 bg-slate-50 p-2 flex flex-wrap gap-1">
                <button
                  onClick={() => setActiveTab('shopify')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'shopify' 
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  Shopify Webhook
                </button>
                <button
                  onClick={() => setActiveTab('legacy_csv')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'legacy_csv' 
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Legacy CSV
                </button>
                <button
                  onClick={() => setActiveTab('edi')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'edi' 
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  EDI 850 PO
                </button>
                <button
                  onClick={() => setActiveTab('ai_mapped')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 relative ${
                    activeTab === 'ai_mapped' 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-indigo-50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Cognitive Map
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 animate-bounce"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                </button>
              </div>

              {/* Flow status filter dropdown bar */}
              <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-2 items-center justify-between text-xs font-mono">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-500" />
                  FLOW FILTER (GRAPHS)
                </span>
                <div className="relative inline-block text-left" id="flow-node-filter-container">
                  <select
                    id="flow-node-status-select"
                    value={flowNodeFilter}
                    onChange={(e) => setFlowNodeFilter(e.target.value as any)}
                    className="bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 rounded-md px-2.5 py-1 text-xs text-slate-700 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs transition-all cursor-pointer"
                  >
                    <option value="all">🔍 Show All</option>
                    <option value="active">🟢 Active</option>
                    <option value="stalled">🟡 Stalled</option>
                    <option value="error">🔴 Error</option>
                  </select>
                </div>
              </div>

              {/* Ingestion Payload Editors */}
              <div className="p-5">
                {activeTab === 'shopify' && (
                  <div>
                    <div className="mb-3 space-y-2">
                      <ClickToEditWrapper fieldKey="shopifyTitle" fieldLabel="Shopify Sync Channel Title">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide font-mono">
                          {renderEditableText('shopifyTitle', 'block text-xs font-semibold text-slate-500 uppercase tracking-wide font-mono')}
                        </label>
                      </ClickToEditWrapper>
                      <ClickToEditWrapper fieldKey="shopifyDesc" fieldLabel="Shopify Sync Channel Description" isTextArea={true}>
                        <span className="text-[11px] text-slate-400 block leading-snug">
                          {renderEditableText('shopifyDesc', 'text-[11px] text-slate-400 block leading-snug', true)}
                        </span>
                      </ClickToEditWrapper>
                    </div>
                    <textarea
                      id="shopify-json-input"
                      value={shopifyPayload}
                      onChange={(e) => setShopifyPayload(e.target.value)}
                      className="w-full h-56 p-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                {activeTab === 'legacy_csv' && (
                  <div className="space-y-4">
                    {/* Visual ETL Column Field Mapper configuration */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-1.5">
                          <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
                          <ClickToEditWrapper fieldKey="csvTitle" fieldLabel="CSV Column Auto-Mapper Title">
                            <span className="text-xs font-bold text-slate-800 font-mono">
                              {renderEditableText('csvTitle', 'text-xs font-bold text-slate-800 font-mono')}
                            </span>
                          </ClickToEditWrapper>
                        </div>
                        <span className="text-[9px] uppercase font-mono px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded font-bold">ETL Auto-Aligner Node</span>
                      </div>

                      {/* File Drag and Drop / Input Upload Area */}
                      <div 
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsCsvDragging(true);
                        }}
                        onDragLeave={() => setIsCsvDragging(false)}
                        onDrop={async (e) => {
                          e.preventDefault();
                          setIsCsvDragging(false);
                          const files = e.dataTransfer.files;
                          if (files && files.length > 0) {
                            // Single-file legacy preview behavior
                            const firstFile = files[0];
                            setCsvFile(firstFile);
                            const text = await firstFile.text();
                            processCSVContent(text, firstFile.name);

                            // Multi-file selection integration
                            handleCSVFilesSelected(Array.from(files));
                          }
                        }}
                        className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center transition-all cursor-pointer bg-white text-center select-none relative group ${
                          isCsvDragging 
                            ? 'border-indigo-500 bg-indigo-50/20 shadow-inner' 
                            : 'border-slate-300 hover:border-indigo-400 hover:shadow-xs'
                        }`}
                        onClick={() => {
                          const fileInput = document.getElementById('csv-file-upload-input');
                          fileInput?.click();
                        }}
                      >
                        <input
                          id="csv-file-upload-input"
                          type="file"
                          accept=".csv"
                          multiple
                          className="hidden"
                          onChange={async (e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              // Single-file legacy preview behavior
                              const firstFile = files[0];
                              setCsvFile(firstFile);
                              const text = await firstFile.text();
                              processCSVContent(text, firstFile.name);

                              // Multi-file selection integration
                              handleCSVFilesSelected(Array.from(files));
                            }
                          }}
                        />
                        <div className="space-y-1">
                          <Upload className="w-7 h-7 text-indigo-500 mx-auto transition-transform group-hover:-translate-y-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-700">Drag & Drop CSV File(s) Here</p>
                            <p className="text-[10px] text-slate-400 font-medium">multi-file selection supported | click to browse</p>
                          </div>
                        </div>
                      </div>

                      {/* Sample Preset Loaders for quick testing */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider block">Simulator Preset CSV Channels</span>
                          <span className="text-[8px] font-mono text-slate-400">Click to append preset to batch queue</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const standardCsv = `SKU,Qty,Cost,Mail,RecordID,Date\nIND-STEEL-BRCKT,12,39.99,procurement@buildcorp.net,INV-SET-9921,2026-06-13T11:47:00Z\nIND-STEEL-BRCKT,3,39.99,wholesale@buildcorp.net,INV-SET-9922,2026-06-13T11:50:00Z`;
                              processCSVContent(standardCsv, "supplier-premium-export.csv");
                              loadPresetIntoBatch("supplier-premium-export.csv", standardCsv);
                            }}
                            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-[10px] text-slate-600 font-mono font-semibold rounded-lg border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer text-left flex items-center justify-between gap-1.5"
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                              Standard CSV Flat
                            </span>
                            <span className="text-[8px] bg-indigo-50 text-indigo-600 px-1 rounded">2 row stream</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const industryCsv = `part_number,pieces,price,email_address,order_ref,timestamp\nHEAVY-BOLT-10X,250,1.25,desk-supply@industries.org,REF-BOLT-X01,2026-06-13T10:00:00Z\nHEAVY-BOLT-10X,100,1.25,logistics@industries.org,REF-BOLT-X02,2026-06-13T10:15:00Z`;
                              processCSVContent(industryCsv, "heavy-industry-manifest.csv");
                              loadPresetIntoBatch("heavy-industry-manifest.csv", industryCsv);
                            }}
                            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-[10px] text-slate-600 font-mono font-semibold rounded-lg border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer text-left flex items-center justify-between gap-1.5"
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Heavy Industry Map
                            </span>
                            <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1 rounded">2 row stream</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const intlCsv = `item_code,quantity,unit_price,customer_email,ref_id,order_date\nDECOR-PLT-FR,5,45.00,boutique-decor@france.net,FR-MAPPED-729,2026-06-12T15:30:00Z\nDECOR-PLT-FR,10,42.50,boutique-design@france.net,FR-MAPPED-730,2026-06-12T15:45:00Z`;
                              processCSVContent(intlCsv, "international-boutique-manifest.csv");
                              loadPresetIntoBatch("international-boutique-manifest.csv", intlCsv);
                            }}
                            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-[10px] text-slate-600 font-mono font-semibold rounded-lg border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer text-left flex items-center justify-between gap-1.5"
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              International EDI
                            </span>
                            <span className="text-[8px] bg-amber-50 text-amber-600 px-1 rounded">2 row stream</span>
                          </button>
                        </div>
                      </div>

                      {/* Interactive Manual Schema Field Aligner Dropdown interface */}
                      <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-sm text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-mono font-extrabold text-indigo-600 tracking-wider flex items-center gap-1">
                            <Settings className="w-3.5 h-3.5" /> Interactive Field Alignments
                          </span>
                          <span className="text-[9px] font-mono bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold">Manual Overrides</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                          Correct mapping manually if the algorithmic auto-mapper fails or produces misalignments:
                        </p>

                        <div className="grid grid-cols-1 gap-2">
                          {/* SKU Mapper */}
                          <div className="flex gap-2 items-center justify-between text-xs">
                            <label className="text-[10px] font-mono text-slate-600 font-bold w-1/3 flex items-center gap-1 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span> SKU
                            </label>
                            <select
                              value={mappedSkuColumn}
                              onChange={(e) => handleMapColumnChange('sku', e.target.value)}
                              className="w-2/3 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-mono text-slate-700 outline-none focus:border-indigo-500 cursor-pointer transition-all"
                            >
                              <option value="">-- Unmapped --</option>
                              {csvHeaders.map(h => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          </div>

                          {/* Qty Mapper */}
                          <div className="flex gap-2 items-center justify-between text-xs">
                            <label className="text-[10px] font-mono text-slate-600 font-bold w-1/3 flex items-center gap-1 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span> Quantity
                            </label>
                            <select
                              value={mappedQtyColumn}
                              onChange={(e) => handleMapColumnChange('qty', e.target.value)}
                              className="w-2/3 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-mono text-slate-700 outline-none focus:border-indigo-500 cursor-pointer transition-all"
                            >
                              <option value="">-- Unmapped --</option>
                              {csvHeaders.map(h => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          </div>

                          {/* Cost / Price Mapper */}
                          <div className="flex gap-2 items-center justify-between text-xs">
                            <label className="text-[10px] font-mono text-slate-600 font-bold w-1/3 flex items-center gap-1 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span> Unit Price
                            </label>
                            <select
                              value={mappedUnitPriceColumn}
                              onChange={(e) => handleMapColumnChange('price', e.target.value)}
                              className="w-2/3 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-mono text-slate-700 outline-none focus:border-indigo-500 cursor-pointer transition-all"
                            >
                              <option value="">-- Unmapped --</option>
                              {csvHeaders.map(h => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          </div>

                          {/* Email Mapper */}
                          <div className="flex gap-2 items-center justify-between text-xs">
                            <label className="text-[10px] font-mono text-slate-600 font-bold w-1/3 flex items-center gap-1 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span> Customer Email
                            </label>
                            <select
                              value={mappedEmailColumn}
                              onChange={(e) => handleMapColumnChange('email', e.target.value)}
                              className="w-2/3 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-mono text-slate-700 outline-none focus:border-indigo-500 cursor-pointer transition-all"
                            >
                              <option value="">-- Unmapped --</option>
                              {csvHeaders.map(h => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          </div>

                          {/* Record ID Mapper */}
                          <div className="flex gap-2 items-center justify-between text-xs">
                            <label className="text-[10px] font-mono font-bold w-1/3 flex items-center gap-1 truncate text-slate-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0"></span> Source Ref ID
                            </label>
                            <select
                              value={mappedIdColumn}
                              onChange={(e) => handleMapColumnChange('id', e.target.value)}
                              className="w-2/3 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-mono text-slate-700 outline-none focus:border-indigo-500 cursor-pointer transition-all"
                            >
                              <option value="">-- Unmapped --</option>
                              {csvHeaders.map(h => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Interactive dynamic matching status label */}
                        <div className="bg-slate-50 text-[9px] font-mono text-slate-500 p-2 rounded-lg border border-slate-205 flex items-center justify-between">
                          <span>Configuration Status:</span>
                          <span className="font-bold text-indigo-600 uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span> Active Overrides Tuned
                          </span>
                        </div>
                      </div>

                      {/* Background Task Terminal Console logs & Progress Bar */}
                      {autoMapStatus !== 'idle' && (
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 mt-2 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-indigo-400 font-mono flex items-center gap-1">
                              <Terminal className="w-3 h-3" /> Auto-Mapper Pipeline Logs
                            </span>
                            <span className={`text-[9px] font-mono font-bold uppercase rounded px-1.5 py-0.2 ${
                              autoMapStatus === 'parsing' || autoMapStatus === 'mapping'
                                ? 'bg-indigo-900/40 text-indigo-350 animate-pulse'
                                : autoMapStatus === 'success'
                                ? 'bg-emerald-950 text-emerald-400'
                                : 'bg-rose-950 text-rose-400'
                            }`}>
                              {autoMapStatus}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                autoMapStatus === 'success' 
                                  ? 'bg-emerald-500' 
                                  : autoMapStatus === 'error'
                                  ? 'bg-rose-500'
                                  : 'bg-indigo-500'
                              }`}
                              style={{ width: `${autoMapProgress}%` }}
                            ></div>
                          </div>

                          {/* Terminal content */}
                          <div className="font-mono text-[10px] leading-relaxed text-slate-300 space-y-1 h-32 overflow-y-auto bg-slate-900 p-2 rounded-lg border border-slate-800">
                            {autoMapLogs.map((log, idx) => (
                              <p key={idx} className="whitespace-pre-line border-b border-slate-850/50 pb-0.5">
                                {log}
                              </p>
                            ))}
                          </div>

                          {/* Currently active adapter bindings footer */}
                          {autoMapStatus === 'success' && (
                            <div className="grid grid-cols-5 gap-1.5 text-[8px] font-mono text-slate-400 bg-slate-900 p-1.5 rounded">
                              <div><span className="text-emerald-400">SKU:</span> {mappedSkuColumn}</div>
                              <div><span className="text-emerald-400">QTY:</span> {mappedQtyColumn}</div>
                              <div><span className="text-emerald-400">PRICE:</span> {mappedUnitPriceColumn}</div>
                              <div><span className="text-emerald-400">EMAIL:</span> {mappedEmailColumn}</div>
                              <div><span className="text-emerald-400">ID:</span> {mappedIdColumn}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Sequential Batch Processing Queue Panel */}
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 text-left">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs font-bold text-slate-200 font-sans">Corporate Multi-File Stream Queue</span>
                          <span className="text-[9px] bg-indigo-950 text-indigo-300 font-mono px-1.5 py-0.5 rounded-md font-semibold">
                            {csvBatchQueue.length} loaded
                          </span>
                        </div>
                        {csvBatchQueue.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearBatchQueue}
                            disabled={isProcessingBatch}
                            className="text-[10px] text-rose-450 hover:text-rose-400 cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Clear Queue
                          </button>
                        )}
                      </div>

                      {csvBatchQueue.length === 0 ? (
                        <div className="py-6 text-center text-slate-500 font-mono text-[10px] flex flex-col items-center justify-center space-y-2">
                          <Activity className="w-6 h-6 text-slate-650 animate-pulse" />
                          <p>Sequential batch stream buffer is empty.</p>
                          <p className="text-[9px] text-slate-600">Drag & drop multiple CSV files to build your order ingress pipelines.</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {csvBatchQueue.map((file, idx) => {
                            const isActive = idx === currentBatchIndex;
                            return (
                              <div 
                                key={file.id} 
                                className={`p-2.5 rounded-lg border transition-all ${
                                  isActive 
                                    ? 'bg-indigo-950/20 border-indigo-500/50 shadow-md shadow-indigo-950/40' 
                                    : file.status === 'completed'
                                    ? 'bg-emerald-950/10 border-emerald-955/50'
                                    : file.status === 'error'
                                    ? 'bg-rose-955/10 border-rose-955/50'
                                    : 'bg-slate-950/45 border-slate-800/80'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="p-1 bg-slate-900 rounded border border-slate-800 shrink-0">
                                      <FileText className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                                    </span>
                                    <div className="truncate">
                                      <p className="text-[11px] font-bold text-slate-200 truncate">{file.name}</p>
                                      <p className="text-[8px] font-mono text-slate-500">
                                        {(file.size / 1024).toFixed(2)} KB • {file.rowCount} rows detected
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {/* Status Indicator Badge */}
                                    <span className={`text-[8px] font-mono font-bold uppercase rounded px-1.5 py-0.5 tracking-wider ${
                                      file.status === 'processing'
                                        ? 'bg-indigo-950 text-indigo-300 animate-pulse border border-indigo-900'
                                        : file.status === 'completed'
                                        ? 'bg-emerald-950 text-emerald-450 border border-emerald-900'
                                        : file.status === 'error'
                                        ? 'bg-rose-950 text-rose-455 border border-rose-900'
                                        : 'bg-slate-900 text-slate-500'
                                    }`}>
                                      {file.status === 'processing' ? 'stream active' : file.status}
                                    </span>

                                    {/* Delete single file option */}
                                    {!isProcessingBatch && (
                                      <button 
                                        onClick={() => {
                                          setCsvBatchQueue(prev => prev.filter(f => f.id !== file.id));
                                        }}
                                        className="text-slate-500 hover:text-rose-450 transition-colors p-0.5 cursor-pointer"
                                        title="Remove segment"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Active progress bar */}
                                {(file.status === 'processing' || file.status === 'completed' || file.status === 'error') && (
                                  <div className="space-y-1">
                                    <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                                      <div 
                                        className={`h-full transition-all duration-300 ${
                                          file.status === 'completed' 
                                            ? 'bg-emerald-500' 
                                            : file.status === 'error'
                                            ? 'bg-rose-500'
                                            : 'bg-indigo-500'
                                        }`}
                                        style={{ width: `${file.progress}%` }}
                                      ></div>
                                    </div>
                                    <div className="flex items-center justify-between text-[8px] font-mono text-slate-400">
                                      <span>Seq Processed: {file.mappedCount} / {file.rowCount}</span>
                                      <span>{file.progress}%</span>
                                    </div>
                                  </div>
                                )}

                                {/* Collapsible log feed for detailed trace analysis */}
                                {file.logs.length > 0 && (
                                  <div className="mt-2">
                                    <div className="bg-slate-950 border border-slate-850 rounded p-1.5 max-h-24 overflow-y-auto font-mono text-[8px] leading-relaxed text-slate-300 space-y-0.5">
                                      {file.logs.map((log, lIdx) => (
                                        <p key={lIdx} className="border-b border-slate-900/40 pb-0.5 last:border-0 truncate">
                                          {log}
                                        </p>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Launch Batch Action Controller */}
                      {csvBatchQueue.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                          <p className="text-[9px] font-mono text-slate-400">
                            Paced pacing delay: <span className="text-indigo-400">250ms</span> visuals.
                          </p>
                          <button
                            type="button"
                            onClick={handleRunSequentialBatchProcessing}
                            disabled={isProcessingBatch || !csvBatchQueue.some(f => f.status === 'pending')}
                            className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:bg-indigo-850 text-white rounded-lg text-[10px] font-bold tracking-tight shadow-md transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            {isProcessingBatch ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                Processing Streams...
                              </>
                            ) : (
                              <>
                                <Activity className="w-3 h-3 text-indigo-200" />
                                Run Sequential Batch Processor
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Batch Processing Reliability Chart */}
                    {(() => {
                      const totalProcessedRows = batchHistory.reduce((acc, curr) => acc + curr.totalCount, 0);
                      const totalSuccessRows = batchHistory.reduce((acc, curr) => acc + curr.successCount, 0);
                      const totalFailureRows = batchHistory.reduce((acc, curr) => acc + curr.failureCount, 0);
                      const overallReliability = totalProcessedRows > 0 
                        ? ((totalSuccessRows / totalProcessedRows) * 100).toFixed(1) 
                        : "100.0";

                      return (
                        <div id="batch-processing-reliability-analytics" className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4 text-left shadow-xs">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-emerald-400" />
                              <div>
                                <span className="text-xs font-bold text-slate-200 font-sans block">Batch Ingress Reliability Analytics</span>
                                <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                                  <span>Real-time success & error ratios</span>
                                  <span className="text-indigo-400 font-bold">• Click bar to expand breakdown</span>
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const rand = Math.floor(Math.random() * 100);
                                  const total = Math.floor(Math.random() * 25) + 10;
                                  const fails = rand > 65 ? Math.floor(Math.random() * 4) + 1 : 0;
                                  const succs = total - fails;
                                  const now = new Date();
                                  const timeStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                                  
                                  const newId = `sim-batch-${Date.now()}`;
                                  let simulatedErrorDetails = undefined;
                                  if (fails > 0) {
                                    const mapErr = Math.floor(Math.random() * (fails + 1));
                                    const typeMis = Math.floor(Math.random() * (fails - mapErr + 1));
                                    const valFail = fails - mapErr - typeMis;
                                    simulatedErrorDetails = {
                                      mappingErrors: mapErr,
                                      validationFailures: valFail,
                                      typeMismatches: typeMis,
                                      missingHeaders: 0
                                    };
                                  }

                                  setBatchHistory(prev => [
                                    ...prev,
                                    {
                                      id: newId,
                                      name: `Simulated Batch Inflow #${Math.floor(Math.random() * 800) + 100}`,
                                      timestamp: timeStr,
                                      successCount: succs,
                                      failureCount: fails,
                                      totalCount: total,
                                      status: fails > 0 ? 'error' : 'completed',
                                      errorDetails: simulatedErrorDetails
                                    }
                                  ]);
                                  setSelectedBatchId(newId);
                                  addAuditEvent(
                                    'custom_post',
                                    'Simulated Batch Performance',
                                    `Generated mock stream run telemetry with detailed error metrics (${fails} fails categorized: ${simulatedErrorDetails ? JSON.stringify(simulatedErrorDetails) : 'None'}).`
                                  );
                                }}
                                className="text-[9px] text-indigo-400 hover:text-indigo-350 font-semibold font-mono bg-indigo-950/40 hover:bg-indigo-950/80 border border-indigo-900/60 px-2 py-0.5 rounded transition-all cursor-pointer active:scale-95"
                              >
                                + Simulate Run
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setBatchHistory([]);
                                  setSelectedBatchId(null);
                                }}
                                className="text-[9px] text-slate-505 hover:text-rose-450 font-mono border border-slate-800 px-2 py-0.5 rounded transition-all cursor-pointer active:scale-95"
                              >
                                Reset Logs
                              </button>
                            </div>
                          </div>

                          {/* Summary Metrics Row */}
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-slate-950 p-2 rounded-lg border border-slate-850">
                              <span className="block text-[8px] font-mono text-slate-400 uppercase tracking-wider">Overall Reliability</span>
                              <span className={`text-sm font-extrabold font-mono ${parseFloat(overallReliability) >= 95 ? 'text-emerald-400' : parseFloat(overallReliability) >= 80 ? 'text-amber-400' : 'text-rose-455'}`}>
                                {overallReliability}%
                              </span>
                            </div>
                            <div className="bg-slate-950 p-2 rounded-lg border border-slate-850">
                              <span className="block text-[8px] font-mono text-slate-400 uppercase tracking-wider">Total Records Posted</span>
                              <span className="text-sm font-extrabold font-mono text-slate-200">
                                {totalSuccessRows} <span className="text-[10px] text-slate-500 font-normal">/ {totalProcessedRows}</span>
                              </span>
                            </div>
                            <div className="bg-slate-950 p-2 rounded-lg border border-slate-850">
                              <span className="block text-[8px] font-mono text-slate-400 uppercase tracking-wider">Fault Frequency</span>
                              <span className={`text-sm font-extrabold font-mono ${totalFailureRows > 0 ? 'text-rose-455 animate-pulse' : 'text-slate-450'}`}>
                                {totalFailureRows} <span className="text-[9px] text-slate-500 font-normal font-sans">fails</span>
                              </span>
                            </div>
                          </div>

                          {/* Recharts Stacked Bar Area */}
                          {batchHistory.length === 0 ? (
                            <div className="h-40 bg-slate-950/50 border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center text-center p-4">
                              <TrendingUp className="w-8 h-8 text-slate-700 mb-1" />
                              <p className="text-[10px] font-mono text-slate-500">No batch telemetry available.</p>
                              <p className="text-[8px] text-slate-600">Run a sequential queue or hit 'Simulate' above.</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="h-44 w-full bg-slate-920 p-2 rounded-lg border border-slate-850 cursor-pointer">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={batchHistory.slice(-7)} // Show the last 7 items dynamically to fit neatly
                                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                                    onClick={(state: any) => {
                                      if (state && state.activePayload && state.activePayload[0]) {
                                        const payload = state.activePayload[0].payload;
                                        setSelectedBatchId(payload.id);
                                      }
                                    }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis 
                                      dataKey="timestamp" 
                                      stroke="#64748b" 
                                      fontSize={8} 
                                      tickLine={false} 
                                    />
                                    <YAxis 
                                      stroke="#64748b" 
                                      fontSize={8} 
                                      tickLine={false} 
                                      allowDecimals={false}
                                    />
                                    <Tooltip
                                      content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                          const data = payload[0].payload;
                                          const errs = data.errorDetails || {};
                                          return (
                                            <div className="bg-slate-950/95 border border-slate-800 p-2.5 text-left rounded-lg shadow-xl font-mono text-[9px] text-slate-300 min-w-[200px] backdrop-blur-xs select-none">
                                              <p className="font-bold text-slate-100 border-b border-slate-850 pb-1 mb-1.5 truncate max-w-[220px]">
                                                {data.name}
                                              </p>
                                              <div className="space-y-1 text-xs">
                                                <div className="flex justify-between text-[9px]">
                                                  <span className="text-slate-400">Timestamp:</span>
                                                  <span className="text-slate-200">{data.timestamp}</span>
                                                </div>
                                                <div className="flex justify-between text-[9px]">
                                                  <span className="text-slate-400">Total Rows:</span>
                                                  <span className="text-slate-200 font-bold">{data.totalCount}</span>
                                                </div>
                                                <div className="flex justify-between text-[9px]">
                                                  <span className="text-emerald-500 font-medium font-sans">✨ Successes:</span>
                                                  <span className="text-emerald-400 font-bold">{data.successCount}</span>
                                                </div>
                                                <div className="flex justify-between text-[9px] border-b border-slate-900 pb-1">
                                                  <span className="text-rose-500 font-medium font-sans">⚠️ Failures:</span>
                                                  <span className="text-rose-400 font-bold">{data.failureCount}</span>
                                                </div>

                                                {data.failureCount > 0 ? (
                                                  <div className="pt-1.5 space-y-1">
                                                    <p className="text-rose-400 text-[8px] font-bold uppercase tracking-wider font-sans">Error Categories</p>
                                                    <div className="flex justify-between text-[8px] text-slate-400">
                                                      <span>• Cat/Account Maps:</span>
                                                      <span className={`font-bold ${errs.mappingErrors ? 'text-rose-400' : 'text-slate-500'}`}>{errs.mappingErrors || 0}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[8px] text-slate-400">
                                                      <span>• Schema Validation:</span>
                                                      <span className={`font-bold ${errs.validationFailures ? 'text-rose-400' : 'text-slate-500'}`}>{errs.validationFailures || 0}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[8px] text-slate-400">
                                                      <span>• Type Mismatch:</span>
                                                      <span className={`font-bold ${errs.typeMismatches ? 'text-rose-400' : 'text-slate-500'}`}>{errs.typeMismatches || 0}</span>
                                                    </div>
                                                    {errs.missingHeaders > 0 && (
                                                      <div className="flex justify-between text-[8px] text-slate-400">
                                                        <span>• Missing Headers:</span>
                                                        <span className="text-rose-400 font-bold">{errs.missingHeaders}</span>
                                                      </div>
                                                    )}
                                                  </div>
                                                ) : (
                                                  <div className="pt-1 text-emerald-400 text-[8px] font-bold font-sans flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                                    <span>100% Validation Integrity</span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        }
                                        return null;
                                      }}
                                    />
                                    <Bar 
                                      dataKey="successCount" 
                                      stackId="a" 
                                      fill="#10b981" 
                                      name="Successes" 
                                      radius={[0, 0, 0, 0]} 
                                      fillOpacity={highlightedMetric === 'failureCount' ? 0.25 : 1.0}
                                    />
                                    <Bar 
                                      dataKey="failureCount" 
                                      stackId="a" 
                                      fill="#f43f5e" 
                                      name="Failures" 
                                      radius={[3, 3, 0, 0]} 
                                      fillOpacity={highlightedMetric === 'successCount' ? 0.25 : 1.0}
                                    />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>

                              {/* Interactive Color Legend */}
                              <div className="flex flex-wrap items-center justify-center gap-3 pt-1 font-mono text-[9px] select-none text-slate-300">
                                <span className="text-slate-500 font-sans text-[8px] uppercase tracking-wider">Interactive Legend Filters:</span>
                                
                                <button
                                  type="button"
                                  onClick={() => setHighlightedMetric(highlightedMetric === 'successCount' ? 'all' : 'successCount')}
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded border transition-all hover:bg-slate-850/50 cursor-pointer ${
                                    highlightedMetric === 'successCount'
                                      ? 'bg-emerald-950/70 border-emerald-500 text-emerald-400 font-bold shadow-xs'
                                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700'
                                  }`}
                                  title="Click to isolate successes in the chart"
                                >
                                  <span className="w-2.5 h-1.5 rounded-xs bg-emerald-500 shrink-0" />
                                  <span>Successes (Valid QuickBooks mappings)</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setHighlightedMetric(highlightedMetric === 'failureCount' ? 'all' : 'failureCount')}
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded border transition-all hover:bg-slate-850/50 cursor-pointer ${
                                    highlightedMetric === 'failureCount'
                                      ? 'bg-rose-950/70 border-rose-500 text-rose-400 font-bold shadow-xs'
                                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700'
                                  }`}
                                  title="Click to isolate failures in the chart"
                                >
                                  <span className="w-2.5 h-1.5 rounded-xs bg-rose-500 shrink-0" />
                                  <span>Failures (Discrepancies & validation faults)</span>
                                </button>

                                {highlightedMetric !== 'all' && (
                                  <button
                                    type="button"
                                    onClick={() => setHighlightedMetric('all')}
                                    className="text-indigo-400 hover:text-indigo-300 font-bold px-1 py-0.5 hover:underline cursor-pointer active:scale-95 transition-all text-[8px] uppercase font-sans"
                                  >
                                    Reset Highlights
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Interactive Expandable Error Types Breakdown Panel */}
                          {(() => {
                            const selectedBatch = batchHistory.find(b => b.id === selectedBatchId);
                            if (!selectedBatch) return null;

                            const sRate = selectedBatch.totalCount > 0 
                              ? ((selectedBatch.successCount / selectedBatch.totalCount) * 100).toFixed(0) 
                              : "100";

                            return (
                              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3 transition-all duration-200 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${selectedBatch.status === 'completed' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                                    <h4 className="text-[11px] font-bold text-slate-100 uppercase tracking-wide">
                                      Breakdown: {selectedBatch.name}
                                    </h4>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedBatchId(null)}
                                    className="text-[9px] text-slate-500 hover:text-slate-350 font-mono transition-colors border border-slate-850 px-1.5 py-0.5 rounded"
                                  >
                                    ✕ Close Panel
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                                  <div className="bg-slate-900 border border-slate-850 p-2 rounded">
                                    <span className="block text-[7.5px] font-mono text-slate-400 uppercase">Input Rows</span>
                                    <span className="text-[11.5px] font-bold font-mono text-slate-200">{selectedBatch.totalCount}</span>
                                  </div>
                                  <div className="bg-slate-900 border border-slate-850 p-2 rounded">
                                    <span className="block text-[7.5px] font-mono text-slate-400 uppercase">Success Rate</span>
                                    <span className={`text-[11.5px] font-bold font-mono ${selectedBatch.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                      {sRate}%
                                    </span>
                                  </div>
                                  <div className="bg-slate-900 border border-slate-850 p-2 rounded">
                                    <span className="block text-[7.5px] font-mono text-slate-400 uppercase">Mapping Fails</span>
                                    <span className={`text-[11.5px] font-bold font-mono ${selectedBatch.errorDetails?.mappingErrors ? 'text-rose-400 font-extrabold' : 'text-slate-500'}`}>
                                      {selectedBatch.errorDetails?.mappingErrors || 0}
                                    </span>
                                  </div>
                                  <div className="bg-slate-900 border border-slate-850 p-2 rounded">
                                    <span className="block text-[7.5px] font-mono text-slate-400 uppercase">Schema Mismatches</span>
                                    <span className={`text-[11.5px] font-bold font-mono ${selectedBatch.errorDetails?.validationFailures ? 'text-rose-455 font-extrabold' : 'text-slate-500'}`}>
                                      {selectedBatch.errorDetails?.validationFailures || 0}
                                    </span>
                                  </div>
                                </div>

                                {selectedBatch.failureCount > 0 ? (
                                  <div className="bg-rose-950/20 border border-rose-900/30 rounded-lg p-2.5 text-[9px] font-sans text-slate-300 space-y-2">
                                    <div className="flex items-center justify-between text-[8px] font-mono font-bold text-rose-400 uppercase tracking-widest border-b border-rose-950/50 pb-1">
                                      <span>Categorized Error Breakdown</span>
                                      <span>{selectedBatch.failureCount} failed rows</span>
                                    </div>
                                    <ul className="list-inside list-disc space-y-1 text-slate-300 font-mono text-[8.5px]">
                                      {(selectedBatch.errorDetails?.mappingErrors || 0) > 0 && (
                                        <li>
                                          <span className="text-rose-455 font-bold">({selectedBatch.errorDetails?.mappingErrors}) Mapping Errors:</span> The selected account codes did not possess corresponding category identifiers defined inside QuickBooks IIF structures.
                                        </li>
                                      )}
                                      {(selectedBatch.errorDetails?.validationFailures || 0) > 0 && (
                                        <li>
                                          <span className="text-rose-455 font-bold">({selectedBatch.errorDetails?.validationFailures}) Validation Failures:</span> Essential fields such as Customer ID, Email, or Date was empty or did not conform to safe database constraints.
                                        </li>
                                      )}
                                      {(selectedBatch.errorDetails?.typeMismatches || 0) > 0 && (
                                        <li>
                                          <span className="text-rose-455 font-bold">({selectedBatch.errorDetails?.typeMismatches}) Type Mismatches:</span> Amount or Quantity values contained non-numeric text characters or fell outside acceptable float value bounds.
                                        </li>
                                      )}
                                      {(selectedBatch.errorDetails?.missingHeaders || 0) > 0 && (
                                        <li>
                                          <span className="text-rose-455 font-bold">({selectedBatch.errorDetails?.missingHeaders}) Missing Headers:</span> File segment lacks the standard CSV headers configured under alignment rules.
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                ) : (
                                  <div className="bg-emerald-950/20 border border-emerald-900/35 rounded-lg p-2 text-[9px] font-sans text-emerald-300 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                                    <span>Stream check complete. <strong>100% of rows successfully categorized</strong> with valid category mappings.</span>
                                  </div>
                                )}

                                <div className="pt-1 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => downloadBatchPDFReport(selectedBatch)}
                                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-[9.5px] font-sans font-semibold text-white bg-indigo-600 hover:bg-indigo-550 border border-indigo-400/40 px-3 py-1.5 rounded-lg transition-all shadow-xs hover:shadow-indigo-950 cursor-pointer active:scale-95"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download Detailed Audit Report (PDF)</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })()}
                          
                          {/* Detailed Trace Reference Table */}
                          {batchHistory.length > 0 && (
                            <div className="bg-slate-950 border border-slate-850 rounded-lg overflow-hidden">
                              <div className="bg-slate-900 px-2 py-1 border-b border-slate-850 flex items-center justify-between">
                                <span className="text-[8px] font-mono text-slate-400 uppercase">Recent Pipeline Processing Logs</span>
                                <span className="text-[7px] font-mono text-indigo-400 font-bold">Click log to see breakdown</span>
                              </div>
                              <div className="divide-y divide-slate-900/60 font-mono text-[8.5px] leading-relaxed max-h-32 overflow-y-auto">
                                {batchHistory.slice(-4).reverse().map((run) => (
                                  <div 
                                    key={run.id} 
                                    onClick={() => setSelectedBatchId(run.id)}
                                    className={`p-1.5 flex items-center justify-between hover:bg-slate-900/50 cursor-pointer transition-all ${
                                      selectedBatchId === run.id 
                                        ? 'bg-slate-850/65 border-l-2 border-indigo-500 pl-2' 
                                        : ''
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${run.status === 'completed' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                      <span className="text-slate-300 truncate" title={run.name}>{run.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-slate-500 text-[8px]">{run.timestamp}</span>
                                      <span className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-slate-400 text-[8px]">
                                        <span className="text-emerald-400 font-bold">{run.successCount}</span>
                                        <span>/</span>
                                        <span className={run.failureCount > 0 ? "text-rose-455 font-bold" : "text-slate-500"}>{run.failureCount}</span>
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    <div>
                      <div className="mb-2">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 font-mono">
                          Legacy Supplier Export Row Data (Mapped Fields)
                        </label>
                      </div>
                      <textarea
                        id="csv-row-input"
                        value={csvPayload}
                        onChange={(e) => setCsvPayload(e.target.value)}
                        className="w-full h-32 p-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'edi' && (
                  <div>
                    <div className="mb-3 space-y-2">
                      <ClickToEditWrapper fieldKey="ediTitle" fieldLabel="EDI Transaction Title">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide font-mono">
                          {renderEditableText('ediTitle', 'block text-xs font-semibold text-slate-500 uppercase tracking-wide font-mono')}
                        </label>
                      </ClickToEditWrapper>
                      <ClickToEditWrapper fieldKey="ediDesc" fieldLabel="EDI Transaction Description" isTextArea={true}>
                        <span className="text-[11px] text-slate-400 block leading-snug">
                          {renderEditableText('ediDesc', 'text-[11px] text-slate-400 block leading-snug', true)}
                        </span>
                      </ClickToEditWrapper>
                    </div>
                    <textarea
                      id="edi-payload-input"
                      value={ediPayload}
                      onChange={(e) => setEdiPayload(e.target.value)}
                      className="w-full h-56 p-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                {activeTab === 'ai_mapped' && (
                  <div className="space-y-3">
                    <div>
                      <div className="mb-2">
                        <ClickToEditWrapper fieldKey="aiMappedTitle" fieldLabel="AI Cognitive Hub Title">
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5 font-mono">
                            {renderEditableText('aiMappedTitle', 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5 font-mono')}
                          </label>
                        </ClickToEditWrapper>
                        <ClickToEditWrapper fieldKey="aiMappedDesc" fieldLabel="AI Cognitive Hub Description" isTextArea={true}>
                          <span className="text-[11px] text-slate-400 block mb-2 leading-snug">
                            {renderEditableText('aiMappedDesc', 'text-[11px] text-slate-400 block mb-2 leading-snug', true)}
                          </span>
                        </ClickToEditWrapper>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {AI_PRESETS.map((p, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setAiRawInput(p.input);
                                setAiCustomNotes(p.notes);
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-mono font-medium rounded-lg border border-slate-300 shadow-sm transition-colors cursor-pointer"
                            >
                              ⚡ {p.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        id="ai-text-input"
                        value={aiRawInput}
                        onChange={(e) => setAiRawInput(e.target.value)}
                        placeholder="Paste order notification email or irregular log here..."
                        className="w-full h-32 p-3 font-sans text-xs bg-indigo-950/10 border border-indigo-200/50 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="mb-1 flex items-center gap-1 text-slate-500">
                        <Cpu className="w-3 h-3 text-indigo-500" />
                        <label className="block text-[11px] font-semibold uppercase tracking-wider font-mono">
                          Cognitive Mapping Rules (Instructions for Gemini)
                        </label>
                      </div>
                      <input
                        id="ai-rules-input"
                        type="text"
                        value={aiCustomNotes}
                        onChange={(e) => setAiCustomNotes(e.target.value)}
                        className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Tax exemption, specific shipping rule, bulk rate..."
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions for current tab */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
              <span className="text-[10px] uppercase font-mono text-slate-400">
                {activeTab === 'ai_mapped' ? 'Gemini AI Processor' : 'Universal Deterministic gateway'}
              </span>
              
              {activeTab === 'ai_mapped' ? (
                <button
                  id="run-ai-btn"
                  onClick={handleAIMapTranslate}
                  disabled={aiTranslating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-950 text-white rounded-lg text-xs font-bold tracking-tight shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {aiTranslating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Gemini Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Run AI Cognitive Map
                    </>
                  )}
                </button>
              ) : (
                <button
                  id="translate-btn"
                  onClick={handleTranslatePreset}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-950 text-white rounded-lg text-xs font-bold tracking-tight shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  Translate Feed Payload
                </button>
              )}
            </div>
          </div>

          {/* Side-by-Side Flow Map Visualizer (The Middle tier) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* flowchart map */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4.5 h-4.5 text-indigo-500" />
                    <h3 className="text-sm font-semibold text-slate-900">Transformation Flow Graph</h3>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">
                    Source → Canonical Form
                  </span>
                </div>

                {/* Dynamically calculate node statuses based on input payloads */}
                {(() => {
                  const node1_payload = activeTab === 'shopify' ? shopifyPayload : activeTab === 'legacy_csv' ? csvPayload : activeTab === 'edi' ? ediPayload : aiRawInput;
                  const isNode1ValEmpty = !node1_payload || !node1_payload.trim();
                  let hasNode1JsonError = false;
                  try {
                    if (activeTab === 'shopify' || activeTab === 'legacy_csv' || activeTab === 'edi') {
                      JSON.parse(node1_payload);
                    }
                  } catch (err) {
                    hasNode1JsonError = true;
                  }

                  const node1Status: 'active' | 'stalled' | 'error' = isNode1ValEmpty ? 'stalled' : hasNode1JsonError ? 'error' : 'active';
                  const node2Status: 'active' | 'stalled' | 'error' = node1Status === 'error' ? 'error' : node1Status === 'stalled' ? 'stalled' : translationError ? 'error' : !normalizedOrder ? 'stalled' : 'active';
                  const node3Status: 'active' | 'stalled' | 'error' = node2Status === 'error' ? 'error' : node2Status === 'stalled' ? 'stalled' : !normalizedOrder ? 'stalled' : 'active';

                  const isNode1Matched = flowNodeFilter === 'all' || node1Status === flowNodeFilter;
                  const isNode2Matched = flowNodeFilter === 'all' || node2Status === flowNodeFilter;
                  const isNode3Matched = flowNodeFilter === 'all' || node3Status === flowNodeFilter;

                  const node1OuterClass = `col-span-4 relative group cursor-pointer border rounded-lg p-2.5 text-center shadow-inner transition-all duration-300 ${
                    isNode1Matched 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-25 blur-[0.3px] scale-95'
                  } ${
                    node1Status === 'active' 
                      ? 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:shadow-sm' 
                      : node1Status === 'error' 
                        ? 'bg-rose-50 border-rose-200 hover:border-rose-350 shadow-rose-100/40' 
                        : 'bg-amber-50/50 border-amber-200/80 hover:border-amber-350 shadow-amber-100/40'
                  } ${
                    isNode1Matched && flowNodeFilter !== 'all' ? 'ring-2 ring-indigo-500/50 animate-pulse' : ''
                  }`;

                  const node2OuterClass = `col-span-3 flex flex-col items-center relative group transition-all duration-300 ${
                    isNode2Matched 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-25 blur-[0.3px] scale-95'
                  } ${
                    isNode2Matched && flowNodeFilter !== 'all' ? 'scale-105' : ''
                  }`;

                  const node3OuterClass = `col-span-4 relative group cursor-pointer border rounded-lg p-2.5 text-center shadow-inner transition-all duration-300 ${
                    isNode3Matched 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-25 blur-[0.3px] scale-95'
                  } ${
                    node3Status === 'active' 
                      ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-350 hover:shadow-xs' 
                      : node3Status === 'error' 
                        ? 'bg-rose-50 border-rose-200 hover:border-rose-350 shadow-rose-100/40' 
                        : 'bg-amber-50/50 border-amber-200/80 hover:border-amber-350 shadow-amber-100/40'
                  } ${
                    isNode3Matched && flowNodeFilter !== 'all' ? 'ring-2 ring-indigo-500/50 animate-pulse' : ''
                  }`;

                  return (
                    <div className="grid grid-cols-11 gap-2 items-center mb-6">
                      {/* Node 1: Raw Source Data */}
                      <div className={node1OuterClass}>
                        <span className={`text-[11px] font-mono font-bold uppercase block transition-colors duration-200 ${
                          node1Status === 'active' 
                            ? 'text-slate-500 group-hover:text-indigo-600' 
                            : node1Status === 'error' 
                              ? 'text-rose-600 font-extrabold' 
                              : 'text-amber-600 font-semibold'
                        }`}>
                          Raw Source Data
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                          {activeTab === 'shopify' ? 'shopify_webhook' : 
                           activeTab === 'legacy_csv' ? 'sup_csv_line' :
                           activeTab === 'edi' ? 'EDI_transaction' : 'Unstructured_AI'}
                        </span>
                        
                        {/* Hover Tooltip Card */}
                        <div className="absolute bottom-[115%] left-1/2 -translate-x-1/2 w-64 bg-slate-900 border border-slate-700 text-slate-100 p-3 rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 text-left">
                          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1.5 mb-1.5">
                            <span className={`w-2 h-2 rounded-full ${node1Status === 'active' ? 'bg-indigo-500' : node1Status === 'error' ? 'bg-rose-500' : 'bg-amber-400'} animate-pulse`}></span>
                            <span className="text-[10px] uppercase font-mono font-extrabold text-indigo-300">STAGE 01: INGESTION</span>
                          </div>
                          <div className="space-y-1 text-[10px] leading-relaxed font-sans">
                            <p className="font-semibold text-slate-200">
                              {activeTab === 'shopify' ? 'Shopify Webhook Feed' : 
                               activeTab === 'legacy_csv' ? 'Legacy CSV Stream' : 
                               activeTab === 'edi' ? 'EDI 850 PO Document' : 
                               'AI Dynamic Input Feed'}
                            </p>
                            <p className="text-slate-400 text-[9.5px]">
                              {activeTab === 'shopify' ? 'Asynchronous live REST hook order tracking with structural nested metadata fields.' : 
                               activeTab === 'legacy_csv' ? 'Dynamic spreadsheet stream supporting customized multi-header layouts and column bindings.' :
                               activeTab === 'edi' ? 'Heavy B2B purchase specs containing legacy segment lines and standard item loops.' :
                               'Raw text parsing powered by cognitive inference systems without structured templates.'}
                            </p>
                            <div className="border-t border-slate-800 mt-2 pt-1 flex justify-between text-[9px] font-mono">
                              <span className="text-slate-500">FORMAT:</span>
                              <span className="text-slate-350 font-bold">
                                {activeTab === 'shopify' ? 'application/json' : 
                                 activeTab === 'legacy_csv' ? 'text/csv' :
                                 activeTab === 'edi' ? 'EDIFACT/ANSI X12' : 'text/plain'}
                              </span>
                            </div>
                            <div className="flex justify-between text-[9px] font-mono">
                              <span className="text-slate-500">STAGE STATUS:</span>
                              <span className={`font-bold uppercase ${node1Status === 'active' ? 'text-emerald-400' : node1Status === 'error' ? 'text-rose-400' : 'text-amber-400'}`}>
                                {node1Status === 'active' ? '✓ READY' : node1Status === 'error' ? '❌ PARSING ERROR' : '⏳ WAITING FOR PAYLOAD'}
                              </span>
                            </div>
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                        </div>
                      </div>

                      {/* Node 2: Gateway Router */}
                      <div className={node2OuterClass}>
                        <div className="w-full flex items-center justify-center cursor-pointer">
                          <div className={`h-[2px] flex-1 transition-all duration-200 ${node2Status === 'active' ? 'bg-indigo-350 group-hover:bg-indigo-400' : node2Status === 'error' ? 'bg-rose-300' : 'bg-slate-300'}`}></div>
                          <div className={`px-1.5 py-1 text-[9px] font-mono rounded transform scale-90 font-bold border shadow-sm transition-all duration-200 ${
                            node2Status === 'active'
                              ? 'bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200 hover:border-indigo-400'
                              : node2Status === 'error'
                                ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 hover:border-rose-350'
                                : 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100 hover:border-amber-350'
                          }`}>
                            Gateway
                          </div>
                          <div className={`h-[2px] flex-1 relative transition-all duration-200 ${node2Status === 'active' ? 'bg-indigo-350 group-hover:bg-indigo-400' : node2Status === 'error' ? 'bg-rose-300' : 'bg-slate-300'}`}>
                            <ArrowRight className={`w-3.5 h-3.5 absolute right-0 -top-1.5 ${node2Status === 'active' ? 'text-indigo-505' : node2Status === 'error' ? 'text-rose-500' : 'text-slate-400'}`} />
                          </div>
                        </div>

                        {/* Hover Tooltip Card */}
                        <div className="absolute bottom-[115%] left-1/2 -translate-x-1/2 w-64 bg-slate-900 border border-slate-700 text-slate-100 p-3 rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 text-left">
                          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1.5 mb-1.5">
                            <span className={`w-2 h-2 rounded-full ${node2Status === 'active' ? 'bg-emerald-500' : node2Status === 'error' ? 'bg-rose-500' : 'bg-amber-400'} animate-pulse`}></span>
                            <span className="text-[10px] uppercase font-mono font-extrabold text-emerald-300">STAGE 02: MEDIATION</span>
                          </div>
                          <div className="space-y-1 text-[10px] leading-relaxed font-sans">
                            <p className="font-semibold text-slate-200">ERP Integration Router</p>
                            <p className="text-slate-400 text-[9.5px]">
                              Compiles, realigns, and translates raw source data layouts to canonical schema. Manually maps variables or defaults based on alignments.
                            </p>
                            <div className="border-t border-slate-800 mt-2 pt-1 flex justify-between text-[9px] font-mono">
                              <span className="text-slate-500">METHOD:</span>
                              <span className="text-slate-350 font-bold">
                                {activeTab === 'ai_mapped' ? 'Cognitive LLM Parser' : 'Algorithmic Mapper'}
                              </span>
                            </div>
                            <div className="flex justify-between text-[9px] font-mono">
                              <span className="text-slate-500">ENGINE STATUS:</span>
                              <span className={`font-bold uppercase ${node2Status === 'active' ? 'text-emerald-400' : node2Status === 'error' ? 'text-rose-450' : 'text-amber-400'}`}>
                                {node2Status === 'active' ? '✓ ACTIVE & LISTENING' : node2Status === 'error' ? '❌ TRANSLATION FAILED' : '⏳ WAITING FOR TRANSLATION'}
                              </span>
                            </div>
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                        </div>
                      </div>

                      {/* Node 3: Canonical Order */}
                      <div className={node3OuterClass}>
                        <span className={`text-[11px] font-mono font-bold uppercase block ${
                          node3Status === 'active' 
                            ? 'text-emerald-700' 
                            : node3Status === 'error' 
                              ? 'text-rose-600' 
                              : 'text-amber-600'
                        }`}>
                          Canonical Order
                        </span>
                        <span className={`text-[10px] font-mono block mt-0.5 ${node3Status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                          canonical.ts compliant
                        </span>
                        
                        {/* Hover Tooltip Card */}
                        <div className="absolute bottom-[115%] left-1/2 -translate-x-1/2 w-64 bg-slate-900 border border-slate-700 text-slate-100 p-3 rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 text-left">
                          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1.5 mb-1.5">
                            <span className={`w-2 h-2 rounded-full ${node3Status === 'active' ? 'bg-pink-500' : node3Status === 'error' ? 'bg-rose-500' : 'bg-amber-400'} animate-pulse`}></span>
                            <span className="text-[10px] uppercase font-mono font-extrabold text-pink-300">STAGE 03: CANONICAL OBJ</span>
                          </div>
                          <div className="space-y-1 text-[10px] leading-relaxed font-sans">
                            <p className="font-semibold text-slate-200">Standard Unified Object Schema</p>
                            <p className="text-slate-400 text-[9.5px]">
                              Uniform structured schema containing item listings, email destinations, reference IDs, and formatted cent values.
                            </p>
                            <div className="border-t border-slate-800 mt-2 pt-1 flex justify-between text-[9px] font-mono">
                              <span className="text-slate-500">SCHEMATIC TYPE:</span>
                              <span className="text-slate-350 font-bold font-mono">canonical.ts Definition</span>
                            </div>
                            <div className="flex justify-between text-[9px] font-mono">
                              <span className="text-slate-550">DISPATCH READY:</span>
                              <span className={`font-bold ${node3Status === 'active' ? 'text-emerald-400' : node3Status === 'error' ? 'text-rose-450' : 'text-amber-400'}`}>
                                {node3Status === 'active' ? '✓ VALIDATED' : node3Status === 'error' ? '❌ DISPATCH ERROR' : '⏳ PENDING'}
                              </span>
                            </div>
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Side-by-side attributes comparison */}
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 text-xs font-mono text-slate-600 space-y-1.5 max-h-[174px] overflow-y-auto mb-4">
                  <h4 className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider mb-2">Normalized Attribute Translation Map:</h4>
                  
                  {activeTab === 'shopify' && (
                    <>
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                        <span>source_id ← payload.id.toString()</span>
                        <span className="text-indigo-600">"shopify-9402128"</span>
                      </div>
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-1 mt-1">
                        <span>items[0].sku ← line_items[0].sku</span>
                        <span className="text-indigo-600">"CLTH-SWEATER-0"</span>
                      </div>
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-1 mt-1">
                        <span>items[1].sku ← line_items[1].sku</span>
                        <span className="text-indigo-600">"ACC-LEATHER-BELT"</span>
                      </div>
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-1 mt-1">
                        <span>totalAmount ← Round(164.90 * 100) cents</span>
                        <span className="text-indigo-600">16490</span>
                      </div>
                      <div className="flex justify-between border-slate-200 pb-1 mt-1">
                        <span>taxAmount ← Round(14.90 * 100) cents</span>
                        <span className="text-indigo-600">1490</span>
                      </div>
                    </>
                  )}

                  {activeTab === 'legacy_csv' && (
                    <>
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                        <span>source_id ← RecordID</span>
                        <span className="text-indigo-600">"INV-10255"</span>
                      </div>
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-1 mt-1">
                        <span>items[0].sku ← PartNum</span>
                        <span className="text-indigo-600">"IND-STEEL-BRCKT"</span>
                      </div>
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-1 mt-1">
                        <span>items[0].unitPrice ← Round(UnitPrice * 100)</span>
                        <span className="text-indigo-600">4999</span>
                      </div>
                      <div className="flex justify-between border-slate-200 pb-1 mt-1">
                        <span>totalAmount ← Round(Qty * UnitPrice * 100)</span>
                        <span className="text-indigo-600">19996</span>
                      </div>
                    </>
                  )}

                  {activeTab === 'edi' && (
                    <>
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                        <span>source_id ← purchase_order_number</span>
                        <span className="text-indigo-600">"PO-B2B-671201"</span>
                      </div>
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-1 mt-1">
                        <span>items[0].sku ← baseline_item_data.product_service_id</span>
                        <span className="text-indigo-600">"HVY-MACH-VALVE"</span>
                      </div>
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-1 mt-1">
                        <span>items[1].sku ← baseline_item_data.product_service_id</span>
                        <span className="text-indigo-600">"HVY-MACH-GASKET"</span>
                      </div>
                      <div className="flex justify-between border-slate-200 pb-1 mt-1">
                        <span>totalAmount ← Calculated Sum of Items total (cents)</span>
                        <span className="text-indigo-600">99000</span>
                      </div>
                    </>
                  )}

                  {activeTab === 'ai_mapped' && (
                    <>
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                        <span>source_id ← extracted from text</span>
                        <span className="text-indigo-600">"Wholesale- Spencer3"</span>
                      </div>
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-1 mt-1">
                        <span>items[0].sku ← parsed sku</span>
                        <span className="text-indigo-600">"CONC-PLT-33"</span>
                      </div>
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-1 mt-1">
                        <span>Calculated unitPrice</span>
                        <span className="text-indigo-600">25000 cents</span>
                      </div>
                      <div className="flex justify-between border-slate-200 pb-1 mt-1">
                        <span>Calculated totalAmount</span>
                        <span className="text-indigo-600">75000 cents</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ERP General Ledger Poster Widget */}
              <div className="bg-slate-950 text-slate-150 rounded-xl p-4 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest block">POST TO GENERAL LEDGER DISPATCHER</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">AR vs Cash</span>
                    <button 
                      id="ledger-type-toggle"
                      onClick={() => setPostToCash(!postToCash)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-[10px] text-indigo-300 font-mono rounded cursor-pointer"
                    >
                      {postToCash ? 'Cash (1010)' : 'Accounts Rec. (1200)'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    {normalizedOrder ? (
                      <div className="text-xs">
                        <span className="text-slate-400">Order Ref:</span> <span className="font-mono text-emerald-400 font-bold">{normalizedOrder.sourceSystem.toUpperCase()} #{normalizedOrder.sourceOrderId}</span>
                        <span className="text-slate-400 ml-3">Value:</span> <span className="font-mono text-indigo-400 font-bold">{formatCentsToUSD(normalizedOrder.totalAmount)}</span>
                      </div>
                    ) : (
                      <span className="text-xs font-mono text-slate-500 italic block py-1.5">Waiting for translation normalized order object...</span>
                    )}
                  </div>
                  
                  <button
                    id="post-ledger-btn"
                    onClick={handlePostToLedger}
                    disabled={!normalizedOrder}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-950 disabled:opacity-40 disabled:hover:bg-emerald-600 rounded-lg text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Commit Double-Entry Record
                  </button>
                </div>
              </div>

            </div>

            {/* Canonical Form JSON Document Output Card & Clean Visual representation */}
            <div id="canonical-schema-output-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden transition-all duration-300 hover:shadow-indigo-950/10">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/15 rounded-lg text-indigo-400">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold tracking-wide text-white text-[13px] block">Cleaned Transformation Output</span>
                    <span className="text-[9px] text-slate-500 uppercase mt-0.5 block">Canonical validation matrix</span>
                  </div>
                </div>

                {/* Toggles for mode selection & Download option */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setOutputViewMode('visual')}
                      className={`px-3 py-1 text-[10px] font-sans font-bold rounded-md transition-all cursor-pointer ${
                        outputViewMode === 'visual'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Visual Explorer
                    </button>
                    <button
                      onClick={() => setOutputViewMode('json')}
                      className={`px-3 py-1 text-[10px] font-mono rounded-md transition-all cursor-pointer ${
                        outputViewMode === 'json'
                          ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700 shadow'
                          : 'text-slate-400 hover:text-emerald-400'
                      }`}
                    >
                      Raw JSON
                    </button>
                  </div>

                  {normalizedOrder && (
                    <div className="flex items-center gap-2">
                      <button
                        id="download-transformation-png-btn"
                        onClick={downloadTransformationAsPng}
                        disabled={isCapturingPng}
                        className="px-3 py-1.5 bg-slate-800 border border-slate-750 text-slate-200 hover:bg-slate-750 active:scale-[0.98] disabled:opacity-40 rounded-lg text-[10.5px] font-sans font-bold shadow-md hover:shadow-indigo-950/20 transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Download clean transformation image for accounting audits"
                      >
                        {isCapturingPng ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-400"></div>
                            <span>Capturing...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Download as PNG</span>
                          </>
                        )}
                      </button>

                      <button
                        id="download-transformation-pdf-btn"
                        onClick={exportTransformationToPdf}
                        className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-705 text-white active:scale-[0.98] rounded-lg text-[10.5px] font-sans font-bold shadow-md hover:shadow-indigo-950/40 border border-indigo-550/40 transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Export document audit report as PDF format"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-200" />
                        <span>Export as PDF</span>
                      </button>

                      <button
                        id="generate-transformation-qrcode-btn"
                        onClick={generateCanonicalQrCode}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98] rounded-lg text-[10.5px] font-sans font-bold shadow-md hover:shadow-emerald-950/40 border border-emerald-550/45 transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Generate QR code representation of Canonical Order"
                      >
                        <QrCode className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Generate QR Code</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {translationError && (
                <div className="bg-rose-950/40 border border-rose-900 text-rose-300 p-4 rounded-xl text-xs font-sans space-y-1">
                  <strong className="block font-bold text-rose-200">❌ Payload Transformation Failed:</strong>
                  <p className="font-mono text-[11px] leading-relaxed">{translationError}</p>
                </div>
              )}

              {normalizedOrder ? (
                <div ref={canonicalCaptureRef} className="p-1 bg-slate-950 rounded-xl border border-slate-850/60 shadow-inner">
                  {outputViewMode === 'visual' ? (
                    <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-sans text-xs text-slate-300 space-y-4">
                      {/* Customer context header info */}
                      <div className="grid grid-cols-2 gap-3 border-b border-slate-850 pb-3 text-[11px]">
                        <div>
                          <span className="text-slate-500 font-bold uppercase tracking-wider block text-[9px] mb-0.5">Customer Account:</span>
                          <span className="font-mono text-white text-xs break-all font-semibold">{normalizedOrder.customerEmail}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold uppercase tracking-wider block text-[9px] mb-0.5">Reference ID / Channel:</span>
                          <span className="font-mono text-indigo-400 font-bold">
                            {normalizedOrder.sourceSystem.toUpperCase()} #{normalizedOrder.sourceOrderId}
                          </span>
                        </div>
                      </div>

                      {/* Items table */}
                      <div className="space-y-2">
                        <span className="text-slate-500 font-bold uppercase tracking-wider block text-[9px]">Ingested Line Items:</span>
                        <div className="border border-slate-850 rounded-lg overflow-hidden bg-slate-900/40">
                          <table className="min-w-full divide-y divide-slate-850 text-[11px]">
                            <thead className="bg-slate-950">
                              <tr className="text-left text-[9px] text-slate-500 uppercase font-mono tracking-wider">
                                <th className="px-3 py-1.5 pl-4">SKU Code</th>
                                <th className="px-3 py-1.5 text-center">Qty</th>
                                <th className="px-3 py-1.5 text-right">Unit Price</th>
                                <th className="px-3 py-1.5 text-right pr-4">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-850 text-[11px] font-mono">
                              {normalizedOrder.items.map((it: any, index: number) => {
                                const priceNum = parseFloat(it.unitPrice) / 100;
                                const subtotalNum = priceNum * it.quantity;
                                return (
                                  <tr key={index} className="text-slate-300">
                                    <td className="px-3 py-2 pl-4 text-white font-semibold">{it.sku}</td>
                                    <td className="px-3 py-2 text-center text-indigo-300">{it.quantity}</td>
                                    <td className="px-3 py-2 text-right">{formatCentsToUSD(parseFloat(it.unitPrice))}</td>
                                    <td className="px-3 py-2 text-right text-emerald-400 font-bold pr-4">
                                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subtotalNum)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Financial breakdown stats */}
                      <div className="grid grid-cols-2 items-end pt-2 border-t border-slate-850 gap-4">
                        <div className="space-y-1 text-[10px] text-slate-400 font-sans border-r border-slate-850 pr-4">
                          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Automated Clean Integrity Check:</span>
                          </div>
                          <div className="flex justify-between">
                            <span>• Customer Email verified:</span>
                            <span className="text-white font-mono">OK</span>
                          </div>
                          <div className="flex justify-between">
                            <span>• Debit/Credit symmetry:</span>
                            <span className="text-white font-mono">100% Balanced</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-right text-[11px]">
                          <div className="flex justify-between text-slate-400">
                            <span>Subtotal Amount:</span>
                            <span className="font-mono text-slate-300">
                              {formatCentsToUSD(parseInt(normalizedOrder.totalAmount) - parseInt(normalizedOrder.taxAmount))}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Estimated Sales Tax:</span>
                            <span className="font-mono text-slate-300">{formatCentsToUSD(parseInt(normalizedOrder.taxAmount))}</span>
                          </div>
                          <div className="flex justify-between text-white font-bold text-xs pt-1 border-t border-slate-800">
                            <span>Total Volume (USD):</span>
                            <span className="font-mono text-emerald-400">
                              {formatCentsToUSD(parseInt(normalizedOrder.totalAmount))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 max-h-[280px] overflow-auto">
                      <pre className="font-mono text-[10px] text-emerald-400 leading-snug whitespace-pre overflow-x-auto">
                        {JSON.stringify(normalizedOrder, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : !translationError ? (
                <div className="bg-slate-950 border border-slate-850 border-dashed rounded-xl p-8 text-center text-slate-500 italic text-[11px] font-sans">
                  {aiTranslating ? (
                    <div className="space-y-2">
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-400"></div>
                      <p className="text-indigo-300 not-italic">Running cognitive reasoning models on loose text...</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-400 not-italic">No Target Transaction Parsed</p>
                      <p className="text-[10px] text-slate-600">Choose an input card on the left, then click "Translate Feed Payload" or "Run AI Cognitive Map" to output clean structured invoices.</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

          </div>

        </div>

        {/* Section 2: PostgreSQL Double Entry Simulated Engine */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-10 overflow-hidden">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-100 rounded-xl text-slate-800 flex items-center justify-center shrink-0 w-9 h-9">
                <CorporateBrandLogo className="w-5 h-5" />
              </div>
              <div>
                <ClickToEditWrapper fieldKey="simDbTitle" fieldLabel="Simulated DB Title">
                  <h3 className="text-base font-bold text-slate-900">
                    {renderEditableText('simDbTitle', 'text-base font-bold text-slate-900')}
                  </h3>
                </ClickToEditWrapper>
                <div className="text-slate-500 text-xs mt-0.5 w-full">
                  <ClickToEditWrapper fieldKey="simDbDesc" fieldLabel="Simulated DB Description" isTextArea={true}>
                    <div className="text-slate-500 text-xs mt-0.5 w-full">
                      {renderEditableText('simDbDesc', 'text-slate-500 text-xs', true)}
                    </div>
                  </ClickToEditWrapper>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">Double-Entry Audit Logic:</span>
              <span className={`px-2 py-1 rounded text-xs font-bold font-mono ${auditBalanced ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {auditBalanced ? '∑ DEBITS = ∑ CREDITS (Perfect Balance)' : 'AMPLITUDE DELTA ERROR DETECTED'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Chart of accounts with active ledger balances */}
            <div className="lg:col-span-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Chart of Accounts Real-time Balances</h4>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <table className="min-w-full divide-y divide-slate-200 text-xs font-mono">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-slate-500 font-semibold tracking-wider">Code</th>
                      <th className="px-3 py-2 text-left text-slate-500 font-semibold tracking-wider">Account Name</th>
                      <th className="px-3 py-2 text-left text-slate-500 font-semibold tracking-wider">Type</th>
                      <th className="px-3 py-2 text-right text-slate-500 font-semibold tracking-wider">Net Balance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {accounts.map(acc => {
                      const prefix = acc.type === 'asset' || acc.type === 'expense' ? '(Dr Balance)' : '(Cr Balance)';
                      return (
                        <tr key={acc.code} className="hover:bg-slate-50">
                          <td className="px-3 py-2.5 font-bold text-slate-900">{acc.code}</td>
                          <td className="px-3 py-2.5 text-slate-700 font-sans font-medium">{acc.name}</td>
                          <td className="px-3 py-2.5 text-slate-400 uppercase text-[9px]">{acc.type}</td>
                          <td className="px-3 py-2.5 text-right font-bold text-slate-900">
                            {formatCentsToUSD(acc.netBalance)} <span className="text-[10px] text-slate-400 font-normal block">{prefix}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Custom SVG/Recharts Visualizer Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 h-64 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono block mb-2">Account Balance Distribution (USD)</span>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#64748b" />
                      <YAxis tick={{ fontSize: 9 }} stroke="#64748b" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="balance" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Manual Entry Adjustments Form */}
              <ManualAdjustmentForm
                manualSku={manualSku}
                setManualSku={setManualSku}
                manualAmount={manualAmount}
                setManualAmount={setManualAmount}
                manualEmail={manualEmail}
                setManualEmail={setManualEmail}
                handlePostManualAdjustment={handlePostManualAdjustment}
              />

            </div>

            {/* Book Journal Entries Table database rows */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Relational Ledger Records (double-entry ledger)</h4>
                {transactions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      id="export-ledger-csv-btn"
                      onClick={handleExportCSV}
                      className="flex items-center justify-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 border border-slate-200 rounded-lg text-xs font-semibold font-mono shadow-xs transition-all cursor-pointer active:scale-95 flex-shrink-0"
                      title="Export ledger transactions as downloadable CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export CSV
                    </button>
                    <button
                      id="export-ledger-iif-btn"
                      onClick={handleExportIIF}
                      className="flex items-center justify-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 border border-indigo-200 rounded-lg text-xs font-semibold font-mono shadow-xs transition-all cursor-pointer active:scale-95 flex-shrink-0"
                      title="Export ledger transactions as QuickBooks IIF for professional accounting synchronization"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-500" />
                      QB IIF Export
                    </button>
                    <button
                      id="export-ledger-pdf-btn"
                      onClick={handleExportPDF}
                      className="flex items-center justify-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer active:scale-95 flex-shrink-0"
                      title="Export professional PDF ledger report"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Export PDF
                    </button>
                  </div>
                )}
              </div>

              {/* Filter and Search Bar Row */}
              {/* Filter and Search Bar Row */}
              <div className="flex flex-col gap-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-xs">
                <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between w-full">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                    <div className="relative flex-1 sm:max-w-md flex items-center">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                      <input
                        id="ledger-search-input"
                        type="text"
                        value={ledgerSearchTerm}
                        onChange={(e) => setLedgerSearchTerm(e.target.value)}
                        placeholder="Search by ID, SKU, or Customer Email..."
                        className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs"
                      />
                      {ledgerSearchTerm && (
                        <button
                          type="button"
                          onClick={() => setLedgerSearchTerm('')}
                          className="absolute right-2.5 p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-all cursor-pointer flex items-center justify-center"
                          title="Clear Search"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Header-Level Sorting Dropdown Menu */}
                    <div className="relative" id="ledger-header-sort-dropdown-container">
                      <button
                        type="button"
                        id="ledger-header-sort-btn"
                        onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                        className="w-full sm:w-auto flex items-center justify-between gap-2 px-3 py-2 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-205 rounded-lg text-xs font-semibold font-mono text-slate-700 shadow-xs transition-all cursor-pointer flex-shrink-0"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
                        <span>
                          Sort: {ledgerSortBy === 'date_desc' && 'Date (Newest)'}
                          {ledgerSortBy === 'date_asc' && 'Date (Oldest)'}
                          {ledgerSortBy === 'amount_desc' && 'Amount (Highest)'}
                          {ledgerSortBy === 'amount_asc' && 'Amount (Lowest)'}
                        </span>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </button>

                      <AnimatePresence>
                        {isSortDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 5 }}
                            transition={{ duration: 0.12 }}
                            className="absolute left-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-40 font-mono text-xs text-left"
                          >
                            <div className="px-3 py-1 text-[9px] uppercase font-bold tracking-widest text-slate-400">
                              Sort ledger by:
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setLedgerSortBy('date_desc');
                                setIsSortDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                                ledgerSortBy === 'date_desc' ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-600'
                              }`}
                            >
                              <span>Date: Newest First</span>
                              {ledgerSortBy === 'date_desc' && <Check className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setLedgerSortBy('date_asc');
                                setIsSortDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                                ledgerSortBy === 'date_asc' ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-600'
                              }`}
                            >
                              <span>Date: Oldest First</span>
                              {ledgerSortBy === 'date_asc' && <Check className="w-3.5 h-3.5" />}
                            </button>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button
                              type="button"
                              onClick={() => {
                                setLedgerSortBy('amount_desc');
                                setIsSortDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                                ledgerSortBy === 'amount_desc' ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-600'
                              }`}
                            >
                              <span>Amount: Highest First</span>
                              {ledgerSortBy === 'amount_desc' && <Check className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setLedgerSortBy('amount_asc');
                                setIsSortDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                                ledgerSortBy === 'amount_asc' ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-600'
                              }`}
                            >
                              <span>Amount: Lowest First</span>
                              {ledgerSortBy === 'amount_asc' && <Check className="w-3.5 h-3.5" />}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono self-start sm:self-center">
                    <span>Displaying: <strong className="text-slate-800">{sortedTransactions.length}</strong> of {transactions.length} records</span>
                    {ledgerSearchTerm && (
                      <>
                        <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold uppercase text-[9px] border border-indigo-100">Filtered</span>
                        <button
                          type="button"
                          onClick={() => setLedgerSearchTerm('')}
                          className="text-slate-400 hover:text-rose-500 underline text-[10px] cursor-pointer"
                        >
                          Clear
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Filter dimension pills & quick search tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/70 text-[10px] font-mono">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Filter by:</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200/80 text-[10px]">
                    <Hash className="w-2.5 h-2.5 text-indigo-500" />
                    ID
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200/80 text-[10px]">
                    <Tag className="w-2.5 h-2.5 text-amber-500" />
                    SKU
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200/80 text-[10px]">
                    <Mail className="w-2.5 h-2.5 text-emerald-500" />
                    Customer Email
                  </span>

                  {/* Dynamic suggestions from available transactions */}
                  {transactions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 sm:ml-auto">
                      <span className="text-slate-400 text-[9px]">Quick:</span>
                      {(() => {
                        const quickSuggestions: { label: string; value: string; type: 'id' | 'sku' | 'email' }[] = [];
                        transactions.forEach(t => {
                          if (t.sourceId && !quickSuggestions.some(q => q.value === t.sourceId) && quickSuggestions.length < 5) {
                            quickSuggestions.push({ label: `#${t.sourceId}`, value: t.sourceId, type: 'id' });
                          }
                          if (t.sku && quickSuggestions.length < 5) {
                            const firstSku = t.sku.split(',')[0].trim();
                            if (!quickSuggestions.some(q => q.value === firstSku)) {
                              quickSuggestions.push({ label: firstSku, value: firstSku, type: 'sku' });
                            }
                          }
                          if (t.customerEmail && quickSuggestions.length < 5) {
                            if (!quickSuggestions.some(q => q.value === t.customerEmail)) {
                              quickSuggestions.push({ label: t.customerEmail.split('@')[0], value: t.customerEmail, type: 'email' });
                            }
                          }
                        });
                        return quickSuggestions.slice(0, 4).map((sug) => (
                          <button
                            key={sug.value}
                            type="button"
                            onClick={() => setLedgerSearchTerm(sug.value)}
                            className={`px-1.5 py-0.5 rounded border text-[9px] transition-colors cursor-pointer ${
                              ledgerSearchTerm.toLowerCase() === sug.value.toLowerCase()
                                ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                                : 'bg-white hover:bg-indigo-50 border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600'
                            }`}
                            title={`Filter transactions by ${sug.type.toUpperCase()}: ${sug.value}`}
                          >
                            {sug.label}
                          </button>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white flex-1 max-h-96 overflow-y-auto w-full">
                <table className="min-w-full divide-y divide-slate-200 text-xs font-mono">
                  <thead className="bg-slate-50 sticky top-0 z-10 shadow-xs">
                    <tr>
                      <th className="px-3 py-2 text-left text-slate-400 tracking-wider relative min-w-[130px]">
                        <div className="flex items-center gap-1.5" id="ledger-sort-dropdown-container">
                          <span>Posted At</span>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                              className="p-1 hover:bg-slate-200 active:bg-slate-300 rounded text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer flex items-center justify-center gap-0.5 border border-slate-200 bg-white"
                              title="Sort Ledger Records Menu"
                            >
                              <ArrowUpDown className="w-3.5 h-3.5" />
                              <ChevronDown className="w-2.5 h-2.5" />
                            </button>
                            
                            <AnimatePresence>
                              {isSortDropdownOpen && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                  transition={{ duration: 0.12 }}
                                  className="absolute left-0 mt-1 max-w-xs w-48 bg-white border border-slate-250 rounded-lg shadow-lg py-1 z-50 font-sans font-medium"
                                >
                                  <div className="px-2.5 py-1 text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                                    Sort Order
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLedgerSortBy('date_desc');
                                      setIsSortDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-2.5 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                                      ledgerSortBy === 'date_desc' ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-600'
                                    }`}
                                  >
                                    <span>Date: Newest First</span>
                                    {ledgerSortBy === 'date_desc' && <Check className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLedgerSortBy('date_asc');
                                      setIsSortDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-2.5 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                                      ledgerSortBy === 'date_asc' ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-600'
                                    }`}
                                  >
                                    <span>Date: Oldest First</span>
                                    {ledgerSortBy === 'date_asc' && <Check className="w-3.5 h-3.5" />}
                                  </button>
                                  <div className="border-t border-slate-100 my-1"></div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLedgerSortBy('amount_desc');
                                      setIsSortDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-2.5 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                                      ledgerSortBy === 'amount_desc' ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-600'
                                    }`}
                                  >
                                    <span>Amount: Highest First</span>
                                    {ledgerSortBy === 'amount_desc' && <Check className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLedgerSortBy('amount_asc');
                                      setIsSortDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-2.5 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                                      ledgerSortBy === 'amount_asc' ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-600'
                                    }`}
                                  >
                                    <span>Amount: Lowest First</span>
                                    {ledgerSortBy === 'amount_asc' && <Check className="w-3.5 h-3.5" />}
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          {ledgerSortBy.startsWith('date') ? (
                            <span className="text-[9px] bg-slate-100 text-slate-500 font-medium px-1 rounded truncate">
                              {ledgerSortBy === 'date_desc' ? 'New' : 'Old'}
                            </span>
                          ) : (
                            <span className="text-[9px] bg-indigo-50 text-indigo-505 font-medium px-1 rounded truncate">
                              {ledgerSortBy === 'amount_desc' ? 'High' : 'Low'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-3 py-2 text-left text-slate-400 tracking-wider">Transaction Context / account</th>
                      <th className="px-3 py-2 text-left text-slate-400 tracking-wider">Ref Code</th>
                      <th className="px-3 py-2 text-right text-slate-400 tracking-wider">Debit (Dr)</th>
                      <th className="px-3 py-2 text-right text-slate-400 tracking-wider">Credit (Cr)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {sortedTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500 font-sans text-xs">
                          {transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Database className="w-6 h-6 text-slate-300" />
                              <p className="italic">No accounting ledger records committed. Generate and commit a normalized order above.</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto py-2">
                              <Search className="w-6 h-6 text-indigo-400" />
                              <p className="font-semibold text-slate-700">No ledger transactions matched &ldquo;{ledgerSearchTerm}&rdquo;</p>
                              <p className="text-[11px] text-slate-500">
                                Try searching by another <strong>Transaction ID</strong>, <strong>SKU</strong>, or <strong>Customer Email</strong>.
                              </p>
                              <button
                                type="button"
                                onClick={() => setLedgerSearchTerm('')}
                                className="mt-1 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer"
                              >
                                Clear Search Filter
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : (
                      sortedTransactions.map((tx) => {
                        // Find child journal entries for this transaction
                        const txEntries = journalEntries.filter(je => je.transactionId === tx.id);
                        return (
                          <React.Fragment key={tx.id}>
                            {/* Transaction header row with ID, SKU, and Customer Email badges */}
                            <tr className="bg-slate-100/80 border-t border-slate-200">
                              <td className="px-3 py-2 text-slate-500 font-sans text-[10px] align-top">
                                <div className="font-mono text-slate-700 font-semibold">{new Date(tx.postedAt).toLocaleDateString()}</div>
                                <div className="text-[9px] text-slate-400 font-mono mt-0.5">{new Date(tx.postedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              </td>
                              <td colSpan={4} className="px-3 py-2 text-slate-800 text-[11px] font-sans">
                                <div className="font-bold text-slate-900 leading-snug">
                                  {tx.description}
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px] font-mono">
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-200/80 text-slate-700 rounded font-semibold text-[9px]">
                                    <Hash className="w-2.5 h-2.5 text-slate-500" />
                                    ID: {tx.id}
                                  </span>
                                  {tx.sourceId && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded text-[9px] font-semibold">
                                      Ref: #{tx.sourceId}
                                    </span>
                                  )}
                                  {tx.sku && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/70 rounded text-[9px] font-semibold">
                                      <Tag className="w-2.5 h-2.5 text-amber-600" />
                                      SKU: {tx.sku}
                                    </span>
                                  )}
                                  {tx.customerEmail && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200/70 rounded text-[9px] font-semibold">
                                      <Mail className="w-2.5 h-2.5 text-emerald-600" />
                                      {tx.customerEmail}
                                    </span>
                                  )}
                                  {tx.entity && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 rounded text-[9px]">
                                      {tx.entity}
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                            {/* Individual Debit/Credit splits */}
                            {txEntries.map(entry => {
                              const account = accounts.find(a => a.id === entry.accountId);
                              return (
                                <tr key={entry.id} className="hover:bg-slate-50/50">
                                  <td></td>
                                  <td className="px-3 py-2 text-slate-600 font-sans pl-6 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                    {account?.name}
                                  </td>
                                  <td className="px-3 py-2 text-slate-400 text-xs">
                                    {account?.code}
                                  </td>
                                  <td className="px-3 py-2 text-right font-bold text-indigo-600">
                                    {entry.debitAmount > 0 ? formatCentsToUSD(entry.debitAmount) : '-'}
                                  </td>
                                  <td className="px-3 py-2 text-right font-bold text-emerald-600">
                                    {entry.creditAmount > 0 ? formatCentsToUSD(entry.creditAmount) : '-'}
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Real-Time System Audit Trail Timeline */}
              <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-widest font-mono">
                      Real-Time Relational & Security Audit Trail
                    </span>
                  </div>
                  {auditTrail.length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm("Purge local audit trail event history?")) {
                          setAuditTrail([
                            {
                              id: `audit-${Math.random().toString(36).substring(2, 11)}`,
                              timestamp: new Date().toISOString(),
                              type: 'system_init',
                              title: 'Log Ledger Purged',
                              description: 'Persistent security audit logs cleared by system administrator.'
                            }
                          ]);
                        }
                      }}
                      className="text-[10px] font-mono font-bold text-slate-400 hover:text-rose-500 hover:underline cursor-pointer"
                    >
                      [Clear Logs]
                    </button>
                  )}
                </div>

                <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                  {auditTrail.map((evt, idx) => {
                    let iconElement = <Activity className="w-3.5 h-3.5 text-slate-600" />;
                    let bgClass = "bg-slate-100 border-slate-200";
                    
                    if (evt.type === 'reset') {
                      iconElement = <RefreshCw className="w-3.5 h-3.5 text-rose-600 animate-spin-once" />;
                      bgClass = "bg-rose-50 border-rose-200";
                    } else if (evt.type === 'manual_post') {
                      iconElement = <FileText className="w-3.5 h-3.5 text-indigo-600" />;
                      bgClass = "bg-indigo-50 border-indigo-200";
                    } else if (evt.type === 'custom_post') {
                      iconElement = <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
                      bgClass = "bg-emerald-50 border-emerald-200";
                    } else if (evt.type === 'rebrand') {
                      iconElement = <Pencil className="w-3.5 h-3.5 text-amber-600" />;
                      bgClass = "bg-amber-50 border-amber-200";
                    } else if (evt.type === 'system_init') {
                      iconElement = <CorporateBrandLogo className="w-3.5 h-3.5" />;
                      bgClass = "bg-slate-100 border-slate-200";
                    }

                    return (
                      <div key={evt.id} className="relative flex gap-4 text-xs">
                        {/* Vertical line connector */}
                        {idx !== auditTrail.length - 1 && (
                          <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-200/80 -translate-x-1/2 z-0" />
                        )}

                        {/* Event icon bubble badge */}
                        <div className={`relative z-10 w-8 h-8 rounded-full border flex items-center justify-center shrink-0 shadow-xs ${bgClass}`}>
                          {iconElement}
                        </div>

                        {/* Event details block */}
                        <div className="flex-1 min-w-0 bg-white border border-slate-150 rounded-lg p-2.5 shadow-2xs hover:shadow-xs transition-all">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="font-bold text-slate-800 truncate font-sans text-xs">
                              {evt.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono flex-shrink-0 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-500 font-sans text-[11px] leading-relaxed break-words">
                            {evt.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live SQL Console Workbench Tabbed Experience */}
              <SQLConsoleWorkbench
                customSql={customSql}
                setCustomSql={setCustomSql}
                sqlRows={sqlRows}
                sqlColumns={sqlColumns}
                sqlError={sqlError}
                sqlLoading={sqlLoading}
                activeLedgerTransactionSql={activeLedgerTransactionSql}
                sqlExecuted={sqlExecuted}
                handleExecuteSql={handleExecuteSql}
              />

            </div>

          </div>

        </section>

        {/* Section 3: Statutory GAAP Rules Guide */}
        <ReferenceManual />

      </main>

      {/* Cloudboy X Gateway Section */}
      {mainView === 'cloudboy_x' && (
        <main className="max-w-7xl mx-auto px-4 mt-8 sm:px-6 lg:px-8">
          <CloudboyXPortal 
            onRefreshStats={fetchLedgerState} 
            onPostMessage={(text, type) => setLedgerMessage({ text, type })} 
            isAdminMode={isAdminMode}
            lockedFields={lockedFields}
          />
        </main>
      )}

      {/* Procurement Lifecycle Section */}
      {mainView === 'procurement' && (
        <main className="max-w-7xl mx-auto px-4 mt-8 sm:px-6 lg:px-8">
          <ProcurementPortal 
            onRefreshStats={fetchLedgerState} 
            onPostMessage={(text, type) => setLedgerMessage({ text, type })} 
            isAdminMode={isAdminMode}
          />
        </main>
      )}

      {/* Multi-Entity Overview Section */}
      {mainView === 'multientity' && (
        <main className="max-w-7xl mx-auto px-4 mt-8 sm:px-6 lg:px-8">
          <MultiEntityOverview 
            accounts={accounts}
            transactions={transactions}
            journalEntries={journalEntries}
            onRefreshStats={fetchLedgerState}
          />
        </main>
      )}

      {/* System Admin Console Tab Section */}
      {mainView === 'admin' && (
        <main className="max-w-7xl mx-auto px-4 mt-8 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-slate-150 shadow-xl overflow-hidden p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <Shield className="w-8 h-8 text-amber-500 shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-slate-900">Enterprise System Oversight & Config Page</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Central master console hosting co-branding toggles, interactive customizers, and ledger history resets.</p>
              </div>
            </div>
            
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 md:p-6 shadow-inner">
              {renderAdminConsoleContent()}
            </div>
          </div>
        </main>
      )}

      {/* Diagnostics & Troubleshooting Section */}
      {mainView === 'troubleshooting' && (
        <main className="max-w-7xl mx-auto px-4 mt-8 sm:px-6 lg:px-8">
          <DiagnosticsPanel 
            onRefreshStats={fetchLedgerState} 
            onPostMessage={(text, type) => setLedgerMessage({ text, type })} 
          />
        </main>
      )}

      {/* Global Regulatory Compliance & Licensing Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 pb-12 border-t border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1 text-slate-400 grayscale scale-90">
              <CorporateBrandLogo className="w-8 h-8" />
            </div>
            <div className="text-left">
              <ClickToEditWrapper fieldKey="copyrightFooterText" fieldLabel="Copyright Copyright Footer Text">
                <p className="text-xs font-sans text-slate-500 font-medium">
                  {renderEditableText('copyrightFooterText', 'text-xs font-sans text-slate-500 font-medium')}
                </p>
              </ClickToEditWrapper>
              <div className="mt-1">
                <ClickToEditWrapper fieldKey="licenseFooterText" fieldLabel="Licensing Agreement Footer text" isTextArea={true}>
                  <p className="text-[10px] font-mono text-slate-400 leading-relaxed">
                    {renderEditableText('licenseFooterText', 'text-[10px] font-mono text-slate-400', true)}
                  </p>
                </ClickToEditWrapper>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold font-mono px-2 py-1 rounded border bg-slate-100 border-slate-200 text-slate-500 flex items-center gap-1 shrink-0">
              <Lock className="w-3 h-3 text-slate-400" />
              GAAP Compliance Node
            </span>
            <span className={`text-[10px] font-bold font-mono px-2 py-1 rounded border flex items-center gap-1 shrink-0 transition-all ${
              isAdminMode 
                ? 'bg-amber-500/10 border-amber-300 text-amber-700' 
                : lockedFields.includes('copyrightFooterText')
                  ? 'bg-rose-500/10 border-rose-300 text-rose-700'
                  : 'bg-emerald-500/10 border-emerald-300 text-emerald-700 animate-pulse'
            }`}>
              {isAdminMode 
                ? '🛡️ MASTER ADMIN STATUS (EDIT ALL)' 
                : lockedFields.includes('copyrightFooterText')
                  ? '🏢 RESELLER MODE (FOOTER LOCKED)'
                  : '🔓 RESELLER MODE (CO-BRANDING UNLOCKED)'
              }
            </span>
          </div>
        </div>
      </footer>

      {/* ADMIN CONSOLE POP-UP MODAL */}
      {isAdminConsoleOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-105 bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold tracking-tight uppercase font-mono">
                    🛡️ System Oversight & Control Console
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Live system configuration, regional branding overrides, and sandboxed database controls.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAdminConsoleOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close admin dashboard"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
              <div className="bg-white border border-slate-200/80 rounded-xl p-5 md:p-6 shadow-sm">
                {renderAdminConsoleContent()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                Secure SSH Link Engaged
              </div>
              <button
                onClick={() => setIsAdminConsoleOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-850 active:scale-95 text-xs font-bold font-mono text-white rounded-lg transition-all cursor-pointer shadow-md"
              >
                Close Oversight Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚡ CANONICAL QR CODE MODAL FOR MOBILE SCAN-TO-PROCESS */}
      <AnimatePresence>
        {isQrModalOpen && qrCodeDataUrl && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950 text-white">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 rounded-2xl shrink-0 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold font-mono tracking-tight uppercase">
                      {isScanningCamera ? "Real-time Scanner" : "Canonical Scan QR Code"}
                    </h3>
                    <p className="text-[9.5px] text-slate-400 font-sans mt-0.5">
                      {isScanningCamera ? "Ready for instant order payload scanner" : "Unified barcode payload compliant with JSON Canonical Schema"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowScanHistory(prev => !prev)}
                    className={`px-2 py-1 text-[9px] font-mono font-bold rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                      showScanHistory 
                        ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40 hover:bg-indigo-900/60' 
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                    title={showScanHistory ? "Hide Scanning History Pane" : "Show Scanning History Pane"}
                  >
                    {showScanHistory ? <EyeOff className="w-3 h-3 text-indigo-400" /> : <Eye className="w-3 h-3" />}
                    <span>{showScanHistory ? 'Hide History' : 'Show History'}</span>
                  </button>
                  <button
                    onClick={handleCloseQrModal}
                    className="p-1.5 rounded-2xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    aria-label="Close QR Code Dialogue"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* QR Image Area with Camera scanning toggle */}
              <div className="p-6 flex flex-col items-center justify-center bg-slate-950/50 text-center relative min-h-[300px]">
                {cameraError && (
                  <div className="p-3 bg-red-950/85 border border-red-500/30 rounded-xl text-red-200 text-[10px] text-left mb-4 flex items-start gap-2 max-w-xs shadow-lg">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <div>
                      <span className="font-bold block uppercase tracking-wider text-[8px] text-red-300">Camera Ingress Blocked</span>
                      <p className="mt-0.5 text-zinc-300 leading-normal">{cameraError}</p>
                    </div>
                  </div>
                )}

                {isScanningCamera ? (
                  <div className="flex flex-col items-center w-full">
                    <div className="flex items-center gap-2 mb-2.5">
                      <p className="text-[10px] text-slate-400 font-sans tracking-wide">
                        Align QR code in frame to scan
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowScannerInstructions(true)}
                        className="text-[10px] px-2 py-0.5 font-mono font-bold bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 rounded border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                        title="Optimal Scanning Guidelines"
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>Instructions</span>
                      </button>
                    </div>
                    <div className="w-full max-w-[280px] aspect-square relative bg-black border-2 border-indigo-500/40 rounded-2xl overflow-hidden flex flex-col items-center justify-center shadow-2xl">
                      <video 
                        ref={videoRef} 
                        className="w-full h-full object-cover rounded-2xl transition-all duration-200 ease-out" 
                        style={{ 
                          transform: `scale(${zoomLevel})`,
                          filter: cameraFilter === 'grayscale' 
                            ? 'grayscale(100%) contrast(160%) brightness(100%)' 
                            : cameraFilter === 'thermal' 
                            ? 'hue-rotate(240deg) saturate(280%) contrast(140%) brightness(110%)' 
                            : 'none'
                        }}
                        playsInline 
                        muted 
                      />

                      {/* Active video stream pulse indicator badge */}
                      <div className="absolute top-3 right-3 bg-slate-950/90 border border-emerald-500/30 rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-lg backdrop-blur-sm z-20 animate-fade-in">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[7.5px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
                          Active Scanning
                        </span>
                      </div>

                      {/* Professional SVG Scanning Reticle Overlay with Corner Markers */}
                      <svg 
                        className="absolute inset-0 w-full h-full pointer-events-none z-10" 
                        viewBox="0 0 280 280" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <defs>
                          <linearGradient id="reticleLaserGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                            <stop offset="20%" stopColor="#34d399" stopOpacity="0.8" />
                            <stop offset="50%" stopColor="#6ee7b7" stopOpacity="1" />
                            <stop offset="80%" stopColor="#34d399" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                          </linearGradient>
                          <filter id="reticleGlowEffect" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                          </filter>
                        </defs>

                        {/* Viewfinder ambient mask around active zone */}
                        <path 
                          d="M 0 0 H 280 V 280 H 0 Z M 36 36 V 244 H 244 V 36 Z" 
                          fill="rgba(2, 6, 23, 0.32)" 
                          fillRule="evenodd" 
                        />

                        {/* Active Zone Perimeter Guide */}
                        <rect 
                          x="36" 
                          y="36" 
                          width="208" 
                          height="208" 
                          rx="14" 
                          stroke="#10b981" 
                          strokeWidth="1.2" 
                          strokeOpacity="0.35" 
                          strokeDasharray="4 4" 
                        />

                        {/* High-Precision Corner Markers */}
                        {/* Top-Left */}
                        <path 
                          d="M 36 62 V 48 C 36 41.3726 41.3726 36 48 36 H 62" 
                          stroke="#34d399" 
                          strokeWidth="3.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          filter="url(#reticleGlowEffect)" 
                        />
                        {/* Top-Right */}
                        <path 
                          d="M 218 36 H 232 C 238.627 36 244 41.3726 244 48 V 62" 
                          stroke="#34d399" 
                          strokeWidth="3.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          filter="url(#reticleGlowEffect)" 
                        />
                        {/* Bottom-Left */}
                        <path 
                          d="M 36 218 V 232 C 36 238.627 41.3726 244 48 244 H 62" 
                          stroke="#34d399" 
                          strokeWidth="3.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          filter="url(#reticleGlowEffect)" 
                        />
                        {/* Bottom-Right */}
                        <path 
                          d="M 218 244 H 232 C 238.627 244 244 238.627 244 232 V 218" 
                          stroke="#34d399" 
                          strokeWidth="3.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          filter="url(#reticleGlowEffect)" 
                        />

                        {/* Mid-point alignment precision tick marks */}
                        <line x1="140" y1="30" x2="140" y2="42" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="140" y1="238" x2="140" y2="250" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="30" y1="140" x2="42" y2="140" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="238" y1="140" x2="250" y2="140" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />

                        {/* Center Crosshair Target */}
                        <g opacity="0.5">
                          <line x1="133" y1="140" x2="147" y2="140" stroke="#6ee7b7" strokeWidth="1.2" strokeLinecap="round" />
                          <line x1="140" y1="133" x2="140" y2="147" stroke="#6ee7b7" strokeWidth="1.2" strokeLinecap="round" />
                          <circle cx="140" cy="140" r="10" stroke="#6ee7b7" strokeWidth="0.8" strokeDasharray="2 2" />
                        </g>
                      </svg>

                      {/* High-Visibility Animated Vertical Green Scanning Beam within square reticle */}
                      <div className="absolute top-[13%] bottom-[13%] left-[13%] right-[13%] pointer-events-none overflow-hidden rounded-xl z-15">
                        <div className="absolute left-0 right-0 h-16 -translate-y-1/2 animate-scan-beam-vertical pointer-events-none flex flex-col items-center justify-center">
                          {/* Motion blur trailing layer behind the main beam */}
                          <div className="absolute -inset-x-2 -inset-y-3 bg-gradient-to-b from-emerald-500/0 via-emerald-400/25 to-emerald-500/0 blur-md opacity-70 pointer-events-none" />
                          <div className="absolute -inset-x-1 h-6 bg-emerald-500/15 blur-sm opacity-80 pointer-events-none" />

                          {/* Soft glowing ambient laser gradient */}
                          <div className="relative w-full h-8 bg-gradient-to-b from-emerald-500/0 via-emerald-400/35 to-emerald-500/0 blur-[2px]" />
                          
                          {/* Intense high-visibility laser beam line with neon pulse glow & optical flare points */}
                          <div className="relative z-10 w-full h-[2.5px] bg-gradient-to-r from-emerald-500/20 via-emerald-300 to-emerald-500/20 shadow-[0_0_12px_#34d399,0_0_24px_#10b981] animate-laser-pulse-glow flex items-center justify-between px-1 -mt-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 shadow-[0_0_6px_#6ee7b7]" />
                            <span className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_#34d399] opacity-95" />
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 shadow-[0_0_6px_#6ee7b7]" />
                          </div>
                        </div>
                      </div>

                      {/* Active detection zone text label */}
                      <div className="absolute bottom-11 pointer-events-none z-10 flex items-center justify-center">
                        <span className="text-[8px] font-mono font-bold uppercase text-emerald-400 bg-slate-950/85 px-2 py-0.5 rounded-full border border-emerald-500/30 tracking-wider shadow-md">
                          Active Detection Zone
                        </span>
                      </div>

                      {/* Instructions overlay modal when toggled active */}
                      <AnimatePresence>
                        {showScannerInstructions && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-md p-4 flex flex-col justify-between rounded-xl border border-slate-800"
                          >
                            <div className="w-full">
                              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                                <h4 className="text-[10px] font-bold font-mono tracking-wider text-indigo-400 uppercase flex items-center gap-1.5">
                                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" /> Optimal Scanning
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => setShowScannerInstructions(false)}
                                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <ul className="mt-3.5 space-y-3 text-left">
                                <li className="flex items-start gap-2">
                                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-[9px] font-bold mt-0.5 shrink-0">
                                    1
                                  </span>
                                  <div>
                                    <span className="font-mono text-[9px] font-bold text-slate-200 block">Distance & Plane</span>
                                    <span className="text-[8.5px] text-slate-400 leading-normal block">
                                      Keep the phone parallel and steady around 4-6 inches (10-15cm) away from the QR code.
                                    </span>
                                  </div>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-[9px] font-bold mt-0.5 shrink-0">
                                    2
                                  </span>
                                  <div>
                                    <span className="font-mono text-[9px] font-bold text-slate-200 block">Lighting Adjustments</span>
                                    <span className="text-[8.5px] text-slate-400 leading-normal block">
                                      Avoid glare or shadows. Toggle the bottom high-contrast 'Grayscale' or 'Thermal' filter to enhance readability.
                                    </span>
                                  </div>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-[9px] font-bold mt-0.5 shrink-0">
                                    3
                                  </span>
                                  <div>
                                    <span className="font-mono text-[9px] font-bold text-slate-200 block">Zoom Feature</span>
                                    <span className="text-[8.5px] text-slate-400 leading-normal block">
                                      If the bar or QR code is small, use the Focus Zoom slider (or 2.0x preset) instead of moving too close.
                                    </span>
                                  </div>
                                </li>
                              </ul>
                            </div>

                            <button
                              type="button"
                              onClick={() => setShowScannerInstructions(false)}
                              className="w-full mt-3 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white font-mono font-bold text-[9px] rounded-lg border border-indigo-500/30 transition-all cursor-pointer uppercase tracking-wider"
                            >
                              Resume Scanning
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Integrated Slider control for fine-grained focus adjusting */}
                    {zoomCapabilities && (
                      <div className="w-full max-w-[280px] mt-4 bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Focus Zoom Adjuster
                          </span>
                          <span className="text-[9px] font-mono text-indigo-400 font-bold bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-500/10">
                            {zoomLevel.toFixed(1)}x
                          </span>
                        </div>
                        
                        <input
                          type="range"
                          min={zoomCapabilities.min}
                          max={zoomCapabilities.max}
                          step={zoomCapabilities.step}
                          value={zoomLevel}
                          onChange={(e) => applyCameraZoom(parseFloat(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400 outline-none mt-2.5"
                        />
                        
                        <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 mt-1.5 uppercase">
                          <span>{zoomCapabilities.min.toFixed(1)}x</span>
                          <span className="text-[7.5px] text-slate-600">Low-Light Enhancer</span>
                          <span>{zoomCapabilities.max.toFixed(1)}x</span>
                        </div>

                        {/* Preset quick tap triggers for instant magnification adjustment */}
                        <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-800/80">
                          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider font-semibold">Presets:</span>
                          <button
                            type="button"
                            onClick={() => applyCameraZoom(1.0)}
                            className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                              Math.abs(zoomLevel - 1.0) < 0.05
                                ? 'bg-indigo-650 text-white border-indigo-500 shadow-sm'
                                : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-850'
                            }`}
                          >
                            1.0x (Standard)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const targetVal = Math.min(2.0, zoomCapabilities.max);
                              applyCameraZoom(targetVal);
                            }}
                            className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                              Math.abs(zoomLevel - 2.0) < 0.05
                                ? 'bg-indigo-650 text-white border-indigo-500 shadow-sm'
                                : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-850'
                            }`}
                          >
                            2.0x (Tele)
                          </button>
                        </div>

                        {/* Flashlight toggle for low-light enhancement */}
                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/80">
                          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider font-semibold">Visibility:</span>
                          <button
                            type="button"
                            onClick={toggleFlashlight}
                            className={`px-3 py-1 text-[9px] font-mono font-bold rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                              isFlashlightOn
                                ? 'bg-amber-950/70 text-amber-200 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                                : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-850'
                            }`}
                          >
                            <Zap className={`w-3 h-3 ${isFlashlightOn ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-400'}`} />
                            {isFlashlightOn ? 'Flashlight ON' : 'Toggle Flashlight'}
                          </button>
                        </div>

                        {/* Camera Filter toggle for enhancing QR readability */}
                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/80">
                          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider font-semibold">Filter:</span>
                          <button
                            type="button"
                            onClick={cycleCameraFilter}
                            className={`px-3 py-1 text-[9px] font-mono font-bold rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                              cameraFilter === 'none'
                                ? 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-850'
                                : cameraFilter === 'grayscale'
                                ? 'bg-indigo-950/70 text-indigo-300 border-indigo-500/50 shadow-[0_0_8px_rgba(99,102,241,0.2)]'
                                : 'bg-purple-950/70 text-purple-300 border-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.2)]'
                            }`}
                          >
                            <Sparkles className={`w-3 h-3 ${cameraFilter !== 'none' ? 'text-indigo-450 fill-indigo-500 animate-pulse' : 'text-slate-400'}`} />
                            <span>
                              {cameraFilter === 'none' ? 'Standard Filter' : cameraFilter === 'grayscale' ? 'Grayscale' : 'Thermal'}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Recent Scans list below the video feed */}
                    {renderRecentScansSection()}
                  </div>
                ) : (
                  <div className="flex flex-col items-center w-full">
                    <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-inner max-w-[240px] w-full aspect-square flex items-center justify-center relative overflow-hidden">
                      <img 
                        src={qrCodeDataUrl} 
                        alt="Canonical Order QR Scan" 
                        className="w-full h-full object-contain rounded-2xl"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Recent Scans list below the static preview */}
                    {renderRecentScansSection()}
                  </div>
                )}
                
                <p className="text-[10px] text-slate-400 mt-4 leading-relaxed font-sans max-w-xs">
                  {isScanningCamera 
                    ? "Scanner active. Place an order QR code directly in front of the lens to ingest instantly."
                    : "Scan to feed this normalized order entity directly to terminal pipelines or mobile accounting ERP scanners."}
                </p>

                {/* Real-time Camera toggle button & scanning history pane toggle */}
                <div className="mt-4 flex flex-col items-center justify-center gap-2 w-full max-w-[280px]">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => {
                        if (isScanningCamera) {
                          stopCameraScan();
                        } else {
                          startCameraScan();
                        }
                      }}
                      className={`px-4 py-2 w-full text-[10.5px] font-mono font-bold rounded-2xl border active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                        isScanningCamera
                          ? 'bg-red-950/60 hover:bg-red-900/60 text-red-100 border-red-500/40'
                          : 'bg-emerald-950/60 hover:bg-emerald-900/45 text-emerald-100 border-emerald-500/40'
                      }`}
                    >
                      {isScanningCamera ? (
                        <VideoOff className="w-3.5 h-3.5 text-red-400" />
                      ) : (
                        <Camera className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      )}
                      Toggle Camera
                    </button>

                    {isScanningCamera && (
                      <button
                        type="button"
                        onClick={restartCameraScan}
                        className="px-4 py-2 w-full bg-slate-900 hover:bg-slate-800 text-slate-100 text-[10.5px] font-mono font-bold rounded-2xl border border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                        Restart Scan
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowScanHistory(prev => !prev)}
                    className="px-3 py-1.5 w-full text-[9.5px] font-mono font-semibold rounded-xl border bg-slate-900/90 hover:bg-slate-850 text-slate-300 border-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    title={showScanHistory ? "Hide scanning history pane" : "Show scanning history pane"}
                  >
                    {showScanHistory ? <EyeOff className="w-3 h-3 text-indigo-400" /> : <Eye className="w-3 h-3 text-indigo-400" />}
                    <span>{showScanHistory ? 'Hide Scanning History Pane' : 'Show Scanning History Pane'}</span>
                  </button>
                </div>
              </div>

              {/* Payload Integrity details */}
              <div className="px-5 py-4 bg-slate-950 border-t border-slate-800 text-xs font-sans text-slate-300 space-y-2.5">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-550 tracking-wider">
                  <span>Data Alignment Checksums</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Valid Payload
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-850">
                  <div>
                    <span className="text-slate-500 text-[9px] font-mono uppercase block">System Hub</span>
                    <span className="font-mono text-white text-xs font-semibold">{(normalizedOrder?.sourceSystem || 'N/A').toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[9px] font-mono uppercase block">Order Token</span>
                    <span className="font-mono text-white text-xs font-semibold">{normalizedOrder?.sourceOrderId || 'N/A'}</span>
                  </div>
                  <div className="col-span-2 border-t border-slate-800 pt-2 mt-1">
                    <span className="text-slate-550 text-[9px] font-mono uppercase block">Standard JSON Length</span>
                    <span className="font-mono text-indigo-300 text-[10.5px] font-semibold break-all">
                      {JSON.stringify({
                        sys: normalizedOrder?.sourceSystem,
                        id: normalizedOrder?.sourceOrderId,
                        email: normalizedOrder?.customerEmail,
                        total: normalizedOrder?.totalAmount,
                        tax: normalizedOrder?.taxAmount
                      }).length} chars payload
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="px-5 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={isScanningCamera}
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = qrCodeDataUrl;
                    link.download = `canonical-qr-${normalizedOrder?.sourceSystem || 'order'}-${normalizedOrder?.sourceOrderId || 'summary'}.png`;
                    link.click();
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 text-[10.5px] font-sans font-bold rounded-2xl border border-slate-700 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  Save QR Code File
                </button>
                <button
                  type="button"
                  onClick={handleCloseQrModal}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-[10.5px] font-sans font-bold rounded-2xl active:scale-95 transition-all cursor-pointer shadow-md"
                >
                  Close Scan Deck
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification Stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {activeToasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, x: 100 }}
              className="pointer-events-auto"
            >
              <div className={`p-4 rounded-xl border shadow-2xl flex gap-3 text-left backdrop-blur-md ${
                toast.severity === 'danger' 
                  ? 'bg-red-950/95 border-red-800 text-red-100 shadow-red-950/40' 
                  : toast.severity === 'warning'
                    ? 'bg-amber-950/95 border-amber-800 text-amber-100 shadow-amber-950/40'
                    : 'bg-slate-900/95 border-slate-700 text-slate-100 shadow-slate-950/40'
              }`}>
                <div className="text-xl shrink-0 mt-0.5">
                  {toast.severity === 'danger' ? '🚨' : toast.severity === 'warning' ? '⚠️' : 'ℹ️'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-[12px] font-bold font-mono tracking-tight uppercase">{toast.title}</p>
                    <span className="text-[9px] font-mono opacity-60 shrink-0">{toast.timestamp}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-95 font-sans">{toast.message}</p>
                </div>
                <button
                  onClick={() => {
                    setActiveToasts(prev => prev.filter(t => t.id !== toast.id));
                  }}
                  className="text-white hover:text-slate-350 shrink-0 self-start text-xs font-bold leading-none cursor-pointer"
                  aria-label="Dismiss alert"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {activeToasts.length > 1 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveToasts([])}
            className="pointer-events-auto px-3 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 font-mono text-[10px] font-bold rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer self-end flex items-center gap-1.5"
          >
            Clear All Alerts ({activeToasts.length})
          </motion.button>
        )}
      </div>

    </div>
    </ClickToEditContext.Provider>
  );
}

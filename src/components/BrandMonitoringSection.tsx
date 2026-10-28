import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Cpu, 
  TrendingUp, 
  RefreshCw, 
  Play, 
  Check, 
  X,
  FileText,
  AlertTriangle,
  Search,
  Camera,
  Send,
  MapPin,
  Sliders,
  Plus,
  Download,
  ExternalLink,
  MessageSquare,
  Activity,
  Eye,
  Clock,
  ChevronRight,
  Filter,
  Sparkles,
  Radio,
  Layers,
  Zap,
  BarChart3,
  Flame,
  ShieldAlert,
  FileCheck,
  Shield,
  Trash2,
  CheckCircle,
  Copy,
  Hash,
  Mail,
  Bell,
  Inbox,
  Settings,
  Share2
} from 'lucide-react';

interface Reseller {
  id: string;
  name: string;
  domain: string;
  status: 'Authorized' | 'Pending' | 'Revoked';
  rateLimit: number;
  ordersCount: number;
  lastActive: string;
}

interface MonitoredSku {
  id: string;
  sku: string;
  title: string;
  targetMap: number;
  msrp: number;
  category: string;
  activeChannels: string[];
  complianceRate: number;
  activeViolations: number;
  lastScanned: string;
}

interface MapViolation {
  id: string;
  incidentRef: string;
  sku: string;
  productTitle: string;
  platform: 'Amazon US' | 'Walmart Marketplace' | 'eBay' | 'TikTok Shop' | 'Mercari' | 'Target Plus';
  sellerName: string;
  sellerRating: string;
  listedPrice: number;
  targetMap: number;
  discountDelta: number;
  url: string;
  region: 'US-Southwest' | 'US-WestCoast' | 'US-Northeast' | 'US-Midwest' | 'US-Southeast' | 'Global-EU' | 'Global-UK' | 'Global-APAC';
  status: 'Evidence_Captured' | 'CD_Dispatched' | 'In_Grace_Period' | 'Delisted_Cured' | 'Escalated_Legal';
  timestamp: string;
  evidenceHash: string;
  cureHoursRemaining: number;
  noticeTrackingId?: string;
  screenshotUrl?: string;
}

interface EmailAlertNotification {
  id: string;
  recipientEmail: string;
  subject: string;
  violationId: string;
  incidentRef: string;
  sku: string;
  productTitle: string;
  platform: string;
  sellerName: string;
  listedPrice: number;
  targetMap: number;
  discountDelta: number;
  discountPct: number;
  sentAt: string;
  status: 'Delivered' | 'Pending' | 'Opened';
  evidenceHash: string;
  screenshotUrl?: string;
  cdDraftUrl: string;
}

interface ApiFeedConfig {
  id: string;
  name: string;
  category: 'Marketplace Scraper' | 'Social Intelligence' | 'News & Media' | 'Review Platforms' | 'Legal Notice Courier';
  provider: string;
  endpoint: string;
  frequency: string;
  status: 'connected' | 'idle' | 'testing';
  latencyMs: number;
  description: string;
  payloadType: string;
}

interface BrandMonitoringSectionProps {
  sentimentScore: number;
  totalMonitoredItems: number;
  isScanningReputation: boolean;
  reputationLogs: string[];
  resellers: Reseller[];
  onTriggerReputationScan: () => void;
  onPostMessage?: (text: string, type: 'success' | 'err') => void;
}

export default function BrandMonitoringSection({
  sentimentScore,
  totalMonitoredItems,
  isScanningReputation,
  reputationLogs,
  resellers,
  onTriggerReputationScan,
  onPostMessage
}: BrandMonitoringSectionProps) {
  // Navigation Sub-Tabs: 'map_scanner' | 'violations_cd' | 'heatmap' | 'sentiment_bot' | 'api_feeds'
  const [activeTab, setActiveTab] = useState<'map_scanner' | 'violations_cd' | 'heatmap' | 'sentiment_bot' | 'api_feeds'>('map_scanner');

  // ──────────────────────────────────────────────────────────
  // 1. Monitored SKUs State
  // ──────────────────────────────────────────────────────────
  const [monitoredSkus, setMonitoredSkus] = useState<MonitoredSku[]>([
    {
      id: 'sku-1',
      sku: 'VNTG-TEE-BLK',
      title: 'CloudboyX Vintage Washed Black Heavyweight Tee',
      targetMap: 35.00,
      msrp: 48.00,
      category: 'Apparel / Tops',
      activeChannels: ['Amazon US', 'Walmart', 'eBay', 'TikTok Shop'],
      complianceRate: 94.2,
      activeViolations: 1,
      lastScanned: '2 mins ago'
    },
    {
      id: 'sku-2',
      sku: 'LMC-HOODIE-GRY',
      title: 'Linear Motion Club 460GSM French Terry Hoodie',
      targetMap: 85.00,
      msrp: 110.00,
      category: 'Apparel / Outerwear',
      activeChannels: ['Amazon US', 'TikTok Shop', 'Mercari', 'Target Plus'],
      complianceRate: 88.0,
      activeViolations: 1,
      lastScanned: '5 mins ago'
    },
    {
      id: 'sku-3',
      sku: 'CBX-DENIM-01',
      title: 'Selvedge Raw Rigid 14oz Carpenter Denim',
      targetMap: 120.00,
      msrp: 155.00,
      category: 'Apparel / Bottoms',
      activeChannels: ['Amazon US', 'Walmart', 'eBay'],
      complianceRate: 100.0,
      activeViolations: 0,
      lastScanned: '12 mins ago'
    },
    {
      id: 'sku-4',
      sku: 'AERO-RUNNER-V2',
      title: 'AeroLite Mesh Carbon-Plated Runner',
      targetMap: 160.00,
      msrp: 195.00,
      category: 'Footwear',
      activeChannels: ['Amazon US', 'Walmart', 'eBay', 'TikTok Shop', 'Mercari'],
      complianceRate: 100.0,
      activeViolations: 0,
      lastScanned: '18 mins ago'
    }
  ]);

  // Batch SKU Modal state
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);
  const [batchRawInput, setBatchRawInput] = useState<string>(
    `CBX-CAP-BLK, CloudboyX Structured 6-Panel Dad Hat, 28.00, 38.00\nCBX-TOTE-NAT, Raw Canvas Heavyweight Oversized Tote, 32.00, 44.00`
  );
  const [isBatchScanning, setIsBatchScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(100);

  // ──────────────────────────────────────────────────────────
  // 2. MAP Violations & Cease & Desist (C&D) State
  // ──────────────────────────────────────────────────────────
  const [violations, setViolations] = useState<MapViolation[]>([
    {
      id: 'vio-1',
      incidentRef: 'CD-2026-MAP-0842',
      sku: 'VNTG-TEE-BLK',
      productTitle: 'CloudboyX Vintage Washed Black Heavyweight Tee',
      platform: 'Amazon US',
      sellerName: 'Apex Deals LLC (Rogue Reseller ID #98421)',
      sellerRating: '3.8 ★ (1,420 ratings)',
      listedPrice: 26.99,
      targetMap: 35.00,
      discountDelta: -8.01,
      url: 'https://amazon.com/dp/B09XYZ8871/ref=apex_deals_under_map',
      region: 'US-Southwest',
      status: 'In_Grace_Period',
      timestamp: 'Today at 02:14 PM',
      evidenceHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      cureHoursRemaining: 19,
      noticeTrackingId: 'TRK-CD-9941-US',
      screenshotUrl: '/public/assets/aistudio/Screenshot_2026-10-28_4.13.31_PM_6dcb4b66.png'
    },
    {
      id: 'vio-2',
      incidentRef: 'CD-2026-MAP-0843',
      sku: 'LMC-HOODIE-GRY',
      productTitle: 'Linear Motion Club 460GSM French Terry Hoodie',
      platform: 'TikTok Shop',
      sellerName: 'QuickDrop Warehousing (Store #88410)',
      sellerRating: '4.1 ★ (320 ratings)',
      listedPrice: 69.50,
      targetMap: 85.00,
      discountDelta: -15.50,
      url: 'https://tiktok.com/view/product/884102919920?undercut=1',
      region: 'US-WestCoast',
      status: 'Evidence_Captured',
      timestamp: 'Today at 03:02 PM',
      evidenceHash: 'c7b508f7f21f52d0a4c28f35de984e12ff48fa64ef0c2e987488ec9be26588b4',
      cureHoursRemaining: 24
    }
  ]);

  // Selected violation for detailed modal inspection (Screenshot + C&D Notice)
  const [selectedViolation, setSelectedViolation] = useState<MapViolation | null>(null);
  const [isTransmittingCD, setIsTransmittingCD] = useState<boolean>(false);
  const [copiedTracking, setCopiedTracking] = useState<boolean>(false);

  // ──────────────────────────────────────────────────────────
  // 2B. Automated Email Notification System State
  // ──────────────────────────────────────────────────────────
  const [alertRecipients, setAlertRecipients] = useState<string[]>([
    'gocloudboy2@gmail.com',
    'legal-counsel@cloudboyx.internal'
  ]);
  const [newRecipientInput, setNewRecipientInput] = useState<string>('');
  const [isEmailAlertsActive, setIsEmailAlertsActive] = useState<boolean>(true);
  const [alertCadence, setAlertCadence] = useState<'instant' | 'hourly' | 'daily'>('instant');
  const [showEmailAlertsModal, setShowEmailAlertsModal] = useState<boolean>(false);
  const [emailModalTab, setEmailModalTab] = useState<'preview' | 'settings'>('preview');
  const [selectedEmailAlert, setSelectedEmailAlert] = useState<EmailAlertNotification | null>(null);

  const [emailHistory, setEmailHistory] = useState<EmailAlertNotification[]>([
    {
      id: 'email-alert-1',
      recipientEmail: 'gocloudboy2@gmail.com',
      subject: '🚨 [CRITICAL MAP BREACH] Apex Deals LLC selling VNTG-TEE-BLK at $26.99 on Amazon US ($35.00 MAP Floor)',
      violationId: 'vio-1',
      incidentRef: 'CD-2026-MAP-0842',
      sku: 'VNTG-TEE-BLK',
      productTitle: 'CloudboyX Vintage Washed Black Heavyweight Tee',
      platform: 'Amazon US',
      sellerName: 'Apex Deals LLC (Rogue Reseller ID #98421)',
      listedPrice: 26.99,
      targetMap: 35.00,
      discountDelta: -8.01,
      discountPct: 23,
      sentAt: 'Today at 02:14 PM UTC',
      status: 'Delivered',
      evidenceHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      screenshotUrl: '/public/assets/aistudio/Screenshot_2026-10-28_4.13.31_PM_6dcb4b66.png',
      cdDraftUrl: 'https://suite.cloudboyx.internal/enforcement/cease-desist?ref=CD-2026-MAP-0842'
    },
    {
      id: 'email-alert-2',
      recipientEmail: 'gocloudboy2@gmail.com',
      subject: '⚠️ [MAP VIOLATION DETECTED] QuickDrop Warehousing breach on TikTok Shop for LMC-HOODIE-GRY ($69.50 vs $85.00 MAP)',
      violationId: 'vio-2',
      incidentRef: 'CD-2026-MAP-0843',
      sku: 'LMC-HOODIE-GRY',
      productTitle: 'Linear Motion Club 460GSM French Terry Hoodie',
      platform: 'TikTok Shop',
      sellerName: 'QuickDrop Warehousing (Store #88410)',
      listedPrice: 69.50,
      targetMap: 85.00,
      discountDelta: -15.50,
      discountPct: 18,
      sentAt: 'Today at 03:02 PM UTC',
      status: 'Delivered',
      evidenceHash: 'c7b508f7f21f52d0a4c28f35de984e12ff48fa64ef0c2e987488ec9be26588b4',
      cdDraftUrl: 'https://suite.cloudboyx.internal/enforcement/cease-desist?ref=CD-2026-MAP-0843'
    }
  ]);

  const handleSimulateNewViolationAndEmail = () => {
    const newIncidentRef = `CD-2026-MAP-084${violations.length + 2}`;
    const newVioId = `vio-${Date.now()}`;
    const newViolation: MapViolation = {
      id: newVioId,
      incidentRef: newIncidentRef,
      sku: 'AERO-RUNNER-V2',
      productTitle: 'AeroLite Mesh Carbon-Plated Runner',
      platform: 'Walmart Marketplace',
      sellerName: 'Apex Discount Depot (Seller #49281)',
      sellerRating: '3.6 ★ (840 ratings)',
      listedPrice: 129.00,
      targetMap: 160.00,
      discountDelta: -31.00,
      url: 'https://walmart.com/ip/AeroLite-Runner/99281048?seller=apex_discount',
      region: 'US-Midwest',
      status: 'Evidence_Captured',
      timestamp: 'Just now',
      evidenceHash: 'f4b238910a8c48921df089e924a1b8c49e2908f7734182a98f123490ae1298c4',
      cureHoursRemaining: 24,
      screenshotUrl: '/public/assets/aistudio/Screenshot_2026-10-28_4.13.31_PM_6dcb4b66.png'
    };

    const newEmail: EmailAlertNotification = {
      id: `email-${Date.now()}`,
      recipientEmail: alertRecipients[0] || 'gocloudboy2@gmail.com',
      subject: `🚨 [CRITICAL MAP BREACH] Apex Discount Depot selling AERO-RUNNER-V2 at $129.00 on Walmart Marketplace ($160.00 MAP Floor)`,
      violationId: newVioId,
      incidentRef: newIncidentRef,
      sku: 'AERO-RUNNER-V2',
      productTitle: 'AeroLite Mesh Carbon-Plated Runner',
      platform: 'Walmart Marketplace',
      sellerName: 'Apex Discount Depot (Seller #49281)',
      listedPrice: 129.00,
      targetMap: 160.00,
      discountDelta: -31.00,
      discountPct: 19,
      sentAt: 'Just now',
      status: 'Delivered',
      evidenceHash: 'f4b238910a8c48921df089e924a1b8c49e2908f7734182a98f123490ae1298c4',
      screenshotUrl: '/public/assets/aistudio/Screenshot_2026-10-28_4.13.31_PM_6dcb4b66.png',
      cdDraftUrl: `https://suite.cloudboyx.internal/enforcement/cease-desist?ref=${newIncidentRef}`
    };

    setViolations(prev => [newViolation, ...prev]);
    setEmailHistory(prev => [newEmail, ...prev]);
    setSelectedEmailAlert(newEmail);
    setShowEmailAlertsModal(true);
    setEmailModalTab('preview');

    if (onPostMessage) {
      onPostMessage(`🔔 Brand Sentinel Bot detected MAP violation! Automated alert email dispatched to ${alertRecipients[0]} with direct Cease & Desist link.`, 'success');
    }
  };

  const handleAddRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipientInput || !newRecipientInput.includes('@')) return;
    if (!alertRecipients.includes(newRecipientInput.trim())) {
      setAlertRecipients(prev => [...prev, newRecipientInput.trim()]);
    }
    setNewRecipientInput('');
    if (onPostMessage) {
      onPostMessage(`✅ Added ${newRecipientInput.trim()} to automated MAP alert dispatch list.`, 'success');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    if (alertRecipients.length <= 1) {
      if (onPostMessage) onPostMessage(`⚠️ You must maintain at least one recipient email address.`, 'err');
      return;
    }
    setAlertRecipients(prev => prev.filter(r => r !== email));
  };

  // ──────────────────────────────────────────────────────────
  // 3. Regional Heatmap State
  // ──────────────────────────────────────────────────────────
  const [heatmapScope, setHeatmapScope] = useState<'us' | 'global'>('us');
  const [selectedRegionKey, setSelectedRegionKey] = useState<string>('US-Southwest');

  const usRegions = [
    {
      key: 'US-Southwest',
      name: 'Southwest (Texas, Arizona, Nevada)',
      violations: 1,
      complianceRate: 88.4,
      avgUndercutPct: -22.9,
      sellersMonitored: 42,
      intensity: 'high', // high | med | low
      flaggedSellers: ['Apex Deals LLC (Amazon US)']
    },
    {
      key: 'US-WestCoast',
      name: 'West Coast (California, Oregon, Washington)',
      violations: 1,
      complianceRate: 94.6,
      avgUndercutPct: -18.2,
      sellersMonitored: 68,
      intensity: 'med',
      flaggedSellers: ['QuickDrop Warehousing (TikTok Shop)']
    },
    {
      key: 'US-Northeast',
      name: 'Northeast / Tri-State (New York, NJ, Mass)',
      violations: 0,
      complianceRate: 98.2,
      avgUndercutPct: 0.0,
      sellersMonitored: 54,
      intensity: 'low',
      flaggedSellers: []
    },
    {
      key: 'US-Midwest',
      name: 'Midwest (Illinois, Ohio, Michigan)',
      violations: 0,
      complianceRate: 100.0,
      avgUndercutPct: 0.0,
      sellersMonitored: 38,
      intensity: 'low',
      flaggedSellers: []
    },
    {
      key: 'US-Southeast',
      name: 'Southeast (Florida, Georgia, Carolinas)',
      violations: 0,
      complianceRate: 100.0,
      avgUndercutPct: 0.0,
      sellersMonitored: 46,
      intensity: 'low',
      flaggedSellers: []
    }
  ];

  const globalRegions = [
    {
      key: 'Global-UK',
      name: 'United Kingdom (London Distribution Node)',
      violations: 0,
      complianceRate: 99.8,
      avgUndercutPct: 0.0,
      sellersMonitored: 28,
      intensity: 'low',
      flaggedSellers: []
    },
    {
      key: 'Global-EU',
      name: 'Central Europe (Frankfurt / Berlin Node)',
      violations: 0,
      complianceRate: 100.0,
      avgUndercutPct: 0.0,
      sellersMonitored: 34,
      intensity: 'low',
      flaggedSellers: []
    },
    {
      key: 'Global-APAC',
      name: 'East Asia (Tokyo / Singapore Node)',
      violations: 0,
      complianceRate: 100.0,
      avgUndercutPct: 0.0,
      sellersMonitored: 22,
      intensity: 'low',
      flaggedSellers: []
    }
  ];

  // ──────────────────────────────────────────────────────────
  // 4. Sentinel AI Reputation & Trajectory Bot State
  // ──────────────────────────────────────────────────────────
  const [botIsThinking, setBotIsThinking] = useState<boolean>(false);
  const [activeBotTab, setActiveBotTab] = useState<'overview' | 'social' | 'news' | 'reviews'>('overview');
  const [forecastProbability, setForecastProbability] = useState<{
    standing: number;
    probabilityScore: number;
    sevenDayTarget: number;
    thirtyDayTarget: number;
    verdict: string;
    riskVector: string;
  }>({
    standing: sentimentScore,
    probabilityScore: 88,
    sevenDayTarget: 96.2,
    thirtyDayTarget: 98.0,
    verdict: 'High-Velocity Upward Brand Momentum',
    riskVector: 'Under-MAP listings on TikTok Shop & Amazon present a 62% risk of luxury pricing dilution if un-cured >24h.'
  });

  const socialStreams = [
    {
      channel: 'Reddit (r/streetwear & r/rawdenim)',
      snippet: '“The heavyweight vintage tee from CloudboyX is unreal quality. Found some random reseller listing it for $27 on Amazon, feels like an unauthorized fake?”',
      sentiment: 'Caution / Auth Concern',
      timestamp: '14 mins ago',
      score: 74
    },
    {
      channel: 'TikTok (#cloudboyx unboxing)',
      snippet: '“French terry hoodie stitch density is 10/10. Definitely worth the $85 MAP tag. Don’t buy from sketchy stores undercutting price.”',
      sentiment: 'Highly Positive',
      timestamp: '32 mins ago',
      score: 98
    },
    {
      channel: 'X / Twitter (@EnterpriseRetail)',
      snippet: '“CloudboyX platform architecture setting standard for autonomous ERP integration and brand pricing governance in 2026.”',
      sentiment: 'Executive Positive',
      timestamp: '1 hour ago',
      score: 96
    }
  ];

  const newsStreams = [
    {
      outlet: 'Bloomberg Commerce & Logistics',
      headline: 'Autonomous Commerce Ingress Systems Reduce Margin Leakage Across Multi-Channel Resellers',
      date: 'Today, 08:30 AM',
      relevance: 'Direct Market Validation'
    },
    {
      outlet: 'RetailDive Editorial',
      headline: 'Why Luxury & Premium Direct-to-Consumer Brands are Weaponizing Instant MAP Cease & Desist Scrapers',
      date: 'Yesterday',
      relevance: 'Brand Protection Benchmark'
    }
  ];

  const reviewFeeds = [
    {
      source: 'Trustpilot Enterprise Verified',
      rating: 4.8,
      reviewsCount: 1420,
      summary: '94% of verified buyers cite uncompromising material quality and authentic packaging standards.'
    },
    {
      source: 'Google Merchant Authority',
      rating: 4.9,
      reviewsCount: 890,
      summary: 'Zero counterfeit authenticity claims reported across authorized retail store partners.'
    }
  ];

  // ──────────────────────────────────────────────────────────
  // 5. Suggested API Feeds State
  // ──────────────────────────────────────────────────────────
  const [apiFeeds, setApiFeeds] = useState<ApiFeedConfig[]>([
    {
      id: 'feed-rainforest',
      name: 'Amazon Rainforest SP-API Gateway',
      category: 'Marketplace Scraper',
      provider: 'Rainforest API (rainforestapi.com)',
      endpoint: 'https://api.rainforestapi.com/request?api_key=LIVE_SEC_***&type=deals',
      frequency: 'Every 5 mins',
      status: 'connected',
      latencyMs: 38,
      description: 'Pulls real-time Buy Box winning seller identities, pricing offers, and listing ASIN screenshots from Amazon US, UK, and JP.',
      payloadType: 'application/json'
    },
    {
      id: 'feed-brightdata',
      name: 'Bright Data E-Commerce Headless Scraper',
      category: 'Marketplace Scraper',
      provider: 'Bright Data (brightdata.com/scraping)',
      endpoint: 'https://api.brightdata.com/dca/trigger?collector=c_walmart_tiktok_map',
      frequency: 'Every 15 mins',
      status: 'connected',
      latencyMs: 82,
      description: 'Rotates residential proxies to bypass bot filters on Walmart, TikTok Shop, Target, eBay, and Mercari to photograph listing prices.',
      payloadType: 'application/json'
    },
    {
      id: 'feed-brandwatch',
      name: 'Brandwatch Consumer Intelligence API',
      category: 'Social Intelligence',
      provider: 'Brandwatch (brandwatch.com/developers)',
      endpoint: 'https://api.brandwatch.com/projects/7721/data/mentions',
      frequency: 'Live Webhook Stream',
      status: 'connected',
      latencyMs: 44,
      description: 'Streams social sentiment, brand mentions, negative sentiment triggers, and counterfeit warnings across Reddit, TikTok, and X.',
      payloadType: 'application/json'
    },
    {
      id: 'feed-newsapi',
      name: 'NewsAPI.org & Media RSS Harvester',
      category: 'News & Media',
      provider: 'NewsAPI (newsapi.org/v2)',
      endpoint: 'https://newsapi.org/v2/everything?q=cloudboyx+retail',
      frequency: 'Every 30 mins',
      status: 'connected',
      latencyMs: 51,
      description: 'Aggregates global editorial publications, industry press wires, and distributor trade articles for corporate reputation scoring.',
      payloadType: 'application/json'
    },
    {
      id: 'feed-trustpilot',
      name: 'Trustpilot Business API Webhook',
      category: 'Review Platforms',
      provider: 'Trustpilot Business (developers.trustpilot.com)',
      endpoint: 'https://api.trustpilot.com/v1/business-units/482910/reviews',
      frequency: 'Real-time Event Stream',
      status: 'connected',
      latencyMs: 31,
      description: 'Pulls 100% verified customer review text, Net Promoter Score (NPS), and flagged product dissatisfaction issues directly into Sentinel.',
      payloadType: 'application/json'
    },
    {
      id: 'feed-lob-legal',
      name: 'Lob & SendGrid Legal Courier Dispatch API',
      category: 'Legal Notice Courier',
      provider: 'Lob & SendGrid (lob.com / sendgrid.com)',
      endpoint: 'https://api.lob.com/v1/letters?tracking=certified_mail',
      frequency: 'On-Demand Trigger',
      status: 'connected',
      latencyMs: 95,
      description: 'Transmits legally recognized Cease and Desist notices via certified tracked email and physical certified postal mail with delivery confirmation.',
      payloadType: 'application/json'
    }
  ]);

  // Handler: Add Batch SKUs
  const handleProcessBatchSkus = () => {
    setIsBatchScanning(true);
    setScanProgress(15);
    
    // Parse raw text
    const lines = batchRawInput.split('\n').filter(l => l.trim().length > 0);
    const newItems: MonitoredSku[] = lines.map((line, idx) => {
      const parts = line.split(',').map(p => p.trim());
      const sku = parts[0] || `SKU-${Date.now()}-${idx}`;
      const title = parts[1] || `CloudboyX Product SKU ${sku}`;
      const targetMap = parseFloat(parts[2]) || 40.00;
      const msrp = parseFloat(parts[3]) || targetMap * 1.35;

      return {
        id: `batch-${Date.now()}-${idx}`,
        sku,
        title,
        targetMap,
        msrp,
        category: 'Apparel / Accessories',
        activeChannels: ['Amazon US', 'Walmart', 'TikTok Shop'],
        complianceRate: 100.0,
        activeViolations: 0,
        lastScanned: 'Just now'
      };
    });

    setTimeout(() => setScanProgress(50), 400);
    setTimeout(() => setScanProgress(85), 800);
    setTimeout(() => {
      setScanProgress(100);
      setIsBatchScanning(false);
      setShowBatchModal(false);
      setMonitoredSkus(prev => [...newItems, ...prev]);
      if (onPostMessage) {
        onPostMessage(`✅ Successfully integrated ${newItems.length} new batch SKUs into the automated MAP crawler suite!`, 'success');
      }
    }, 1200);
  };

  // Handler: Transmit C&D Notice
  const handleTransmitCeaseAndDesist = (violation: MapViolation) => {
    setIsTransmittingCD(true);
    setTimeout(() => {
      setIsTransmittingCD(false);
      setViolations(prev => prev.map(v => {
        if (v.id === violation.id) {
          return {
            ...v,
            status: 'CD_Dispatched',
            noticeTrackingId: `TRK-CD-${Math.floor(1000 + Math.random() * 9000)}-US`,
            cureHoursRemaining: 24
          };
        }
        return v;
      }));

      if (onPostMessage) {
        onPostMessage(`📜 Formal Cease & Desist Warning transmitted to ${violation.sellerName} via Certified Marketplace Courier API. 24h grace period activated!`, 'success');
      }
    }, 900);
  };

  // Handler: Test Feed Connection Ping
  const handleTestFeed = (feedId: string) => {
    setApiFeeds(prev => prev.map(f => f.id === feedId ? { ...f, status: 'testing' } : f));
    setTimeout(() => {
      const randomLatency = Math.floor(25 + Math.random() * 60);
      setApiFeeds(prev => prev.map(f => f.id === feedId ? { ...f, status: 'connected', latencyMs: randomLatency } : f));
      if (onPostMessage) {
        onPostMessage(`📡 Feed connection verified: HTTP 200 OK (${randomLatency}ms response)`, 'success');
      }
    }, 800);
  };

  // Handler: Re-run Bot Forecast
  const handleRunBotAnalysis = () => {
    setBotIsThinking(true);
    setTimeout(() => {
      setBotIsThinking(false);
      const newScore = Number((93.5 + Math.random() * 3.5).toFixed(1));
      setForecastProbability({
        standing: newScore,
        probabilityScore: 92,
        sevenDayTarget: Number((newScore + 1.8).toFixed(1)),
        thirtyDayTarget: Number((newScore + 3.4).toFixed(1)),
        verdict: 'Accelerated Premium Market Recognition',
        riskVector: 'Zero critical brand integrity vulnerabilities. Active C&D enforcement maintaining 98.4% channel parity.'
      });
      if (onPostMessage) {
        onPostMessage(`🤖 Sentinel AI updated brand standing to ${newScore}% with 92% forward upward trajectory probability!`, 'success');
      }
    }, 1000);
  };

  return (
    <motion.div
      key="brand_reputation_major_suite"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 text-left font-sans"
    >
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. MAJOR SUITE MASTER BANNER & HIGH VELOCITY TELEMETRY     */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-[#071328] to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 p-4 opacity-5 select-none pointer-events-none font-mono text-9xl">MAP•SHIELD</div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>MAJOR SUITE: BRAND REPUTATION & MAP DEFENSE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Autonomous MAP Enforcement & Brand Sentinel AI Suite
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Continuous multi-channel price crawling across Amazon, Walmart, and TikTok Shop. When rogue sellers breach your MAP floor, scrapers capture evidentiary snapshots, auto-generate binding Cease & Desist notices, and transmit certified cure warnings.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setShowEmailAlertsModal(true);
                setEmailModalTab('preview');
                if (emailHistory.length > 0) {
                  setSelectedEmailAlert(emailHistory[0]);
                }
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-emerald-200" />
              <span>Email Alerts ({emailHistory.length})</span>
            </button>

            <button
              onClick={() => setShowBatchModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Batch SKUs</span>
            </button>

            <button
              onClick={onTriggerReputationScan}
              disabled={isScanningReputation}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 font-mono font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScanningReputation ? 'animate-spin text-indigo-400' : ''}`} />
              <span>{isScanningReputation ? 'Sweeping Channels...' : 'Live Rescan All'}</span>
            </button>
          </div>
        </div>

        {/* High Velocity KPI Strip */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>BRAND SENTIMENT INDEX</span>
              <span className="text-emerald-400 font-bold">▲ 94.2%</span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-white">{forecastProbability.standing}%</div>
            <p className="text-[10px] text-slate-400 mt-1">Aggregated across Reddit, X, news & Trustpilot.</p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>MAP COMPLIANCE RATE</span>
              <span className="text-amber-400 font-bold">2 Under C&D</span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-white">96.8%</div>
            <p className="text-[10px] text-slate-400 mt-1">62 of 64 checked reseller nodes fully compliant.</p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>ACTIVE SKUS MONITORED</span>
              <span className="text-cyan-400 font-bold">4 Major</span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-white">{monitoredSkus.length} SKUs</div>
            <p className="text-[10px] text-slate-400 mt-1">1,280 touchpoints scanned every 5 minutes.</p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>SENTINEL AI PROBABILITY</span>
              <span className="text-indigo-400 font-bold">88% Upward</span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-emerald-400">+{forecastProbability.sevenDayTarget}% 7d</div>
            <p className="text-[10px] text-slate-400 mt-1">Projected sentiment expansion vector.</p>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. SUITE SUB-TABS NAVIGATION BAR                          */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('map_scanner')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'map_scanner'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>01. Batch SKU MAP Scanner</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('violations_cd')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'violations_cd'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>02. Evidence & C&D Tracker</span>
            {violations.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white text-rose-700">
                {violations.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('heatmap')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'heatmap'
                ? 'bg-[#0077b6] text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>03. Regional Violation Heatmap</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sentiment_bot')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'sentiment_bot'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>04. Sentinel AI Reputation Bot</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('api_feeds')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'api_feeds'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>05. Suggested API Feeds</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Continuous Polling Active</span>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. TAB 1: BATCH SKU MAP SCANNER & MARKETPLACE DISCOVERY    */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'map_scanner' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-500" />
                  <span>Batch SKU Minimum Advertised Price (MAP) Catalog</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure wholesale price floors for individual or batch product SKUs. The automated web-crawler sweeps partner networks every 300 seconds.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBatchModal(true)}
                  className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs font-mono font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Import Batch SKUs (CSV)</span>
                </button>
              </div>
            </div>

            {/* Monitored SKUs Grid / Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-xs font-sans">
                <thead>
                  <tr className="text-left font-mono text-[10px] text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                    <th className="py-3 px-3">SKU Code</th>
                    <th className="py-3 px-3">Product Name</th>
                    <th className="py-3 px-3">Target MAP Floor</th>
                    <th className="py-3 px-3">MSRP</th>
                    <th className="py-3 px-3">Crawled Marketplaces</th>
                    <th className="py-3 px-3">Compliance</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {monitoredSkus.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {item.sku}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-800 dark:text-slate-200 max-w-[220px] truncate">
                        {item.title}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-extrabold text-slate-900 dark:text-white">
                        ${item.targetMap.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-400 line-through">
                        ${item.msrp.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {item.activeChannels.map((ch, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {ch}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold">
                        <span className={item.complianceRate === 100 ? 'text-emerald-500' : 'text-amber-500'}>
                          {item.complianceRate}%
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        {item.activeViolations > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            {item.activeViolations} Violation
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <Check className="w-3 h-3" />
                            Clean
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {item.activeViolations > 0 ? (
                          <button
                            onClick={() => {
                              const v = violations.find(v => v.sku === item.sku);
                              if (v) {
                                setSelectedViolation(v);
                                setActiveTab('violations_cd');
                              }
                            }}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-mono font-bold transition-all shadow-xs cursor-pointer"
                          >
                            Inspect C&D
                          </button>
                        ) : (
                          <button
                            onClick={() => onTriggerReputationScan()}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer"
                          >
                            Rescan
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-time Listing Price Discovery Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-500" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Active Discovery Telemetry</h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  ALL CHANNELS SYNCHRONIZED
                </span>
              </div>

              <div className="space-y-3 mt-4">
                {violations.map((vio) => (
                  <div key={vio.id} className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-mono font-extrabold text-[9px] uppercase">
                          MAP Breach
                        </span>
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{vio.sellerName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({vio.platform})</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                        {vio.sku} · Found at <span className="font-mono font-extrabold text-rose-600 dark:text-rose-400">${vio.listedPrice.toFixed(2)}</span> (MAP floor: ${vio.targetMap.toFixed(2)})
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedViolation(vio);
                        setActiveTab('violations_cd');
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-mono font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>View Scraper Proof & C&D</span>
                    </button>
                  </div>
                ))}

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Tokyo Wholesale Reseller (Tokyo Hub)</span>
                    <span className="text-slate-400 text-[10px]">· CBX-DENIM-01</span>
                  </div>
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    $120.00 USD (100% Compliant)
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">London Distributor Node (UK Prime)</span>
                    <span className="text-slate-400 text-[10px]">· AERO-RUNNER-V2</span>
                  </div>
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    $160.00 USD (100% Compliant)
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Live Sentinel Daemon Logs */}
            <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-3xl p-6 text-white flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px] font-mono">
                  <span className="text-indigo-400 font-bold uppercase tracking-wider">CRAWLER SENTINEL DAEMON</span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    RUNNING
                  </span>
                </div>
                <div className="mt-3 space-y-2 h-[200px] overflow-y-auto font-mono text-[10px] text-slate-300 scrollbar-thin">
                  {reputationLogs.map((log, idx) => (
                    <div key={idx} className="border-l-2 border-indigo-500/40 pl-2 leading-relaxed">
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Proxy Pool: 2,400 Residential IPs</span>
                <span>Bypass Rate: 99.98%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. TAB 2: VIOLATION EVIDENCE, SCREENSHOTS & C&D DISPATCH   */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'violations_cd' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 mb-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>LEGAL EVIDENCE & AUTOMATED C&D DISPATCH</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Cease & Desist Warning Notice Tracking System
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  When a MAP breach occurs, scrapers take a snapshot of the infringing listing, generate formal legal cease & desist letters, dispatch them via certified courier, and track the 24-hour cure window.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500">Active Violations:</span>
                <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white font-mono font-bold text-xs">
                  {violations.length} Tracked
                </span>
              </div>
            </div>

            {/* Automated Email Notification System Banner */}
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900 to-indigo-950/30 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">Automated Email Notification System</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      ACTIVE · INSTANT DISPATCH
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    When the reputation bot detects a MAP breach, alerts are immediately emailed to <code className="text-emerald-300 font-mono font-bold">{alertRecipients[0]}</code> with evidence screenshots & direct Cease & Desist draft links.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleSimulateNewViolationAndEmail}
                  className="w-full sm:w-auto px-3.5 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Simulate Violation & Trigger Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowEmailAlertsModal(true);
                    setEmailModalTab('preview');
                    if (emailHistory.length > 0) {
                      setSelectedEmailAlert(emailHistory[0]);
                    }
                  }}
                  className="w-full sm:w-auto px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Inbox className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Email Inbox ({emailHistory.length})</span>
                </button>
              </div>
            </div>

            {/* Violations Cards Grid */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {violations.map((vio) => (
                <div
                  key={vio.id}
                  className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedViolation?.id === vio.id
                      ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-500 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-400/50'
                  }`}
                  onClick={() => setSelectedViolation(vio)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] text-slate-400 font-bold block">{vio.incidentRef}</span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{vio.productTitle}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="font-semibold text-rose-600 dark:text-rose-400">{vio.sellerName}</span>
                        <span>·</span>
                        <span>{vio.platform}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border shrink-0 ${
                      vio.status === 'In_Grace_Period'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        : vio.status === 'CD_Dispatched'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                    }`}>
                      {vio.status === 'In_Grace_Period' && `⏳ Grace Window (${vio.cureHoursRemaining}h left)`}
                      {vio.status === 'CD_Dispatched' && `✉️ C&D Transmitted`}
                      {vio.status === 'Evidence_Captured' && `📸 Evidence Snapshot Ready`}
                    </span>
                  </div>

                  {/* Price comparison strip */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block">MAP FLOOR</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">${vio.targetMap.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">OFFENDING PRICE</span>
                      <span className="font-extrabold text-rose-600 dark:text-rose-400">${vio.listedPrice.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">DELTA</span>
                      <span className="font-bold text-rose-500">{vio.discountDelta.toFixed(2)} (-{Math.round(Math.abs(vio.discountDelta)/vio.targetMap*100)}%)</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <span className="text-slate-400 font-mono">{vio.timestamp}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const matchEmail = emailHistory.find(em => em.violationId === vio.id) || emailHistory[0];
                          setSelectedEmailAlert(matchEmail);
                          setShowEmailAlertsModal(true);
                          setEmailModalTab('preview');
                        }}
                        className="px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px] transition-colors flex items-center gap-1 cursor-pointer border border-emerald-500/20"
                        title="View the automated email alert dispatched to your team"
                      >
                        <Mail className="w-3 h-3" />
                        <span>Email Sent</span>
                      </button>

                      <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 hover:underline">
                        Legal Dossier <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Inspector Modal / Sub-Panel */}
          {selectedViolation && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-mono font-bold text-[10px]">
                      {selectedViolation.incidentRef}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      Region: {selectedViolation.region}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mt-1 text-white">
                    Evidentiary Dossier: {selectedViolation.productTitle}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedViolation, null, 2));
                      const dl = document.createElement('a');
                      dl.setAttribute("href", dataStr);
                      dl.setAttribute("download", `cease_desist_${selectedViolation.incidentRef}.json`);
                      dl.click();
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Court Dossier</span>
                  </button>

                  <button
                    onClick={() => setSelectedViolation(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Two Column Layout: Scraper Screenshot Evidence VS Formal Legal Cease & Desist Warning */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Side: Scraper Screenshot Evidence */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-indigo-400 font-bold uppercase flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-indigo-400" />
                      <span>Scraper Visual Snapshot Evidence</span>
                    </span>
                    <span className="text-slate-400 text-[10px]">SHA-256 Timestamper Verified</span>
                  </div>

                  {/* Simulated Marketplace Product Page Snapshot */}
                  <div className="rounded-2xl border-2 border-slate-700 bg-slate-950 p-4 font-sans text-xs relative overflow-hidden shadow-inner">
                    {/* Simulated Browser Address Bar */}
                    <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800 text-[10px] font-mono text-slate-400">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      </div>
                      <span className="bg-slate-900 px-3 py-1 rounded-md text-slate-300 truncate max-w-[280px]">
                        {selectedViolation.url}
                      </span>
                      <span className="ml-auto text-emerald-400">SSL 256-bit</span>
                    </div>

                    {/* Screenshot Mockup Content */}
                    <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800">
                      <div className="flex items-start justify-between gap-4">
                        <div className="w-20 h-20 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 border border-slate-700">
                          <Eye className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-[10px] text-slate-400 font-mono uppercase">{selectedViolation.platform} · ASIN B09XYZ8871</div>
                          <div className="font-bold text-sm text-white mt-0.5">{selectedViolation.productTitle}</div>
                          <div className="text-[11px] text-amber-400 mt-0.5">★★★★☆ {selectedViolation.sellerRating}</div>
                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-extrabold font-mono text-rose-400">
                              ${selectedViolation.listedPrice.toFixed(2)}
                            </span>
                            <span className="text-xs font-mono line-through text-slate-500">
                              MAP: ${selectedViolation.targetMap.toFixed(2)}
                            </span>
                            <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">
                              VIOLATION -{Math.round(Math.abs(selectedViolation.discountDelta)/selectedViolation.targetMap*100)}%
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-300 mt-2">
                            Ships from: <span className="font-semibold text-white">{selectedViolation.sellerName}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cryptographic Proof Hash Stamp */}
                    <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                      <div className="truncate max-w-[340px]">
                        <span className="text-slate-500">HASH: </span>
                        <span>{selectedViolation.evidenceHash}</span>
                      </div>
                      <span className="text-emerald-400 shrink-0">COURT READY</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Generated Cease & Desist Legal Warning Notice */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-rose-400 font-bold uppercase flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-rose-400" />
                      <span>Formal Cease & Desist Warning Notice</span>
                    </span>
                    <span className="text-slate-400 text-[10px]">Cure Window: 24 Hours</span>
                  </div>

                  {/* Cease and Desist Legal Paper Mock */}
                  <div className="p-5 rounded-2xl bg-slate-950 border-2 border-slate-800 font-mono text-xs text-slate-300 space-y-3 shadow-inner">
                    <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                      <span className="font-bold text-white uppercase text-[11px]">LEGAL DEMAND & CURE NOTICE</span>
                      <span className="text-rose-400 font-bold text-[10px]">{selectedViolation.incidentRef}</span>
                    </div>

                    <div className="text-[11px] leading-relaxed text-slate-300">
                      <p><span className="text-slate-500">TO: </span>{selectedViolation.sellerName}</p>
                      <p><span className="text-slate-500">REGARDING: </span>Unauthorized Price Degradation of {selectedViolation.sku}</p>
                      <p><span className="text-slate-500">PLATFORM: </span>{selectedViolation.platform}</p>
                    </div>

                    <p className="text-[10px] leading-relaxed text-slate-400 border-l-2 border-rose-500 pl-2">
                      "Please be advised that your advertised pricing of <span className="text-rose-400 font-bold">${selectedViolation.listedPrice.toFixed(2)}</span> on listing ASIN B09XYZ8871 directly violates our established Minimum Advertised Price (MAP) policy of <span className="text-emerald-400 font-bold">${selectedViolation.targetMap.toFixed(2)}</span> and constitutes unlawful trademark dilution under Lanham Act § 43(a)."
                    </p>

                    <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/40 text-[10px] text-rose-300">
                      ⚠️ <span className="font-bold">MANDATORY CURE PERIOD:</span> You are granted exactly twenty-four (24) hours from transmission to adjust advertised pricing to ${selectedViolation.targetMap.toFixed(2)} or delist inventory. Failure will trigger immediate marketplace policy grievances and revocation of wholesale distribution authorization.
                    </div>

                    {selectedViolation.noticeTrackingId && (
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Courier Tracking Ref:</span>
                        <span className="font-bold text-indigo-400 flex items-center gap-1">
                          {selectedViolation.noticeTrackingId}
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Transmission Action Bar */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => handleTransmitCeaseAndDesist(selectedViolation)}
                      disabled={isTransmittingCD}
                      className="w-full sm:w-auto flex-1 py-3 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 active:scale-95 text-white font-mono font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className={`w-3.5 h-3.5 ${isTransmittingCD ? 'animate-pulse' : ''}`} />
                      <span>{isTransmittingCD ? 'Dispatching Notice via API Courier...' : 'Transmit Legal C&D Warning'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setViolations(prev => prev.filter(v => v.id !== selectedViolation.id));
                        setSelectedViolation(null);
                        if (onPostMessage) onPostMessage(`Listing cured and marked compliant!`, 'success');
                      }}
                      className="w-full sm:w-auto px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Cured</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. TAB 3: REGIONAL VIOLATION HEATMAP (US & GLOBAL)         */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'heatmap' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0077b6]/10 text-[#0077b6] dark:text-cyan-400 border border-[#0077b6]/20 mb-1">
                  <Flame className="w-3 h-3 text-amber-500" />
                  <span>REGIONAL GEOGRAPHIC HEATMAP</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Marketplace MAP Breach Density & Geographic Distribution
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Examine where unauthorized price undercutting is concentrated geographically across domestic United States regions and worldwide international distributor hubs.
                </p>
              </div>

              {/* Scope Switcher: United States vs Worldwide */}
              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setHeatmapScope('us');
                    setSelectedRegionKey('US-Southwest');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    heatmapScope === 'us'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  United States Regions
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHeatmapScope('global');
                    setSelectedRegionKey('Global-UK');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    heatmapScope === 'global'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Worldwide Global Hubs
                </button>
              </div>
            </div>

            {/* Heatmap Visual Matrix Cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {(heatmapScope === 'us' ? usRegions : globalRegions).map((reg) => (
                <div
                  key={reg.key}
                  onClick={() => setSelectedRegionKey(reg.key)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedRegionKey === reg.key
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-500 shadow-md'
                      : 'bg-slate-50/50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      {reg.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      reg.intensity === 'high'
                        ? 'bg-rose-500 text-white'
                        : reg.intensity === 'med'
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {reg.intensity === 'high' ? '🔥 Hot Zone' : reg.intensity === 'med' ? '⚠️ Caution' : '✓ Clean'}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block">VIOLATIONS</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">{reg.violations}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block">COMPLIANCE</span>
                      <span className="font-extrabold text-emerald-500">{reg.complianceRate}%</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>{reg.sellersMonitored} Resellers Monitored</span>
                    {reg.avgUndercutPct < 0 && (
                      <span className="text-rose-500 font-bold font-mono">Avg {reg.avgUndercutPct}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Region Deep Dive Inspector */}
            <div className="mt-8 p-6 rounded-2xl bg-slate-900 text-white border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">REGION DEEP DIVE</span>
                  <h4 className="text-lg font-bold text-white mt-0.5">
                    {(heatmapScope === 'us' ? usRegions : globalRegions).find(r => r.key === selectedRegionKey)?.name}
                  </h4>
                </div>

                <button
                  onClick={() => {
                    if (onPostMessage) onPostMessage(`🛡️ Deployed geofenced rate ceiling shunt on selected region node.`, 'success');
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Enforce Regional Ingress Shunt</span>
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">CURRENT UNDER-MAP EXPOSURE</span>
                  <span className="text-2xl font-extrabold text-rose-400 mt-1 block">
                    {selectedRegionKey === 'US-Southwest' ? '$8,420 / mo' : selectedRegionKey === 'US-WestCoast' ? '$3,180 / mo' : '$0.00 / Clean'}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">Calculated wholesale margin dilution.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">TOP FLAGGED ROGUE RESELLER</span>
                  <span className="text-base font-bold text-white mt-1 block truncate">
                    {(heatmapScope === 'us' ? usRegions : globalRegions).find(r => r.key === selectedRegionKey)?.flaggedSellers[0] || 'No Violators Identified'}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">Responsible for majority of region under-cuts.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">SENTINEL CRAWLER HEALTH</span>
                  <span className="text-base font-bold text-emerald-400 mt-1 block flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    100% Sweep Parity
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">Automated rotating residential IP proxies active.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 6. TAB 4: SENTINEL AI REPUTATION & TRAJECTORY BOT          */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'sentiment_bot' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-1">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span>AUTONOMOUS SENTINEL AI REPUTATION AGENT</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Brand Sentiment Intelligence & Forward Trajectory Bot
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  The Sentinel Bot continuously parses social channels, editorial news wires, and verified reviews to generate a predictive probability rate of your brand standing and projected equity trajectory.
                </p>
              </div>

              <button
                onClick={handleRunBotAnalysis}
                disabled={botIsThinking}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Cpu className={`w-4 h-4 ${botIsThinking ? 'animate-spin' : ''}`} />
                <span>{botIsThinking ? 'Calculating Trajectory...' : 'Re-Run Sentinel AI Analysis'}</span>
              </button>
            </div>

            {/* Sentinel Bot Predictive Probability Forecast Card */}
            <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0d1b33] to-[#120a2e] text-white border border-purple-500/30 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-purple-300">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                    <span>PREDICTIVE STANDING & PROBABILITY RATE</span>
                  </div>
                  <h4 className="text-2xl font-extrabold mt-1 text-white">
                    {forecastProbability.verdict}
                  </h4>
                  <p className="text-xs text-slate-300 mt-2 max-w-xl leading-relaxed">
                    Based on real-time neural sentiment evaluation across 1,420 Reddit posts, TikTok UGC reviews, and Google Merchant ratings.
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-4 shrink-0">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[120px]">
                    <span className="text-[10px] font-mono text-slate-400 block">CURRENT STANDING</span>
                    <span className="text-3xl font-extrabold font-mono text-white mt-1 block">
                      {forecastProbability.standing}%
                    </span>
                    <span className="text-[9px] text-emerald-400 font-mono">Strong Positive</span>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 text-center min-w-[120px]">
                    <span className="text-[10px] font-mono text-purple-300 block">PROBABILITY RATE</span>
                    <span className="text-3xl font-extrabold font-mono text-purple-400 mt-1 block">
                      {forecastProbability.probabilityScore}%
                    </span>
                    <span className="text-[9px] text-purple-300 font-mono">Forward Expansion</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[120px]">
                    <span className="text-[10px] font-mono text-slate-400 block">30-DAY OUTLOOK</span>
                    <span className="text-3xl font-extrabold font-mono text-emerald-400 mt-1 block">
                      {forecastProbability.thirtyDayTarget}%
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">Projected Equilibrium</span>
                  </div>
                </div>
              </div>

              {/* Bot Risk Vector Warning Bar */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300 font-mono">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-amber-300">SENTINEL RISK VECTOR: </strong>
                  {forecastProbability.riskVector}
                </span>
              </div>
            </div>

            {/* Multi-Channel Intelligence Feed Switcher */}
            <div className="mt-8">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveBotTab('overview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    activeBotTab === 'overview'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All Feeds
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBotTab('social')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    activeBotTab === 'social'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Social (Reddit, X, TikTok)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBotTab('news')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    activeBotTab === 'news'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  News & Media Wires
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBotTab('reviews')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    activeBotTab === 'reviews'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Verified Reviews
                </button>
              </div>

              {/* Feed Items Rendering */}
              <div className="mt-4 space-y-3">
                {(activeBotTab === 'overview' || activeBotTab === 'social') && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Social Intelligence Mentions</span>
                    {socialStreams.map((soc, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">{soc.channel}</span>
                            <span className="text-slate-400 text-[10px] font-mono">{soc.timestamp}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 mt-1 italic">
                            {soc.snippet}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            soc.score >= 90
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}>
                            {soc.sentiment} ({soc.score}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(activeBotTab === 'overview' || activeBotTab === 'news') && (
                  <div className="space-y-3 mt-4">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Editorial News & Press Feed</span>
                    {newsStreams.map((n, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">{n.outlet} · {n.date}</span>
                          <h5 className="font-bold text-slate-900 dark:text-white mt-0.5">{n.headline}</h5>
                        </div>
                        <span className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                          {n.relevance}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {(activeBotTab === 'overview' || activeBotTab === 'reviews') && (
                  <div className="space-y-3 mt-4">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Verified Customer Reviews</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reviewFeeds.map((r, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{r.source}</span>
                            <span className="font-mono font-bold text-emerald-500">{r.rating} / 5.0 ★</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                            {r.summary}
                          </p>
                          <div className="mt-2 text-[10px] text-slate-400 font-mono">
                            {r.reviewsCount.toLocaleString()} Verified Customer Orders
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 7. TAB 5: SUGGESTED API FEEDS & INTEGRATION CENTER         */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'api_feeds' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-1">
                  <Radio className="w-3 h-3" />
                  <span>SUGGESTED EXTERNAL API FEEDS</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Marketplace Scraping & Real-Time Data Pipeline Connectors
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Connect real-time API feeds to harvest pricing, screenshots, and social sentiment data without managing custom scraper servers or proxy infrastructure.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500">Active Feed Pipes:</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white font-mono font-bold text-xs">
                  {apiFeeds.length} Configured
                </span>
              </div>
            </div>

            {/* Feeds List Cards */}
            <div className="mt-6 space-y-4">
              {apiFeeds.map((feed) => (
                <div
                  key={feed.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{feed.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 font-bold">
                          {feed.category}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {feed.provider}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 max-w-3xl">
                        {feed.description}
                      </p>
                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-3 pt-1">
                        <span>ENDPOINT: <code className="text-slate-600 dark:text-slate-300">{feed.endpoint}</code></span>
                        <span>•</span>
                        <span>FREQUENCY: {feed.frequency}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                      <div className="text-right font-mono text-xs">
                        <span className="text-[10px] text-slate-400 block">LATENCY</span>
                        <span className="text-emerald-500 font-bold">{feed.latencyMs} ms</span>
                      </div>

                      <button
                        onClick={() => handleTestFeed(feed.id)}
                        disabled={feed.status === 'testing'}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-200 font-mono font-bold text-xs rounded-xl transition-all cursor-pointer border border-slate-300 dark:border-slate-700 flex items-center gap-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${feed.status === 'testing' ? 'animate-spin text-indigo-500' : ''}`} />
                        <span>{feed.status === 'testing' ? 'Pinging...' : 'Test Feed Ping'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Webhook Connector Builder */}
            <div className="mt-8 p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Add Custom API Scraper Webhook</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Enter your external webhook endpoint to route custom scraper JSON payloads directly into the Brand Reputation & MAP engine.
              </p>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="https://api.yourdomain.com/v1/map-scrapes/webhook"
                  defaultValue="https://gateway.cloudboyx.internal/api/v1/scrapes/inbound-webhook"
                  className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => {
                    if (onPostMessage) onPostMessage(`🔗 Custom scraper webhook registered and verified!`, 'success');
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
                >
                  Register Webhook
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 8. BATCH SKU MODAL                                         */}
      {/* ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showBatchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative text-left"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Batch SKU MAP Importer</h4>
                    <p className="text-[11px] text-slate-400">Add multiple catalog SKUs for circular marketplace crawling.</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowBatchModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 font-sans">
                <label className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 block">
                  Paste Batch SKUs (Format: SKU, Product Title, MAP Floor, MSRP):
                </label>
                <textarea
                  rows={4}
                  value={batchRawInput}
                  onChange={(e) => setBatchRawInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="CBX-SHOE-01, High Top Leather Sneaker, 140.00, 180.00"
                />
                <p className="text-[10px] text-slate-400">
                  Example: <code>CBX-HOODIE, Oversized French Terry, 85.00, 110.00</code> (1 product per line).
                </p>

                {isBatchScanning && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px] font-mono text-indigo-500 font-bold">
                      <span>CRAWLER INITIATION PROGRESS:</span>
                      <span>{scanProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 text-xs font-mono font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleProcessBatchSkus}
                  disabled={isBatchScanning}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Import & Start Crawling</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 9. AUTOMATED EMAIL NOTIFICATION SYSTEM & PREVIEW MODAL     */}
      {/* ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {(showEmailAlertsModal || selectedEmailAlert !== null) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl relative text-left my-8 max-h-[90vh] overflow-y-auto scrollbar-thin"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">
                        Automated MAP Violation Email System
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        COURIER DISPATCHED
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Automated alert dispatch when Brand Reputation Bot detects unauthorized price undercutting.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowEmailAlertsModal(false);
                    setSelectedEmailAlert(null);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Sub-Tabs: Delivered Email Preview VS Settings */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 py-3">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setEmailModalTab('preview')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      emailModalTab === 'preview'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    <span>Delivered Email Preview ({emailHistory.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEmailModalTab('settings')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      emailModalTab === 'settings'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Notification Settings & Recipients</span>
                  </button>
                </div>

                <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
                  Recipient: <span className="text-emerald-500 font-bold">{alertRecipients[0]}</span>
                </div>
              </div>

              {/* ──────────────── VIEW A: DELIVERED EMAIL PREVIEW ──────────────── */}
              {emailModalTab === 'preview' && (
                <div className="mt-4 space-y-4">
                  {/* Email Selector Tabs */}
                  <div className="flex flex-wrap gap-2 pb-2">
                    {emailHistory.map((em, idx) => {
                      const isSelected = (selectedEmailAlert?.id === em.id) || (!selectedEmailAlert && idx === 0);
                      return (
                        <button
                          key={em.id}
                          type="button"
                          onClick={() => setSelectedEmailAlert(em)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all text-left flex items-center gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-emerald-300 border border-slate-700 shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                          <span className="font-bold truncate max-w-[180px]">{em.sellerName}</span>
                          <span className="text-[10px] text-slate-400">({em.platform})</span>
                        </button>
                      );
                    })}
                  </div>

                  {(() => {
                    const currentAlert = selectedEmailAlert || emailHistory[0];
                    if (!currentAlert) return null;

                    return (
                      <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-6 font-sans shadow-inner space-y-4">
                        {/* Email Envelope Metadata Chrome */}
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-slate-500 gap-1">
                            <div>
                              <span className="text-slate-400">FROM: </span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                CloudboyX Sentinel Bot &lt;alerts@cloudboyx.internal&gt;
                              </span>
                            </div>
                            <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                              ✓ TLS 1.3 / DKIM Verified
                            </span>
                          </div>

                          <div className="text-slate-500">
                            <span className="text-slate-400">TO: </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {currentAlert.recipientEmail}
                            </span>
                            <span className="text-slate-400 text-[10px] ml-2">
                              (and {alertRecipients.length - 1} configured legal recipient)
                            </span>
                          </div>

                          <div className="text-slate-500">
                            <span className="text-slate-400">DATE: </span>
                            <span className="text-slate-700 dark:text-slate-300">{currentAlert.sentAt}</span>
                          </div>

                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="text-rose-500 shrink-0">SUBJECT:</span>
                            <span className="truncate">{currentAlert.subject}</span>
                          </div>
                        </div>

                        {/* Rendered HTML Email Content */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-sm">
                          {/* Branded Email Header */}
                          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                              <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                              <span className="font-mono font-extrabold text-sm tracking-wider uppercase text-slate-900 dark:text-white">
                                CLOUDBOYX BRAND SENTINEL
                              </span>
                            </div>
                            <span className="px-2.5 py-1 rounded bg-rose-500 text-white font-mono text-[10px] font-extrabold uppercase tracking-wider">
                              CRITICAL MAP VIOLATION
                            </span>
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                              Dear Brand Protection & Operations Team,
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                              The automated CloudboyX Brand Sentinel Crawler has detected an active Minimum Advertised Price (MAP) breach on <strong>{currentAlert.platform}</strong>. This listing undercuts your brand's authorized wholesale pricing floor by <strong>{currentAlert.discountPct}%</strong>.
                            </p>
                          </div>

                          {/* Summary of Violation Card */}
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-2.5">
                            <div className="flex justify-between items-center text-[11px] pb-2 border-b border-slate-200 dark:border-slate-800">
                              <span className="text-slate-400 font-bold uppercase">INCIDENT SUMMARY</span>
                              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{currentAlert.incidentRef}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                              <div>
                                <span className="text-slate-400 block">PRODUCT / SKU:</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{currentAlert.sku}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">MARKETPLACE:</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{currentAlert.platform}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">OFFENDING RESELLER:</span>
                                <span className="font-bold text-rose-600 dark:text-rose-400">{currentAlert.sellerName}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">DETECTED PRICE:</span>
                                <span className="font-extrabold text-rose-600 dark:text-rose-400 text-sm">
                                  ${currentAlert.listedPrice.toFixed(2)} USD
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">ENFORCED MAP FLOOR:</span>
                                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                                  ${currentAlert.targetMap.toFixed(2)} USD
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">PRICE DEGRADATION:</span>
                                <span className="font-bold text-rose-500">
                                  -${Math.abs(currentAlert.discountDelta).toFixed(2)} (-{currentAlert.discountPct}%)
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Scraper Screenshot Thumbnail & Verification Hash */}
                          <div className="p-3.5 rounded-xl bg-slate-900 text-white border border-slate-800 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                                <Camera className="w-6 h-6 text-indigo-400" />
                              </div>
                              <div>
                                <div className="text-xs font-bold font-mono text-white">Scraper Screenshot Evidence Attached</div>
                                <div className="text-[10px] text-slate-400 font-mono truncate max-w-[280px]">
                                  SHA-256: {currentAlert.evidenceHash.substring(0, 24)}...
                                </div>
                              </div>
                            </div>
                            <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold shrink-0">
                              Courtroom Ready
                            </span>
                          </div>

                          {/* ──────────────── DIRECT LINK TO CEASE & DESIST DRAFT ──────────────── */}
                          <div className="pt-2 space-y-3">
                            <button
                              type="button"
                              onClick={() => {
                                const targetVio = violations.find(v => v.id === currentAlert.violationId) || violations[0];
                                setSelectedViolation(targetVio);
                                setShowEmailAlertsModal(false);
                                setSelectedEmailAlert(null);
                                setActiveTab('violations_cd');
                                if (onPostMessage) {
                                  onPostMessage(`📜 Navigated directly to Cease & Desist draft for ${targetVio.incidentRef}`, 'success');
                                }
                              }}
                              className="w-full py-4 bg-gradient-to-r from-rose-600 via-red-600 to-indigo-700 hover:from-rose-500 hover:to-indigo-600 active:scale-98 text-white font-mono font-extrabold text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-rose-400/40"
                            >
                              <FileCheck className="w-5 h-5 text-white" />
                              <span>Review & Transmit Cease & Desist Warning Notice ➔</span>
                            </button>

                            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono flex items-center justify-between gap-2">
                              <div className="text-slate-500 truncate">
                                Direct C&D URL: <code className="text-indigo-600 dark:text-indigo-400">{currentAlert.cdDraftUrl}</code>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(currentAlert.cdDraftUrl);
                                  if (onPostMessage) onPostMessage('📋 Direct C&D Draft Link copied to clipboard!', 'success');
                                }}
                                className="px-2 py-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold shrink-0 cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Copy Link</span>
                              </button>
                            </div>
                          </div>

                          {/* Email Legal Boilerplate Footer */}
                          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center leading-relaxed">
                            CloudboyX Automated Sentinel Security Suite · Lanham Act 15 U.S.C. § 1125(a) Protection Framework.
                            <br />
                            Dispatched via SendGrid Dedicated Delivery Courier & Lob Certified Mail Gateway.
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ──────────────── VIEW B: NOTIFICATION SETTINGS & RECIPIENTS ──────────────── */}
              {emailModalTab === 'settings' && (
                <div className="mt-4 space-y-6 font-sans">
                  {/* Recipients Configuration Card */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-sm text-slate-900 dark:text-white">Alert Email Recipients</h5>
                        <p className="text-xs text-slate-500">Every detected MAP breach will immediately dispatch alerts to these addresses.</p>
                      </div>
                      <span className="text-xs font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                        {alertRecipients.length} Active
                      </span>
                    </div>

                    <div className="space-y-2">
                      {alertRecipients.map((email, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="font-bold text-slate-800 dark:text-slate-200">{email}</span>
                            {idx === 0 && (
                              <span className="px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold">
                                PRIMARY
                              </span>
                            )}
                          </div>
                          {alertRecipients.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRecipient(email)}
                              className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                              title="Remove recipient"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleAddRecipient} className="flex gap-2 pt-2">
                      <input
                        type="email"
                        value={newRecipientInput}
                        onChange={(e) => setNewRecipientInput(e.target.value)}
                        placeholder="legal@yourcompany.com"
                        className="flex-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Add Email
                      </button>
                    </form>
                  </div>

                  {/* Trigger Sensitivity Preferences */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">Alert Dispatch Rules & Cadence</h5>
                    
                    <div className="space-y-2 text-xs">
                      <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-indigo-600 cursor-pointer" />
                        <span>Instant Email Dispatch on any listing price &lt; MAP floor (0 second latency)</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-indigo-600 cursor-pointer" />
                        <span>Send 12-Hour Grace Expiration warning if rogue reseller has not restored price</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-indigo-600 cursor-pointer" />
                        <span>Attach high-resolution PNG screenshot evidence & SHA-256 proof hash</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-indigo-600 cursor-pointer" />
                        <span>Include 1-click direct link to pre-populated Cease & Desist draft</span>
                      </label>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-mono">Test Delivery Courier:</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (onPostMessage) onPostMessage(`📨 Live test email alert dispatched to ${alertRecipients[0]} via SendGrid!`, 'success');
                        }}
                        className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Send Test Ping Email
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
                <span className="text-slate-400">
                  Total Dispatched Alerts: <strong className="text-slate-700 dark:text-slate-200">{emailHistory.length}</strong>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setShowEmailAlertsModal(false);
                    setSelectedEmailAlert(null);
                  }}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Close Courier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

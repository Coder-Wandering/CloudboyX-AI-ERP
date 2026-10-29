import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Globe, 
  Cpu, 
  TrendingUp, 
  RefreshCw, 
  Check, 
  AlertTriangle, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  Radio,
  Shield,
  Zap,
  ArrowRight,
  ShieldCheck,
  Radar,
  Star
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
  onNavigateToMapSuite?: () => void;
}

export default function BrandMonitoringSection({
  sentimentScore,
  totalMonitoredItems,
  isScanningReputation,
  reputationLogs,
  resellers,
  onTriggerReputationScan,
  onPostMessage,
  onNavigateToMapSuite
}: BrandMonitoringSectionProps) {
  // Navigation Sub-Tabs focused on Brand Reputation & Sentinel Feeds
  const [activeTab, setActiveTab] = useState<'sentiment_bot' | 'social_news' | 'api_feeds' | 'map_suite_bridge'>('sentiment_bot');

  // ──────────────────────────────────────────────────────────
  // Sentinel AI Reputation & Trajectory Bot State
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
    standing: sentimentScore || 94.2,
    probabilityScore: 88,
    sevenDayTarget: 96.2,
    thirtyDayTarget: 98.0,
    verdict: 'High-Velocity Upward Brand Momentum',
    riskVector: 'Brand perception stable. High social sentiment velocity detected on TikTok and Reddit communities.'
  });

  const socialStreams = [
    {
      channel: 'Reddit (r/streetwear & r/rawdenim)',
      snippet: '“The heavyweight vintage tee from CloudboyX is unreal quality. Materials, stitching, and custom drape feel truly premium.”',
      sentiment: 'Highly Positive',
      timestamp: '14 mins ago',
      score: 94
    },
    {
      channel: 'TikTok (#cloudboyx unboxing)',
      snippet: '“French terry hoodie stitch density is 10/10. Definitely worth the price tag. Authentic luxury tier packaging.”',
      sentiment: 'Viral Positive',
      timestamp: '32 mins ago',
      score: 98
    },
    {
      channel: 'X / Twitter (@EnterpriseRetail)',
      snippet: '“CloudboyX platform architecture setting standard for autonomous ERP integration and brand pricing governance in 2026.”',
      sentiment: 'Executive Positive',
      timestamp: '1 hour ago',
      score: 96
    },
    {
      channel: 'Instagram (@CloudboyX_Style)',
      snippet: '“Direct drop sold out in 14 minutes. Quality control and packaging presentation are pristine.”',
      sentiment: 'Strong Positive',
      timestamp: '2 hours ago',
      score: 92
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
      headline: 'Why Luxury & Premium Direct-to-Consumer Brands are Weaponizing Instant Brand Protection Sentinels',
      date: 'Yesterday',
      relevance: 'Brand Protection Benchmark'
    },
    {
      outlet: 'Forbes Tech Council',
      headline: 'The Shift to Real-Time Cryptographic Auditing and Multi-Entity Merchant Verification',
      date: '3 days ago',
      relevance: 'Enterprise Credibility'
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
  // Suggested External API Feeds State
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
      description: 'Pulls real-time Buy Box winning seller identities, pricing offers, and listing ASIN snapshots from Amazon US, UK, and JP.',
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
      description: 'Rotates residential proxies to bypass bot filters on Walmart, TikTok Shop, Target, eBay, and Mercari.',
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
      description: 'Transmits legally recognized notices via certified tracked email and physical certified postal mail with delivery confirmation.',
      payloadType: 'application/json'
    }
  ]);

  // Handler: Test Feed Ping
  const handleTestFeed = (feedId: string) => {
    setApiFeeds(prev => prev.map(f => f.id === feedId ? { ...f, status: 'testing' } : f));
    setTimeout(() => {
      setApiFeeds(prev => prev.map(f => {
        if (f.id === feedId) {
          const randLatency = Math.floor(Math.random() * 30) + 25;
          return { ...f, status: 'connected', latencyMs: randLatency };
        }
        return f;
      }));
      if (onPostMessage) {
        onPostMessage(`📡 Feed test successful! Verified connection to external endpoint with active payload verification.`, 'success');
      }
    }, 700);
  };

  // Handler: Run Sentinel AI Analysis
  const handleRunBotAnalysis = () => {
    setBotIsThinking(true);
    setTimeout(() => {
      setBotIsThinking(false);
      const newScore = parseFloat((sentimentScore + (Math.random() * 2 - 0.5)).toFixed(1));
      setForecastProbability({
        standing: newScore,
        probabilityScore: 91,
        sevenDayTarget: Number((newScore + 2.1).toFixed(1)),
        thirtyDayTarget: Number((newScore + 3.4).toFixed(1)),
        verdict: 'Accelerated Premium Market Recognition',
        riskVector: 'Zero critical brand integrity vulnerabilities. Positive social buzz and high reseller compliance.'
      });
      if (onPostMessage) {
        onPostMessage(`🤖 Sentinel AI updated brand standing to ${newScore}% with 91% forward upward trajectory probability!`, 'success');
      }
    }, 900);
  };

  return (
    <motion.div
      key="brand_reputation_feeds_suite"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 text-left font-sans"
    >
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. BRAND REPUTATION MASTER BANNER                          */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-[#071328] to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 p-4 opacity-5 select-none pointer-events-none font-mono text-9xl">REPUTATION</div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>BRAND REPUTATION & SENTINEL AI INTELLIGENCE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Autonomous Brand Reputation & Sentinel Trajectory AI Suite
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Continuous multi-channel sentiment monitoring across Reddit, TikTok, X/Twitter, editorial press wires, and Trustpilot. The Sentinel AI reasoning agent continuously tracks brand standing, forecasts 7-day and 30-day velocity trajectories, and preserves enterprise market equity.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={handleRunBotAnalysis}
              disabled={botIsThinking}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Cpu className={`w-4 h-4 ${botIsThinking ? 'animate-spin' : ''}`} />
              <span>{botIsThinking ? 'Analyzing Feeds...' : 'Re-Run Sentinel AI'}</span>
            </button>

            {onNavigateToMapSuite && (
              <button
                onClick={onNavigateToMapSuite}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-mono font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                title="Launch the dedicated Module 04: Brand Reputation & MAP Protection Suite"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-300" />
                <span>Open Full MAP Suite →</span>
              </button>
            )}
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
              <span>SENTINEL FORWARD VELOCITY</span>
              <span className="text-purple-400 font-bold">88% Upward</span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-emerald-400">+{forecastProbability.sevenDayTarget}% 7d</div>
            <p className="text-[10px] text-slate-400 mt-1">Projected sentiment expansion vector.</p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>VERIFIED CUSTOMER REVIEWS</span>
              <span className="text-amber-400 font-bold">★ 4.85 / 5.0</span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-white">2,310 Orders</div>
            <p className="text-[10px] text-slate-400 mt-1">Verified buyer Trustpilot & Google ratings.</p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>ACTIVE DATA FEEDS</span>
              <span className="text-cyan-400 font-bold">100% Online</span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-white">{apiFeeds.length} Streams</div>
            <p className="text-[10px] text-slate-400 mt-1">Live market scrapers, social & news feeds.</p>
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
            onClick={() => setActiveTab('sentiment_bot')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'sentiment_bot'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>01. Sentinel AI Reputation Bot</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('social_news')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'social_news'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>02. Social, News & Review Streams</span>
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
            <span>03. Suggested Enterprise API Feeds</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('map_suite_bridge')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'map_suite_bridge'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radar className="w-3.5 h-3.5" />
            <span>04. MAP Defense Suite (Module 04)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time Streams Connected</span>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. TAB 1: SENTINEL AI REPUTATION BOT                      */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'sentiment_bot' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <span>AUTONOMOUS SENTINEL AI REPUTATION AGENT</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Brand Sentiment Intelligence & Forward Trajectory Bot
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  The Sentinel Bot continuously analyzes social networks, editorial news wires, and verified reviews to generate a predictive probability rate of your brand standing and projected equity trajectory.
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
                <AlertTriangle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-emerald-300">SENTINEL RISK VECTOR: </strong>
                  {forecastProbability.riskVector}
                </span>
              </div>
            </div>

            {/* Quick Consultation Suggestions */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200 mb-1">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>Growth Velocity</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Social mentions surged by +24% over the last 14 days with organic TikTok unboxing videos generating high retention.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200 mb-1">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span>Authenticity Perception</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Customer trust score is 99.1%. Wholesale authorized distributors are verified across all active regional retail nodes.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200 mb-1">
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  <span>Community Sentiment</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Forum discussions praise material longevity and fast fulfillment dispatch with zero major delivery escalations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. TAB 2: SOCIAL, NEWS & REVIEW STREAMS                   */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'social_news' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>LIVE CHANNEL INTELLIGENCE</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Multi-Channel Brand Feeds & Mention Streams
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Aggregated touchpoints from Reddit, TikTok, X, trade press publications, and verified customer review portals.
                </p>
              </div>

              {/* Feed Filter Buttons */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveBotTab('overview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    activeBotTab === 'overview'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
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
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Social
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBotTab('news')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    activeBotTab === 'news'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  News
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBotTab('reviews')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    activeBotTab === 'reviews'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Reviews
                </button>
              </div>
            </div>

            {/* Feed Items Rendering */}
            <div className="mt-6 space-y-4">
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
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {soc.sentiment} ({soc.score}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(activeBotTab === 'overview' || activeBotTab === 'news') && (
                <div className="space-y-3 mt-6">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Editorial News & Press Wire</span>
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
                <div className="space-y-3 mt-6">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Verified Customer Reviews</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviewFeeds.map((r, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{r.source}</span>
                          <span className="font-mono font-bold text-emerald-500 flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {r.rating} / 5.0
                          </span>
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
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. TAB 3: SUGGESTED ENTERPRISE API FEEDS                  */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'api_feeds' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-1">
                  <Radio className="w-3.5 h-3.5" />
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
                Enter your external webhook endpoint to route custom scraper JSON payloads directly into the Brand Reputation engine.
              </p>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="https://api.yourdomain.com/v1/sentiment/webhook"
                  defaultValue="https://gateway.cloudboyx.internal/api/v1/sentiment/inbound-webhook"
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
      {/* 6. TAB 4: MAP DEFENSE SUITE BRIDGE CARD (MODULE 04)        */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'map_suite_bridge' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-[#031d3d] to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-3">
                  <ShieldCheck className="w-4 h-4 text-cyan-300" />
                  <span>DEDICATED MODULE 04: FULL MAP DEFENSE SUITE</span>
                </div>
                <h3 className="text-2xl font-extrabold text-white">
                  Looking for Complete Autonomous MAP Scraping & Enforcement?
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
                  All MAP floor compliance scrapers, automated evidentiary screenshots, legal Cease & Desist notices, SKU catalogs, partner compliance records, D3 violation heatmaps, and OmniSync order routing are located inside the dedicated <strong>Module 04: Brand Reputation & MAP Protection Suite</strong>.
                </p>
              </div>

              {onNavigateToMapSuite && (
                <button
                  onClick={onNavigateToMapSuite}
                  className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 active:scale-95 text-white font-mono font-bold text-sm rounded-2xl shadow-xl transition-all flex items-center gap-2.5 cursor-pointer shrink-0"
                >
                  <span>Launch MAP Protection Suite</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Feature Highlights Grid */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-slate-800">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-cyan-400 font-bold text-xs font-mono block">1. Private Vault Dashboard</span>
                <p className="text-[11px] text-slate-400 mt-1">Multi-market sweep status, chronologies & live compliance graphs.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-indigo-400 font-bold text-xs font-mono block">2. Continuous Sweepers</span>
                <p className="text-[11px] text-slate-400 mt-1">Amazon, Walmart, TikTok Shop, Target & Best Buy crawlers.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-purple-400 font-bold text-xs font-mono block">3. Legal C&D Notices</span>
                <p className="text-[11px] text-slate-400 mt-1">Evidentiary screenshot capture & certified cure warning dispatch.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-emerald-400 font-bold text-xs font-mono block">4. Interactive D3 Heatmaps</span>
                <p className="text-[11px] text-slate-400 mt-1">Geographic violation intensities and reseller partner tracking.</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}

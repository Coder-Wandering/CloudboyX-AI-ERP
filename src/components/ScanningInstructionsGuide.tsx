import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  QrCode, 
  X, 
  Search, 
  Camera, 
  Sun, 
  ZoomIn, 
  Sliders, 
  ShieldCheck, 
  Check, 
  AlertTriangle, 
  Maximize2, 
  Sidebar, 
  HelpCircle,
  Scan,
  Compass,
  Contrast,
  FileText,
  Lightbulb,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export type GuideCategory = 'all' | 'alignment' | 'lighting' | 'zoom' | 'filters' | 'troubleshooting';

export interface ScanningInstructionsGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchCameraScanner?: () => void;
  defaultMode?: 'modal' | 'side_panel';
}

interface TipItem {
  id: string;
  number: number;
  category: 'alignment' | 'lighting' | 'zoom' | 'filters' | 'troubleshooting';
  title: string;
  summary: string;
  recommendation: string;
  technicalMetric: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  tags: string[];
}

const SCANNING_TIPS: TipItem[] = [
  {
    id: 'tip-distance-angle',
    number: 1,
    category: 'alignment',
    title: 'Distance & Parallel Plane Alignment',
    summary: 'Hold the camera lens strictly parallel (facing directly flat) to the physical invoice, carton, or shipping label.',
    recommendation: 'Keep a distance between 15–30 cm (6–12 inches). Avoid steep tilted perspectives (>15°) that distort the three corner finder patterns required by ISO/IEC 18004 decoders.',
    technicalMetric: 'Ideal: 20 cm · Tolerance: ±10 cm · Tilt limit: <15°',
    icon: Compass,
    accentColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    tags: ['distance', 'angle', 'parallel', 'plane', 'tilt', 'orientation', 'flat']
  },
  {
    id: 'tip-anti-glare',
    number: 2,
    category: 'lighting',
    title: 'Anti-Glare & Warehouse Lighting Control',
    summary: 'Avoid direct overhead LED spotlights reflecting off glossy polybags, thermal receipt paper, or plastic packaging.',
    recommendation: 'Position the label under diffused ambient light. In dim warehouse environments or dark stockrooms, activate the built-in Torch/Flashlight toggle directly below the optical viewfinder.',
    technicalMetric: 'Ambient: >150 lux · Flash: 5500K LED assist',
    icon: Sun,
    accentColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    tags: ['glare', 'reflection', 'flashlight', 'lighting', 'torch', 'shadows', 'warehouse']
  },
  {
    id: 'tip-focus-zoom',
    number: 3,
    category: 'zoom',
    title: 'Focus Zoom Adjuster vs. Macro Defocus',
    summary: 'Do not push the camera extremely close (<10 cm) to enlarge miniature QR codes.',
    recommendation: 'Standard mobile lenses have a minimum focal distance of 10 cm and will produce a blurry image if pushed too close. Instead, keep a 20 cm distance and tap the 2.0x (Tele) quick preset or slide the digital focus zoom.',
    technicalMetric: 'Min focal distance: 10 cm · Optimal zoom: 1.5x–2.0x',
    icon: ZoomIn,
    accentColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    tags: ['zoom', 'macro', 'focus', 'blur', 'distance', 'telephoto', 'lens']
  },
  {
    id: 'tip-contrast-filters',
    number: 4,
    category: 'filters',
    title: 'High-Contrast Optical Matrix Filters',
    summary: 'Enhance edge definition when scanning faded thermal paper or colored background packaging.',
    recommendation: 'Tap the optical Filter button on the scanner interface to switch to Grayscale (bilevel thresholding) or Thermal (color inversion). This heightens contrast between dark modules and light quiet zones.',
    technicalMetric: 'Contrast threshold: >45% modulation · Quiet zone: 4 modules',
    icon: Contrast,
    accentColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    tags: ['filter', 'contrast', 'grayscale', 'thermal', 'inverted', 'faded', 'matrix']
  },
  {
    id: 'tip-reticle-centering',
    number: 5,
    category: 'alignment',
    title: 'Holographic Reticle Centering & Dwell Time',
    summary: 'Frame the full code within the square neon green target corners of the viewfinder.',
    recommendation: 'Hold the device steady for 200–300 milliseconds. The green animated laser sweep continuously scans rows; an affirmative high-frequency chirp and green flash confirm successful JSON decode.',
    technicalMetric: 'Dwell time: 250 ms · Decode cadence: 30 FPS',
    icon: Scan,
    accentColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    tags: ['reticle', 'target', 'centering', 'dwell', 'laser', 'chirp', 'capture']
  },
  {
    id: 'tip-damaged-codes',
    number: 6,
    category: 'troubleshooting',
    title: 'Damaged Barcodes & OCR Fallback Routing',
    summary: 'Recover from torn, creased, water-damaged, or partially illegible physical barcodes.',
    recommendation: 'Smooth out paper creases using your fingers. If Reed-Solomon error correction fails, switch to the OCR Invoice Ingestion tab to process order details directly from text recognition or manual invoice entry.',
    technicalMetric: 'Error correction: Level M (15%) / Level Q (25%) · OCR fallback',
    icon: FileText,
    accentColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    tags: ['damaged', 'torn', 'smudge', 'crease', 'ocr', 'fallback', 'recovery', 'invoice']
  }
];

export const ScanningInstructionsGuide: React.FC<ScanningInstructionsGuideProps> = ({
  isOpen,
  onClose,
  onLaunchCameraScanner,
  defaultMode = 'modal'
}) => {
  const [panelMode, setPanelMode] = useState<'modal' | 'side_panel'>(defaultMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<GuideCategory>('all');
  const [expandedTipId, setExpandedTipId] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered tips
  const filteredTips = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return SCANNING_TIPS.filter((tip) => {
      const matchesCategory = activeCategory === 'all' || tip.category === activeCategory;
      if (!matchesCategory) return false;
      if (!query) return true;
      return (
        tip.title.toLowerCase().includes(query) ||
        tip.summary.toLowerCase().includes(query) ||
        tip.recommendation.toLowerCase().includes(query) ||
        tip.tags.some(t => t.toLowerCase().includes(query))
      );
    });
  }, [searchQuery, activeCategory]);

  if (!isOpen) return null;

  const categories: Array<{ id: GuideCategory; label: string }> = [
    { id: 'all', label: 'All Tips' },
    { id: 'alignment', label: 'Alignment & Angle' },
    { id: 'lighting', label: 'Lighting & Glare' },
    { id: 'zoom', label: 'Focus & Zoom' },
    { id: 'filters', label: 'Matrix Filters' },
    { id: 'troubleshooting', label: 'Damaged Codes & OCR' },
  ];

  return (
    <AnimatePresence>
      <div 
        id="scanning-instructions-guide-backdrop"
        className={`fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex ${
          panelMode === 'side_panel' ? 'justify-end' : 'items-center justify-center p-3 sm:p-5'
        } overflow-y-auto`}
        onClick={onClose}
      >
        <motion.div
          key={panelMode}
          initial={
            panelMode === 'side_panel' 
              ? { x: '100%', opacity: 0.5 }
              : { opacity: 0, scale: 0.94, y: 20 }
          }
          animate={
            panelMode === 'side_panel' 
              ? { x: 0, opacity: 1 }
              : { opacity: 1, scale: 1, y: 0 }
          }
          exit={
            panelMode === 'side_panel' 
              ? { x: '100%', opacity: 0 }
              : { opacity: 0, scale: 0.94, y: 20 }
          }
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl flex flex-col text-left overflow-hidden ${
            panelMode === 'side_panel'
              ? 'w-full max-w-xl h-full border-l border-indigo-900/40 rounded-none sm:rounded-l-2xl'
              : 'w-full max-w-3xl rounded-2xl max-h-[92vh] my-auto'
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="scanning-instructions-guide-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 text-white shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <span className="p-2 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded-xl shrink-0 flex items-center justify-center shadow-inner">
                <QrCode className="w-5 h-5 text-indigo-400" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 id="scanning-instructions-guide-title" className="text-sm sm:text-base font-bold font-mono tracking-tight uppercase text-white truncate">
                    Optical Scanner Instructions
                  </h2>
                  <span className="hidden sm:inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Field Guide
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans truncate mt-0.5">
                  Calibration metrics &amp; recommendations for sub-second optical detection
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Toggle Modal vs Side Panel */}
              <button
                type="button"
                onClick={() => setPanelMode(prev => prev === 'modal' ? 'side_panel' : 'modal')}
                className="hidden md:flex p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition cursor-pointer text-xs items-center gap-1 font-mono"
                title={panelMode === 'modal' ? 'Dock as right-side panel' : 'Switch to center modal'}
              >
                {panelMode === 'modal' ? (
                  <>
                    <Sidebar className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[10px]">Side Panel</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[10px]">Center Modal</span>
                  </>
                )}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close Scanning Instructions Guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Benchmark Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-5 py-3 bg-slate-950/80 border-b border-slate-800 text-center font-mono shrink-0">
            <div className="bg-slate-900/80 border border-slate-800/90 p-2 rounded-xl">
              <span className="text-[9px] text-slate-400 block uppercase font-bold">Optimal Distance</span>
              <span className="text-xs font-bold text-emerald-400 mt-0.5 block">15 – 30 cm</span>
              <span className="text-[8px] text-slate-500 font-sans">6 to 12 inches</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800/90 p-2 rounded-xl">
              <span className="text-[9px] text-slate-400 block uppercase font-bold">Scanning Angle</span>
              <span className="text-xs font-bold text-cyan-400 mt-0.5 block">0° Parallel</span>
              <span className="text-[8px] text-slate-500 font-sans">Perpendicular to code</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800/90 p-2 rounded-xl">
              <span className="text-[9px] text-slate-400 block uppercase font-bold">Lighting Mode</span>
              <span className="text-xs font-bold text-amber-400 mt-0.5 block">Diffused / Torch</span>
              <span className="text-[8px] text-slate-500 font-sans">Eliminate glare</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800/90 p-2 rounded-xl">
              <span className="text-[9px] text-slate-400 block uppercase font-bold">Zoom Preset</span>
              <span className="text-xs font-bold text-indigo-400 mt-0.5 block">2.0x Telephoto</span>
              <span className="text-[8px] text-slate-500 font-sans">For small dense labels</span>
            </div>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60 space-y-3 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scanning tips (e.g., glare, distance, zoom, thermal, ocr)..."
                className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Segmented Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono text-[11px]">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-indigo-600 text-white font-bold shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:bg-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Body: Tips List */}
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 font-sans text-xs">
            {filteredTips.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-300">No matching scanning instructions found</p>
                <p className="text-xs text-slate-500 font-sans">
                  Try clearing your search query or switching to &ldquo;All Tips&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-bold transition"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredTips.map((tip) => {
                  const Icon = tip.icon;
                  const isExpanded = expandedTipId === tip.id;
                  return (
                    <div
                      key={tip.id}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        {/* Tip Title & Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`p-1.5 rounded-lg border flex items-center justify-center shrink-0 ${tip.accentColor}`}>
                              <Icon className="w-4 h-4" />
                            </span>
                            <div>
                              <div className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                                Tip #{tip.number}
                              </div>
                              <h3 className="font-bold text-slate-100 text-xs sm:text-[13px] leading-tight">
                                {tip.title}
                              </h3>
                            </div>
                          </div>
                        </div>

                        {/* Summary & Recommendation */}
                        <p className="text-[11.5px] text-slate-300 font-medium leading-relaxed">
                          {tip.summary}
                        </p>
                        <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                          {tip.recommendation}
                        </p>
                      </div>

                      {/* Technical Metric Kicker */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span className="text-indigo-300/90 font-medium truncate">{tip.technicalMetric}</span>
                        <span className="text-slate-600">·</span>
                        <span className="uppercase text-[9px] text-slate-500">{tip.category}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Reference: Dos and Don'ts Table */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  Quick Field Reference: Dos &amp; Don&apos;ts
                </span>
                <span className="text-[10px] font-mono text-slate-500">ISO/IEC 18004 Standard</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* DO */}
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold font-mono text-xs">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Recommended Field Practices</span>
                  </div>
                  <ul className="space-y-1 text-slate-300 text-[11px] pl-1">
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400">✓</span>
                      <span>Keep the label flat and steady for ~250ms.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400">✓</span>
                      <span>Maintain ~20 cm distance with 2.0x digital zoom.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400">✓</span>
                      <span>Use Grayscale filter for faded thermal printouts.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400">✓</span>
                      <span>Use Torch in dim warehouses to eliminate shadowing.</span>
                    </li>
                  </ul>
                </div>

                {/* DON'T */}
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/20 text-rose-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold font-mono text-xs">
                    <X className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Common Optical Pitfalls</span>
                  </div>
                  <ul className="space-y-1 text-slate-300 text-[11px] pl-1">
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-400">✕</span>
                      <span>Scanning at steep angles (&gt;15°) that warp finder patterns.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-400">✕</span>
                      <span>Holding phone too close (&lt;10 cm) causing camera defocus blur.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-400">✕</span>
                      <span>Allowing bright ceiling bulbs to produce white glare spots.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-400">✕</span>
                      <span>Scanning crumpled packaging without smoothing the barcode area.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-5 sm:px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Real-time optical scanner is synchronized with General Ledger Thresholds</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {onLaunchCameraScanner && (
                <button
                  type="button"
                  id="guide-launch-camera-scanner-btn"
                  onClick={() => {
                    onClose();
                    onLaunchCameraScanner();
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Launch Camera Scanner</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ScanningInstructionsGuide;

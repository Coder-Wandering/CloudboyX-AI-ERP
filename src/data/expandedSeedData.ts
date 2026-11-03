/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Master Expanded Seed Dataset for CloudboyX Enterprise Suite
 * Retains complete state when exported to GitHub and stood up on new servers.
 */

import { Product, Partner, MapPolicy, ScanJob, NotificationAlert } from '../types';

export interface AuditLogEntry {
  id: string;
  productId: string;
  sku: string;
  type: 'compliance_update' | 'price_change' | 'registry' | 'enforcement';
  message: string;
  timestamp: string;
  details?: string;
  oldPrice?: number;
  newPrice?: number;
  user: string;
}

export interface ExpandedSeedData {
  products: Product[];
  partners: Partner[];
  policies: MapPolicy[];
  scans: ScanJob[];
  auditLogs: AuditLogEntry[];
  notifications: NotificationAlert[];
  resellers: any[];
  transactions: any[];
  journalEntries: any[];
  procurementPOs: any[];
  demoUsers: any[];
}

export const EXPANDED_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Apex Pro Mechanical Keyboard",
    sku: "APEX-PRO-MK1",
    mapPrice: 199.99,
    mapThresholdPercent: 85,
    customMapThresholdPercent: 85,
    description: "Professional mechanical keyboard with OmniPoint 2.0 adjustable hypermagnetic switches, OLED smart display, and aircraft-grade aluminum frame.",
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "2",
    name: "SoundWave Active ANC Headphones",
    sku: "SW-ANC-70",
    mapPrice: 299.99,
    mapThresholdPercent: 80,
    customMapThresholdPercent: 80,
    description: "Reference-class active noise cancelling wireless headphones with 40mm beryllium drivers, spatial audio tracking, and 50-hour battery life.",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "3",
    name: "ProFocus 4K Ultra Webcam",
    sku: "PF-4K-WEB",
    mapPrice: 149.99,
    mapThresholdPercent: 90,
    customMapThresholdPercent: 90,
    description: "Enterprise HDR 4K streaming and video conferencing camera with dual stereo beamforming noise-isolating microphones and auto-framing AI.",
    imageUrl: "https://images.unsplash.com/photo-1588702547919-26089e690ecd?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "4",
    name: "QuantumGlide Pro Gaming Mouse",
    sku: "QG-PRO-MS",
    mapPrice: 89.99,
    mapThresholdPercent: 75,
    customMapThresholdPercent: 75,
    description: "Ultra-lightweight 58g ergonomic wireless gaming mouse with 26,000 DPI optical sensor, optical switches, and zero-latency hyperspeed connection.",
    imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "5",
    name: "AeroForm Ergonomic Seat Cushion",
    sku: "AF-ERGO-PAD",
    mapPrice: 49.99,
    mapThresholdPercent: 80,
    customMapThresholdPercent: 80,
    description: "High-density orthopedic memory foam seat cushion engineered for executive office chairs with cooling gel layer and coccyx relief cut-out.",
    imageUrl: "https://images.unsplash.com/photo-1580481072645-022f9a6d1270?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "6",
    name: "CloudShield Edge 10GbE Security Gateway",
    sku: "CLD-EDGE-RTR",
    mapPrice: 899.00,
    mapThresholdPercent: 90,
    customMapThresholdPercent: 90,
    description: "Enterprise-grade multi-WAN firewall security appliance with 10GbE SFP+ uplinks, deep packet inspection, and hardware SSL offloading.",
    imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "7",
    name: "AuraGlow Pro Studio Lighting Kit",
    sku: "AURA-RGB-ST",
    mapPrice: 249.99,
    mapThresholdPercent: 85,
    customMapThresholdPercent: 85,
    description: "Dual-panel broadcast bi-color edge-lit studio keylight with wireless Wi-Fi app controls, 2800K-7000K temp, and CRI 97+ accuracy.",
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "8",
    name: "Titan Acoustics Lossless Hi-Fi DAC Amp",
    sku: "TITAN-DAC-99",
    mapPrice: 429.00,
    mapThresholdPercent: 85,
    customMapThresholdPercent: 85,
    description: "Balanced desktop digital-to-analog converter and headphone amplifier featuring dual ES9038PRO Sabre DAC chips and MQA full decoding.",
    imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "9",
    name: "Nexus Broadcast Dynamic XLR Microphone",
    sku: "NX-POD-MIC",
    mapPrice: 179.99,
    mapThresholdPercent: 85,
    customMapThresholdPercent: 85,
    description: "Cardioid studio dynamic podcast and voiceover microphone with built-in acoustic pop filter and electromagnetic shielding.",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "10",
    name: "Solaris Pure Sine 1500VA UPS Battery",
    sku: "SOLARIS-UPS",
    mapPrice: 349.99,
    mapThresholdPercent: 80,
    customMapThresholdPercent: 80,
    description: "Line-interactive pure sine wave 1500VA / 1000W rackmount uninterruptible power supply for enterprise datacenters and media servers.",
    imageUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "11",
    name: "VortexFlow 360 Liquid CPU Cooler",
    sku: "VORTEX-COOL",
    mapPrice: 189.99,
    mapThresholdPercent: 80,
    customMapThresholdPercent: 80,
    description: "Closed-loop 360mm tri-fan AIO liquid CPU cooler with customizable 2.4-inch IPS water block display and whisper-quiet magnetic levitation fans.",
    imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "12",
    name: "HyperDrive 4TB PCIe Gen5 NVMe SSD",
    sku: "HYPER-NVME-4",
    mapPrice: 319.99,
    mapThresholdPercent: 85,
    customMapThresholdPercent: 85,
    description: "Next-generation M.2 solid-state drive delivering up to 14,500 MB/s sequential read speeds with forged aluminum heatsink.",
    imageUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "13",
    name: "CyberKey FIPS-140-3 Hardware Token 5-Pack",
    sku: "SEC-HSM-KEY",
    mapPrice: 229.00,
    mapThresholdPercent: 90,
    customMapThresholdPercent: 90,
    description: "Phishing-resistant FIDO2 / WebAuthn dual-interface NFC and USB-C hardware authentication keys for zero-trust security postures.",
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "14",
    name: "UltraView 34\" Curved QD-OLED Master Display",
    sku: "VISION-OLED",
    mapPrice: 1199.99,
    mapThresholdPercent: 88,
    customMapThresholdPercent: 88,
    description: "34-inch ultrawide 3440x1440p Quantum Dot OLED creative production monitor with 175Hz refresh, 0.03ms response, and 99.3% DCI-P3 coverage.",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "15",
    name: "StratoWave Wi-Fi 7 Tri-Band Enterprise AP",
    sku: "STRATO-AP7",
    mapPrice: 449.00,
    mapThresholdPercent: 85,
    customMapThresholdPercent: 85,
    description: "High-density commercial access point with 320MHz channel bandwidth, 4x4 MU-MIMO, and PoE+ power delivery supporting 1000+ active client devices.",
    imageUrl: "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "16",
    name: "ChronoLens 4K Optical PTZ Conference Cam",
    sku: "CHRONO-CAM",
    mapPrice: 799.00,
    mapThresholdPercent: 85,
    customMapThresholdPercent: 85,
    description: "Professional boardroom Pan-Tilt-Zoom camera with 12x optical zoom, NDI|HX output, USB 3.0, and precision silent robotic movement.",
    imageUrl: "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "17",
    name: "ThunderHub Pro Dual 8K Thunderbolt 5 Dock",
    sku: "DOCK-TB5-PR",
    mapPrice: 349.00,
    mapThresholdPercent: 85,
    customMapThresholdPercent: 85,
    description: "16-in-1 universal docking station featuring 120Gbps bandwidth, 140W power delivery passthrough, 2.5Gbps Ethernet, and dual 8K display support.",
    imageUrl: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "18",
    name: "TactileCore 65% Wireless Hot-Swap Keyboard",
    sku: "TACT-KEY-MIN",
    mapPrice: 139.99,
    mapThresholdPercent: 80,
    customMapThresholdPercent: 80,
    description: "Compact 65% mechanical keyboard with factory-lubed linear switches, gasket-mount sound dampening, CNC anodized aluminum chassis, and Bluetooth 5.2.",
    imageUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "19",
    name: "Precision Acoustics 5\" Active Studio Monitors",
    sku: "AUDIO-REF-5",
    mapPrice: 599.00,
    mapThresholdPercent: 85,
    customMapThresholdPercent: 85,
    description: "Bi-amplified nearfield reference studio monitors (pair) with Kevlar woofers, DSP room correction EQ, and balanced XLR/TRS inputs.",
    imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "20",
    name: "SentryNode Industrial Edge IoT Gateway",
    sku: "SENTRY-IOT",
    mapPrice: 649.00,
    mapThresholdPercent: 90,
    customMapThresholdPercent: 90,
    description: "Ruggedized fanless DIN-rail gateway with RS485/Modbus telemetry, dual SIM 5G backup, and TPM 2.0 cryptographic isolation.",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80"
  }
];

export const EXPANDED_POLICIES: MapPolicy[] = [
  { id: "pol-1", name: "Standard Strict MAP Clause", description: "Zero advertised discounts permitted below product's specific MAP threshold.", allowedDiscountPercent: 0 },
  { id: "pol-2", name: "Tier-1 Partner 5% Allowance", description: "Permits up to a 5% promotional buffer for top-tier retail partners.", allowedDiscountPercent: 5 },
  { id: "pol-3", name: "Seasonal Black Friday 15% Co-op", description: "Seasonal clearance window allowing up to 15% markdown buffer for authorized inventory turns.", allowedDiscountPercent: 15 },
  { id: "pol-4", name: "Restricted Enterprise SKU Regulation", description: "Absolute zero-tolerance protection; violating leads to instant automatic distribution freeze.", allowedDiscountPercent: 0 }
];

export const EXPANDED_PARTNERS: Partner[] = [
  { 
    id: "p1", 
    name: "TechDelight Electronics", 
    domain: "bestbuy.com", 
    contactEmail: "compliance@bestbuy.com",
    contactPerson: "Sarah Jenkins",
    contactPhone: "+1 (555) 234-5678",
    associatedPolicies: ["pol-1"],
    associatedProducts: ["1", "2", "3", "7", "14"],
    complianceStatus: "compliant",
    onboardingDate: "2026-01-15T10:00:00.000Z",
    notes: "Tier-1 national retail partner fully compliant with standard core catalog policies.",
    mapThresholdPercent: 0,
    riskSensitivity: "critical"
  },
  { 
    id: "p2", 
    name: "GizmoMart Prime Marketplace", 
    domain: "amazon.com", 
    contactEmail: "partner-relations@gizmomart.com",
    contactPerson: "David Miller",
    contactPhone: "+1 (555) 876-5432",
    associatedPolicies: ["pol-2"],
    associatedProducts: ["1", "3", "4", "8", "12", "18"],
    complianceStatus: "violating",
    onboardingDate: "2026-02-05T14:30:00.000Z",
    notes: "Aggressive algorithmic repricer causing frequent automatic MAP violations on peripherals and storage.",
    mapThresholdPercent: 5,
    riskSensitivity: "critical"
  },
  { 
    id: "p3", 
    name: "NewEgg Partner World", 
    domain: "walmart.com", 
    contactEmail: "merchant@walmart-partner.com",
    contactPerson: "Amanda Ross",
    contactPhone: "+1 (555) 345-6789",
    associatedPolicies: ["pol-1", "pol-3"],
    associatedProducts: ["2", "5", "10", "11"],
    complianceStatus: "compliant",
    onboardingDate: "2026-02-18T09:15:00.000Z",
    notes: "Participates in authorized seasonal promotional pricing campaigns under policy pol-3.",
    mapThresholdPercent: 10,
    riskSensitivity: "low"
  },
  { 
    id: "p4", 
    name: "PixelPerfect Supplies", 
    domain: "target.com", 
    contactEmail: "procurement@pixelperfect.com",
    contactPerson: "Robert Chen",
    contactPhone: "+1 (555) 456-7890",
    associatedPolicies: ["pol-4"],
    associatedProducts: ["1", "4", "6", "13"],
    complianceStatus: "pending",
    onboardingDate: "2026-03-01T11:00:00.000Z",
    notes: "Onboarding under high-security enterprise SKU distribution agreement.",
    mapThresholdPercent: 2,
    riskSensitivity: "high"
  },
  { 
    id: "p5", 
    name: "DiscountDepot Global", 
    domain: "ebay.com", 
    contactEmail: "compliance@discountdepot.com",
    contactPerson: "Marcus Vance",
    contactPhone: "+1 (555) 567-8901",
    associatedPolicies: ["pol-2"],
    associatedProducts: ["1", "2", "3", "4", "5", "8", "9"],
    complianceStatus: "warning",
    onboardingDate: "2026-03-15T16:45:00.000Z",
    notes: "Secondary marketplace vendor flagged for unauthorized gray-market bundling.",
    mapThresholdPercent: 5,
    riskSensitivity: "medium"
  },
  { 
    id: "p6", 
    name: "Apex Micro Electronics", 
    domain: "microcenter.com", 
    contactEmail: "b2b-compliance@microcenter.com",
    contactPerson: "Jessica Liu",
    contactPhone: "+1 (555) 678-9012",
    associatedPolicies: ["pol-1"],
    associatedProducts: ["11", "12", "14", "17", "18"],
    complianceStatus: "compliant",
    onboardingDate: "2026-03-20T11:30:00.000Z",
    notes: "Brick-and-mortar technology superstore maintaining 100% pricing hygiene.",
    mapThresholdPercent: 0,
    riskSensitivity: "high"
  },
  { 
    id: "p7", 
    name: "ProPhoto & Studio Depot", 
    domain: "bhphotovideo.com", 
    contactEmail: "vendor-relations@bhphotovideo.com",
    contactPerson: "Eli Goldberg",
    contactPhone: "+1 (555) 789-0123",
    associatedPolicies: ["pol-1", "pol-4"],
    associatedProducts: ["3", "7", "8", "9", "16", "19"],
    complianceStatus: "compliant",
    onboardingDate: "2026-04-01T08:45:00.000Z",
    notes: "Authorized pro AV and broadcast channel. Excellent policy compliance record.",
    mapThresholdPercent: 0,
    riskSensitivity: "critical"
  },
  { 
    id: "p8", 
    name: "Enterprise Tech Direct", 
    domain: "cdw.com", 
    contactEmail: "commercial-partner@cdw.com",
    contactPerson: "Gregory Hayes",
    contactPhone: "+1 (555) 890-1234",
    associatedPolicies: ["pol-4"],
    associatedProducts: ["6", "10", "13", "15", "17", "20"],
    complianceStatus: "compliant",
    onboardingDate: "2026-04-10T13:20:00.000Z",
    notes: "Fortune 500 IT distributor handling high-end infrastructure SKUs.",
    mapThresholdPercent: 0,
    riskSensitivity: "critical"
  },
  { 
    id: "p9", 
    name: "Adorama Commercial Systems", 
    domain: "adorama.com", 
    contactEmail: "compliance@adorama.com",
    contactPerson: "Rachel Klein",
    contactPhone: "+1 (555) 901-2345",
    associatedPolicies: ["pol-2"],
    associatedProducts: ["3", "7", "9", "16"],
    complianceStatus: "warning",
    onboardingDate: "2026-04-22T15:10:00.000Z",
    notes: "Temporary warning issued for unauthorized open-box promotion on ChronoLens 4K.",
    mapThresholdPercent: 5,
    riskSensitivity: "medium"
  },
  { 
    id: "p10", 
    name: "Wholesale Digital Hub", 
    domain: "tigerdirect.com", 
    contactEmail: "sales-ops@tigerdirect.com",
    contactPerson: "Brian Gallagher",
    contactPhone: "+1 (555) 012-3456",
    associatedPolicies: ["pol-1"],
    associatedProducts: ["6", "10", "12", "15"],
    complianceStatus: "violating",
    onboardingDate: "2026-05-02T10:00:00.000Z",
    notes: "Breached floor price by $89 on StratoWave Wi-Fi 7 AP; Cease & Desist sent.",
    mapThresholdPercent: 0,
    riskSensitivity: "high"
  },
  { 
    id: "p11", 
    name: "EuroGadgets Direct DE", 
    domain: "amazon.de", 
    contactEmail: "europe-sales@amazon.de",
    contactPerson: "Klaus Weber",
    contactPhone: "+49 30 1234567",
    associatedPolicies: ["pol-1"],
    associatedProducts: ["1", "2", "4", "18"],
    complianceStatus: "compliant",
    onboardingDate: "2026-05-15T09:00:00.000Z",
    notes: "European Union distribution partner adhering to cross-border MAP commitments.",
    mapThresholdPercent: 0,
    riskSensitivity: "medium"
  },
  { 
    id: "p12", 
    name: "Global Apex Prime UK", 
    domain: "amazon.co.uk", 
    contactEmail: "compliance@amazon.co.uk",
    contactPerson: "Oliver Thorne",
    contactPhone: "+44 20 7946 0912",
    associatedPolicies: ["pol-1"],
    associatedProducts: ["2", "8", "9", "14"],
    complianceStatus: "compliant",
    onboardingDate: "2026-06-01T14:00:00.000Z",
    notes: "United Kingdom retail channel in full compliance.",
    mapThresholdPercent: 0,
    riskSensitivity: "medium"
  }
];

export const EXPANDED_SCANS: ScanJob[] = [
  {
    id: "scan-mock-01",
    productId: "1",
    productName: "Apex Pro Mechanical Keyboard",
    mapPrice: 199.99,
    status: "completed",
    startedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    finishedAt: new Date(Date.now() - 3600000 * 1.9).toISOString(),
    items: [
      { id: "item-1", partnerId: "p1", partnerName: "TechDelight Electronics", partnerDomain: "bestbuy.com", detectedPrice: 199.99, detectedUrl: "https://www.bestbuy.com/site/apex-pro-keyboard", snippet: "Apex Pro Mechanical Keyboard on sale for $199.99 with free next-day shipping.", status: "compliant" },
      { id: "item-2", partnerId: "p2", partnerName: "GizmoMart Prime Marketplace", partnerDomain: "amazon.com", detectedPrice: 174.99, detectedUrl: "https://www.amazon.com/dp/B08APEXPRO", snippet: "Save 12%! Apex Pro Gaming Keyboard deal price: $174.99 in stock.", status: "violating" },
      { id: "item-3", partnerId: "p3", partnerName: "NewEgg Partner World", partnerDomain: "walmart.com", detectedPrice: 199.99, detectedUrl: "https://www.walmart.com/ip/apex-pro-mk1", snippet: "In stock. Official retail price $199.99.", status: "compliant" },
      { id: "item-4", partnerId: "p5", partnerName: "DiscountDepot Global", partnerDomain: "ebay.com", detectedPrice: 179.99, detectedUrl: "https://www.ebay.com/itm/apex-pro-mk1-sealed", snippet: "Brand New Sealed Apex Pro MK1 - Buy It Now $179.99.", status: "violating" }
    ]
  },
  {
    id: "scan-mock-02",
    productId: "6",
    productName: "CloudShield Edge 10GbE Security Gateway",
    mapPrice: 899.00,
    status: "completed",
    startedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    finishedAt: new Date(Date.now() - 3600000 * 5.9).toISOString(),
    items: [
      { id: "item-5", partnerId: "p8", partnerName: "Enterprise Tech Direct", partnerDomain: "cdw.com", detectedPrice: 899.00, detectedUrl: "https://www.cdw.com/product/cloudshield-edge-10gbe", snippet: "Enterprise IT pricing: $899.00 per node with 3-year support.", status: "compliant" },
      { id: "item-6", partnerId: "p10", partnerName: "Wholesale Digital Hub", partnerDomain: "tigerdirect.com", detectedPrice: 819.00, detectedUrl: "https://www.tigerdirect.com/item/cld-edge-rtr", snippet: "Flash inventory reduction sale: CloudShield Edge Gateway $819.00.", status: "violating" }
    ]
  },
  {
    id: "scan-mock-03",
    productId: "8",
    productName: "Titan Acoustics Lossless Hi-Fi DAC Amp",
    mapPrice: 429.00,
    status: "completed",
    startedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    finishedAt: new Date(Date.now() - 3600000 * 11.8).toISOString(),
    items: [
      { id: "item-7", partnerId: "p7", partnerName: "ProPhoto & Studio Depot", partnerDomain: "bhphotovideo.com", detectedPrice: 429.00, detectedUrl: "https://www.bhphotovideo.com/c/product/titan-dac-99", snippet: "Audiophile reference DAC Amplifier: $429.00 free shipping.", status: "compliant" },
      { id: "item-8", partnerId: "p2", partnerName: "GizmoMart Prime Marketplace", partnerDomain: "amazon.com", detectedPrice: 389.00, detectedUrl: "https://www.amazon.com/dp/B09TITANDAC", snippet: "Special limited-time deal: $389.00 checkout discount.", status: "violating" },
      { id: "item-9", partnerId: "p12", partnerName: "Global Apex Prime UK", partnerDomain: "amazon.co.uk", detectedPrice: 429.00, detectedUrl: "https://www.amazon.co.uk/dp/B09TITANDAC", snippet: "Standard UK pricing: £339.00 (~$429.00 USD).", status: "compliant" }
    ]
  },
  {
    id: "scan-mock-04",
    productId: "14",
    productName: "UltraView 34\" Curved QD-OLED Master Display",
    mapPrice: 1199.99,
    status: "completed",
    startedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    finishedAt: new Date(Date.now() - 3600000 * 17.9).toISOString(),
    items: [
      { id: "item-10", partnerId: "p1", partnerName: "TechDelight Electronics", partnerDomain: "bestbuy.com", detectedPrice: 1199.99, detectedUrl: "https://www.bestbuy.com/site/ultraview-34-oled", snippet: "UltraView 34\" Master monitor in stock at Best Buy $1,199.99.", status: "compliant" },
      { id: "item-11", partnerId: "p6", partnerName: "Apex Micro Electronics", partnerDomain: "microcenter.com", detectedPrice: 1199.99, detectedUrl: "https://www.microcenter.com/product/ultraview-34", snippet: "In-store pickup & online shipping: $1,199.99.", status: "compliant" }
    ]
  },
  {
    id: "scan-mock-05",
    productId: "15",
    productName: "StratoWave Wi-Fi 7 Tri-Band Enterprise AP",
    mapPrice: 449.00,
    status: "completed",
    startedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    finishedAt: new Date(Date.now() - 3600000 * 23.8).toISOString(),
    items: [
      { id: "item-12", partnerId: "p8", partnerName: "Enterprise Tech Direct", partnerDomain: "cdw.com", detectedPrice: 449.00, detectedUrl: "https://www.cdw.com/product/stratowave-ap7", snippet: "CDW commercial contract price: $449.00 per unit.", status: "compliant" },
      { id: "item-13", partnerId: "p10", partnerName: "Wholesale Digital Hub", partnerDomain: "tigerdirect.com", detectedPrice: 389.00, detectedUrl: "https://www.tigerdirect.com/item/strato-ap7", snippet: "Huge savings on Wi-Fi 7 AP: Only $389.00 while supplies last.", status: "violating" }
    ]
  },
  {
    id: "scan-mock-06",
    productId: "3",
    productName: "ProFocus 4K Ultra Webcam",
    mapPrice: 149.99,
    status: "completed",
    startedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    finishedAt: new Date(Date.now() - 3600000 * 29.8).toISOString(),
    items: [
      { id: "item-14", partnerId: "p1", partnerName: "TechDelight Electronics", partnerDomain: "bestbuy.com", detectedPrice: 149.99, detectedUrl: "https://www.bestbuy.com/site/profocus-4k", snippet: "ProFocus 4K webcam official price $149.99.", status: "compliant" },
      { id: "item-15", partnerId: "p2", partnerName: "GizmoMart Prime Marketplace", partnerDomain: "amazon.com", detectedPrice: 134.99, detectedUrl: "https://www.amazon.com/dp/B07PROFOCUS", snippet: "Amazon Choice Deal: $134.99 for limited time.", status: "violating" },
      { id: "item-16", partnerId: "p7", partnerName: "ProPhoto & Studio Depot", partnerDomain: "bhphotovideo.com", detectedPrice: 149.99, detectedUrl: "https://www.bhphotovideo.com/c/product/profocus-4k", snippet: "In stock. Price is $149.99.", status: "compliant" }
    ]
  },
  {
    id: "scan-mock-07",
    productId: "2",
    productName: "SoundWave Active ANC Headphones",
    mapPrice: 299.99,
    status: "completed",
    startedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    finishedAt: new Date(Date.now() - 3600000 * 35.8).toISOString(),
    items: [
      { id: "item-17", partnerId: "p1", partnerName: "TechDelight Electronics", partnerDomain: "bestbuy.com", detectedPrice: 299.99, detectedUrl: "https://www.bestbuy.com/site/soundwave-anc", snippet: "SoundWave ANC headphones: $299.99.", status: "compliant" },
      { id: "item-18", partnerId: "p3", partnerName: "NewEgg Partner World", partnerDomain: "walmart.com", detectedPrice: 299.99, detectedUrl: "https://www.walmart.com/ip/soundwave-anc", snippet: "Walmart official listing: $299.99.", status: "compliant" },
      { id: "item-19", partnerId: "p11", partnerName: "EuroGadgets Direct DE", partnerDomain: "amazon.de", detectedPrice: 299.99, detectedUrl: "https://www.amazon.de/dp/B08SOUNDWAVE", snippet: "Unverbindliche Preisempfehlung: €279.00 (~$299.99).", status: "compliant" }
    ]
  },
  {
    id: "scan-mock-08",
    productId: "12",
    productName: "HyperDrive 4TB PCIe Gen5 NVMe SSD",
    mapPrice: 319.99,
    status: "completed",
    startedAt: new Date(Date.now() - 3600000 * 42).toISOString(),
    finishedAt: new Date(Date.now() - 3600000 * 41.8).toISOString(),
    items: [
      { id: "item-20", partnerId: "p6", partnerName: "Apex Micro Electronics", partnerDomain: "microcenter.com", detectedPrice: 319.99, detectedUrl: "https://www.microcenter.com/product/hyperdrive-4tb", snippet: "Micro Center DIY Component price: $319.99.", status: "compliant" },
      { id: "item-21", partnerId: "p2", partnerName: "GizmoMart Prime Marketplace", partnerDomain: "amazon.com", detectedPrice: 299.99, detectedUrl: "https://www.amazon.com/dp/B0CHYPER4TB", snippet: "Underpricing breach: $299.99 instant coupon applied.", status: "violating" }
    ]
  }
];

export const EXPANDED_NOTIFICATIONS: NotificationAlert[] = [
  {
    id: "notif-01",
    productId: "1",
    productName: "Apex Pro Mechanical Keyboard",
    sku: "APEX-PRO-MK1",
    partnerId: "p2",
    partnerName: "GizmoMart Prime Marketplace",
    partnerDomain: "amazon.com",
    mapPrice: 199.99,
    detectedPrice: 174.99,
    sentAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    recipientEmail: "partner-relations@gizmomart.com",
    recipientType: "partner",
    subject: "URGENT: Formal Minimum Advertised Price (MAP) Infraction Notice - APEX-PRO-MK1",
    body: "Dear Store Operations Team,\n\nOur continuous automated marketplace crawlers detected an active advertised pricing breach on amazon.com.\n\n* Monitored Channel: GizmoMart Prime Marketplace (amazon.com)\n* Product: Apex Pro Mechanical Keyboard (APEX-PRO-MK1)\n* Advertised Price Detected: $174.99\n* Authorized MAP Limit: $199.99\n* Deficit Gap: -$25.00 (-12.5%)\n\nPlease correct this public listing within 24 hours to prevent distribution suspension.",
    status: "delivered"
  },
  {
    id: "notif-02",
    productId: "1",
    productName: "Apex Pro Mechanical Keyboard",
    sku: "APEX-PRO-MK1",
    partnerId: "p2",
    partnerName: "GizmoMart Prime Marketplace",
    partnerDomain: "amazon.com",
    mapPrice: 199.99,
    detectedPrice: 174.99,
    sentAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    recipientEmail: "compliance@cloudboyx.com",
    recipientType: "admin",
    subject: "CRITICAL ALERT: Automated Cease & Desist Triggered for GizmoMart Online",
    body: "The MAP Defense Engine detected an intentional repricer drop on amazon.com for APEX-PRO-MK1. Formal notice dispatched. Discrepancy logged in audit trail.",
    status: "delivered"
  },
  {
    id: "notif-03",
    productId: "6",
    productName: "CloudShield Edge 10GbE Security Gateway",
    sku: "CLD-EDGE-RTR",
    partnerId: "p10",
    partnerName: "Wholesale Digital Hub",
    partnerDomain: "tigerdirect.com",
    mapPrice: 899.00,
    detectedPrice: 819.00,
    sentAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    recipientEmail: "sales-ops@tigerdirect.com",
    recipientType: "partner",
    subject: "CEASE & DESIST: MAP Policy Violation Notice - CLD-EDGE-RTR",
    body: "Notice of Non-Compliance: TigerDirect listing for CloudShield Edge Gateway was scraped at $819.00, breaching our contractual minimum floor of $899.00. Immediate remediation required.",
    status: "delivered"
  },
  {
    id: "notif-04",
    productId: "15",
    productName: "StratoWave Wi-Fi 7 Tri-Band Enterprise AP",
    sku: "STRATO-AP7",
    partnerId: "p10",
    partnerName: "Wholesale Digital Hub",
    partnerDomain: "tigerdirect.com",
    mapPrice: 449.00,
    detectedPrice: 389.00,
    sentAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    recipientEmail: "sales-ops@tigerdirect.com",
    recipientType: "partner",
    subject: "SECOND NOTICE: Critical Price Violation on StratoWave AP7",
    body: "Advertised price of $389.00 is $60 below the minimum authorized policy floor. 12-hour curative window remaining.",
    status: "delivered"
  }
];

export const EXPANDED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "log-01",
    productId: "1",
    sku: "APEX-PRO-MK1",
    type: "compliance_update",
    message: "Automated scan finished: 2 violations detected on amazon.com ($174.99) and ebay.com ($179.99).",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    details: "bestbuy.com (compliant), amazon.com (violating), walmart.com (compliant), ebay.com (violating)",
    user: "Automated Protection Engine"
  },
  {
    id: "log-02",
    productId: "6",
    sku: "CLD-EDGE-RTR",
    type: "enforcement",
    message: "Cease & Desist warning letter dispatched to Wholesale Digital Hub (tigerdirect.com).",
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    details: "Detected: $819.00 | Floor: $899.00 | Gap: -$80.00",
    user: "Compliance Operations Daemon"
  },
  {
    id: "log-03",
    productId: "8",
    sku: "TITAN-DAC-99",
    type: "compliance_update",
    message: "Compliance scan finished: 1 breach flagged on amazon.com ($389.00).",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    details: "bhphotovideo.com (compliant), amazon.com (violating), amazon.co.uk (compliant)",
    user: "Automated Protection Engine"
  },
  {
    id: "log-04",
    productId: "14",
    sku: "VISION-OLED",
    type: "compliance_update",
    message: "Ecosystem scan verified 100% price integrity across Best Buy and Micro Center.",
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    details: "All monitored channels listing at or above $1,199.99",
    user: "Automated Protection Engine"
  },
  {
    id: "log-05",
    productId: "15",
    sku: "STRATO-AP7",
    type: "price_change",
    message: "MAP Threshold updated from $429.00 to $449.00.",
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    oldPrice: 429.00,
    newPrice: 449.00,
    user: "Sarah Vance, Compliance Lead"
  },
  {
    id: "log-06",
    productId: "12",
    sku: "HYPER-NVME-4",
    type: "registry",
    message: "SKU registered into real-time MAP Shield with $319.99 threshold floor.",
    timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
    user: "Catalog Operations Admin"
  }
];

export const EXPANDED_RESELLERS = [
  { id: 'resell-1', name: 'Acme Distribution', domain: 'acme-reselling.com', status: 'Authorized', rate_limit: 500, orders_count: 142, last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 'resell-2', name: 'Global Apex Prime UK', domain: 'apex-import.co.uk', status: 'Authorized', rate_limit: 1000, orders_count: 87, last_active: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
  { id: 'resell-3', name: 'Shadow Wholesale Inc.', domain: 'shadow-bulk.net', status: 'Pending', rate_limit: 100, orders_count: 0, last_active: 'Never' },
  { id: 'resell-4', name: 'Calypso Retail Node', domain: 'calypso-shop.org', status: 'Revoked', rate_limit: 250, orders_count: 12, last_active: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'resell-5', name: 'TechStream Enterprise', domain: 'techstream-b2b.com', status: 'Authorized', rate_limit: 750, orders_count: 215, last_active: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
  { id: 'resell-6', name: 'Nordic Hardware Group', domain: 'nordic-hw.se', status: 'Authorized', rate_limit: 500, orders_count: 64, last_active: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  { id: 'resell-7', name: 'Pacific Rim Logistics', domain: 'pacrim-tech.com.au', status: 'Authorized', rate_limit: 600, orders_count: 98, last_active: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
  { id: 'resell-8', name: 'Silverstone Supply Co', domain: 'silverstone-wholesale.com', status: 'Pending', rate_limit: 200, orders_count: 3, last_active: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
];

export const EXPANDED_PROCUREMENT_POS = [
  {
    id: "PO-2026-608",
    entity: "CloudboyX Americas LLC",
    department: "Operations & Engineering",
    costCenter: "CC-900",
    vendorName: "Apex Logistics Supply",
    vendorEmail: "billing@apexlogistics.com",
    items: [
      { id: "i-1", sku: "STEEL-RIVET-100", name: "Industrial Grade Reinforced Steel Rivets", quantity: 500, unitPrice: 15 },
      { id: "i-2", sku: "CAB-FBR-OP", name: "Fiber Optic High-Speed Network Cabling (100m)", quantity: 15, unitPrice: 3200 }
    ],
    totalAmount: 55500,
    status: "PAID",
    approvalChain: [
      { role: "Requestor (Engineer Julie)", approverEmail: "julie@cloudboyx.net", status: "APPROVED", comment: "Network expansion materials", actionDate: "2026-06-15T09:00:00Z" },
      { role: "Department Chief (Head of Ops)", approverEmail: "ops-boss@cloudboyx.net", status: "APPROVED", comment: "Approved. Essential infrastructure.", actionDate: "2026-06-15T10:15:00Z" },
      { role: "CFO (Financial Director)", approverEmail: "clara-cfo@cloudboyx.net", status: "APPROVED", comment: "Verified budget availability.", actionDate: "2026-06-15T11:00:00Z" }
    ],
    currentApprovalLevel: 3,
    createdAt: "2026-06-15T08:30:00Z",
    updatedAt: "2026-06-15T11:30:00Z",
    commitmentTxId: "tx-po-commit-608",
    matchingTxId: "tx-po-gr-608",
    paymentTxId: "tx-po-pay-608"
  },
  {
    id: "PO-2026-724",
    entity: "CloudboyX Europe GmbH",
    department: "Research & Development",
    costCenter: "CC-801",
    vendorName: "München Lab Instruments",
    vendorEmail: "europe@munichlab.de",
    items: [
      { id: "i-3", sku: "LAB-PH-SENS", name: "Precision pH Electrochemical Sensor probes", quantity: 4, unitPrice: 12500 }
    ],
    totalAmount: 50000,
    status: "COMMITTED",
    approvalChain: [
      { role: "Requestor (Lab Tech)", approverEmail: "tech-clara@cloudboyx.net", status: "APPROVED", comment: "pH probes calibration replenishment", actionDate: "2026-06-16T14:22:00Z" },
      { role: "Department Chief (Head of R&D)", approverEmail: "rd-chief@cloudboyx.net", status: "APPROVED", comment: "Crucial for clinical test stream.", actionDate: "2026-06-16T15:10:00Z" },
      { role: "CFO (Financial Director)", approverEmail: "clara-cfo@cloudboyx.net", status: "APPROVED", comment: "Budget verified for Q3 R&D.", actionDate: "2026-06-16T16:00:00Z" }
    ],
    currentApprovalLevel: 3,
    createdAt: "2026-06-16T14:00:00Z",
    updatedAt: "2026-06-16T16:00:00Z"
  },
  {
    id: "PO-2026-891",
    entity: "CloudboyX Asia-Pacific Ltd",
    department: "Server Architecture",
    costCenter: "CC-440",
    vendorName: "Tokyo Semiconductor Foundry",
    vendorEmail: "b2b@tokyofoundry.co.jp",
    items: [
      { id: "i-4", sku: "CHIP-FPGA-8", name: "Custom PCIe Accelerated Neural DSP Co-Processors", quantity: 20, unitPrice: 45000 }
    ],
    totalAmount: 900000,
    status: "APPROVED",
    approvalChain: [
      { role: "Requestor (Lead Architect Kenji)", approverEmail: "kenji@cloudboyx.jp", status: "APPROVED", comment: "Next-gen cluster acceleration", actionDate: "2026-06-18T03:00:00Z" },
      { role: "Department Chief (VP of Hardware)", approverEmail: "vp-hw@cloudboyx.jp", status: "APPROVED", comment: "Approved against capital expenditure cap.", actionDate: "2026-06-18T05:30:00Z" },
      { role: "CFO (Financial Director)", approverEmail: "clara-cfo@cloudboyx.net", status: "PENDING", comment: "", actionDate: "" }
    ],
    currentApprovalLevel: 2,
    createdAt: "2026-06-18T02:00:00Z",
    updatedAt: "2026-06-18T05:30:00Z"
  }
];

export const DEMO_TEST_USERS = [
  {
    id: 'usr-test-01',
    name: 'CloudboyX Test Administrator',
    email: 'test@cloudboyx.com',
    company: 'CloudboyX Enterprise Test Lab',
    planType: 'full_suite',
    modules: JSON.stringify(['ledger', 'ingress', 'procurement', 'map_protection', 'predict', 'design']),
    billingCycle: 'annual',
    securityTier: 'cybershield_sovereign',
    monthlyPrice: 959,
    salt: 'cloudboyx_test_salt_99',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-demo-01',
    name: 'Elena Vance, CPA',
    email: 'elena.vance@omniretail.global',
    company: 'OmniRetail Global Enterprise',
    planType: 'full_suite',
    modules: JSON.stringify(['ledger', 'ingress', 'procurement', 'map_protection', 'predict']),
    billingCycle: 'annual',
    securityTier: 'cybershield_sovereign',
    monthlyPrice: 959,
    salt: 'cloudboyx_salt_demo',
    createdAt: new Date().toISOString()
  }
];

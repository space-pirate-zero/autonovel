export type DesignSystem = "neon" | "phosphor" | "leopard" | "stealth" | "cathode";
export type ProductType = "flagship" | "platform" | "saas" | "consumer" | "tool" | "game" | "infra" | "entertainment";
export type ProductStatus = "live" | "beta" | "development" | "docs";

export interface Feature {
  title: string;
  description: string;
  icon: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  heroDescription: string;
  pressQuote: string;
  type: ProductType;
  designSystem: DesignSystem;
  stack: string[];
  status: ProductStatus;
  subdomain: string;
  domain: string;
  icon: string;
  color: string;
  accentColor: string;
  features: Feature[];
  highlights: string[];
  platforms: string[];
  heroImage?: string;
  screenshot?: string; // real product screenshot for the grid card
  comingSoon?: boolean; // blurred card + "coming soon" overlay
  liveUrl?: string; // confirmed-live public site; links fall back to internal /products/{id}
  buyUrl?: string; // direct purchase page (renders a Buy CTA in the hero)
  buyLabel?: string; // label for the Buy CTA, e.g. "Buy OSMIX Classic"
}

/**
 * The safe outbound URL for a product. Only products with a confirmed-live
 * public site (`liveUrl`) link out; everything else routes to its internal
 * commercial landing page (`/sites/{id}`, which always renders) so we never
 * ship a dead link to an unconfigured `{subdomain}.spaceshipalpha9.co`.
 */
export function productHref(product: Pick<Product, "id" | "liveUrl">): string {
  return product.liveUrl ?? `/sites/${product.id}`;
}

export const products: Product[] = [
  {
    id: "spz",
    name: "Space Pirate Zero",
    tagline: "One indie studio is quietly building the future of software.",
    description:
      "The flagship brand of Spaceship Alpha 9 — an independent software studio shipping 6 products across AI, music, fashion, gaming, privacy, and infrastructure. No investors. No board. No permission required.",
    heroDescription:
      "AI-native software studio. Six products. Zero venture capital. We build AI that doesn't suck — from fashion intelligence to counter-surveillance tools. If it can be built, we ship it.",
    pressQuote: "One indie studio. Six products. Zero venture capital. The most ambitious software operation you've never heard of.",
    type: "flagship",
    designSystem: "neon",
    stack: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS 4", "Docker", "GKE"],
    status: "live",
    subdomain: "www",
    domain: "spaceshipalpha9.co",
    icon: "🏴‍☠️",
    color: "#ff1493",
    accentColor: "#00f0ff",
    heroImage: "/images/sa9-hero-tentacles.png",
    platforms: ["Web"],
    highlights: [
      "6 AI-native products shipping from one studio",
      "Zero VC funding — bootstrapped and independent",
      "AI built into every product, not bolted on",
      "Full-stack: Web, iOS, macOS, tvOS, Android, CLI",
    ],
    features: [
      { title: "6-Product Ecosystem", description: "Fashion AI, VM orchestration, K8s tooling, music production, counter-surveillance, and proximity marketing — all built on shared identity and analytics.", icon: "🚀" },
      { title: "One Rust + Swift Core", description: "Native engines where it counts: Osmix's Rust audio pipeline, GhostDeck's Swift virtualization, TradeCraft's on-device crypto. Performance is a feature.", icon: "🦀" },
      { title: "5 Design Systems", description: "NEON (cyberpunk), PHOSPHOR (terminal), LEOPARD (fashion), STEALTH (minimal), CATHODE (retro TV). Each product gets a bespoke visual identity.", icon: "🎨" },
      { title: "AI-Native Development", description: "Claude isn't a tool — it's the first mate. AI writes code, tests usability, generates content, and catches bugs at every stage.", icon: "🤖" },
      { title: "IRONCLAD Quality", description: "Every commit passes type checks, lint, tests, and accessibility audits. Every component uses design tokens. No shortcuts.", icon: "🛡️" },
      { title: "Built in Public", description: "Obfuscated check-ins, snarky progress updates, and transparent development. Follow the journey on GitHub, LinkedIn, and Bluesky.", icon: "📡" },
    ],
  },
  {
    id: "stylelift",
    name: "StyleLift",
    tagline: "The AI stylist that learns what you actually like.",
    description:
      "StyleLift uses computer vision and behavioral AI to decode your personal style DNA, then delivers outfit recommendations that feel handpicked by a stylist who's known you for years.",
    heroDescription:
      "Fashion tech has been promising AI styling for a decade and delivering glorified recommendation engines. StyleLift is different. Our system builds a 512-dimensional style vector from just 12 questions — mapping your body type, color harmony, lifestyle, and aesthetic preferences into a living profile that gets smarter every day. Virtual try-on with realistic fabric physics. Budget-aware curation. And a social layer where style is shared, not sold.",
    pressQuote: "What Stitch Fix promised. What AI can actually deliver.",
    type: "consumer",
    designSystem: "leopard",
    stack: ["Next.js 15", "FastAPI", "PostgreSQL", "Claude API", "GKE", "Swift 6"],
    status: "beta",
    subdomain: "stylelift",
    domain: "stylelift.fashion",
    liveUrl: "https://stylelift.fashion",
    icon: "👗",
    color: "#ff1493",
    accentColor: "#ff69b4",
    screenshot: "/images/products/stylelift.png",
    platforms: ["Web", "iOS", "tvOS"],
    highlights: [
      "512-dimensional style DNA profiling in under 60 seconds",
      "AR virtual try-on with realistic fabric physics",
      "Budget-optimized capsule wardrobes",
      "Social style boards with community discovery",
    ],
    features: [
      { title: "Style DNA Engine", description: "12 questions. 512 dimensions. Maps body type, color harmony, lifestyle, and aesthetic preferences into a living profile.", icon: "🧬" },
      { title: "Virtual Try-On", description: "AR-powered fitting with realistic fabric drape, lighting, and movement — no changing room required.", icon: "📱" },
      { title: "Smart Wardrobe Sync", description: "Photograph your closet. Get outfit suggestions using what you own plus strategic new additions.", icon: "👔" },
      { title: "Curated Collections", description: "AI collections that evolve with your taste. Seasonal refreshes and budget-optimized capsule wardrobes.", icon: "✨" },
      { title: "Social Style Boards", description: "Share outfit boards, get feedback, discover community styles. Fashion as a social experience.", icon: "📋" },
      { title: "Budget Optimizer", description: "Maximize outfit variety with cost-per-wear analysis and strategic sale alerts.", icon: "💰" },
    ],
  },
  {
    id: "ghostdeck",
    name: "GhostDeck",
    tagline: "The VM manager that makes Docker Desktop look expensive.",
    description:
      "Native macOS VM orchestration using Apple's Virtualization.framework. 89 MCP tools for AI automation, Bonjour mesh networking, and sub-100ms snapshots.",
    heroDescription:
      "VMware costs $300/year. Parallels charges $130. Docker Desktop wants $21/month. GhostDeck costs nothing — built on Apple's native Virtualization.framework. 89 MCP tools let AI agents create, configure, and destroy VMs autonomously. Bonjour mesh networking. Sub-100ms snapshot restore. Developer tooling built by developers, not sales teams.",
    pressQuote: "89 MCP tools. 1,571 tests. Zero license fees. The most AI-ready VM manager on macOS.",
    type: "tool",
    designSystem: "stealth",
    stack: ["Swift 6", "Virtualization.framework", "SwiftUI", "Bonjour", "MCP SDK"],
    status: "beta",
    subdomain: "ghostdeck",
    domain: "ghostdeck.dev",
    icon: "👻",
    color: "#ffffff",
    accentColor: "#888888",
    screenshot: "/images/products/ghostdeck.png",
    platforms: ["macOS"],
    highlights: [
      "89 MCP tools for AI-powered VM automation",
      "Apple Virtualization.framework — native speed, zero overhead",
      "Bonjour mesh networking for multi-VM clusters",
      "Snapshot and restore in under 100ms",
    ],
    features: [
      { title: "One-Click Linux", description: "Ubuntu, Fedora, Debian, Arch — ready in 30 seconds. No ISO hunting.", icon: "🐧" },
      { title: "89 MCP Tools", description: "Most comprehensive MCP integration on any VM manager. Full AI-powered automation.", icon: "🤖" },
      { title: "Bonjour Mesh", description: "VMs auto-discover each other. Multi-node clusters and production topology simulation.", icon: "🔗" },
      { title: "Instant Snapshots", description: "Create and restore in under 100ms. Branch, experiment, roll back.", icon: "📸" },
      { title: "Container Runtime", description: "Docker containers in lightweight VMs. Full OCI compatibility. No Docker Desktop.", icon: "📦" },
      { title: "Resource Governor", description: "Dynamic CPU, memory, disk allocation with live migration.", icon: "⚙️" },
    ],
  },
  {
    id: "darkwave",
    name: "DARKWAVE",
    tagline: "Kubernetes for humans. Not for consultants.",
    description:
      "Terminal-first K8s management with a CRT dashboard. One-command clusters, GitOps, cost optimization, and monitoring that belongs in a submarine.",
    heroDescription:
      "Kubernetes shouldn't require a $200k platform engineer. DARKWAVE is terminal-first K8s with a phosphor-green CRT dashboard. One-command clusters. GitOps that works. Cost optimization that saves real money. Infrastructure that feels like piloting a spacecraft.",
    pressQuote: "What if Kubernetes had good UX? Now it does.",
    type: "infra",
    designSystem: "phosphor",
    stack: ["Go", "Next.js 15", "Kubernetes", "Helm", "OPA", "WebSocket"],
    status: "development",
    subdomain: "darkwave",
    domain: "darkwave.dev",
    icon: "🌊",
    color: "#00ff41",
    accentColor: "#00ff41",
    screenshot: "/images/products/darkwave.png",
    platforms: ["CLI", "Web"],
    highlights: [
      "One-command cluster provisioning",
      "CRT-styled real-time monitoring",
      "GitOps with ArgoCD",
      "Cost optimization that pays for itself",
    ],
    features: [
      { title: "CRT Dashboard", description: "Phosphor-green terminal monitoring. Pod health, nodes, network in one screen.", icon: "🖥️" },
      { title: "One-Click Clusters", description: "Production-ready on AWS, GCP, Azure, or bare metal. Zero YAML hell.", icon: "🔧" },
      { title: "GitOps Pipeline", description: "ArgoCD integration. Deploy on push, branch environments, instant rollback.", icon: "🔄" },
      { title: "Cost Optimizer", description: "Real-time analysis with actionable savings. Right-size, spot waste, auto-scale.", icon: "💸" },
      { title: "OPA Policies", description: "Security and compliance enforcement across clusters. Block bad deploys.", icon: "🛡️" },
      { title: "Incident Commander", description: "Correlated alerts, runbooks, one-click rollbacks.", icon: "🚨" },
    ],
  },
  {
    id: "brand-casino",
    name: "Brand Casino",
    tagline: "Turn foot traffic into brand fanatics.",
    description:
      "Gamified proximity marketing with NFC, BLE beacons, and AR. Turn physical spaces into brand experiences with real-time analytics.",
    heroDescription:
      "Walk past a store. Phone buzzes with a scratch-off. Brand Casino turns spaces into gamified marketing machines. NFC tap-to-play. BLE beacons with 50-meter precision. AR overlays. Real-time analytics from impression to purchase. Marketing that doesn't feel like marketing.",
    pressQuote: "Gamified proximity marketing that turns sidewalks into slot machines.",
    type: "platform",
    designSystem: "neon",
    stack: ["Swift 6", "Kotlin", "Go", "Rust", "Kubernetes", "PostgreSQL"],
    status: "development",
    subdomain: "brand-casino",
    domain: "brandcasino.io",
    icon: "🎰",
    color: "#ff6a00",
    accentColor: "#faff00",
    screenshot: "/images/products/brand-casino.png",
    comingSoon: true,
    platforms: ["iOS", "Android", "Web"],
    highlights: [
      "NFC tap-to-play — no app required",
      "BLE beacons with 50m precision",
      "AR brand experiences",
      "Full-funnel conversion analytics",
    ],
    features: [
      { title: "NFC Tap-to-Play", description: "Tap tag, launch branded game. No app download.", icon: "📲" },
      { title: "BLE Beacons", description: "Targeted game invitations. 50-meter geofencing.", icon: "📡" },
      { title: "AR Overlays", description: "Camera-activated AR games and brand experiences.", icon: "🥽" },
      { title: "Game Builder", description: "Drag-and-drop. Scratch-offs, wheels, trivia, hunts.", icon: "🎮" },
      { title: "Conversion Analytics", description: "Full funnel tracking. A/B test mechanics.", icon: "📊" },
      { title: "Prize Management", description: "Pools, win rates, POS integration.", icon: "🎁" },
    ],
  },
  {
    id: "tradecraft",
    name: "TradeCraft",
    tagline: "They watch everything. Now you watch back.",
    description:
      "Counter-surveillance: 85+ tools, 12 domains. RF analysis, IMSI detection, encrypted mesh, evidence preservation. Zero-knowledge.",
    heroDescription:
      "85+ tools across 12 operational domains. RF spectrum, IMSI catchers, hidden cameras, encrypted BLE mesh, tamper-proof evidence. Zero-knowledge architecture: no accounts, no analytics, no telemetry. Privacy isn't a feature — it's the foundation.",
    pressQuote: "85 counter-surveillance tools. Zero knowledge of who uses them.",
    type: "tool",
    designSystem: "neon",
    stack: ["Swift 6", "SwiftUI", "CoreBluetooth", "Noise Protocol", "Nostr", "Tor"],
    status: "development",
    subdomain: "tradecraft",
    domain: "tradecraft.tools",
    icon: "🛡️",
    color: "#00f0ff",
    accentColor: "#39ff14",
    screenshot: "/images/products/tradecraft.png",
    platforms: ["iOS", "macOS"],
    highlights: [
      "85+ tools, 12 domains",
      "Zero-knowledge architecture",
      "Encrypted BLE mesh (7-hop)",
      "Panic protocol + dead man's switch",
    ],
    features: [
      { title: "Signal Radar", description: "Real-time RF spectrum. Compass, AR overlay, waterfall.", icon: "📡" },
      { title: "Stingray Hunter", description: "IMSI catcher detection via anomaly analysis.", icon: "🔍" },
      { title: "Secure Comms", description: "BLE mesh, Nostr, WiFi Direct, Tor. No servers.", icon: "🔐" },
      { title: "Camera Hunter", description: "IR scanning, network analysis, RF fingerprinting.", icon: "📷" },
      { title: "Panic Protocol", description: "Wipe, alert, decoy, dead man's switch.", icon: "🚨" },
      { title: "Evidence Locker", description: "SHA-256 hash chains. Court-admissible.", icon: "📦" },
    ],
  },
  {
    id: "osmix",
    name: "OSMIX",
    tagline: "Suno gives you stems. Osmix gives you a session.",
    description:
      "The bridge between AI music generators and professional audio. Drop in an MP3 from Suno; Osmix returns a full multi-DAW session — separated stems, drum classification, tempo map, MIDI, and a master tuned to your destination's loudness target.",
    heroDescription:
      "SA9's Atomic music suite grew up. Osmix is one Rust engine across six surfaces: analyze (tempo, key, structure), separate (Demucs), classify per-onset drums, repair AI artifacts, extract MIDI, and master to EBU R128 — then write Reaper, Ableton, Logic, and Pro Tools sessions. Not a stub: real DSP, 185+ passing tests. The Atomic Sound / Video / Distro work SA9 pioneered is now Osmix's flagship engine.",
    pressQuote: "One Rust engine. Six surfaces. Suno in, a real session out.",
    type: "consumer",
    designSystem: "neon",
    stack: ["Rust", "Temporal", "Demucs", "ebur128", "CLI", "HTTP API"],
    status: "beta",
    subdomain: "osmix",
    domain: "osmix.com",
    buyUrl: "https://osmix.com/buy",
    buyLabel: "Buy OSMIX Classic",
    icon: "🎛️",
    color: "#bf5fff",
    accentColor: "#00f0ff",
    screenshot: "/images/products/osmix.png",
    platforms: ["macOS", "Web", "CLI"],
    highlights: [
      "Suno MP3 in → multi-DAW session out",
      "Real DSP engine — 185+ passing tests",
      "Demucs stem separation + per-onset drum classification",
      "EBU R128 master + Reaper / Ableton / Logic / Pro Tools writers",
    ],
    features: [
      { title: "Analyze", description: "Tempo via autocorrelation, key via Krumhansl-Schmuckler, intro/verse/chorus via Foote novelty.", icon: "🔬" },
      { title: "Separate", description: "Canonical Demucs CLI source separation into vocals, drums, bass, and other.", icon: "🎚️" },
      { title: "Classify", description: "Per-onset drum classification — kick, snare, hat, other — via spectral features.", icon: "🥁" },
      { title: "Repair", description: "De-reverb, phase coherence, and AI-artifact notching at Suno frequencies.", icon: "🩹" },
      { title: "Extract", description: "Spectral-flux onset + YIN pitch tracking into quantizable MIDI note events.", icon: "🎹" },
      { title: "Master", description: "EBU R128 LUFS matching + lookahead true-peak limiter, MP3 and WAV per preset.", icon: "📈" },
    ],
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByDesignSystem(system: DesignSystem): Product[] {
  return products.filter((p) => p.designSystem === system);
}

export function getProductsByType(type: ProductType): Product[] {
  return products.filter((p) => p.type === type);
}

export function getProductsByStatus(status: ProductStatus): Product[] {
  return products.filter((p) => p.status === status);
}

export function getAllProductIds(): string[] {
  return products.map((p) => p.id);
}

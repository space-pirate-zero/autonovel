// ═══════════════════════════════════════════════════════════
// ENTERPRISE CONSULTING — the B2B facet of Spaceship Alpha 9.
// Enterprise-grade AI, governed and shipped. The bridge between
// corporate infrastructure and consumer magic.
// Source: space-pirate-zero/MOS repo + brand kit enterprise.json.
// ═══════════════════════════════════════════════════════════

export const consulting = {
  positioning:
    "Enterprise-grade AI, governed and shipped. Strategy first, then working, compliant systems — the bridge between corporate infrastructure and consumer magic.",
  capabilities: [
    "AI strategy & architecture",
    "Governed AI execution",
    "Retail marketing automation",
    "MCP tool rails & integrations",
    "Compliance-as-code",
    "Durable workflow orchestration",
  ],
  patents: [
    "US 11432994 — Intelligence Engine",
    "US 11600383 — Networked Theft-Prevention System",
  ],
  prior:
    "Global Group Director of Digital Innovation at The Coca-Cola Company — conversational AI in vending infrastructure, deployed across 15,000+ locations.",
  engagements: [
    {
      name: "MOS — Marketing OS",
      label: "MEIJER · RETAIL",
      tagline: "Marketing intent in, governed execution out.",
      summary:
        "Meijer's marketing automation, rebuilt as a governed platform: a declarative language (MOSL) whose documents ARE the deployments, one durable Temporal runtime that executes them all, and MCP tool rails across Meijer's Digital APIs — 215 operations over 10 Azure APIM APIs, mPerks loyalty, and Emarsys. Consent and frequency caps enforced structurally, in code, pinned by tests.",
      stack: ["MOSL", "Temporal", "Kubernetes", "MCP", "Azure APIM", "mPerks", "Emarsys"],
    },
  ],
} as const;

// build-content.mjs — turn the book's own source of truth into site content JSON.
// Reads ../canon.md (the 24-equation table) + ../podcast/config.json (14 modules)
// and writes website/content/{equations,modules,show}.json. Run before dev/build.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));   // website/scripts
const WEB = join(HERE, "..");                           // website
const BOOK = join(WEB, "..");                           // books/digital-insurgency
const OUT = join(WEB, "content");
mkdirSync(OUT, { recursive: true });

// ── 24 equations from canon.md's markdown table ────────────────────────────
function parseEquations() {
  const md = readFileSync(join(BOOK, "canon.md"), "utf8");
  const rows = [];
  for (const line of md.split("\n")) {
    const m = line.match(/^\|\s*(\d+)\s*\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|/);
    if (!m) continue;
    const [, n, symbol, name, formula, ch] = m;
    rows.push({
      n: Number(n),
      symbol: symbol.trim(),
      name: name.trim(),
      formula: formula.trim(),
      chapter: ch.trim(),
    });
  }
  return rows;
}

// ── 14 modules from podcast/config.json (clean episode array) ──────────────
function parseModules() {
  const cfg = JSON.parse(readFileSync(join(BOOK, "podcast", "config.json"), "utf8"));
  const slug = (t) =>
    t.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const modules = (cfg.episodes || []).map((e) => ({
    ep: e.ep,
    slug: slug(e.title),
    title: e.title,
    group: e.module,
    source: e.source,
  }));
  const show = {
    title: cfg.show?.title,
    subtitle: cfg.show?.subtitle,
    description: cfg.show?.description,
    url: cfg.show?.public_url,
  };
  return { modules, show };
}

// ── module prose baked at build (so the container is self-contained) ────────
const EP_TO_FILES = {
  1: ["ch_00.md"], 2: ["ch_01.md"], 3: ["ch_02.md"], 4: ["ch_03.md", "ch_04.md"],
  5: ["ch_05.md"], 6: ["ch_06.md"], 7: ["ch_07.md"], 8: ["ch_08.md"],
  9: ["ch_09.md", "ch_10.md"], 10: ["ch_11.md"], 11: ["ch_12.md"],
  12: ["ch_13.md", "ch_14.md", "ch_15.md"], 13: ["ch_16.md"], 14: ["ch_17.md", "ch_18.md"],
};
function parseProse() {
  const CH = join(BOOK, "chapters");
  const out = {};
  for (const [ep, files] of Object.entries(EP_TO_FILES)) {
    out[ep] = files
      .map((f) => {
        try { return readFileSync(join(CH, f), "utf8"); } catch { return ""; }
      })
      .filter(Boolean)
      .join("\n\n---\n\n");
  }
  return out;
}

const equations = parseEquations();
const { modules, show } = parseModules();
const prose = parseProse();

writeFileSync(join(OUT, "equations.json"), JSON.stringify(equations, null, 2));
writeFileSync(join(OUT, "modules.json"), JSON.stringify(modules, null, 2));
writeFileSync(join(OUT, "show.json"), JSON.stringify(show, null, 2));
writeFileSync(join(OUT, "prose.json"), JSON.stringify(prose));

console.log(
  `content: ${equations.length} equations, ${modules.length} modules → website/content/`
);
if (equations.length < 20) console.warn("!! expected ~24 equations — check canon.md table parse");
if (modules.length !== 14) console.warn(`!! expected 14 modules, got ${modules.length}`);

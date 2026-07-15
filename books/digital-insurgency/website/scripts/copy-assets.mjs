// copy-assets.mjs — copy the canonical book art + audio into public/ (derived,
// gitignored). Runs before dev/build so public/ is populated from the sources of
// truth in ../art and ../audiobook. Keeps ~48MB of duplicate binaries out of git.
import { cpSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url)); // website/scripts
const WEB = join(HERE, "..");
const BOOK = join(WEB, "..");
const pub = (p) => join(WEB, "public", p);

const jobs = [
  [join(BOOK, "art", "spaceships"), pub("art/spaceships")],
  [join(BOOK, "art", "site-assets"), pub("art/site")],
  [join(BOOK, "art", "site-assets", "extra"), pub("art/extra")],
];

let copied = 0;
for (const [src, dst] of jobs) {
  if (!existsSync(src)) { console.warn("copy-assets: missing", src); continue; }
  mkdirSync(dst, { recursive: true });
  cpSync(src, dst, { recursive: true, filter: (s) => !s.endsWith(".json") });
  copied++;
}

// audio sample (if rendered; gitignored source)
const audioSrc = join(BOOK, "audiobook", "produced", "ep_01_SAMPLE.mp3");
if (existsSync(audioSrc)) {
  mkdirSync(pub("audio"), { recursive: true });
  cpSync(audioSrc, pub("audio/ep_01_SAMPLE.mp3"));
  copied++;
}

console.log(`copy-assets: populated public/ (${copied} sources)`);

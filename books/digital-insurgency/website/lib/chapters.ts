import { readFileSync } from "node:fs";
import { join } from "node:path";

const BOOK = join(process.cwd(), "..");
const CH = join(BOOK, "chapters");

// module episode → source chapter file(s) (mirrors podcast/episodes.md index)
export const EP_TO_FILES: Record<number, string[]> = {
  1: ["ch_00.md"],
  2: ["ch_01.md"],
  3: ["ch_02.md"],
  4: ["ch_03.md", "ch_04.md"],
  5: ["ch_05.md"],
  6: ["ch_06.md"],
  7: ["ch_07.md"],
  8: ["ch_08.md"],
  9: ["ch_09.md", "ch_10.md"],
  10: ["ch_11.md"],
  11: ["ch_12.md"],
  12: ["ch_13.md", "ch_14.md", "ch_15.md"],
  13: ["ch_16.md"],
  14: ["ch_17.md", "ch_18.md"],
};

export function readChapterProse(ep: number): string {
  const files = EP_TO_FILES[ep] || [];
  return files
    .map((f) => {
      try {
        return readFileSync(join(CH, f), "utf8");
      } catch {
        return "";
      }
    })
    .filter(Boolean)
    .join("\n\n---\n\n");
}

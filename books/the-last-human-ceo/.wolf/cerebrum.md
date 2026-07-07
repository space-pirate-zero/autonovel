# Cerebrum — autonovel

## Preferences
- Book "The Last Human CEO" is published as **6×9 in, white paper** (per the KDP listing). Build constants in `typeset/build_kdp.py` must match the KDP dashboard trim/paper selection.

## Learnings
- **KDP cover size-mismatch errors are self-decoding.** KDP's "expected cover size W×H" = (trim + 0.125 bleed/edge each side) + spine(pages × paper-rate). To recover the listing config from the error: `trim_height = H − 0.25`; `spine = W − 0.25 − 2×trim_width`; `paper_rate = spine ÷ interior_page_count` (white = 0.002252, cream = 0.0025). The cover file geometry is usually fine — the mismatch means `build_kdp.py` constants ≠ KDP dashboard selection.
- Changing trim size **reflows the interior** → new page count → new spine. Always rebuild interior first, read its page count, then build the cover `--pages N`, and **re-upload both** files to KDP.
- `build_kdp.py` is constants-driven: `TRIM_W/TRIM_H`, `PAPER`, `SPINE_PER_PAGE` at the top drive interior geometry, cover geometry, and metadata. The cover art (`art/cover_front_master.png`) stretches to the front region and text is placed by inch-offsets from edges, so it reflows to any trim without manual edits.

## Do-Not-Repeat
- Do not assume 5.5×8.5 cream — that was the old target and KDP rejected it. Current target is 6×9 white (see Print constants in anatomy.md).

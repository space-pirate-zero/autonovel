# Memory log

## 2026-06-10 — KDP preflight pass (The Last Human CEO)
- Removed printed ISBN placeholder `979-8-XXXXXXX-X-X` from copyright page (source fix in typeset/build_kdp.py; interior.tex regenerated; still 321 pp so spine/cover unchanged).
- Embedded front cover into the ePub (manifest `properties="cover-image"` + legacy `<meta name="cover">`, no cover XHTML to avoid Kindle double-cover). epubcheck 3.3: 0 errors/0 warnings.
- Added `write_ebook_cover()` to build_kdp.py — crops front panel of cover.pdf at 300 dpi → kdp/ebook-cover.jpg (1650×2550 RGB) for the KDP eBook cover upload.
- Added kdp/*.jpg to .gitignore (matches existing convention: generated binaries untracked).
- Commit: aa03542.

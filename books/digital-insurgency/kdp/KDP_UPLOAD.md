# Uploading Digital Insurgency to Amazon (KDP) — step by step

I prepared every file. The actual upload happens at **https://kdp.amazon.com**
in your browser — it's account-gated (your login, tax info, bank), so these
steps are yours to click. Budget ~30 min the first time.

## Files I generated (in `build/` and `kdp/`)
| Purpose | File |
|---|---|
| **Kindle eBook** (manuscript) | `build/Digital_Insurgency_Kindle.epub` ✅ epubcheck-clean |
| **eBook cover** | `build/cover_ebook.jpg` (1600×2560, RGB) |
| **Paperback interior** | `build/Digital_Insurgency_Paperback_6x9.pdf` |
| **Paperback cover wrap** | `build/Digital_Insurgency_Paperback_Cover.pdf` |
| Metadata to paste | `kdp/kdp_metadata.md` |

---

## 0. One-time account setup
1. Go to kdp.amazon.com → sign in with your Amazon account.
2. Complete the **Tax Interview** and **Bank/Payment** details under Account.
   (Royalties can't pay out until this is done.)

## 1. Kindle eBook
1. Bookshelf → **Create** → **Kindle eBook**.
2. **Paperback/eBook Details:** paste Title, Subtitle, Author, Description,
   Keywords, Categories from `kdp/kdp_metadata.md`. Language = English.
   "Publishing rights" = "I own the copyright."
3. **Content:**
   - Manuscript → **Upload eBook manuscript** → `build/Digital_Insurgency_Kindle.epub`
   - Cover → **Upload a cover you already have** → `build/cover_ebook.jpg`
   - Click **Launch Previewer**, page through (check the equation boxes, section
     dividers, and the contents). Close.
   - ISBN: none needed (Amazon assigns an ASIN).
4. **Pricing:** choose KDP Select (optional), territories = All, royalty = **70%**,
   list price **$7.99**. Save.
5. **Publish your Kindle eBook.** Review goes live in ~24–72 h.

## 2. Paperback (optional but recommended)
1. Bookshelf → **Create** → **Paperback** (or "+ Create paperback" under the eBook
   so they link as one product).
2. **Details:** same Title/Author/Description/Keywords/Categories. Get a **free
   KDP ISBN**.
3. **Content → Print options:**
   - Ink & paper: **Black & white interior, white paper** (cheapest; matches the
     interior I built). 
   - Trim size: **6 × 9 in**.
   - Bleed: **No bleed**.
   - Cover finish: Matte (recommended) or Glossy.
4. **Manuscript** → upload `build/Digital_Insurgency_Paperback_6x9.pdf`.
5. **Book cover** → "Upload a cover (PDF)" → `build/Digital_Insurgency_Paperback_Cover.pdf`.
   - ⚠️ The cover wrap is sized for the **current page count + spine** (see
     `kdp/paperback_specs.txt`). If KDP reports a different page count, I'll
     regenerate the wrap to match before you finalize.
6. **Launch Previewer** → fix any margin/bleed flags → Approve.
7. **Pricing:** KDP shows the minimum (printing cost). Set list price
   **$14.99–$18.99**. Publish.

## 3. After publishing
- Both formats appear on one Amazon product page (eBook + paperback) if you
  created the paperback from the eBook.
- Author Central (authorcentral.amazon.com): claim the book, add an author bio
  and photo.

---

### Notes
- I **cannot** log into your KDP account or click Publish — KDP has no public
  upload API; it's a manual portal behind your credentials. Everything else is done.
- The dark, full-bleed "deluxe" PDF (`build/Digital_Insurgency_Designed.pdf`) is
  for screen/direct sharing — **not** uploaded to KDP (a black-ink interior is
  far more expensive to print and reads poorly on e-ink). The Kindle ePub and the
  B&W 6×9 interior are the print/retail-correct versions.

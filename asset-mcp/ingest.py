#!/usr/bin/env python3
"""Backfill the SPZ asset catalog from local repo roots + GCS buckets.

Walks the `backfill_roots` in config.json (or explicit paths given on the CLI),
infers property + type for each file, and runs the shared enrich -> upload ->
index pipeline in store.py. Idempotent (content-addressed by sha256), so it's
safe to re-run; unchanged files are skipped.

Examples:
  python ingest.py --dry-run --limit 20                 # preview classification
  python ingest.py --property the-last-human-ceo --type image --limit 5
  python ingest.py --root books/the-last-human-ceo/art  # one root only
  python ingest.py                                       # full backfill
  python ingest.py path/to/one.png other.mp4            # specific files
"""
from __future__ import annotations

import argparse
import os
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "app"))
import enrich  # noqa: E402
import store  # noqa: E402

REPO_ROOT = Path(__file__).resolve().parent.parent


def _known_ext() -> set[str]:
    exts: set[str] = set()
    for lst in enrich.load_config()["types"].values():
        exts.update(lst)
    return exts


def iter_local_files(root: Path):
    if root.is_file():
        yield root
        return
    for dirpath, _dirs, files in os.walk(root):
        for f in sorted(files):
            yield Path(dirpath) / f


def iter_gcs_objects(gcs_root: str):
    from google.cloud import storage
    bkt, _, prefix = gcs_root[5:].partition("/")
    client = storage.Client(project=os.environ.get("GCP_PROJECT",
                                                    enrich.load_config()["gcp"]["project"]))
    for blob in client.list_blobs(bkt, prefix=prefix or None):
        if blob.name.endswith("/"):
            continue
        yield f"gs://{bkt}/{blob.name}"


def main() -> int:
    ap = argparse.ArgumentParser(description="Backfill the SPZ asset catalog.")
    ap.add_argument("paths", nargs="*", help="Specific files/dirs to ingest (else use config roots).")
    ap.add_argument("--property", help="Force this property for everything ingested.")
    ap.add_argument("--type", help="Force this asset type.")
    ap.add_argument("--root", help="Only ingest config roots whose path contains this substring.")
    ap.add_argument("--limit", type=int, default=0, help="Stop after N files (0 = no limit).")
    ap.add_argument("--since", help="Only local files modified on/after this ISO date (YYYY-MM-DD).")
    ap.add_argument("--force", action="store_true", help="Re-ingest even if already indexed.")
    ap.add_argument("--dry-run", action="store_true", help="Classify + print only; no upload/index.")
    args = ap.parse_args()

    cfg = enrich.load_config()
    known = _known_ext()
    since_ts = None
    if args.since:
        since_ts = datetime.fromisoformat(args.since).timestamp()

    # Build the work list: (kind, ref) where kind is 'local' or 'gcs'.
    work: list[tuple[str, str]] = []
    if args.paths:
        for p in args.paths:
            if p.startswith("gs://"):
                work.append(("gcs", p))
            else:
                for f in iter_local_files(Path(p)):
                    work.append(("local", str(f)))
    else:
        for root in cfg["backfill_roots"]:
            if args.root and args.root not in root:
                continue
            if root.startswith("gs://"):
                try:
                    work.extend(("gcs", o) for o in iter_gcs_objects(root))
                except Exception as exc:  # noqa: BLE001
                    print(f"! skipping {root}: {exc}")
            else:
                rp = REPO_ROOT / root
                if rp.exists():
                    work.extend(("local", str(f)) for f in iter_local_files(rp))
                else:
                    print(f"! root not found: {rp}")

    indexed = skipped = failed = seen = 0
    for kind, ref in work:
        if enrich.should_skip(ref):
            continue
        ext = os.path.splitext(ref)[1].lower()
        if not args.type and ext not in known:
            continue  # unknown extension and no forced type
        if kind == "local" and since_ts is not None:
            try:
                if os.path.getmtime(ref) < since_ts:
                    continue
            except OSError:
                continue

        seen += 1
        if args.limit and seen > args.limit:
            seen -= 1
            break

        try:
            if args.dry_run:
                rel = ref if kind == "gcs" else store._repo_rel(ref)  # noqa: SLF001
                prop = args.property or enrich.infer_property(rel)
                if kind == "local":
                    en = enrich.enrich(ref, args.type, embed=False)
                    atype = en.type
                else:
                    atype = args.type or enrich.detect_type(ref)
                print(f"[dry] {atype:9} {prop:20} {rel}")
                indexed += 1
                continue

            if kind == "gcs":
                res = store.index_gcs_object(ref, args.property, args.type, force=args.force)
            else:
                res = store.index_local_file(ref, args.property, args.type, force=args.force)

            status = res.get("status")
            if status == "indexed":
                indexed += 1
                print(f"[ok]  {res.get('type','?'):9} {res.get('property','?'):20} "
                      f"{res.get('filename','')}  -> {res.get('public_url','')}")
            else:
                skipped += 1
                print(f"[skip] {res.get('filename', ref)} (already indexed)")
        except Exception as exc:  # noqa: BLE001
            failed += 1
            print(f"[FAIL] {ref}: {exc}")

    print(f"\nDone. indexed={indexed} skipped={skipped} failed={failed} "
          f"(considered {seen} of {len(work)} candidates)")
    return 1 if failed and not indexed else 0


if __name__ == "__main__":
    raise SystemExit(main())

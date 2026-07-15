"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useProgress, RANKS } from "@/lib/progress";
import { encodeCred } from "@/lib/cred";

const RANK_ART = [
  "/art/extra/01_rank-1-decorator.png",
  "/art/extra/02_rank-2-wedge.png",
  "/art/extra/03_rank-3-curator.png",
  "/art/extra/04_rank-4-insurgent.png",
  "/art/extra/05_rank-5-ghost.png",
];

export default function MintPanel() {
  const { progress, actions, complete, rank, rankIdx, index, pct, readCount, total } = useProgress();
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  // mint on demand
  const doMint = () => {
    const certId = encodeCred({ n: progress.name || "Insurgent", r: rankIdx, x: index, d: new Date().toISOString().slice(0, 10) });
    actions.mint(certId);
  };
  const certId = progress.certId;
  const verifyUrl = origin && certId ? `${origin}/verify/${certId}` : "";
  const linkedIn =
    "https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME" +
    "&name=Digital%20Insurgency%20Field%20Course&organizationId=112670022" +
    (certId ? `&certId=${certId}&certUrl=${encodeURIComponent(verifyUrl)}` : "");

  if (!complete) {
    return (
      <div className="card p-6">
        <div className="kicker">Credential locked</div>
        <p className="mt-2 text-sm text-mut">Finish the loop to mint your verifiable badge.</p>
        <ul className="mt-4 space-y-2 text-sm">
          <li className={readCount >= total ? "text-acid" : "text-mut"}>
            {readCount >= total ? "✓" : "○"} Complete all {total} modules — <b>{readCount}/{total}</b>
          </li>
          <li className={progress.oath ? "text-acid" : "text-mut"}>
            {progress.oath ? "✓" : "○"} Sign the Insurgent&apos;s Oath
          </li>
        </ul>
        <div className="mt-5 flex gap-3">
          <Link href="/read" className="btn">Continue the course</Link>
          <Link href="/glasshouse/oath" className="btn btn-pink">Take the Oath</Link>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded bg-panel2">
          <motion.div className="h-full bg-cyan" initial={{ width: 0 }} animate={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
      <div className="kicker" style={{ color: "#b6ff3a" }}>Course complete</div>
      {!certId ? (
        <>
          <p className="mt-2 text-sm text-mut">You&apos;ve done the work. Mint your credential.</p>
          <motion.button whileTap={{ scale: 0.96 }} onClick={doMint} className="btn btn-pink mt-4">
            ⚡ Generate my badge
          </motion.button>
        </>
      ) : (
        <div className="mt-2">
          {/* generated badge = art + live overlay */}
          <div className="relative mx-auto w-64">
            <Image src="/art/site/03_badge-card.png" alt="" width={256} height={324} className="rounded-xl border border-line" />
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 text-center">
              <div className="font-display text-sm font-black neon-cyan">{progress.name}</div>
              <div className="mt-1 flex items-center gap-2">
                <Image src={RANK_ART[rankIdx]} alt="" width={26} height={26} />
                <span className="font-mono text-[11px] text-pink">RANK: {rank.toUpperCase()}</span>
              </div>
              <div className="font-mono text-[10px] text-mut">Insurgent Index {index} · {progress.mintedAt}</div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <a href={linkedIn} target="_blank" rel="noopener noreferrer" className="btn btn-pink">Add to LinkedIn</a>
            <a href={verifyUrl} className="btn">Verify</a>
          </div>
          <p className="mt-3 text-center font-mono text-[11px] text-mut break-all">
            Cert: {certId?.slice(0, 22)}…
          </p>
        </div>
      )}
    </motion.div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { decodeCred } from "@/lib/cred";
import { RANKS } from "@/lib/progress";

const RANK_ART = [
  "01_rank-1-decorator", "02_rank-2-wedge", "03_rank-3-curator",
  "04_rank-4-insurgent", "05_rank-5-ghost",
];

export default async function Verify({ params }: { params: Promise<{ certId: string }> }) {
  const { certId } = await params;
  const cred = decodeCred(certId);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-lg text-center">
        {cred ? (
          <>
            <div className="kicker" style={{ color: "#b6ff3a" }}>✓ Verified credential</div>
            <div className="card mt-5 p-8">
              <Image src={`/art/extra/${RANK_ART[cred.r] || RANK_ART[3]}.png`} alt="" width={90} height={90}
                className="mx-auto float" />
              <h1 className="mt-4 font-display text-2xl font-black">
                <span className="neon-pink">{cred.n}</span>
              </h1>
              <p className="mt-1 font-mono text-sm text-cyan">
                {RANKS[cred.r] || "Insurgent"} · Insurgent Index {cred.x}
              </p>
              <p className="mt-4 text-sm text-mut">
                completed the <b className="text-ink">Digital Insurgency Field Course</b> and signed
                the Insurgent&apos;s Oath.
              </p>
              <p className="mt-1 font-mono text-xs text-mut">Issued {cred.d} · Space Pirate Zero</p>
            </div>
            <p className="mt-4 font-mono text-[11px] text-mut">
              This is the functional v1 credential (self-describing token). Production issues a
              signed Open Badge with a server-side record.
            </p>
          </>
        ) : (
          <>
            <div className="kicker" style={{ color: "#ff1744" }}>✗ Not a valid credential</div>
            <p className="mt-4 text-mut">That credential token couldn&apos;t be verified.</p>
          </>
        )}
        <Link href="/" className="btn mt-8">Digital Insurgency →</Link>
      </div>
    </div>
  );
}

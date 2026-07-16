import Image from "next/image";
import MintPanel from "@/components/MintPanel";

export const metadata = { title: "Get Certified — Digital Insurgency" };

export default function Badge() {
  return (
    <div className="py-12">
      <div className="grid items-start gap-10 md:grid-cols-2">
        <div>
          <div className="kicker">The payoff</div>
          <h1 className="mt-2 font-display text-4xl font-black">
            Become a <span className="neon-pink">Certified Insurgent</span>
          </h1>
          <p className="mt-4 text-mut">
            Finish the 14 modules, pass the Mirror Tests, and sign the Insurgent&apos;s Oath.
            The site auto-generates a <strong className="text-ink">verifiable credential</strong> with
            your rank and Insurgent Index — and adds it to your LinkedIn in one click.
          </p>
          <ol className="mt-5 space-y-2 text-sm text-mut">
            <li><span className="text-cyan font-mono">01</span> Work the course — read, run the physics, pass the Mirror Tests.</li>
            <li><span className="text-cyan font-mono">02</span> Sign the Oath (five commitments).</li>
            <li><span className="text-cyan font-mono">03</span> Mint your badge + a public <code className="text-cyan">/verify</code> page.</li>
            <li><span className="text-cyan font-mono">04</span> One click → it&apos;s on your LinkedIn profile.</li>
          </ol>
          <p className="mt-4 font-mono text-xs text-mut">
            Issuer org 112670022 · verifiable credential · no dark patterns, ever.
          </p>
        </div>
        <MintPanel />
      </div>

      {/* portrait heal concept */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold">Your portrait heals as you go</h2>
        <p className="mt-1 text-sm text-mut">Four percent at a time. Rotted → whole.</p>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:max-w-xl">
          <figure>
            <Image src="/art/site/04_portrait-rotted.png" alt="rotted" width={400} height={400} className="rounded-xl border border-line" />
            <figcaption className="mt-2 text-center font-mono text-xs text-mut">0% — start</figcaption>
          </figure>
          <figure>
            <Image src="/art/site/05_portrait-healed.png" alt="healed" width={400} height={400} className="rounded-xl border border-line" />
            <figcaption className="mt-2 text-center font-mono text-xs text-mut">100% — certified</figcaption>
          </figure>
        </div>
      </section>
    </div>
  );
}

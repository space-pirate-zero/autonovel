import Link from "next/link";
import Image from "next/image";
import modules from "@/content/modules.json";
import show from "@/content/show.json";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-16 text-center">
        <Image
          src="/art/site/01_hero-banner.png"
          alt="Spaceship Alpha 9 over a neon skyline"
          width={1200}
          height={675}
          priority
          className="mx-auto w-full max-w-3xl rounded-2xl border border-line"
        />
        <h1 className="mt-8 font-display text-4xl font-black leading-tight sm:text-6xl">
          <span className="neon-pink">SMUGGLE THE FUTURE</span>
          <br />
          <span className="neon-cyan">PAST THE IMMUNE SYSTEM</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-mut">{show.subtitle}</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/read" className="btn btn-pink">Start the field course →</Link>
          <Link href="/glasshouse" className="btn">Enter the Glass House</Link>
        </div>
      </section>

      {/* Five claims strip */}
      <section className="grid gap-3 py-8 sm:grid-cols-5">
        {[
          "The rewrite is coming.",
          "Authenticity is the currency.",
          "The enterprise is physics.",
          "Bypass the immune system.",
          "Good trouble only.",
        ].map((c, i) => (
          <div key={i} className="card p-4">
            <div className="kicker">Claim {i + 1}</div>
            <p className="mt-1 text-sm">{c}</p>
          </div>
        ))}
      </section>

      {/* Modules */}
      <section className="py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">The 14 modules</h2>
          <Link href="/read" className="text-sm text-cyan hover:underline">All modules →</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <Link key={m.ep} href={`/read/${m.slug}`} className="card p-4 transition hover:border-cyan/50">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-cyan">EP {String(m.ep).padStart(2, "0")}</span>
                <span className="font-mono text-[10px] text-mut">{m.source}</span>
              </div>
              <h3 className="mt-2 font-display text-base font-bold">{m.title}</h3>
              <p className="mt-1 text-xs text-mut">{m.group}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Credential CTA */}
      <section className="card my-12 flex flex-col items-center gap-6 p-8 text-center sm:flex-row sm:text-left">
        <Image src="/art/site/03_badge-card.png" alt="Insurgent credential" width={220} height={280}
          className="w-40 rounded-xl border border-line" />
        <div>
          <h2 className="font-display text-2xl font-bold neon-pink">Finish it. Prove it.</h2>
          <p className="mt-2 text-mut">
            Complete the course, pass the Mirror Tests, sign the Insurgent&apos;s Oath — and
            auto-generate a verifiable credential you add to LinkedIn in one click.
          </p>
          <Link href="/badge" className="btn btn-pink mt-4">See the credential →</Link>
        </div>
      </section>
    </div>
  );
}

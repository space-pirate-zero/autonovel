import Link from "next/link";
import Image from "next/image";
import Calculators from "@/components/Calculators";
import equations from "@/content/equations.json";

export const metadata = { title: "The Glass House — Digital Insurgency" };

const FLAGSHIP = new Set(["A_hl", "R_ext", "F_cp", "D_comp", "R_t", "DF"]);

export default function GlassHouse() {
  const rest = equations.filter((e) => !FLAGSHIP.has(e.symbol));

  return (
    <div className="py-12">
      <div className="kicker">The interactive lab</div>
      <h1 className="mt-2 font-display text-4xl font-black">
        The <span className="neon-cyan">Glass House</span>
      </h1>
      <p className="mt-3 max-w-2xl text-mut">
        Don&apos;t read about the physics — run it. Drag the sliders, watch the gauge go red.
        Then take the Mirror Test: flip the product over and find the rot underneath.
      </p>

      {/* Mirror Test entry */}
      <Link href="/glasshouse/mirror-test" className="card mt-8 flex items-center gap-5 p-5 transition hover:border-pink/50">
        <Image src="/art/site/10_mirror-test-emblem.png" alt="" width={96} height={96} className="rounded-lg" />
        <div>
          <h2 className="font-display text-xl font-bold neon-pink">The Mirror Test</h2>
          <p className="text-sm text-mut">Flip a product, expose its engine, name the dark pattern. →</p>
        </div>
      </Link>

      {/* Live calculators */}
      <h2 className="mt-12 font-display text-2xl font-bold">The physics, live</h2>
      <p className="mt-1 text-sm text-mut">Six of the twenty-four equations, interactive. The rest below.</p>
      <Calculators />

      {/* The full 24 as reference */}
      <h2 className="mt-14 font-display text-2xl font-bold">All 24 equations</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="font-mono text-xs uppercase text-mut">
            <tr className="border-b border-line">
              <th className="py-2 pr-3">#</th><th className="pr-3">Symbol</th>
              <th className="pr-3">Name</th><th className="pr-3">Formula</th><th>Ch</th>
            </tr>
          </thead>
          <tbody>
            {equations.map((e) => (
              <tr key={e.n} className="border-b border-line/50">
                <td className="py-2 pr-3 text-mut">{e.n}</td>
                <td className="pr-3 font-mono text-cyan">{e.symbol}</td>
                <td className="pr-3">{e.name}</td>
                <td className="pr-3 font-mono text-xs text-mut">{e.formula}</td>
                <td className="text-mut">{e.chapter}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-mut">
        {rest.length} more equations become interactive calculators in the full build.
      </p>
    </div>
  );
}

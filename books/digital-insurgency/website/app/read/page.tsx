import Link from "next/link";
import modules from "@/content/modules.json";

export const metadata = { title: "Read the field course — Digital Insurgency" };

export default function ReadIndex() {
  const groups = modules.reduce<Record<string, typeof modules>>((acc, m) => {
    (acc[m.group] ||= []).push(m);
    return acc;
  }, {});

  return (
    <div className="py-12">
      <div className="kicker">The field course</div>
      <h1 className="mt-2 font-display text-4xl font-black">Read it</h1>
      <p className="mt-3 max-w-2xl text-mut">
        Fourteen modules, three acts of physics wrapped in a broadcast. Each one is a
        complete lesson — read it, run its equations, take its Mirror Test.
      </p>

      {Object.entries(groups).map(([group, mods]) => (
        <section key={group} className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-wider text-cyan">{group}</h2>
          <div className="mt-3 divide-y divide-line border-y border-line">
            {mods.map((m) => (
              <Link key={m.ep} href={`/read/${m.slug}`}
                className="flex items-center gap-4 py-4 transition hover:bg-panel/40">
                <span className="font-display text-2xl font-black text-pink/70">
                  {String(m.ep).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold">{m.title}</h3>
                  <p className="font-mono text-xs text-mut">{m.source}</p>
                </div>
                <span className="text-cyan">→</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

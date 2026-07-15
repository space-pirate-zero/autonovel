import Link from "next/link";
import { notFound } from "next/navigation";
import modules from "@/content/modules.json";
import proseData from "@/content/prose.json";
import ModuleComplete from "@/components/ModuleComplete";
import AudioPlayer from "@/components/AudioPlayer";

export function generateStaticParams() {
  return modules.map((m) => ({ slug: m.slug }));
}

// very small markdown → blocks renderer (headings, blockquotes, hr, paragraphs)
function render(md: string) {
  const blocks: React.ReactNode[] = [];
  const paras = md.split(/\n{2,}/);
  paras.forEach((p, i) => {
    const t = p.trim();
    if (!t) return;
    if (t === "---") return blocks.push(<hr key={i} className="my-8 border-line" />);
    if (t.startsWith("###")) return blocks.push(<h3 key={i} className="mt-8 font-display text-xl font-bold">{t.replace(/^#+\s*/, "")}</h3>);
    if (t.startsWith("##")) return blocks.push(<h2 key={i} className="mt-10 font-display text-2xl font-bold neon-cyan">{t.replace(/^#+\s*/, "")}</h2>);
    if (t.startsWith("#")) return blocks.push(<h1 key={i} className="mt-8 font-display text-3xl font-black">{t.replace(/^#+\s*/, "")}</h1>);
    if (t.startsWith(">")) return blocks.push(
      <blockquote key={i} className="my-5 border-l-2 border-pink pl-4 italic text-mut">
        {t.replace(/^>\s?/gm, "")}
      </blockquote>
    );
    blocks.push(<p key={i} className="my-4 leading-relaxed">{t}</p>);
  });
  return blocks;
}

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const idx = modules.findIndex((m) => m.slug === slug);
  const mod = modules[idx];
  if (!mod) notFound();

  const prose = (proseData as Record<string, string>)[String(mod.ep)] || "";
  const prev = modules[idx - 1];
  const next = modules[idx + 1];

  return (
    <article className="py-12">
      <Link href="/read" className="font-mono text-xs text-cyan hover:underline">← all modules</Link>
      <div className="mt-4 kicker">{mod.group} · {mod.source}</div>
      <h1 className="mt-2 font-display text-4xl font-black">
        <span className="text-pink/70">EP {String(mod.ep).padStart(2, "0")}</span> — {mod.title}
      </h1>

      {mod.ep === 1 && <AudioPlayer src="/audio/ep_01_SAMPLE.mp3" label="Episode 1 (sample)" />}

      <div className="mt-8 max-w-2xl text-[1.02rem]">
        {prose ? render(prose) : <p className="text-mut">Prose for this module loads here.</p>}
      </div>

      <ModuleComplete ep={mod.ep} next={next ? `/read/${next.slug}` : undefined} />

      <div className="mt-12 flex justify-between border-t border-line pt-6 font-mono text-sm">
        {prev ? <Link href={`/read/${prev.slug}`} className="text-cyan hover:underline">← {prev.title}</Link> : <span />}
        {next ? <Link href={`/read/${next.slug}`} className="text-cyan hover:underline">{next.title} →</Link> : <span />}
      </div>
    </article>
  );
}

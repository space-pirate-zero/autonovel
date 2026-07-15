import { Badge } from "@/components/ui/Badge";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

const STAGGER = [
  "stagger-1",
  "stagger-2",
  "stagger-3",
  "stagger-4",
  "stagger-5",
  "stagger-6",
];

export function TechStack({
  stack,
  productId,
  color,
}: {
  stack: string[];
  productId: string;
  color: string;
}) {
  return (
    <AnimatedSection className="bg-sa9-surface-raised border-y-3 border-sa9-border py-20 sm:py-28">
      <div id="stack" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="font-mono text-xs text-sa9-text-dim mb-4" aria-hidden="true">
          {"// "}
          {productId}
          {".stack"}
        </p>

        <Badge variant="cyan" className="mb-4">
          BUILT WITH
        </Badge>

        <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-sa9-text mb-10">
          Tech Stack
        </h2>

        <div className="flex flex-wrap gap-3" role="list" aria-label="Technology stack">
          {stack.map((tech, i) => (
            <span
              key={tech}
              role="listitem"
              className={`border-3 border-sa9-border px-4 py-2 font-mono text-sm text-sa9-text bg-sa9-surface transition-all duration-200 hover:-translate-y-0.5 hover:[border-color:var(--fx)] hover:[color:var(--fx)] hover:shadow-[3px_3px_0_rgba(0,0,0,0.5)] animate-fade-in-up ${STAGGER[Math.min(i, 5)]}`}
              style={{ ["--fx" as string]: color }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

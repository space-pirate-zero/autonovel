import type { Product, ProductType } from "@/lib/products";
import { Badge } from "@/components/ui/Badge";

const PROBLEM_TEXT: Record<ProductType, string> = {
  flagship:
    "Fragmented tools and disconnected workflows leave teams struggling to ship cohesive products at scale.",
  platform:
    "Developers waste countless hours stitching together incompatible services that were never designed to work as one.",
  saas:
    "Existing solutions force teams into rigid workflows, sacrificing speed for compliance or vice versa.",
  consumer:
    "Users are stuck with bloated apps that prioritize monetization over the experience they actually need.",
  tool:
    "Manual processes and outdated utilities drain engineering time that should be spent on real problems.",
  game:
    "The gaming landscape is saturated with derivative experiences that fail to push creative or technical boundaries.",
  infra:
    "Infrastructure complexity grows unchecked, turning simple deployments into multi-day ordeals.",
  entertainment:
    "Content platforms treat audiences as passive consumers instead of active participants in the experience.",
};

export function ProblemSolution({ product }: { product: Product }) {
  const problemText = PROBLEM_TEXT[product.type];

  return (
    <section className="py-20 sm:py-28" aria-labelledby="problem-solution-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Badge variant="cyan" className="mb-8">
          WHY THIS EXISTS
        </Badge>

        <h2
          id="problem-solution-heading"
          className="sr-only"
        >
          Why {product.name} exists
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Problem */}
          <div className="border-3 border-sa9-border p-8 sm:p-10 bg-sa9-surface">
            <span className="font-mono text-xs uppercase tracking-widest text-sa9-text-dim block mb-4">
              {"// problem"}
            </span>
            <h3 className="font-display font-bold text-2xl uppercase tracking-tight text-sa9-text mb-4">
              The world before{" "}
              <span style={{ color: product.color }}>{product.name}</span>
            </h3>
            <p className="font-body text-sa9-text-muted text-base leading-relaxed">
              {problemText}
            </p>
          </div>

          {/* Neon accent divider (visible on mobile, hidden on lg where columns meet) */}
          <div
            className="h-1 lg:hidden w-full"
            style={{ backgroundColor: product.color }}
            aria-hidden="true"
          />

          {/* Solution */}
          <div className="border-3 border-sa9-border lg:border-l-0 p-8 sm:p-10 bg-sa9-surface-raised">
            <span className="font-mono text-xs uppercase tracking-widest text-sa9-text-dim block mb-4">
              {"// solution"}
            </span>
            <h3 className="font-display font-bold text-2xl uppercase tracking-tight text-sa9-text mb-4">
              Enter{" "}
              <span style={{ color: product.color }}>{product.name}</span>
            </h3>
            <p className="font-body text-sa9-text-muted text-base leading-relaxed">
              {product.heroDescription}
            </p>
          </div>
        </div>

        {/* Neon accent line at bottom (desktop) */}
        <div
          className="hidden lg:block h-1 w-full"
          style={{ backgroundColor: product.color }}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}

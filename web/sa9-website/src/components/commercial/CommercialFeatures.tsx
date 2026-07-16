import type { Product } from "@/lib/products";
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

function FeatureCard({
  feature,
  color,
  stagger,
}: {
  feature: Product["features"][number];
  color: string;
  stagger: string;
}) {
  return (
    <article
      className={`group relative border-3 border-sa9-border bg-sa9-surface-raised p-6 shadow-[4px_4px_0_rgba(0,0,0,0.5)] transition-all duration-300 ease-out hover:-translate-x-0.5 hover:-translate-y-1 animate-fade-in-up ${stagger}`}
    >
      {/* Icon tile — border + glow adopt the product color on hover */}
      <div
        className="w-12 h-12 flex items-center justify-center border-3 text-xl mb-4 transition-all duration-300 group-hover:scale-110"
        style={{ borderColor: color }}
        aria-hidden="true"
      >
        {feature.icon}
      </div>

      <h3 className="font-display font-bold text-base uppercase tracking-wider text-sa9-text mb-2 transition-colors">
        {feature.title}
      </h3>

      <p className="font-body text-sa9-text-muted text-sm leading-relaxed">
        {feature.description}
      </p>

      {/* bottom accent line grows from left on hover */}
      <span
        className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-500 ease-out"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
    </article>
  );
}

export function CommercialFeatures({ product }: { product: Product }) {
  const features = product.features.slice(0, 6);

  return (
    <AnimatedSection className="py-20 sm:py-28">
      <div id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Badge variant="pink" className="mb-4">
            CAPABILITIES
          </Badge>
          <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-sa9-text mb-4">
            What{" "}
            <span style={{ color: product.color }}>{product.name}</span> can do
          </h2>
          <p className="font-body text-sa9-text-muted text-lg max-w-2xl">
            Purpose-built capabilities engineered to deliver on every promise.
          </p>
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
          aria-label={`${product.name} features`}
        >
          {features.map((feature, i) => (
            <div key={feature.title} role="listitem">
              <FeatureCard
                feature={feature}
                color={product.color}
                stagger={STAGGER[i] ?? ""}
              />
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

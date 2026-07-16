import type { ReactNode } from "react";

interface Feature {
  title: string;
  description: string;
  icon?: ReactNode;
}

interface FeatureGridProps {
  features: Feature[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const colClasses = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
} as const;

/**
 * Feature showcase grid for marketing pages.
 */
export function FeatureGrid({ features, columns = 3, className = "" }: FeatureGridProps) {
  return (
    <section className={`sa9-features py-20 px-6 ${className}`}>
      <div className={`mx-auto max-w-6xl grid grid-cols-1 ${colClasses[columns]} gap-8`}>
        {features.map((feature) => (
          <div
            key={feature.title}
            className="sa9-feature-card p-6 rounded-sm border transition-all hover:translate-y-[-2px]"
          >
            {feature.icon && (
              <div className="sa9-feature-icon mb-4">{feature.icon}</div>
            )}
            <h3 className="sa9-feature-title font-mono text-sm font-bold tracking-wider uppercase mb-2">
              {feature.title}
            </h3>
            <p className="sa9-feature-description text-sm opacity-70 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products, getProductById } from "@/lib/products";
import {
  generateCommercialMetadata,
  commercialProductJsonLd,
} from "@/lib/commercial-metadata";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import { CommercialHero } from "@/components/commercial/CommercialHero";
import { StatsBar } from "@/components/commercial/StatsBar";
import { ProblemSolution } from "@/components/commercial/ProblemSolution";
import { CommercialFeatures } from "@/components/commercial/CommercialFeatures";
import { TechStack } from "@/components/commercial/TechStack";
import { WaitlistSection } from "@/components/commercial/WaitlistSection";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface CommercialPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products
    .filter((p) => p.id !== "spz" && p.id !== "tradecraft")
    .map((p) => ({ slug: p.id }));
}

export async function generateMetadata({
  params,
}: CommercialPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductById(slug);
  if (!product) return { title: "Product Not Found" };
  return generateCommercialMetadata(product);
}

const statusBadge: Record<
  string,
  { variant: "pink" | "cyan" | "orange" | "acid"; label: string }
> = {
  live: { variant: "pink", label: "LIVE" },
  beta: { variant: "cyan", label: "BETA" },
  development: { variant: "orange", label: "IN DEVELOPMENT" },
  docs: { variant: "acid", label: "DOCUMENTATION" },
};

export default async function CommercialPage({
  params,
}: CommercialPageProps) {
  const { slug } = await params;
  const product = getProductById(slug);

  if (!product) {
    notFound();
  }

  const structuredData = commercialProductJsonLd(product);
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Spaceship Alpha 9", url: "https://spaceshipalpha9.co" },
    { name: "Products", url: "https://spaceshipalpha9.co/products" },
    {
      name: product.name,
      url: `https://${product.subdomain}.spaceshipalpha9.co`,
    },
  ]);

  const relatedProducts = products
    .filter(
      (p) =>
        p.id !== product.id &&
        p.id !== "spz" &&
        (p.type === product.type || p.designSystem === product.designSystem)
    )
    .slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      {/* 1. HERO */}
      <CommercialHero product={product} />

      {/* 2. STATS BAR */}
      <StatsBar highlights={product.highlights} color={product.color} />

      {/* 3. PROBLEM / SOLUTION */}
      <ProblemSolution product={product} />

      {/* 4. FEATURES */}
      <CommercialFeatures product={product} />

      {/* 5. MISSION STATEMENT */}
      <section
        className="py-16 sm:py-20 border-y-3 border-sa9-border"
        aria-label="Mission"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="cyan" className="mb-6">OUR MISSION</Badge>
          <blockquote className="relative">
            <p
              className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl uppercase tracking-tight leading-tight"
              style={{ color: product.color }}
            >
              {product.pressQuote}
            </p>
            <footer className="mt-6">
              <div
                className="h-[3px] w-24 mx-auto mb-4 animate-border-glow"
                style={{ backgroundColor: product.color }}
              />
              <cite className="not-italic font-mono text-xs text-sa9-text-dim uppercase tracking-widest">
                — The {product.name} Team at Spaceship Alpha 9
              </cite>
            </footer>
          </blockquote>
        </div>
      </section>

      {/* 6. TECH STACK */}
      <TechStack
        stack={product.stack}
        productId={product.id}
        color={product.color}
      />

      {/* 7. PLATFORM AVAILABILITY */}
      <section
        id="platforms"
        className="py-16 sm:py-20 border-b-3 border-sa9-border"
        aria-label="Platforms"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="pink" className="mb-4">
            AVAILABLE ON
          </Badge>
          <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-sa9-text mb-8">
            Get{" "}
            <span style={{ color: product.color }}>{product.name}</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {product.platforms.map((platform) => (
              <div
                key={platform}
                className="border-3 border-sa9-border bg-sa9-surface-raised px-8 py-4 shadow-[4px_4px_0_rgba(0,0,0,0.5)] hover:border-sa9-pink hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="font-display font-bold text-lg uppercase tracking-widest text-sa9-text">
                  {platform}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. WAITLIST / CTA */}
      <WaitlistSection product={product} />

      {/* 9. RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section
          className="py-20 sm:py-28 border-b-3 border-sa9-border"
          aria-label="Related products"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Badge variant="pink" className="mb-4">
              MORE FROM THE FLEET
            </Badge>
            <h2 className="font-display font-black text-3xl uppercase tracking-tight text-sa9-text mb-8">
              Related <span className="text-sa9-pink">Products</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((rp) => {
                const rpBadge = statusBadge[rp.status];
                return (
                  <Link
                    key={rp.id}
                    href={`/sites/${rp.id}`}
                  >
                    <div className="border-3 border-sa9-border bg-sa9-surface-raised p-6 shadow-[4px_4px_0_rgba(0,0,0,0.5)] hover:border-sa9-pink hover:shadow-[6px_6px_0_#990044] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 h-full">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{rp.icon}</span>
                        <Badge variant={rpBadge.variant}>
                          {rpBadge.label}
                        </Badge>
                      </div>
                      <h3 className="font-display font-bold text-lg uppercase tracking-wider text-sa9-text mb-1">
                        {rp.name}
                      </h3>
                      <p
                        className="font-mono text-xs mb-3"
                        style={{ color: rp.color }}
                      >
                        {rp.tagline}
                      </p>
                      <p className="text-sa9-text-muted text-sm line-clamp-2">
                        {rp.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 10. BOTTOM CTA */}
      <section className="py-16 bg-sa9-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sa9-text-muted text-lg mb-6">
            {product.name} is one of {products.length - 1} AI-native products
            in the SA9 fleet.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="https://spaceshipalpha9.co/products">
              <Button variant="primary" size="lg">
                Explore All Products
              </Button>
            </Link>
            <Link href="https://spaceshipalpha9.co">
              <Button variant="secondary" size="lg">
                Spaceship Alpha 9
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

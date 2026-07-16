"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { productHref, type Product } from "@/lib/products";

const statusBadge: Record<string, { variant: "pink" | "cyan" | "acid" | "orange"; label: string }> = {
  live: { variant: "pink", label: "LIVE" },
  beta: { variant: "cyan", label: "BETA" },
  development: { variant: "orange", label: "DEV" },
  docs: { variant: "acid", label: "DOCS" },
};

interface ProductGridProps {
  products: Product[];
}

function ProductCard({ product }: { product: Product }) {
  const badge = statusBadge[product.status];
  const soon = product.comingSoon;

  return (
    <Card hoverable className="relative h-full flex flex-col group overflow-hidden">
      {soon ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <span className="font-display font-black uppercase tracking-[0.25em] text-sm px-4 py-2 border-3 border-sa9-orange text-sa9-orange bg-sa9-surface/85">
            Coming Soon
          </span>
        </div>
      ) : null}

      <div className={soon ? "transition-[filter] duration-300 group-hover:blur-[5px] flex flex-col h-full" : "flex flex-col h-full"}>
        {product.screenshot ? (
          <div className="relative w-full aspect-[16/10] overflow-hidden border-b-3 border-sa9-border bg-sa9-surface">
            <Image
              src={product.screenshot}
              alt={`${product.name} screenshot`}
              fill
              className={`object-cover object-top group-hover:scale-[1.03] transition-transform duration-300 ${soon ? "opacity-60" : ""}`}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        ) : null}

        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-3xl transition-transform duration-200 group-hover:scale-110"
              role="img"
              aria-label={product.name}
            >
              {product.icon}
            </span>
            <div className="flex items-center gap-2">
              {product.platforms.slice(0, 2).map((p) => (
                <span
                  key={p}
                  className="text-[9px] font-mono uppercase tracking-widest text-sa9-text-dim border border-sa9-border px-1 py-0.5"
                >
                  {p}
                </span>
              ))}
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </div>
          </div>
          <CardTitle>{product.name}</CardTitle>
          <CardDescription>{product.tagline}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-sa9-text-muted text-sm leading-relaxed line-clamp-3 mb-3">
            {product.description}
          </p>
          <div className="flex items-center gap-2 mb-4">
            <span className="font-mono text-[10px] font-bold" style={{ color: product.color }}>
              {product.domain}
            </span>
          </div>
          <div className="space-y-1.5">
            {product.features.slice(0, 3).map((f) => (
              <div key={f.title} className="flex items-center gap-2 text-xs">
                <span className="text-sa9-pink">&#x25B8;</span>
                <span className="text-sa9-text-muted">{f.title}</span>
              </div>
            ))}
          </div>
        </CardContent>
        <div className="px-6 pb-6 flex flex-wrap gap-1.5">
          {product.stack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="text-[10px] font-mono uppercase tracking-widest text-sa9-text-dim border border-sa9-border px-1.5 py-0.5"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function ProductGrid({ products }: ProductGridProps) {
  const displayProducts = products.filter((p) => p.id !== "spz");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayProducts.map((product) =>
        product.comingSoon ? (
          <ProductCard key={product.id} product={product} />
        ) : (
          <Link
            key={product.id}
            href={productHref(product)}
            {...(product.liveUrl
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            <ProductCard product={product} />
          </Link>
        )
      )}
    </div>
  );
}

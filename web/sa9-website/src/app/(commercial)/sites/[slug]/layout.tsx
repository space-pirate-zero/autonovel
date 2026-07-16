import { notFound } from "next/navigation";
import { getProductById, products } from "@/lib/products";
import { CommercialHeader } from "@/components/commercial/CommercialHeader";
import { CommercialFooter } from "@/components/commercial/CommercialFooter";

interface CommercialLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products
    .filter((p) => p.id !== "spz" && p.id !== "tradecraft")
    .map((p) => ({ slug: p.id }));
}

export default async function CommercialLayout({
  children,
  params,
}: CommercialLayoutProps) {
  const { slug } = await params;
  const product = getProductById(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[10000] focus:px-4 focus:py-2 focus:bg-sa9-cyan focus:text-sa9-surface focus:font-mono focus:text-sm focus:border-3 focus:border-sa9-cyan focus:shadow-[4px_4px_0_#005566]"
      >
        Skip to content
      </a>
      <CommercialHeader product={product} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <CommercialFooter product={product} />
    </>
  );
}

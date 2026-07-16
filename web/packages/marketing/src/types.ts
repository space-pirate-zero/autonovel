export type DesignSystem = "neon" | "phosphor" | "stealth" | "leopard" | "cathode";

export interface SiteConfig {
  name: string;
  product: string;
  baseUrl: string;
  designSystem: DesignSystem;
  description: string;
  storeOpen?: boolean;
}

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author?: string;
  image?: string;
  tags: string[];
  readTime?: string;
  externalUrl?: string;
}

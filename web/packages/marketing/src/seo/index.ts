export {
  organizationJsonLd,
  websiteJsonLd,
  softwareAppJsonLd,
  articleJsonLd,
  faqPageJsonLd,
  breadcrumbJsonLd,
  personJsonLd,
  videoObjectJsonLd,
} from "./structured-data";

export { StructuredData } from "./StructuredData";

export {
  generateSiteMetadata,
  SA9_META,
  SPZ_META,
  STYLELIFT_META,
  DARKWAVE_META,
  GHOSTDECK_META,
  TRADECRAFT_META,
  GROCERY_NINJA_META,
  PHANTOM_TILES_META,
  REWIND_TV_META,
  COUNTRYPLUS_META,
} from "./meta-tags";
export type { SiteMetaConfig, SiteAuthor } from "./meta-tags";

export {
  staticPages,
  localizedPages,
  COMMON_SA9_PAGES,
} from "./sitemap-helpers";
export type { PageEntry } from "./sitemap-helpers";

export {
  standardRobots,
  AI_CRAWLER_USER_AGENTS,
  SEARCH_ENGINE_USER_AGENTS,
  SOCIAL_PREVIEW_USER_AGENTS,
} from "./robots-helpers";
export type { RobotsOptions } from "./robots-helpers";

export { reportWebVitals } from "./web-vitals";

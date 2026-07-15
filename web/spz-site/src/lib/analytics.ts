import { marketing, content, product } from "@sa9/analytics/events";

export function pageview(url: string) {
  product.track("$pageview", { page_path: url });
}

export function trackEvent(
  action: string,
  params?: Record<string, string | number | boolean>
) {
  product.track(action, params);
}

// Clickstream
export function trackNavClick(category: string) {
  product.track("nav_click", { category });
}

export function trackContentView(contentId: string, contentType: string, title: string, source: string) {
  content.articleRead(contentId, title, source);
  product.track("content_view", { content_id: contentId, content_type: contentType, content_title: title, source });
}

export function trackGameBrick(contentId: string, contentType: string, title: string) {
  product.track("game_brick_destroyed", { content_id: contentId, content_type: contentType, content_title: title });
}

export function trackContactOpen() {
  product.track("contact_form_open");
}

// Conversions
export function trackContactSubmit(withOptIn: boolean) {
  marketing.contactSubmitted(withOptIn);
}

export function trackNewsletterSignup() {
  marketing.newsletterSubscribed("footer");
}

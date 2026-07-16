/**
 * Unified CTA configuration for all SA9 marketing sites.
 * Each product defines its primary + secondary actions.
 */

export interface CTAAction {
  label: string;
  href: string;
  event: string;
  variant?: "primary" | "secondary" | "ghost";
}

export interface ProductCTA {
  product: string;
  primary: CTAAction;
  secondary?: CTAAction;
  waitlist?: CTAAction;
}

export const CTA_CONFIG: Record<string, ProductCTA> = {
  "sa9-website": {
    product: "Spaceship Alpha 9",
    primary: {
      label: "Explore Products",
      href: "/products",
      event: "marketing.ctaClicked",
      variant: "primary",
    },
    secondary: {
      label: "Read Dispatches",
      href: "/dispatches",
      event: "marketing.ctaClicked",
      variant: "secondary",
    },
  },
  spz: {
    product: "Space Pirate Zero",
    primary: {
      label: "Join the Crew",
      href: "/waitlist",
      event: "marketing.ctaClicked",
      variant: "primary",
    },
    secondary: {
      label: "Learn More",
      href: "/bio",
      event: "marketing.ctaClicked",
      variant: "secondary",
    },
  },
  stylelift: {
    product: "StyleLift",
    primary: {
      label: "Get Started Free",
      href: "/signup",
      event: "marketing.ctaClicked",
      variant: "primary",
    },
    secondary: {
      label: "See Features",
      href: "/features",
      event: "marketing.ctaClicked",
      variant: "secondary",
    },
    waitlist: {
      label: "Join Waitlist",
      href: "/waitlist",
      event: "marketing.waitlistJoined",
    },
  },
  tradecraft: {
    product: "TradeCraft",
    primary: {
      label: "Join Waitlist",
      href: "/waitlist",
      event: "marketing.waitlistJoined",
      variant: "primary",
    },
  },
  "darkwave-web": {
    product: "DARKWAVE",
    primary: {
      label: "Get Started",
      href: "/sign-up",
      event: "marketing.ctaClicked",
      variant: "primary",
    },
    secondary: {
      label: "View Dashboard",
      href: "/dashboard",
      event: "marketing.ctaClicked",
      variant: "secondary",
    },
  },
  "ghostdeck-web": {
    product: "GhostDeck",
    primary: {
      label: "Join Waitlist",
      href: "/waitlist",
      event: "marketing.waitlistJoined",
      variant: "primary",
    },
    secondary: {
      label: "View Features",
      href: "/features",
      event: "marketing.ctaClicked",
      variant: "secondary",
    },
  },
  countryplus: {
    product: "Country Plus",
    primary: {
      label: "Get Early Access",
      href: "/waitlist",
      event: "marketing.waitlistJoined",
      variant: "primary",
    },
  },
};

export function getCTA(product: string): ProductCTA | undefined {
  return CTA_CONFIG[product];
}

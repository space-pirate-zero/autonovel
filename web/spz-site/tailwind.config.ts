import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-orbitron)", "Orbitron", "ui-monospace", "monospace"],
        headline: ["var(--font-orbitron)", "Orbitron", "ui-monospace", "monospace"],
        body: ["var(--font-space-grotesk)", "Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        "sa9-pink": "var(--sa9-pink)",
        "sa9-magenta": "var(--sa9-magenta)",
        "sa9-hotpink": "var(--sa9-hotpink)",
        "sa9-blush": "var(--sa9-blush)",
        "sa9-cyan": "var(--sa9-cyan)",
        "sa9-red": "var(--sa9-red)",
        "sa9-acid": "var(--sa9-acid)",
        "sa9-orange": "var(--sa9-orange)",
        "sa9-surface": "var(--sa9-surface)",
        "sa9-surface-raised": "var(--sa9-surface-raised)",
        "sa9-surface-overlay": "var(--sa9-surface-overlay)",
        "sa9-border": "var(--sa9-border)",
        "sa9-text": "var(--sa9-text)",
        "sa9-text-muted": "var(--sa9-text-muted)",
        "sa9-text-dim": "var(--sa9-text-dim)",
        "sa9-pink-shadow": "var(--sa9-pink-shadow)",
        "sa9-cyan-shadow": "var(--sa9-cyan-shadow)",
        /* Cyber token aliases — used by content detail pages */
        "cyber-cyan": "var(--sa9-cyan)",
        "cyber-magenta": "var(--sa9-pink)",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

import type { Config } from "tailwindcss";

// INSURGENT design tokens (ported from books/digital-insurgency/design/).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#030303",
        panel: "#0d0d12",
        panel2: "#14141c",
        line: "rgba(255,255,255,0.10)",
        ink: "#ececf2",
        mut: "#8a8a97",
        pink: "#ff1493",
        cyan: "#00f0ff",
        amber: "#ffab00",
        acid: "#b6ff3a",
        danger: "#ff1744",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        neonPink: "0 0 20px rgba(255,20,147,0.45)",
        neonCyan: "0 0 20px rgba(0,240,255,0.45)",
      },
    },
  },
  plugins: [],
};
export default config;

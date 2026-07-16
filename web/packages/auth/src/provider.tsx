import { dark } from "@clerk/themes";
import type { Appearance } from "@clerk/types";

/** SA9 dark theme defaults for Clerk components. */
export const sa9ClerkAppearance: Appearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: "#00f0ff",
    colorBackground: "#0a0a0a",
    colorInputBackground: "#111111",
    colorInputText: "#f0f0f0",
    colorText: "#f0f0f0",
    colorTextSecondary: "#888888",
    borderRadius: "0px",
    fontFamily: "'Space Grotesk', 'JetBrains Mono', monospace",
  },
  elements: {
    card: "bg-[#0a0a0a] border-[3px] border-[#222222] shadow-[4px_4px_0_rgba(0,0,0,0.5)]",
    headerTitle: "text-white font-['Orbitron'] uppercase tracking-widest",
    headerSubtitle: "text-[#888888] font-['Space_Grotesk']",
    formButtonPrimary:
      "bg-[#00f0ff] border-[3px] border-[#00f0ff] text-[#030303] hover:bg-[#00f0ff]/90 font-['Orbitron'] uppercase tracking-widest rounded-none shadow-[4px_4px_0_#005566]",
    formFieldInput:
      "bg-[#111111] border-[3px] border-[#222222] text-[#f0f0f0] font-['JetBrains_Mono'] rounded-none focus:border-[#00f0ff] focus:shadow-[0_0_8px_rgba(0,240,255,0.3)]",
    formFieldLabel:
      "text-[#888888] font-['Orbitron'] uppercase text-xs tracking-wider",
    footerActionLink:
      "text-[#00f0ff] hover:text-[#ff1493] font-['Space_Grotesk']",
    socialButtonsBlockButton:
      "bg-[#111111] border-[3px] border-[#222222] text-[#888888] font-['Space_Grotesk'] rounded-none hover:bg-[#222222] hover:border-[#00f0ff]",
  },
};

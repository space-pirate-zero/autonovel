import { ClerkProvider } from "@clerk/nextjs";
import { sa9ClerkAppearance } from "@sa9/auth/provider";
import { hasValidClerkKey } from "@sa9/auth/middleware";
import { Orbitron, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import { SA9Analytics } from "@sa9/analytics/provider";
import { NeuroTelemetry } from "@sa9/analytics/neuro-telemetry";
import { MatrixRain } from "@/components/MatrixRain";
import { CelShadeFilter } from "@/components/layout/CelShadeFilter";
import { SA9_META } from "@sa9/marketing/seo";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-orbitron",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata = SA9_META;

export const viewport = {
  themeColor: "#ff1493",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${orbitron.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <head />
      <body className="film-grain scanlines min-h-screen flex flex-col bg-sa9-surface text-sa9-text antialiased">
        <MatrixRain />
        <Suspense fallback={null}>
          <SA9Analytics product="sa9-website" />
        </Suspense>
        <NeuroTelemetry />
        {hasValidClerkKey() ? (
          <ClerkProvider appearance={sa9ClerkAppearance}>
            <CelShadeFilter />
            {children}
          </ClerkProvider>
        ) : (
          <>
            <CelShadeFilter />
            {children}
          </>
        )}
      </body>
    </html>
  );
}

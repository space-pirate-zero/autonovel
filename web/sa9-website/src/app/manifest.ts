import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Spaceship Alpha 9",
    short_name: "SA9",
    description: "AI-native indie software studio. 6 products. Zero VC.",
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#ff1493",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

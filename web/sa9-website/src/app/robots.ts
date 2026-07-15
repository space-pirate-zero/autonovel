import type { MetadataRoute } from "next";
import { standardRobots } from "@sa9/marketing/seo";

export default function robots(): MetadataRoute.Robots {
  return standardRobots("https://spaceshipalpha9.co/sitemap.xml", {
    socialAllowPaths: ["/api/og"],
  });
}

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private or utility pages that should not show up in search results.
      disallow: [
        "/dashboard",
        "/settings",
        "/password",
        "/blocked",
        "/disabled",
        "/404",
        "/429",
        "/error",
        "/auth/link-account",
      ],
    },
    sitemap: "https://linkkk.dev/sitemap.xml",
  };
}

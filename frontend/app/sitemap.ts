import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://linkkk.dev";
  const lastModified = new Date();

  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/auth/login`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/auth/register`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/docs/getting-started`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/docs/links`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/docs/analytics`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/docs/rules`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/docs/qr`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/docs/plans`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/docs/security`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/legal/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/cookies`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/notice`, lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}

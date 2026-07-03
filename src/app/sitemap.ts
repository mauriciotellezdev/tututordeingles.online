import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-posts";

const BASE =
  process.env.NEXT_PUBLIC_APP_URL || "https://tututordeingles.online";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${BASE}/clases-de-ingles-en-tehuacan`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${BASE}/clases-de-ingles-experiencias`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE}/english-for-job-interviews`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE}/ingles-para-entrevistas-de-trabajo`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${BASE}/aviso-de-privacidad`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.2,
    },
    {
      url: `${BASE}/terminos`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.2,
    },
    {
      url: `${BASE}/reembolsos`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.2,
    },
  ];

  const landingEntries: MetadataRoute.Sitemap = blogPosts
    .filter((post) => post.kind === "landing")
    .map((post) => ({
      url: `${BASE}/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts
    .filter((post) => post.kind === "blog")
    .map((post) => ({
      url: `${BASE}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  return [...staticPages, ...landingEntries, ...blogEntries];
}

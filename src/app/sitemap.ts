import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-posts";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://tututordeingles.online";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${BASE}/english-for-job-interviews`,
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
  ];

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogEntries];
}

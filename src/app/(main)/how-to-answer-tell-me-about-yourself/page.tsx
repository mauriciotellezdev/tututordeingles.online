import type { Metadata } from "next/types";
import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/blog-posts";
import { LandingPage } from "@/shared/seo/landing-page";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://tututordeingles.online";
const slug = "how-to-answer-tell-me-about-yourself";

const post = blogPosts.find((item) => item.slug === slug && item.kind === "landing");

export const metadata: Metadata = post
  ? {
      title: `${post.title} | Tu Tutor de Inglés`,
      description: post.description,
      metadataBase: new URL(BASE),
      alternates: {
        canonical: `${BASE}/${slug}`,
      },
    }
  : {};

export default function Page() {
  if (!post) notFound();

  return (
    <LandingPage
      post={post}
      hubHref="/english-for-job-interviews"
      hubLabel="English for Job Interviews"
      pageUrl={`${BASE}/${slug}`}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "English for Job Interviews", href: "/english-for-job-interviews" },
        { label: post.title, href: `/how-to-answer-tell-me-about-yourself` },
      ]}
      relatedSlugs={post.relatedSlugs}
    />
  );
}

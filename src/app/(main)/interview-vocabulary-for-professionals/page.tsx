import type { Metadata } from "next/types";
import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/blog-posts";
import { LandingPage } from "@/shared/seo/landing-page";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://tututordeingles.online";
const slug = "interview-vocabulary-for-professionals";

const post = blogPosts.find((item) => item.slug === slug && item.kind === "landing");

export const metadata: Metadata = post
  ? {
      title: `${post.title} | Tu Tutor de Inglés`,
      description: post.description,
      metadataBase: new URL(BASE),
      alternates: {
        canonical: `${BASE}/${slug}`,
      },
      openGraph: {
        title: `${post.title} | Tu Tutor de Inglés`,
        description: post.description,
        url: `${BASE}/${slug}`,
        siteName: "Tu Tutor de Inglés",
        locale: "en_US",
        type: "article",
        images: [
          {
            url: "/og-default.svg",
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${post.title} | Tu Tutor de Inglés`,
        description: post.description,
        images: ["/og-default.svg"],
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
        { label: post.title, href: `/interview-vocabulary-for-professionals` },
      ]}
      relatedSlugs={post.relatedSlugs}
    />
  );
}

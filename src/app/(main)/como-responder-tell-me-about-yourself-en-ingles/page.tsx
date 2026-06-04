import type { Metadata } from "next/types";
import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/blog-posts";
import { LandingPage } from "@/shared/seo/landing-page";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://tututordeingles.online";
const OG_IMAGE = "/og-interviews-es.svg";
const slug = "como-responder-tell-me-about-yourself-en-ingles";
const englishSlug = "how-to-answer-tell-me-about-yourself";
const hubSlug = "ingles-para-entrevistas-de-trabajo";

const post = blogPosts.find((item) => item.slug === slug && item.kind === "landing");

export const metadata: Metadata = post
  ? {
      title: `${post.title} | Tu Tutor de Inglés`,
      description: post.description,
      metadataBase: new URL(BASE),
      alternates: {
        canonical: `${BASE}/${slug}`,
        languages: {
          "es-MX": `${BASE}/${slug}`,
          "en-US": `${BASE}/${englishSlug}`,
          "x-default": `${BASE}/${slug}`,
        },
      },
      openGraph: {
        title: `${post.title} | Tu Tutor de Inglés`,
        description: post.description,
        url: `${BASE}/${slug}`,
        siteName: "Tu Tutor de Inglés",
        locale: "es_MX",
        type: "article",
        images: [
        {
            url: OG_IMAGE,
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
        images: [OG_IMAGE],
      },
    }
  : {};

export default function Page() {
  if (!post) notFound();

  return (
    <LandingPage
      post={post}
      lang="es-MX"
      hubHref={`/${hubSlug}`}
      hubLabel="Inglés para Entrevistas de Trabajo"
      alternateHref={`/${englishSlug}`}
      alternateLabel="English"
      pageUrl={`${BASE}/${slug}`}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Inglés para Entrevistas de Trabajo", href: `/${hubSlug}` },
        { label: post.title, href: `/${slug}` },
      ]}
      relatedSlugs={post.relatedSlugs}
    />
  );
}

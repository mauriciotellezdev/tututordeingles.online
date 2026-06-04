import type { Metadata } from "next/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/blog-posts";
import { Button } from "@/shared/ui/button";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://tututordeingles.online";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};

  return {
    title: `${post.title} | Tu Tutor de Inglés`,
    description: post.description,
    metadataBase: new URL(BASE),
    alternates: {
      canonical: `${BASE}/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4 md:px-8">
      <div className="absolute left-[-10%] top-[10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none fixed" />
      <div className="absolute right-[-10%] bottom-[10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none fixed" />

      <article className="max-w-3xl mx-auto relative z-10">
        <Link
          href="/blog"
          className="text-blue-400 text-xs hover:underline mb-8 inline-block"
        >
          ← Back to Blog
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
          {post.title}
        </h1>
        <time className="text-white/30 text-sm">{post.date}</time>

        <div className="mt-10 space-y-5 text-white/60 text-base leading-relaxed">
          {post.content.map((paragraph, i) => {
            if (paragraph.startsWith("## ")) {
              return (
                <h2 key={i} className="text-xl font-bold text-white pt-6 -mb-2">
                  {paragraph.replace("## ", "")}
                </h2>
              );
            }
            if (paragraph.startsWith("---")) {
              return <hr key={i} className="border-white/[0.08] my-8" />;
            }
            if (paragraph.startsWith("**")) {
              return (
                <p key={i} className="text-white font-semibold">
                  {paragraph.replace(/\*\*/g, "")}
                </p>
              );
            }
            return <p key={i}>{paragraph}</p>;
          })}
        </div>

        <hr className="border-white/[0.08] my-12" />

        <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-3">
            Practice These Questions One-on-One
          </h2>
          <p className="text-white/50 text-sm mb-6 max-w-md mx-auto leading-relaxed">
            Get personalized interview practice with a native English speaker.
            We'll run through real questions and give you feedback in real time.
          </p>
          <Link href="/signup">
            <Button className="bg-blue-500 hover:bg-blue-400 text-white rounded-full px-8 py-6 text-sm font-semibold shadow-lg shadow-blue-500/20">
              Book a Practice Session
            </Button>
          </Link>
        </div>
      </article>
    </main>
  );
}

import type { Metadata } from "next/types";
import Link from "next/link";
import { blogPosts } from "@/lib/blog-posts";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://tututordeingles.online";

export const metadata: Metadata = {
  title: "Blog | Tu Tutor de Inglés",
  description:
    "English learning tips, interview preparation guides, and resources for Spanish-speaking professionals.",
  metadataBase: new URL(BASE),
  alternates: {
    canonical: `${BASE}/blog`,
  },
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4 md:px-8">
      <div className="absolute left-[-10%] top-[10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none fixed" />
      <div className="absolute right-[-10%] bottom-[10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none fixed" />

      <div className="max-w-3xl mx-auto relative z-10">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
          Blog
        </h1>
        <p className="text-white/40 text-sm mb-12">
          English learning guides, interview tips, and career advice for
          Spanish-speaking professionals.
        </p>

        <div className="space-y-6">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <article className="bg-[#0f1729]/40 border border-white/[0.08] rounded-xl p-6 backdrop-blur-sm hover:bg-[#0f1729]/60 transition-colors">
                <time className="text-white/30 text-xs">{post.date}</time>
                <h2 className="text-white font-semibold text-lg mt-1 mb-2 leading-snug">
                  {post.title}
                </h2>
                <p className="text-white/40 text-sm leading-relaxed">
                  {post.description}
                </p>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

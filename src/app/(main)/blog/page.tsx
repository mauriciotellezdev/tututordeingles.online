import type { Metadata } from "next/types";
import Link from "next/link";
import { blogPosts, getReadingTime } from "@/lib/blog-posts";

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

const categories = [
  { id: "Interviews", label: "Interviews", coming: false },
  { id: "Business English", label: "Business English", coming: true },
  { id: "Software Developers", label: "Software Developers", coming: true },
  { id: "Speaking Fluency", label: "Speaking Fluency", coming: true },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4 md:px-8">
      <div className="absolute left-[-10%] top-[10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none fixed" />
      <div className="absolute right-[-10%] bottom-[10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none fixed" />

      <div className="max-w-3xl mx-auto relative z-10">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">
          Blog
        </h1>
        <p className="text-white/40 text-sm mb-12 max-w-lg">
          English learning guides, interview tips, and career advice for
          Spanish-speaking professionals.
        </p>

        <div className="space-y-12">
          {categories.map((cat) => {
            const posts = blogPosts.filter((p) => p.category === cat.id);

            return (
              <section key={cat.id}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-white/70 font-semibold text-sm tracking-wider uppercase">
                    {cat.label}
                  </h2>
                  <div className="h-px flex-1 bg-white/[0.06]" />
                  {cat.coming && (
                    <span className="text-[10px] font-medium text-white/20 uppercase tracking-wider">
                      Coming soon
                    </span>
                  )}
                </div>

                {posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map((post, i) => {
                      const readTime = getReadingTime(post.content);
                      return (
                        <Link key={post.slug} href={`/blog/${post.slug}`}>
                          <article className="group bg-[#0f1729]/30 border border-white/[0.08] rounded-xl p-5 backdrop-blur-sm hover:bg-[#0f1729]/60 hover:border-white/[0.12] transition-all">
                            <div className="flex items-center gap-2 text-white/25 text-xs mb-2">
                              <span>{readTime} min read</span>
                              <span>&middot;</span>
                              <span>{post.date}</span>
                            </div>
                            <h3 className="text-white font-semibold text-base mb-1.5 leading-snug group-hover:text-blue-300 transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-white/40 text-sm leading-relaxed">
                              {post.description}
                            </p>
                          </article>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-[#0f1729]/20 border border-white/[0.04] rounded-xl p-5">
                    <p className="text-white/20 text-sm">
                      Articles coming soon. {cat.coming ? "Check back for guides on this topic." : ""}
                    </p>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}

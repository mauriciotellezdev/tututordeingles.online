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
  { id: "Interviews", label: "Interviews" },
  { id: "Business English", label: "Business English" },
  { id: "Software Developers", label: "Software Developers" },
  { id: "Speaking Fluency", label: "Speaking Fluency" },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4 md:px-8">
      <div className="max-w-3xl mx-auto relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
          Blog
        </h1>
        <p className="text-zinc-400 text-base mb-14 max-w-lg leading-relaxed">
          English learning guides, interview tips, and career advice for
          Spanish-speaking professionals.
        </p>

        <div className="space-y-14">
          {categories.map((cat) => {
            const posts = blogPosts.filter((p) => p.category === cat.id);

            return (
              <section key={cat.id}>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-zinc-400 font-semibold text-xs tracking-wider uppercase">
                    {cat.label}
                  </h2>
                  <div className="h-px flex-1 bg-zinc-800" />
                </div>

                {posts.length > 0 ? (
                  <div className="space-y-6">
                    {posts.map((post) => {
                      const readTime = getReadingTime(post.content);
                      return (
                        <Link key={post.slug} href={`/blog/${post.slug}`}>
                          <article className="group">
                            <div className="flex items-center gap-2 text-zinc-600 text-xs mb-1.5">
                              <span>{readTime} min read</span>
                              <span>&middot;</span>
                              <span>{post.date}</span>
                            </div>
                            <h3 className="text-white font-semibold text-lg mb-1 leading-snug group-hover:text-zinc-300 transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-zinc-500 text-sm leading-relaxed">
                              {post.description}
                            </p>
                          </article>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}

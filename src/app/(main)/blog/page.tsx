import type { Metadata } from "next/types";
import Link from "next/link";
import { ArrowRight, CalendarDays, Sparkles } from "lucide-react";
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

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

export default function BlogPage() {
  return (
    <main className="relative isolate overflow-hidden bg-[#070b14] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),_rgba(7,11,20,0.15)_48%,_rgba(7,11,20,0)_100%)]" />
      <div className="pointer-events-none absolute left-[-10rem] top-24 -z-10 h-[22rem] w-[22rem] rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-40 -z-10 h-[20rem] w-[20rem] rounded-full bg-amber-400/10 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/65 shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            Editorial blog
          </div>

          <h1 className="font-heading text-5xl font-medium tracking-tight text-white sm:text-6xl lg:text-7xl">
            Clear, readable English guides that feel like a real publication.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68 sm:text-xl">
            Interview prep, career English, and practical fluency advice for
            Spanish-speaking professionals. The writing is direct, the layout is
            calm, and the reading experience is built to feel polished.
          </p>
        </div>

        <div className="mt-14 grid gap-8">
          {categories.map((cat) => {
            const posts = blogPosts.filter((p) => p.kind === "blog" && p.category === cat.id);

            if (!posts.length) return null;

            return (
              <section key={cat.id}>
                <div className="mb-5 flex items-center gap-4">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">
                    {cat.label}
                  </h2>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {posts.map((post) => {
                    const readTime = getReadingTime(post.content);

                    return (
                      <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                        <article className="flex h-full flex-col rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.65)] transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-[0_30px_70px_-30px_rgba(0,0,0,0.78)]">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
                            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 font-medium text-white/80">
                              {cat.label}
                            </span>
                            <span className="text-white/18">•</span>
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {formatDate(post.date)}
                            </span>
                            <span className="text-white/18">•</span>
                            <span>{readTime} min read</span>
                          </div>

                          <h3 className="mt-5 font-heading text-2xl font-medium leading-tight tracking-tight text-white transition-colors group-hover:text-blue-300 sm:text-[2rem]">
                            {post.title}
                          </h3>

                          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/64 sm:text-base">
                            {post.description}
                          </p>

                          <div className="mt-auto flex items-center justify-between pt-8">
                            <div className="text-xs font-medium uppercase tracking-[0.24em] text-white/35">
                              Read article
                            </div>
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60 transition group-hover:border-blue-400/30 group-hover:bg-blue-400/10 group-hover:text-blue-200">
                              <ArrowRight className="h-4 w-4" />
                            </span>
                          </div>
                        </article>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}

import type { Metadata } from "next/types";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  Sparkles,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Breadcrumbs } from "@/shared/seo/breadcrumbs";
import { ShareBar } from "@/shared/social/share-bar";
import { blogPosts, getReadingTime } from "@/lib/blog-posts";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://tututordeingles.online";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.filter((post) => post.kind === "blog").map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug && p.kind === "blog");
  if (!post) return {};

  return {
    title: `${post.title} | Tu Tutor de Inglés`,
    description: post.description,
    metadataBase: new URL(BASE),
    alternates: {
      canonical: `${BASE}/blog/${post.slug}`,
    },
    openGraph: {
      title: `${post.title} | Tu Tutor de Inglés`,
      description: post.description,
      url: `${BASE}/blog/${post.slug}`,
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
  };
}

interface TocItem {
  number: string;
  title: string;
  id: string;
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

function extractToc(content: string[]): TocItem[] {
  return content
    .filter((line) => line.startsWith("## "))
    .map((line) => {
      const raw = line.replace("## ", "");
      const match = raw.match(/^(\d+)\.\s+(.+)/);
      if (match) {
        return {
          number: match[1],
          title: match[2],
          id: `q-${match[1]}`,
        };
      }

      return {
        number: "",
        title: raw,
        id: raw.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      };
    });
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  const pattern = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      nodes.push(text.slice(cursor, match.index));
    }

    if (match[1]) {
      nodes.push(
        <strong key={`${match.index}-bold`} className="font-semibold text-white">
          {match[1]}
        </strong>
      );
    } else {
      nodes.push(
        <a
          key={`${match.index}-link`}
          href={match[3]}
          className="font-medium text-blue-300 underline decoration-blue-400/30 underline-offset-4 transition hover:text-blue-200 hover:decoration-blue-300"
        >
          {match[2]}
        </a>
      );
    }

    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes.length ? nodes : [text];
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug && p.kind === "blog");
  if (!post) notFound();

  const readTime = getReadingTime(post.content);
  const toc = extractToc(post.content);
  const headings = post.content.filter((line) => line.startsWith("## "));

  const blogOnly = blogPosts.filter((p) => p.kind === "blog");
  const currentIndex = blogOnly.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? blogOnly[currentIndex - 1] : null;
  const nextPost = currentIndex < blogOnly.length - 1 ? blogOnly[currentIndex + 1] : null;

  const related = post.relatedSlugs
    .map((relatedSlug) => blogPosts.find((p) => p.slug === relatedSlug))
    .filter(Boolean) as typeof blogPosts;
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: post.title, href: `/blog/${post.slug}` },
  ];
  const postJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: `${BASE}/blog/${post.slug}`,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "en",
    author: {
      "@type": "Organization",
      name: "Tu Tutor de Inglés",
    },
    publisher: {
      "@type": "Organization",
      name: "Tu Tutor de Inglés",
      url: BASE,
    },
  };

  const introLines: string[] = [];
  let summaryLine = "";
  let hitFirstHeading = false;

  for (const line of post.content) {
    if (line.startsWith("\u{1F4D8}")) {
      summaryLine = line;
      continue;
    }

    if (line.startsWith("## ")) {
      hitFirstHeading = true;
      continue;
    }

    if (!hitFirstHeading && line !== "") {
      introLines.push(line);
    }
  }

  const outroStart = post.content.findLastIndex((line) => line.startsWith("---"));
  const outroLines = outroStart >= 0 ? post.content.slice(outroStart + 1).filter((line) => line !== "") : [];

  return (
    <main className="relative isolate overflow-hidden bg-[#070b14] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd) }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_rgba(7,11,20,0.16)_52%,_rgba(7,11,20,0)_100%)]" />
      <div className="pointer-events-none absolute left-[-8rem] top-28 -z-10 h-[20rem] w-[20rem] rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-7rem] top-[32rem] -z-10 h-[18rem] w-[18rem] rounded-full bg-emerald-400/8 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Breadcrumbs items={breadcrumbItems} />
          <Link
            href="/blog"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/65 shadow-sm backdrop-blur transition hover:border-white/20 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to blog
          </Link>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <article className="min-w-0">
            <div className="rounded-[2.25rem] border border-white/10 bg-white/[0.04] px-6 py-8 shadow-[0_24px_80px_-45px_rgba(0,0,0,0.78)] backdrop-blur sm:px-8 sm:py-10 lg:px-10 lg:py-12">
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 font-medium text-white/80">
                  {post.category}
                </span>
                <span className="text-white/18">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" />
                  {readTime} min read
                </span>
                <span className="text-white/18">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(post.date)}
                </span>
              </div>

              <h1 className="mt-5 max-w-4xl font-heading text-4xl font-medium tracking-tight text-white sm:text-5xl lg:text-6xl">
                {post.title}
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/68 sm:text-xl">
                {post.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup">
                  <Button className="rounded-full bg-white px-6 py-5 text-sm font-semibold text-slate-950 transition hover:bg-blue-100">
                    Book a Practice Session
                  </Button>
                </Link>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/55">
                  <BookOpen className="mr-2 h-3.5 w-3.5" />
                  Structured for fast scanning
                </span>
              </div>

              <div className="mt-8">
                <ShareBar
                  title={post.title}
                  description={post.description}
                  url={`${BASE}/blog/${post.slug}`}
                  label="Share this article"
                  ctaLabel="Copy or send the link to your network."
                />
              </div>

              {summaryLine && (
                <div className="mt-10 rounded-3xl border border-blue-400/15 bg-blue-500/10 px-5 py-5 text-sm leading-7 text-white/78">
                  <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Summary
                  </div>
                  <p>{renderInlineMarkdown(summaryLine)}</p>
                </div>
              )}

              {toc.length > 0 && (
                <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-5 lg:hidden">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                    Jump to section
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/70 transition hover:border-blue-400/30 hover:text-white"
                      >
                        {item.number ? `${item.number}. ` : ""}
                        {item.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-12 space-y-8">
                {introLines.map((line) => (
                  <p
                    key={line}
                    className="max-w-3xl text-[1.04rem] leading-8 text-white/78"
                  >
                    {renderInlineMarkdown(line)}
                  </p>
                ))}
              </div>

              <div className="mt-14 space-y-6">
                {headings.map((heading) => {
                  const raw = heading.replace("## ", "");
                  const match = raw.match(/^(\d+)\.\s+(.+)/);
                  const num = match ? match[1] : "";
                  const title = match ? match[2] : raw;
                  const id = match ? `q-${match[1]}` : raw.toLowerCase().replace(/[^a-z0-9]+/g, "-");

                  const idx = post.content.indexOf(heading);
                  const blockLines: string[] = [];
                  for (let i = idx + 1; i < post.content.length; i += 1) {
                    const line = post.content[i];
                    if (line.startsWith("## ")) break;
                    blockLines.push(line);
                  }

                  let description = "";
                  let sampleAnswer = "";
                  let whyThisWorks = "";

                  for (const line of blockLines) {
                    if (line.startsWith("**Why this works:")) {
                      whyThisWorks = line.replace("**Why this works:** ", "").replace("**Why this works:**", "");
                    } else if (line.startsWith("**Sample answer:") || line.startsWith("**Sample questions:")) {
                      sampleAnswer = line
                        .replace(/\*\*Sample answer:\*\*\s*"?/, "")
                        .replace(/\*\*Sample questions:\*\*\s*"?/, "")
                        .replace(/"$/, "");
                    } else {
                      description = line;
                    }
                  }

                  const hasNext = headings.indexOf(heading) < headings.length - 1;

                  return (
                    <section
                      key={id}
                      id={id}
                      className="scroll-mt-32 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_12px_30px_-24px_rgba(0,0,0,0.7)] sm:p-7"
                    >
                      <div className="flex items-start gap-4">
                        <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm font-semibold text-white/55 shadow-sm">
                          {num || "§"}
                        </span>
                        <div className="min-w-0">
                          <h2 className="font-heading text-2xl font-medium tracking-tight text-white sm:text-[2rem]">
                            {title}
                          </h2>
                          <p className="mt-3 text-[1.02rem] leading-8 text-white/72">
                            {renderInlineMarkdown(description)}
                          </p>
                        </div>
                      </div>

                      {sampleAnswer && (
                        <blockquote className="mt-6 rounded-3xl border border-white/10 bg-black/20 px-5 py-5">
                          <p className="text-[1rem] leading-8 text-white/78">
                            <span className="mr-2 inline-block align-top text-2xl leading-none text-white/20">
                              “
                            </span>
                            {renderInlineMarkdown(sampleAnswer)}
                            <span className="ml-1 inline-block align-bottom text-2xl leading-none text-white/20">
                              ”
                            </span>
                          </p>
                        </blockquote>
                      )}

                      {whyThisWorks && (
                        <div className="mt-6 rounded-3xl border border-emerald-400/15 bg-emerald-500/10 p-5">
                          <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
                            Why this works
                          </div>
                          <p className="text-sm leading-7 text-emerald-50/80">
                            {renderInlineMarkdown(whyThisWorks)}
                          </p>
                        </div>
                      )}

                      {hasNext && <div className="mt-8 h-px bg-white/10" />}
                    </section>
                  );
                })}
              </div>

              <div className="mt-14 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-7">
                <div className="space-y-4 text-[0.98rem] leading-8 text-white/72">
                  {outroLines.map((line) => {
                    if (line.startsWith("- ")) {
                      return (
                        <p
                          key={line}
                          className="border-l-2 border-white/15 pl-4 text-white/62"
                        >
                          {renderInlineMarkdown(line.replace("- ", ""))}
                        </p>
                      );
                    }

                    return <p key={line}>{renderInlineMarkdown(line)}</p>;
                  })}
                </div>
              </div>

              <div className="mt-14 rounded-[2rem] border border-blue-400/15 bg-blue-500/10 p-6 sm:p-8">
                <div className="max-w-2xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-300">
                    Next step
                  </p>
                  <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight text-white sm:text-[2rem]">
                    Ready to practice these answers out loud?
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-white/68 sm:text-base">
                    Reading polished examples helps. Practicing them with a tutor
                    who can correct your wording, timing, and pronunciation is
                    what makes them usable in a real interview.
                  </p>
                  <div className="mt-6">
                    <Link href="/signup">
                      <Button className="rounded-full bg-white px-6 py-5 text-sm font-semibold text-slate-950 transition hover:bg-blue-100">
                        Book a practice session
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {prevPost ? (
                <Link href={`/blog/${prevPost.slug}`} className="group">
                  <div className="h-full rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/20 hover:bg-white/[0.06]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                      Previous article
                    </p>
                    <p className="mt-3 font-heading text-xl font-medium tracking-tight text-white group-hover:text-blue-300">
                      {prevPost.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/64">
                      {prevPost.description}
                    </p>
                    <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white/55">
                      <ArrowLeft className="h-4 w-4" />
                      Continue reading
                    </p>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {nextPost ? (
                <Link href={`/blog/${nextPost.slug}`} className="group">
                  <div className="h-full rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 text-right transition hover:border-white/20 hover:bg-white/[0.06]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                      Next article
                    </p>
                    <p className="mt-3 font-heading text-xl font-medium tracking-tight text-white group-hover:text-blue-300">
                      {nextPost.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/64">
                      {nextPost.description}
                    </p>
                    <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white/55">
                      Continue reading
                      <ArrowRight className="h-4 w-4" />
                    </p>
                  </div>
                </Link>
              ) : (
                <div />
              )}
            </div>

            {related.length > 0 && (
              <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                    Related articles
                  </h2>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {related.map((article) => (
                    <Link
                      key={article.slug}
                      href={article.kind === "blog" ? `/blog/${article.slug}` : `/${article.slug}`}
                      className="group"
                    >
                      <div className="h-full rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 transition hover:border-blue-400/20 hover:bg-blue-500/5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                          {article.category}
                        </p>
                        <p className="mt-3 font-heading text-lg font-medium tracking-tight text-white group-hover:text-blue-300">
                          {article.title}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/64">
                          {article.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          <aside className="hidden lg:block lg:sticky lg:top-28 self-start">
            <div className="space-y-5">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.7)] backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                  On this page
                </p>
                <nav className="mt-4 space-y-2">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="group flex items-start gap-3 rounded-2xl px-3 py-2 text-sm text-white/64 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35 group-hover:text-white/55">
                        {item.number || "§"}
                      </span>
                      <span className="leading-6">{item.title}</span>
                    </a>
                  ))}
                </nav>
              </div>

              <div className="rounded-[2rem] border border-blue-400/15 bg-blue-500/10 p-5 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.75)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-300">
                  Need live practice?
                </p>
                <p className="mt-3 text-sm leading-7 text-white/68">
                  Reading gives you structure. Speaking with feedback makes it
                  usable.
                </p>
                <Link href="/signup" className="mt-5 inline-flex">
                  <Button className="rounded-full bg-white px-5 py-5 text-sm font-semibold text-slate-950 transition hover:bg-blue-100">
                    Book a session
                  </Button>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

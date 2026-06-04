import type { Metadata } from "next/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/blog-posts";
import { getReadingTime } from "@/lib/blog-posts";
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

interface TocItem {
  number: string;
  title: string;
  id: string;
}

function extractToc(content: string[]): TocItem[] {
  return content
    .filter((l) => l.startsWith("## "))
    .map((l) => {
      const raw = l.replace("## ", "");
      const match = raw.match(/^(\d+)\.\s+(.+)/);
      if (match) {
        return {
          number: match[1],
          title: match[2],
          id: `q-${match[1]}`,
        };
      }
      return { number: "", title: raw, id: raw.toLowerCase().replace(/[^a-z0-9]+/g, "-") };
    });
}

function mdLinks(text: string) {
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(
      <a key={match.index} href={match[2]} className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">
        {match[1]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length ? parts : text;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const readTime = getReadingTime(post.content);
  const toc = extractToc(post.content);

  const allPosts = [...blogPosts];
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  const related = post.relatedSlugs
    .map((s) => blogPosts.find((p) => p.slug === s))
    .filter(Boolean) as typeof blogPosts;

  let summaryLine = "";
  const introLines: string[] = [];
  let questionsStarted = false;

  for (const line of post.content) {
    if (line.startsWith("\u{1F4D8}")) {
      summaryLine = line;
      continue;
    }
    if (line.startsWith("## ")) {
      questionsStarted = true;
      continue;
    }
    if (!questionsStarted && line !== "") {
      introLines.push(line);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto relative z-10">
        <Link
          href="/blog"
          className="text-zinc-500 hover:text-zinc-300 text-xs font-medium transition-colors mb-8 inline-block"
        >
          &larr; Back to Blog
        </Link>

        <div className="flex items-center gap-3 mb-5">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full">
            {post.category}
          </span>
          <span className="text-zinc-600 text-xs">&middot;</span>
          <span className="text-zinc-500 text-xs">{readTime} min read</span>
          <span className="text-zinc-600 text-xs">&middot;</span>
          <span className="text-zinc-500 text-xs">{post.date}</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight tracking-tight">
          {post.title}
        </h1>

        <p className="text-xl leading-8 text-zinc-300 mb-2 max-w-3xl">
          {post.description}
        </p>

        <hr className="border-zinc-800 my-10" />

        {toc.length > 0 && (
          <>
            <p className="text-zinc-500 text-xs font-semibold tracking-wider uppercase mb-4">
              Jump to
            </p>
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 mb-10">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="text-zinc-400 hover:text-white text-sm transition-colors"
                >
                  <span className="text-zinc-600 mr-2">{item.number}.</span>
                  {item.title}
                </a>
              ))}
            </div>
            <hr className="border-zinc-800 my-10" />
          </>
        )}

        {summaryLine && (
          <div className="border-l-2 border-blue-500/40 pl-5 py-1 my-8">
            <p className="text-zinc-400 text-sm leading-relaxed">{summaryLine}</p>
          </div>
        )}

        {introLines.map((line, i) => (
          <p key={i} className="text-zinc-300 text-base leading-7 mb-5 last:mb-0">
            {line}
          </p>
        ))}

        <div className="mt-14 space-y-14">
          {post.content
            .filter((l) => l.startsWith("## "))
            .map((heading) => {
              const raw = heading.replace("## ", "");
              const match = raw.match(/^(\d+)\.\s+(.+)/);
              const num = match ? match[1] : "";
              const title = match ? match[2] : raw;
              const id = match ? `q-${match[1]}` : "";

              const idx = post.content.indexOf(heading);
              const blockLines: string[] = [];
              for (let j = idx + 1; j < post.content.length; j++) {
                const l = post.content[j];
                if (l.startsWith("## ")) break;
                blockLines.push(l);
              }

              let description = "";
              let sampleAnswer = "";
              let whyThisWorks = "";

              for (const l of blockLines) {
                if (l.startsWith("**Why this works:")) {
                  whyThisWorks = l.replace("**Why this works:** ", "").replace("**Why this works:**", "");
                } else if (l.startsWith("**Sample answer:") || l.startsWith("**Sample questions:")) {
                  sampleAnswer = l.replace(/\*\*Sample answer:\*\*\s*"?/, "").replace(/\*\*Sample questions:\*\*\s*"?/, "").replace(/"$/, "");
                } else {
                  description = l;
                }
              }

              const nextQ = post.content
                .filter((l) => l.startsWith("## "))
                .slice(post.content.filter((l) => l.startsWith("## ")).indexOf(heading) + 1);
              const hasNext = nextQ.length > 0;

              return (
                <section key={id} id={id} className="scroll-mt-28">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {num && <span className="text-zinc-500 mr-3">{num}.</span>}
                    {title}
                  </h2>

                  <p className="text-zinc-300 text-base leading-7 mb-5">
                    {description}
                  </p>

                  {sampleAnswer && (
                    <blockquote className="border-l-2 border-zinc-700 pl-6 my-6">
                      <p className="text-zinc-400 text-base leading-7 italic">
                        &ldquo;{sampleAnswer.replace(/^"/, "").replace(/"$/, "")}&rdquo;
                      </p>
                    </blockquote>
                  )}

                  {whyThisWorks && (
                    <div className="flex items-start gap-3 mt-4">
                      <span className="text-[11px] font-semibold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded shrink-0 mt-0.5">
                        Why this works
                      </span>
                      <p className="text-zinc-500 text-sm leading-relaxed">
                        {whyThisWorks}
                      </p>
                    </div>
                  )}

                  {hasNext && <hr className="border-zinc-800 my-14" />}
                </section>
              );
            })}
        </div>

        <hr className="border-zinc-800 my-16" />

        <div className="space-y-4">
          {(() => {
            const sepIdx = post.content.findLastIndex((l) => l.startsWith("---"));
            const outroLines = sepIdx >= 0 ? post.content.slice(sepIdx + 1).filter((l) => l !== "") : [];
            return outroLines.map((line, i) => {
              if (line.startsWith("- ")) {
                return (
                  <p key={i} className="text-zinc-400 text-sm pl-4 border-l-2 border-zinc-800 ml-1">
                    {mdLinks(line.replace("- ", ""))}
                  </p>
                );
              }
              return (
                <p key={i} className="text-zinc-400 text-sm leading-relaxed">
                  {mdLinks(line)}
                </p>
              );
            });
          })()}
        </div>

        <hr className="border-zinc-800 my-16" />

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 md:p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Ready to Practice These Questions?
          </h2>
          <p className="text-zinc-400 text-sm mb-8 max-w-lg mx-auto leading-relaxed">
            Reading answers is useful. Practicing them with a native English tutor
            who gives real-time feedback is better. Book a session and walk into
            your next interview with confidence.
          </p>
          <Link href="/signup">
            <Button className="bg-white hover:bg-zinc-200 text-black rounded-full px-8 py-6 text-sm font-semibold transition-all">
              Book a Practice Session
            </Button>
          </Link>
        </div>

        <hr className="border-zinc-800 my-16" />

        <nav className="flex flex-col sm:flex-row justify-between gap-4 mb-16">
          {prevPost ? (
            <Link
              href={`/blog/${prevPost.slug}`}
              className="group flex-1"
            >
              <span className="text-zinc-600 text-xs tracking-wider uppercase">&larr; Previous</span>
              <p className="text-zinc-300 text-sm mt-1 group-hover:text-white transition-colors">
                {prevPost.title}
              </p>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {nextPost ? (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="group flex-1 text-right"
            >
              <span className="text-zinc-600 text-xs tracking-wider uppercase">Next &rarr;</span>
              <p className="text-zinc-300 text-sm mt-1 group-hover:text-white transition-colors">
                {nextPost.title}
              </p>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </nav>

        {related.length > 0 && (
          <>
            <hr className="border-zinc-800 mb-10" />
            <h2 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Related Articles
            </h2>
            <div className="space-y-3 mb-10">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0"
                >
                  <span className="text-zinc-400 text-sm group-hover:text-white transition-colors">
                    {r.title}
                  </span>
                  <span className="text-zinc-600 text-sm group-hover:text-zinc-400 transition-colors">
                    &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

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
      return {
        number: "",
        title: raw,
        id: raw.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      };
    });
}

interface QuestionBlock {
  number: string;
  title: string;
  id: string;
  description: string[];
  sampleAnswer: string | null;
}

function parseQuestionBlocks(content: string[]): {
  intro: string[];
  questions: QuestionBlock[];
  outro: string[];
} {
  const intro: string[] = [];
  const questions: QuestionBlock[] = [];
  const outro: string[] = [];
  let current: QuestionBlock | null = null;
  let section: "intro" | "questions" | "outro" = "intro";

  for (const line of content) {
    if (line.startsWith("## ")) {
      section = "questions";
      if (current) questions.push(current);
      const raw = line.replace("## ", "");
      const match = raw.match(/^(\d+)\.\s+(.+)/);
      current = {
        number: match ? match[1] : "",
        title: match ? match[2] : raw,
        id: match ? `q-${match[1]}` : raw.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: [],
        sampleAnswer: null,
      };
      continue;
    }

    if (line.startsWith("---")) {
      if (current) questions.push(current);
      current = null;
      section = "outro";
      continue;
    }

    if (section === "intro") {
      intro.push(line);
    } else if (section === "outro") {
      outro.push(line);
    } else if (current) {
      const boldMatch = line.match(/^\*\*(.+?):\*\*\s*(.*)/);
      if (boldMatch) {
        current.sampleAnswer = boldMatch[2] || line.replace(/\*\*/g, "");
      } else {
        current.description.push(line);
      }
    }
  }

  if (current) questions.push(current);

  return { intro, questions, outro };
}

function renderIntro(lines: string[]) {
  return lines.map((line, i) => {
    if (i === 0 && line.startsWith("\u{1F4D8}")) {
      return (
        <div key={i} className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-5 mb-8">
          <p className="text-white/60 text-sm leading-relaxed">{line}</p>
        </div>
      );
    }
    return (
      <p key={i} className="text-white/60 leading-relaxed mb-4 last:mb-0">
        {line}
      </p>
    );
  });
}

function mdLinks(text: string) {
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        className="text-blue-400/70 hover:text-blue-400 underline transition-colors"
      >
        {match[1]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length ? parts : text;
}

function renderOutro(lines: string[]) {
  return lines.map((line, i) => {
    if (line.startsWith("- ")) {
      return (
        <p key={i} className="text-white/50 text-sm pl-4 border-l-2 border-white/[0.08] ml-1 mb-3">
          {mdLinks(line.replace("- ", ""))}
        </p>
      );
    }
    if (line === "") return null;
    return (
      <p key={i} className="text-white/50 text-sm leading-relaxed mb-3 last:mb-0">
        {mdLinks(line)}
      </p>
    );
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const readTime = getReadingTime(post.content);
  const toc = extractToc(post.content);
  const { intro, questions, outro } = parseQuestionBlocks(post.content);

  const related = post.relatedSlugs
    .map((s) => blogPosts.find((p) => p.slug === s))
    .filter(Boolean) as typeof blogPosts;

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4 md:px-8">
      <div className="absolute left-[-10%] top-[10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none fixed" />
      <div className="absolute right-[-10%] bottom-[10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none fixed" />

      <div className="max-w-5xl mx-auto relative z-10 flex gap-10">
        <article className="flex-1 min-w-0 max-w-[680px]">
          <Link
            href="/blog"
            className="text-blue-400/70 hover:text-blue-400 text-xs font-medium transition-colors mb-8 inline-block"
          >
            &larr; Back to Blog
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-400/80 bg-blue-500/10 px-2.5 py-1 rounded-full">
              {post.category}
            </span>
            <span className="text-white/25 text-xs">&middot;</span>
            <span className="text-white/30 text-xs">{readTime} min read</span>
            <span className="text-white/25 text-xs">&middot;</span>
            <span className="text-white/30 text-xs">{post.date}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            {post.title}
          </h1>

          <p className="text-white/50 text-base leading-relaxed mb-2">
            {post.description}
          </p>

          <hr className="border-white/[0.06] my-8" />

          <div className="bg-[#0f1729]/40 border border-white/[0.06] rounded-xl p-5 mb-10">
            <p className="text-white/40 text-xs font-semibold tracking-wider uppercase mb-3">
              Jump to
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="text-white/50 hover:text-blue-400 text-sm transition-colors"
                >
                  <span className="text-white/30 mr-2">{item.number}.</span>
                  {item.title}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-6">{renderIntro(intro)}</div>

          <div className="space-y-10 mt-10">
            {questions.map((q) => (
              <section
                key={q.id}
                id={q.id}
                className="scroll-mt-28 bg-[#0f1729]/20 border border-white/[0.06] rounded-xl p-6"
              >
                <h2 className="text-white font-bold text-lg mb-3 leading-snug">
                  <span className="text-blue-400/70 mr-2">{q.number}.</span>
                  {q.title}
                </h2>

                {q.description.map((desc, i) => {
                  if (desc.startsWith("**")) {
                    return (
                      <p
                        key={i}
                        className="text-yellow-400/70 text-xs font-medium mb-2"
                      >
                        {desc.replace(/\*\*/g, "")}
                      </p>
                    );
                  }
                  if (desc.startsWith("**")) {
                    return (
                      <p
                        key={i}
                        className="text-blue-300/80 text-xs font-medium mb-2"
                      >
                        {desc.replace(/\*\*/g, "")}
                      </p>
                    );
                  }
                  return (
                    <p key={i} className="text-white/50 text-sm leading-relaxed mb-3 last:mb-0">
                      {desc}
                    </p>
                  );
                })}

                {q.sampleAnswer && (
                  <div className="mt-4 bg-[#0a0f1a] border border-white/[0.06] rounded-lg p-4">
                    <p className="text-white/30 text-[11px] font-semibold tracking-wider uppercase mb-2">
                      Sample Answer
                    </p>
                    <p className="text-white/70 text-sm leading-relaxed italic">
                      &ldquo;{q.sampleAnswer.replace(/^"/, "").replace(/"$/, "")}&rdquo;
                    </p>
                  </div>
                )}
              </section>
            ))}
          </div>

          <div className="mt-12 bg-[#0f1729]/40 border border-white/[0.06] rounded-xl p-6">
            <div className="text-white/50 text-sm leading-relaxed space-y-3">
              {renderOutro(outro)}
            </div>
          </div>

          <hr className="border-white/[0.06] my-14" />

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/[0.03] border border-blue-500/15 rounded-2xl p-8 md:p-10 text-center">
            <h2 className="text-xl font-bold text-white mb-3">
              Need Interview Practice?
            </h2>
            <p className="text-white/50 text-sm mb-6 max-w-md mx-auto leading-relaxed">
              Reading answers is useful. Actually speaking them under pressure
              is different. Practice with a native English tutor and receive
              personalized feedback in real time.
            </p>
            <Link href="/signup">
              <Button className="bg-blue-500 hover:bg-blue-400 text-white rounded-full px-8 py-6 text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30">
                Book a Practice Session
              </Button>
            </Link>
          </div>

          <hr className="border-white/[0.06] my-14" />

          <div className="mb-10">
            <h2 className="text-white font-bold text-lg mb-5">
              Related Articles
            </h2>
            <div className="space-y-3">
              {related.length > 0 ? (
                related.map((r) => (
                  <Link key={r.slug} href={`/blog/${r.slug}`}>
                    <div className="group bg-[#0f1729]/20 border border-white/[0.06] rounded-xl p-4 hover:bg-[#0f1729]/50 hover:border-white/[0.10] transition-all">
                      <p className="text-white/40 text-xs mb-1">{r.category}</p>
                      <p className="text-white font-medium text-sm group-hover:text-blue-300 transition-colors">
                        {r.title}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-white/30 text-sm">
                  More articles coming soon. In the meantime, explore our{" "}
                  <Link
                    href="/english-for-job-interviews"
                    className="text-blue-400/70 hover:text-blue-400 underline"
                  >
                    English for Job Interviews
                  </Link>{" "}
                  resource.
                </p>
              )}
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}

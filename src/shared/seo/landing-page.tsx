import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Breadcrumbs } from "@/shared/seo/breadcrumbs";
import { ShareBar } from "@/shared/social/share-bar";
import { blogPosts, getReadingTime, type BlogPost } from "@/lib/blog-posts";

type LandingLang = "en" | "es-MX";

interface LandingFAQ {
  question: string;
  answer: string;
}

interface LandingPageCopy {
  pageTypeLabel: string;
  summaryLabel: string;
  exploreHubLabel: string;
  bookSessionLabel: string;
  nextStepEyebrow: string;
  nextStepTitle: string;
  nextStepBody: string;
  relatedTitle: string;
  faqTitle: string;
  readGuideLabel: string;
  readTimeLabel: string;
  whyThisWorksLabel: string;
  usefulPhrasesLabel: string;
  sampleAnswerLabel: string;
  sampleQuestionsLabel: string;
  sampleSentenceLabel: string;
  shareLabel: string;
  shareCtaLabel: string;
}

interface LandingPageProps {
  post: BlogPost;
  hubHref: string;
  hubLabel: string;
  lang: LandingLang;
  alternateHref?: string;
  alternateLabel?: string;
  copy?: Partial<LandingPageCopy>;
  faqs?: LandingFAQ[];
  relatedSlugs?: string[];
  breadcrumbs: { label: string; href: string }[];
  pageUrl: string;
}

interface Section {
  id: string;
  number: string;
  title: string;
  lines: string[];
}

const EN_FAQS: LandingFAQ[] = [
  {
    question: "How much does a class cost?",
    answer: "Pricing lives on the existing pricing page so visitors can compare options and book without friction.",
  },
  {
    question: "Are the classes one-on-one?",
    answer: "Yes. The tutoring funnel is centered on private one-on-one sessions tailored to the learner's goal.",
  },
  {
    question: "Do I need prior knowledge?",
    answer:
      "No. The content is designed for professionals at different levels, from intermediate learners to advanced speakers refining interview performance.",
  },
  {
    question: "Do you use Google Meet?",
    answer: "The booking flow explains the delivery method and session details during checkout.",
  },
];

const ES_FAQS: LandingFAQ[] = [
  {
    question: "¿Cuánto cuesta una clase?",
    answer: "El precio se muestra en la página de planes para que puedas comparar opciones y reservar sin fricción.",
  },
  {
    question: "¿Las clases son individuales?",
    answer: "Sí. El proceso está pensado para sesiones privadas uno a uno, adaptadas a tu objetivo.",
  },
  {
    question: "¿Necesito conocimientos previos?",
    answer:
      "No. El contenido está pensado para profesionales en distintos niveles, desde un nivel intermedio hasta hablantes avanzados que quieren pulir su desempeño en entrevistas.",
  },
  {
    question: "¿Usan Google Meet?",
    answer: "El flujo de reserva explica el medio de la clase y los detalles de la sesión durante el checkout.",
  },
];

const DEFAULT_COPY: Record<LandingLang, LandingPageCopy> = {
  en: {
    pageTypeLabel: "SEO landing page",
    summaryLabel: "Resumen en español",
    exploreHubLabel: "Explore the hub",
    bookSessionLabel: "Book a practice session",
    nextStepEyebrow: "Next step",
    nextStepTitle: "Turn this into speaking practice",
    nextStepBody:
      "Reading the structure helps. Practicing it out loud with feedback is what makes the language stick.",
    relatedTitle: "Related guides",
    faqTitle: "FAQ",
    readGuideLabel: "Read guide",
    readTimeLabel: "min read",
    whyThisWorksLabel: "Why this works",
    usefulPhrasesLabel: "Useful phrases",
    sampleAnswerLabel: "Sample answer",
    sampleQuestionsLabel: "Sample questions",
    sampleSentenceLabel: "Sample sentence",
    shareLabel: "Share this page",
    shareCtaLabel: "Send this page to a friend or teammate.",
  },
  "es-MX": {
    pageTypeLabel: "Página SEO",
    summaryLabel: "Quick summary in English",
    exploreHubLabel: "Explorar la guía",
    bookSessionLabel: "Reservar una clase",
    nextStepEyebrow: "Siguiente paso",
    nextStepTitle: "Convierte esto en práctica oral",
    nextStepBody:
      "Leer la estructura ayuda. Practicarla en voz alta con retroalimentación es lo que realmente la fija.",
    relatedTitle: "Guías relacionadas",
    faqTitle: "Preguntas frecuentes",
    readGuideLabel: "Leer guía",
    readTimeLabel: "min de lectura",
    whyThisWorksLabel: "Por qué funciona",
    usefulPhrasesLabel: "Frases útiles",
    sampleAnswerLabel: "Respuesta de ejemplo",
    sampleQuestionsLabel: "Preguntas de ejemplo",
    sampleSentenceLabel: "Oración de ejemplo",
    shareLabel: "Compartir esta página",
    shareCtaLabel: "Envía esta página a un amigo o colega.",
  },
};

const formatDate = (date: string, lang: LandingLang) =>
  new Intl.DateTimeFormat(lang === "es-MX" ? "es-MX" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  const pattern = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));

    if (match[1]) {
      nodes.push(
        <strong key={`${match.index}-b`} className="font-semibold text-white">
          {match[1]}
        </strong>
      );
    } else {
      nodes.push(
        <a
          key={`${match.index}-a`}
          href={match[3]}
          className="font-medium text-blue-300 underline decoration-blue-400/30 underline-offset-4 transition hover:text-blue-200"
        >
          {match[2]}
        </a>
      );
    }

    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes.length ? nodes : [text];
}

function parseSections(content: string[]): { summary: string; intro: string[]; sections: Section[]; outro: string[] } {
  let summary = "";
  const intro: string[] = [];
  const sections: Section[] = [];
  let current: Section | null = null;
  let seenHeading = false;
  const outroIndex = content.findLastIndex((line) => line.startsWith("---"));
  const contentSlice = outroIndex >= 0 ? content.slice(0, outroIndex) : content;
  const outro = outroIndex >= 0 ? content.slice(outroIndex + 1).filter(Boolean) : [];

  for (const line of contentSlice) {
    if (line.startsWith("📘") || line.startsWith("\u{1F4D8}")) {
      summary = line;
      continue;
    }

    if (line.startsWith("## ")) {
      seenHeading = true;
      const raw = line.replace("## ", "");
      const match = raw.match(/^(\d+)\.\s+(.+)/);
      current = {
        id: match ? `q-${match[1]}` : raw.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        number: match ? match[1] : "",
        title: match ? match[2] : raw,
        lines: [],
      };
      sections.push(current);
      continue;
    }

    if (!seenHeading) {
      if (line !== "") intro.push(line);
      continue;
    }

    if (current) current.lines.push(line);
  }

  return { summary, intro, sections, outro };
}

function renderLine(line: string, key: string, copy: LandingPageCopy) {
  const whyPrefix = `**${copy.whyThisWorksLabel}:**`;
  const usefulPrefix = `**${copy.usefulPhrasesLabel}:**`;
  const sampleAnswerPrefix = `**${copy.sampleAnswerLabel}:**`;
  const sampleQuestionsPrefix = `**${copy.sampleQuestionsLabel}:**`;
  const sampleSentencePrefix = `**${copy.sampleSentenceLabel}:**`;

  if (line.startsWith(whyPrefix)) {
    return (
      <div key={key} className="rounded-2xl border border-emerald-400/15 bg-emerald-500/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
          {copy.whyThisWorksLabel}
        </p>
        <p className="mt-2 text-sm leading-7 text-white/72">{renderInline(line.slice(whyPrefix.length).trim())}</p>
      </div>
    );
  }

  if (line.startsWith(sampleAnswerPrefix) || line.startsWith(sampleQuestionsPrefix) || line.startsWith(sampleSentencePrefix)) {
    return (
      <blockquote key={key} className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="text-sm leading-7 text-white/76">
          <span className="mr-1 text-2xl leading-none text-white/20">“</span>
          {renderInline(line.replace(/^\*\*[^:]+:\*\*\s*"?/, "").replace(/"$/, ""))}
          <span className="ml-1 text-2xl leading-none text-white/20">”</span>
        </p>
      </blockquote>
    );
  }

  if (line.startsWith(usefulPrefix)) {
    return (
      <div key={key} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
          {copy.usefulPhrasesLabel}
        </p>
        <p className="mt-2 text-sm leading-7 text-white/72">{renderInline(line.slice(usefulPrefix.length).trim())}</p>
      </div>
    );
  }

  if (line.startsWith("- ")) {
    return (
      <p key={key} className="border-l border-white/10 pl-4 text-sm leading-7 text-white/72">
        {renderInline(line.replace("- ", ""))}
      </p>
    );
  }

  if (line.trim() === "") return null;

  return (
    <p key={key} className="text-sm leading-7 text-white/76">
      {renderInline(line)}
    </p>
  );
}

export function LandingPage({
  post,
  hubHref,
  hubLabel,
  lang,
  alternateHref,
  alternateLabel,
  copy: copyOverrides,
  faqs: faqsOverride,
  relatedSlugs = [],
  breadcrumbs,
  pageUrl,
}: LandingPageProps) {
  const copy = { ...DEFAULT_COPY[lang], ...(copyOverrides ?? {}) };
  const faqs = faqsOverride ?? (lang === "es-MX" ? ES_FAQS : EN_FAQS);
  const readTime = getReadingTime(post.content);
  const { summary, intro, sections, outro } = parseSections(post.content);
  const related = relatedSlugs
    .map((slug) => blogPosts.find((item) => item.slug === slug))
    .filter(Boolean) as BlogPost[];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: lang,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: post.title,
    url: pageUrl,
    description: post.description,
    inLanguage: lang,
    isPartOf: {
      "@type": "WebSite",
      name: "Tu Tutor de Inglés",
      url: pageUrl.split("/").slice(0, 3).join("/"),
    },
  };

  return (
    <main lang={lang} className="relative isolate overflow-hidden bg-[#070b14] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_rgba(7,11,20,0.16)_52%,_rgba(7,11,20,0)_100%)]" />
      <div className="pointer-events-none absolute left-[-8rem] top-28 -z-10 h-[20rem] w-[20rem] rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-7rem] top-[32rem] -z-10 h-[18rem] w-[18rem] rounded-full bg-emerald-400/8 blur-3xl" />

      <div className="mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Breadcrumbs items={breadcrumbs} />
          <div className="flex items-center gap-3">
            {alternateHref && alternateLabel ? (
              <Link
                href={alternateHref}
                hrefLang={lang === "es-MX" ? "en-US" : "es-MX"}
                className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/65 shadow-sm backdrop-blur transition hover:border-white/20 hover:text-white"
              >
                {alternateLabel}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : null}
            <Link
              href={hubHref}
              className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/65 shadow-sm backdrop-blur transition hover:border-white/20 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {hubLabel}
            </Link>
          </div>
        </div>

        <article className="mt-8 rounded-[2.25rem] border border-white/10 bg-white/[0.04] px-6 py-8 shadow-[0_24px_80px_-45px_rgba(0,0,0,0.78)] backdrop-blur sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 font-medium text-white/80">
              {copy.pageTypeLabel}
            </span>
            <span className="text-white/18">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />
              {readTime} {copy.readTimeLabel}
            </span>
            <span className="text-white/18">•</span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(post.date, lang)}
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl font-heading text-4xl font-medium tracking-tight text-white sm:text-5xl lg:text-6xl">
            {post.title}
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/68 sm:text-xl">{post.description}</p>

          {summary && (
            <div className="mt-10 rounded-3xl border border-blue-400/15 bg-blue-500/10 px-5 py-5 text-sm leading-7 text-white/78">
              <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-300">
                <Sparkles className="h-3.5 w-3.5" />
                {copy.summaryLabel}
              </div>
              <p>{renderInline(summary)}</p>
              {alternateHref && alternateLabel ? (
                <p className="mt-3 text-xs font-medium text-white/55">
                  {lang === "es-MX" ? "Read the English version: " : "Leer la versión en español: "}
                  <Link
                    href={alternateHref}
                    hrefLang={lang === "es-MX" ? "en-US" : "es-MX"}
                    className="underline decoration-white/25 underline-offset-4 transition hover:text-white"
                  >
                    {alternateLabel}
                  </Link>
                </p>
              ) : null}
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={hubHref}>
              <Button className="rounded-full bg-white px-6 py-5 text-sm font-semibold text-slate-950 transition hover:bg-blue-100">
                {copy.exploreHubLabel}
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="outline"
                className="rounded-full border-white/15 bg-white/[0.04] px-6 py-5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                {copy.bookSessionLabel}
              </Button>
            </Link>
          </div>

          <div className="mt-8">
            <ShareBar
              title={post.title}
              description={post.description}
              url={pageUrl}
              label={copy.shareLabel}
              ctaLabel={copy.shareCtaLabel}
            />
          </div>

          <div className="mt-12 space-y-8">
            {intro.map((line, index) => (
              <p key={`${post.slug}-intro-${index}`} className="text-[1.03rem] leading-8 text-white/76">
                {renderInline(line)}
              </p>
            ))}
          </div>

          <div className="mt-14 space-y-6">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-28 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 sm:p-7">
                <div className="flex items-start gap-4">
                  <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm font-semibold text-white/55">
                    {section.number || "§"}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-heading text-2xl font-medium tracking-tight text-white sm:text-[2rem]">
                      {section.title}
                    </h2>
                  </div>
                </div>
                <div className="mt-5 space-y-4">
                  {section.lines.map((line, index) => renderLine(line, `${section.id}-${index}`, copy))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-14 rounded-[2rem] border border-blue-400/15 bg-blue-500/10 p-6 sm:p-8">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-300">
                {copy.nextStepEyebrow}
              </p>
              <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight text-white sm:text-[2rem]">
                {copy.nextStepTitle}
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/68 sm:text-base">{copy.nextStepBody}</p>
              <div className="mt-6">
                <Link href="/signup">
                  <Button className="rounded-full bg-white px-6 py-5 text-sm font-semibold text-slate-950 transition hover:bg-blue-100">
                    {copy.bookSessionLabel}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {outro.length > 0 && (
            <div className="mt-14 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-7">
              <div className="space-y-4 text-[0.98rem] leading-8 text-white/72">
                {outro.map((line, index) => (
                  <p key={`${post.slug}-outro-${index}`}>{renderInline(line)}</p>
                ))}
              </div>
            </div>
          )}
        </article>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <div className="space-y-8">
            <section className="grid gap-4 sm:grid-cols-2">
              {related.map((item) => (
                <Link key={item.slug} href={item.kind === "blog" ? `/blog/${item.slug}` : `/${item.slug}`} className="group">
                  <div className="h-full rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/20 hover:bg-white/[0.06]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">{item.category}</p>
                    <p className="mt-3 font-heading text-xl font-medium tracking-tight text-white group-hover:text-blue-300">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/64">{item.description}</p>
                    <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white/55">
                      {copy.readGuideLabel}
                      <ArrowRight className="h-4 w-4" />
                    </p>
                  </div>
                </Link>
              ))}
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">{copy.faqTitle}</h2>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <div className="mt-6 grid gap-4">
                {faqs.map((faq) => (
                  <div key={faq.question} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                    <h3 className="font-heading text-lg font-medium tracking-tight text-white">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-7 text-white/68">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="rounded-[2rem] border border-blue-400/15 bg-blue-500/10 p-6 sm:p-8 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.75)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-300">
                {copy.nextStepEyebrow}
              </p>
              <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight text-white sm:text-[2rem]">
                {copy.nextStepTitle}
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/68 sm:text-base">{copy.nextStepBody}</p>
              <div className="mt-6">
                <Link href="/signup">
                  <Button className="rounded-full bg-white px-6 py-5 text-sm font-semibold text-slate-950 transition hover:bg-blue-100">
                    {copy.bookSessionLabel}
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

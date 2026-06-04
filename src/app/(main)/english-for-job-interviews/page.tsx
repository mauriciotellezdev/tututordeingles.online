import type { Metadata } from "next/types";
import { Button } from "@/shared/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/shared/seo/breadcrumbs";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://tututordeingles.online";
const SPANISH_HUB = "/ingles-para-entrevistas-de-trabajo";

export const metadata: Metadata = {
  title: "English for Job Interviews | Tu Tutor de Inglés",
  description:
    "Prepare for job interviews in English with a native US tutor. Practice common interview questions, improve fluency, and build confidence for your next opportunity.",
  metadataBase: new URL(BASE),
  alternates: {
    canonical: `${BASE}/english-for-job-interviews`,
    languages: {
      "en-US": `${BASE}/english-for-job-interviews`,
      "es-MX": `${BASE}${SPANISH_HUB}`,
      "x-default": `${BASE}${SPANISH_HUB}`,
    },
  },
  openGraph: {
    title: "English for Job Interviews | Tu Tutor de Inglés",
    description:
      "Prepare for job interviews in English with a native US tutor. Practice common interview questions, build confidence, and land your next role.",
    url: `${BASE}/english-for-job-interviews`,
    siteName: "Tu Tutor de Inglés",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-default.svg",
        width: 1200,
        height: 630,
        alt: "English for Job Interviews | Tu Tutor de Inglés",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "English for Job Interviews | Tu Tutor de Inglés",
    description:
      "Prepare for job interviews in English with a native US tutor. Practice common interview questions, build confidence, and land your next role.",
    images: ["/og-default.svg"],
  },
};

const supportingArticles = [
  {
    title: "How to Answer 'Tell Me About Yourself' in English",
    slug: "how-to-answer-tell-me-about-yourself",
    desc: "Structure your opening answer to make a strong first impression in any English interview.",
  },
  {
    title: "25 Common Interview Questions in English",
    slug: "25-common-interview-questions-in-english",
    desc: "The most frequently asked questions by US hiring managers, with sample answers.",
  },
  {
    title: "STAR Method Interview Answers in English",
    slug: "star-method-interview-answers",
    desc: "Master the Situation-Task-Action-Result format that US recruiters expect.",
  },
  {
    title: "Interview Vocabulary for Professionals",
    slug: "interview-vocabulary-for-professionals",
    desc: "Key English phrases and vocabulary to use naturally in job interviews.",
  },
  {
    title: "How to Describe Work Experience in English",
    slug: "how-to-describe-work-experience",
    desc: "Talk about your professional background clearly and confidently in English.",
  },
];

export default function EnglishForJobInterviewsPage() {
  return (
    <main lang="en" className="relative isolate overflow-hidden bg-[#070b14] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_rgba(7,11,20,0.16)_52%,_rgba(7,11,20,0)_100%)]" />
      <div className="pointer-events-none absolute left-[-8rem] top-28 -z-10 h-[20rem] w-[20rem] rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-7rem] top-[32rem] -z-10 h-[18rem] w-[18rem] rounded-full bg-emerald-400/8 blur-3xl" />

      <div className="mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "English for Job Interviews", href: "/english-for-job-interviews" },
            ]}
          />
          <Link
            href={SPANISH_HUB}
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/65 shadow-sm backdrop-blur transition hover:border-white/20 hover:text-white"
          >
            Español
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <article className="rounded-[2.25rem] border border-white/10 bg-white/[0.04] px-6 py-8 shadow-[0_24px_80px_-45px_rgba(0,0,0,0.78)] backdrop-blur sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="inline-flex items-center rounded-full border border-blue-400/15 bg-blue-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-300">
            Interview Preparation
          </div>

          <h1 className="mt-6 font-heading text-4xl font-medium tracking-tight text-white sm:text-5xl lg:text-6xl">
            English for Job Interviews
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/68 sm:text-xl">
            Land your next role with confidence. Practice real interview
            questions with a native English speaker who understands US hiring
            culture.
          </p>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm leading-8 text-white/74">
              <strong className="font-semibold text-white">
                Quick summary in English:
              </strong>{" "}
              Job interviews in English are different from interviews in Spanish. US hiring managers expect behavioral answers, confident communication, and cultural fit - not just technical skills. If English isn't your first language, the interview is often the hardest part of the job search.
            </p>
          </div>

          <section className="mt-14">
            <div className="grid gap-4">
              {[
                "Job interviews in English are different from interviews in Spanish. US hiring managers expect behavioral answers, confident communication, and cultural fit - not just technical skills. If English isn't your first language, the interview is often the hardest part of the job search.",
                "I help Mexican professionals and LATAM developers prepare for English-language interviews. I practice real questions with you, refine your answers, and build the fluency you need to walk into any interview feeling prepared.",
                "Most of my students already have strong technical skills. They don't need help with their resume or qualifications. What they need is the ability to communicate those qualifications naturally in English, under the pressure of a live interview. That's what I work on.",
                "Whether you're applying to a US tech company, preparing for a FAANG interview, or seeking remote work with an international team, the ability to express yourself clearly in English is often the deciding factor between moving forward and getting rejected.",
              ].map((paragraph) => (
                <p key={paragraph} className="text-[1.02rem] leading-8 text-white/76">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <h2 className="font-heading text-2xl font-medium tracking-tight text-white sm:text-3xl">
              What I Cover
            </h2>
            <div className="mt-6 grid gap-4">
              {[
                {
                  title: "Common Interview Questions",
                  desc: "Practice the 25 most common US interview questions with natural, unscripted responses.",
                },
                {
                  title: "Behavioral Questions (STAR Method)",
                  desc: "Learn how to structure answers using Situation, Task, Action, Result - the format US recruiters expect.",
                },
                {
                  title: "Technical English",
                  desc: "Explain your technical experience, projects, and problem-solving approach clearly in English.",
                },
                {
                  title: "Cultural Communication",
                  desc: "Understand US workplace communication norms - from small talk to negotiation.",
                },
                {
                  title: "Confidence & Fluency",
                  desc: "Reduce hesitation, improve pronunciation, and sound natural under pressure.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <h3 className="font-heading text-lg font-medium tracking-tight text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-white/64">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <h2 className="font-heading text-2xl font-medium tracking-tight text-white sm:text-3xl">
              Why English Interviews Are Different
            </h2>
            <p className="mt-4 max-w-3xl text-[1.02rem] leading-8 text-white/76">
              If you've only interviewed in Spanish, the US interview process can
              feel unfamiliar. Here are the key differences:
            </p>
            <div className="mt-6 grid gap-4">
              {[
                {
                  title: "Behavioral questions dominate",
                  desc: "US interviews focus heavily on past behavior as a predictor of future performance. 'Tell me about a time...' questions are standard.",
                },
                {
                  title: "Cultural fit matters",
                  desc: "Hiring managers evaluate not just your skills but how you communicate, collaborate, and handle feedback.",
                },
                {
                  title: "Self-promotion is expected",
                  desc: "In many cultures, humility is valued. In US interviews, you're expected to confidently describe your achievements.",
                },
                {
                  title: "Small talk is part of the evaluation",
                  desc: "The first few minutes of casual conversation are being observed. Can you build rapport naturally in English?",
                },
                {
                  title: "Language fluency affects perception",
                  desc: "Even if your English is functional, hesitations and grammar mistakes can make you seem less competent than you are.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5"
                >
                  <h3 className="font-heading text-lg font-medium tracking-tight text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-white/64">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <h2 className="font-heading text-2xl font-medium tracking-tight text-white sm:text-3xl">
              Who Is This For?
            </h2>
            <ul className="mt-6 space-y-3">
              {[
                "Software developers applying to US tech companies",
                "Engineers preparing for FAANG or startup interviews",
                "Professionals seeking remote work with international teams",
                "Recent graduates entering the English-speaking job market",
                "Anyone who froze during an English interview and wants to do better next time",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-7 text-white/74">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-16">
            <div className="flex items-center gap-3">
              <h2 className="font-heading text-2xl font-medium tracking-tight text-white sm:text-3xl">
                Interview English Guide
              </h2>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <p className="mt-4 text-sm leading-7 text-white/64">
              Explore my complete library of interview preparation guides:
            </p>
            <div className="mt-6 grid gap-4">
              {supportingArticles.map((article) => (
                <Link key={article.slug} href={`/${article.slug}`} className="group">
                  <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-blue-400/20 hover:bg-blue-500/5">
                    <h3 className="font-heading text-lg font-medium tracking-tight text-white group-hover:text-blue-300">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-white/64">
                      {article.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-16 rounded-[2rem] border border-blue-400/15 bg-blue-500/10 p-8 text-center">
            <h2 className="font-heading text-2xl font-medium tracking-tight text-white sm:text-3xl">
              Ready to Prepare?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/68">
              Book a one-on-one session to practice real interview questions with
              a native English speaker. No scripts. No memorization. Just real
              practice.
            </p>
            <Link href="/signup" className="mt-6 inline-flex">
              <Button className="rounded-full bg-white px-8 py-6 text-sm font-semibold text-slate-950 transition hover:bg-blue-100">
                Book Your Session
              </Button>
            </Link>
          </section>

          <section className="mt-8">
            <p className="text-sm leading-7 text-white/50">
              Can't commit yet? Start with my{" "}
              <Link
                href="/blog/25-common-interview-questions-in-english"
                className="font-medium text-blue-300 underline decoration-blue-400/30 underline-offset-4 transition hover:text-blue-200"
              >
                free guide to 25 common interview questions in English
              </Link>
              .
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}

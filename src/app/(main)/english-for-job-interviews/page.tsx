import type { Metadata } from "next/types";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import Link from "next/link";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://tututordeingles.online";

export const metadata: Metadata = {
  title: "English for Job Interviews | Tu Tutor de Inglés",
  description:
    "Prepare for job interviews in English with a native US tutor. Practice common interview questions, improve fluency, and build confidence for your next opportunity.",
  metadataBase: new URL(BASE),
  alternates: {
    canonical: `${BASE}/english-for-job-interviews`,
  },
  openGraph: {
    title: "English for Job Interviews | Tu Tutor de Inglés",
    description:
      "Prepare for job interviews in English with a native US tutor. Practice common interview questions, build confidence, and land your next role.",
    url: `${BASE}/english-for-job-interviews`,
    siteName: "Tu Tutor de Inglés",
    locale: "en_US",
    type: "website",
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
    <main className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4 md:px-8">
      <div className="absolute left-[-10%] top-[10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none fixed" />
      <div className="absolute right-[-10%] bottom-[10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none fixed" />

      <article className="max-w-3xl mx-auto relative z-10">
        <Badge className="mb-6 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-4 py-1.5 text-[11px] tracking-widest uppercase font-normal">
          Interview Preparation
        </Badge>

        <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
          English for Job Interviews
        </h1>

        <p className="text-white/40 text-sm mb-10">
          Land your next role with confidence. Practice real interview questions
          with a native English speaker who understands US hiring culture.
        </p>

        <section className="mb-16">
          <p className="text-white/60 text-base leading-relaxed mb-6">
            Job interviews in English are different from interviews in Spanish.
            US hiring managers expect behavioral answers, confident
            communication, and cultural fit — not just technical skills. If
            English isn't your first language, the interview is often the
            hardest part of the job search.
          </p>
          <p className="text-white/60 text-base leading-relaxed mb-6">
            I help Mexican professionals and LATAM developers prepare for
            English-language interviews. We practice real questions, refine your
            answers, and build the fluency you need to walk into any interview
            feeling prepared.
          </p>
          <p className="text-white/60 text-base leading-relaxed mb-6">
            Most of my students already have strong technical skills. They don't
            need help with their resume or qualifications. What they need is the
            ability to communicate those qualifications naturally in English,
            under the pressure of a live interview. That's what we work on.
          </p>
          <p className="text-white/60 text-base leading-relaxed">
            Whether you're applying to a US tech company, preparing for a FAANG
            interview, or seeking remote work with an international team, the
            ability to express yourself clearly in English is often the deciding
            factor between moving forward and getting rejected.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">
            What We Cover
          </h2>
          <div className="grid gap-4">
            {[
              {
                title: "Common Interview Questions",
                desc: "Practice the 25 most common US interview questions with natural, unscripted responses.",
              },
              {
                title: "Behavioral Questions (STAR Method)",
                desc: "Learn how to structure answers using Situation, Task, Action, Result — the format US recruiters expect.",
              },
              {
                title: "Technical English",
                desc: "Explain your technical experience, projects, and problem-solving approach clearly in English.",
              },
              {
                title: "Cultural Communication",
                desc: "Understand US workplace communication norms — from small talk to negotiation.",
              },
              {
                title: "Confidence & Fluency",
                desc: "Reduce hesitation, improve pronunciation, and sound natural under pressure.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-[#0f1729]/40 border border-white/[0.08] rounded-xl p-5 backdrop-blur-sm"
              >
                <h3 className="text-white font-semibold text-sm mb-1.5">
                  {item.title}
                </h3>
                <p className="text-white/40 text-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">
            Why English Interviews Are Different
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-4">
            If you've only interviewed in Spanish, the US interview process can
            feel unfamiliar. Here are the key differences:
          </p>
          <div className="grid gap-4 mb-6">
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
                title: "Small talk is part of the evalution",
                desc: "The first few minutes of casual conversation are being observed. Can you build rapport naturally in English?",
              },
              {
                title: "Language fluency affects perception",
                desc: "Even if your English is functional, hesitations and grammar mistakes can make you seem less competent than you are.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-[#0f1729]/40 border border-white/[0.08] rounded-xl p-5 backdrop-blur-sm"
              >
                <h3 className="text-white font-semibold text-sm mb-1.5">
                  {item.title}
                </h3>
                <p className="text-white/40 text-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">
            Who Is This For?
          </h2>
          <ul className="space-y-3">
            {[
              "Software developers applying to US tech companies",
              "Engineers preparing for FAANG or startup interviews",
              "Professionals seeking remote work with international teams",
              "Recent graduates entering the English-speaking job market",
              "Anyone who froze during an English interview and wants to do better next time",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-white/50 text-sm">
                <span className="text-blue-400 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">
            Interview English Guide
          </h2>
          <p className="text-white/50 text-sm mb-6">
            Explore our complete library of interview preparation guides:
          </p>
          <div className="grid gap-4">
            {supportingArticles.map((article) => (
              <Link key={article.slug} href={`/blog/${article.slug}`}>
                <div className="bg-[#0f1729]/40 border border-white/[0.08] rounded-xl p-5 backdrop-blur-sm hover:bg-[#0f1729]/60 transition-colors">
                  <h3 className="text-blue-400 font-semibold text-sm mb-1">
                    {article.title}
                  </h3>
                  <p className="text-white/40 text-xs leading-relaxed">
                    {article.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-16 bg-blue-500/5 border border-blue-500/10 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Prepare?
          </h2>
          <p className="text-white/50 text-sm mb-6 max-w-md mx-auto leading-relaxed">
            Book a one-on-one session to practice real interview questions with
            a native English speaker. No scripts. No memorization. Just real
            practice.
          </p>
          <Link href="/signup">
            <Button className="bg-blue-500 hover:bg-blue-400 text-white rounded-full px-8 py-6 text-sm font-semibold shadow-lg shadow-blue-500/20">
              Book Your Session
            </Button>
          </Link>
        </section>

        <section>
          <p className="text-white/30 text-xs leading-relaxed">
            Can't commit yet? Start with our{" "}
            <Link
              href="/blog/25-common-interview-questions-in-english"
              className="text-blue-400 hover:underline"
            >
              free guide to 25 common interview questions in English
            </Link>
            .
          </p>
        </section>
      </article>
    </main>
  );
}

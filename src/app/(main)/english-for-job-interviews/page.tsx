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

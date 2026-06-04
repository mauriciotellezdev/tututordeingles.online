import type { Metadata } from "next/types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Breadcrumbs } from "@/shared/seo/breadcrumbs";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://tututordeingles.online";

export const metadata: Metadata = {
  title: "Inglés para Entrevistas de Trabajo | Tu Tutor de Inglés",
  description:
    "Preparate para entrevistas de trabajo en ingles con un tutor nativo de Estados Unidos. Practica preguntas reales, mejora tu fluidez y llega con mas confianza.",
  metadataBase: new URL(BASE),
  alternates: {
    canonical: `${BASE}/ingles-para-entrevistas-de-trabajo`,
    languages: {
      "es-MX": `${BASE}/ingles-para-entrevistas-de-trabajo`,
      "en-US": `${BASE}/english-for-job-interviews`,
      "x-default": `${BASE}/ingles-para-entrevistas-de-trabajo`,
    },
  },
  openGraph: {
    title: "Inglés para Entrevistas de Trabajo | Tu Tutor de Inglés",
    description:
      "Preparate para entrevistas de trabajo en ingles con un tutor nativo de Estados Unidos. Practica preguntas reales, mejora tu fluidez y llega con mas confianza.",
    url: `${BASE}/ingles-para-entrevistas-de-trabajo`,
    siteName: "Tu Tutor de Inglés",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: "/og-default.svg",
        width: 1200,
        height: 630,
        alt: "Inglés para Entrevistas de Trabajo | Tu Tutor de Inglés",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inglés para Entrevistas de Trabajo | Tu Tutor de Inglés",
    description:
      "Preparate para entrevistas de trabajo en ingles con un tutor nativo de Estados Unidos. Practica preguntas reales, mejora tu fluidez y llega con mas confianza.",
    images: ["/og-default.svg"],
  },
};

const supportingArticles = [
  {
    title: "Como Responder 'Tell Me About Yourself' en Ingles",
    slug: "como-responder-tell-me-about-yourself-en-ingles",
    desc: "Estructura tu respuesta de apertura para causar una primera impresion fuerte en cualquier entrevista.",
  },
  {
    title: "Preguntas Comunes de Entrevista en Ingles",
    slug: "25-common-interview-questions-in-english",
    desc: "Las preguntas mas frecuentes que hacen los hiring managers en Estados Unidos, con ejemplos de respuesta.",
  },
  {
    title: "Metodo STAR para Entrevistas en Ingles",
    slug: "metodo-star-para-entrevistas-en-ingles",
    desc: "Domina la estructura Situacion, Tarea, Accion y Resultado que esperan los reclutadores en Estados Unidos.",
  },
  {
    title: "Vocabulario para Entrevistas Profesionales",
    slug: "vocabulario-para-entrevistas-profesionales",
    desc: "Frases clave para sonar natural y profesional en tu siguiente entrevista.",
  },
  {
    title: "Como Describir Experiencia Laboral en Ingles",
    slug: "como-describir-experiencia-laboral-en-ingles",
    desc: "Habla de tu experiencia profesional de forma clara y convincente en ingles.",
  },
];

export default function SpanishInterviewHubPage() {
  return (
    <main lang="es-MX" className="relative isolate overflow-hidden bg-[#070b14] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_rgba(7,11,20,0.16)_52%,_rgba(7,11,20,0)_100%)]" />
      <div className="pointer-events-none absolute left-[-8rem] top-28 -z-10 h-[20rem] w-[20rem] rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-7rem] top-[32rem] -z-10 h-[18rem] w-[18rem] rounded-full bg-emerald-400/8 blur-3xl" />

      <div className="mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Inglés para Entrevistas de Trabajo", href: "/ingles-para-entrevistas-de-trabajo" }]} />
          <Link
            href="/english-for-job-interviews"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/65 shadow-sm backdrop-blur transition hover:border-white/20 hover:text-white"
          >
            English
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <article className="mt-12 rounded-[2.25rem] border border-white/10 bg-white/[0.04] px-6 py-8 shadow-[0_24px_80px_-45px_rgba(0,0,0,0.78)] backdrop-blur sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="inline-flex items-center rounded-full border border-blue-400/15 bg-blue-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-300">
            Preparacion para entrevistas
          </div>

          <h1 className="mt-6 font-heading text-4xl font-medium tracking-tight text-white sm:text-5xl lg:text-6xl">
            Inglés para Entrevistas de Trabajo
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/68 sm:text-xl">
            Consigue tu siguiente oportunidad con mas confianza. Practica preguntas reales de entrevista con un tutor nativo de ingles que entiende la cultura de contratacion en Estados Unidos.
          </p>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm leading-8 text-white/74">
              <strong className="font-semibold text-white">Quick summary in English:</strong>{" "}
              Job interviews in English are different from interviews in Spanish. US hiring managers expect behavioral answers, confident communication, and cultural fit, not just technical skills. If English is not your first language, the interview is often the hardest part of the job search.
            </p>
            <p className="mt-3 text-xs font-medium text-white/55">
              Leer la version en ingles:{" "}
              <Link
                href="/english-for-job-interviews"
                className="underline decoration-white/25 underline-offset-4 transition hover:text-white"
              >
                English for Job Interviews
              </Link>
            </p>
          </div>

          <section className="mt-14">
            <div className="grid gap-4">
              {[
                "Las entrevistas en ingles son distintas a las entrevistas en espanol. Los hiring managers en Estados Unidos esperan respuestas de comportamiento, comunicacion segura y claridad cultural, no solo habilidades tecnicas. Si el ingles no es tu idioma principal, la entrevista suele ser la parte mas dificil del proceso.",
                "Trabajo con profesionistas mexicanos y con talento de LATAM que se estan preparando para entrevistas en ingles. Practico preguntas reales contigo, ajusto tus respuestas y construimos la fluidez que necesitas para entrar con seguridad.",
                "La mayoria de mis estudiantes ya tiene buenas habilidades tecnicas. No necesitan ayuda con el CV ni con sus credenciales. Lo que necesitan es poder comunicar esas credenciales de forma natural en ingles, bajo la presion de una entrevista en vivo. Eso es lo que trabajo contigo.",
                "Si aplicas a una empresa de tecnologia en Estados Unidos, te preparas para una entrevista tipo FAANG o buscas trabajo remoto con un equipo internacional, tu habilidad para expresarte con claridad en ingles muchas veces define si avanzas o si te rechazan.",
              ].map((paragraph) => (
                <p key={paragraph} className="text-[1.02rem] leading-8 text-white/76">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <h2 className="font-heading text-2xl font-medium tracking-tight text-white sm:text-3xl">Lo que cubro</h2>
            <div className="mt-6 grid gap-4">
              {[
                {
                  title: "Preguntas comunes de entrevista",
                  desc: "Practica las 25 preguntas mas comunes de entrevista en Estados Unidos con respuestas naturales y sin sonar memorizado.",
                },
                {
                  title: "Preguntas de comportamiento (STAR)",
                  desc: "Aprende a estructurar tus respuestas con Situacion, Tarea, Accion y Resultado, exactamente como lo esperan los reclutadores.",
                },
                {
                  title: "Ingles tecnico",
                  desc: "Explica tu experiencia tecnica, tus proyectos y tu forma de resolver problemas con claridad.",
                },
                {
                  title: "Comunicacion cultural",
                  desc: "Entiende las normas de comunicacion del trabajo en Estados Unidos, desde small talk hasta negociacion.",
                },
                {
                  title: "Confianza y fluidez",
                  desc: "Reduce las pausas, mejora tu pronunciacion y suena mas natural bajo presion.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/20 hover:bg-white/[0.06]">
                  <h3 className="font-heading text-lg font-medium tracking-tight text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/64">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <h2 className="font-heading text-2xl font-medium tracking-tight text-white sm:text-3xl">Por que las entrevistas en ingles se sienten distintas</h2>
            <p className="mt-4 max-w-3xl text-[1.02rem] leading-8 text-white/76">
              Si solo has entrevistado en espanol, el proceso en Estados Unidos puede sentirse mas duro. Estas son las diferencias que mas veo:
            </p>
            <div className="mt-6 grid gap-4">
              {[
                {
                  title: "Predominan las preguntas de comportamiento",
                  desc: "Las entrevistas en Estados Unidos usan mucho preguntas tipo 'Tell me about a time...' para predecir como vas a rendir en el futuro.",
                },
                {
                  title: "La comunicacion importa tanto como la habilidad tecnica",
                  desc: "Los hiring managers evalúan tu forma de explicar ideas, colaborar y manejar feedback.",
                },
                {
                  title: "Se espera que hables de tus logros con claridad",
                  desc: "En algunas culturas se valora mas la modestia. En Estados Unidos tienes que saber describir tu impacto con confianza.",
                },
                {
                  title: "El small talk tambien cuenta",
                  desc: "Los primeros minutos de conversacion informal ya estan siendo evaluados. ¿Puedes crear rapport de forma natural?",
                },
                {
                  title: "La fluidez cambia la percepcion",
                  desc: "Aunque tu ingles sea funcional, las pausas y los errores pueden hacerte ver menos competente de lo que realmente eres.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
                  <h3 className="font-heading text-lg font-medium tracking-tight text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/64">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <h2 className="font-heading text-2xl font-medium tracking-tight text-white sm:text-3xl">¿Para quien es?</h2>
            <ul className="mt-6 space-y-3">
              {[
                "Desarrolladores de software que aplican a empresas de tecnologia en Estados Unidos",
                "Ingenieros que se preparan para entrevistas FAANG o startups",
                "Profesionales que buscan trabajo remoto con equipos internacionales",
                "Recien graduados que estan entrando al mercado laboral en ingles",
                "Cualquiera que se quedo en blanco en una entrevista en ingles y quiere hacerlo mejor la proxima vez",
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
              <h2 className="font-heading text-2xl font-medium tracking-tight text-white sm:text-3xl">Guia de entrevistas en ingles</h2>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <p className="mt-4 text-sm leading-7 text-white/64">Explora mi biblioteca completa de guias para prepararte para entrevistas:</p>
            <div className="mt-6 grid gap-4">
              {supportingArticles.map((article) => (
                <Link key={article.slug} href={`/${article.slug}`} className="group">
                  <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-blue-400/20 hover:bg-blue-500/5">
                    <h3 className="font-heading text-lg font-medium tracking-tight text-white group-hover:text-blue-300">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-white/64">{article.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-16 rounded-[2rem] border border-blue-400/15 bg-blue-500/10 p-8 text-center">
            <h2 className="font-heading text-2xl font-medium tracking-tight text-white sm:text-3xl">¿Listo para prepararte?</h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/68">
              Reserva una sesion uno a uno para practicar preguntas reales de entrevista con un tutor nativo de ingles. Sin guiones. Sin memorizacion. Solo practica real.
            </p>
            <Link href="/signup" className="mt-6 inline-flex">
              <Button className="rounded-full bg-white px-8 py-6 text-sm font-semibold text-slate-950 transition hover:bg-blue-100">
                Reservar tu clase
              </Button>
            </Link>
          </section>

          <section className="mt-8">
            <p className="text-sm leading-7 text-white/50">
              ¿Todavia no te comprometes? Empieza con mi{" "}
              <Link
                href="/blog/25-common-interview-questions-in-english"
                className="font-medium text-blue-300 underline decoration-blue-400/30 underline-offset-4 transition hover:text-blue-200"
              >
                guia gratis de 25 preguntas comunes de entrevista en ingles
              </Link>
              .
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
